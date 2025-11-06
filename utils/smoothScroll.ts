export const smoothScrollTo = (targetId: string) => {
  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    const headerOffset = 100; // Adjust this value based on your header height
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

export const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
  e.preventDefault();
  smoothScrollTo(targetId);
  // Update URL without page reload
  if (window.history.pushState) {
    window.history.pushState(null, '', `#${targetId}`);
  } else {
    window.location.hash = `#${targetId}`;
  }
};
