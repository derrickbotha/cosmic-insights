import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * EmailVerification Component
 * Handles email verification from link and resending verification emails
 */
const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, resend
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('resend');
      setMessage('Enter your email to resend verification link');
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    console.log('Verifying email with token...');
    setStatus('verifying');
    setMessage('Verifying your email...');

    const result = await authService.verifyEmail(token);

    if (result.success) {
      setStatus('success');
      setMessage(result.message || 'Email verified successfully! You can now log in.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/', { state: { message: 'Email verified! Please log in.' } });
      }, 3000);
    } else {
      setStatus('error');
      setMessage(result.error || 'Verification failed. The link may be expired or invalid.');
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setMessage('');

    const result = await authService.resendVerification(email);

    setLoading(false);

    if (result.success) {
      setStatus('success');
      setMessage(result.message || 'Verification email sent! Please check your inbox.');
      setEmail('');
    } else {
      setStatus('error');
      setMessage(result.error || 'Failed to send verification email.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <svg className="h-12 w-12 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
          </svg>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Cosmic Insights</h2>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Email Verification
        </h1>

        {/* Status Messages */}
        <div className="mt-6">
          {/* Verifying */}
          {status === 'verifying' && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">{message}</p>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">{message}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">Redirecting to login...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">{message}</p>
                  <button
                    onClick={() => setStatus('resend')}
                    className="mt-3 text-sm text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 font-medium underline"
                  >
                    Request new verification email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resend Form */}
          {status === 'resend' && (
            <div>
              <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                {message || "Didn't receive the verification email? Enter your email to receive a new one."}
              </p>

              <form onSubmit={handleResendVerification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-primary hover:underline"
                >
                  ← Back to login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
