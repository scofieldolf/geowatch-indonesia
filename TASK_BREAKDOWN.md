# Task Breakdown — GeoWatch Indonesia
## Panduan Implementasi Detail untuk Claude Code CLI

**Versi:** 1.0.0
**Tanggal:** 15 Juni 2026

> Dokumen ini menjadi panduan step-by-step untuk implementasi.
> Setiap task memiliki acceptance criteria dan kode starter yang dibutuhkan.

---

## TASK 0: Inisialisasi Project

### T0.1 — Create Next.js App

```bash
npx create-next-app@14 geowatch-indonesia \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd geowatch-indonesia
```

### T0.2 — Install Dependencies

```bash
npm install leaflet react-leaflet zustand swr axios cheerio
npm install -D @types/leaflet @types/node
```

### T0.3 — Konfigurasi `tailwind.config.ts`

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        volcano: {
          normal:  '#22c55e',
          waspada: '#eab308',
          siaga:   '#f97316',
          awas:    '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
export default config
```

### T0.4 — `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f8fafc;
  --text-muted: #94a3b8;
  --border: #334155;
}

/* Override Leaflet untuk dark mode */
.leaflet-container {
  background: #1a2332 !important;
}

.leaflet-tile {
  filter: brightness(0.7) saturate(0.8) !important;
}
```

---

## TASK 1: Types & Schema

### T1.1 — `lib/types.ts`

```typescript
// lib/types.ts

export enum VolcanoLevel {
  NORMAL  = 1,
  WASPADA = 2,
  SIAGA   = 3,
  AWAS    = 4,
}

export const LEVEL_CONFIG = {
  [VolcanoLevel.NORMAL]: {
    color: '#22c55e',
    label: 'Normal',
    labelEn: 'Normal',
    description: 'Aktivitas normal, tidak ada perubahan signifikan',
    cssClass: 'level-normal',
  },
  [VolcanoLevel.WASPADA]: {
    color: '#eab308',
    label: 'Waspada',
    labelEn: 'Advisory',
    description: 'Mulai ada peningkatan aktivitas seismik atau visual',
    cssClass: 'level-waspada',
  },
  [VolcanoLevel.SIAGA]: {
    color: '#f97316',
    label: 'Siaga',
    labelEn: 'Watch',
    description: 'Peningkatan signifikan, erupsi mungkin terjadi',
    cssClass: 'level-siaga',
  },
  [VolcanoLevel.AWAS]: {
    color: '#ef4444',
    label: 'Awas',
    labelEn: 'Warning',
    description: 'Erupsi besar kemungkinan besar akan segera terjadi',
    cssClass: 'level-awas',
  },
} as const;

export interface Volcano {
  id: string;
  name: string;
  province: string;
  regency: string;
  lat: number;
  lng: number;
  elevation: number; // mdpl
  level: VolcanoLevel;
  lastReport: string; // ISO date string
  reportUrl: string;
  isGeothermal: boolean;
  gvpId?: string; // Smithsonian GVP ID
}

export interface GeothermalArea {
  id: string;
  name: string;
  province: string;
  potentialMW: number;
  status: 'eksplorasi' | 'eksploitasi' | 'potensial';
  coordinates: [number, number][];
}

