/**
 * AI Model Configuration
 * This file contains the configuration for all AI models used in the application
 */

const aiModels = {
  // Claude Sonnet 4 configuration
  claudeSonnet4: {
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    version: "4.0",
    enabled: true, // Enable Claude Sonnet 4 for all clients
    contextWindow: 200000, // Maximum context length in tokens
    maxResponseTokens: 4096, // Maximum response length in tokens
    temperature: 0.7, // Default temperature for responses
    topP: 0.9, // Default top-p setting
    features: {
      astrology: true,
      personalInsights: true,
      transitAnalysis: true,
      goalTracking: true,
      patternRecognition: true
    },
    promptTemplates: {
      cosmicProfile: `You are an expert astrologer with deep knowledge of celestial patterns and their influence on human lives.
      Analyze the user's birth chart and current transits to provide personalized insights about:
      - Current season of life (emotional, career, relationship, mental, spiritual aspects)
      - Hidden lessons in this phase
      - Blocking patterns in their progress
      - Recurring cycles that need attention
      - Value conflicts and alignment solutions
      
      Present your analysis in a compassionate, growth-oriented manner.`,
      
      journalAnalysis: `Review the user's journal entries to identify patterns, emotional themes, and growth opportunities.
      Connect these insights with their astrological profile to provide deeper understanding.
      Highlight connections between inner experiences and celestial influences.`,
      
      goalAlignment: `Based on the user's values, desires, and astrological profile, help them design a life that feels authentic.
      Break down this vision into trackable goals that align with their highest potential.
      Provide a practical roadmap for implementation over the next 30 days to 6 months.`
    }
  },
  
  // Add other AI models as needed
  gpt4: {
    name: "GPT-4",
    provider: "OpenAI",
    version: "1.0",
    enabled: false, // Disabled by default
    // Additional configuration...
  }
};

// Default model to use if not specified
const defaultModel = "claudeSonnet4";

// Function to get a specific model configuration
const getModelConfig = (modelName) => {
  return aiModels[modelName] || aiModels[defaultModel];
};

// Function to check if a model is enabled
const isModelEnabled = (modelName) => {
  const model = aiModels[modelName];
  return model && model.enabled === true;
};

// Function to enable a model for all clients
const enableModelForAllClients = (modelName) => {
  if (aiModels[modelName]) {
    aiModels[modelName].enabled = true;
    return true;
  }
  return false;
};

module.exports = {
  aiModels,
  defaultModel,
  getModelConfig,
  isModelEnabled,
  enableModelForAllClients
};