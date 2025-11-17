'use client';

import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export function BodyClassManager() {
  const { bodyBgColor } = useTheme();

  useEffect(() => {
    // Set background image
    const bgStyle = document.body.style;
    bgStyle.backgroundImage = 'url(/images/background.webp)';
    bgStyle.backgroundSize = 'cover';
    bgStyle.backgroundPosition = 'center';
    bgStyle.backgroundRepeat = 'no-repeat';
    bgStyle.backgroundAttachment = 'fixed';

    // Set background color with opacity
    if (bodyBgColor === 'casos-exito') {
      bgStyle.backgroundColor = 'rgba(87, 36, 171, 0.9)';
    } else {
      bgStyle.backgroundColor = 'rgba(233, 215, 255, 0.9)';
    }

    // Cleanup function to reset styles when component unmounts
    return () => {
      bgStyle.backgroundImage = '';
      bgStyle.backgroundColor = '';
      bgStyle.backgroundSize = '';
      bgStyle.backgroundPosition = '';
      bgStyle.backgroundRepeat = '';
      bgStyle.backgroundAttachment = '';
    };
  }, [bodyBgColor]);

  return null;
}
