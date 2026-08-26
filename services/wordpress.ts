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

export interface WPPage {
  id: number;
  slug: string;
  title: string;
  html: string;
  stylesheetIds: number[];
}

const IN_SITE_PAGE_HOSTS = new Set([
  'endpoint.playfulagency.com',
  'old.playfulagency.com',
  'playfulagency.com',
  'www.playfulagency.com',
]);

const WP_ASSET_PATH_PREFIXES = ['/wp-content', '/wp-includes', '/wp-json', '/wp-admin'];

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripScripts(html: string): string {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
}

function collectStylesheetIds(html: string, pageId: number): number[] {
  const ids = new Set<number>([pageId]);
  const re = /data-elementor-id=["'](\d+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const id = Number(match[1]);
    if (!Number.isNaN(id)) ids.add(id);
  }
  return Array.from(ids);
}

function rewritePageHref(url: string): string {
  const trimmed = url.trim();
  const parsed = trimmed.match(/^(https?:)?\/\/([^/]+)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/i);
  if (!parsed) return url;

  const host = parsed[2].toLowerCase();
  if (!IN_SITE_PAGE_HOSTS.has(host)) return url;

  const path = parsed[3] || '/';
  if (WP_ASSET_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return url;
  }

  const query = parsed[4] || '';
  const hash = parsed[5] || '';
  const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
  return `${normalized}${query}${hash}`;
}

/** Rewrites in-site page hrefs to relative Next paths; leaves wp-content/assets untouched. */
function rewriteInSitePageHrefs(html: string): string {
  return html.replace(/href=(["'])([^"']+)\1/gi, (_full, quote: string, href: string) => {
    return `href=${quote}${rewritePageHref(href)}${quote}`;
  });
}

/** Página WP (servicios, etc.) con HTML de Elementor para renderizarla en el Next. */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,content`,
      {
        next: { revalidate: 300 },
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (!response.ok) {
      throw new Error(`Error al obtener la página ${slug}: ${response.status}`);
    }
    const pages = await response.json();
    if (!pages?.[0]) return null;
    const page = pages[0];
    const rawHtml: string = page.content?.rendered || '';
    const html = rewriteInSitePageHrefs(stripScripts(rawHtml));
    const title = stripHtml(page.title?.rendered || slug);
    const stylesheetIds = collectStylesheetIds(html, page.id);
    return { id: page.id, slug: page.slug, title, html, stylesheetIds };
  } catch (error) {
    console.error(`Error en getPageBySlug para ${slug}:`, error);
    return null;
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
  author?: number | {
    id: number;
    name: string;
    slug: string;
    avatar_urls?: {
      [key: string]: string;
    };
  };
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
      `${WORDPRESS_API_URL}/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia,wp:term,author`,
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

      // Procesar autor
      if (post._embedded['author'] && post._embedded['author'][0]) {
        post.author = post._embedded['author'][0];
      }
    }

    return post;
  } catch (error) {
    console.error('Error en getBlogPostBySlug:', error);
    return null;
  }
}
