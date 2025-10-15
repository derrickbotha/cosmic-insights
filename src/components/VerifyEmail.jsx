import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

/**
 * Email Verification Component
 * Handles email verification with automatic login and redirect to dashboard
 */
function VerifyEmail({ onLoginSuccess }) {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmailAndLogin = async () => {
      try {
        // Get token from URL
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('Invalid verification link. No token found.');
          return;
        }

        console.log('Starting email verification with token:', token.substring(0, 10) + '...');

        // Call backend to verify email (backend returns auto-login tokens)
        const response = await fetch(`${authService.apiUrl}/auth/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Important: receive cookies (refreshToken)
        });

        const data = await response.json();
        console.log('Verification response:', data);

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Verification failed');
        }

        // Check if backend provided auto-login tokens
        if (data.autoLogin && data.data && data.data.accessToken) {
          console.log('Auto-login successful, setting up session...');
          
          // Store access token
          authService.setToken(data.data.accessToken);
          
          // Store CSRF token if provided
          if (data.data.csrfToken) {
            authService.setCSRFToken(data.data.csrfToken);
          }
          
          // Store user data
          localStorage.setItem('cosmic_user', JSON.stringify(data.data.user));
          localStorage.setItem('isLoggedIn', 'true');

          // Update status
          setStatus('success');
          setMessage('✅ Email verified! Logging you in...');

          // Notify parent component
          if (onLoginSuccess) {
            onLoginSuccess(data.data.user);
          }

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          // Fallback: verification succeeded but no auto-login
          setStatus('success');
          setMessage('✅ Email verified! Redirecting to login...');
          
          setTimeout(() => {
            navigate('/?login=true');
          }, 2000);
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Verification failed. Please try again or contact support.');
      }
    };

    verifyEmailAndLogin();
  }, [location.search, navigate, onLoginSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center">
        {status === 'verifying' && (
          <div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Email</h2>
            <p className="text-gray-300">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-gray-300 mb-4">{message}</p>
            <div className="flex justify-center">
              <div className="animate-pulse bg-green-500/20 rounded-full p-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                Go to Home
              </button>
              <button
                onClick={() => navigate('/?login=true')}
                className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                Try Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
