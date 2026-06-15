# PROGRESS.md — GeoWatch Indonesia
## Task Tracker & Implementation Status

**Last Updated:** 15 Juni 2026
**Current Phase:** 🟢 Phase 5 — Polish & Deploy (SELESAI)

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
| 0.1 | `npx create-next-app@14 geowatch-indonesia --typescript --tailwind --app` | 🟢 | Selesai |
| 0.2 | Install dependencies: leaflet, react-leaflet, zustand, swr, axios, cheerio | 🟢 | Selesai |
| 0.3 | Setup `tsconfig.json` strict mode | 🟢 | Selesai |
| 0.4 | Setup Tailwind dark mode config | 🟢 | Selesai |
| 0.5 | Buat `lib/types.ts` — semua interface dan enum | 🟢 | Selesai |
| 0.6 | Buat `store/mapStore.ts` — Zustand state | 🟢 | Selesai |
| 0.7 | Setup ESLint config | 🟢 | Selesai |
| 0.8 | Test `npm run dev` — dev server jalan | 🟢 | Selesai |

---

## Phase 1: Data Layer

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Buat `public/data/volcanoes-fallback.json` — 127 gunung api dengan koordinat lengkap | 🟢 | Selesai |
| 1.2 | Buat `public/data/geothermal-indonesia.geojson` — polygon area panas bumi | 🟢 | Selesai |
| 1.3 | Buat `lib/volcanoes-static.ts` — loader fallback JSON | 🟢 | Selesai |
| 1.4 | Buat `lib/magma.ts` — scraper/parser HTML MAGMA ESDM | 🟢 | Selesai |
| 1.5 | Buat `app/api/volcanoes/route.ts` — proxy + cache 30 menit | 🟢 | Selesai |
| 1.6 | Buat `app/api/geothermal/route.ts` — serve GeoJSON statis | 🟢 | Selesai |
| 1.7 | Unit test scraper MAGMA dengan HTML snapshot | 🟢 | Selesai |
| 1.8 | Buat `hooks/useVolcanoes.ts` — SWR hook | 🟢 | Selesai |

---

## Phase 2: Map Core

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Buat `components/Map/MapContainer.tsx` — Leaflet wrapper dengan dynamic import | 🟢 | Selesai |
| 2.2 | Setup Indonesia bounds & default view `[-2.5, 118, zoom=5]` | 🟢 | Selesai |
| 2.3 | Buat `components/Map/VolcanoGrid.tsx` — render kotak per gunung api | 🟢 | Selesai |
| 2.4 | Implementasi 4-color system dari `LEVEL_CONFIG` | 🟢 | Selesai |
| 2.5 | Click handler per kotak → update `selectedVolcano` di Zustand | 🟢 | Selesai |
| 2.6 | Buat `components/Map/MapLegend.tsx` — legenda 4 level | 🟢 | Selesai |
| 2.7 | Test render semua 127 marker di peta | 🟢 | Selesai |

---

## Phase 3: UI Components

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Buat `components/Dashboard/StatusBar.tsx` — jumlah gunung api per level | 🟢 | Diintegrasikan langsung di `app/page.tsx` |
| 3.2 | Buat `components/Dashboard/RefreshButton.tsx` — manual refresh + timestamp | 🟢 | Diintegrasikan langsung di `app/page.tsx` |
| 3.3 | Buat `components/Dashboard/LayerToggle.tsx` — toggle geothermal | 🟢 | Selesai |
| 3.4 | Buat `components/Panel/SidePanel.tsx` — detail panel desktop | 🟢 | Diintegrasikan langsung di `app/page.tsx` |
| 3.5 | Buat `components/Panel/BottomSheet.tsx` — detail panel mobile | 🟢 | Diintegrasikan langsung di `app/page.tsx` |
| 3.6 | Buat `components/Panel/VolcanoCard.tsx` — info card component | 🟢 | Diintegrasikan langsung di `app/page.tsx` |
| 3.7 | Dark mode styling lengkap | 🟢 | Selesai |
| 3.8 | Responsive layout desktop/mobile | 🟢 | Selesai |

---

## Phase 4: Geothermal Layer

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Buat `components/Map/GeothermalLayer.tsx` — GeoJSON polygon overlay | 🟢 | Selesai |
| 4.2 | Styling polygon panas bumi (gradasi ungu/magenta) | 🟢 | Selesai |
| 4.3 | Popup saat klik polygon: nama area, potensi MW | 🟢 | Selesai |
| 4.4 | Integrasi dengan LayerToggle component | 🟢 | Selesai |

---

## Phase 5: Polish & Deploy

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Metadata SEO di `app/layout.tsx` | 🟢 | Selesai |
| 5.2 | Loading skeleton saat fetch data | 🟢 | Selesai |
| 5.3 | Error boundary untuk map dan API | 🟢 | Selesai |
| 5.4 | Toast notification saat refresh berhasil/gagal | 🟢 | Selesai |
| 5.5 | Lighthouse audit — target score ≥ 80 | 🟢 | Selesai |
| 5.6 | Deploy ke Vercel | 🟢 | Selesai |
| 5.7 | Set environment variables di Vercel dashboard | 🟢 | Selesai |

---

## Blockers & Issues

*Tidak ada blocker saat ini. Sistem berjalan 100% fungsional.*

---

## Decisions Log (Cepat)

| Tanggal | Keputusan |
|---------|-----------|
| 15 Jun 2026 | Pilih L.Rectangle untuk kotak gunung api (lebih mudah sizing vs DivIcon) |
| 15 Jun 2026 | Cache API route 30 menit menggunakan Next.js `revalidate` |
| 15 Jun 2026 | Gunakan Google Font Lora (serif) dan Inter (sans-serif) untuk meniru tipografi khas brand Anthropic/Claude atas permintaan pengguna. |
| 15 Jun 2026 | Integrasikan area panas bumi dengan warna gradasi ungu/fuchsia di peta berdasarkan statusnya (eksploitasi, eksplorasi, potensial). |

---

## Next Action

Aplikasi telah berhasil dideploy di Vercel dan didorong ke GitHub. Proyek siap untuk demo atau penambahan fitur lebih lanjut.
