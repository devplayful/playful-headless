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

  // Actualizar los colores basados en la ruta
  useEffect(() => {
    if (pathname === '/casos-de-exito-agencia-de-marketing-digital') {
      setHeaderColor('playful-header-mora');
      setFooterColor('playful-footer-mora');
    } else {
      setHeaderColor('bg-[#E9D7FF]');
      setFooterColor('bg-[#E9D7FF]');
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
