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
      
      // Obtener el elemento del artículo principal
      const articleElement = document.querySelector('article');
      if (!articleElement) {
        console.error('No se encontró el elemento del artículo');
        return;
      }

      // Crear un clon del artículo para el PDF
      const articleClone = articleElement.cloneNode(true) as HTMLElement;
      
      // Ocultar elementos que no queremos en el PDF (mantenemos las imágenes)
      const elementsToHide = articleClone.querySelectorAll('.toc, button, .hidden-print');
      elementsToHide.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });

      // Asegurar que las imágenes sean visibles y tengan el tamaño correcto
      const images = articleClone.querySelectorAll('img');
      images.forEach(img => {
        const imgElement = img as HTMLImageElement;
        imgElement.style.display = 'block';
        imgElement.style.maxWidth = '100%';
        imgElement.style.height = 'auto';
      });

      // Agregar el clon al final del body temporalmente
      articleClone.style.position = 'absolute';
      articleClone.style.left = '-9999px';
      articleClone.style.top = '0';
      articleClone.style.width = '800px';
      articleClone.style.padding = '40px';
      articleClone.style.backgroundColor = 'white';
      articleClone.style.color = 'black';
      document.body.appendChild(articleClone);

      // Actualizar progreso
      updateProgress(40);
      
      // Convertir imágenes externas a base64 usando un proxy CORS
      const allImages = Array.from(articleClone.querySelectorAll('img')) as HTMLImageElement[];
      console.log(`Procesando ${allImages.length} imágenes...`);
      
      let imagesConverted = 0;
      for (const img of allImages) {
        if (!img.src || img.src.startsWith('data:')) continue;
        
        try {
          // Usar proxy CORS para descargar la imagen
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(img.src)}`;
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
          
          // Actualizar el src
          img.src = dataUrl;
          
          // Eliminar atributos de Next.js Image que pueden causar problemas
          img.removeAttribute('srcset');
          img.removeAttribute('sizes');
          
          // Asegurar que la imagen sea visible y tenga dimensiones
          img.style.position = 'relative';
          img.style.display = 'block';
          img.style.visibility = 'visible';
          img.style.opacity = '1';
          img.style.width = img.width ? `${img.width}px` : 'auto';
          img.style.height = img.height ? `${img.height}px` : 'auto';
          
          // Si la imagen tiene un contenedor padre de Next.js, ajustarlo
          const parent = img.parentElement;
          if (parent && parent.style.position === 'relative') {
            parent.style.position = 'relative';
            parent.style.display = 'block';
          }
          
          imagesConverted++;
          console.log(`Imagen ${imagesConverted}/${allImages.length} convertida a base64`);
        } catch (error) {
          console.warn('No se pudo descargar imagen:', img.src, error);
          // Ocultar la imagen si no se puede descargar
          img.style.display = 'none';
        }
      }
      
      console.log(`${imagesConverted} de ${allImages.length} imágenes convertidas exitosamente`);
      
      // Esperar un momento para que se actualicen los src
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Crear el PDF con configuración mejorada
      console.log('Iniciando html2canvas...');
      const canvas = await html2canvas(articleClone, {
        scale: 2,
        useCORS: false,
        allowTaint: false,
        logging: true,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        windowHeight: articleClone.scrollHeight,
        onclone: (clonedDoc: Document) => {
          console.log('Documento clonado exitosamente');
          // Actualizar progreso cuando se clona el documento
          updateProgress(60);
        }
      } as any);
      console.log('Canvas creado exitosamente:', canvas.width, 'x', canvas.height);
      
      // Actualizar progreso
      updateProgress(80);

      // Convertir el canvas completo a imagen DATA URL antes de crear el PDF
      // Esto se hace una sola vez para evitar problemas con tainted canvas
      const imgData = canvas.toDataURL('image/png');
      console.log('Imagen generada exitosamente');

      // Configuración del PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Agregar primera página en blanco
      pdf.text('', 10, 10); // Página en blanco
      pdf.addPage(); // Agregar segunda página para el contenido

      // Tamaño de la página A4 en mm
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Márgenes
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      // Calcular dimensiones de la imagen para que quepa en el ancho de la página
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Agregar la imagen al PDF con paginación automática
      let heightLeft = imgHeight;
      let position = margin;
      
      // Primera página de contenido (ya está creada arriba)
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= contentHeight;
      
      // Agregar páginas adicionales si es necesario
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= contentHeight;
      }

      // Eliminar el clon temporal
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
