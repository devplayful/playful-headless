'use client';

import { BlogLoader } from '@/components/ui/BlogLoader';
import { useEffect, useState } from 'react';

export function BlogPostContent({ 
  children,
  title,
  featuredImage
}: { 
  children: React.ReactNode;
  title: string;
  featuredImage?: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const totalImages = featuredImage ? 1 : 0;

  // Efecto para manejar la precarga de imágenes
  useEffect(() => {
    if (totalImages === 0) {
      // Si no hay imágenes, marcar como cargado inmediatamente
      setIsLoading(false);
      return;
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

    // Precargar la imagen destacada si existe
    if (featuredImage) {
      const img = new Image();
      img.src = featuredImage;
      img.onload = checkImageLoad;
      img.onerror = checkImageLoad; // En caso de error, continuar igual
    }

    // Timeout de respaldo en caso de que algo falle
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [featuredImage, totalImages]);

  if (isLoading) {
    return <BlogLoader />;
  }

  return <>{children}</>;
}
