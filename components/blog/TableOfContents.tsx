'use client';

import { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { handleSmoothScroll } from '@/utils/smoothScroll';
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
      
      // Ocultar elementos que no queremos en el PDF
      const elementsToHide = articleClone.querySelectorAll('.toc, .prose img, button, .hidden-print');
      elementsToHide.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });

      // Agregar el clon al final del body temporalmente
      articleClone.style.position = 'absolute';
      articleClone.style.left = '-9999px';
      articleClone.style.padding = '20px';
      articleClone.style.maxWidth = '800px';
      articleClone.style.margin = '0 auto';
      document.body.appendChild(articleClone);

      // Actualizar progreso
      updateProgress(40);
      
      // Crear el PDF
      const canvas = await html2canvas(articleClone, {
        scale: 2 as any, // Usamos 'as any' temporalmente para evitar el error de tipo
        useCORS: true,
        logging: false,
        onclone: (clonedDoc: Document) => {
          // Actualizar progreso cuando se clona el documento
          updateProgress(60);
        },
        // @ts-ignore - La propiedad oncloneTimeout no está en los tipos pero es soportada
        oncloneTimeout: 0
      });
      
      // Actualizar progreso
      updateProgress(80);

      // Configuración del PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Tamaño de la página A4 en mm
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calcular la relación de aspecto de la imagen
      const imgWidth = pageWidth - 40; // Margen de 20mm a cada lado
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Agregar la imagen al PDF
      let heightLeft = imgHeight;
      let position = 20; // Margen superior
      
      // Agregar la imagen en múltiples páginas si es necesario
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 40); // Restar el espacio de la página (menos márgenes)
        
        if (heightLeft > 0) {
          pdf.addPage();
          position = heightLeft - imgHeight; // Ajustar la posición para la siguiente página
          if (position < 20) position = 20; // Mantener un margen mínimo
        }
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
      console.error('Error al generar el PDF:', error);
      alert('Ocurrió un error al generar el PDF. Por favor, inténtalo de nuevo.');
      setIsGeneratingPdf(false);
      setGenerationProgress(0);
    }
  };

  return (
    <div className="bg-[#DFFFFE] rounded-2xl p-8 relative" ref={contentRef}>
      {isGeneratingPdf && <PdfLoader progress={generationProgress} />}
      <h2 className="text-2xl font-bold text-[#440099] mb-6">En este artículo</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.slug} className="flex items-start">
            <span className="text-gray-700 mr-3 flex-shrink-0">•</span>
            <a
              href={item.slug}
              onClick={(e) => handleSmoothScroll(e, item.slug.replace('#', ''))}
              className="text-gray-700 hover:text-[#440099] transition-colors cursor-pointer text-sm leading-relaxed"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
      
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
