const WORDPRESS_API_URL = 'https://endpoint.playfulagency.com/wp-json';

export interface YoastMetaData {
  yoast_wpseo_title: string;
  yoast_wpseo_metadesc: string;
  yoast_wpseo_canonical?: string;
  yoast_wpseo_og_title?: string;
  yoast_wpseo_og_description?: string;
  yoast_wpseo_og_image?: string;
}

export async function getHomePageMetadata(): Promise<YoastMetaData> {
  try {
    console.log('Iniciando petición a WordPress...');
    const apiUrl = `${WORDPRESS_API_URL}/wp/v2/pages?slug=home-2&_fields=yoast_head`;
    console.log('URL de la API:', apiUrl);
    
    const response = await fetch(apiUrl, { 
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Respuesta recibida. Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta:', errorText);
      throw new Error(`Error al obtener los metadatos: ${response.status} ${response.statusText}`);
    }

    const [homePage] = await response.json();
    
    if (!homePage || !homePage.yoast_head) {
      console.error('No hay yoast_head en la respuesta');
      throw new Error('No se encontraron metadatos de Yoast en la página de inicio');
    }

    // Extraer el título
    const titleMatch = homePage.yoast_head.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'Playful Agency';
    
    // Función para extraer contenido de meta tags
    const getMetaContent = (html: string, name: string): string => {
      // Primero buscamos con comillas dobles
      let regex = new RegExp(`<meta[^>]*(?:name|property)="${name}"[^>]*content="([^"]*)"`);
      let match = html.match(regex);
      
      // Si no encontramos, buscamos con comillas simples
      if (!match) {
        regex = new RegExp(`<meta[^>]*(?:name|property)='${name}'[^>]*content='([^']*)'`);
        match = html.match(regex);
      }
      
      return match ? match[1] : '';
    };

    const metadata = {
      yoast_wpseo_title: title,
      yoast_wpseo_metadesc: getMetaContent(homePage.yoast_head, 'description'),
      yoast_wpseo_canonical: getMetaContent(homePage.yoast_head, 'canonical'),
      yoast_wpseo_og_title: getMetaContent(homePage.yoast_head, 'og:title'),
      yoast_wpseo_og_description: getMetaContent(homePage.yoast_head, 'og:description'),
      yoast_wpseo_og_image: getMetaContent(homePage.yoast_head, 'og:image'),
    };

    console.log('Metadatos extraídos:', JSON.stringify(metadata, null, 2));
    return metadata;
    
  } catch (error) {
    console.error('Error en getHomePageMetadata:', error);
    return {
      yoast_wpseo_title: 'Playful Agency',
      yoast_wpseo_metadesc: 'Agencia de marketing digital y desarrollo web',
      yoast_wpseo_canonical: '',
      yoast_wpseo_og_title: '',
      yoast_wpseo_og_description: '',
      yoast_wpseo_og_image: ''
    };
  }
}

export async function getPageMetadataBySlug(slug: string): Promise<YoastMetaData> {
  try {
    console.log(`Iniciando petición para obtener metadatos de la página: ${slug}`);
    const apiUrl = `${WORDPRESS_API_URL}/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=yoast_head`;
    console.log('URL de la API:', apiUrl);
    
    const response = await fetch(apiUrl, { 
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Respuesta recibida. Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta:', errorText);
      throw new Error(`Error al obtener los metadatos: ${response.status} ${response.statusText}`);
    }

    const [pageData] = await response.json();
    
    if (!pageData || !pageData.yoast_head) {
      console.error('No hay yoast_head en la respuesta');
      throw new Error(`No se encontraron metadatos de Yoast para la página: ${slug}`);
    }

    // Extraer el título
    const titleMatch = pageData.yoast_head.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'Playful Agency';
    
    // Función para extraer contenido de meta tags (reutilizada de getHomePageMetadata)
    const getMetaContent = (html: string, name: string): string => {
      // Primero buscamos con comillas dobles
      let regex = new RegExp(`<meta[^>]*(?:name|property)="${name}"[^>]*content="([^"]*)"`);
      let match = html.match(regex);
      
      // Si no encontramos, buscamos con comillas simples
      if (!match) {
        regex = new RegExp(`<meta[^>]*(?:name|property)='${name}'[^>]*content='([^']*)'`);
        match = html.match(regex);
      }
      
      return match ? match[1] : '';
    };

    const metadata = {
      yoast_wpseo_title: title,
      yoast_wpseo_metadesc: getMetaContent(pageData.yoast_head, 'description'),
      yoast_wpseo_canonical: getMetaContent(pageData.yoast_head, 'canonical'),
      yoast_wpseo_og_title: getMetaContent(pageData.yoast_head, 'og:title'),
      yoast_wpseo_og_description: getMetaContent(pageData.yoast_head, 'og:description'),
      yoast_wpseo_og_image: getMetaContent(pageData.yoast_head, 'og:image'),
    };

    console.log(`Metadatos extraídos para ${slug}:`, JSON.stringify(metadata, null, 2));
    return metadata;
    
  } catch (error) {
    console.error(`Error en getPageMetadataBySlug para ${slug}:`, error);
    return {
      yoast_wpseo_title: `Playful Agency - ${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      yoast_wpseo_metadesc: 'Agencia de marketing digital y desarrollo web',
      yoast_wpseo_canonical: '',
      yoast_wpseo_og_title: '',
      yoast_wpseo_og_description: '',
      yoast_wpseo_og_image: ''
    };
  }
}

// Interfaz para los ítems del menú
export interface MenuItem {
  title: string;
  slug: string;
  children?: MenuItem[];
}

// Datos del menú (puedes mover esto a un archivo de configuración separado si lo prefieres)
export const menuItems: MenuItem[] = [
  {
    title: 'Inicio',
    slug: 'home-2'
  },
  {
    title: 'Servicios',
    slug: 'services',
    children: [
      { title: 'Agencia E-commerce', slug: 'agencia-e-commerce' },
      { title: 'Agencia de Diseño Web', slug: 'agencia-diseno-web' },
      { title: 'Marketing Internacional', slug: 'marketing-internacional' },
      { title: 'Agencia SEO', slug: 'agencia-seo' },
      { title: 'Agencia UX/UI', slug: 'agencia-ux-ui' },
      { title: 'Agencia SEM', slug: 'agencia-sem' },
      { title: 'SEO Expertos', slug: 'seo-expertos' },
      { title: 'SEO Vigo', slug: 'seo-vigo' }
    ]
  },
  {
    title: 'Casos de Éxito',
    slug: 'casos-de-exito-agencia-de-marketing-digital',
    children: [
      { title: 'Policlínica Metropolitana', slug: 'policlinica-metropolitana' },
      { title: 'Mercantil Servicios Financieros', slug: 'mercantil-servicios-financieros-internacional' },
      { title: 'Grupo Automotriz Multimarca', slug: 'grupo-automotriz-multimarca' }
    ]
  },
  {
    title: 'Nosotros',
    slug: 'nosotros'
  },
  {
    title: 'Blog',
    slug: 'blog'
  },
  {
    title: 'Contacto',
    slug: 'contactar-agencia-de-marketing-digital'
  }
];

// Interfaces para los posts del blog
export interface WPTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
}

export interface WPFeaturedMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    sizes: {
      [key: string]: {
        source_url: string;
        width: number;
        height: number;
      };
    };
  };
}

export interface WPPost {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: WPFeaturedMedia[];
    'wp:term'?: WPTerm[][];
  };
  featured_media?: number;
}

/**
 * Obtiene las últimas entradas del blog
 * @param perPage Número de entradas a devolver (máx 10)
 */
interface WPFeaturedMedia {
  source_url: string;
  media_details: {
    sizes: {
      [key: string]: {
        source_url: string;
      };
    };
  };
}

interface WPPost {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  date: string;
  slug: string;
  link: string;
  _embedded?: {
    'wp:featuredmedia'?: WPFeaturedMedia[];
    'wp:term'?: any[][];
  };
}

export async function getLatestBlogPosts(perPage: number = 3): Promise<Array<{
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string;
  slug: string;
  link: string;
}>> {
  try {
    const url = new URL(`${WORDPRESS_API_URL}/wp/v2/posts`);
    url.searchParams.append('_embed', 'wp:featuredmedia,wp:term');
    url.searchParams.append('per_page', Math.min(perPage, 10).toString());
    url.searchParams.append('orderby', 'date');
    url.searchParams.append('order', 'desc');
    
    console.log('Fetching posts from:', url.toString());

    const response = await fetch(url.toString(), { 
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener las entradas del blog: ${response.status}`);
    }

    const posts: WPPost[] = await response.json();

    return posts.map(post => {
      // Obtener categoría principal
      let category = 'Sin categoría';
      const categories = post._embedded?.['wp:term']?.[0]?.filter(t => t.taxonomy === 'category');
      if (categories && categories.length > 0) {
        category = categories[0].name;
      }

      // Obtener imagen destacada
      let imageUrl = '/images/blog/placeholder.jpg';
      const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
      
      if (featuredMedia) {
        // Intentar obtener la imagen en diferentes tamaños, con prioridad al tamaño completo
        imageUrl = featuredMedia.source_url || 
                  featuredMedia.media_details?.sizes?.full?.source_url ||
                  featuredMedia.media_details?.sizes?.large?.source_url ||
                  featuredMedia.media_details?.sizes?.medium_large?.source_url ||
                  featuredMedia.media_details?.sizes?.medium?.source_url ||
                  imageUrl;
        
        console.log('Featured image found for post', post.id, ':', imageUrl);
      } else {
        console.log('No featured image found for post:', post.id);
      }

      // Formatear fecha
      const date = new Date(post.date);
      const formattedDate = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).split('/').join(' / ');

      // Limpiar excerpt de etiquetas HTML
      const excerpt = post.excerpt.rendered
        .replace(/<[^>]*>?/gm, '')
        .replace(/&[a-z]+;/g, '')
        .trim();

      return {
        id: post.id,
        title: post.title.rendered.replace(/&[a-z]+;/g, ''),
        excerpt: excerpt.length > 100 ? excerpt.substring(0, 100) + '...' : excerpt,
        category,
        date: formattedDate,
        imageUrl,
        slug: post.slug,
        link: post.link
      };
    });
  } catch (error) {
    console.error('Error en getLatestBlogPosts:', error);
    return [];
  }
}

