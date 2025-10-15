/**
 * Session Service
 * Production-grade session management with Redis
 * Implements:
 * - Session creation with device tracking
 * - Token rotation and theft detection
 * - Multi-device session management
 * - Presence tracking
 * - Session revocation
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const UAParser = require('ua-parser-js');
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');

class SessionService {
  constructor() {
    this.SESSION_PREFIX = 'session:';
    this.USER_SESSIONS_PREFIX = 'user_sessions:';
    this.REFRESH_FAMILY_PREFIX = 'refresh_family:';
    this.DEFAULT_SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
  }

  /**
   * Generate session key for Redis
   */
  _getSessionKey(sessionId) {
    return `${this.SESSION_PREFIX}${sessionId}`;
  }

  /**
   * Generate user sessions key for Redis
   */
  _getUserSessionsKey(userId) {
    return `${this.USER_SESSIONS_PREFIX}${userId}`;
  }

  /**
   * Generate refresh family key for Redis
   */
  _getRefreshFamilyKey(familyId) {
    return `${this.REFRESH_FAMILY_PREFIX}${familyId}`;
  }

  /**
   * Hash refresh token (HMAC-SHA256)
   */
  _hashRefreshToken(token) {
    const secret = process.env.JWT_REFRESH_SECRET;
    return crypto.createHmac('sha256', secret).update(token).digest('hex');
  }

  /**
   * Parse device info from user agent
   */
  _parseDeviceInfo(userAgent) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    return {
      type: result.device.type || 'desktop',
      name: result.device.model || result.browser.name || 'Unknown',
      os: result.os.name ? `${result.os.name} ${result.os.version || ''}`.trim() : 'Unknown',
      browser: result.browser.name ? `${result.browser.name} ${result.browser.version || ''}`.trim() : 'Unknown'
    };
  }

  /**
   * Create new session
   * @param {String} userId - User ID
   * @param {String} email - User email
   * @param {String} role - User role
   * @param {String} refreshToken - Refresh token (will be hashed)
   * @param {Object} req - Express request object (for IP, UA)
   * @returns {Object} Session data with session_id
   */
  async createSession(userId, email, role, refreshToken, req) {
    try {
      const sessionId = uuidv4();
      const refreshTokenHash = this._hashRefreshToken(refreshToken);
      const refreshTokenFamily = uuidv4(); // New family for token rotation
      const deviceInfo = this._parseDeviceInfo(req.get('user-agent'));
      const now = new Date().toISOString();

      const sessionData = {
        session_id: sessionId,
        user_id: userId,
        email,
        role,
        refresh_token_hash: refreshTokenHash,
        refresh_token_family: refreshTokenFamily,
        device_info: deviceInfo,
        ip: req.ip || req.connection.remoteAddress,
        user_agent: req.get('user-agent'),
        created_at: now,
        last_seen: now,
        expires_at: new Date(Date.now() + this.DEFAULT_SESSION_TTL * 1000).toISOString()
      };

      // Store session in Redis with TTL
      const sessionKey = this._getSessionKey(sessionId);
      await redisClient.setex(
        sessionKey,
        this.DEFAULT_SESSION_TTL,
        JSON.stringify(sessionData)
      );

      // Add session ID to user's session set
      const userSessionsKey = this._getUserSessionsKey(userId);
      await redisClient.sadd(userSessionsKey, sessionId);
      await redisClient.expire(userSessionsKey, this.DEFAULT_SESSION_TTL);

      // Store refresh token family (for rotation tracking)
      const familyKey = this._getRefreshFamilyKey(refreshTokenFamily);
      await redisClient.setex(familyKey, this.DEFAULT_SESSION_TTL, sessionId);

      logger.info('Session created', {
        sessionId,
        userId,
        device: deviceInfo.type,
        os: deviceInfo.os
      });

      return sessionData;
    } catch (error) {
      logger.error('Failed to create session:', error);
      throw new Error('Session creation failed');
    }
  }

  /**
   * Get session by ID
   * @param {String} sessionId - Session ID
   * @returns {Object|null} Session data or null
   */
  async getSession(sessionId) {
    try {
      const sessionKey = this._getSessionKey(sessionId);
      const sessionData = await redisClient.get(sessionKey);
      
      if (!sessionData) {
        return null;
      }

      return JSON.parse(sessionData);
    } catch (error) {
      logger.error('Failed to get session:', error);
      return null;
    }
  }

  /**
   * Validate and rotate refresh token
   * Implements token theft detection
   * @param {String} refreshToken - Current refresh token
   * @param {String} sessionId - Session ID from JWT
   * @returns {Object} { valid: Boolean, session: Object, reason: String }
   */
  async validateAndRotateRefreshToken(refreshToken, sessionId) {
    try {
      const session = await this.getSession(sessionId);
      
      if (!session) {
        return {
          valid: false,
          reason: 'session_not_found'
        };
      }

      const tokenHash = this._hashRefreshToken(refreshToken);

      // Check if this is the current refresh token
      if (session.refresh_token_hash !== tokenHash) {
        // TOKEN REUSE DETECTED - possible theft!
        logger.warn('Refresh token reuse detected - revoking all sessions', {
          userId: session.user_id,
          sessionId,
          family: session.refresh_token_family
        });

        // Revoke ALL sessions for this user
        await this.revokeAllUserSessions(session.user_id, 'token_theft_detected');

        return {
          valid: false,
          reason: 'token_reuse_detected',
          security_alert: true
        };
      }

      // Token is valid - return session for rotation
      return {
        valid: true,
        session
      };
    } catch (error) {
      logger.error('Failed to validate refresh token:', error);
      return {
        valid: false,
        reason: 'validation_error'
      };
    }
  }

  /**
   * Rotate refresh token (create new token, keep same session)
   * @param {String} sessionId - Session ID
   * @param {String} newRefreshToken - New refresh token to store
   * @returns {Boolean} Success
   */
  async rotateRefreshToken(sessionId, newRefreshToken) {
    try {
      const session = await this.getSession(sessionId);
      
      if (!session) {
        return false;
      }

      // Update refresh token hash
      session.refresh_token_hash = this._hashRefreshToken(newRefreshToken);
      session.last_seen = new Date().toISOString();

      // Save updated session
      const sessionKey = this._getSessionKey(sessionId);
      const ttl = await redisClient.ttl(sessionKey);
      await redisClient.setex(
        sessionKey,
        ttl > 0 ? ttl : this.DEFAULT_SESSION_TTL,
        JSON.stringify(session)
      );

      logger.info('Refresh token rotated', { sessionId, userId: session.user_id });
      return true;
    } catch (error) {
      logger.error('Failed to rotate refresh token:', error);
      return false;
    }
  }

  /**
   * Update session last seen timestamp
   * @param {String} sessionId - Session ID
   */
  async updateLastSeen(sessionId) {
    try {
      const session = await this.getSession(sessionId);
      
      if (!session) {
        return false;
      }

      session.last_seen = new Date().toISOString();

      const sessionKey = this._getSessionKey(sessionId);
      const ttl = await redisClient.ttl(sessionKey);
      await redisClient.setex(
        sessionKey,
        ttl > 0 ? ttl : this.DEFAULT_SESSION_TTL,
        JSON.stringify(session)
      );

      return true;
    } catch (error) {
      logger.error('Failed to update last seen:', error);
      return false;
    }
  }

  /**
   * Get all sessions for a user
   * @param {String} userId - User ID
   * @returns {Array} Array of session objects
   */
  async getUserSessions(userId) {
    try {
      const userSessionsKey = this._getUserSessionsKey(userId);
      const sessionIds = await redisClient.smembers(userSessionsKey);

      const sessions = await Promise.all(
        sessionIds.map(async (sessionId) => {
          const session = await this.getSession(sessionId);
          if (session) {
            // Remove sensitive data
            const { refresh_token_hash, refresh_token_family, ...safeSession } = session;
            return safeSession;
          }
          return null;
        })
      );

      // Filter out null sessions (expired)
      return sessions.filter(s => s !== null);
    } catch (error) {
      logger.error('Failed to get user sessions:', error);
      return [];
    }
  }

  /**
   * Revoke specific session
   * @param {String} sessionId - Session ID to revoke
   * @param {String} userId - User ID (for verification)
   * @param {String} reason - Revocation reason
   * @returns {Boolean} Success
   */
  async revokeSession(sessionId, userId, reason = 'user_revoked') {
    try {
      const session = await this.getSession(sessionId);
      
      if (!session) {
        return false;
      }

      // Verify user owns this session
      if (session.user_id !== userId) {
        logger.warn('Unauthorized session revocation attempt', { sessionId, userId });
        return false;
      }

      // Delete session
      const sessionKey = this._getSessionKey(sessionId);
      await redisClient.del(sessionKey);

      // Remove from user sessions set
      const userSessionsKey = this._getUserSessionsKey(userId);
      await redisClient.srem(userSessionsKey, sessionId);

      // Delete refresh token family
      const familyKey = this._getRefreshFamilyKey(session.refresh_token_family);
      await redisClient.del(familyKey);

      logger.info('Session revoked', { sessionId, userId, reason });
      return true;
    } catch (error) {
      logger.error('Failed to revoke session:', error);
      return false;
    }
  }

  /**
   * Revoke all sessions for a user
   * @param {String} userId - User ID
   * @param {String} reason - Revocation reason
   * @returns {Number} Number of sessions revoked
   */
  async revokeAllUserSessions(userId, reason = 'user_revoked_all') {
    try {
      const userSessionsKey = this._getUserSessionsKey(userId);
      const sessionIds = await redisClient.smembers(userSessionsKey);

      let revokedCount = 0;
      for (const sessionId of sessionIds) {
        const success = await this.revokeSession(sessionId, userId, reason);
        if (success) {
          revokedCount++;
        }
      }

      // Clean up user sessions set
      await redisClient.del(userSessionsKey);

      logger.info('All user sessions revoked', { userId, count: revokedCount, reason });
      return revokedCount;
    } catch (error) {
      logger.error('Failed to revoke all user sessions:', error);
      return 0;
    }
  }

  /**
   * Clean up expired sessions (called by cron job)
   * Redis automatically expires keys, but this cleans up user session sets
   */
  async cleanupExpiredSessions() {
    try {
      // Scan for all user session sets
      let cursor = '0';
      let cleanedCount = 0;

      do {
        const [nextCursor, keys] = await redisClient.scan(
          cursor,
          'MATCH',
          `${this.USER_SESSIONS_PREFIX}*`,
          'COUNT',
          100
        );
        cursor = nextCursor;

        for (const key of keys) {
          const sessionIds = await redisClient.smembers(key);
          
          // Check each session
          for (const sessionId of sessionIds) {
            const exists = await redisClient.exists(this._getSessionKey(sessionId));
            if (!exists) {
              // Session expired, remove from set
              await redisClient.srem(key, sessionId);
              cleanedCount++;
            }
          }
        }
      } while (cursor !== '0');

      if (cleanedCount > 0) {
        logger.info('Cleaned up expired sessions', { count: cleanedCount });
      }

      return cleanedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired sessions:', error);
      return 0;
    }
  }
}

module.exports = new SessionService();
