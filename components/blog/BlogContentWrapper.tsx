'use client';

import { useEffect, useState } from 'react';
import { BlogLoader } from '@/components/ui/BlogLoader';

interface BlogContentWrapperProps {
  children: React.ReactNode;
}

export function BlogContentWrapper({ children }: BlogContentWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Marcar como cargado cuando el componente se monta
    setIsLoading(false);
    
    // Limpieza
    return () => {
      setIsLoading(true);
    };
  }, []);

  // Si está cargando, mostrar el loader
  if (isLoading) {
    return <BlogLoader />;
  }

  // Una vez cargado, mostrar el contenido
  return <>{children}</>;
}
