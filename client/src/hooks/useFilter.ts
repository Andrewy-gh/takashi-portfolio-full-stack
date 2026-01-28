import { useState } from 'react';

export function useFilter() {
  const [filter, setFilter] = useState<string | null>(null);

  const handleFilterChange = (nextFilter: string | null) => {
    setFilter(nextFilter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return { filter, handleFilterChange };
}
