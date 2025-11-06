'use client';

import { BlogLoader } from '@/components/ui/BlogLoader';
import { useEffect, useState } from 'react';

export function HomePageContent({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  
  // Contar el número de imágenes en el contenido
  useEffect(() => {
    const images = document.querySelectorAll('img');
    const totalImages = images.length;
    
    if (totalImages === 0) {
      // Si no hay imágenes, marcar como cargado después de un breve retraso
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }

    const checkImageLoad = () => {
      setImagesLoaded(prev => {
        const newCount = prev + 1;
        if (newCount >= totalImages) {
          // Pequeño retraso para asegurar que todo esté renderizado
          setTimeout(() => setIsLoading(false), 200);
        }
        return newCount;
      });
    };

    // Configurar event listeners para cada imagen
    images.forEach(img => {
      if (img.complete) {
        checkImageLoad();
      } else {
        img.addEventListener('load', checkImageLoad);
        img.addEventListener('error', checkImageLoad); // En caso de error, continuar igual
      }
    });

    // Timeout de respaldo en caso de que algo falle
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Limpieza
    return () => {
      clearTimeout(timeout);
      images.forEach(img => {
        img.removeEventListener('load', checkImageLoad);
        img.removeEventListener('error', checkImageLoad);
      });
    };
  }, []);

  if (isLoading) {
    return <BlogLoader />;
  }

  return <>{children}</>;
}
