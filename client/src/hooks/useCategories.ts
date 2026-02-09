import { useEffect, useState } from 'react';
import { getCategoryPreviews, type CategoryPreview } from '../services/categories';

export function useCategories() {
  const [categories, setCategories] = useState<CategoryPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      try {
        const next = await getCategoryPreviews();
        if (cancelled) return;
        setCategories(next);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : 'Unable to load categories';
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, isLoading, error };
}

