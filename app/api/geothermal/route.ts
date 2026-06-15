import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'geothermal-indonesia.geojson');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const geojsonData = JSON.parse(fileContent);

    const response = NextResponse.json(geojsonData);

    // Cache for 1 hour, serve stale in background for up to 24 hours
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API Geothermal] Error loading geojson:', errorMessage);

    return NextResponse.json(
      { error: 'Failed to load geothermal data', details: errorMessage },
      { status: 500 }
    );
  }
}
