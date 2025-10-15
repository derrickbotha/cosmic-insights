/**
 * Session Management Controller
 * Production-ready session management endpoints
 * Implements:
 * - List all user sessions
 * - Revoke specific session
 * - Revoke all sessions except current
 */

const sessionService = require('../services/sessionService');
const logger = require('../utils/logger');

/**
 * Get all active sessions for the authenticated user
 * @route GET /api/user/sessions
 * @access Private
 */
exports.getSessions = async (req, res) => {
  try {
    const userId = req.user.userId.toString();
    const currentSessionId = req.user.sessionId;

    // Get all user sessions from Redis
    const sessions = await sessionService.getUserSessions(userId);

    // Format response with user-friendly data
    const formattedSessions = sessions.map(session => ({
      id: session.session_id,
      device: {
        type: session.device_info.type,
        name: session.device_info.name,
        os: session.device_info.os,
        browser: session.device_info.browser
      },
      location: {
        ip: session.ip
      },
      activity: {
        createdAt: session.created_at,
        lastSeen: session.last_seen
      },
      isCurrent: session.session_id === currentSessionId
    }));

    // Sort by last seen (most recent first)
    formattedSessions.sort((a, b) => 
      new Date(b.activity.lastSeen) - new Date(a.activity.lastSeen)
    );

    res.json({
      success: true,
      data: {
        sessions: formattedSessions,
        totalCount: formattedSessions.length,
        currentSessionId
      }
    });
  } catch (error) {
    logger.error('Failed to get user sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve sessions'
    });
  }
};

/**
 * Revoke a specific session
 * @route DELETE /api/user/sessions/:sessionId
 * @access Private
 */
exports.revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId.toString();
    const currentSessionId = req.user.sessionId;

    // Prevent revoking current session (use logout instead)
    if (sessionId === currentSessionId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot revoke current session. Use logout endpoint instead.'
      });
    }

    // Revoke the session
    const success = await sessionService.revokeSession(
      sessionId,
      userId,
      'user_revoked'
    );

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or already revoked'
      });
    }

    logger.info('Session revoked by user', {
      userId,
      revokedSessionId: sessionId,
      currentSessionId
    });

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    logger.error('Failed to revoke session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke session'
    });
  }
};

/**
 * Revoke all sessions except the current one
 * @route DELETE /api/user/sessions
 * @access Private
 */
exports.revokeAllSessions = async (req, res) => {
  try {
    const userId = req.user.userId.toString();
    const currentSessionId = req.user.sessionId;

    // Get all sessions
    const sessions = await sessionService.getUserSessions(userId);

    // Revoke all except current
    let revokedCount = 0;
    for (const session of sessions) {
      if (session.session_id !== currentSessionId) {
        const success = await sessionService.revokeSession(
          session.session_id,
          userId,
          'user_revoked_all'
        );
        if (success) {
          revokedCount++;
        }
      }
    }

    logger.info('All user sessions revoked except current', {
      userId,
      revokedCount,
      currentSessionId
    });

    res.json({
      success: true,
      message: `${revokedCount} session(s) revoked successfully`,
      data: {
        revokedCount,
        currentSessionId
      }
    });
  } catch (error) {
    logger.error('Failed to revoke all sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke sessions'
    });
  }
};

/**
 * Get current session details
 * @route GET /api/user/sessions/current
 * @access Private
 */
exports.getCurrentSession = async (req, res) => {
  try {
    const sessionId = req.user.sessionId;

    if (!sessionId) {
      return res.status(404).json({
        success: false,
        error: 'No active session found'
      });
    }

    const session = await sessionService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: session.session_id,
        device: {
          type: session.device_info.type,
          name: session.device_info.name,
          os: session.device_info.os,
          browser: session.device_info.browser
        },
        location: {
          ip: session.ip
        },
        activity: {
          createdAt: session.created_at,
          lastSeen: session.last_seen,
          expiresAt: session.expires_at
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get current session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session'
    });
  }
};
