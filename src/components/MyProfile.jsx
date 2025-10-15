import React, { useState } from 'react';

/**
 * MyProfile Component
 * Displays user's astrological profile information with security features
 */
const MyProfile = ({ userData, onEditProfile }) => {
  // Extract birth data from userData
  const birthDate = userData?.birthDate || 'None';
  const birthTime = userData?.birthTime || 'None';
  const birthPlace = userData?.birthPlace || 'None';
  const sunSign = userData?.astrology?.sunSign || 'None';
  const moonSign = userData?.astrology?.moonSign || 'None';
  const risingSign = userData?.astrology?.risingSign || 'None';
  const name = userData?.name || 'Seeker';

  // Security modal states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(userData?.profilePicture || null);
  const [showEditPictureModal, setShowEditPictureModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Handle change password
  const handleChangePassword = (e) => {
    e.preventDefault();
    const currentPassword = e.target.currentPassword.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    // Validation
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    // In production, this would call an API
    console.log('Password changed successfully');
    alert('Password changed successfully!');
    setShowChangePasswordModal(false);
    setPasswordError('');
  };

  // Handle deactivate account
  const handleDeactivateAccount = () => {
    // In production, this would call an API
    console.log('Account deactivated');
    alert('Your account has been deactivated. You can reactivate it by logging in again.');
    setShowDeactivateModal(false);
    // Redirect to login or home
  };

  // Handle delete account
  const handleDeleteAccount = (e) => {
    e.preventDefault();
    const confirmText = e.target.confirmText.value;
    
    if (confirmText !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }

    // In production, this would call an API
    console.log('Account deleted permanently');
    alert('Your account and all data have been permanently deleted.');
    setShowDeleteModal(false);
    // Clear all data and redirect
    localStorage.clear();
    window.location.href = '/';
  };

  // Handle profile picture upload
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setUploadError('');
    };
    reader.readAsDataURL(file);
  };

  // Handle save profile picture
  const handleSaveProfilePicture = async () => {
    if (!imagePreview) {
      setUploadError('Please select an image first');
      return;
    }

    try {
      // In production, this would upload to backend/cloud storage
      // For now, store in localStorage as base64
      setProfilePicture(imagePreview);
      
      // Update userData
      const updatedUserData = {
        ...userData,
        profilePicture: imagePreview
      };
      
      // Save to localStorage
      localStorage.setItem('userQuestionnaire', JSON.stringify(updatedUserData));
      
      // Also update cosmic_user if logged in
      const storedUser = localStorage.getItem('cosmic_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.profilePicture = imagePreview;
        localStorage.setItem('cosmic_user', JSON.stringify(user));
      }

      // TODO: Upload to backend API
      // const token = localStorage.getItem('cosmic_auth_token');
      // const response = await fetch(`${API_URL}/auth/profile`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ profilePicture: imagePreview })
      // });

      alert('Profile picture updated successfully!');
      setShowEditPictureModal(false);
      setImagePreview(null);
      
      // Refresh the page to show new picture
      window.location.reload();
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setUploadError('Failed to upload profile picture. Please try again.');
    }
  };

  // Handle remove profile picture
  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    setImagePreview(null);
    
    // Update userData
    const updatedUserData = {
      ...userData,
      profilePicture: null
    };
    
    // Save to localStorage
    localStorage.setItem('userQuestionnaire', JSON.stringify(updatedUserData));
    
    // Also update cosmic_user if logged in
    const storedUser = localStorage.getItem('cosmic_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      delete user.profilePicture;
      localStorage.setItem('cosmic_user', JSON.stringify(user));
    }

    alert('Profile picture removed successfully!');
    setShowEditPictureModal(false);
    
    // Refresh the page
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="bg-primary rounded-xl shadow-soft-xl border-2 border-primary/20 p-10 text-white">
        <div className="flex items-center gap-6 mb-6">
          {/* Profile Picture Circle */}
          <div className="relative group">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl overflow-hidden ring-4 ring-white/40 shadow-soft-lg">
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt={name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{sunSign !== 'None' ? sunSign.charAt(0) : '✨'}</span>
              )}
            </div>
            {/* Edit Button Overlay */}
            <button
              onClick={() => setShowEditPictureModal(true)}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Change profile picture"
            >
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div>
            <h1 className="text-4xl font-bold">My Profile</h1>
            <p className="text-white/90 text-lg mt-2">Welcome back, {name}</p>
          </div>
        </div>
      </div>

      {/* Astrological Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft-lg border border-gray-200 dark:border-gray-700 p-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-4">
            <span className="text-4xl">✨</span>
            <span>Astrological Profile</span>
          </h2>
          {onEditProfile && (
            <button
              onClick={onEditProfile}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:shadow-soft-lg transform hover:scale-105 transition-all text-base font-semibold"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Birth Date */}
          <div className="p-6 bg-soft-purple dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-4 mb-3">
              <svg className="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="text-base font-semibold text-gray-700 dark:text-gray-300">Birth Date</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{birthDate}</p>
          </div>

          {/* Birth Time */}
          <div className="p-6 bg-soft-indigo dark:bg-indigo-900/20 rounded-lg border-2 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-4 mb-3">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-base font-semibold text-gray-700 dark:text-gray-300">Birth Time</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{birthTime}</p>
          </div>

          {/* Birth Place */}
          <div className="p-6 bg-soft-blue dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800 md:col-span-2">
            <div className="flex items-center gap-4 mb-3">
              <svg className="w-6 h-6 text-air" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-base font-semibold text-gray-700 dark:text-gray-300">Birth Place</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{birthPlace}</p>
          </div>
        </div>
      </div>

      {/* Cosmic Trinity Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft-lg border border-gray-200 dark:border-gray-700 p-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-4">
          <span className="text-4xl">🌙</span>
          <span>Your Cosmic Trinity</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sun Sign */}
          <div className="text-center p-8 bg-soft-gold dark:bg-yellow-900/20 rounded-xl border-2 border-cosmic-gold/30 shadow-soft">
            <div className="w-20 h-20 mx-auto mb-5 bg-cosmic-gold rounded-full flex items-center justify-center text-4xl shadow-soft">
              ☀️
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Sun Sign</h3>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-4">Your core essence</p>
            <p className="text-3xl font-bold text-primary">{sunSign}</p>
          </div>

          {/* Moon Sign */}
          <div className="text-center p-8 bg-soft-blue dark:bg-blue-900/20 rounded-xl border-2 border-water/30 shadow-soft">
            <div className="w-20 h-20 mx-auto mb-5 bg-water rounded-full flex items-center justify-center text-4xl shadow-soft">
              🌙
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Moon Sign</h3>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-4">Your emotional nature</p>
            <p className="text-3xl font-bold text-primary">{moonSign}</p>
          </div>

          {/* Rising Sign */}
          <div className="text-center p-8 bg-soft-purple dark:bg-purple-900/20 rounded-xl border-2 border-secondary/30 shadow-soft">
            <div className="w-20 h-20 mx-auto mb-5 bg-secondary rounded-full flex items-center justify-center text-4xl shadow-soft">
              ⭐
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Rising Sign</h3>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-4">Your outer persona</p>
            <p className="text-3xl font-bold text-primary">{risingSign}</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Understanding Your Signs
        </h3>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p><strong>Sun Sign:</strong> Represents your core identity, ego, and vital force. It's who you are at your essence.</p>
          <p><strong>Moon Sign:</strong> Governs your emotional responses, instincts, and subconscious needs. It's your inner world.</p>
          <p><strong>Rising Sign (Ascendant):</strong> Your social mask and first impression. How others perceive you initially.</p>
        </div>
      </div>

      {/* Quick Stats */}
      {userData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-primary">{userData.journalEntries?.length || 0}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Journal Entries</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-primary">{userData.goals?.length || 0}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Active Goals</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">💎</div>
            <div className="text-2xl font-bold text-primary">{userData.crystals?.length || 0}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Crystals</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">🔮</div>
            <div className="text-2xl font-bold text-primary">{userData.readings?.length || 0}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Readings</div>
          </div>
        </div>
      )}

      {/* Security & Privacy */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Security & Privacy</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Manage your account security and privacy settings</p>
        
        <div className="space-y-4">
          {/* Change Password */}
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">Change Password</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Update your account password</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Deactivate Account */}
          <button
            onClick={() => setShowDeactivateModal(true)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">Deactivate Account</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Temporarily disable your account</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">Delete Account</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Permanently remove your account</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Change Password</h3>
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordError('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPasswordError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors font-medium"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Deactivate Account</h3>
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Account Deactivation</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Your account will be temporarily disabled. Your data will be preserved and you can reactivate by logging in again.
                    </p>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Your profile will be hidden from other users</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>All your data will be preserved</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>You can reactivate anytime by logging in</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateAccount}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors font-medium"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">Delete Account</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">⚠️ Permanent Action</h4>
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                      This action cannot be undone. All your data will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Your profile and all personal data will be deleted</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>All journal entries, goals, and readings will be lost</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>This action is permanent and cannot be reversed</span>
                </li>
              </ul>

              <form onSubmit={handleDeleteAccount}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  name="confirmText"
                  required
                  className="w-full px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white mb-6"
                  placeholder="Type DELETE"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-colors font-medium"
                  >
                    Delete Forever
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Picture Modal */}
      {showEditPictureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Picture</h3>
              <button
                onClick={() => {
                  setShowEditPictureModal(false);
                  setImagePreview(null);
                  setUploadError('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              {/* Image Preview */}
              <div className="flex justify-center mb-6">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-6xl font-bold overflow-hidden ring-4 ring-gray-200 dark:ring-gray-700">
                  {imagePreview || profilePicture ? (
                    <img 
                      src={imagePreview || profilePicture} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{name[0].toUpperCase()}</span>
                  )}
                </div>
              </div>

              {/* Upload Button */}
              <div className="mb-4">
                <label className="block w-full cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                      Choose Image
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  JPG, PNG, or GIF (max 5MB)
                </p>
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {profilePicture && (
                  <button
                    type="button"
                    onClick={handleRemoveProfilePicture}
                    className="flex-1 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowEditPictureModal(false);
                    setImagePreview(null);
                    setUploadError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfilePicture}
                  disabled={!imagePreview}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
