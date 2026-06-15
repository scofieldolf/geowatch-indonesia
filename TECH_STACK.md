# Tech Stack & Architecture Decision Record (ADR)
## GeoWatch Indonesia

**Versi:** 1.0.0
**Tanggal:** 15 Juni 2026

---

## Stack Keputusan

### Frontend Framework: **Next.js 14 (App Router)**
**Alasan:**
- SSR/SSG untuk SEO dan performa awal
- API Routes built-in → proxy ke MAGMA ESDM tanpa CORS issue
- React Server Components untuk data fetching efisien
- Vercel deployment zero-config

### Map Library: **Leaflet.js + react-leaflet**
**Alasan:**
- Open-source, ringan (~40KB), tidak memerlukan API key
- Indonesia coverage sempurna dengan OSM tiles
- Dukungan GeoJSON layer untuk data potensi panas bumi
- Alternatif (MapboxGL, Google Maps) memerlukan billing

### Styling: **Tailwind CSS + shadcn/ui**
**Alasan:**
- Utility-first cepat untuk dark mode
- shadcn/ui untuk komponen panel, badge, toggle tanpa bloat
- CSS variables untuk theming warna level gunung api

### Data Fetching Backend: **Next.js API Routes (built-in)**
**Alasan:**
- Proxy request ke MAGMA untuk menghindari CORS
- Cache response di server (revalidate 30 menit)
- Fallback ke JSON statis jika MAGMA tidak responsif

### HTTP Client: **Axios + Cheerio** (di API route)
**Alasan:**
- Axios untuk fetch HTML dari MAGMA
- Cheerio untuk parse HTML response (server-side only)
- Tidak ada REST API publik dari MAGMA, scraping diperlukan

### State Management: **Zustand**
**Alasan:**
- Ringan, tidak boilerplate (vs Redux)
- Menyimpan: selectedVolcano, activeLayer, lastRefresh, filterState

### TypeScript: **Strict mode**
**Alasan:**
- Type safety untuk koordinat (lat/lng), status level enum
- Interface untuk data gunung api dari MAGMA

### Deployment: **Vercel**
**Alasan:**
- Zero-config Next.js hosting
- Edge functions untuk caching
- Free tier cukup untuk traffic awal

---

## Struktur Folder

```
geowatch-indonesia/
├── app/
│   ├── page.tsx                    # Root page - render peta
│   ├── layout.tsx                  # Root layout + metadata
│   ├── globals.css                 # Tailwind + custom CSS vars
│   └── api/
│       ├── volcanoes/
│       │   └── route.ts            # GET /api/volcanoes → proxy MAGMA
│       └── geothermal/
│           └── route.ts            # GET /api/geothermal → static GeoJSON
├── components/
│   ├── Map/
│   │   ├── MapContainer.tsx        # Leaflet map wrapper (dynamic import)
│   │   ├── VolcanoGrid.tsx         # Grid marker layer
│   │   ├── GeothermalLayer.tsx     # Panas bumi overlay layer
│   │   └── MapLegend.tsx           # Legenda warna
│   ├── Panel/
│   │   ├── SidePanel.tsx           # Detail panel desktop
│   │   ├── BottomSheet.tsx         # Detail panel mobile
│   │   └── VolcanoCard.tsx         # Info card gunung api
│   ├── Dashboard/
│   │   ├── StatusBar.tsx           # Bar ringkasan jumlah per level
│   │   ├── RefreshButton.tsx       # Manual refresh + timestamp
│   │   └── LayerToggle.tsx         # Toggle geothermal layer
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── magma.ts                    # Scraper/parser MAGMA HTML
│   ├── volcanoes-static.ts         # Fallback data statis 127 gunung api
│   ├── geothermal-static.ts        # Data potensi panas bumi GeoJSON
│   └── types.ts                    # TypeScript interfaces
├── hooks/
│   ├── useVolcanoes.ts             # SWR hook fetch data gunung api
│   └── useGeothermal.ts            # Hook fetch data geothermal
├── store/
│   └── mapStore.ts                 # Zustand global state
├── public/
│   └── data/
│       ├── volcanoes-fallback.json  # Static fallback data
│       └── geothermal-indonesia.geojson
├── CLAUDE.md                       # Session context untuk Claude Code
├── PROGRESS.md                     # Status implementasi per task
└── DECISIONS.md                    # ADR tambahan saat development
```

---

## Color Coding System

```typescript
// lib/types.ts
export enum VolcanoLevel {
  NORMAL  = 1,  // Level I  → Hijau  #22c55e
  WASPADA = 2,  // Level II → Kuning #eab308
  SIAGA   = 3,  // Level III→ Oranye #f97316
  AWAS    = 4,  // Level IV → Merah  #ef4444
}

export const LEVEL_CONFIG = {
  [VolcanoLevel.NORMAL]:  { color: '#22c55e', label: 'Normal',  bg: 'bg-green-500' },
  [VolcanoLevel.WASPADA]: { color: '#eab308', label: 'Waspada', bg: 'bg-yellow-500' },
  [VolcanoLevel.SIAGA]:   { color: '#f97316', label: 'Siaga',   bg: 'bg-orange-500' },
  [VolcanoLevel.AWAS]:    { color: '#ef4444', label: 'Awas',    bg: 'bg-red-500' },
} as const;
```

---

## Data Flow Architecture

```
Browser
  │
  ├─ useVolcanoes() ──→ GET /api/volcanoes
  │                           │
  │                     Next.js API Route
  │                           │
  │               ┌─── fetch MAGMA HTML ──→ magma.esdm.go.id
  │               │           │
  │               │     Cheerio parse
  │               │           │
  │               │     Cache (30 menit)
  │               │           │
  │               └─── fallback: volcanoes-fallback.json
  │
  ├─ MapContainer ──→ Leaflet.js
  │                       │
  │                  VolcanoGrid (kotak per gunung api)
  │                       │
  │                  GeothermalLayer (GeoJSON polygon)
  │
  └─ SidePanel / BottomSheet ──→ Zustand selectedVolcano
```

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "axios": "^1.7.0",
    "cheerio": "^1.0.0",
    "zustand": "^4.5.0",
    "swr": "^2.2.5",
    "tailwindcss": "^3.4.0",
    "@types/leaflet": "^1.9.12"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```