export interface MAGMAStatusResponse {
  volcanoes: Volcano[];
  fetchedAt: string;
  source: 'magma_live' | 'fallback_static';
}
```

---

## TASK 2: Data Fallback (127 Gunung Api)

### T2.1 — `public/data/volcanoes-fallback.json`

File ini WAJIB dibuat dengan minimal data 30 gunung api prioritas.
Format:

```json
[
  {
    "id": "MER",
    "name": "Gunung Merapi",
    "province": "Jawa Tengah / DIY",
    "regency": "Sleman / Magelang / Klaten / Boyolali",
    "lat": -7.5407,
    "lng": 110.4457,
    "elevation": 2968,
    "level": 2,
    "lastReport": "2026-06-15T00:00:00.000Z",
    "reportUrl": "https://magma.esdm.go.id/v1/gunung-api/laporan",
    "isGeothermal": true,
    "gvpId": "263250"
  },
  {
    "id": "KRA",
    "name": "Krakatau",
    "province": "Lampung / Banten",
    "regency": "Lampung Selatan",
    "lat": -6.1023,
    "lng": 105.4234,
    "elevation": 157,
    "level": 2,
    "lastReport": "2026-06-15T00:00:00.000Z",
    "reportUrl": "https://magma.esdm.go.id/v1/gunung-api/laporan",
    "isGeothermal": false,
    "gvpId": "262000"
  }
]
```

**Gunung api yang WAJIB ada di fallback data (prioritas tinggi):**
Merapi, Krakatau Anak, Agung, Batur, Bromo, Semeru, Ijen, Kerinci, Sinabung,
Lokon, Soputan, Mahawu, Karangetang, Ruang, Dukono, Ibu, Gamalama, Banda Api,
Kie Besi (Makian), Awu, Tangkuban Perahu, Papandayan, Galunggung, Slamet,
Merbabu (dormant), Kelud, Raung, Lewotobi Laki-laki, Egon, Ili Lewotolok

---

## TASK 3: MAGMA Scraper

### T3.1 — `lib/magma.ts`

```typescript
// lib/magma.ts
import * as cheerio from 'cheerio';
import { VolcanoLevel, type Volcano } from './types';
import { getFallbackVolcanoes } from './volcanoes-static';

const MAGMA_BASE_URL = 'https://magma.esdm.go.id';
const MAGMA_STATUS_URL = `${MAGMA_BASE_URL}/v1/gunung-api/tingkat-aktivitas`;

function parseLevelFromText(text: string): VolcanoLevel {
  const lower = text.toLowerCase().trim();
  if (lower.includes('awas') || lower.includes('level iv') || lower.includes('4'))
    return VolcanoLevel.AWAS;
  if (lower.includes('siaga') || lower.includes('level iii') || lower.includes('3'))
    return VolcanoLevel.SIAGA;
  if (lower.includes('waspada') || lower.includes('level ii') || lower.includes('2'))
    return VolcanoLevel.WASPADA;
  return VolcanoLevel.NORMAL;
}

