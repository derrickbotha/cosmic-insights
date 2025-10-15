import React, { useState } from 'react';
import authService from '../services/authService';

/**
 * LandingPage Component
 * Landing page with login and register forms
 */
const LandingPage = ({ onLogin, onRegister, darkMode }) => {
  const [showLogin, setShowLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    console.log('Form submitted!', { showLogin, formData: { ...formData, password: '***', confirmPassword: '***' } });
    
    try {
      if (showLogin) {
        console.log('Attempting login...');
        const result = await onLogin(formData.email, formData.password);
        console.log('Login result:', result);
        if (!result.success) {
          setError(result.error || 'Login failed. Please check your credentials.');
          
          // Check if email verification is required
          if (result.emailVerificationRequired) {
            setShowResendLink(true);
            setPendingVerificationEmail(formData.email);
          }
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          console.log('Password mismatch');
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        
        // Enhanced password validation (matches backend requirements)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{12,}$/;
        if (!passwordRegex.test(formData.password)) {
          console.log('Password validation failed');
          setError('Password must be at least 12 characters with uppercase, lowercase, number, and special character (!@#$%^&*(),.?":{}|<>)');
          setLoading(false);
          return;
        }
        
        console.log('Calling onRegister...');
        const result = await onRegister(formData.email, formData.password, formData.name, formData.username || null);
        console.log('Registration result:', result);
        if (result.success) {
          setSuccess(result.message || 'Registration successful! Please check your email to verify your account.');
          // Clear form on success
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            name: '',
            username: ''
          });
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear resend link when user starts typing
    if (field === 'email' || field === 'password') {
      setShowResendLink(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await authService.resendVerification(pendingVerificationEmail);

    setLoading(false);

    if (result.success) {
      setSuccess(result.message || 'Verification email sent! Please check your inbox.');
      setShowResendLink(false);
    } else {
      setError(result.error || 'Failed to resend verification email.');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-screen">
            {/* Left Side - Hero Content */}
            <div className="flex-1 text-center lg:text-left space-y-6 lg:pr-12">
              {/* Logo */}
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                <svg className="h-12 w-12 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
                </svg>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Cosmic Insights</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Your Journey to Self-Discovery</p>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Unlock Your <span className="text-primary">Cosmic Potential</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl leading-relaxed">
                Discover deep insights about your life journey through personalized astrological analysis, 
                AI-powered guidance, and transformative self-reflection tools.
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
                <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700">
                  <div className="w-14 h-14 bg-air rounded-lg flex items-center justify-center flex-shrink-0 shadow-soft">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Personal Insights</h3>
                    <p className="text-base text-gray-600 dark:text-gray-400">Deep astrological analysis tailored to you</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700">
                  <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 shadow-soft">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">AI Guidance</h3>
                    <p className="text-base text-gray-600 dark:text-gray-400">Chat with your personal AI astrologer</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700">
                  <div className="w-14 h-14 bg-earth rounded-lg flex items-center justify-center flex-shrink-0 shadow-soft">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Daily Journal</h3>
                    <p className="text-base text-gray-600 dark:text-gray-400">Track your growth with guided reflections</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700">
                  <div className="w-14 h-14 bg-cosmic-gold rounded-lg flex items-center justify-center flex-shrink-0 shadow-soft">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Goal Tracking</h3>
                    <p className="text-base text-gray-600 dark:text-gray-400">Align your goals with cosmic timing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Forms */}
            <div className="w-full lg:w-auto lg:flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl border-2 border-gray-200 dark:border-gray-700 p-10 w-full lg:w-[500px]">
                {/* Tab Buttons */}
                <div className="flex gap-3 mb-8 p-2 bg-soft-indigo dark:bg-gray-700 rounded-xl">
                  <button
                    onClick={() => setShowLogin(true)}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      showLogin
                        ? 'bg-primary text-white shadow-soft-lg transform scale-105'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowLogin(false)}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      !showLogin
                        ? 'bg-primary text-white shadow-soft-lg transform scale-105'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-5 mb-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-base text-red-600 dark:text-red-400 font-medium">{error}</p>
                        {showResendLink && (
                          <button
                            onClick={handleResendVerification}
                            disabled={loading}
                            className="mt-2 text-sm text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 font-medium underline disabled:opacity-50"
                          >
                            Resend verification email
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-5 mb-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl">
                    <div className="flex items-start gap-4">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-base text-green-600 dark:text-green-400 font-semibold mb-3">{success}</p>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-4 leading-relaxed">
                          📧 We've sent a verification link to your email. Please check your inbox (and spam folder) to verify your account.
                        </p>
                        <button
                          onClick={() => setShowLogin(true)}
                          className="text-sm text-green-700 dark:text-green-300 font-semibold hover:text-green-800 dark:hover:text-green-200 underline transition-colors"
                        >
                          Already verified? Click here to login →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {!showLogin && (
                    <>
                      <div>
                        <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required={!showLogin}
                          placeholder="Your name"
                          disabled={loading}
                          className="w-full px-5 py-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Username <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          placeholder="Choose a unique username"
                          pattern="[a-z0-9_]{3,30}"
                          title="Lowercase letters, numbers, and underscores only (3-30 characters)"
                          disabled={loading}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Leave blank to auto-generate from email
                        </p>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {showLogin ? 'Email or Username' : 'Email'}
                    </label>
                    <input
                      type={showLogin ? 'text' : 'email'}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      placeholder={showLogin ? 'your@email.com or username' : 'your@email.com'}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {!showLogin && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Minimum 8 characters with uppercase, lowercase, and number
                      </p>
                    )}
                  </div>

                  {!showLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        required={!showLogin}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  )}

                  {showLogin && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                        <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                      </label>
                      <a href="#" className="text-primary hover:underline">Forgot password?</a>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 px-8 bg-primary text-white rounded-lg font-bold hover:shadow-soft-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
                  >
                    {loading && (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {loading ? (showLogin ? 'Signing In...' : 'Creating Account...') : (showLogin ? 'Sign In' : 'Create Account')}
                  </button>
                </form>

                {/* Social Login */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-soft-indigo dark:hover:bg-gray-700 hover:border-primary transition-all w-full max-w-xs"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Continue with Google</span>
                  </button>
                </div>

                {/* Terms */}
                {!showLogin && (
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-6">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-primary hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 py-8">
            <p className="text-center text-base text-gray-600 dark:text-gray-400">
              © 2025 Cosmic Insights. All rights reserved. Powered by Claude Sonnet 4.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
