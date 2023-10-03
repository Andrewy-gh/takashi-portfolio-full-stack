import { useState } from 'react';

export function useFilter() {
  const [filter, setFilter] = useState(null);

  const handleFilterChange = (filter) => {
    setFilter(filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return { filter, handleFilterChange };
}
