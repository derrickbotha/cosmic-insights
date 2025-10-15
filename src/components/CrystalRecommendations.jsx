import React, { useState, useEffect } from 'react';
import { analyzeCrystalNeeds, getCrystalInfo, crystalDatabase } from '../config/crystalRecommendations';

const CrystalRecommendations = ({ userData, onNavigate }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [selectedCrystal, setSelectedCrystal] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [focusCategory, setFocusCategory] = useState(userData?.focusCategory || '');

  // Debug logging
  useEffect(() => {
    console.log('CrystalRecommendations mounted/updated');
    console.log('userData:', userData);
    console.log('onNavigate function:', onNavigate);
  }, [userData, onNavigate]);

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
      <div className="min-h-screen bg-white dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 rounded-xl shadow-soft-xl p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-soft-purple border border-purple-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Complete Your Profile First
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto leading-relaxed">
              To receive personalized crystal recommendations based on your astrological blueprint and life journey, 
              please complete the questionnaire and add some journal entries.
            </p>
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <p className="text-sm font-mono text-blue-900">
                <strong>Debug Info:</strong><br/>
                onNavigate function: {onNavigate ? '✅ Exists' : '❌ Missing'}<br/>
                Type: {typeof onNavigate}
              </p>
            </div>
            
            {/* Test button with alert */}
            <button 
              onClick={() => alert('Button is clickable! Check console for navigation logs.')}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-bold mb-4 hover:bg-yellow-600 cursor-pointer"
            >
              🧪 TEST: Click Me First
            </button>
            
            {/* Main navigation button */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                console.log('🔵 BUTTON CLICKED!');
                console.log('🔵 Event:', e);
                console.log('🔵 onNavigate exists?', !!onNavigate);
                console.log('🔵 onNavigate type:', typeof onNavigate);
                
                if (onNavigate) {
                  console.log('✅ Calling onNavigate("questionnaire")...');
                  try {
                    onNavigate('questionnaire');
                    console.log('✅ Navigation call completed!');
                    alert('Navigation function called! Page should change now.');
                  } catch (error) {
                    console.error('❌ Navigation error:', error);
                    alert('ERROR: ' + error.message);
                  }
                } else {
                  console.error('❌ onNavigate function not provided!');
                  alert('ERROR: Navigation function is missing! Check console.');
                }
              }}
              className="px-8 py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold hover:shadow-soft-xl transition-all transform hover:scale-105 cursor-pointer text-lg block mx-auto"
              style={{ zIndex: 1000, position: 'relative' }}
            >
              🚀 Start Questionnaire
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block p-5 bg-soft-purple border border-purple-200 rounded-2xl mb-6">
            <svg className="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Your Crystal Recommendations
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Crystals aligned to your planetary energies, emotional patterns, and life focus
          </p>
        </div>

        {/* Focus Category Selector */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 rounded-xl shadow-soft-lg p-8 mb-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            What area of life would you like to focus on?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.keys(crystalDatabase.focusCategories).map(key => {
              const category = crystalDatabase.focusCategories[key];
              const isSelected = focusCategory === key || (!focusCategory && userData?.focusCategory === key);
              
              return (
                <button
                  key={key}
                  onClick={() => handleFocusChange(key)}
                  className={`p-5 rounded-lg font-medium transition-all transform ${
                    isSelected
                      ? 'bg-primary border-2 border-primary text-white shadow-soft-lg scale-105'
                      : 'bg-white dark:bg-gray-700 border-2 border-gray-200 text-gray-700 dark:text-gray-300 hover:border-primary hover:shadow-soft'
                  }`}
                >
                  <div className="text-3xl mb-3">
                    {key === 'career' && '💼'}
                    {key === 'emotionalHealing' && '💚'}
                    {key === 'spiritualGrowth' && '🌟'}
                    {key === 'creativity' && '🎨'}
                    {key === 'relationships' && '💕'}
                    {key === 'selfWorth' && '✨'}
                  </div>
                  <div className="text-sm">{category.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {isAnalyzing && (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 rounded-xl shadow-soft-xl p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-primary mb-6"></div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Analyzing Your Energy
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Identifying crystals that resonate with your unique blueprint...
            </p>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && !isAnalyzing && (
          <>
            {/* Explanation */}
            <div className="bg-soft-purple border border-purple-200 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-10 mb-10">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Your Energetic Blueprint
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {recommendations.explanation}
              </p>
            </div>

            {/* Primary Crystals */}
            <div className="mb-10">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                🔮 Primary Crystals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.primary.slice(0, 6).map((rec, index) => (
                  <div
                    key={index}
                    onClick={() => handleCrystalClick(rec.crystal)}
                    className="bg-white dark:bg-gray-800 border border-gray-100 rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-all cursor-pointer p-8 border-2 border-transparent hover:border-primary group transform hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 rounded-full bg-soft-purple border border-purple-200 flex items-center justify-center text-3xl">
                        💎
                      </div>
                      <span className="text-sm font-medium px-4 py-2 rounded-full bg-soft-purple border border-purple-200 text-purple-700 dark:text-purple-300">
                        {rec.category}
                      </span>
                    </div>
                    
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                      {rec.crystal.name}
                    </h4>
                    
                    <p className="text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      {rec.crystal.properties}
                    </p>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-base text-gray-700 dark:text-gray-300 font-medium">
                        {rec.reason}
                      </p>
                    </div>

                    {rec.crystal.chakra && (
                      <div className="mt-4 flex items-center gap-3 text-sm text-purple-600 dark:text-purple-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
              <div className="mb-10">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                  ✨ Supportive Crystals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.supportive.map((rec, index) => (
                    <div
                      key={index}
                      onClick={() => handleCrystalClick(rec.crystal)}
                      className="bg-white dark:bg-gray-800 border border-gray-100 rounded-xl shadow-soft hover:shadow-soft-lg transition-all cursor-pointer p-6 transform hover:scale-105"
                    >
                      <div className="text-3xl mb-3">💫</div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {rec.crystal.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {rec.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rituals */}
            {recommendations.rituals.length > 0 && (
              <div className="mb-10">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                  🌙 Suggested Rituals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {recommendations.rituals.map((ritual, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 border border-gray-100 rounded-xl shadow-soft-lg p-8"
                    >
                      <div className="flex items-start gap-5 mb-6">
                        <div className="w-16 h-16 rounded-full bg-soft-indigo border border-indigo-200 flex items-center justify-center text-2xl flex-shrink-0">
                          {index === 0 && '🌅'}
                          {index === 1 && '🌙'}
                          {index === 2 && '🌕'}
                          {index === 3 && '🔮'}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {ritual.name}
                          </h4>
                          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                            {ritual.timing}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                        {ritual.description}
                      </p>

                      <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
                          Crystals to use:
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {ritual.crystals.map((crystal, i) => (
                            <span
                              key={i}
                              className="px-4 py-2 bg-soft-purple border border-purple-200 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
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
            <div className="bg-soft-indigo border border-indigo-200 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-10">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Crystal Care & Cleansing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                    <span className="text-3xl">🌊</span>
                    Cleansing
                  </h4>
                  <ul className="text-base text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
                    <li>• Rinse under running water (except water-sensitive stones)</li>
                    <li>• Smudge with sage or palo santo</li>
                    <li>• Place on selenite charging plate</li>
                    <li>• Bury in earth overnight</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                    <span className="text-3xl">⚡</span>
                    Charging
                  </h4>
                  <ul className="text-base text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
                    <li>• Place in sunlight (2-4 hours)</li>
                    <li>• Leave under full moonlight overnight</li>
                    <li>• Set near clear quartz cluster</li>
                    <li>• Use sound (singing bowl, bells)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                    <span className="text-3xl">💫</span>
                    Programming
                  </h4>
                  <ul className="text-base text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
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
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCrystal(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 border border-gray-100 rounded-xl shadow-soft-xl max-w-2xl w-full p-10 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-soft-purple border border-purple-200 flex items-center justify-center text-4xl">
                    💎
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedCrystal.name}
                    </h2>
                    {selectedCrystal.chakra && (
                      <p className="text-base text-purple-600 dark:text-purple-400 font-medium">
                        {selectedCrystal.chakra} Chakra
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCrystal(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Properties</h3>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{selectedCrystal.properties}</p>
                </div>

                {selectedCrystal.use && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">How to Use</h3>
                    <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{selectedCrystal.use}</p>
                  </div>
                )}

                {selectedCrystal.planetaryAffinity && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Planetary Affinity</h3>
                    <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{selectedCrystal.planetaryAffinity}</p>
                  </div>
                )}

                <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Working with this Crystal</h3>
                  <ul className="space-y-4 text-base text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-purple-600 mt-1 text-lg">•</span>
                      <span>Carry in your pocket or wear as jewelry to keep its energy close</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-600 mt-1 text-lg">•</span>
                      <span>Meditate with it placed on the corresponding chakra</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-600 mt-1 text-lg">•</span>
                      <span>Place on your altar or workspace to infuse the space with its energy</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-600 mt-1 text-lg">•</span>
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
