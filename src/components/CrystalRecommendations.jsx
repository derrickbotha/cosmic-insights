import React, { useState, useEffect } from 'react';
import { analyzeCrystalNeeds, getCrystalInfo, crystalDatabase } from '../config/crystalRecommendations';

const CrystalRecommendations = ({ userData, onNavigate }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [selectedCrystal, setSelectedCrystal] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [focusCategory, setFocusCategory] = useState(userData?.focusCategory || '');

  useEffect(() => {
    if (userData) {
      analyzeUserData();
    }
  }, [userData, focusCategory]);

  const analyzeUserData = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay for better UX
    setTimeout(() => {
      const userDataWithFocus = {
        ...userData,
        focusCategory: focusCategory || userData?.focusCategory
      };
      
      const analysis = analyzeCrystalNeeds(userDataWithFocus);
      setRecommendations(analysis);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleFocusChange = (category) => {
    setFocusCategory(category);
  };

  const handleCrystalClick = (crystal) => {
    const fullInfo = getCrystalInfo(crystal.name);
    setSelectedCrystal({ ...crystal, ...fullInfo });
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Your Profile First
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              To receive personalized crystal recommendations based on your astrological blueprint and life journey, 
              please complete the questionnaire and add some journal entries.
            </p>
            <button 
              onClick={() => onNavigate && onNavigate('questionnaire')}
              className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Start Questionnaire
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-purple-100 dark:bg-purple-900 rounded-2xl mb-4">
            <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your Crystal Recommendations
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Crystals aligned to your planetary energies, emotional patterns, and life focus
          </p>
        </div>

        {/* Focus Category Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            What area of life would you like to focus on?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.keys(crystalDatabase.focusCategories).map(key => {
              const category = crystalDatabase.focusCategories[key];
              const isSelected = focusCategory === key || (!focusCategory && userData?.focusCategory === key);
              
              return (
                <button
                  key={key}
                  onClick={() => handleFocusChange(key)}
                  className={`p-4 rounded-xl font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {key === 'career' && '💼'}
                    {key === 'emotionalHealing' && '💚'}
                    {key === 'spiritualGrowth' && '🌟'}
                    {key === 'creativity' && '🎨'}
                    {key === 'relationships' && '💕'}
                    {key === 'selfWorth' && '✨'}
                  </div>
                  <div className="text-xs">{category.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {isAnalyzing && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-primary mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Analyzing Your Energy
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Identifying crystals that resonate with your unique blueprint...
            </p>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && !isAnalyzing && (
          <>
            {/* Explanation */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Your Energetic Blueprint
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {recommendations.explanation}
              </p>
            </div>

            {/* Primary Crystals */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🔮 Primary Crystals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.primary.slice(0, 6).map((rec, index) => (
                  <div
                    key={index}
                    onClick={() => handleCrystalClick(rec.crystal)}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer p-6 border-2 border-transparent hover:border-primary group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                        💎
                      </div>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                        {rec.category}
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                      {rec.crystal.name}
                    </h4>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {rec.crystal.properties}
                    </p>
                    
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {rec.reason}
                      </p>
                    </div>

                    {rec.crystal.chakra && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        {rec.crystal.chakra} Chakra
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Supportive Crystals */}
            {recommendations.supportive.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  ✨ Supportive Crystals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendations.supportive.map((rec, index) => (
                    <div
                      key={index}
                      onClick={() => handleCrystalClick(rec.crystal)}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-xl transition-all cursor-pointer p-4"
                    >
                      <div className="text-2xl mb-2">💫</div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                        {rec.crystal.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {rec.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rituals */}
            {recommendations.rituals.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  🌙 Suggested Rituals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.rituals.map((ritual, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-xl flex-shrink-0">
                          {index === 0 && '🌅'}
                          {index === 1 && '🌙'}
                          {index === 2 && '🌕'}
                          {index === 3 && '🔮'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                            {ritual.name}
                          </h4>
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            {ritual.timing}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        {ritual.description}
                      </p>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          Crystals to use:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ritual.crystals.map((crystal, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                            >
                              {crystal}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Crystal Care Tips */}
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Crystal Care & Cleansing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">🌊</span>
                    Cleansing
                  </h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <li>• Rinse under running water (except water-sensitive stones)</li>
                    <li>• Smudge with sage or palo santo</li>
                    <li>• Place on selenite charging plate</li>
                    <li>• Bury in earth overnight</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    Charging
                  </h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <li>• Place in sunlight (2-4 hours)</li>
                    <li>• Leave under full moonlight overnight</li>
                    <li>• Set near clear quartz cluster</li>
                    <li>• Use sound (singing bowl, bells)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">💫</span>
                    Programming
                  </h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <li>• Hold crystal in dominant hand</li>
                    <li>• Close your eyes and take 3 deep breaths</li>
                    <li>• State your intention clearly</li>
                    <li>• Visualize intention flowing into crystal</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Crystal Detail Modal */}
        {selectedCrystal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCrystal(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl">
                    💎
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {selectedCrystal.name}
                    </h2>
                    {selectedCrystal.chakra && (
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        {selectedCrystal.chakra} Chakra
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCrystal(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Properties</h3>
                  <p className="text-gray-700 dark:text-gray-300">{selectedCrystal.properties}</p>
                </div>

                {selectedCrystal.use && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">How to Use</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedCrystal.use}</p>
                  </div>
                )}

                {selectedCrystal.planetaryAffinity && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Planetary Affinity</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedCrystal.planetaryAffinity}</p>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Working with this Crystal</h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Carry in your pocket or wear as jewelry to keep its energy close</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Meditate with it placed on the corresponding chakra</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Place on your altar or workspace to infuse the space with its energy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Sleep with it under your pillow for dream work and subconscious healing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrystalRecommendations;
