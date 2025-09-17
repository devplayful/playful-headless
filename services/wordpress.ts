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
