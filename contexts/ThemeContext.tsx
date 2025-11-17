'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type ThemeContextType = {
  headerColor: string;
  footerColor: string;
  bodyBgColor: 'casos-exito' | 'default';
  setHeaderColor: (color: string) => void;
  setFooterColor: (color: string) => void;
  setBodyBgColor: (color: 'casos-exito' | 'default') => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [headerColor, setHeaderColor] = useState('bg-[#E9D7FF]');
  const [footerColor, setFooterColor] = useState('bg-[#E9D7FF]');
  const [bodyBgColor, setBodyBgColor] = useState<'casos-exito' | 'default'>('default');
  const [isBlogPost, setIsBlogPost] = useState(false);

  // Actualizar los colores basados en la ruta
  useEffect(() => {
    if (pathname === '/casos-de-exito-agencia-de-marketing-digital' || 
        (pathname && pathname.startsWith('/casos-de-exito/'))) {
      setHeaderColor('playful-header-mora');
      setFooterColor('playful-footer-mora');
      setBodyBgColor('casos-exito');
      setIsBlogPost(false);
    } else if (pathname && /^\/blog\/[^\/]+$/.test(pathname)) {
      // Solo aplica a rutas como /blog/titulo-articulo, no a /blog/ ni a /blog/mas-vistos/...
      setHeaderColor('blog-post-bg');
      setFooterColor('blog-post-bg');
      setIsBlogPost(true);
    } else {
      setHeaderColor('bg-[#E9D7FF]');
      setFooterColor('bg-[#E9D7FF]');
      setBodyBgColor('default');
      setIsBlogPost(false);
    }
  }, [pathname]);

  return (
    <ThemeContext.Provider value={{ 
      headerColor, 
      footerColor,
      bodyBgColor,
      setHeaderColor, 
      setFooterColor,
      setBodyBgColor
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
