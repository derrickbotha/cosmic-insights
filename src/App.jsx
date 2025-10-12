import React, { useState, useEffect } from 'react';
import AIChatInterface from './components/AIChatInterface';
import Dashboard from './components/Dashboard';
import PatternRecognition from './components/PatternRecognition';
import Journal from './components/Journal';
import GoalTracker from './components/GoalTracker';
import Questionnaire from './components/Questionnaire';
import CrystalRecommendations from './components/CrystalRecommendations';
import MyProfile from './components/MyProfile';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import LandingPage from './components/LandingPage';
import CookieConsent from './components/CookieConsent';
import AdminDashboard from './components/AdminDashboard';
import PaymentModal from './components/PaymentModal';
import MonitoringDashboard from './components/MonitoringDashboard';
import MLAdminDashboard from './components/MLAdminDashboard';
import UserProfile from './components/UserProfile';

// Services
import authService from './services/authService';
import analyticsService from './services/analyticsService';
// import monitoringService from './services/monitoringService'; // Available for monitoring
// import paymentService from './services/paymentService'; // Available for future use

/**
 * Main App component
 */
function App() {
  const [userData, setUserData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('questionnaire'); // questionnaire, dashboard, patterns, journal, goals, crystals, chat, admin
  const [userTier, setUserTier] = useState('free'); // 'free', 'premium', 'pro'
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
  const [chatMessagesToday, setChatMessagesToday] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentTier, setSelectedPaymentTier] = useState('premium');
  const [cookieConsent, setCookieConsent] = useState(null);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  
  // Load user data and preferences
  useEffect(() => {
    // Check authentication with authService
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      setIsLoggedIn(true);
      
      // Get user tier from stored user data
      const users = JSON.parse(localStorage.getItem('cosmic_users') || '[]');
      const fullUser = users.find(u => u.id === user.userId);
      if (fullUser && fullUser.tier) {
        setUserTier(fullUser.tier);
      }
    }

    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Check system preference for dark mode if no saved preference
      setDarkMode(true);
    }
    
    // Load saved questionnaire data if exists
    const savedQuestionnaire = localStorage.getItem('userQuestionnaire');
    if (savedQuestionnaire) {
      const data = JSON.parse(savedQuestionnaire);
      setUserData(data);
      setQuestionnaireCompleted(true);
      setCurrentPage('dashboard');
    }

    // Check cookie consent
    const consent = localStorage.getItem('cosmic_cookie_consent');
    if (consent) {
      const preferences = JSON.parse(consent);
      setCookieConsent(preferences);
      
      // Enable analytics if user consented
      if (preferences.analytics) {
        setAnalyticsEnabled(true);
        analyticsService.initializeSession();
        analyticsService.trackPageView('App Initialized');
        
        // Track performance metrics after load
        setTimeout(() => {
          analyticsService.trackPerformance();
        }, 1000);
      }
    }

    // Load chat usage and check if we need to reset daily limit
    const savedChatCount = localStorage.getItem('chatMessagesToday');
    const savedResetDate = localStorage.getItem('lastChatResetDate');
    const today = new Date().toDateString();
    
    if (savedResetDate !== today) {
      // New day - reset counter
      setChatMessagesToday(0);
      localStorage.setItem('chatMessagesToday', '0');
      localStorage.setItem('lastChatResetDate', today);
    } else if (savedChatCount) {
      setChatMessagesToday(parseInt(savedChatCount));
    }
  }, []);

  // Handle questionnaire completion
  const handleQuestionnaireComplete = async (data) => {
    try {
      // Save locally first
      setUserData(data);
      setQuestionnaireCompleted(true);
      localStorage.setItem('userQuestionnaire', JSON.stringify(data));
      
      // If user is logged in, update their profile on backend
      if (isLoggedIn) {
        const token = authService.getToken();
        if (token) {
          try {
            const response = await fetch(`${authService.apiUrl}/auth/profile`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({
                astrology: data
              })
            });

            const result = await response.json();
            
            if (result.success && result.data) {
              // Update current user with new data
              setCurrentUser(result.data);
              localStorage.setItem('cosmic_user', JSON.stringify(result.data));
            }
          } catch (error) {
            console.error('Failed to save questionnaire to backend:', error);
            // Continue anyway - data is saved locally
          }
        }
      }
      
      setCurrentPage('dashboard');
      
      // Track completion event
      if (analyticsEnabled) {
        analyticsService.trackEvent('questionnaire_completed', {
          sunSign: data.sunSign,
          moonSign: data.moonSign,
          risingSign: data.risingSign
        });
      }
    } catch (error) {
      console.error('Error handling questionnaire completion:', error);
      // Still navigate to dashboard
      setCurrentPage('dashboard');
    }
  };

  // Get chat limit based on tier
  const getChatLimit = () => {
    switch (userTier) {
      case 'pro':
        return 100;
      case 'premium':
        return 25;
      case 'free':
      default:
        return 5;
    }
  };

  // Handle sending a chat message
  const handleChatMessage = () => {
    const newCount = chatMessagesToday + 1;
    setChatMessagesToday(newCount);
    localStorage.setItem('chatMessagesToday', newCount.toString());
  };

  // Check if user can send more messages
  const canSendMessage = () => {
    return chatMessagesToday < getChatLimit();
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Track preference change
    if (analyticsEnabled) {
      analyticsService.trackEvent('theme_changed', { theme: newDarkMode ? 'dark' : 'light' });
    }
  };

  // Handle cookie consent
  const handleCookieAccept = (preferences) => {
    setCookieConsent(preferences);
    
    // Enable analytics if user consented
    if (preferences.analytics) {
      setAnalyticsEnabled(true);
      analyticsService.initializeSession();
      analyticsService.trackPageView('Home');
    }
  };

  const handleCookieDecline = (preferences) => {
    setCookieConsent(preferences);
    setAnalyticsEnabled(false);
  };

  // Handle payment success
  const handlePaymentSuccess = (subscription) => {
    // Update user tier
    setUserTier(subscription.tier);
    
    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem('cosmic_users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser?.userId);
    if (userIndex !== -1) {
      users[userIndex].tier = subscription.tier;
      localStorage.setItem('cosmic_users', JSON.stringify(users));
    }
    
    setShowPaymentModal(false);
    
    // Track conversion
    if (analyticsEnabled) {
      analyticsService.trackConversion('subscription', subscription.amount, {
        tier: subscription.tier,
        provider: subscription.provider
      });
    }
  };

  // Handle upgrade button click
  const handleUpgradeClick = (tier) => {
    setSelectedPaymentTier(tier);
    setShowPaymentModal(true);
    
    // Track upgrade intent
    if (analyticsEnabled) {
      analyticsService.trackEvent('upgrade_clicked', { targetTier: tier });
    }
  };

  // Handle login with authService
  const handleLogin = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      
      if (result.success && result.user) {
        setIsLoggedIn(true);
        setCurrentUser(result.user);
        setShowLoginModal(false);
        
        // Set user tier from backend user object
        if (result.user.tier) {
          setUserTier(result.user.tier);
        }
        
        // Load user's questionnaire data if they have completed it
        if (result.user.astrology) {
          const questionnaireData = {
            ...result.user.astrology,
            name: result.user.name,
            email: result.user.email
          };
          setUserData(questionnaireData);
          setQuestionnaireCompleted(true);
          setCurrentPage('dashboard');
        }
        
        // Track login event
        if (analyticsEnabled) {
          analyticsService.trackEvent('user_login', { 
            method: 'email',
            userId: result.user._id 
          });
        }
        
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  // Handle register with authService
  const handleRegister = async (email, password, name, username = null, astroData = null) => {
    try {
      // Prepare user data with astrological info if available
      const userData = astroData ? { astrology: astroData } : {};
      
      const result = await authService.register(email, password, name, username, userData);
      
      if (result.success && result.user) {
        setIsLoggedIn(true);
        setCurrentUser(result.user);
        setShowLoginModal(false);
        
        // Set user tier
        if (result.user.tier) {
          setUserTier(result.user.tier);
        }
        
        // If registering with astro data, set it up
        if (result.user.astrology) {
          const questionnaireData = {
            ...result.user.astrology,
            name: result.user.name,
            email: result.user.email
          };
          setUserData(questionnaireData);
          setQuestionnaireCompleted(true);
          setCurrentPage('dashboard');
        }
        
        // Track registration event
        if (analyticsEnabled) {
          analyticsService.trackEvent('user_register', { 
            method: 'email',
            userId: result.user._id
          });
        }
        
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  // Handle logout with authService
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setUserTier('free');
      setCurrentPage('questionnaire');
    }
    
    // Track logout event
    if (analyticsEnabled) {
      analyticsService.trackEvent('user_logout');
    }
  };

  // Track page view when page changes
  useEffect(() => {
    if (analyticsEnabled && currentPage) {
      analyticsService.trackPageView(currentPage, { tier: userTier });
    }
  }, [analyticsEnabled, currentPage, userTier]);

  const renderPage = () => {
    switch (currentPage) {
      case 'questionnaire':
        return <Questionnaire onComplete={handleQuestionnaireComplete} initialData={userData} userTier={userTier} />;
      case 'dashboard':
        return <Dashboard userData={userData} isPaidMember={userTier !== 'free'} hasUsedFreeReading={false} />;
      case 'patterns':
        return <PatternRecognition userData={userData} />;
      case 'profile':
        return <MyProfile userData={userData} onEditProfile={() => setCurrentPage('questionnaire')} />;
      case 'journal':
        return <Journal userData={userData} />;
      case 'goals':
        return <GoalTracker userData={userData} />;
      case 'crystals':
        return <CrystalRecommendations userData={userData} onNavigate={setCurrentPage} />;
      case 'chat':
        return (
          <div className="p-8">
            <AIChatInterface 
              userData={userData} 
              userTier={userTier}
              chatMessagesToday={chatMessagesToday}
              chatLimit={getChatLimit()}
              onSendMessage={handleChatMessage}
              canSendMessage={canSendMessage()}
            />
          </div>
        );
      case 'admin':
        // Only show admin dashboard if user is admin
        if (currentUser?.role === 'admin') {
          return <AdminDashboard />;
        } else {
          return <div className="text-center py-12 text-gray-500">Access denied. Admin privileges required.</div>;
        }
      case 'monitoring':
        // Only show monitoring dashboard if user is admin
        if (currentUser?.role === 'admin') {
          return <MonitoringDashboard />;
        } else {
          return <div className="text-center py-12 text-gray-500">Access denied. Admin privileges required.</div>;
        }
      case 'ml-admin':
        // Only show ML admin dashboard if user is ml_engineer or analytics_admin
        if (currentUser?.role === 'ml_engineer' || currentUser?.role === 'analytics_admin') {
          return <MLAdminDashboard currentUser={currentUser} />;
        } else {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Access Denied</h2>
              <p className="text-gray-500 mb-6">You need ML Engineer or Analytics Admin privileges to access this page.</p>
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
      default:
        return <Questionnaire onComplete={handleQuestionnaireComplete} initialData={userData} userTier={userTier} />;
    }
  };

  const navigationItems = [
    {
      id: 'questionnaire',
      name: 'Questionnaire',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      requiresCompletion: false
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      requiresCompletion: false
    },
    {
      id: 'patterns',
      name: 'Patterns',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      requiresCompletion: false
    },
    {
      id: 'journal',
      name: 'Journal',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      requiresCompletion: false
    },
    {
      id: 'goals',
      name: 'Goals',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      requiresCompletion: false
    },
    {
      id: 'crystals',
      name: 'Crystals',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      requiresCompletion: false
    },
    {
      id: 'chat',
      name: 'AI Chat',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      requiresCompletion: false
    }
  ];

  // Add admin navigation items if user is admin
  if (currentUser?.role === 'admin') {
    navigationItems.push({
      id: 'admin',
      name: 'Admin',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      requiresCompletion: false,
      adminOnly: true
    });

    navigationItems.push({
      id: 'monitoring',
      name: 'Monitoring',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      requiresCompletion: false,
      adminOnly: true
    });
  }

  // Add ML Admin navigation item if user is ml_engineer or analytics_admin
  if (currentUser?.role === 'ml_engineer' || currentUser?.role === 'analytics_admin') {
    navigationItems.push({
      id: 'ml-admin',
      name: 'ML Admin',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      requiresCompletion: false,
      adminOnly: true
    });
  }

  // Show landing page if not logged in
  if (!isLoggedIn) {
    return <LandingPage onLogin={handleLogin} onRegister={handleRegister} darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
                </svg>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Cosmic Insights</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Astrology App</p>
                </div>
              </div>
              {/* Mobile Close Button */}
              <button 
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map(item => {
              const isActive = currentPage === item.id;
              const isDisabled = item.requiresCompletion && !questionnaireCompleted;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!isDisabled) {
                      setCurrentPage(item.id);
                      setIsMobileMenuOpen(false); // Close mobile menu on navigation
                    }
                  }}
                  disabled={isDisabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg'
                      : isDisabled
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className={isDisabled ? 'opacity-50' : ''}>{item.icon}</span>
                  <span className="flex-1 text-left">{item.name}</span>
                  {isDisabled && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Settings */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {/* Upgrade Button for Free/Premium Users */}
            {userTier !== 'pro' && (
              <button
                onClick={() => handleUpgradeClick(userTier === 'free' ? 'premium' : 'pro')}
                className="w-full mb-4 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Upgrade to {userTier === 'free' ? 'Premium' : 'Pro'}
              </button>
            )}

            {/* Current Tier Display */}
            <div className="mb-4 p-3 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Current Plan
                </span>
                <span className="text-sm font-bold text-primary capitalize">
                  {userTier}
                </span>
              </div>
            </div>

            {/* Chat Usage Indicator */}
            {currentPage === 'chat' && (
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Daily Chat Usage
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {chatMessagesToday}/{getChatLimit()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((chatMessagesToday / getChatLimit()) * 100, 100)}%` }}
                  />
                </div>
                {chatMessagesToday >= getChatLimit() && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Daily limit reached. Upgrade for more!
                  </p>
                )}
              </div>
            )}

            <button 
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              {darkMode ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                  </svg>
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            {userData && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {userData.astrology?.sunSign?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {userData.astrology?.sunSign || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {userTier} Member
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left Side: Mobile Menu Button */}
              <button
                className="lg:hidden text-gray-700 dark:text-gray-300 p-2"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Center: Page Title */}
              <div className="flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {navigationItems.find(item => item.id === currentPage)?.name || 'Cosmic Insights'}
                </h1>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                  {currentPage === 'questionnaire' && 'Complete your cosmic profile'}
                  {currentPage === 'dashboard' && 'Your life season analysis and insights'}
                  {currentPage === 'patterns' && 'Discover recurring patterns in your life'}
                  {currentPage === 'journal' && 'Daily reflections and AI insights'}
                  {currentPage === 'goals' && 'Track your progress and milestones'}
                  {currentPage === 'crystals' && 'Personalized crystal recommendations'}
                  {currentPage === 'chat' && 'Talk with your AI astrologer'}
                  {currentPage === 'profile' && 'Your astrological profile'}
                </p>
              </div>

              {/* Right Side: User Info & Actions */}
              {isLoggedIn ? (
                <UserProfile 
                  user={{
                    name: currentUser?.name || userData?.name || 'User',
                    username: currentUser?.username || userData?.username || (currentUser?.email || userData?.email || '').split('@')[0],
                    profileImage: currentUser?.profileImage || userData?.profileImage || null
                  }}
                  onLogout={handleLogout}
                />
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-opacity-90 transition-colors text-sm font-medium"
                >
                  Login
                </button>
              )}
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {renderPage()}
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-8 py-4">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              © 2025 Cosmic Insights. All rights reserved. Powered by Claude Sonnet 4.
            </p>
          </footer>
        </div>
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Cookie Consent */}
      {!cookieConsent && (
        <CookieConsent
          darkMode={darkMode}
          onAccept={handleCookieAccept}
          onDecline={handleCookieDecline}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          show={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          tier={selectedPaymentTier}
          currentTier={userTier}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sign in to your cosmic journey</p>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const email = e.target.email.value;
              const password = e.target.password.value;
              handleLogin(email, password);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                  </label>
                  <button type="button" onClick={() => alert('Password reset feature coming soon!')} className="text-primary hover:underline">Forgot password?</button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Sign In
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub</span>
                  </button>
                </div>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                  Don't have an account? <button type="button" onClick={() => alert('Sign up feature coming soon!')} className="text-primary hover:underline font-medium">Sign up</button>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;