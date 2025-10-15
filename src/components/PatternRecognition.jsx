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
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Discover Your Patterns
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Patterns repeat until we see them. Choose a category below to explore the cycles that shape your life.
        </p>
      </div>

      {/* Category Selection */}
      {!selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.keys(patternCategories).map(key => {
            const category = patternCategories[key];
            return (
              <button
                key={key}
                onClick={() => selectCategory(key)}
                className="bg-white dark:bg-gray-800 border border-gray-100 rounded-xl shadow-soft-lg p-8 hover:shadow-soft-xl transition-all transform hover:scale-105 text-left"
              >
                <div className="text-6xl mb-6">{category.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {category.title}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {category.description}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Questions Form */}
      {selectedCategory && !analysis && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 rounded-xl shadow-soft-lg p-10">
          <button
            onClick={() => setSelectedCategory(null)}
            className="mb-8 text-primary dark:text-indigo-400 hover:underline flex items-center gap-2 text-lg font-medium"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to categories
          </button>

          <div className="mb-10">
            <div className="flex items-center gap-6 mb-6">
              <span className="text-6xl">{patternCategories[selectedCategory].icon}</span>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {patternCategories[selectedCategory].title}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {patternCategories[selectedCategory].description}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {patternCategories[selectedCategory].questions.map((question, index) => (
              <div key={question.id} className="border-l-4 border-primary pl-8 py-6">
                <div className="flex items-start mb-5 gap-4">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold text-base flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {question.text}
                    </h3>
                    <p className="text-base text-gray-500 dark:text-gray-400 italic mb-4">
                      Purpose: {question.purpose}
                    </p>
                  </div>
                </div>
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Take your time to reflect deeply on this question..."
                  rows="4"
                  className="w-full px-6 py-5 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg leading-relaxed focus:ring-4 focus:ring-primary/10 focus:border-primary hover:border-gray-300 transition-colors"
                />
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={analyzePatterns}
              disabled={!isFormComplete() || loading}
              className="bg-primary border-2 border-primary hover:shadow-soft-lg text-white font-bold py-4 px-10 rounded-lg text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
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
        <div className="space-y-8">
          <button
            onClick={() => {
              setAnalysis(null);
              setAnswers({});
            }}
            className="text-primary dark:text-indigo-400 hover:underline flex items-center gap-2 text-lg font-medium"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Start new pattern analysis
          </button>

          <div className="bg-soft-indigo border border-indigo-200 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl shadow-soft-lg p-10">
            <div className="flex items-center gap-6 mb-8">
              <span className="text-6xl">{patternCategories[selectedCategory].icon}</span>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  Your {patternCategories[selectedCategory].title} Patterns
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Generated by Claude Sonnet 4 • Powered by your authentic responses
                </p>
              </div>
            </div>

            {/* Primary Pattern */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 rounded-lg p-8 mb-8">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-4">
                <span className="text-3xl">🎯</span>
                Primary Pattern Identified
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Based on your responses, I can see a clear pattern of [Pattern Name]. This began around [Time Period] when [Origin Event]. It shows up in your life as [Manifestations]. The hidden payoff is that this pattern protects you from [Fear/Vulnerability].
                </p>
              </div>
            </div>

            {/* Cycle Timeline */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 rounded-lg p-8 mb-8">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-4">
                <span className="text-3xl">📅</span>
                Cycle Timeline
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="w-28 flex-shrink-0 font-bold text-primary dark:text-indigo-400 text-lg">Stage 1</div>
                  <div className="flex-1 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    <strong>The Setup:</strong> [What triggers the pattern to begin]
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-28 flex-shrink-0 font-bold text-primary dark:text-indigo-400 text-lg">Stage 2</div>
                  <div className="flex-1 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    <strong>The Escalation:</strong> [How it builds momentum]
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-28 flex-shrink-0 font-bold text-primary dark:text-indigo-400 text-lg">Stage 3</div>
                  <div className="flex-1 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    <strong>The Peak:</strong> [When the pattern reaches its climax]
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-28 flex-shrink-0 font-bold text-primary dark:text-indigo-400 text-lg">Stage 4</div>
                  <div className="flex-1 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    <strong>The Reset:</strong> [How you return to baseline before it starts again]
                  </div>
                </div>
              </div>
            </div>

            {/* Root Cause */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 rounded-lg p-8 mb-8">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-4">
                <span className="text-3xl">🌱</span>
                Root Cause Analysis
              </h3>
              <div className="prose dark:prose-invert max-w-none text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                <p>This pattern stems from [Original Wound or Belief]. In your early life, you learned that [Core Belief]. This created a need to [Protective Behavior]. The pattern serves to keep you safe from [Feared Outcome].</p>
              </div>
            </div>

            {/* Cost & Consequence */}
            <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-lg p-8 mb-8">
              <h3 className="text-3xl font-bold text-red-900 dark:text-red-300 mb-6 flex items-center gap-4">
                <span className="text-3xl">⚠️</span>
                The Cost of This Pattern
              </h3>
              <ul className="space-y-4 text-base text-red-800 dark:text-red-400 leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-lg">•</span>
                  <span>Emotionally, it costs you [Emotional Cost]</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-lg">•</span>
                  <span>In relationships, it creates [Relationship Impact]</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-lg">•</span>
                  <span>Career-wise, it limits you by [Career Limitation]</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-lg">•</span>
                  <span>The biggest opportunity cost is [Missed Opportunities]</span>
                </li>
              </ul>
            </div>

            {/* Breaking the Cycle */}
            <div className="bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800 rounded-lg p-8">
              <h3 className="text-3xl font-bold text-green-900 dark:text-green-300 mb-6 flex items-center gap-4">
                <span className="text-3xl">🔓</span>
                Breaking the Cycle
              </h3>
              <div className="space-y-6 text-base text-green-800 dark:text-green-400 leading-relaxed">
                <div>
                  <h4 className="text-xl font-bold mb-3">What Needs to Be Seen:</h4>
                  <p>[Truth that needs acknowledgment]</p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3">New Belief to Install:</h4>
                  <p>[Empowering belief to replace old pattern]</p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3">Interrupt the Pattern:</h4>
                  <p>[Specific action when pattern activates]</p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3">Signs of Success:</h4>
                  <p>[How you'll know you're changing]</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6">
            <button className="bg-white dark:bg-gray-800 border-2 border-primary text-primary dark:text-indigo-400 font-bold py-4 px-8 rounded-lg hover:bg-soft-indigo dark:hover:bg-indigo-900/20 hover:shadow-soft transition-all text-lg">
              Save to Journal
            </button>
            <button className="bg-primary border-2 border-primary hover:shadow-soft-lg text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 text-lg">
              Create Action Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternRecognition;