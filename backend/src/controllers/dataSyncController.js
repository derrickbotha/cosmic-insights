/**
 * Data Sync Controller
 * Handles syncing existing data to ML service
 */
const mlService = require('../services/mlService');
const logger = require('../utils/logger');

// In-memory sync job tracker
const syncJobs = new Map();

/**
 * Create a new sync job
 */
function createSyncJob(userId, type, totalItems) {
  const jobId = `${userId}-${type}-${Date.now()}`;
  const job = {
    id: jobId,
    userId,
    type,
    status: 'running',
    totalItems,
    processedItems: 0,
    syncedItems: 0,
    failedItems: 0,
    errors: [],
    startTime: new Date(),
    lastUpdate: new Date()
  };
  syncJobs.set(jobId, job);
  return job;
}

/**
 * Update sync job progress
 */
function updateSyncJob(jobId, updates) {
  const job = syncJobs.get(jobId);
  if (job) {
    Object.assign(job, updates, { lastUpdate: new Date() });
    syncJobs.set(jobId, job);
  }
  return job;
}

/**
 * Complete sync job
 */
function completeSyncJob(jobId, status = 'completed') {
  const job = syncJobs.get(jobId);
  if (job) {
    job.status = status;
    job.endTime = new Date();
    job.duration = job.endTime - job.startTime;
    syncJobs.set(jobId, job);
  }
  return job;
}

/**
 * Get sync job by ID
 */
function getSyncJob(jobId) {
  return syncJobs.get(jobId);
}

/**
 * Get all sync jobs for a user
 */
function getUserSyncJobs(userId) {
  const jobs = [];
  for (const [, job] of syncJobs) {
    if (job.userId === userId) {
      jobs.push(job);
    }
  }
  return jobs.sort((a, b) => b.startTime - a.startTime);
}

/**
 * Clean up old sync jobs (keep last 50)
 */
function cleanupSyncJobs() {
  if (syncJobs.size > 50) {
    const sortedJobs = Array.from(syncJobs.entries())
      .sort(([, a], [, b]) => b.startTime - a.startTime);
    
    // Keep only the 50 most recent jobs
    syncJobs.clear();
    sortedJobs.slice(0, 50).forEach(([id, job]) => {
      syncJobs.set(id, job);
    });
  }
}

/**
 * Sync user's journal entries to ML service
 */
