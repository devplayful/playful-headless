import { WPPost as OriginalWPPost, WPTerm } from '@/services/wordpress';

declare module '@/services/wordpress' {
  interface WPPost extends OriginalWPPost {
    featured_media_url?: string;
    featured_media_alt?: string;
    categories?: WPTerm[];
    tags?: WPTerm[];
    content?: {
      rendered: string;
    };
    excerpt?: {
      rendered: string;
    };
    acf?: ACFSuccessStory;
  }

  interface ACFSuccessStory {
    primerh3desarrollo?: string;
    primerapdesarrollo?: string;
    segundoh3desarrollo?: string;
    segundopdesarrollo?: string;
    tercerh3desarrollo?: string;
    tercerapdesarrollo?: string;
    imagendesarrollo?: string | { url: string };
    grilla1?: string | { url: string; alt?: string; ID?: number; sizes?: { large?: string } };
    grilla2?: string | { url: string; alt?: string; ID?: number; sizes?: { large?: string } };
    grilla3?: string | { url: string; alt?: string; ID?: number; sizes?: { large?: string } };
    grilla4?: string | { url: string; alt?: string; ID?: number; sizes?: { large?: string } };
    grilla5?: string | { url: string; alt?: string; ID?: number; sizes?: { large?: string } };
    grilla6?: string | { url: string; alt?: string; ID?: number; sizes?: { large?: string } };
    grilla7?: string | { url: string; alt?: string; ID?: number; sizes?: { large?: string } };
    grilla8?: string | { url: string; alt?: string; ID?: number; sizes?: { large?: string } };
    grilla1?: string | { url: string };
    grilla2?: string | { url: string };
    grilla3?: string | { url: string };
    grilla4?: string | { url: string };
    grilla5?: string | { url: string };
    grilla6?: string | { url: string };
    grilla7?: string | { url: string };
    grilla8?: string | { url: string };
    // Keep existing ACF fields
    [key: string]: any;
  }
}

export {};
