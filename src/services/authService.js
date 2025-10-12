/**
 * Authentication Service
 * Handles secure authentication, JWT tokens, session management
 * Updated to work with backend API
 */

import CryptoJS from 'crypto-js';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || 'cosmic-insights-secret-key-2025';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

class AuthService {
  constructor() {
    this.tokenKey = 'cosmic_auth_token';
    this.refreshTokenKey = 'cosmic_refresh_token';
    this.csrfTokenKey = 'cosmic_csrf_token';
    this.apiUrl = API_URL;
  }

  /**
   * Hash password using SHA-256 (in production, use bcrypt on backend)
   */
  hashPassword(password) {
    return CryptoJS.SHA256(password + SECRET_KEY).toString();
  }

  /**
   * Generate JWT-like token (simplified for frontend demo)
   * In production, this should be done on backend
   */
  generateToken(userId, email, role = 'user') {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      userId,
      email,
      role,
      iat: Date.now(),
      exp: Date.now() + TOKEN_EXPIRY
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = CryptoJS.HmacSHA256(
      `${encodedHeader}.${encodedPayload}`,
      SECRET_KEY
    ).toString();

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verify and decode token
   */
  verifyToken(token) {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split('.');
      
      // Verify signature
      const expectedSignature = CryptoJS.HmacSHA256(
        `${encodedHeader}.${encodedPayload}`,
        SECRET_KEY
      ).toString();

      if (signature !== expectedSignature) {
        throw new Error('Invalid token signature');
      }

      // Decode payload
      const payload = JSON.parse(atob(encodedPayload));

      // Check expiration
      if (payload.exp < Date.now()) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken() {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for refresh token
        body: JSON.stringify({ email, password })
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
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Register new user
   */
  async register(email, password, name, username = null, userData = {}) {
    try {
      // Validate input
      if (!this.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      if (!this.validatePassword(password)) {
        throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
      }

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.success && data.data) {
        // Store access token
        this.setToken(data.data.accessToken);
        
        // Store user data
        localStorage.setItem('cosmic_user', JSON.stringify(data.data.user));
        localStorage.setItem('isLoggedIn', 'true');

        // Track registration event
        this.trackEvent('user_registered', { 
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
   * Refresh access token
   */
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    const payload = this.verifyToken(refreshToken);
    if (!payload) {
      this.logout();
      return false;
    }

    // Generate new access token
    const newToken = this.generateToken(payload.userId, payload.email, payload.role);
    this.setToken(newToken);

    return true;
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
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
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
      const user = this.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const storedUsers = JSON.parse(localStorage.getItem('cosmic_users') || '[]');
      const userIndex = storedUsers.findIndex(u => u.id === user.userId);

      if (userIndex === -1) throw new Error('User not found');

      // Verify current password
      const hashedCurrentPassword = this.hashPassword(currentPassword);
      if (storedUsers[userIndex].password !== hashedCurrentPassword) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      if (!this.validatePassword(newPassword)) {
        throw new Error('New password must be at least 8 characters with uppercase, lowercase, and number');
      }

      // Update password
      storedUsers[userIndex].password = this.hashPassword(newPassword);
      localStorage.setItem('cosmic_users', JSON.stringify(storedUsers));

      this.trackEvent('password_changed', { userId: user.userId });

      return { success: true };
    } catch (error) {
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
}

export default new AuthService();
