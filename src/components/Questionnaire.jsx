import React, { useState, useEffect } from 'react';
import { questionnaireData } from '../config/questionnaire';

const Questionnaire = ({ onComplete, initialData, userTier = 'free' }) => {
  const [currentSection, setCurrentSection] = useState(1);
  const [answers, setAnswers] = useState(initialData?.questionnaireAnswers || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Load saved progress from localStorage
  useEffect(() => {
    const savedAnswers = localStorage.getItem('questionnaireAnswers');
    const savedSection = localStorage.getItem('questionnaireCurrentSection');
    const savedCompleted = localStorage.getItem('questionnaireCompleted');
    
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    if (savedSection) {
      setCurrentSection(parseInt(savedSection));
    }
    if (savedCompleted) {
      setCompletedSections(new Set(JSON.parse(savedCompleted)));
    }
  }, []);

  // Save progress to localStorage whenever answers change
  useEffect(() => {
    localStorage.setItem('questionnaireAnswers', JSON.stringify(answers));
    localStorage.setItem('questionnaireCurrentSection', currentSection.toString());
    localStorage.setItem('questionnaireCompleted', JSON.stringify([...completedSections]));
  }, [answers, currentSection, completedSections]);

  const sections = Object.keys(questionnaireData).map(key => ({
    id: parseInt(key.replace('section', '')),
    ...questionnaireData[key]
  }));

  const currentSectionData = sections.find(s => s.id === currentSection);

  const handleInputChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [`section${currentSection}_${questionId}`]: value
    }));
  };

  const getSectionProgress = (sectionId) => {
    const sectionData = sections.find(s => s.id === sectionId);
    if (!sectionData) return 0;

    const answeredCount = sectionData.questions.filter(q => {
      const answer = answers[`section${sectionId}_${q.id}`];
      return answer && answer.trim() !== '';
    }).length;

    return (answeredCount / sectionData.questions.length) * 100;
  };

  const isSectionComplete = (sectionId) => {
    const sectionData = sections.find(s => s.id === sectionId);
    if (!sectionData) return false;

    return sectionData.questions.every(q => {
      const answer = answers[`section${sectionId}_${q.id}`];
      return answer && answer.trim() !== '';
    });
  };

  const handleNextSection = () => {
    if (isSectionComplete(currentSection)) {
      setCompletedSections(prev => new Set([...prev, currentSection]));
      const nextSection = currentSection + 1;
      
      // Check if next section is locked
      if (isSectionLocked(nextSection)) {
        setShowUpgradeModal(true);
        return;
      }
      
      if (currentSection < sections.length) {
        setCurrentSection(nextSection);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      alert('Please answer all questions before proceeding to the next section.');
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSectionClick = (sectionId) => {
    // Check if section is locked for free users
    if (userTier === 'free' && sectionId >= 6) {
      setShowUpgradeModal(true);
      return;
    }
    setCurrentSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSectionLocked = (sectionId) => {
    return userTier === 'free' && sectionId >= 6;
  };

  const handleSubmit = async () => {
    if (!isSectionComplete(currentSection)) {
      alert('Please complete all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    // Process the data
    const processedData = {
      questionnaireAnswers: answers,
      completionDate: new Date().toISOString(),
      astrology: extractAstrologicalData(answers),
      personalHistory: extractPersonalHistory(answers),
      currentState: extractCurrentState(answers)
    };

    // Save to localStorage
    localStorage.setItem('userQuestionnaire', JSON.stringify(processedData));

    // Call parent callback
    if (onComplete) {
      await onComplete(processedData);
    }

    setIsSubmitting(false);
  };

  const extractAstrologicalData = (answers) => {
    return {
      sunSign: answers['section1_1'] || '',
      moonSign: answers['section1_2'] || '',
      risingSign: answers['section1_3'] || '',
      birthDate: answers['section1_4'] || '',
      birthTime: answers['section1_5'] || '',
      birthPlace: answers['section1_6'] || '',
      dominantPlanets: answers['section1_7'] ? answers['section1_7'].split(',').map(p => p.trim()) : []
    };
  };

  const extractPersonalHistory = (answers) => {
    const history = {
      childhood: {},
      adolescence: {},
      adulthood: {}
    };

    // Extract childhood (sections 2-3)
    for (let i = 1; i <= 9; i++) {
      const key = `section2_${i}`;
      if (answers[key]) history.childhood[key] = answers[key];
    }
    for (let i = 1; i <= 9; i++) {
      const key = `section3_${i}`;
      if (answers[key]) history.childhood[key] = answers[key];
    }

    // Extract adolescence (section 4)
    for (let i = 1; i <= 10; i++) {
      const key = `section4_${i}`;
      if (answers[key]) history.adolescence[key] = answers[key];
    }

    // Extract adulthood (sections 5-7)
    for (let i = 1; i <= 10; i++) {
      const key = `section5_${i}`;
      if (answers[key]) history.adulthood[key] = answers[key];
    }
    for (let i = 1; i <= 10; i++) {
      const key = `section6_${i}`;
      if (answers[key]) history.adulthood[key] = answers[key];
    }
    for (let i = 1; i <= 10; i++) {
      const key = `section7_${i}`;
      if (answers[key]) history.adulthood[key] = answers[key];
    }

    return history;
  };

  const extractCurrentState = (answers) => {
    return {
      energetic: answers['section8_1'] || '',
      intuitive: answers['section8_2'] || '',
      currentSnapshot: answers['section9_1'] || '',
      emotionalState: answers['section9_2'] || '',
      lifeSeasonFeeling: answers['section9_3'] || ''
    };
  };

  const totalProgress = () => {
    const completed = [...completedSections].length;
    const current = getSectionProgress(currentSection);
    return ((completed + (current / 100)) / sections.length) * 100;
  };

  if (!currentSectionData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Overall Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Cosmic Profile Questionnaire
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Help us understand your unique astrological and personal journey
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary mb-1">
                {Math.round(totalProgress())}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
            </div>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress()}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sticky top-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Sections</h3>
              <div className="space-y-2">
                {sections.map(section => {
                  const progress = getSectionProgress(section.id);
                  const isComplete = completedSections.has(section.id);
                  const isCurrent = section.id === currentSection;
                  const isLocked = isSectionLocked(section.id);
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      disabled={isLocked}
                      className={`w-full text-left p-3 rounded-xl transition-all relative ${
                        isCurrent
                          ? 'bg-primary text-white shadow-lg'
                          : isComplete
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                          : isLocked
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">Section {section.id}</span>
                        {isLocked ? (
                          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        ) : isComplete ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : null}
                      </div>
                      <div className="text-xs font-medium mb-2 line-clamp-2">
                        {section.title}
                      </div>
                      {isLocked && (
                        <div className="absolute top-2 right-2">
                          <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                            Premium
                          </span>
                        </div>
                      )}
                      <div className="w-full bg-white dark:bg-gray-600 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all ${
                            isCurrent ? 'bg-white' : 'bg-primary'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              {/* Section Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                    {currentSection}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentSectionData.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentSectionData.questions.length} questions
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl">
                  {currentSectionData.description}
                </p>
              </div>

              {/* Questions */}
              <div className="space-y-6 mb-8">
                {currentSectionData.questions.map((question, index) => {
                  const questionKey = `section${currentSection}_${question.id}`;
                  const value = answers[questionKey] || '';

                  return (
                    <div key={question.id} className="group">
                      <label className="block mb-3">
                        <div className="flex items-start gap-3 mb-2">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <span className="text-gray-900 dark:text-white font-medium block">
                              {question.text}
                            </span>
                            {question.subtext && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 block mt-1">
                                {question.subtext}
                              </span>
                            )}
                            {question.examples && (
                              <span className="text-xs text-purple-600 dark:text-purple-400 block mt-1 italic">
                                Examples: {question.examples}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {question.type === 'textarea' ? (
                          <textarea
                            value={value}
                            onChange={(e) => handleInputChange(question.id, e.target.value)}
                            placeholder={question.placeholder || 'Share your thoughts...'}
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:border-primary focus:ring-2 focus:ring-primary/20 
                                     transition-all resize-none
                                     placeholder:text-gray-400 dark:placeholder:text-gray-500"
                          />
                        ) : question.type === 'select' ? (
                          <select
                            value={value}
                            onChange={(e) => handleInputChange(question.id, e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:border-primary focus:ring-2 focus:ring-primary/20 
                                     transition-all"
                          >
                            <option value="">Select an option...</option>
                            {question.options && question.options.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={question.type || 'text'}
                            value={value}
                            onChange={(e) => handleInputChange(question.id, e.target.value)}
                            placeholder={question.placeholder || 'Your answer...'}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:border-primary focus:ring-2 focus:ring-primary/20 
                                     transition-all
                                     placeholder:text-gray-400 dark:placeholder:text-gray-500"
                          />
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handlePreviousSection}
                  disabled={currentSection === 1}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    currentSection === 1
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  ← Previous
                </button>

                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Section {currentSection} of {sections.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {Math.round(getSectionProgress(currentSection))}% complete
                  </div>
                </div>

                {currentSection < sections.length ? (
                  <button
                    onClick={handleNextSection}
                    disabled={!isSectionComplete(currentSection)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      isSectionComplete(currentSection)
                        ? 'bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!isSectionComplete(currentSection) || isSubmitting}
                    className={`px-8 py-3 rounded-xl font-medium transition-all ${
                      isSectionComplete(currentSection) && !isSubmitting
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      '✓ Complete Questionnaire'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Tips Card */}
            <div className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Tips for This Section
              </h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Be as honest and detailed as possible - this helps create a more accurate cosmic profile</li>
                <li>• Your answers are private and used only to generate personalized insights</li>
                <li>• You can save your progress and return anytime - your answers are automatically saved</li>
                <li>• If you're unsure about an answer, write what feels true in this moment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Unlock Deep Insights
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sections 6-9 contain advanced life stage analysis and are available to Premium & Pro members
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">🌟 Free Access Includes:</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>✓ Sections 1-4: Basic Profile & Childhood/Adolescence</li>
                  <li>✓ Dashboard with basic insights</li>
                  <li>✓ 5 AI chat messages per day</li>
                </ul>
              </div>

              <div className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-xl border-2 border-orange-300 dark:border-orange-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">💎 Premium Unlocks:</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>✓ All 9 sections (Early Adulthood → Current Snapshot)</li>
                  <li>✓ Complete life season analysis</li>
                  <li>✓ 25 AI chat messages per day</li>
                  <li>✓ Advanced pattern recognition</li>
                  <li>✓ Personalized crystal recommendations</li>
                </ul>
              </div>

              <div className="p-4 bg-gradient-to-br from-primary/10 to-purple-100 dark:from-primary/20 dark:to-purple-900/20 rounded-xl border-2 border-primary">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">🚀 Pro Includes Everything Plus:</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>✓ 100 AI chat messages per day</li>
                  <li>✓ Priority support</li>
                  <li>✓ Early access to new features</li>
                  <li>✓ Export your cosmic profile</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-all"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  // In a real app, this would redirect to payment page
                  alert('Upgrade feature would redirect to payment page');
                  setShowUpgradeModal(false);
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold hover:shadow-lg transition-all"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
