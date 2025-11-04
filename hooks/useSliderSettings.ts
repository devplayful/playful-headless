"use client";

import { useState, useEffect } from 'react';

const getSettings = (width: number) => {
  if (width < 768) {
    return {
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      dots: true,
    };
  }
  if (width < 1024) {
    return {
      slidesToShow: 2,
      slidesToScroll: 1,
      arrows: true,
      dots: true,
    };
  }
  return {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
  };
};

export const useSliderSettings = () => {
  const [settings, setSettings] = useState(getSettings(1024)); // Default to desktop

  useEffect(() => {
    const handleResize = () => {
      setSettings(getSettings(window.innerWidth));
    };

    // Set initial settings
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return settings;
};
