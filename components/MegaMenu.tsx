'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, menuItems, getPageMetadataBySlug } from '@/services/wordpress';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [metadataCache, setMetadataCache] = useState<Record<string, any>>({});
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHovering = useRef(false);

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Solo cerrar si no estamos haciendo hover sobre el menú
        if (!isHovering.current) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Cerrar el menú cuando cambia la ruta
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  const handleItemHover = (slug: string) => {
    setActiveSubmenu(slug);
    
    // Precargar metadatos al hacer hover
    if (!metadataCache[slug]) {
      preloadMetadata(slug);
    }
  };

  const preloadMetadata = async (slug: string) => {
    try {
      setLoadingSlug(slug);
      const metadata = await getPageMetadataBySlug(slug);
      setMetadataCache(prev => ({
        ...prev,
        [slug]: metadata
      }));
    } catch (error) {
      console.error(`Error al cargar metadatos para ${slug}:`, error);
    } finally {
      setLoadingSlug(null);
    }
  };

  const handleMouseEnter = () => {
    isHovering.current = true;
  };

  const handleMouseLeave = () => {
    isHovering.current = false;
    // Pequeño retraso para permitir que el usuario mueva el ratón entre elementos
    setTimeout(() => {
      if (!isHovering.current) {
        setActiveSubmenu(null);
      }
    }, 300);
  };

  const handleItemClick = () => {
    // No cerramos el menú al hacer clic en un ítem, solo cuando se cierra desde el Header
    // o cuando se hace clic fuera
  };

  const renderMenuItem = (item: MenuItem, isSubmenu = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = activeSubmenu === item.slug;
    const isLoading = loadingSlug === item.slug;
    const metadata = metadataCache[item.slug];

    return (
      <div 
        key={item.slug}
        className="relative group"
        onMouseEnter={() => handleItemHover(item.slug)}
        onMouseLeave={handleMouseLeave}
      >
        <Link 
          href={`/${item.slug === 'home-2' ? '' : item.slug}`}
          className={`flex items-center justify-between px-4 py-3 text-gray-700 hover:text-purple-600 font-medium transition-colors ${
            isSubmenu ? 'text-sm' : 'text-base'
          }`}
          onClick={() => {
            handleItemClick();
            onClose();
          }}
        >
          <span>{item.title}</span>
          {hasChildren && (
            <svg 
              className={`w-4 h-4 ml-2 transition-transform ${isActive ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </Link>

        {hasChildren && (
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-lg z-50 ${
                  isSubmenu ? 'top-0 left-full ml-1' : ''
                }`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="p-4">
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    </div>
                  ) : metadata ? (
                    <div className="mb-4">
                      <h4 className="font-bold text-gray-900 mb-2">{metadata.yoast_wpseo_title}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {metadata.yoast_wpseo_metadesc}
                      </p>
                      <Link 
                        href={`/${item.slug}`} 
                        className="text-sm text-purple-600 hover:underline"
                        onClick={() => onClose()}
                      >
                        Ver más →
                      </Link>
                    </div>
                  ) : null}
                  
                  <div className="border-t border-gray-100 pt-3">
                    {item.children?.map(child => renderMenuItem(child, true))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="fixed inset-x-0 top-16 bg-white/95 backdrop-blur-sm shadow-lg z-40 border-b border-gray-100"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {menuItems.map(item => (
            <div key={item.slug} className="relative">
              {renderMenuItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
