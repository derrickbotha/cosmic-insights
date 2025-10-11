import React, { useState } from 'react';
import patternCategories from '../config/patternCategories';
import AIService from '../services/aiService';

/**
 * PatternRecognition Component
 * Helps users identify and understand recurring patterns
 */
const PatternRecognition = ({ userData }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [answers, setAnswers] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const aiService = new AIService('claudeSonnet4');

  const selectCategory = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setAnswers({});
    setAnalysis(null);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const analyzePatterns = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call the AI service with the pattern analysis prompt
      const response = await aiService.generateResponse(
        `Analyze patterns for category: ${selectedCategory}. User answers: ${JSON.stringify(answers)}`,
        { template: 'recurringPatternsAnalysis' }
      );
      setAnalysis(response);
    } catch (error) {
      console.error('Error analyzing patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFormComplete = () => {
    if (!selectedCategory) return false;
    const category = patternCategories[selectedCategory];
    return category.questions.every(q => answers[q.id] && answers[q.id].trim() !== '');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Discover Your Patterns
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Patterns repeat until we see them. Choose a category below to explore the cycles that shape your life.
        </p>
      </div>

      {/* Category Selection */}
      {!selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.keys(patternCategories).map(key => {
            const category = patternCategories[key];
            return (
              <button
                key={key}
                onClick={() => selectCategory(key)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
              >
                <div className="text-5xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {category.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {category.description}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Questions Form */}
      {selectedCategory && !analysis && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className="mb-6 text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to categories
          </button>

          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className="text-5xl mr-4">{patternCategories[selectedCategory].icon}</span>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {patternCategories[selectedCategory].title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {patternCategories[selectedCategory].description}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {patternCategories[selectedCategory].questions.map((question, index) => (
              <div key={question.id} className="border-l-4 border-indigo-600 pl-6 py-4">
                <div className="flex items-start mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm mr-3 flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {question.text}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-3">
                      Purpose: {question.purpose}
                    </p>
                  </div>
                </div>
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Take your time to reflect deeply on this question..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={analyzePatterns}
              disabled={!isFormComplete() || loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Your Patterns...
                </span>
              ) : (
                'Reveal My Patterns'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          <button
            onClick={() => {
              setAnalysis(null);
              setAnswers({});
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Start new pattern analysis
          </button>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <span className="text-5xl mr-4">{patternCategories[selectedCategory].icon}</span>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Your {patternCategories[selectedCategory].title} Patterns
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Generated by Claude Sonnet 4 • Powered by your authentic responses
                </p>
              </div>
            </div>

            {/* Primary Pattern */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🎯</span>
                Primary Pattern Identified
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300">
                  Based on your responses, I can see a clear pattern of [Pattern Name]. This began around [Time Period] when [Origin Event]. It shows up in your life as [Manifestations]. The hidden payoff is that this pattern protects you from [Fear/Vulnerability].
                </p>
              </div>
            </div>

            {/* Cycle Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">📅</span>
                Cycle Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-24 flex-shrink-0 font-bold text-indigo-600 dark:text-indigo-400">Stage 1</div>
                  <div className="flex-1 text-gray-700 dark:text-gray-300">
                    <strong>The Setup:</strong> [What triggers the pattern to begin]
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-24 flex-shrink-0 font-bold text-indigo-600 dark:text-indigo-400">Stage 2</div>
                  <div className="flex-1 text-gray-700 dark:text-gray-300">
                    <strong>The Escalation:</strong> [How it builds momentum]
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-24 flex-shrink-0 font-bold text-indigo-600 dark:text-indigo-400">Stage 3</div>
                  <div className="flex-1 text-gray-700 dark:text-gray-300">
                    <strong>The Peak:</strong> [When the pattern reaches its climax]
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-24 flex-shrink-0 font-bold text-indigo-600 dark:text-indigo-400">Stage 4</div>
                  <div className="flex-1 text-gray-700 dark:text-gray-300">
                    <strong>The Reset:</strong> [How you return to baseline before it starts again]
                  </div>
                </div>
              </div>
            </div>

            {/* Root Cause */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🌱</span>
                Root Cause Analysis
              </h3>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                <p>This pattern stems from [Original Wound or Belief]. In your early life, you learned that [Core Belief]. This created a need to [Protective Behavior]. The pattern serves to keep you safe from [Feared Outcome].</p>
              </div>
            </div>

            {/* Cost & Consequence */}
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
              <h3 className="text-2xl font-bold text-red-900 dark:text-red-300 mb-4 flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                The Cost of This Pattern
              </h3>
              <ul className="space-y-2 text-red-800 dark:text-red-400">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Emotionally, it costs you [Emotional Cost]</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>In relationships, it creates [Relationship Impact]</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Career-wise, it limits you by [Career Limitation]</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>The biggest opportunity cost is [Missed Opportunities]</span>
                </li>
              </ul>
            </div>

            {/* Breaking the Cycle */}
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-green-900 dark:text-green-300 mb-4 flex items-center">
                <span className="text-2xl mr-3">🔓</span>
                Breaking the Cycle
              </h3>
              <div className="space-y-4 text-green-800 dark:text-green-400">
                <div>
                  <h4 className="font-bold mb-2">What Needs to Be Seen:</h4>
                  <p>[Truth that needs acknowledgment]</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">New Belief to Install:</h4>
                  <p>[Empowering belief to replace old pattern]</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Interrupt the Pattern:</h4>
                  <p>[Specific action when pattern activates]</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Signs of Success:</h4>
                  <p>[How you'll know you're changing]</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button className="bg-white dark:bg-gray-800 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold py-3 px-6 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              Save to Journal
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
              Create Action Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternRecognition;