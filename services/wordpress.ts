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
    /* console.log('Iniciando petición a WordPress...'); */
    const apiUrl = `${WORDPRESS_API_URL}/wp/v2/pages?slug=home-2&_fields=yoast_head`;
    /* console.log('URL de la API:', apiUrl); */
    
    const response = await fetch(apiUrl, { 
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    /* console.log('Respuesta recibida. Status:', response.status); */
    
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

    /* console.log('Metadatos extraídos:', JSON.stringify(metadata, null, 2)); */
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
    /* console.log(`Iniciando petición para obtener metadatos de la página: ${slug}`); */
    const apiUrl = `${WORDPRESS_API_URL}/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=yoast_head`;
    /* console.log('URL de la API:', apiUrl); */
    
    const response = await fetch(apiUrl, { 
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    /* console.log('Respuesta recibida. Status:', response.status); */
    
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

    /* console.log(`Metadatos extraídos para ${slug}:`, JSON.stringify(metadata, null, 2)); */
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
  alt_text?: string;
  media_details?: {
    sizes: {
      [key: string]: {
        source_url: string;
        width: number;
        height: number;
      };
    };
  };
  width?: number;
  height?: number;
}

export interface WPPost {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: {
    rendered: string;
  };
  content?: {
    rendered: string;
    protected?: boolean;
  };
  excerpt?: {
    rendered: string;
    protected?: boolean;
  };
  _embedded?: {
    'wp:featuredmedia'?: WPFeaturedMedia[];
    'wp:term'?: any[][];
    'author'?: Array<{
      id: number;
      name: string;
      slug: string;
      avatar_urls?: {
        [key: string]: string;
      };
    }>;
  };
  featured_media?: number;
  featured_media_url?: string;
  featured_media_alt?: string;
  categories?: any[];
  tags?: any[];
  author?: number;
  author_name?: string;
  author_avatar_urls?: {
    [key: string]: string;
  };
  modified?: string;
  modified_gmt?: string;
  status?: string;
  type?: string;
  format?: string;
  sticky?: boolean;
  comment_status?: string;
  ping_status?: string;
  template?: string;
  meta?: {
    [key: string]: any;
  };
}

// ... (rest of the code remains the same)

/**
 * Obtiene posts del blog con paginación y filtrado por categoría
 * @param page Número de página (comenzando en 1)
 * @param perPage Cantidad de posts por página (máx 100)
 * @param categorySlug Slug de la categoría para filtrar (opcional)
 */
export async function getBlogPosts(page: number = 1, perPage: number = 6, categorySlug: string = ''): Promise<{ posts: WPPost[], totalPages: number }> {
  // ... (rest of the code remains the same)
  try {
    // Validar parámetros
    page = Math.max(1, page);
    perPage = Math.min(100, Math.max(1, perPage));

    // Construir URL con filtro de categoría si existe
    let url = `${WORDPRESS_API_URL}/wp/v2/posts?page=${page}&per_page=${perPage}&_embed=wp:featuredmedia,wp:term,author`;
    
    // Si hay una categoría, primero obtener su ID
    if (categorySlug) {
      try {
        const categoriesResponse = await fetch(
          `${WORDPRESS_API_URL}/wp/v2/categories?slug=${categorySlug}`,
          { 
            next: { revalidate: 3600 },
            headers: { 'Content-Type': 'application/json' }
          }
        );
        
        if (categoriesResponse.ok) {
          const categories = await categoriesResponse.json();
          if (categories.length > 0) {
            url += `&categories=${categories[0].id}`;
          }
        }
      } catch (error) {
        console.error('Error al obtener categoría:', error);
      }
    }

    const response = await fetch(url, { 
      next: { revalidate: 60 }, // Revalidar cada minuto
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener los posts: ${response.status} ${response.statusText}`);
    }

    // Obtener el número total de páginas del header de la respuesta
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    const posts: WPPost[] = await response.json();

    // Procesar los posts para incluir las imágenes destacadas y autor
    const processedPosts = posts.map(post => ({
      ...post,
      featured_media_url: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
      featured_media_alt: post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '',
      categories: post._embedded?.['wp:term']?.[0] || [],
      author_name: post._embedded?.['author']?.[0]?.name || 'Playful Agency'
    }));

    return {
      posts: processedPosts,
      totalPages
    };
  } catch (error) {
    console.error('Error en getBlogPosts:', error);
    return {
      posts: [],
      totalPages: 0
    };
  }
}

/**
 * Obtiene el post destacado más reciente (con etiqueta 'destacado')
 * @returns Promise con el post destacado o null si no hay ninguno
 */
export async function getFeaturedBlogPost(): Promise<WPPost | null> {
  try {
    // Primero, obtener el ID de la etiqueta 'destacado'
    const tagsResponse = await fetch(
      `${WORDPRESS_API_URL}/wp/v2/tags?slug=destacado`,
      { 
        next: { revalidate: 3600 },
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    if (!tagsResponse.ok) {
      console.error('Error al obtener la etiqueta destacado');
      return null;
    }

    const tags = await tagsResponse.json();
    
    // Si no existe la etiqueta, retornar null
    if (!tags || tags.length === 0) {
      console.log('No existe la etiqueta "destacado" en WordPress');
      return null;
    }

    const featuredTagId = tags[0].id;
    
    // Obtener posts con esa etiqueta (solo el más reciente)
    const postsResponse = await fetch(
      `${WORDPRESS_API_URL}/wp/v2/posts?tags=${featuredTagId}&per_page=1&_embed=wp:featuredmedia,wp:term`,
      { 
        next: { revalidate: 60 },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!postsResponse.ok) {
      throw new Error(`Error al obtener posts destacados: ${postsResponse.status}`);
    }

    const posts: WPPost[] = await postsResponse.json();
    
    if (!posts || posts.length === 0) {
      console.log('No hay posts con la etiqueta "destacado"');
      return null;
    }

    // Procesar el post para incluir imágenes y categorías
    const post = posts[0];
    return {
      ...post,
      featured_media_url: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
      featured_media_alt: post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '',
      categories: post._embedded?.['wp:term']?.[0] || [],
      tags: post._embedded?.['wp:term']?.[1] || []
    };
  } catch (error) {
    console.error('Error en getFeaturedBlogPost:', error);
    return null;
  }
}

/**
 * Obtiene posts de la categoría 'Más vistos'
 * @param perPage Número de posts a obtener (por defecto 6)
 * @returns Promise con array de posts más vistos
 */
export async function getMostViewedPosts(perPage: number = 6): Promise<WPPost[]> {
  try {
    // Obtener el ID de la categoría 'mas-vistos'
    const categoriesResponse = await fetch(
      `${WORDPRESS_API_URL}/wp/v2/categories?slug=mas-vistos`,
      { 
        next: { revalidate: 3600 },
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    if (!categoriesResponse.ok) {
      console.error('Error al obtener la categoría mas-vistos');
      return [];
    }

    const categories = await categoriesResponse.json();
    
    // Si no existe la categoría, retornar array vacío
    if (!categories || categories.length === 0) {
      console.log('No existe la categoría "mas-vistos" en WordPress');
      return [];
    }

    const categoryId = categories[0].id;
    
    // Obtener posts de esa categoría
    const postsResponse = await fetch(
      `${WORDPRESS_API_URL}/wp/v2/posts?categories=${categoryId}&per_page=${perPage}&_embed=wp:featuredmedia,wp:term`,
      { 
        next: { revalidate: 60 },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!postsResponse.ok) {
      throw new Error(`Error al obtener posts más vistos: ${postsResponse.status}`);
    }

    const posts: WPPost[] = await postsResponse.json();
    
    if (!posts || posts.length === 0) {
      console.log('No hay posts con la categoría "mas-vistos"');
      return [];
    }

    // Procesar posts para incluir imágenes y categorías
    const processedPosts = posts.map(post => ({
      ...post,
      featured_media_url: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
      featured_media_alt: post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '',
      categories: post._embedded?.['wp:term']?.[0] || [],
      tags: post._embedded?.['wp:term']?.[1] || []
    }));

    return processedPosts;
  } catch (error) {
    console.error('Error en getMostViewedPosts:', error);
    return [];
  }
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
      const excerpt = (post.excerpt?.rendered ?? '')
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
    
    if (!posts || posts.length === 0) {
      return null;
    }

    const post = posts[0];

    // Procesar datos embebidos
    if (post._embedded) {
      // Procesar imagen destacada
      if (post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        post.featured_media_url = media.source_url;
        post.featured_media_alt = media.alt_text || '';
      }

      // Procesar términos (categorías y tags)
      if (post._embedded['wp:term']) {
        const terms = post._embedded['wp:term'];
        post.categories = terms[0] || [];
        post.tags = terms[1] || [];
      }
    }

    return post;
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

// Interfaces for Success Stories
export interface ACFSuccessStory {
  // Existing properties
  categoria1: string;
  categoria2: string;
  categoria3: string;
  categoria4: string;
  categoria5: string;
  h1: string;
  primerap: string;
  imagenbanner: { url: string; alt: string; } | false;
  primerh2: string;
  segundap: string;
  imagenminuta1: { url: string; alt: string; } | false;
  imagenminuta2: { url: string; alt: string; } | false;
  imagenminuta3: { url: string; alt: string; } | false;
  segundoh2: string;
  tercerap: string;
  cuartap: string;
  quintap: string;
  sextap: string;
  septimap: string;
  octavap: string;
  novenap: string;
  desafioimagen1: { url: string; alt: string; } | false;
  desafioimagen2: { url: string; alt: string; } | false;
  desafioimagen3: { url: string; alt: string; } | false;
  desafioimagen4: { url: string; alt: string; } | false;
  tercerh2: string;
  decima: string;
  
  // New properties
  subtitle?: string;
  description?: string;
  hero_image?: {
    url: string;
    alt: string;
  };
  challenge_title?: string;
  challenge_description?: string;
  challenge_logos?: Array<{
    url: string;
    alt: string;
  }>;
  work_process?: Array<{
    title: string;
    description: string;
    step_items: string[];
    step_image?: {
      url: string;
      alt: string;
    };
  }>;
  results?: Array<{
    result_value: string;
    result_description: string;
  }>;
}

export interface SuccessStory extends WPPost {
  acf: ACFSuccessStory;
}

/**
 * Obtiene un caso de éxito por su slug
 * @param slug Slug del caso de éxito
 * @returns Promise con el caso de éxito o null si no se encuentra
 */
export async function getSuccessStoryBySlug(slug: string): Promise<SuccessStory | null> {
  try {
    console.log('Fetching success story with slug:', slug);
    const response = await fetch(
      `${WORDPRESS_API_URL}/wp/v2/casos-de-exito?slug=${encodeURIComponent(slug)}&_embed&acf_format=standard`,
      {
        next: { revalidate: 3600 },
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache', // Ensure we're not getting cached data
        }
      }
    );

    if (!response.ok) {
      console.error('Error response from API:', await response.text());
      throw new Error(`Error al obtener el caso de éxito: ${response.status} ${response.statusText}`);
    }

    const stories: any[] = await response.json();
    console.log('API Response:', JSON.stringify(stories, null, 2));
    
    if (!stories || stories.length === 0) {
      console.log('No story found with slug:', slug);
      return null;
    }

    const story = stories[0];
    
    // Log the ACF fields to see what we're working with
    console.log('Story ACF fields:', story.acf);

    // Ensure we have the ACF data
    if (!story.acf) {
      console.error('No ACF data found for story:', story);
      return null;
    }

    // Process embedded media if needed, similar to blog posts
    if (story._embedded?.['wp:featuredmedia']?.[0]) {
      story.featured_media_url = story._embedded['wp:featuredmedia'][0].source_url;
      story.featured_media_alt = story._embedded['wp:featuredmedia'][0].alt_text;
    }

    return story as SuccessStory;

  } catch (error) {
    console.error('Error en getSuccessStoryBySlug:', error);
    return null;
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
    
    // Asegurarse de que excerpt existe
    if (!episode.excerpt) {
      episode.excerpt = { rendered: '' };
    }
    
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

// Interface para casos de éxito
export interface CaseStudy {
  id: number;
  title: string;
  slug: string;
  description: string;
  categories: string[];
  badge: string;
  badgeColor: string;
  buttonText: string;
  buttonColor: string;
  image: string;
}

/**
 * Obtiene casos de éxito desde WordPress
 */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/wp/v2/casos-de-exito?_embed`,
      { 
        next: { revalidate: 60 },
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener casos de éxito: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transformar los datos de la API al formato esperado por el componente
    const transformedData: CaseStudy[] = data.map((item: any) => {
      // Extraer título
      const title = item.title?.rendered || 'Sin título';
      
      // Extraer descripción y limpiar HTML
      let description = '';
      if (item.excerpt?.rendered) {
        description = item.excerpt.rendered
          .replace(/<[^>]*>?/gm, '') // Eliminar etiquetas HTML
          .replace(/\[\/?(p|br|strong|em|h[1-6])\]/g, '') // Eliminar etiquetas cortas restantes
          .trim();
      } else if (item.content?.rendered) {
        description = item.content.rendered
          .replace(/<[^>]*>?/gm, '')
          .substring(0, 200) + '...';
      }
      
      // Extraer imagen destacada
      let image = '';
      if (item._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
        image = item._embedded['wp:featuredmedia'][0].source_url;
      } else if (item.featured_media_url) {
        image = item.featured_media_url;
      }
      
      const categories = [
        item.acf?.categoria1,
        item.acf?.categoria2,
        item.acf?.categoria3,
        item.acf?.categoria4,
        item.acf?.categoria5,
      ].filter(Boolean) as string[];

      return {
        id: item.id,
        title: title,
        slug: item.slug || `caso-${item.id}`,
        description: description || 'Descripción no disponible',
        categories: categories,
        badge: item.acf?.badge || item.meta?._case_study_badge || '',
        badgeColor: item.acf?.badge_color || item.meta?._case_study_badge_color || 'bg-purple-600',
        buttonText: item.acf?.button_text || 'Ver más',
        buttonColor: item.acf?.button_color || 'bg-purple-600',
        image: image,
      };
    });

    return transformedData;
  } catch (error) {
    console.error('Error en getCaseStudies:', error);
    return [];
  }
}
