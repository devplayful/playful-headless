'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type ThemeContextType = {
  headerColor: string;
  footerColor: string;
  setHeaderColor: (color: string) => void;
  setFooterColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [headerColor, setHeaderColor] = useState('bg-[#E9D7FF]');
  const [footerColor, setFooterColor] = useState('bg-[#E9D7FF]');
  const [isBlogPost, setIsBlogPost] = useState(false);

  // Actualizar los colores basados en la ruta
  useEffect(() => {
    if (pathname === '/casos-de-exito-agencia-de-marketing-digital') {
      setHeaderColor('playful-header-mora');
      setFooterColor('playful-footer-mora');
      setIsBlogPost(false);
    } else if (pathname && pathname.startsWith('/casos-de-exito/')) {
      // Para páginas de detalle de casos de éxito como /casos-de-exito/slug
      setHeaderColor('playful-header-mora');
      setFooterColor('playful-header-mora');
      setIsBlogPost(false);
    } else if (pathname && /^\/blog\/[^\/]+$/.test(pathname)) {
      // Solo aplica a rutas como /blog/titulo-articulo, no a /blog/ ni a /blog/mas-vistos/...
      setHeaderColor('blog-post-bg');
      setFooterColor('blog-post-bg');
      setIsBlogPost(true);
    } else {
      setHeaderColor('bg-[#E9D7FF]');
      setFooterColor('bg-[#E9D7FF]');
      setIsBlogPost(false);
    }
  }, [pathname]);

  return (
    <ThemeContext.Provider value={{ 
      headerColor, 
      footerColor,
      setHeaderColor, 
      setFooterColor 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
