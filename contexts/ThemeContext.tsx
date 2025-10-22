'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type ThemeContextType = {
  headerColor: string;
  setHeaderColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [headerColor, setHeaderColor] = useState('transparent');

  // Actualizar el color del header basado en la ruta
  useEffect(() => {
    if (pathname === '/casos-de-exito-agencia-de-marketing-digital') {
      setHeaderColor('playful-header-mora'); // Azul oscuro solo para la página de casos de éxito
    } else {
      setHeaderColor('bg-[#E9D7FF]'); // Color lila para todas las demás páginas incluyendo el home
    }
  }, [pathname]);

  return (
    <ThemeContext.Provider value={{ headerColor, setHeaderColor }}>
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