/**
 * Obtiene una entrada del blog por su slug
 * @param slug Slug de la entrada
 * @returns Promise con el post o null si no se encuentra
 */
export async function getBlogPostBySlug(slug: string): Promise<WPPost | null> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia,wp:term`,
      { 
        next: { revalidate: 60 },
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener el post: ${response.status} ${response.statusText}`);
    }

    const posts: WPPost[] = await response.json();
    return posts[0] || null;
  } catch (error) {
    console.error('Error en getBlogPostBySlug:', error);
    return null;
  }
}

// Interface para miembros del equipo
export interface TeamMember {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  cargo?: number[];  // IDs de cargos (opcional)
  rol?: number[];    // IDs de roles (opcional)
  acf: {
    informacion?: {
      linkedin_imagen?: string;
      linkedin_url?: string;
      email?: string;
    };
    nombre?: string;
    cargo?: string;  // Nombre del cargo como string (opcional)
    cargoIds?: number[]; // IDs de cargos (alternativa)
    habilidades: string[];
    descripcion: string;
    linkedin_url: string;
    imagen: {
      url: string;
      alt: string;
    };
  };
  _embedded?: {
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
      taxonomy: string;
    }>>;
    'wp:featuredmedia'?: WPFeaturedMedia[];
  };
  // Las propiedades cargo y rol están definidas arriba como opcionales
}

