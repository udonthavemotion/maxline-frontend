// Centralized API Configuration
// This file ensures all API calls use the same Strapi instance

export const API_CONFIG = {
  // Multi-layer fallback strategy optimized for cloud deployment
  STRAPI_URL: import.meta.env.PUBLIC_STRAPI_URL || 
              import.meta.env.STRAPI_URL || 
              process.env.PUBLIC_STRAPI_URL ||
              process.env.STRAPI_URL ||
              // Production cloud instance (primary)
              'https://fantastic-thrill-37a105061e.strapiapp.com',
  
  // API Token with cloud-first approach
  STRAPI_TOKEN: import.meta.env.PUBLIC_STRAPI_TOKEN || 
                import.meta.env.STRAPI_TOKEN ||
                process.env.PUBLIC_STRAPI_TOKEN ||
                process.env.STRAPI_TOKEN ||
                // Production cloud token (from screenshot)
                '95c2463acf360b36ce4b0978a3185c76d6ae63b1285afe44e7e6547773e3ff6342d6a234a597cf2ca3d44827',
  
  // GraphQL endpoint
  get GRAPHQL_URL() {
    return `${this.STRAPI_URL}/graphql`;
  },

  // API Base URL for direct fetch calls
  get API_BASE() {
    return `${this.STRAPI_URL}/api`;
  },

  // Image URL helper - handles both Cloudinary and local uploads
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return 'https://placehold.co/400x300?text=No+Image';
    }

    // If it's already an absolute URL (Cloudinary), return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // If it's a relative URL (local uploads), prefix with Strapi URL
    if (imageUrl.startsWith('/')) {
      return `${this.STRAPI_URL}${imageUrl}`;
    }

    // Fallback: assume it's a relative path
    return `${this.STRAPI_URL}/${imageUrl}`;
  }
} as const;

// Development-only debug logging (removed in production)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration (Development):', {
    STRAPI_URL: API_CONFIG.STRAPI_URL,
    HAS_TOKEN: !!API_CONFIG.STRAPI_TOKEN,
    GRAPHQL_URL: API_CONFIG.GRAPHQL_URL,
    API_BASE: API_CONFIG.API_BASE
  });
} else {
  // Production logging for verification
  console.log('🌩️ Cloud Configuration (Production):', {
    STRAPI_URL: API_CONFIG.STRAPI_URL,
    HAS_TOKEN: !!API_CONFIG.STRAPI_TOKEN,
    ENVIRONMENT: 'PRODUCTION'
  });
}

export default API_CONFIG; 