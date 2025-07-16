/**
 * Application Configuration
 * Control various features and modes of the application
 */

// Database and AI Configuration
export const CONFIG = {
  // Set to false to disable database suggestions and use AI-only mode
  ENABLE_DATABASE_SUGGESTIONS: false,
  
  // Set to true to enable AI suggestions
  ENABLE_AI_SUGGESTIONS: true,
  
  // Set to true to enable fallback suggestions when AI fails
  ENABLE_FALLBACK_SUGGESTIONS: true,
  
  // AI Configuration
  AI: {
    // Number of AI suggestions to generate in the background
    PRE_GENERATE_COUNT: 5,
    
    // Maximum time to wait for AI generation (in milliseconds)
    MAX_GENERATION_TIME: 20000,
    
    // Maximum attempts for AI generation
    MAX_ATTEMPTS: 3,
    
    // Temperature for AI creativity (0.0 to 1.0)
    TEMPERATURE: 0.7,
    
    // Maximum tokens for AI response
    MAX_TOKENS: 800
  },
  
  // Database Configuration
  DATABASE: {
    // Number of database suggestions to fetch per request
    SUGGESTIONS_PER_REQUEST: 3,
    
    // Enable smart ordering of database suggestions
    ENABLE_SMART_ORDERING: true,
    
    // Enable pagination for database suggestions
    ENABLE_PAGINATION: true
  },
  
  // UI Configuration
  UI: {
    // Show loading skeletons
    SHOW_LOADING_SKELETONS: true,
    
    // Enable animations
    ENABLE_ANIMATIONS: true,
    
    // Show suggestion count
    SHOW_SUGGESTION_COUNT: true
  }
};

// Helper function to check if database suggestions are enabled
export function isDatabaseEnabled() {
  return CONFIG.ENABLE_DATABASE_SUGGESTIONS;
}

// Helper function to check if AI suggestions are enabled
export function isAIEnabled() {
  return CONFIG.ENABLE_AI_SUGGESTIONS;
}

// Helper function to check if fallback suggestions are enabled
export function isFallbackEnabled() {
  return CONFIG.ENABLE_FALLBACK_SUGGESTIONS;
}

// Helper function to get AI configuration
export function getAIConfig() {
  return CONFIG.AI;
}

// Helper function to get database configuration
export function getDatabaseConfig() {
  return CONFIG.DATABASE;
}

// Helper function to get UI configuration
export function getUIConfig() {
  return CONFIG.UI;
}

// Development mode configuration
export const DEV_CONFIG = {
  // Enable debug logging
  DEBUG_LOGGING: true,
  
  // Show detailed error messages
  SHOW_DETAILED_ERRORS: true,
  
  // Enable performance monitoring
  ENABLE_PERFORMANCE_MONITORING: false
};

// Helper function to check if debug logging is enabled
export function isDebugLoggingEnabled() {
  return DEV_CONFIG.DEBUG_LOGGING;
}

// Helper function to check if detailed errors should be shown
export function shouldShowDetailedErrors() {
  return DEV_CONFIG.SHOW_DETAILED_ERRORS;
} 