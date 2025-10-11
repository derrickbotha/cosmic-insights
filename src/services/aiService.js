/**
 * AI Service
 * This service handles all interactions with AI models
 */

const { getModelConfig, isModelEnabled, defaultModel } = require('../config/aiModels');

class AIService {
  constructor(modelName = defaultModel) {
    this.setModel(modelName);
  }

  /**
   * Set the AI model to use
   * @param {string} modelName - The name of the model to use
   */
  setModel(modelName) {
    if (!isModelEnabled(modelName)) {
      console.warn(`Model ${modelName} is not enabled. Using default model.`);
      modelName = defaultModel;
    }
    
    this.modelConfig = getModelConfig(modelName);
    this.modelName = modelName;
    console.log(`Using AI model: ${this.modelConfig.name}`);
  }

  /**
   * Generate a response using the configured AI model
   * @param {string} prompt - The prompt to send to the AI model
   * @param {Object} options - Additional options for the request
   * @returns {Promise<string>} - The AI-generated response
   */
  async generateResponse(prompt, options = {}) {
    try {
      // In a real implementation, this would make an API call to the AI provider
      // For now, we'll simulate a response
      console.log(`Sending prompt to ${this.modelConfig.name}...`);
      
      // Combine the default template with the user's prompt
      const promptTemplate = options.template ? 
        this.modelConfig.promptTemplates[options.template] : 
        '';
      
      const fullPrompt = promptTemplate ? 
        `${promptTemplate}\n\n${prompt}` : 
        prompt;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        text: `This is a simulated response from ${this.modelConfig.name}. In production, this would be a real response based on the prompt: "${prompt.substring(0, 50)}..."`,
        model: this.modelConfig.name,
        provider: this.modelConfig.provider,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error(`Failed to generate response from ${this.modelConfig.name}: ${error.message}`);
    }
  }

  /**
   * Generate an astrological profile analysis
   * @param {Object} userData - The user's astrological data
   * @returns {Promise<Object>} - The analysis results
   */
  async generateCosmicProfile(userData) {
    const prompt = `
      Generate a cosmic profile for a user with the following information:
      - Birth date: ${userData.birthDate}
      - Birth time: ${userData.birthTime}
      - Birth location: ${userData.birthLocation}
      - Sun sign: ${userData.sunSign}
      - Moon sign: ${userData.moonSign}
      - Rising sign: ${userData.risingSign}
      
      Include insights about their current life season, hidden lessons, and recurring patterns.
    `;
    
    return this.generateResponse(prompt, { template: 'cosmicProfile' });
  }

  /**
   * Analyze journal entries for patterns and insights
   * @param {Array<Object>} journalEntries - The user's journal entries
   * @param {Object} userData - The user's astrological data
   * @returns {Promise<Object>} - The analysis results
   */
  async analyzeJournalEntries(journalEntries, userData) {
    const entriesText = journalEntries
      .map(entry => `Date: ${entry.date}\nContent: ${entry.content}`)
      .join('\n\n');
    
    const prompt = `
      Analyze the following journal entries and provide insights based on the user's astrological profile:
      
      User astrological data:
      - Sun sign: ${userData.sunSign}
      - Moon sign: ${userData.moonSign}
      - Rising sign: ${userData.risingSign}
      
      Journal entries:
      ${entriesText}
    `;
    
    return this.generateResponse(prompt, { template: 'journalAnalysis' });
  }

  /**
   * Generate goal recommendations aligned with astrological profile
   * @param {Object} userData - The user's astrological data
   * @param {Array<Object>} values - The user's stated values and desires
   * @returns {Promise<Object>} - Goal recommendations and implementation plan
   */
  async generateAlignedGoals(userData, values) {
    const valuesText = values
      .map(value => `- ${value.name}: ${value.description}`)
      .join('\n');
    
    const prompt = `
      Help design an authentic life aligned with the user's values and astrological profile:
      
      User astrological data:
      - Sun sign: ${userData.sunSign}
      - Moon sign: ${userData.moonSign}
      - Rising sign: ${userData.risingSign}
      
      User values:
      ${valuesText}
      
      Create a vision for their aligned life and break it down into trackable goals for the next 6 months.
    `;
    
    return this.generateResponse(prompt, { template: 'goalAlignment' });
  }
}

module.exports = AIService;