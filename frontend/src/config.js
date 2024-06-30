// Environment-specific configuration
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000/api',
    APP_NAME: 'Africhama (Dev)',
    DEBUG: true,
  },
  test: {
    API_BASE_URL: 'http://localhost:5000/api',
    APP_NAME: 'Africhama (Test)',
    DEBUG: true,
  },
  production: {
    API_BASE_URL: 'https://api.africhama.com',
    APP_NAME: 'Africhama',
    DEBUG: false,
  },
};

// Default configuration
const defaultConfig = {
  // Token key for local storage
  AUTH_TOKEN_KEY: 'africhama_auth_token',
  
  // Default currency
  CURRENCY: 'USD',
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,
  
  // Subscription levels
  SUBSCRIPTION_LEVELS: ['E', 'P', 'B'],
  
  // Support ticket categories
  SUPPORT_CATEGORIES: [
    'Account Issues',
    'Subscription Problems',
    'Gift System',
    'Network Issues',
    'Other',
  ],

  // Maintenance fee amount
  YEARLY_MAINTENANCE_FEE: 20,

  // Minimum age for registration
  MIN_AGE: 19,

  // Maximum file upload size (in bytes)
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
};

// Merge the environment-specific config with the default config
const mergedConfig = { ...defaultConfig, ...config[env] };

export default mergedConfig;