export async function scrapeMAGMAStatus(): Promise<{
  data: Partial<Volcano>[];
  source: 'magma_live' | 'fallback_static';
}> {
  try {
    const response = await fetch(MAGMA_STATUS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
        'Referer': 'https://magma.esdm.go.id/',
      },
      next: { revalidate: 1800 }, // Cache 30 menit
    });

    if (!response.ok) {
      throw new Error(`MAGMA responded with ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: Partial<Volcano>[] = [];

    // Parse tabel atau list dari HTML MAGMA
    // Struktur HTML perlu di-inspect saat implementasi
    // Ini adalah template — sesuaikan dengan struktur HTML aktual MAGMA

    $('table tr, .volcano-item, .ga-item').each((_, el) => {
      const nameEl = $(el).find('.name, td:nth-child(1), .ga-name');
      const levelEl = $(el).find('.level, td:nth-child(2), .ga-level');
      const linkEl = $(el).find('a');

      const name = nameEl.text().trim();
      const levelText = levelEl.text().trim();
      const href = linkEl.attr('href');

      if (name && levelText) {
        results.push({
          name: name.replace(/^(G\.|Gunung|G )/i, 'Gunung ').trim(),
          level: parseLevelFromText(levelText),
          reportUrl: href ? (href.startsWith('http') ? href : `${MAGMA_BASE_URL}${href}`) : MAGMA_STATUS_URL,
          lastReport: new Date().toISOString(),
        });
      }
    });

    if (results.length === 0) {
      throw new Error('No volcano data parsed from MAGMA HTML — structure may have changed');
    }

    return { data: results, source: 'magma_live' };

  } catch (error) {
    console.error('[magma.ts] Scraping failed, using fallback:', error);
    const fallback = getFallbackVolcanoes();
    return {
      data: fallback,
      source: 'fallback_static',
    };
  }
}
```

---

## TASK 4: API Route

### T4.1 — `app/api/volcanoes/route.ts`

```typescript
// app/api/volcanoes/route.ts
import { NextResponse } from 'next/server';
import { scrapeMAGMAStatus } from '@/lib/magma';
import { getFallbackVolcanoes } from '@/lib/volcanoes-static';
import type { MAGMAStatusResponse } from '@/lib/types';

export const revalidate = 1800; // 30 menit

export async function GET() {
  try {
    const { data: liveData, source } = await scrapeMAGMAStatus();
    const fallback = getFallbackVolcanoes();

    // Merge: gunakan koordinat dari fallback, status dari live data
    const merged = fallback.map(volcano => {
      const liveMatch = liveData.find(live =>
        live.name?.toLowerCase().includes(
          volcano.name.toLowerCase().replace('gunung ', '').split(' ')[0]
        )
      );
      return liveMatch ? { ...volcano, ...liveMatch, id: volcano.id, lat: volcano.lat, lng: volcano.lng } : volcano;
    });

    const response: MAGMAStatusResponse = {
      volcanoes: merged,
      fetchedAt: new Date().toISOString(),
      source,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });

  } catch (error) {
    console.error('[/api/volcanoes] Error:', error);
    return NextResponse.json(
      {
        volcanoes: getFallbackVolcanoes(),
        fetchedAt: new Date().toISOString(),
        source: 'fallback_static' as const,
      },
      { status: 200 } // Return 200 dengan fallback, jangan 500
    );
  }
}
```

---

## TASK 5: Map Components

### T5.1 — `components/Map/MapContainer.tsx`

```typescript
// components/Map/MapContainer.tsx
'use client';

import dynamic from 'next/dynamic';

// WAJIB: dynamic import tanpa SSR untuk Leaflet
const DynamicMap = dynamic(
  () => import('./MapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Memuat peta...</div>
      </div>
    ),
  }
);

export function MapContainer() {
  return (
    <div className="relative w-full h-full">
      <DynamicMap />
    </div>
  );
}
```

### T5.2 — `components/Map/MapInner.tsx`

```typescript
// components/Map/MapInner.tsx
'use client';

import { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { VolcanoGrid } from './VolcanoGrid';
import { MapLegend } from './MapLegend';
import { useVolcanoes } from '@/hooks/useVolcanoes';

// Indonesia bounds
const INDONESIA_BOUNDS: [[number, number], [number, number]] = [[-11, 95], [6, 141]];
const INDONESIA_CENTER: [number, number] = [-2.5, 118];

function MapBoundsFitter() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(INDONESIA_BOUNDS, { padding: [20, 20] });
  }, [map]);
  return null;
}

export default function MapInner() {
  const { volcanoes } = useVolcanoes();

  return (
    <LeafletMap
      center={INDONESIA_CENTER}
      zoom={5}
      className="w-full h-full"
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="dark-tiles"
      />
      <MapBoundsFitter />
      <VolcanoGrid volcanoes={volcanoes} />
      <MapLegend />
    </LeafletMap>
  );
}
```

### T5.3 — `components/Map/VolcanoGrid.tsx`

```typescript
// components/Map/VolcanoGrid.tsx
'use client';

import { Rectangle, Tooltip } from 'react-leaflet';
import type { Volcano } from '@/lib/types';
import { LEVEL_CONFIG } from '@/lib/types';
import { useMapStore } from '@/store/mapStore';

interface Props {
  volcanoes: Volcano[];
}

// Ukuran kotak per zoom level (dalam derajat)
const BOX_SIZE = 0.3; // 0.3 derajat ≈ ~33km

export function VolcanoGrid({ volcanoes }: Props) {
  const setSelectedVolcano = useMapStore(s => s.setSelectedVolcano);

  return (
    <>
      {volcanoes.map(volcano => {
        const config = LEVEL_CONFIG[volcano.level];
        const bounds: [[number, number], [number, number]] = [
          [volcano.lat - BOX_SIZE / 2, volcano.lng - BOX_SIZE / 2],
          [volcano.lat + BOX_SIZE / 2, volcano.lng + BOX_SIZE / 2],
        ];

        return (
          <Rectangle
            key={volcano.id}
            bounds={bounds}
            pathOptions={{
              color: config.color,
              fillColor: config.color,
              fillOpacity: 0.7,
              weight: 1,
              opacity: 0.9,
            }}
            eventHandlers={{
              click: () => setSelectedVolcano(volcano),
              mouseover: (e) => e.target.setStyle({ fillOpacity: 1 }),
              mouseout: (e) => e.target.setStyle({ fillOpacity: 0.7 }),
            }}
          >
            <Tooltip>
              <div className="text-xs font-medium">
                <div>{volcano.name}</div>
                <div className="font-bold" style={{ color: config.color }}>
                  {config.label}
                </div>
              </div>
            </Tooltip>
          </Rectangle>
        );
      })}
    </>
  );
}
```

---

## TASK 6: Zustand Store

### T6.1 — `store/mapStore.ts`

```typescript
// store/mapStore.ts
import { create } from 'zustand';
import type { Volcano } from '@/lib/types';

interface MapStore {
  volcanoes: Volcano[];
  selectedVolcano: Volcano | null;
  showGeothermal: boolean;
  lastRefresh: Date | null;
  isLoading: boolean;
  error: string | null;

  setVolcanoes: (volcanoes: Volcano[]) => void;
  setSelectedVolcano: (volcano: Volcano | null) => void;
  toggleGeothermal: () => void;
  setLastRefresh: (date: Date) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  volcanoes: [],
  selectedVolcano: null,
  showGeothermal: false,
  lastRefresh: null,
  isLoading: false,
  error: null,

  setVolcanoes: (volcanoes) => set({ volcanoes }),
  setSelectedVolcano: (selectedVolcano) => set({ selectedVolcano }),
  toggleGeothermal: () => set((s) => ({ showGeothermal: !s.showGeothermal })),
  setLastRefresh: (lastRefresh) => set({ lastRefresh }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
```

---

## TASK 7: Root Page Layout

### T7.1 — `app/page.tsx`

```typescript
// app/page.tsx
import { MapContainer } from '@/components/Map/MapContainer';
import { StatusBar } from '@/components/Dashboard/StatusBar';
import { RefreshButton } from '@/components/Dashboard/RefreshButton';
import { LayerToggle } from '@/components/Dashboard/LayerToggle';
import { SidePanel } from '@/components/Panel/SidePanel';

export default function HomePage() {
  return (
    <main className="flex flex-col h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-orange-500 rounded animate-pulse" />
          <h1 className="font-bold text-base tracking-tight">
            GeoWatch Indonesia
          </h1>
          <span className="text-slate-400 text-xs hidden sm:block">
            Peta Gunung Api & Potensi Panas Bumi
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LayerToggle />
          <RefreshButton />
        </div>
      </header>

      {/* Status Bar */}
      <StatusBar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer />
        </div>

        {/* Side Panel (desktop only) */}
        <SidePanel />
      </div>
    </main>
  );
}
```

---

## Urutan Implementasi yang Disarankan

1. **T0** → Setup project dan install semua dependencies
2. **T1** → Buat `lib/types.ts` terlebih dahulu (semua task bergantung ini)
3. **T6** → Buat `store/mapStore.ts`
4. **T2** → Buat fallback JSON data (minimal 30 gunung api)
5. **T3** → Buat `lib/magma.ts` scraper
6. **T4** → Buat API route `/api/volcanoes`
7. **T5** → Buat semua Map components
8. **T7** → Wiring di `app/page.tsx`
9. Test di browser, fix issues
10. Build dan deploy ke Vercel

---

*Dokumen ini dibuat sebagai panduan implementasi. Update PROGRESS.md setelah setiap task selesai.*
