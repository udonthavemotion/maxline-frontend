// Centralized API Configuration
// This file ensures all API calls use the same Strapi instance

// Based on your logs, your Strapi Cloud URL is:
// https://majestic-love-3852ac722d.media.strapiapp.com

export const API_CONFIG = {
  // Primary Strapi URL - Will use environment variables or fall back to localhost for development
  STRAPI_URL: import.meta.env.STRAPI_URL || 
              import.meta.env.PUBLIC_STRAPI_URL || 
              'http://localhost:1337', // Fallback to localhost for development
  
  // API Token for authentication
  STRAPI_TOKEN: import.meta.env.STRAPI_TOKEN || 
                import.meta.env.PUBLIC_STRAPI_TOKEN || 
                '',
  
  // GraphQL endpoint
  get GRAPHQL_URL() {
    return `${this.STRAPI_URL}/graphql`;
  },
  
  // API endpoints
  get API_BASE() {
    return `${this.STRAPI_URL}/api`;
  },
  
  // Helper method to get full image URL
  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path; // Already a full URL (Cloudinary, etc.)
    }
    return `${this.STRAPI_URL}${path}`; // Local Strapi upload
  }
};

// Environment validation
if (import.meta.env.PROD && (!API_CONFIG.STRAPI_URL || API_CONFIG.STRAPI_URL.includes('localhost'))) {
  console.warn('⚠️ Production build detected but Strapi URL is not configured for production.');
  console.warn('Please set STRAPI_URL environment variable to your Strapi Cloud URL.');
}

// Debug logging in development
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    STRAPI_URL: API_CONFIG.STRAPI_URL,
    HAS_TOKEN: !!API_CONFIG.STRAPI_TOKEN,
    GRAPHQL_URL: API_CONFIG.GRAPHQL_URL
  });
} 