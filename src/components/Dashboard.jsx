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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft-xl border-2 border-primary/20 p-12 text-center">
          <div className="mb-8">
            <svg className="w-28 h-28 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Unlock Your Full Cosmic Insights
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            You've used your free reading. Upgrade to access:
          </p>
          <ul className="text-left max-w-md mx-auto mb-10 space-y-4">
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
              <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300 text-base">
                <svg className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button className="bg-cosmic-gold hover:shadow-soft-lg transform hover:scale-105 text-white font-bold py-5 px-10 rounded-lg text-lg transition-all">
            Upgrade Now - $19.99/month
          </button>
          <p className="mt-6 text-base text-gray-500 dark:text-gray-400">
            Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="bg-primary rounded-xl shadow-soft-xl border-2 border-primary/20 p-10 text-white">
        <h1 className="text-5xl font-bold mb-4">Welcome back, {userData?.name || 'Seeker'}</h1>
        <p className="text-white/90 text-xl">
          Your cosmic insights dashboard • Powered by Claude Sonnet 4
        </p>
        {!isPaidMember && (
          <div className="mt-6 bg-white/20 rounded-lg p-4 inline-block border-2 border-white/30">
            <p className="text-base font-medium">🎁 Free trial reading - Upgrade anytime for full access</p>
          </div>
        )}
      </div>

      {/* Life Season Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft-lg border border-gray-200 dark:border-gray-700 p-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-4">
          <span className="text-4xl">📖</span>
          <span>Hidden Lessons of This Chapter</span>
        </h2>
        
        <div className="space-y-8">
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft-lg border border-gray-200 dark:border-gray-700 p-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-4">
          <span className="text-4xl">🚧</span>
          <span>What's Blocking Your Progress</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-soft-lg border border-gray-200 dark:border-gray-700 p-8 transition-all hover:shadow-soft-xl hover:scale-105 ${locked ? 'relative overflow-hidden' : ''}`}>
    {locked && (
      <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 flex items-center justify-center z-10">
        <div className="text-center">
          <svg className="w-14 h-14 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <p className="text-base font-semibold text-gray-600 dark:text-gray-400">Upgrade to Unlock</p>
        </div>
      </div>
    )}
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
    <div className="inline-block bg-soft-indigo dark:bg-indigo-900/30 text-primary dark:text-indigo-300 px-4 py-2 rounded-lg text-base font-semibold mb-4">
      {season}
    </div>
    <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">{description}</p>
  </div>
);

const LessonCard = ({ title, content, locked }) => (
  <div className={`border-l-4 border-primary pl-8 py-6 ${locked ? 'relative' : ''}`}>
    {locked && (
      <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 flex items-center pl-8">
        <svg className="w-7 h-7 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        <p className="text-base font-semibold text-gray-600 dark:text-gray-400">Upgrade to unlock</p>
      </div>
    )}
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">{content}</p>
  </div>
);

const BlockingPatternCard = ({ pattern, impact, solution, locked }) => (
  <div className={`bg-red-50 dark:bg-red-900/10 rounded-lg p-6 border-2 border-red-200 dark:border-red-800 ${locked ? 'relative overflow-hidden' : ''}`}>
    {locked && (
      <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 flex items-center justify-center z-10">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      </div>
    )}
    <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-3">{pattern}</h3>
    <p className="text-red-700 dark:text-red-400 text-base mb-4 leading-relaxed"><strong>Impact:</strong> {impact}</p>
    <p className="text-green-700 dark:text-green-400 text-base leading-relaxed"><strong>Solution:</strong> {solution}</p>
  </div>
);

const QuickActionCard = ({ icon, title, description, action, to }) => (
  <a href={to} className="block bg-white dark:bg-gray-800 rounded-xl shadow-soft-lg border border-gray-200 dark:border-gray-700 p-8 hover:shadow-soft-xl transition-all transform hover:scale-105">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-base mb-6 leading-relaxed">{description}</p>
    <span className="text-primary dark:text-indigo-400 font-semibold text-base hover:underline">
      {action} →
    </span>
  </a>
);

export default Dashboard;