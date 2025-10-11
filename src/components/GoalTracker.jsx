import React, { useState, useEffect } from 'react';
import AIService from '../services/aiService';

/**
 * GoalTracker Component
 * Tracks goals aligned with astrological insights and life vision
 */
const GoalTracker = ({ userData }) => {
  const [goals, setGoals] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: '',
    why: '',
    timeline: '30',
    milestones: [''],
    metrics: ''
  });
  const aiService = new AIService('claudeSonnet4');

  const categories = [
    { id: 'mindfulness', name: 'Mindfulness & Presence', icon: '🧘', color: 'purple' },
    { id: 'career', name: 'Career & Purpose', icon: '💼', color: 'blue' },
    { id: 'relationships', name: 'Relationships', icon: '❤️', color: 'red' },
    { id: 'health', name: 'Health & Vitality', icon: '🏥', color: 'green' },
    { id: 'financial', name: 'Financial Freedom', icon: '💰', color: 'yellow' },
    { id: 'personal', name: 'Personal Growth', icon: '🌱', color: 'teal' },
    { id: 'creative', name: 'Creative Expression', icon: '🎨', color: 'pink' },
    { id: 'spiritual', name: 'Spiritual Connection', icon: '✨', color: 'indigo' }
  ];

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    const savedGoals = JSON.parse(localStorage.getItem('userGoals') || '[]');
    setGoals(savedGoals);
  };

  const addMilestone = () => {
    setNewGoal(prev => ({
      ...prev,
      milestones: [...prev.milestones, '']
    }));
  };

  const updateMilestone = (index, value) => {
    const updatedMilestones = [...newGoal.milestones];
    updatedMilestones[index] = value;
    setNewGoal(prev => ({
      ...prev,
      milestones: updatedMilestones
    }));
  };

  const removeMilestone = (index) => {
    setNewGoal(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const saveGoal = () => {
    const goal = {
      id: Date.now(),
      ...newGoal,
      createdAt: new Date().toISOString(),
      progress: 0,
      completedMilestones: [],
      status: 'active'
    };

    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
    
    setShowCreateForm(false);
    setNewGoal({
      title: '',
      category: '',
      why: '',
      timeline: '30',
      milestones: [''],
      metrics: ''
    });
  };

  const updateGoalProgress = (goalId, progress) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, progress } : goal
    );
    setGoals(updatedGoals);
    localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
  };

  const toggleMilestone = (goalId, milestoneIndex) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const completedMilestones = [...goal.completedMilestones];
        const index = completedMilestones.indexOf(milestoneIndex);
        
        if (index > -1) {
          completedMilestones.splice(index, 1);
        } else {
          completedMilestones.push(milestoneIndex);
        }
        
        const progress = Math.round((completedMilestones.length / goal.milestones.length) * 100);
        
        return { ...goal, completedMilestones, progress };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : 'gray';
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '🎯';
  };

  const getColorClasses = (color) => {
    const colors = {
      purple: 'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300',
      blue: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300',
      red: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300',
      green: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300',
      teal: 'bg-teal-100 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-300',
      pink: 'bg-pink-100 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700 text-pink-800 dark:text-pink-300',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300'
    };
    return colors[color] || 'bg-gray-100 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-300';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Goal Tracker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track progress on goals aligned with your authentic self
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Goal
        </button>
      </div>

      {/* Create Goal Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Goal</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Goal Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setNewGoal(prev => ({ ...prev, category: cat.id }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      newGoal.category === cat.id
                        ? getColorClasses(cat.color)
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <div className="text-sm font-medium">{cat.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What's your goal? (Be specific)
              </label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Meditate for 15 minutes every morning"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              />
            </div>

            {/* Why */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Why does this matter to you? (Connect to your values)
              </label>
              <textarea
                value={newGoal.why}
                onChange={(e) => setNewGoal(prev => ({ ...prev, why: e.target.value }))}
                placeholder="This goal matters because..."
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              />
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeline
              </label>
              <select
                value={newGoal.timeline}
                onChange={(e) => setNewGoal(prev => ({ ...prev, timeline: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              >
                <option value="30">30 Days</option>
                <option value="90">90 Days (3 Months)</option>
                <option value="180">6 Months</option>
                <option value="365">1 Year</option>
              </select>
            </div>

            {/* Milestones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Milestones (Break it down into steps)
              </label>
              <div className="space-y-3">
                {newGoal.milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={milestone}
                      onChange={(e) => updateMilestone(index, e.target.value)}
                      placeholder={`Milestone ${index + 1}`}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                    />
                    {newGoal.milestones.length > 1 && (
                      <button
                        onClick={() => removeMilestone(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addMilestone}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
                >
                  + Add Milestone
                </button>
              </div>
            </div>

            {/* Success Metrics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How will you measure success?
              </label>
              <input
                type="text"
                value={newGoal.metrics}
                onChange={(e) => setNewGoal(prev => ({ ...prev, metrics: e.target.value }))}
                placeholder="e.g., Track daily in journal, weekly review"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveGoal}
                disabled={!newGoal.title || !newGoal.category}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length > 0 && (
        <div className="space-y-6">
          {goals.map(goal => (
            <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start flex-1">
                  <span className="text-4xl mr-4">{getCategoryIcon(goal.category)}</span>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {goal.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {goal.why}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>⏱️ {goal.timeline} days</span>
                      <span>📊 {goal.metrics}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColorClasses(getCategoryColor(goal.category))}`}>
                  {goal.progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Milestones</h4>
                {goal.milestones.map((milestone, index) => (
                  <label
                    key={index}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={goal.completedMilestones.includes(index)}
                      onChange={() => toggleMilestone(goal.id, index)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-600 mr-3"
                    />
                    <span className={`flex-1 ${
                      goal.completedMilestones.includes(index)
                        ? 'line-through text-gray-500 dark:text-gray-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {milestone}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ready to Set Goals?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Click "New Goal" to start tracking your progress
          </p>
        </div>
      )}
    </div>
  );
};

export default GoalTracker;