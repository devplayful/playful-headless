'use client';

import { useRef, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { smoothScrollTo } from '@/utils/smoothScroll';
import { PdfLoader } from '@/components/ui/PdfLoader';

interface TableOfContentsProps {
  items: Array<{
    text: string;
    slug: string;
  }>;
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  if (items.length === 0) return null;

  const updateProgress = (progress: number) => {
    // Suavizar la animación de la barra de progreso
    setGenerationProgress(prev => {
      const diff = progress - prev;
      return prev + diff * 0.3; // Suavizado para la animación
    });
  };

  // Efecto para manejar el hash en la URL al cargar la página
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        // Pequeño retraso para asegurar que el DOM esté listo
        setTimeout(() => {
          smoothScrollTo(hash);
        }, 100);
      }
    };

    // Manejar el hash inicial
    handleHashChange();

    // Agregar listener para cambios en el hash
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    
    setIsGeneratingPdf(true);
    setGenerationProgress(0);
    
    // Simular progreso inicial
    updateProgress(10);
    
    try {
      // Actualizar progreso
      updateProgress(20);
      
      // Obtener el HERO del blog (para portada) y el ARTICLE (para contenido)
      const heroElement = document.querySelector('[data-hero="blog-hero"]');
      const articleElement = document.querySelector('article');
      
      if (!heroElement || !articleElement) {
        console.error('No se encontró el hero del blog o el artículo');
        console.log('Hero encontrado:', !!heroElement);
        console.log('Article encontrado:', !!articleElement);
        return;
      }

      // Crear clones separados para portada (hero) y contenido (article)
      const heroClone = heroElement.cloneNode(true) as HTMLElement;
      const articleClone = articleElement.cloneNode(true) as HTMLElement;
      
      // Excluir elementos no deseados del contenido (NO secciones completas)
      console.log('\n=== LIMPIANDO ELEMENTOS ===');
      
      const elementsToHide = articleClone.querySelectorAll(`
        .toc,
        .hidden-print,
        [aria-label*="Compartir"],
        [href*="whatsapp"],
        [href*="linkedin"],
        [href*="facebook"],
        [href*="twitter"],
        button
      `);
      
      console.log(`Ocultando ${elementsToHide.length} elementos (botones, compartir, toc)`);
      elementsToHide.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
      
      // NO ocultar secciones completas, solo elementos específicos
      // Comentado para evitar ocultar imágenes accidentalmente:
      // const shareSection = articleClone.querySelector('section:has(a[aria-label*="Compartir"])');
      // if (shareSection) {
      //   (shareSection as HTMLElement).style.display = 'none';
      // }
      
      console.log('✓ Elementos limpiados');
      console.log('✓ Imágenes preservadas\n');

      // Asegurar que las imágenes sean visibles en ambos clones ANTES de convertir
      const heroImagesPrep = Array.from(heroClone.querySelectorAll('img'));
      const articleImagesPrep = Array.from(articleClone.querySelectorAll('img'));
      
      console.log('=== PREPARANDO IMÁGENES ===');
      console.log(`Hero: ${heroImagesPrep.length} imágenes`);
      console.log(`Article: ${articleImagesPrep.length} imágenes`);
      
      [...heroImagesPrep, ...articleImagesPrep].forEach(img => {
        const imgElement = img as HTMLImageElement;
        // Estilos básicos antes de convertir a base64
        imgElement.style.display = 'block';
        imgElement.style.visibility = 'visible';
        imgElement.style.opacity = '1';
        imgElement.style.maxWidth = '100%';
        imgElement.style.height = 'auto';
      });
      
      console.log('✓ Imágenes preparadas\n');

      // Agregar los clones al final del body temporalmente
      // Portada (hero del blog)
      heroClone.style.position = 'absolute';
      heroClone.style.left = '-9999px';
      heroClone.style.top = '0';
      heroClone.style.width = '800px';
      heroClone.style.padding = '40px';
      heroClone.style.backgroundColor = 'white';
      heroClone.style.color = 'black';
      document.body.appendChild(heroClone);
      
      // Contenido (article)
      articleClone.style.position = 'absolute';
      articleClone.style.left = '-9999px';
      articleClone.style.top = '2000px';
      articleClone.style.width = '800px';
      articleClone.style.padding = '40px';
      articleClone.style.backgroundColor = 'white';
      articleClone.style.color = 'black';
      document.body.appendChild(articleClone);

      // Actualizar progreso
      updateProgress(40);
      
      // Convertir imágenes externas a base64 en ambos clones
      const heroImages = Array.from(heroClone.querySelectorAll('img')) as HTMLImageElement[];
      const articleImages = Array.from(articleClone.querySelectorAll('img')) as HTMLImageElement[];
      const allImages = [...heroImages, ...articleImages];
      
      console.log(`\n=== PROCESANDO IMÁGENES ===`);
      console.log(`Total de imágenes encontradas: ${allImages.length}`);
      console.log(`- Hero: ${heroImages.length} imágenes`);
      console.log(`- Article: ${articleImages.length} imágenes\n`);
      
      let imagesConverted = 0;
      for (let i = 0; i < allImages.length; i++) {
        const img = allImages[i];
        
        // Buscar src en múltiples atributos (Next.js Image puede usar data-src, etc.)
        let imgSrc = img.src || 
                     img.getAttribute('src') || 
                     img.getAttribute('data-src') || 
                     img.getAttribute('data-nimg') || 
                     '';
        
        console.log(`\nImagen ${i + 1}/${allImages.length}:`);
        console.log('  - Elemento:', img.tagName, img.className);
        console.log('  - src original:', imgSrc.substring(0, 150) || 'vacío');
        
        if (!imgSrc) {
          console.log('  ⚠️ Imagen sin src, intentando obtener desde currentSrc...');
          imgSrc = img.currentSrc || '';
        }
        
        if (!imgSrc || imgSrc.length === 0) {
          console.log('  - ✗ Saltada (sin src válido)');
          continue;
        }
        
        if (imgSrc.startsWith('data:')) {
          console.log('  - Saltada (ya es base64)');
          continue;
        }
        
        // Extraer URL real si es Next.js Image Optimization
        if (imgSrc.includes('/_next/image?url=')) {
          try {
            const url = new URL(imgSrc, window.location.origin);
            const realImageUrl = url.searchParams.get('url');
            if (realImageUrl) {
              console.log('  🔄 Next.js Image detectada, extrayendo URL real...');
              console.log('  - URL Next.js:', imgSrc.substring(0, 100) + '...');
              imgSrc = decodeURIComponent(realImageUrl);
              console.log('  - URL real extraída:', imgSrc.substring(0, 100) + '...');
            }
          } catch (e) {
            console.warn('  ⚠️ Error extrayendo URL de Next.js Image:', e);
          }
        }
        
        console.log('  - Procesando:', imgSrc.substring(0, 100) + '...');
        
        try {
          // Usar endpoint propio para descargar la imagen (optimizado para Vercel Edge)
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imgSrc)}`;
          console.log('  - Usando proxy:', proxyUrl.substring(0, 80) + '...');
          
          const response = await fetch(proxyUrl);
          
          if (!response.ok) throw new Error('Error al descargar imagen');
          
          const blob = await response.blob();
          
          // Convertir el blob a base64
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          
          // Actualizar el src a base64
          img.src = dataUrl;
          img.setAttribute('src', dataUrl);
          
          // Eliminar atributos de Next.js Image que pueden causar problemas
          img.removeAttribute('srcset');
          img.removeAttribute('sizes');
          img.removeAttribute('loading');
          
          // Asegurar que la imagen sea visible y tenga dimensiones
          img.style.cssText = `
            position: relative !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            max-width: 100% !important;
            height: auto !important;
          `;
          
          // Si la imagen tiene un contenedor padre de Next.js, ajustarlo
          const parent = img.parentElement;
          if (parent) {
            parent.style.display = 'block';
            parent.style.position = 'relative';
            parent.style.overflow = 'visible';
          }
          
          imagesConverted++;
          console.log(`  - ✓ Convertida a base64 (${Math.round(dataUrl.length / 1024)} KB)`);
          console.log(`  - Total convertidas: ${imagesConverted}/${allImages.length}`);
          
        } catch (error) {
          console.error(`  - ✗ Error descargando imagen:`, error);
          console.error(`  - URL original:`, imgSrc);
          // NO ocultar la imagen, dejar que html2canvas intente renderizarla
          // img.style.display = 'none';
        }
      }
      
      console.log(`\n=== RESUMEN ===`);
      console.log(`✓ ${imagesConverted} de ${allImages.length} imágenes convertidas exitosamente`);
      console.log(`✗ ${allImages.length - imagesConverted} imágenes fallidas\n`);
      
      // Esperar a que TODAS las imágenes base64 se carguen completamente
      console.log('Esperando a que las imágenes se carguen...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aumentado a 2 segundos
      
      // Forzar carga de imágenes creando promesas de carga
      const imageLoadPromises = allImages.map(img => {
        return new Promise((resolve) => {
          if (img.complete || img.src.startsWith('data:')) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            // Timeout por si alguna imagen no carga
            setTimeout(() => resolve(false), 5000);
          }
        });
      });
      
      await Promise.all(imageLoadPromises);
      console.log('✓ Todas las imágenes cargadas\n');
      
      // Crear canvas para PORTADA (hero del blog)
      console.log('Iniciando html2canvas para portada (hero)...');
      const heroCanvas = await html2canvas(heroClone, {
        scale: 2,
        useCORS: false,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        windowHeight: heroClone.scrollHeight
      } as any);
      console.log('Canvas de portada creado:', heroCanvas.width, 'x', heroCanvas.height);
      
      updateProgress(50);
      
      // Crear canvas para CONTENIDO (article)
      console.log('Iniciando html2canvas para contenido...');
      const contentCanvas = await html2canvas(articleClone, {
        scale: 2,
        useCORS: false,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        windowHeight: articleClone.scrollHeight
      } as any);
      console.log('Canvas de contenido creado:', contentCanvas.width, 'x', contentCanvas.height);
      
      updateProgress(60);

      // Convertir ambos canvas a imágenes
      const heroImgData = heroCanvas.toDataURL('image/png');
      const contentImgData = contentCanvas.toDataURL('image/png');
      console.log('Imágenes generadas exitosamente');

      // Configuración del PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Dimensiones de página A4
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      // PÁGINA 1: PORTADA (Hero completo del blog: título, imagen, fecha, categoría, extracto)
      const heroImgWidth = contentWidth;
      const heroImgHeight = (heroCanvas.height * heroImgWidth) / heroCanvas.width;
      
      // Calcular altura proporcional para que quepa en la página
      const heroScaledHeight = Math.min(heroImgHeight, contentHeight);
      pdf.addImage(heroImgData, 'PNG', margin, margin, heroImgWidth, heroScaledHeight);
      
      updateProgress(70);
      
      // PÁGINAS 2+: CONTENIDO (Article paginado con fórmula consistente)
      
      // 1. Calcular altura total de la imagen en mm (manteniendo aspect ratio)
      const contentWidthMm = contentWidth;  // Ya definido arriba
      const contentImageHeightMm = (contentCanvas.height * contentWidthMm) / contentCanvas.width;
      
      // 2. Calcular número total de páginas necesarias
      const totalPages = Math.ceil(contentImageHeightMm / contentHeight);
      
      console.log('Paginación del contenido:');
      console.log(`- Canvas: ${contentCanvas.width}x${contentCanvas.height} px`);
      console.log(`- Altura total en PDF: ${contentImageHeightMm.toFixed(2)} mm`);
      console.log(`- Altura por página: ${contentHeight} mm`);
      console.log(`- Total de páginas: ${totalPages}`);
      
      // 3. Iterar por cada página y recortar la porción correcta del canvas
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        pdf.addPage();
        
        // Calcular posición Y en mm para esta página
        const startYmm = pageIndex * contentHeight;
        const endYmm = Math.min(startYmm + contentHeight, contentImageHeightMm);
        const pageHeightMm = endYmm - startYmm;
        
        // Convertir mm a píxeles usando la proporción total
        const sourceYpx = Math.round((startYmm / contentImageHeightMm) * contentCanvas.height);
        const sourceHeightPx = Math.round((pageHeightMm / contentImageHeightMm) * contentCanvas.height);
        
        // Asegurar que no exceda los límites del canvas
        const actualSourceHeight = Math.min(sourceHeightPx, contentCanvas.height - sourceYpx);
        
        console.log(`Página ${pageIndex + 2}:`);
        console.log(`  - Rango mm: ${startYmm.toFixed(2)} - ${endYmm.toFixed(2)}`);
        console.log(`  - sourceY: ${sourceYpx} px, sourceHeight: ${actualSourceHeight} px`);
        
        // Crear canvas temporal para esta porción
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = contentCanvas.width;
        tempCanvas.height = actualSourceHeight;
        
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          // Copiar la porción exacta del canvas original
          ctx.drawImage(
            contentCanvas,
            0, sourceYpx,                      // sourceX, sourceY
            contentCanvas.width, actualSourceHeight,  // sourceWidth, sourceHeight
            0, 0,                              // destX, destY
            contentCanvas.width, actualSourceHeight   // destWidth, destHeight
          );
          
          // Convertir esta porción a imagen
          const sliceImgData = tempCanvas.toDataURL('image/png');
          
          // Agregar al PDF con la altura exacta en mm
          pdf.addImage(sliceImgData, 'PNG', margin, margin, contentWidthMm, pageHeightMm);
        }
        
        // Actualizar progreso
        const progress = 70 + ((pageIndex + 1) / totalPages) * 20;
        updateProgress(Math.min(95, progress));
      }
      
      // Eliminar los clones temporales
      document.body.removeChild(heroClone);
      document.body.removeChild(articleClone);
      
      // Actualizar progreso
      updateProgress(95);
      
      // Descargar el PDF
      const title = document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`${title || 'documento'}.pdf`);
      
      // Esperar un momento para que se vea el 100%
      await new Promise(resolve => setTimeout(resolve, 500));
      updateProgress(100);
      
      // Cerrar el modal después de un breve retraso
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setGenerationProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Error completo al generar el PDF:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack available');
      console.error('Mensaje:', error instanceof Error ? error.message : String(error));
      alert('Ocurrió un error al generar el PDF. Revisa la consola para más detalles.');
      setIsGeneratingPdf(false);
      setGenerationProgress(0);
    }
  };

  // Función para manejar el clic en los enlaces
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    const targetId = slug.replace('#', '');
    
    // Actualizar la URL primero
    if (window.history.pushState) {
      window.history.pushState(null, '', `#${targetId}`);
    } else {
      window.location.hash = `#${targetId}`;
    }
    
    // Usar un pequeño retraso para asegurar que el DOM esté listo
    setTimeout(() => {
      smoothScrollTo(targetId);
    }, 50);
  };

  return (
    <div className="bg-[#DFFFFE] rounded-2xl p-8 relative" ref={contentRef}>
      {isGeneratingPdf && <PdfLoader progress={generationProgress} />}
      <h2 className="text-2xl font-bold text-[#440099] mb-6">En este artículo</h2>
      <nav aria-label="Tabla de contenidos">
        <ul className="space-y-3">
          {items.map((item) => {
            // Asegurarse de que el slug no tenga el # al principio
            const cleanSlug = item.slug.startsWith('#') ? item.slug.substring(1) : item.slug;
            return (
              <li key={cleanSlug} className="flex items-start">
                <span className="text-gray-700 mr-3 flex-shrink-0">•</span>
                <a
                  href={`#${cleanSlug}`}
                  onClick={(e) => handleLinkClick(e, cleanSlug)}
                  className="text-gray-700 hover:text-[#440099] transition-colors cursor-pointer text-sm leading-relaxed hover:underline"
                  aria-label={`Ir a la sección: ${item.text}`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Botón de descarga PDF */}
      <button 
        onClick={handleDownloadPDF}
        className="mt-8 w-full bg-[#39DDCB] hover:bg-[#2CC4B3] text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm uppercase"
      >
        <span>DESCARGA ESTE ARTÍCULO EN PDF</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      </button>
    </div>
  );
}
