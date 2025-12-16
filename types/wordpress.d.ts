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
    // Template selector
    template?: "default" | "soytechno_extended";
    // SoyTechno extended layout
    soytechno?: SoyTechnoData;
    // Keep existing ACF fields
    [key: string]: any;
  }

  // SoyTechno Types
  interface SoyTechnoData {
    seccion_a?: SoyTechnoSeccionA;
    seccion_b?: SoyTechnoSeccionB;
    seccion_c?: SoyTechnoSeccionC;
    seccion_d?: SoyTechnoSeccionD;
    seccion_e?: SoyTechnoSeccionE;
    seccion_f?: SoyTechnoSeccionF;
  }

  interface SoyTechnoSeccionA {
    titulo_de_esta_seccion_a?: string;
    imagen_izquierda?: { url: string; alt?: string };
    titulo_1?: string;
    titulo_2?: string;
    titulo_3?: string;
    titulo_4?: string;
    parrafo1?: string;
    parrafo2?: string;
    parrafo3?: string;
    parrafo4?: string;
  }

  interface SoyTechnoSeccionB {
    titulo_de_la_seccion_b?: string;
    imagenes_collage?: {
      imagen_1?: { url: string; alt?: string; ID?: number };
      imagen_2?: { url: string; alt?: string; ID?: number };
      imagen_3?: { url: string; alt?: string; ID?: number };
      imagen_4?: { url: string; alt?: string; ID?: number };
      imagen_del_telefono?: { url: string; alt?: string; ID?: number };
      imagen_del_logo?: { url: string; alt?: string; ID?: number };
    };
    titulo_1?: string;
    parrafo1?: string;
    titulo_2?: string;
    parrafo2?: string;
    titulo_3?: string;
    parrafo3?: string;
  }

  interface SoyTechnoSeccionC {
    titulo_de_la_seccion_c?: string;
    imagen_izquierda?: { url: string; alt?: string };
    titulo_1?: string;
    parrafo1?: string;
    titulo_2?: string;
    parrafo2?: string;
    titulo_3?: string;
    parrafo3?: string;
    subtitulo_ingenieria?: string;
    parrafo_ingenieria?: string;
    imagen_pantalla_1?: { url: string; alt?: string; ID?: number };
    imagen_pantalla_2?: { url: string; alt?: string; ID?: number };
    imagen_pantalla_3?: { url: string; alt?: string; ID?: number };
    imagen_pantalla_4?: { url: string; alt?: string; ID?: number };
  }

  interface SoyTechnoSeccionD {
    titulo_de_la_seccion_d?: string;
    imagen_derecha?: { url: string; alt?: string };
    titulo_1?: string;
    parrafo1?: string;
    titulo_2?: string;
    parrafo2?: string;
    titulo_3?: string;
    parrafo3?: string;
  }

  interface SoyTechnoSeccionE {
    titulo_de_la_seccion_e?: string;
    imagen_izquierda?: { url: string; alt?: string };
    parrafo?: string;
    titulo_1?: string;
    parrafo1?: string;
    titulo_2?: string;
    parrafo2?: string;
    titulo_3?: string;
    parrafo3?: string;
  }

  interface SoyTechnoSeccionF {
    titulo_de_la_seccion_f?: string;
    imagen_derecha?: { url: string; alt?: string };
    parrafo?: string;
    titulo_1?: string;
    parrafo1?: string;
    titulo_2?: string;
    parrafo2?: string;
  }
}

export {};