// Interfaces específicas para podcasts
export interface PodcastEpisode {
  id: number;
  date: string;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_media?: number;
  featured_media_url?: string | null;
  featured_media_alt?: string;
  categoria?: number[];
  etiqueta?: number[];
  yoast_head?: string;
  yoast_head_json?: {
    title: string;
    description: string;
    canonical?: string;
    og_title?: string;
    og_description?: string;
    og_image?: Array<{
      url: string;
      width: number;
      height: number;
    }>;
  };
  _embedded?: {
    'wp:featuredmedia'?: WPFeaturedMedia[];
    'wp:term'?: WPTerm[][];
  };
}

/**
 * Obtiene los metadatos de la página principal de podcast
 */
export async function getPodcastPageMetadata(): Promise<YoastMetaData> {
  try {
    console.log('Iniciando petición para obtener metadatos de la página podcast...');
    const apiUrl = `${WORDPRESS_API_URL}/wp/v2/pages?slug=podcast&_fields=yoast_head`;
    console.log('URL de la API:', apiUrl);
    
    const response = await fetch(apiUrl, { 
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Respuesta recibida. Status:', response.status);
    
    if (!response.ok) {
      console.error('Error en la respuesta:', response.status);
      // Si no existe la página, devolvemos metadatos por defecto
      return {
        yoast_wpseo_title: 'Podcast - Bendita Web | Playful Agency',
        yoast_wpseo_metadesc: 'Escucha nuestro podcast Bendita Web donde hablamos de marketing digital, SEO, desarrollo web y más.',
        yoast_wpseo_canonical: 'https://endpoint.playfulagency.com/podcast/',
        yoast_wpseo_og_title: 'Podcast - Bendita Web | Playful Agency',
        yoast_wpseo_og_description: 'Escucha nuestro podcast Bendita Web donde hablamos de marketing digital, SEO, desarrollo web y más.',
        yoast_wpseo_og_image: ''
      };
    }

    const [podcastPage] = await response.json();
    
    if (!podcastPage || !podcastPage.yoast_head) {
      console.error('No hay yoast_head en la respuesta para podcast');
      return {
        yoast_wpseo_title: 'Podcast - Bendita Web | Playful Agency',
        yoast_wpseo_metadesc: 'Escucha nuestro podcast Bendita Web donde hablamos de marketing digital, SEO, desarrollo web y más.',
        yoast_wpseo_canonical: 'https://endpoint.playfulagency.com/podcast/',
        yoast_wpseo_og_title: 'Podcast - Bendita Web | Playful Agency',
        yoast_wpseo_og_description: 'Escucha nuestro podcast Bendita Web donde hablamos de marketing digital, SEO, desarrollo web y más.',
        yoast_wpseo_og_image: ''
      };
    }

    // Extraer el título
    const titleMatch = podcastPage.yoast_head.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'Podcast - Bendita Web | Playful Agency';
    
    // Función para extraer contenido de meta tags
    const getMetaContent = (html: string, name: string): string => {
      let regex = new RegExp(`<meta[^>]*(?:name|property)="${name}"[^>]*content="([^"]*)"`);
      let match = html.match(regex);
      
      if (!match) {
        regex = new RegExp(`<meta[^>]*(?:name|property)='${name}'[^>]*content='([^']*)'`);
        match = html.match(regex);
      }
      
      return match ? match[1] : '';
    };

    const metadata = {
      yoast_wpseo_title: title,
      yoast_wpseo_metadesc: getMetaContent(podcastPage.yoast_head, 'description'),
      yoast_wpseo_canonical: getMetaContent(podcastPage.yoast_head, 'canonical'),
      yoast_wpseo_og_title: getMetaContent(podcastPage.yoast_head, 'og:title'),
      yoast_wpseo_og_description: getMetaContent(podcastPage.yoast_head, 'og:description'),
      yoast_wpseo_og_image: getMetaContent(podcastPage.yoast_head, 'og:image'),
    };

    console.log('Metadatos extraídos para podcast:', JSON.stringify(metadata, null, 2));
    return metadata;
    
  } catch (error) {
    console.error('Error en getPodcastPageMetadata:', error);
    return {
      yoast_wpseo_title: 'Podcast - Bendita Web | Playful Agency',
      yoast_wpseo_metadesc: 'Escucha nuestro podcast Bendita Web donde hablamos de marketing digital, SEO, desarrollo web y más.',
      yoast_wpseo_canonical: 'https://endpoint.playfulagency.com/podcast/',
      yoast_wpseo_og_title: 'Podcast - Bendita Web | Playful Agency',
      yoast_wpseo_og_description: 'Escucha nuestro podcast Bendita Web donde hablamos de marketing digital, SEO, desarrollo web y más.',
      yoast_wpseo_og_image: ''
    };
  }
}

/**
 * Obtiene los episodios del podcast paginados
 */
export async function getPodcastEpisodes(page: number = 1, perPage: number = 10): Promise<{ episodes: PodcastEpisode[], totalPages: number }> {
  try {
    console.log(`Obteniendo episodios de podcast - Página: ${page}, Por página: ${perPage}`);
    
    const response = await fetch(
      `${WORDPRESS_API_URL}/wp/v2/podcast?_embed=wp:featuredmedia,wp:term&per_page=${perPage}&page=${page}&_fields=id,date,slug,title,excerpt,content,featured_media,categoria,etiqueta,yoast_head,yoast_head_json,_links,_embedded`,
      { 
        next: { revalidate: 60 },
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener los episodios: ${response.status} ${response.statusText}`);
    }

    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);
    const episodes: PodcastEpisode[] = await response.json();

    // Procesar los episodios para extraer la imagen destacada
    const processedEpisodes = episodes.map(episode => {
      const featuredMedia = episode._embedded?.['wp:featuredmedia']?.[0];
      
      return {
        ...episode,
        featured_media_url: featuredMedia?.source_url || null,
        featured_media_alt: featuredMedia?.alt_text || '',
      };
    });

    console.log(`Episodios obtenidos: ${processedEpisodes.length}, Total de páginas: ${totalPages}`);
    
    return {
      episodes: processedEpisodes,
      totalPages
    };
  } catch (error) {
    console.error('Error en getPodcastEpisodes:', error);
    return { episodes: [], totalPages: 0 };
  }
}

/**
 * Obtiene un episodio específico por su slug
 */
// Obtiene los miembros del equipo
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/wp/v2/equipo?_embed=wp:term,wp:featuredmedia&per_page=100`,
      { 
        next: { revalidate: 3600 },
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener los miembros del equipo: ${response.status} ${response.statusText}`);
    }

    const teamMembers = await response.json();
    
    // Mapear los términos de cargo y rol
    const membersWithTerms = await Promise.all(teamMembers.map(async (member: any) => {
      try {
        // Obtener términos de cargo y rol
        const cargos = member._embedded?.['wp:term']?.find((t: any) => t[0]?.taxonomy === 'cargo') || [];
        const roles = member._embedded?.['wp:term']?.find((t: any) => t[0]?.taxonomy === 'rol') || [];
        
        // Obtener la imagen destacada
        const featuredMedia = member._embedded?.['wp:featuredmedia']?.[0];
        
        // Obtener la URL de LinkedIn de la estructura correcta
        const linkedinUrl = member.acf?.informacion?.linkedin_url || member.acf?.linkedin_url || '#';
        
        // Determinar el cargo: primero de los términos embebidos, luego del ACF como string
        const cargo = cargos.length > 0 
          ? cargos[0].name 
          : (member.acf?.cargo || '');
        
        return {
          ...member,
          acf: {
            ...member.acf, // Mantener otros campos ACF
            nombre: member.title?.rendered || member.acf?.nombre || '',
            cargo: cargo,
            cargoIds: cargos.map((c: any) => c.id), // Guardar IDs para referencia
            habilidades: roles.map((r: any) => r.name) || member.acf?.habilidades || [],
            descripcion: (() => {
              const excerpt = member.excerpt?.rendered?.replace(/<[^>]*>?/gm, '').trim();
              const acfDesc = member.acf?.descripcion?.trim();
              return excerpt && excerpt !== '00' ? excerpt : (acfDesc || '');
            })(),
            linkedin_url: linkedinUrl,
            imagen: {
              url: featuredMedia?.source_url || member.acf?.imagen?.url || '/images/nosotros/placeholder-avatar.png',
              alt: featuredMedia?.alt_text || member.acf?.imagen?.alt || `Imagen de ${member.title?.rendered || 'miembro del equipo'}`
            }
          }
        };
      } catch (error) {
        console.error('Error procesando miembro del equipo:', error);
        return null;
      }
    }));

    // Filtrar cualquier miembro nulo y asegurar el tipo correcto
    return membersWithTerms.filter((member): member is TeamMember => member !== null);
  } catch (error) {
    console.error('Error al obtener los miembros del equipo:', error);
    return [];
  }
}

export async function getPodcastEpisodeBySlug(slug: string): Promise<PodcastEpisode | null> {
  try {
    console.log(`Obteniendo episodio de podcast por slug: ${slug}`);
    
    const response = await fetch(
      `${WORDPRESS_API_URL}/wp/v2/podcast?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia,wp:term&_fields=id,date,slug,title,excerpt,content,featured_media,categoria,etiqueta,yoast_head,yoast_head_json,_links,_embedded`,
      { 
        next: { revalidate: 60 },
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener el episodio: ${response.status} ${response.statusText}`);
    }

    const episodes: PodcastEpisode[] = await response.json();
    const episode = episodes[0];
    
    if (!episode) {
      return null;
    }

    // Procesar el episodio para extraer la imagen destacada
    const featuredMedia = episode._embedded?.['wp:featuredmedia']?.[0];
    
    return {
      ...episode,
      featured_media_url: featuredMedia?.source_url || null,
      featured_media_alt: featuredMedia?.alt_text || '',
    };
  } catch (error) {
    console.error('Error en getPodcastEpisodeBySlug:', error);
    return null;
  }
}
