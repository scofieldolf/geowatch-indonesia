// app/api/volcanoes/route.ts
import { NextResponse } from 'next/server';
import { fetchMagmaVolcanoes } from '@/lib/magma';
import { getFallbackVolcanoes } from '@/lib/volcanoes-static';

export const revalidate = 1800; // Revalidate cache every 30 minutes (1800 seconds)

export async function GET() {
  try {
    const volcanoes = await fetchMagmaVolcanoes();

    // Check if the source is actually live or if it used static fallback
    // We can compare the returned list to see if any has level different from fallback,
    // or we can simply trust the graceful handler in fetchMagmaVolcanoes.
    // Let's add a Cache-Control header for client-side caching as well
    const response = NextResponse.json({
      volcanoes,
      fetchedAt: new Date().toISOString(),
    });

    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=60');
    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API volcanoes] Critical error in GET route:', error);

    // Absolute fallback: if everything fails, return static data with HTTP 200 to keep map functional
    try {
      const staticData = getFallbackVolcanoes().map((v) => ({
        ...v,
        lastReport: new Date().toISOString(),
      }));

      return NextResponse.json({
        volcanoes: staticData,
        fetchedAt: new Date().toISOString(),
        error: 'Scraper failed critically, using static fallback.',
      });
    } catch {
      return NextResponse.json(
        { error: 'Critical error fetching volcano data', details: errorMessage },
        { status: 500 }
      );
    }
  }
}
