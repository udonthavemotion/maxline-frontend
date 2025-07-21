export interface BreedingProgramAttributes {
  title?: string;
  subtext?: string | any[];
  description?: string | any[];
  hero_media?: {
    data?: Array<{
      id?: number;
      documentId?: string;
      attributes?: {
        url: string;
        alternativeText?: string;
        mime: string;
        width?: number;
        height?: number;
        formats?: {
          thumbnail?: { url: string };
          small?: { url: string };
          medium?: { url: string };
          large?: { url: string };
        };
      };
    }> | null;
  };
  partnership_note?: string;
  photo_gallery?: {
    data?: Array<{
      id?: number;
      documentId?: string;
      attributes?: {
        url: string;
        alternativeText?: string;
        mime: string;
        width?: number;
        height?: number;
        formats?: {
          thumbnail?: { url: string };
          small?: { url: string };
          medium?: { url: string };
          large?: { url: string };
        };
      };
    }> | null;
  };
  description_long?: string;
}

export interface BreedingProgram {
  data?: {
    id?: number;
    documentId?: string;
    attributes?: BreedingProgramAttributes;
  };
}

export interface BreedingProgramResponse {
  data?: BreedingProgram;
} 