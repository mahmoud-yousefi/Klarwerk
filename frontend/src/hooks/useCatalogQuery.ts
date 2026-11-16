import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { catalogService } from '@/services/catalog.service';
import { isRemoteApiEnabled } from '@/services/api';
import { queryCatalog } from '@/lib/catalog';
import type { CatalogQuery } from '@/types/catalog';

export function useCatalog(query: CatalogQuery) {
  const key = JSON.stringify(query);
  const initial = useMemo(() => queryCatalog(query), [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return useQuery({
    queryKey: ['catalog', key],
    queryFn: () => catalogService.list(query),
    initialData: isRemoteApiEnabled ? undefined : initial,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}
