import useSWR from 'swr';
import { useEffect } from 'react';
import { useMapStore } from '@/store/mapStore';
import type { Volcano } from '@/lib/types';

interface VolcanoApiResponse {
  volcanoes: Volcano[];
  fetchedAt: string;
  error?: string;
}

const fetcher = async (url: string): Promise<VolcanoApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Gagal mengambil data gunung api dari server.');
  }
  return res.json();
};

export function useVolcanoes() {
  const { setVolcanoes, setLoading, setError, setLastRefresh } = useMapStore();

  const { data, error, isValidating, mutate } = useSWR<VolcanoApiResponse>(
    '/api/volcanoes',
    fetcher,
    {
      refreshInterval: 1800000, // 30 minutes automatic revalidation
      revalidateOnFocus: false,
      dedupingInterval: 60000,   // 1 minute deduping
    }
  );

  // Sync loading state
  useEffect(() => {
    setLoading(isValidating);
  }, [isValidating, setLoading]);

  // Sync volcanoes data and last updated timestamp
  useEffect(() => {
    if (data?.volcanoes) {
      setVolcanoes(data.volcanoes);
      setLastRefresh(new Date(data.fetchedAt || new Date()));
    }
  }, [data, setVolcanoes, setLastRefresh]);

  // Sync error state
  useEffect(() => {
    if (error) {
      setError(error.message || 'Terjadi kesalahan saat sinkronisasi.');
    } else if (data?.error) {
      setError(data.error);
    } else {
      setError(null);
    }
  }, [error, data, setError]);

  return {
    volcanoes: data?.volcanoes || [],
    isLoading: isValidating,
    error: error || data?.error ? (error?.message || data?.error) : null,
    refresh: mutate,
  };
}
