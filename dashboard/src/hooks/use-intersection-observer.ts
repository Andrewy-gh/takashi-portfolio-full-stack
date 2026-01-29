import { useCallback } from 'react';

export function useIntersectionObserver() {
  const observeElements = useCallback((elements: Element[]) => {
    const appearOnScroll = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove('opacity-0');
          entry.target.classList.add('opacity-100');
          appearOnScroll.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    elements.forEach((element) => {
      if (element) appearOnScroll.observe(element);
    });

    return () => appearOnScroll.disconnect();
  }, []);

  return { observeElements };
}
