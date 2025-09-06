// Environment configuration for API keys
export const config = {
  // Google Cloud API Configuration
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here',
    model: 'gemini-1.5-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta'
  },
  
  // Vertex AI Configuration (alternative)
  vertexAI: {
    projectId: import.meta.env.VITE_VERTEX_PROJECT_ID || 'your-project-id',
    location: import.meta.env.VITE_VERTEX_LOCATION || 'us-central1',
    apiKey: import.meta.env.VITE_VERTEX_API_KEY || 'your-vertex-api-key'
  },

  // Feature flags
  features: {
    crisisIntervention: true,
    sentimentAnalysis: true,
    voiceChat: false // Future feature
  }
};

export const isConfigured = () => {
  return config.gemini.apiKey !== 'your-gemini-api-key-here';
};