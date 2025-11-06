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
  }
}

export {};
