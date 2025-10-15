/**
 * Session Management Routes
 * Routes for managing user sessions (multi-device management)
 */

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticate } = require('../middleware/auth');

/**
 * @route GET /api/user/sessions
 * @desc Get all active sessions for the authenticated user
 * @access Private
 */
router.get('/', authenticate, sessionController.getSessions);

/**
 * @route GET /api/user/sessions/current
 * @desc Get current session details
 * @access Private
 */
router.get('/current', authenticate, sessionController.getCurrentSession);

/**
 * @route DELETE /api/user/sessions/:sessionId
 * @desc Revoke a specific session
 * @access Private
 */
router.delete('/:sessionId', authenticate, sessionController.revokeSession);

/**
 * @route DELETE /api/user/sessions
 * @desc Revoke all sessions except the current one
 * @access Private
 */
router.delete('/', authenticate, sessionController.revokeAllSessions);

module.exports = router;
