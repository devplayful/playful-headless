export const smoothScrollTo = (targetId: string, retryCount = 0) => {
  // Esperar un breve momento para asegurar que el DOM esté listo
  setTimeout(() => {
    const targetElement = document.getElementById(targetId);
    
    if (!targetElement && retryCount < 3) {
      // Reintentar si el elemento no se encuentra inmediatamente
      return smoothScrollTo(targetId, retryCount + 1);
    }
    
    if (targetElement) {
      const headerOffset = 100; // Ajusta según la altura de tu encabezado
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      // Usar scrollIntoView como respaldo
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, retryCount > 0 ? 100 : 0); // Esperar 100ms entre reintentos
};

export const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
  e.preventDefault();
  
  // Actualizar la URL primero
  if (window.history.pushState) {
    window.history.pushState(null, '', `#${targetId}`);
  } else {
    window.location.hash = `#${targetId}`;
  }
  
  // Luego hacer el scroll
  smoothScrollTo(targetId);
  
  // Forzar el enfoque para mejorar la accesibilidad
  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    targetElement.setAttribute('tabindex', '-1');
    targetElement.focus({ preventScroll: true });
  }
};
