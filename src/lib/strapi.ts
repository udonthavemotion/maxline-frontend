// Strapi API Configuration - Using centralized config
import { API_CONFIG } from './config';

// Types - Updated for proper Strapi v5 response structure and null handling
export interface StrapiImageAttributes {
  url: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  mime: string; // MIME type (e.g., 'image/jpeg', 'video/mp4')
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

export interface StrapiImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  url: string;
  mime: string;
  size: number;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
  provider?: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Single media field structure (for background_video)
export interface StrapiSingleMedia {
  data?: StrapiImage | null;
}

// Multiple media field structure (for images)
export interface StrapiMultipleMedia {
  data?: StrapiImage[] | null;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface BreedingProgram {
  id: number;
  documentId?: string;
  title: string;
  subtext: string | any[]; // Can be string or blocks array for rich text
  description: string | any[]; // Can be string or blocks array for rich text
  hero_media?: StrapiImage[]; // Array of media (we use first one for background)
  partnership_note: string;
  Featured_IMAGE?: StrapiImage | StrapiImage[]; // Using exact field name from Strapi
  photo_gallery?: StrapiImage[]; // Multiple photos for gallery
  description_long?: string; // Long form description
  // New partnership fields for editable content
  partnership_gallery_title?: string;
  partnership_gallery_description?: any[]; // Blocks rich text (JSON)
  partnership_featured_title?: string;
  partnership_highlights_title?: string;
  partnership_highlights_description?: string;
  partnership_legacy_title?: string;
  partnership_legacy_description?: any[]; // Blocks rich text (JSON)
  partnership_brand_name?: string;
  partnership_theme_enabled?: boolean;
  // Featured image overlay text fields
  partnership_featured_main_title?: string;
  partnership_featured_brand_line?: string;
  partnership_featured_tagline?: string;
  partnership_coming_soon_message?: string; // New field for the "Coming Soon" message
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Puppy {
  id: number;
  documentId: string;
  name: string;
  avaliable: 'Available' | 'Reserved' | 'Sold';
  age?: string;
  price?: number;
  gender?: 'Male' | 'Female';
  description?: string | any[]; // Can be string or blocks array
  healthrecords?: string | any[]; // Can be string or richtext array
  images?: StrapiImage[];
  page_gallery?: StrapiImage[]; // Gallery images for detail page
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Stud {
  id: number;
  documentId: string;
  name: string;
  age?: string;
  availability?: 'Available' | 'Busy' | 'Reserved';
  fee?: number;
  description?: string | any[]; // Can be string or blocks array
  bloodlines?: string;
  specialties?: string;
  images?: StrapiImage[]; // Multiple images for thumbnails in list view
  page_gallery?: StrapiImage[]; // Multiple images/videos for detail page gallery
  background_video?: StrapiImage; // Single video for hero background
  background_color?: string; // Optional hex color
  individuality?: string; // Optional rich text
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Homepage {
  id: number;
  hero_headline: string;
  hero_subheadline: string;
  hero_video: StrapiImage;
  hero_poster_image: StrapiImage;
  featured_section_title: string;
  featured_section_description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  description: string;
  image: StrapiImage;
  alt_text: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface PrivacyPolicy {
  id: number;
  documentId: string;
  title: string;
  content: any[]; // Rich text blocks
  company_logo?: StrapiImage;
  lastupdated: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface TermsOfService {
  id: number;
  documentId: string;
  title: string;
  content: any[]; // Rich text blocks
  company_logo?: StrapiImage;
  lastupdated: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// API Service Class
class StrapiService {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string = API_CONFIG.STRAPI_URL, token: string = API_CONFIG.STRAPI_TOKEN) {
    this.baseURL = baseURL;
    this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Only add authorization header if token exists and is not empty
    if (this.token && this.token.trim() !== '') {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<StrapiResponse<T>> {
    const url = `${this.baseURL}/api${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        console.error(`Strapi API request failed:`, {
          url,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          baseURL: this.baseURL,
          hasToken: !!this.token
        });
        
        // Provide specific error messages based on status code
        if (response.status === 401) {
          throw new Error(`Unauthorized (401): Please check your Strapi API token. Current token: ${this.token ? 'Present' : 'Missing'}`);
        } else if (response.status === 403) {
          throw new Error(`Forbidden (403): Your API token doesn't have permission to access this resource`);
        } else if (response.status === 404) {
          throw new Error(`Not Found (404): The requested resource doesn't exist at ${url}`);
        } else if (response.status >= 500) {
          throw new Error(`Server Error (${response.status}): Strapi server is experiencing issues`);
        } else {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Enhanced error logging with environment info
      console.error('Strapi API request failed:', {
        error: error.message,
        url,
        baseURL: this.baseURL,
        hasToken: !!this.token,
        environment: import.meta.env.MODE
      });
      
      // Re-throw the error for handling by calling code
      throw error;
    }
  }

  // Puppy operations
  async getPuppies(options: {
    page?: number;
    pageSize?: number;
    populate?: string;
    filters?: Record<string, any>;
    sort?: string;
  } = {}): Promise<StrapiResponse<Puppy[]>> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('pagination[page]', options.page.toString());
    if (options.pageSize) params.append('pagination[pageSize]', options.pageSize.toString());
    if (options.populate) params.append('populate', options.populate);
    if (options.sort) params.append('sort', options.sort);
    
    // Handle filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(`filters[${key}][$eq]`, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/puppies${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Puppy[]>(endpoint);
  }

  async getPuppy(documentId: string, populate: string = '*'): Promise<StrapiResponse<Puppy>> {
    return this.request<Puppy>(`/puppies/${documentId}?populate=${populate}`);
  }

  async getAvailablePuppies(): Promise<StrapiResponse<Puppy[]>> {
    return this.getPuppies({
      filters: { status: 'Available' },
      populate: 'images',
      sort: 'createdAt:desc',
    });
  }

  // Stud operations
  async getStuds(options: {
    page?: number;
    pageSize?: number;
    populate?: string;
    filters?: Record<string, any>;
    sort?: string;
  } = {}): Promise<StrapiResponse<Stud[]>> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('pagination[page]', options.page.toString());
    if (options.pageSize) params.append('pagination[pageSize]', options.pageSize.toString());
    if (options.populate) params.append('populate', options.populate);
    if (options.sort) params.append('sort', options.sort);
    
    // Handle filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(`filters[${key}][$eq]`, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/studs${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Stud[]>(endpoint);
  }

  async getStud(documentId: string, populate: string = '*'): Promise<StrapiResponse<Stud>> {
    return this.request<Stud>(`/studs/${documentId}?populate=${populate}`);
  }

  async getAvailableStuds(): Promise<StrapiResponse<Stud[]>> {
    return this.getStuds({
      filters: { status: 'Available' },
      populate: 'images',
      sort: 'createdAt:desc',
    });
  }

  // Homepage operations
  async getHomepageContent(): Promise<StrapiResponse<Homepage>> {
    return this.request<Homepage>('/homepage?populate=*');
  }

  // Breeding Program operations
  async getBreedingProgram(): Promise<StrapiResponse<BreedingProgram>> {
    return this.request<BreedingProgram>('/breeding-program?populate=*');
  }

  // Gallery item operations
  async getGalleryItems(options: {
    page?: number;
    pageSize?: number;
    populate?: string;
    filters?: Record<string, any>;
    sort?: string;
  } = {}): Promise<StrapiResponse<GalleryItem[]>> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('pagination[page]', options.page.toString());
    if (options.pageSize) params.append('pagination[pageSize]', options.pageSize.toString());
    if (options.populate) params.append('populate', options.populate);
    if (options.sort) params.append('sort', options.sort);
    
    // Handle filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(`filters[${key}][$eq]`, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/gallery-items${queryString ? `?${queryString}` : ''}`;
    
    return this.request<GalleryItem[]>(endpoint);
  }

  async getGalleryItem(documentId: string, populate: string = '*'): Promise<StrapiResponse<GalleryItem>> {
    return this.request<GalleryItem>(`/gallery-items/${documentId}?populate=${populate}`);
  }

  // Privacy Policy operations
  async getPrivacyPolicy(): Promise<StrapiResponse<PrivacyPolicy>> {
    return this.request<PrivacyPolicy>('/privacy-policy?populate=*');
  }

  // Terms of Service operations
  async getTermsOfService(): Promise<StrapiResponse<TermsOfService>> {
    return this.request<TermsOfService>('/terms-of-service?populate=*');
  }

  // Site Logo operations - Fetches from privacy policy or terms of service company_logo fields
  async getSiteLogo(): Promise<{ url: string; alt: string }> {
    try {
      // First try privacy policy for company logo
      const privacyResponse = await this.request<PrivacyPolicy>('/privacy-policy?populate=company_logo');
      if (privacyResponse.data?.company_logo) {
        return {
          url: this.getImageUrl(privacyResponse.data.company_logo, 'medium'),
          alt: privacyResponse.data.company_logo.alternativeText || 'Max Line HorrorBullz'
        };
      }
      
      // Fallback to terms of service
      const termsResponse = await this.request<TermsOfService>('/terms-of-service?populate=company_logo');
      if (termsResponse.data?.company_logo) {
        return {
          url: this.getImageUrl(termsResponse.data.company_logo, 'medium'),
          alt: termsResponse.data.company_logo.alternativeText || 'Max Line HorrorBullz'
        };
      }
      
      // Final fallback to static file
      return {
        url: '/logos/MLBlogo2Transparent.png',
        alt: 'Max Line HorrorBullz'
      };
    } catch (error) {
      console.error('Error fetching site logo:', error);
      return {
        url: '/logos/MLBlogo2Transparent.png',
        alt: 'Max Line HorrorBullz'
      };
    }
  }

  // Utility methods - Updated for new type structure with Cloudinary video optimization
  getImageUrl(image: StrapiImage, size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'): string {
    if (!image?.url) {
      return 'https://placehold.co/400x300?text=No+Image';
    }

    let url: string;

    const mime = image.mime || '';

    if (mime.startsWith('image/') && image.formats?.[size]?.url) {
      url = image.formats[size].url;
    } else {
      url = image.url;
    }

    // Enhanced Cloudinary optimization for videos
    if (url.includes('res.cloudinary.com') && mime.startsWith('video/')) {
      // Apply Cloudinary video transformations for better quality and performance
      const cloudinaryOptimizations = 'q_auto:best,f_auto,w_1920,c_limit,fl_progressive';
      
      // Insert transformations into Cloudinary URL
      if (url.includes('/video/upload/')) {
        url = url.replace('/video/upload/', `/video/upload/${cloudinaryOptimizations}/`);
      } else if (url.includes('/upload/')) {
        url = url.replace('/upload/', `/upload/${cloudinaryOptimizations}/`);
      }
      
      console.log('🎬 Optimized video URL:', url);
    }

    // If URL is already a complete URL (Cloudinary), return optimized or as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Otherwise, prefix with Strapi base URL (for local uploads)
    return `${this.baseURL}${url}`;
  }

  isVideo(media: StrapiImage): boolean {
    return !!(media.mime && media.mime.startsWith('video/'));
  }

  isImage(media: StrapiImage): boolean {
    return !!(media.mime && media.mime.startsWith('image/'));
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Convert Strapi blocks (rich text) to HTML
  formatRichText(blocks: any[]): string {
    if (!blocks || !Array.isArray(blocks)) return '';
    
    return blocks.map(block => {
      if (block.type === 'paragraph' && block.children) {
        const content = block.children.map((child: any) => {
          let text = child.text || '';
          if (child.bold) text = `<strong>${text}</strong>`;
          if (child.italic) text = `<em>${text}</em>`;
          if (child.underline) text = `<u>${text}</u>`;
          return text;
        }).join('');
        return `<p>${content}</p>`;
      }
      if (block.type === 'heading' && block.children) {
        const level = block.level || 2;
        const content = block.children.map((child: any) => child.text || '').join('');
        return `<h${level}>${content}</h${level}>`;
      }
      if (block.type === 'list' && block.children) {
        const listItems = block.children.map((item: any) => {
          if (item.children) {
            const content = item.children.map((child: any) => child.text || '').join('');
            return `<li>${content}</li>`;
          }
          return '';
        }).join('');
        const listType = block.format === 'ordered' ? 'ol' : 'ul';
        return `<${listType}>${listItems}</${listType}>`;
      }
      return '';
    }).join('');
  }
}

// Create and export singleton instance
export const strapiService = new StrapiService();

// Export individual functions for convenience
export const getPuppies = (options?: Parameters<typeof strapiService.getPuppies>[0]) => 
  strapiService.getPuppies(options);
export const getPuppy = (documentId: string, populate?: string) => 
  strapiService.getPuppy(documentId, populate);
export const getAvailablePuppies = () => 
  strapiService.getAvailablePuppies();
export const getStuds = (options?: Parameters<typeof strapiService.getStuds>[0]) => 
  strapiService.getStuds(options);
export const getStud = (documentId: string, populate?: string) => 
  strapiService.getStud(documentId, populate);
export const getAvailableStuds = () => 
  strapiService.getAvailableStuds();
export const getHomepageContent = () => 
  strapiService.getHomepageContent();
export const getBreedingProgram = () => 
  strapiService.getBreedingProgram();
export const getGalleryItems = (options?: Parameters<typeof strapiService.getGalleryItems>[0]) => 
  strapiService.getGalleryItems(options);
export const getGalleryItem = (documentId: string, populate?: string) => 
  strapiService.getGalleryItem(documentId, populate);
export const getPrivacyPolicy = () => 
  strapiService.getPrivacyPolicy();
export const getTermsOfService = () => 
  strapiService.getTermsOfService();
export const getSiteLogo = () => 
  strapiService.getSiteLogo();
export const getImageUrl = (image: StrapiImage, size?: 'thumbnail' | 'small' | 'medium' | 'large') => 
  strapiService.getImageUrl(image, size);
export const isVideo = (media: StrapiImage) => 
  strapiService.isVideo(media);
export const isImage = (media: StrapiImage) => 
  strapiService.isImage(media);
export const formatPrice = (price: number) => 
  strapiService.formatPrice(price);
export const formatDate = (dateString: string) => 
  strapiService.formatDate(dateString);
export const formatRichText = (blocks: any[]) => 
  strapiService.formatRichText(blocks);

export default strapiService; 