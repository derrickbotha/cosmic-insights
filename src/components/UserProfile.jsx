import React from 'react';
import { User, LogOut } from 'lucide-react';

/**
 * UserProfile Component
 * Displays user avatar and username with logout button
 */
const UserProfile = ({ user, onLogout }) => {
  // Safety check - if no user, don't render
  if (!user) {
    return null;
  }

  // Generate initials from name for default avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Generate color based on name (consistent color for same name)
  const getAvatarColor = (name) => {
    if (!name) return '#667eea';
    const colors = [
      '#667eea', // Purple
      '#f093fb', // Pink
      '#4facfe', // Blue
      '#43e97b', // Green
      '#fa709a', // Rose
      '#feca57', // Yellow
      '#48dbfb', // Cyan
      '#ff6b6b', // Red
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const initials = getInitials(user.name);
  const avatarColor = getAvatarColor(user.name);

  return (
    <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
            onError={(e) => {
              // If image fails to load, show initials instead
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback to initials if no image or image fails */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg border-2 border-purple-500"
          style={{
            backgroundColor: avatarColor,
            display: user.profileImage ? 'none' : 'flex'
          }}
        >
          {initials}
        </div>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {user.name || 'User'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          @{user.username || (user.email ? user.email.split('@')[0] : 'user')}
        </p>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="flex-shrink-0 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        title="Logout"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
};

export default UserProfile;
