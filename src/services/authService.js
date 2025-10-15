/**
 * Authentication Service
 * Handles secure authentication, session management
 * SECURITY: All crypto operations handled by backend with bcrypt/JWT
 * Frontend only sends plain credentials over HTTPS and stores tokens
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AuthService {
  constructor() {
    this.tokenKey = 'cosmic_auth_token';
    this.refreshTokenKey = 'cosmic_refresh_token';
    this.csrfTokenKey = 'cosmic_csrf_token';
    this.apiUrl = API_URL;
  }

  /**
   * Login user (supports email OR username)
   */
  async login(emailOrUsername, password) {
    try {
      // Determine if it's an email or username
      const isEmail = emailOrUsername.includes('@');
      
      const requestBody = isEmail 
        ? { email: emailOrUsername, password }
        : { username: emailOrUsername, password };
      
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for refresh token
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.success && data.data) {
        // Store access token
        this.setToken(data.data.accessToken);
        
        // Refresh token is stored in httpOnly cookie by backend
        
        // Store user data
        localStorage.setItem('cosmic_user', JSON.stringify(data.data.user));
        localStorage.setItem('isLoggedIn', 'true');

        // Track login event
        this.trackEvent('user_login', { 
          userId: data.data.user._id, 
          email: data.data.user.email 
        });

        return {
          success: true,
          user: data.data.user,
          token: data.data.accessToken
        };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // Check if error is related to email verification
      const isEmailVerificationError = error.message && 
        (error.message.includes('verify your email') || error.message.includes('email verification'));
      
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.',
        emailVerificationRequired: isEmailVerificationError
      };
    }
  }

  /**
   * Register new user
   */
  async register(email, password, name, username = null, userData = {}) {
    console.log('authService.register called with:', { email, name, username, hasUserData: !!userData });
    
    try {
      // Validate input
      if (!this.validateEmail(email)) {
        console.error('Email validation failed');
        throw new Error('Invalid email format');
      }

      if (!this.validatePassword(password)) {
        console.error('Password validation failed');
        throw new Error('Password must be at least 12 characters with uppercase, lowercase, number, and special character');
      }

      console.log('Sending registration request to:', `${this.apiUrl}/auth/register`);
      
      const response = await fetch(`${this.apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          password, 
          name,
          username: username || undefined, // Only include if provided
          ...userData // Include astrological data if provided
        })
      });

      console.log('Registration response status:', response.status);
      const data = await response.json();
      console.log('Registration response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.success && data.data) {
        // Backend returns basic user data (no token on registration)
        // User needs to verify email then login
        
        // Track registration event
        this.trackEvent('user_registered', { 
          userId: data.data.userId, 
          email: data.data.email 
        });

        return {
          success: true,
          message: data.message || 'Registration successful',
          user: {
            _id: data.data.userId,
            email: data.data.email,
            name: data.data.name,
            username: data.data.username,
            emailVerified: data.data.emailVerified
          }
        };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        // Call backend logout endpoint
        await fetch(`${this.apiUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
      }

      const user = this.getCurrentUser();
      if (user) {
        this.trackEvent('user_logout', { userId: user.userId || user._id });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      this.removeToken();
      this.removeRefreshToken();
      this.removeCSRFToken();
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('cosmic_user');
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    const storedUser = localStorage.getItem('cosmic_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }

    // Fallback to token verification for backward compatibility
    const token = this.getToken();
    if (!token) return null;

    const payload = this.verifyToken(token);
    return payload;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getToken();
    return !!token && localStorage.getItem('isLoggedIn') === 'true';
  }

  /**
   * Fetch current user from backend
   */
  async fetchCurrentUser() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${this.apiUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry with new token
            return this.fetchCurrentUser();
          }
        }
        throw new Error(data.error || 'Failed to fetch user');
      }

      if (data.success && data.data) {
        // Update stored user data
        localStorage.setItem('cosmic_user', JSON.stringify(data.data));
        return {
          success: true,
          user: data.data
        };
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Send httpOnly refresh token cookie
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token refresh failed');
      }

      if (data.success && data.data) {
        // Store new access token
        this.setToken(data.data.accessToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      this.logout();
      return false;
    }
  }



  /**
   * Token management
   */
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
    sessionStorage.setItem(this.tokenKey, token);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }

  removeToken() {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
  }

  setRefreshToken(token) {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  removeRefreshToken() {
    localStorage.removeItem(this.refreshTokenKey);
  }

  setCSRFToken(token) {
    sessionStorage.setItem(this.csrfTokenKey, token);
  }

  getCSRFToken() {
    return sessionStorage.getItem(this.csrfTokenKey);
  }

  removeCSRFToken() {
    sessionStorage.removeItem(this.csrfTokenKey);
  }

  /**
   * Validation helpers
   */
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePassword(password) {
    // At least 12 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    // Matches backend password policy (NIST/OWASP guidelines)
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{12,}$/;
    return re.test(password);
  }

  /**
   * Generate unique user ID
   */
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Track authentication events
   */
  trackEvent(eventName, data) {
    const event = {
      eventName,
      timestamp: Date.now(),
      ...data
    };

    // Store in analytics
    const events = JSON.parse(localStorage.getItem('cosmic_auth_events') || '[]');
    events.push(event);
    
    // Keep only last 1000 events
    if (events.length > 1000) {
      events.shift();
    }
    
    localStorage.setItem('cosmic_auth_events', JSON.stringify(events));
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Not authenticated');

      // Validate new password
      if (!this.validatePassword(newPassword)) {
        throw new Error('New password must be at least 12 characters with uppercase, lowercase, number, and special character');
      }

      // Send plain passwords to backend over HTTPS - backend handles bcrypt
      const response = await fetch(`${this.apiUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password change failed');
      }

      const user = this.getCurrentUser();
      if (user) {
        this.trackEvent('password_changed', { userId: user._id });
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Password change failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Rate limiting check
   */
  checkRateLimit(action, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const key = `rate_limit_${action}`;
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    const now = Date.now();

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      return {
        allowed: false,
        retryAfter: Math.ceil((recentAttempts[0] + windowMs - now) / 1000)
      };
    }

    // Add current attempt
    recentAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(recentAttempts));

    return { allowed: true };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    console.log('authService.verifyEmail called with token');
    
    try {
      const response = await fetch(`${this.apiUrl}/auth/verify-email/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Verify email response status:', response.status);
      const data = await response.json();
      console.log('Verify email response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Email verification failed');
      }

      return {
        success: true,
        message: data.message || 'Email verified successfully'
      };
    } catch (error) {
      console.error('Email verification failed:', error);
      return {
        success: false,
        error: error.message || 'Email verification failed. Please try again.'
      };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(email) {
    console.log('authService.resendVerification called for:', email);
    
    try {
      const response = await fetch(`${this.apiUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      console.log('Resend verification response status:', response.status);
      const data = await response.json();
      console.log('Resend verification response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      return {
        success: true,
        message: data.message || 'Verification email sent successfully'
      };
    } catch (error) {
      console.error('Resend verification failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to resend verification email. Please try again.'
      };
    }
  }
}

export default new AuthService();
