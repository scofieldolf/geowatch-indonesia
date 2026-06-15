import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Gagal mengambil data panas bumi.');
  }
  return res.json();
};

export function useGeothermal() {
  const { data, error, isValidating } = useSWR(
    '/api/geothermal',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000, // 1 hour deduping for static geojson
    }
  );

  return {
    geojsonData: data,
    isLoading: isValidating,
    error: error ? error.message : null,
  };
}
