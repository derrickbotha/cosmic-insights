import monitoringService from './monitoringService';

/**
 * Auto-Correction Service
 * Automatically detects and corrects common errors
 */

class AutoCorrectionService {
  constructor() {
    this.corrections = [];
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.correctionStrategies = this.initializeCorrectionStrategies();
  }

  /**
   * Define correction strategies for common errors
   */
  initializeCorrectionStrategies() {
    return {
      // Network errors - retry with exponential backoff
      'NETWORK_ERROR': {
        description: 'Network request failed',
        autoCorrect: async (error, context, retryCount = 0) => {
          if (retryCount >= this.maxRetries) {
            this.logCorrectionFailure('NETWORK_ERROR', error, context, 'Max retries exceeded');
            return { success: false, error: 'Max retries exceeded' };
          }

          const delay = this.retryDelay * Math.pow(2, retryCount);
          await this.sleep(delay);

          this.logCorrectionAttempt('NETWORK_ERROR', context, retryCount + 1);

          try {
            // Retry the original request
            if (context.retryFunction) {
              const result = await context.retryFunction();
              this.logCorrectionSuccess('NETWORK_ERROR', context, retryCount + 1);
              return { success: true, result };
            }
          } catch (retryError) {
            return this.correctionStrategies['NETWORK_ERROR'].autoCorrect(
              retryError,
              context,
              retryCount + 1
            );
          }
        },
      },

      // localStorage quota exceeded - clear old data
      'STORAGE_QUOTA_EXCEEDED': {
        description: 'localStorage quota exceeded',
        autoCorrect: async (error, context) => {
          this.logCorrectionAttempt('STORAGE_QUOTA_EXCEEDED', context, 1);

          try {
            // Try to free up space by removing old monitoring logs
            const keysToCheck = ['monitoringLogs', 'oldChatHistory', 'tempData'];
            
            for (const key of keysToCheck) {
              if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                monitoringService.logEvent({
                  level: 'info',
                  category: 'storage',
                  component: 'AutoCorrection',
                  action: 'cleanup',
                  message: `Removed ${key} to free storage`,
                });
              }
            }

            // Try the operation again
            if (context.retryFunction) {
              const result = await context.retryFunction();
              this.logCorrectionSuccess('STORAGE_QUOTA_EXCEEDED', context, 1);
              return { success: true, result };
            }
          } catch (retryError) {
            this.logCorrectionFailure('STORAGE_QUOTA_EXCEEDED', error, context, retryError.message);
            return { success: false, error: retryError.message };
          }
        },
      },

      // Authentication token expired - refresh token
      'TOKEN_EXPIRED': {
        description: 'Authentication token expired',
        autoCorrect: async (error, context) => {
          this.logCorrectionAttempt('TOKEN_EXPIRED', context, 1);

          try {
            // Try to refresh the token
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (refreshToken) {
              const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
              });

              if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                
                // Retry the original request with new token
                if (context.retryFunction) {
                  const result = await context.retryFunction();
                  this.logCorrectionSuccess('TOKEN_EXPIRED', context, 1);
                  return { success: true, result };
                }
              }
            }

            // If refresh fails, redirect to login
            this.logCorrectionFailure('TOKEN_EXPIRED', error, context, 'Token refresh failed');
            window.location.href = '/login';
            return { success: false, error: 'Token refresh failed, redirecting to login' };
          } catch (retryError) {
            this.logCorrectionFailure('TOKEN_EXPIRED', error, context, retryError.message);
            window.location.href = '/login';
            return { success: false, error: retryError.message };
          }
        },
      },

      // Missing data - redirect to questionnaire
      'MISSING_USER_DATA': {
        description: 'User data not found',
        autoCorrect: async (error, context) => {
          this.logCorrectionAttempt('MISSING_USER_DATA', context, 1);

          // Check if user has completed questionnaire
          const questionnaireData = localStorage.getItem('userQuestionnaire');
          
          if (!questionnaireData) {
            // Redirect to questionnaire
            monitoringService.logEvent({
              level: 'warn',
              category: 'navigation',
              component: 'AutoCorrection',
              action: 'redirect',
              message: 'Redirecting to questionnaire - missing data',
            });

            window.location.href = '/questionnaire';
            return { success: false, error: 'Redirecting to questionnaire' };
          }

          this.logCorrectionSuccess('MISSING_USER_DATA', context, 1);
          return { success: true, result: JSON.parse(questionnaireData) };
        },
      },

      // Invalid JSON - return default value
      'INVALID_JSON': {
        description: 'Failed to parse JSON',
        autoCorrect: async (error, context) => {
          this.logCorrectionAttempt('INVALID_JSON', context, 1);

          const defaultValue = context.defaultValue || null;
          
          monitoringService.logEvent({
            level: 'warn',
            category: 'error',
            component: 'AutoCorrection',
            action: 'fallback',
            message: `Using default value for invalid JSON: ${context.key}`,
          });

          this.logCorrectionSuccess('INVALID_JSON', context, 1);
          return { success: true, result: defaultValue };
        },
      },

      // Component mount failure - reload component
      'COMPONENT_MOUNT_FAILED': {
        description: 'Component failed to mount',
        autoCorrect: async (error, context) => {
          this.logCorrectionAttempt('COMPONENT_MOUNT_FAILED', context, 1);

          // Log the error
          monitoringService.trackError(
            error,
            context.componentName,
            'mount',
            { autoCorrection: true }
          );

          // Suggest a page reload for critical components
          if (context.critical) {
            this.showUserNotification(
              'error',
              'Component failed to load. Please reload the page.',
              true
            );
          }

          return { success: false, error: 'Component mount failed' };
        },
      },

      // API rate limit - wait and retry
      'RATE_LIMIT_EXCEEDED': {
        description: 'API rate limit exceeded',
        autoCorrect: async (error, context) => {
          this.logCorrectionAttempt('RATE_LIMIT_EXCEEDED', context, 1);

          // Extract retry-after from error if available
          const retryAfter = error.retryAfter || 5000;
          
          await this.sleep(retryAfter);

          if (context.retryFunction) {
            try {
              const result = await context.retryFunction();
              this.logCorrectionSuccess('RATE_LIMIT_EXCEEDED', context, 1);
              return { success: true, result };
            } catch (retryError) {
              this.logCorrectionFailure('RATE_LIMIT_EXCEEDED', error, context, retryError.message);
              return { success: false, error: retryError.message };
            }
          }
        },
      },
    };
  }

  /**
   * Automatically detect and correct errors
   */
  async autoCorrect(error, componentName, action, context = {}) {
    const errorType = this.classifyError(error);
    
    monitoringService.trackError(error, componentName, action, {
      autoCorrection: true,
      errorType,
    });

    const strategy = this.correctionStrategies[errorType];
    
    if (strategy) {
      try {
        const result = await strategy.autoCorrect(error, {
          ...context,
          componentName,
          action,
        });

        this.corrections.push({
          timestamp: new Date().toISOString(),
          errorType,
          componentName,
          action,
          success: result.success,
        });

        return result;
      } catch (correctionError) {
        monitoringService.trackError(
          correctionError,
          'AutoCorrection',
          'correction_failed',
          { originalError: error.message }
        );

        return { success: false, error: correctionError.message };
      }
    }

    // No correction strategy available
    return { success: false, error: 'No correction strategy available' };
  }

  /**
   * Classify error type for correction strategy
   */
  classifyError(error) {
    const message = error.message?.toLowerCase() || '';
    const status = error.response?.status;

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'NETWORK_ERROR';
    }

    // Storage errors
    if (message.includes('quota') || message.includes('storage')) {
      return 'STORAGE_QUOTA_EXCEEDED';
    }

    // Auth errors
    if (status === 401 || message.includes('token') || message.includes('unauthorized')) {
      return 'TOKEN_EXPIRED';
    }

    // Rate limit
    if (status === 429 || message.includes('rate limit')) {
      return 'RATE_LIMIT_EXCEEDED';
    }

    // JSON parsing
    if (message.includes('json') || message.includes('parse')) {
      return 'INVALID_JSON';
    }

    // Missing data
    if (message.includes('undefined') || message.includes('null') || message.includes('not found')) {
      return 'MISSING_USER_DATA';
    }

    // Component errors
    if (message.includes('component') || message.includes('render')) {
      return 'COMPONENT_MOUNT_FAILED';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Log correction attempt
   */
  logCorrectionAttempt(errorType, context, attemptNumber) {
    monitoringService.logEvent({
      level: 'info',
      category: 'error',
      component: 'AutoCorrection',
      action: 'attempt',
      message: `Attempting correction for ${errorType} (attempt ${attemptNumber})`,
      errorType,
      context,
      attemptNumber,
    });
  }

  /**
   * Log correction success
   */
  logCorrectionSuccess(errorType, context, attemptNumber) {
    monitoringService.logEvent({
      level: 'info',
      category: 'error',
      component: 'AutoCorrection',
      action: 'success',
      message: `Successfully corrected ${errorType} after ${attemptNumber} attempt(s)`,
      errorType,
      context,
      attemptNumber,
    });
  }

  /**
   * Log correction failure
   */
  logCorrectionFailure(errorType, error, context, reason) {
    monitoringService.logEvent({
      level: 'error',
      category: 'error',
      component: 'AutoCorrection',
      action: 'failure',
      message: `Failed to correct ${errorType}: ${reason}`,
      errorType,
      error: error.message,
      context,
      reason,
    });
  }

  /**
   * Show user notification
   */
  showUserNotification(type, message, requiresAction = false) {
    // This can be integrated with a notification system
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // You can add a toast notification here
    if (requiresAction) {
      alert(message); // Temporary - replace with better UI
    }
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get correction history
   */
  getCorrectionHistory() {
    return this.corrections;
  }

  /**
   * Get correction statistics
   */
  getCorrectionStats() {
    const stats = {
      total: this.corrections.length,
      successful: this.corrections.filter(c => c.success).length,
      failed: this.corrections.filter(c => c.success === false).length,
      byType: {},
    };

    this.corrections.forEach(correction => {
      if (!stats.byType[correction.errorType]) {
        stats.byType[correction.errorType] = { total: 0, successful: 0, failed: 0 };
      }
      stats.byType[correction.errorType].total++;
      if (correction.success) {
        stats.byType[correction.errorType].successful++;
      } else {
        stats.byType[correction.errorType].failed++;
      }
    });

    return stats;
  }
}

// Create singleton instance
const autoCorrectionService = new AutoCorrectionService();

export default autoCorrectionService;
