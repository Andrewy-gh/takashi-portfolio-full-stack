import { useState } from 'react';

export function useFilter() {
  const [filter, setFilter] = useState(null);

  const handleFilterChange = (filter) => {
    setFilter(filter);
  };
  return { filter, handleFilterChange };
}