exports.syncJournalEntries = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    // Only allow users to sync their own data unless admin
    if (userId !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'ml_admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot sync data for other users'
      });
    }

    // Get MongoDB connection
    const db = req.app.locals.db || require('mongoose').connection.db;
    
    // Fetch journal entries from MongoDB
    const journalEntries = await db.collection('journal_entries').find({
      userId: userId
    }).toArray();

    if (!journalEntries || journalEntries.length === 0) {
      return res.json({
        success: true,
        message: 'No journal entries found to sync',
        synced: 0,
        failed: 0
      });
    }

    logger.info(`Starting sync of ${journalEntries.length} journal entries for user ${userId}`);

    // Create sync job
    const syncJob = createSyncJob(userId, 'journal_entries', journalEntries.length);
    
    // Return job ID immediately for polling
    res.json({
      success: true,
      message: 'Sync started',
      jobId: syncJob.id,
      totalItems: journalEntries.length
    });

    // Perform sync asynchronously
    (async () => {
      const results = {
        synced: 0,
        failed: 0,
        errors: []
      };

      // Sync each entry
      for (let i = 0; i < journalEntries.length; i++) {
        const entry = journalEntries[i];
        try {
          const result = await mlService.createDocument(
            userId,
            entry.title || `Journal Entry - ${new Date(entry.createdAt).toLocaleDateString()}`,
            entry.content || entry.text || '',
            'journal_entry',
            {
              originalId: entry._id.toString(),
              createdAt: entry.createdAt,
              mood: entry.mood,
              tags: entry.tags,
              category: entry.category
            }
          );

          if (result.success) {
            results.synced++;
          } else {
            results.failed++;
            results.errors.push({
              entryId: entry._id.toString(),
              error: result.error
            });
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            entryId: entry._id.toString(),
            error: error.message
          });
        }

        // Update job progress
        updateSyncJob(syncJob.id, {
          processedItems: i + 1,
          syncedItems: results.synced,
          failedItems: results.failed
        });
      }

      // Complete the job
      completeSyncJob(syncJob.id);
      logger.info(`Sync completed: ${results.synced} synced, ${results.failed} failed`);
      cleanupSyncJobs();
    })();

    res.json({
      success: true,
      message: `Synced ${results.synced} of ${journalEntries.length} journal entries`,
      ...results
    });

  } catch (error) {
    logger.error('Journal sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Sync user's goals to ML service
 */
exports.syncGoals = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    if (userId !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'ml_admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot sync data for other users'
      });
    }

    const db = req.app.locals.db || require('mongoose').connection.db;
    
    const goals = await db.collection('goals').find({
      userId: userId
    }).toArray();

    if (!goals || goals.length === 0) {
      return res.json({
        success: true,
        message: 'No goals found to sync',
        synced: 0,
        failed: 0
      });
    }

    logger.info(`Starting sync of ${goals.length} goals for user ${userId}`);

    const results = {
      synced: 0,
      failed: 0,
      errors: []
    };

    for (const goal of goals) {
      try {
        const result = await mlService.createDocument(
          userId,
          goal.title || 'Goal',
          goal.description || goal.content || '',
          'goal',
          {
            originalId: goal._id.toString(),
            createdAt: goal.createdAt,
            status: goal.status,
            category: goal.category,
            targetDate: goal.targetDate
          }
        );

        if (result.success) {
          results.synced++;
        } else {
          results.failed++;
          results.errors.push({
            goalId: goal._id.toString(),
            error: result.error
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          goalId: goal._id.toString(),
          error: error.message
        });
      }
    }

    logger.info(`Goal sync completed: ${results.synced} synced, ${results.failed} failed`);

    res.json({
      success: true,
      message: `Synced ${results.synced} of ${goals.length} goals`,
      ...results
    });

  } catch (error) {
    logger.error('Goal sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Sync all user data
 */
exports.syncAllUserData = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    if (userId !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'ml_admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot sync data for other users'
      });
    }

    logger.info(`Starting full data sync for user ${userId}`);

    const results = {
      journalEntries: { synced: 0, failed: 0 },
      goals: { synced: 0, failed: 0 },
      totalSynced: 0,
      totalFailed: 0
    };

    const db = req.app.locals.db || require('mongoose').connection.db;
    
    // Sync journal entries
    const journalEntries = await db.collection('journal_entries').find({
      userId: userId
    }).toArray();

    for (const entry of journalEntries) {
      try {
        const result = await mlService.createDocument(
          userId,
          entry.title || `Journal Entry - ${new Date(entry.createdAt).toLocaleDateString()}`,
          entry.content || entry.text || '',
          'journal_entry',
          {
            originalId: entry._id.toString(),
            createdAt: entry.createdAt,
            mood: entry.mood,
            tags: entry.tags
          }
        );

        if (result.success) {
          results.journalEntries.synced++;
          results.totalSynced++;
        } else {
          results.journalEntries.failed++;
          results.totalFailed++;
        }
      } catch (error) {
        results.journalEntries.failed++;
        results.totalFailed++;
      }
    }

    // Sync goals
    const goals = await db.collection('goals').find({
      userId: userId
    }).toArray();

    for (const goal of goals) {
      try {
        const result = await mlService.createDocument(
          userId,
          goal.title || 'Goal',
          goal.description || goal.content || '',
          'goal',
          {
            originalId: goal._id.toString(),
            createdAt: goal.createdAt,
            status: goal.status
          }
        );

        if (result.success) {
          results.goals.synced++;
          results.totalSynced++;
        } else {
          results.goals.failed++;
          results.totalFailed++;
        }
      } catch (error) {
        results.goals.failed++;
        results.totalFailed++;
      }
    }

    logger.info(`Full sync completed for user ${userId}: ${results.totalSynced} synced, ${results.totalFailed} failed`);

    res.json({
      success: true,
      message: `Synced ${results.totalSynced} total items`,
      ...results
    });

  } catch (error) {
    logger.error('Full sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get sync job status by job ID
 */
exports.getSyncJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.userId;
    
    const job = getSyncJob(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Sync job not found'
      });
    }
    
    // Check if user owns this job or is admin
    if (job.userId !== userId && req.user.role !== 'admin' && req.user.role !== 'ml_admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot view sync job for other users'
      });
    }
    
    // Calculate progress percentage
    const progress = job.totalItems > 0 
      ? Math.round((job.processedItems / job.totalItems) * 100)
      : 0;
    
    res.json({
      success: true,
      job: {
        ...job,
        progress
      }
    });
  } catch (error) {
    logger.error('Error fetching sync job status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sync job status'
    });
  }
};

/**
 * Get all sync jobs for current user
 */
exports.getUserSyncJobs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const jobs = getUserSyncJobs(userId);
    
    // Add progress percentage to each job
    const jobsWithProgress = jobs.map(job => ({
      ...job,
      progress: job.totalItems > 0 
        ? Math.round((job.processedItems / job.totalItems) * 100)
        : 0
    }));
    
    res.json({
      success: true,
      jobs: jobsWithProgress
    });
  } catch (error) {
    logger.error('Error fetching user sync jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sync jobs'
    });
  }
};

/**
 * Get sync status for a user
 */
exports.getSyncStatus = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    if (userId !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'ml_admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot view sync status for other users'
      });
    }

    // Get document count from ML service
    const mlResult = await mlService.listDocuments(userId, { page: 1 });
    
    const db = req.app.locals.db || require('mongoose').connection.db;
    
    // Get counts from MongoDB
    const journalCount = await db.collection('journal_entries').countDocuments({ userId });
    const goalCount = await db.collection('goals').countDocuments({ userId });
    
    const totalMongoDB = journalCount + goalCount;
    const totalML = mlResult.success ? (mlResult.data.count || 0) : 0;

    res.json({
      success: true,
      mongodb: {
        journalEntries: journalCount,
        goals: goalCount,
        total: totalMongoDB
      },
      mlService: {
        total: totalML,
        synced: mlResult.success
      },
      syncPercentage: totalMongoDB > 0 ? Math.round((totalML / totalMongoDB) * 100) : 0
    });

  } catch (error) {
    logger.error('Get sync status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
