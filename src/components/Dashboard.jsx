import React, { useState, useEffect } from 'react';
import AIService from '../services/aiService';

/**
 * Dashboard Component
 * Displays life season analysis, patterns, and progress
 */
const Dashboard = ({ userData, isPaidMember = false, hasUsedFreeReading = false }) => {
  const [lifeSeasonData, setLifeSeasonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const aiService = new AIService('claudeSonnet4');

  useEffect(() => {
    loadDashboardData();
  }, [userData]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Check if user can access dashboard
      if (!isPaidMember && hasUsedFreeReading) {
        setShowUpgradePrompt(true);
        setLoading(false);
        return;
      }

      // Generate life season analysis
      const response = await aiService.generateCosmicProfile(userData);
      setLifeSeasonData(response);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showUpgradePrompt || (!isPaidMember && hasUsedFreeReading)) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg className="w-24 h-24 mx-auto text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Unlock Your Full Cosmic Insights
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            You've used your free reading. Upgrade to access:
          </p>
          <ul className="text-left max-w-md mx-auto mb-8 space-y-3">
            {[
              'Complete Life Season Analysis',
              'Recurring Pattern Recognition',
              'Hidden Lesson Identification',
              'Goal Tracking & Progress Insights',
              'Daily Journal Integration',
              'Weekly Cosmic Guidance',
              'Unlimited AI Chat Sessions',
              'Value Conflict Resolution'
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors shadow-lg">
            Upgrade Now - $19.99/month
          </button>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {userData?.name || 'Seeker'}</h1>
        <p className="text-indigo-100 text-lg">
          Your cosmic insights dashboard • Powered by Claude Sonnet 4
        </p>
        {!isPaidMember && (
          <div className="mt-4 bg-white/10 backdrop-blur rounded-lg p-3 inline-block">
            <p className="text-sm">🎁 Free trial reading - Upgrade anytime for full access</p>
          </div>
        )}
      </div>

      {/* Life Season Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Emotional Season */}
        <LifeSeasonCard
          icon="💙"
          title="Emotional Season"
          season="Transformation"
          description="You're in a period of deep emotional alchemy, releasing old patterns and making space for authentic feeling."
          locked={!isPaidMember}
        />

        {/* Career & Purpose Season */}
        <LifeSeasonCard
          icon="💼"
          title="Career & Purpose"
          season="Awakening"
          description="Your soul's calling is becoming clearer. This is a time to align your work with your deeper purpose."
          locked={!isPaidMember}
        />

        {/* Relationship Season */}
        <LifeSeasonCard
          icon="❤️"
          title="Relationship Season"
          season="Evolution"
          description="Your relationships are mirroring your growth. Old dynamics are shifting as you evolve."
          locked={!isPaidMember}
        />

        {/* Mental Season */}
        <LifeSeasonCard
          icon="🧠"
          title="Mental Season"
          season="Clarity"
          description="Mental fog is lifting. You're seeing patterns and connections you couldn't see before."
          locked={!isPaidMember}
        />

        {/* Spiritual Season */}
        <LifeSeasonCard
          icon="✨"
          title="Spiritual Season"
          season="Deepening"
          description="Your spiritual connection is strengthening. Trust is replacing doubt."
          locked={!isPaidMember}
        />

        {/* Overall Energy */}
        <LifeSeasonCard
          icon="🌟"
          title="Overall Energy"
          season="Integration"
          description="All areas of your life are being called into alignment. This is a powerful transformation period."
          locked={!isPaidMember}
        />
      </div>

      {/* Hidden Lessons */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="text-3xl mr-3">📖</span>
          Hidden Lessons of This Chapter
        </h2>
        
        <div className="space-y-6">
          <LessonCard
            title="The Lesson You Keep Avoiding"
            content="You're being asked to trust yourself more deeply, but you keep seeking external validation instead. This chapter is teaching you that your inner knowing is more reliable than any outside opinion."
            locked={!isPaidMember}
          />
          
          <LessonCard
            title="How It's Blocking Your Progress"
            content="By constantly looking outside yourself for answers, you delay taking action on what you already know is right. This creates a cycle of hesitation that keeps you stuck in analysis paralysis."
            locked={!isPaidMember}
          />
          
          <LessonCard
            title="The Pattern Ready to Break"
            content="You've been in this cycle for years—seeking advice, second-guessing yourself, and then being disappointed when things don't feel right. The universe is giving you opportunities to choose differently."
            locked={!isPaidMember}
          />
        </div>
      </div>

      {/* Blocking Patterns */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="text-3xl mr-3">🚧</span>
          What's Blocking Your Progress
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BlockingPatternCard
            pattern="People-Pleasing"
            impact="Draining your energy by prioritizing others' needs over your own"
            solution="Practice saying no. Start with small boundaries."
            locked={!isPaidMember}
          />
          
          <BlockingPatternCard
            pattern="Perfectionism"
            impact="Preventing you from starting new projects until everything feels 'perfect'"
            solution="Embrace 'good enough' as a radical practice."
            locked={!isPaidMember}
          />
          
          <BlockingPatternCard
            pattern="Fear of Success"
            impact="Sabotaging opportunities right before they come to fruition"
            solution="Ask: What would change if I succeeded? Address those fears."
            locked={!isPaidMember}
          />
          
          <BlockingPatternCard
            pattern="Unprocessed Grief"
            impact="Creating emotional numbness that blocks joy and connection"
            solution="Allow yourself to feel what you've been avoiding."
            locked={!isPaidMember}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          icon="📝"
          title="Journal Entry"
          description="Process today's insights"
          action="Write Now"
          to="/journal"
        />
        
        <QuickActionCard
          icon="🎯"
          title="Track Goals"
          description="Update your progress"
          action="View Goals"
          to="/goals"
        />
        
        <QuickActionCard
          icon="💬"
          title="AI Guidance"
          description="Ask a question"
          action="Chat Now"
          to="/chat"
        />
      </div>
    </div>
  );
};

// Sub-components
const LifeSeasonCard = ({ icon, title, season, description, locked }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl ${locked ? 'relative overflow-hidden' : ''}`}>
    {locked && (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/90 to-gray-100/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upgrade to Unlock</p>
        </div>
      </div>
    )}
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
    <div className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium mb-3">
      {season}
    </div>
    <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
  </div>
);

const LessonCard = ({ title, content, locked }) => (
  <div className={`border-l-4 border-indigo-600 pl-6 py-4 ${locked ? 'relative' : ''}`}>
    {locked && (
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50/95 to-transparent dark:from-gray-900/95 backdrop-blur-sm flex items-center pl-6">
        <svg className="w-6 h-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upgrade to unlock</p>
      </div>
    )}
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{content}</p>
  </div>
);

const BlockingPatternCard = ({ pattern, impact, solution, locked }) => (
  <div className={`bg-red-50 dark:bg-red-900/10 rounded-lg p-5 border border-red-200 dark:border-red-800 ${locked ? 'relative overflow-hidden' : ''}`}>
    {locked && (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/95 to-gray-100/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-sm flex items-center justify-center z-10">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      </div>
    )}
    <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">{pattern}</h3>
    <p className="text-red-700 dark:text-red-400 text-sm mb-3"><strong>Impact:</strong> {impact}</p>
    <p className="text-green-700 dark:text-green-400 text-sm"><strong>Solution:</strong> {solution}</p>
  </div>
);

const QuickActionCard = ({ icon, title, description, action, to }) => (
  <a href={to} className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{description}</p>
    <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline">
      {action} →
    </span>
  </a>
);

export default Dashboard;