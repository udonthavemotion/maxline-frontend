// GraphQL API Configuration for Strapi
import { API_CONFIG } from './config';

// GraphQL Types based on your Strapi schema
export interface StrapiImage {
  id: number;
  url: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

export interface Puppy {
  documentId: string;
  name: string;
  status: 'Available' | 'Reserved' | 'Pending';
  date_of_birth: string;
  price: number;
  gender: 'Male' | 'Female';
  color?: string;
  weight?: number;
  description?: string;
  parents?: string;
  healthrecords?: string;
  images?: StrapiImage[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Stud {
  documentId: string;
  name: string;
  age?: string;
  availability: 'Available' | 'Busy' | 'Reserved';
  fee?: number;
  description?: string | any[]; // Can be string or blocks array
  bloodlines?: string;
  specialties?: string;
  images?: StrapiImage[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// GraphQL client class
class GraphQLClient {
  private endpoint: string;
  private token: string;

  constructor(endpoint: string = API_CONFIG.GRAPHQL_URL, token: string = API_CONFIG.STRAPI_TOKEN) {
    this.endpoint = endpoint;
    this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async query<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL request failed:', error);
      throw error;
    }
  }

  async introspectSchema(): Promise<any> {
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType {
            name
            fields {
              name
              type {
                name
                kind
              }
              args {
                name
                type {
                  name
                  kind
                }
              }
            }
          }
        }
      }
    `;

    return this.query(introspectionQuery);
  }
}

const graphqlClient = new GraphQLClient();

// CORRECTED GRAPHQL QUERIES - Using documentId and proper field structure
export const STUDS_QUERY = `
  query GetStuds {
    studs {
      documentId
      name
      age
      status
      fee
      description
      bloodlines
      specialties
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const STUD_QUERY = `
  query GetStud($documentId: ID!) {
    stud(documentId: $documentId) {
      documentId
      name
      age
      status
      fee
      description
      bloodlines
      specialties
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const PUPPIES_QUERY = `
  query GetPuppies {
    puppies {
      documentId
      name
      status
      date_of_birth
      price
      gender
      color
      weight
      description
      parents
      healthrecords
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const PUPPY_QUERY = `
  query GetPuppy($documentId: ID!) {
    puppy(documentId: $documentId) {
      documentId
      name
      status
      date_of_birth
      price
      gender
      color
      weight
      description
      parents
      healthrecords
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

// CORRECTED SERVICE FUNCTIONS
export async function getStuds(): Promise<{ data: Stud[]; meta: any }> {
  try {
    const result = await graphqlClient.query(STUDS_QUERY);
    return {
      data: result.studs || [],
      meta: { pagination: { total: result.studs?.length || 0 } }
    };
  } catch (error) {
    console.error('Failed to fetch studs:', error);
    // Return empty result instead of throwing to prevent page crashes
    return {
      data: [],
      meta: { pagination: { total: 0 } }
    };
  }
}

export async function getStud(documentId: string): Promise<Stud | null> {
  try {
    const result = await graphqlClient.query(STUD_QUERY, { documentId });
    return result.stud || null;
  } catch (error) {
    console.error('Failed to fetch stud:', error);
    return null;
  }
}

export async function getAvailableStuds(): Promise<{ data: Stud[]; meta: any }> {
  const result = await getStuds();
  const availableStuds = result.data.filter(stud => stud.availability === 'Available');
  return {
    data: availableStuds,
    meta: { pagination: { total: availableStuds.length } }
  };
}

export async function getPuppies(): Promise<{ data: Puppy[]; meta: any }> {
  try {
    const result = await graphqlClient.query(PUPPIES_QUERY);
    return {
      data: result.puppies || [],
      meta: { pagination: { total: result.puppies?.length || 0 } }
    };
  } catch (error) {
    console.error('Failed to fetch puppies:', error);
    // Return empty result instead of throwing to prevent page crashes
    return {
      data: [],
      meta: { pagination: { total: 0 } }
    };
  }
}

export async function getPuppy(documentId: string): Promise<Puppy | null> {
  try {
    const result = await graphqlClient.query(PUPPY_QUERY, { documentId });
    return result.puppy || null;
  } catch (error) {
    console.error('Failed to fetch puppy:', error);
    return null;
  }
}

export async function getAvailablePuppies(): Promise<{ data: Puppy[]; meta: any }> {
  const result = await getPuppies();
  const availablePuppies = result.data.filter(puppy => puppy.status === 'Available');
  return {
    data: availablePuppies,
    meta: { pagination: { total: availablePuppies.length } }
  };
}

// Utility functions
export function getImageUrl(image: StrapiImage, size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'): string {
  if (image.formats && image.formats[size]) {
    return API_CONFIG.getImageUrl(image.formats[size]!.url);
  }
  return API_CONFIG.getImageUrl(image.url);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Convert Strapi blocks (rich text) to plain text
export function formatRichText(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  return blocks.map(block => {
    if (block.type === 'paragraph' && block.children) {
      return block.children.map((child: any) => child.text || '').join('');
    }
    if (block.type === 'heading' && block.children) {
      return block.children.map((child: any) => child.text || '').join('');
    }
    if (block.type === 'list' && block.children) {
      return block.children.map((item: any) => {
        if (item.children) {
          return '• ' + item.children.map((child: any) => child.text || '').join('');
        }
        return '';
      }).join('\n');
    }
    return '';
  }).join('\n').trim();
}

export { graphqlClient };

export async function introspectSchema() {
  return graphqlClient.introspectSchema();
} 