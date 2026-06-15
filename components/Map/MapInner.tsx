'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VolcanoGrid } from './VolcanoGrid';
import { MapLegend } from './MapLegend';
import { useEffect } from 'react';
import { useVolcanoes } from '@/hooks/useVolcanoes';

export default function MapInner() {
  const { volcanoes, isLoading, error } = useVolcanoes();

  // Set up default Leaflet marker icons if needed
  useEffect(() => {
    // Leaflet icon fix for Next.js SSR/webpack packaging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const bounds: L.LatLngBoundsExpression = [
    [-11, 95],
    [6, 141],
  ];

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <MapContainer
        bounds={bounds}
        center={[-2.5, 118]}
        zoom={5}
        className="w-full h-full rounded-xl border border-slate-700/50 shadow-2xl z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <VolcanoGrid volcanoes={volcanoes} />
        <MapLegend />
      </MapContainer>

      {isLoading && (
        <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 border border-slate-700 p-2 rounded text-xs text-slate-350 flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          </svg>
          Memperbarui data...
        </div>
      )}

      {error && (
        <div className="absolute top-4 right-4 z-[1000] bg-red-950/90 border border-red-800 p-2 rounded text-xs text-red-200">
          Error: {error}
        </div>
      )}
    </div>
  );
}
