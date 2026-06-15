# PROGRESS.md — GeoWatch Indonesia
## Task Tracker & Implementation Status

**Last Updated:** 15 Juni 2026
**Current Phase:** 🔴 Phase 0 — Project Setup (BELUM MULAI)

---

## Legend
- 🔴 Belum dimulai
- 🟡 In Progress
- 🟢 Selesai
- ⛔ Blocked

---

## Phase 0: Project Setup & Foundation

| # | Task | Status | Notes |
|---|------|--------|-------|
| 0.1 | `npx create-next-app@14 geowatch-indonesia --typescript --tailwind --app` | 🔴 | |
| 0.2 | Install dependencies: leaflet, react-leaflet, zustand, swr, axios, cheerio | 🔴 | |
| 0.3 | Setup `tsconfig.json` strict mode | 🔴 | |
| 0.4 | Setup Tailwind dark mode config | 🔴 | |
| 0.5 | Buat `lib/types.ts` — semua interface dan enum | 🔴 | |
| 0.6 | Buat `store/mapStore.ts` — Zustand state | 🔴 | |
| 0.7 | Setup ESLint config | 🔴 | |
| 0.8 | Test `npm run dev` — dev server jalan | 🔴 | |

---

## Phase 1: Data Layer

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Buat `public/data/volcanoes-fallback.json` — 127 gunung api dengan koordinat lengkap | 🔴 | Data dari Smithsonian GVP + PVMBG |
| 1.2 | Buat `public/data/geothermal-indonesia.geojson` — polygon area panas bumi | 🔴 | Dari portal ESDM |
| 1.3 | Buat `lib/volcanoes-static.ts` — loader fallback JSON | 🟢 | |
| 1.4 | Buat `lib/magma.ts` — scraper/parser HTML MAGMA ESDM | 🟢 | Gunakan Cheerio |
| 1.5 | Buat `app/api/volcanoes/route.ts` — proxy + cache 30 menit | 🟢 | |
| 1.6 | Buat `app/api/geothermal/route.ts` — serve GeoJSON statis | 🔴 | |
| 1.7 | Unit test scraper MAGMA dengan HTML snapshot | 🔴 | |
| 1.8 | Buat `hooks/useVolcanoes.ts` — SWR hook | 🔴 | |

---

## Phase 2: Map Core

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Buat `components/Map/MapContainer.tsx` — Leaflet wrapper dengan dynamic import | 🔴 | `ssr: false` wajib |
| 2.2 | Setup Indonesia bounds & default view `[-2.5, 118, zoom=5]` | 🔴 | |
| 2.3 | Buat `components/Map/VolcanoGrid.tsx` — render kotak per gunung api | 🔴 | L.Rectangle atau DivIcon |
| 2.4 | Implementasi 4-color system dari `LEVEL_CONFIG` | 🔴 | |
| 2.5 | Click handler per kotak → update `selectedVolcano` di Zustand | 🔴 | |
| 2.6 | Buat `components/Map/MapLegend.tsx` — legenda 4 level | 🔴 | |
| 2.7 | Test render semua 127 marker di peta | 🔴 | |

---

## Phase 3: UI Components

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Buat `components/Dashboard/StatusBar.tsx` — jumlah gunung api per level | 🔴 | |
| 3.2 | Buat `components/Dashboard/RefreshButton.tsx` — manual refresh + timestamp | 🔴 | |
| 3.3 | Buat `components/Dashboard/LayerToggle.tsx` — toggle geothermal | 🔴 | |
| 3.4 | Buat `components/Panel/SidePanel.tsx` — detail panel desktop | 🔴 | |
| 3.5 | Buat `components/Panel/BottomSheet.tsx` — detail panel mobile | 🔴 | |
| 3.6 | Buat `components/Panel/VolcanoCard.tsx` — info card component | 🔴 | |
| 3.7 | Dark mode styling lengkap | 🔴 | |
| 3.8 | Responsive layout desktop/mobile | 🔴 | |

---

## Phase 4: Geothermal Layer

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Buat `components/Map/GeothermalLayer.tsx` — GeoJSON polygon overlay | 🔴 | |
| 4.2 | Styling polygon panas bumi (gradasi ungu/magenta) | 🔴 | |
| 4.3 | Popup saat klik polygon: nama area, potensi MW | 🔴 | |
| 4.4 | Integrasi dengan LayerToggle component | 🔴 | |

---

## Phase 5: Polish & Deploy

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Metadata SEO di `app/layout.tsx` | 🔴 | |
| 5.2 | Loading skeleton saat fetch data | 🔴 | |
| 5.3 | Error boundary untuk map dan API | 🔴 | |
| 5.4 | Toast notification saat refresh berhasil/gagal | 🔴 | |
| 5.5 | Lighthouse audit — target score ≥ 80 | 🔴 | |
| 5.6 | Deploy ke Vercel | 🔴 | |
| 5.7 | Set environment variables di Vercel dashboard | 🔴 | |

---

## Blockers & Issues

*Catat blocker di sini saat ditemukan selama development:*

| Tanggal | Issue | Status | Solusi |
|---------|-------|--------|--------|
| - | - | - | - |

---

## Decisions Log (Cepat)

*Keputusan teknis minor — keputusan mayor di DECISIONS.md:*

| Tanggal | Keputusan |
|---------|-----------|
| 15 Jun 2026 | Pilih L.Rectangle untuk kotak gunung api (lebih mudah sizing vs DivIcon) |
| 15 Jun 2026 | Cache API route 30 menit menggunakan Next.js `revalidate` |

---

## Next Action

**Mulai dengan Phase 0.1 — Inisialisasi project Next.js.**

```bash
npx create-next-app@14 geowatch-indonesia \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```
