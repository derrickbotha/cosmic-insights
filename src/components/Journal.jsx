import React, { useState, useEffect } from 'react';
import AIService from '../services/aiService';

/**
 * Journal Component
 * Daily journaling with AI integration and analysis
 */
const Journal = ({ userData }) => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const aiService = new AIService('claudeSonnet4');

  // Journal prompts customized to user's current phase
  const journalPrompts = [
    {
      id: 1,
      category: "Self-Reflection",
      prompt: "What pattern showed up today that I've seen before?",
      icon: "🔄"
    },
    {
      id: 2,
      category: "Emotional",
      prompt: "What emotion am I avoiding right now, and what is it trying to tell me?",
      icon: "💙"
    },
    {
      id: 3,
      category: "Growth",
      prompt: "If I was being completely honest with myself today, what would I admit?",
      icon: "🌱"
    },
    {
      id: 4,
      category: "Gratitude",
      prompt: "What unexpected gift did today bring me?",
      icon: "🎁"
    },
    {
      id: 5,
      category: "Shadow Work",
      prompt: "What quality in others triggered me today—and what does that mirror in me?",
      icon: "🌑"
    },
    {
      id: 6,
      category: "Purpose",
      prompt: "If fear wasn't a factor, what would I do differently tomorrow?",
      icon: "✨"
    },
    {
      id: 7,
      category: "Relationships",
      prompt: "Where did I abandon myself to please someone else today?",
      icon: "❤️"
    },
    {
      id: 8,
      category: "Intuition",
      prompt: "What did my intuition whisper to me today that I ignored?",
      icon: "🔮"
    }
  ];

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    // In production, load from database
    const savedEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    setEntries(savedEntries);
  };

  const saveEntry = () => {
    if (!currentEntry.trim()) return;

    const newEntry = {
      id: Date.now(),
      content: currentEntry,
      prompt: selectedPrompt,
      date: new Date().toISOString(),
      mood: null, // Could be selected by user
      astrological: {
        moonPhase: getCurrentMoonPhase(),
        // Other astrological data
      }
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    
    setCurrentEntry('');
    setSelectedPrompt(null);
    setShowPrompts(true);

    // Trigger AI analysis if user has enough entries
    if (updatedEntries.length % 7 === 0) {
      analyzeRecentEntries(updatedEntries.slice(0, 7));
    }
  };

  const getCurrentMoonPhase = () => {
    // Simplified moon phase calculation
    // In production, use proper lunar calculation library
    const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                    'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    return phases[Math.floor(Math.random() * phases.length)];
  };

  const analyzeRecentEntries = async (recentEntries) => {
    setLoading(true);
    try {
      const response = await aiService.analyzeJournalEntries(recentEntries, userData);
      setInsights(response);
    } catch (error) {
      console.error('Error analyzing journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setShowPrompts(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Your Sacred Journal
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Every entry helps the AI understand you more deeply
        </p>
      </div>

      {/* Current Moon Phase & Date */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm mb-1">Today's Date</p>
            <p className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          <div className="text-right">
            <p className="text-indigo-100 text-sm mb-1">Current Moon Phase</p>
            <p className="text-2xl font-bold flex items-center justify-end">
              <span className="mr-2">🌙</span> {getCurrentMoonPhase()}
            </p>
          </div>
        </div>
      </div>

      {/* Journal Prompts */}
      {showPrompts && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Choose a Prompt (or write freely)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {journalPrompts.map(prompt => (
              <button
                key={prompt.id}
                onClick={() => selectPrompt(prompt)}
                className="text-left bg-gray-50 dark:bg-gray-900 rounded-lg p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-2 border-transparent hover:border-indigo-600 transition-all"
              >
                <div className="flex items-start">
                  <span className="text-3xl mr-3">{prompt.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">
                      {prompt.category}
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {prompt.prompt}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowPrompts(false)}
            className="w-full bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Write Freely (No Prompt)
          </button>
        </div>
      )}

      {/* Writing Area */}
      {!showPrompts && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {selectedPrompt && (
            <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border-l-4 border-indigo-600">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">
                Today's Prompt
              </p>
              <p className="text-lg text-gray-900 dark:text-white font-medium">
                {selectedPrompt.prompt}
              </p>
              <button
                onClick={() => {
                  setSelectedPrompt(null);
                  setShowPrompts(true);
                }}
                className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Choose different prompt
              </button>
            </div>
          )}
          
          <textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            placeholder="Let your thoughts flow freely... There's no right or wrong way to journal. Be honest. Be vulnerable. Be real."
            rows="15"
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors resize-none text-lg leading-relaxed"
            autoFocus
          />
          
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentEntry.length} characters • {Math.ceil(currentEntry.split(' ').length)} words
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCurrentEntry('');
                  setSelectedPrompt(null);
                  setShowPrompts(true);
                }}
                className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveEntry}
                disabled={!currentEntry.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="text-3xl mr-3">🔮</span>
            AI Insights from Your Recent Entries
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Based on your last 7 journal entries, I'm noticing some powerful patterns...
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <p className="text-gray-700 dark:text-gray-300">
              {insights.text}
            </p>
          </div>
        </div>
      )}

      {/* Recent Entries */}
      {entries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Entries
          </h2>
          <div className="space-y-6">
            {entries.slice(0, 5).map(entry => (
              <div key={entry.id} className="border-l-4 border-indigo-600 pl-6 py-4 bg-gray-50 dark:bg-gray-900 rounded-r-lg">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {entry.prompt && (
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full">
                      {entry.prompt.category}
                    </span>
                  )}
                </div>
                {entry.prompt && (
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-2 italic">
                    "{entry.prompt.prompt}"
                  </p>
                )}
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {entry.content.length > 300 
                    ? `${entry.content.substring(0, 300)}...` 
                    : entry.content}
                </p>
              </div>
            ))}
          </div>
          
          {entries.length > 5 && (
            <button className="mt-6 w-full bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors font-medium">
              View All Entries ({entries.length})
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 && showPrompts && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Start Your Journey
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Choose a prompt above to begin journaling
          </p>
        </div>
      )}
    </div>
  );
};

export default Journal;