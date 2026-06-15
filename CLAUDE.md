# CLAUDE.md — GeoWatch Indonesia
## Session Context File untuk Claude Code CLI

> **WAJIB DIBACA PERTAMA** di setiap sesi Claude Code baru.
> File ini menjaga kontinuitas context antar sesi yang stateless.

---

## Identitas Project

**Nama:** GeoWatch Indonesia
**Deskripsi:** Website peta interaktif gunung api aktif dan potensi panas bumi Indonesia dengan visualisasi grid kotak berwarna berdasarkan tingkat aktivitas (Normal/Waspada/Siaga/Awas).
**Stack:** Next.js 14 + React + TypeScript + Leaflet.js + Tailwind CSS + Zustand + SWR
**Data Source:** MAGMA Indonesia (PVMBG/Badan Geologi ESDM) — `magma.esdm.go.id`
**Deployment:** Vercel

---

## Aturan Coding yang WAJIB Diikuti

### TypeScript
- Strict mode aktif — tidak ada `any` kecuali ada komentar justifikasi
- Selalu define interface/type untuk data dari API
- Gunakan enum `VolcanoLevel` dari `lib/types.ts` untuk level status

### React / Next.js
- Map component (Leaflet) WAJIB `dynamic import` dengan `ssr: false`
- API routes di `app/api/` menggunakan `next/cache` untuk revalidation
- Tidak ada `useEffect` untuk data fetching — gunakan SWR hook

### Peta / Leaflet
- Seluruh logika marker/layer di dalam `components/Map/`
- Kotak gunung api dirender sebagai `L.Rectangle` atau `L.DivIcon` dengan CSS class level
- Koordinat selalu dalam format `[lat, lng]` (Leaflet convention)
- Indonesia bounds: `[[-11, 95], [6, 141]]` — gunakan untuk `fitBounds()`

### Styling
- Dark mode default via `className="dark"` di root `<html>`
- Warna level HANYA dari `LEVEL_CONFIG` constant — jangan hardcode hex
- Tailwind classes untuk layout, CSS variables untuk warna dinamis peta

### Data & State
- Data gunung api di-store di Zustand `mapStore.ts`
- Selalu ada fallback ke `public/data/volcanoes-fallback.json` jika API gagal
- Timestamp last refresh selalu ditampilkan di UI

---

## File Kritis

| File | Peran |
|------|-------|
| `lib/types.ts` | Interface & enum — source of truth untuk tipe data |
| `lib/magma.ts` | Scraper/parser HTML dari MAGMA ESDM |
| `lib/volcanoes-static.ts` | Fallback data 127 gunung api |
| `app/api/volcanoes/route.ts` | Backend proxy — menghindari CORS |
| `components/Map/MapContainer.tsx` | Root map component (dynamic import) |
| `store/mapStore.ts` | Zustand global state |
| `PROGRESS.md` | Task tracker — update setelah setiap task selesai |
| `DECISIONS.md` | Catat setiap keputusan arsitektur saat implementasi |

---

## Data Schema

```typescript
// lib/types.ts

export enum VolcanoLevel {
  NORMAL  = 1,
  WASPADA = 2,
  SIAGA   = 3,
  AWAS    = 4,
}

export interface Volcano {
  id: string;           // kode unik, contoh: "MER" untuk Merapi
  name: string;         // "Gunung Merapi"
  province: string;     // "Jawa Tengah / DIY"
  regency: string;      // "Sleman"
  lat: number;          // -7.5407
  lng: number;          // 110.4457
  elevation: number;    // 2968 (mdpl)
  level: VolcanoLevel;  // 1-4
  lastReport: string;   // ISO date string
  reportUrl: string;    // URL ke laporan MAGMA
  isGeothermal: boolean; // apakah wilayah ini juga punya potensi panas bumi
}

export interface GeothermalArea {
  id: string;
  name: string;
  province: string;
  potentialMW: number;   // estimasi MW
  coordinates: [number, number][]; // polygon
}

export interface MapState {
  volcanoes: Volcano[];
  selectedVolcano: Volcano | null;
  showGeothermal: boolean;
  lastRefresh: Date | null;
  isLoading: boolean;
  error: string | null;
}
```

---

## MAGMA API Notes

MAGMA Indonesia **tidak memiliki REST API publik resmi**.
Pendekatan yang digunakan:

1. **API Route sebagai proxy** (`/api/volcanoes`) melakukan request ke `magma.esdm.go.id/v1/gunung-api/tingkat-aktivitas`
2. **Cheerio** mem-parse HTML response untuk ekstrak: nama gunung, level status, link laporan
3. **Koordinat** diambil dari data statis (Smithsonian GVP + cross-validate manual)
4. **Cache** 30 menit di server, fallback ke JSON statis jika gagal
5. Selalu set `User-Agent` header yang valid saat request ke MAGMA

```typescript
// Contoh struktur response dari scraping MAGMA:
// URL: https://magma.esdm.go.id/v1/gunung-api/tingkat-aktivitas
// Parse tabel/list yang berisi: nama gunung, level, link detail
```

---

## Perintah Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build production
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

---

## Konvensi Git Commit

```
feat: tambah layer geothermal dengan toggle
fix: perbaiki parsing HTML MAGMA untuk level Siaga
data: update fallback JSON data gunung api
style: perbaiki warna marker di dark mode
refactor: pisahkan scraper logic ke lib/magma.ts
docs: update PROGRESS.md setelah implementasi map
```

---

## Context Penting

- Developer: Ananda (Jakarta, Indonesia)
- Bahasa UI: Bahasa Indonesia
- Target: Semua browser modern, mobile-first
- Tidak ada login/auth — aplikasi publik
- Indonesia timezone: WIB (UTC+7) untuk tampilan timestamp

---

*Update file ini jika ada perubahan arsitektur signifikan.*
*Baca PROGRESS.md untuk status task terkini.*
