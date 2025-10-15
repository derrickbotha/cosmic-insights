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
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Your Sacred Journal
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Every entry helps the AI understand you more deeply
        </p>
      </div>

      {/* Current Moon Phase & Date */}
      <div className="bg-primary border border-primary/20 rounded-xl shadow-soft-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-base mb-2">Today's Date</p>
            <p className="text-3xl font-bold">{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-base mb-2">Current Moon Phase</p>
            <p className="text-3xl font-bold flex items-center justify-end gap-3">
              <span className="text-4xl">🌙</span> {getCurrentMoonPhase()}
            </p>
          </div>
        </div>
      </div>

      {/* Journal Prompts */}
      {showPrompts && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 rounded-xl shadow-soft-lg p-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Choose a Prompt (or write freely)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {journalPrompts.map(prompt => (
              <button
                key={prompt.id}
                onClick={() => selectPrompt(prompt)}
                className="text-left bg-white dark:bg-gray-900 border-2 border-gray-200 rounded-lg p-6 hover:bg-soft-indigo dark:hover:bg-indigo-900/20 hover:border-primary transition-all transform hover:scale-105"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{prompt.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-primary dark:text-indigo-400 uppercase tracking-wide mb-2">
                      {prompt.category}
                    </p>
                    <p className="text-base text-gray-900 dark:text-white font-medium leading-relaxed">
                      {prompt.prompt}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowPrompts(false)}
            className="w-full bg-white dark:bg-gray-900 border-2 border-gray-200 text-gray-700 dark:text-gray-300 py-4 rounded-lg hover:border-primary hover:shadow-soft transition-all font-medium text-lg"
          >
            Write Freely (No Prompt)
          </button>
        </div>
      )}

      {/* Writing Area */}
      {!showPrompts && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 rounded-xl shadow-soft-lg p-10">
          {selectedPrompt && (
            <div className="mb-8 bg-soft-indigo dark:bg-indigo-900/20 rounded-lg p-6 border-l-4 border-primary">
              <p className="text-sm font-semibold text-primary dark:text-indigo-400 uppercase tracking-wide mb-2">
                Today's Prompt
              </p>
              <p className="text-xl text-gray-900 dark:text-white font-medium leading-relaxed">
                {selectedPrompt.prompt}
              </p>
              <button
                onClick={() => {
                  setSelectedPrompt(null);
                  setShowPrompts(true);
                }}
                className="mt-3 text-base text-primary dark:text-indigo-400 hover:underline font-medium"
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
            className="w-full px-6 py-5 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary hover:border-gray-300 transition-colors resize-none text-lg leading-relaxed"
            autoFocus
          />
          
          <div className="mt-8 flex items-center justify-between">
            <p className="text-base text-gray-500 dark:text-gray-400">
              {currentEntry.length} characters • {Math.ceil(currentEntry.split(' ').length)} words
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setCurrentEntry('');
                  setSelectedPrompt(null);
                  setShowPrompts(true);
                }}
                className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-primary hover:shadow-soft transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveEntry}
                disabled={!currentEntry.trim()}
                className="px-8 py-3 bg-primary border-2 border-primary text-white rounded-lg hover:shadow-soft-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights && (
        <div className="bg-soft-purple border border-purple-200 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-soft-lg p-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-4">
            <span className="text-4xl">🔮</span>
            AI Insights from Your Recent Entries
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Based on your last 7 journal entries, I'm noticing some powerful patterns...
          </p>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 rounded-lg p-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {insights.text}
            </p>
          </div>
        </div>
      )}

      {/* Recent Entries */}
      {entries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 rounded-xl shadow-soft-lg p-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Recent Entries
          </h2>
          <div className="space-y-8">
            {entries.slice(0, 5).map(entry => (
              <div key={entry.id} className="border-l-4 border-primary pl-8 py-6 bg-soft-blue dark:bg-gray-900 rounded-r-lg">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-base font-medium text-gray-500 dark:text-gray-400">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {entry.prompt && (
                    <span className="text-sm bg-soft-indigo dark:bg-indigo-900/30 border border-indigo-200 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full font-medium">
                      {entry.prompt.category}
                    </span>
                  )}
                </div>
                {entry.prompt && (
                  <p className="text-base text-primary dark:text-indigo-400 mb-3 italic font-medium">
                    "{entry.prompt.prompt}"
                  </p>
                )}
                <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {entry.content.length > 300 
                    ? `${entry.content.substring(0, 300)}...` 
                    : entry.content}
                </p>
              </div>
            ))}
          </div>
          
          {entries.length > 5 && (
            <button className="mt-8 w-full bg-white dark:bg-gray-900 border-2 border-gray-200 text-gray-700 dark:text-gray-300 py-4 rounded-lg hover:border-primary hover:shadow-soft transition-all font-medium text-lg">
              View All Entries ({entries.length})
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 && showPrompts && (
        <div className="text-center py-16">
          <div className="text-8xl mb-6">📖</div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Start Your Journey
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose a prompt above to begin journaling
          </p>
        </div>
      )}
    </div>
  );
};

export default Journal;