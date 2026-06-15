# Product Requirements Document (PRD)
## GeoWatch Indonesia — Peta Interaktif Gunung Api & Potensi Panas Bumi

**Versi:** 1.0.0
**Tanggal:** 15 Juni 2026
**Status:** Draft Final
**Author:** Ananda

---

## 1. Executive Summary

GeoWatch Indonesia adalah aplikasi web yang menampilkan peta interaktif seluruh Indonesia dengan visualisasi berbasis grid/kotak warna-warni yang merepresentasikan tingkat aktivitas gunung api aktif dan potensi panas bumi (geothermal) per wilayah. Data bersumber dari API resmi **MAGMA Indonesia (PVMBG/Badan Geologi ESDM)** yang diperbarui secara real-time atau berkala.

Target pengguna: peneliti, jurnalis, pelajar, pengambil kebijakan energi, serta masyarakat umum yang ingin memahami kondisi vulkanik dan potensi energi panas bumi Indonesia secara visual dan cepat.

---

## 2. Problem Statement

Indonesia memiliki 127 gunung api aktif — terbanyak di dunia — namun informasi status aktivitas vulkanik dan potensi panas bumi tersebar, tidak intuitif, dan membutuhkan keahlian teknis untuk dibaca. Tidak ada platform publik yang menyajikan data ini dalam bentuk **visual grid/heatmap** yang langsung dapat diinterpretasi tanpa latar belakang geologi.

---

## 3. Goals & Objectives

| Goal | Metric Sukses |
|------|--------------|
| Visualisasi status gunung api dalam bentuk grid kotak | Grid merender ≥ 127 titik gunung api dengan warna status |
| Integrasi data live dari MAGMA ESDM | Data ter-refresh setiap 30 menit |
| Pengguna memahami status tanpa penjelasan teknis | Legenda warna sederhana 4 level |
| Menampilkan potensi panas bumi per wilayah | Overlay layer geothermal terpisah |
| Performa load map cepat | First Contentful Paint < 2 detik |

---

## 4. User Stories

### US-01: Melihat Peta Status Gunung Api
> Sebagai pengguna umum, saya ingin melihat seluruh Indonesia dengan kotak-kotak berwarna yang menunjukkan tingkat bahaya gunung api di tiap lokasi, sehingga saya bisa langsung tahu wilayah mana yang berbahaya tanpa membaca laporan panjang.

**Acceptance Criteria:**
- Peta Indonesia ter-load dengan layer grid kotak berwarna
- Warna merah = Level IV (Awas), oranye = Level III (Siaga), kuning = Level II (Waspada), hijau = Level I (Normal)
- Klik pada kotak menampilkan nama gunung api, status, dan tautan ke laporan MAGMA

### US-02: Filter Layer Panas Bumi
> Sebagai peneliti energi terbarukan, saya ingin toggle layer untuk melihat wilayah potensi panas bumi (geothermal), sehingga saya dapat mengidentifikasi area yang memiliki potensi energi sekaligus risiko vulkanik.

**Acceptance Criteria:**
- Toggle button "Potensi Panas Bumi" menampilkan/menyembunyikan layer overlay
- Potensi panas bumi divisualisasikan dengan warna berbeda (gradasi ungu/magenta)
- Popup menampilkan estimasi potensi MW (megawatt)

### US-03: Detail Panel Gunung Api
> Sebagai jurnalis, saya ingin klik pada kotak gunung api dan mendapatkan panel detail berisi laporan terbaru, sehingga saya bisa langsung mengutip data resmi dari PVMBG.

**Acceptance Criteria:**
- Side panel muncul saat klik marker
- Menampilkan: nama, lokasi (kabupaten/provinsi), koordinat, ketinggian, status terkini, tanggal laporan terakhir, link ke MAGMA Indonesia

### US-04: Refresh Data Manual
> Sebagai pengguna yang memantau kondisi darurat, saya ingin tombol refresh data agar saya bisa mendapatkan informasi terbaru tanpa reload halaman.

**Acceptance Criteria:**
- Tombol "Refresh Data" dengan timestamp "Terakhir diperbarui: HH:MM WIB"
- Animasi loading saat fetch data
- Toast notification "Data berhasil diperbarui"

### US-05: Mode Mobile-Friendly
> Sebagai pengguna mobile, saya ingin peta tetap dapat digunakan di smartphone, sehingga saya bisa memantau status gunung api saat berada di lapangan.

**Acceptance Criteria:**
- Responsive di viewport 375px–1920px
- Touch/pinch-to-zoom berfungsi pada peta
- Side panel berubah menjadi bottom sheet di mobile

---

## 5. Features Scope

### MVP (v1.0)
- [x] Peta Indonesia interaktif dengan Leaflet.js
- [x] Grid/kotak visualisasi per titik gunung api
- [x] Integrasi API MAGMA Indonesia `magma.esdm.go.id/v1/gunung-api/tingkat-aktivitas`
- [x] 4-level color coding (Normal/Waspada/Siaga/Awas)
- [x] Detail popup/panel per gunung api
- [x] Auto-refresh setiap 30 menit
- [x] Manual refresh dengan timestamp
- [x] Statistik ringkas (jumlah per level)
- [x] Legenda peta
- [x] Responsive (mobile + desktop)

### v1.1 (Fase 2)
- [ ] Layer overlay potensi panas bumi (data ESDM geothermal)
- [ ] Filter berdasarkan provinsi
- [ ] Search gunung api by name
- [ ] Heatmap/intensity mode
- [ ] Export data sebagai CSV/JSON

### v2.0 (Fase 3)
- [ ] Integrasi data gempa bumi BMKG
- [ ] Notifikasi push (PWA) saat status berubah
- [ ] Historical timeline status gunung api
- [ ] Peta KRB (Kawasan Rawan Bencana) overlay

---

## 6. API & Data Sources

### Primary: MAGMA Indonesia (PVMBG/Badan Geologi ESDM)
- **Base URL:** `https://magma.esdm.go.id`
- **Endpoint Status:** `/v1/gunung-api/tingkat-aktivitas`
- **Endpoint Laporan:** `/v1/gunung-api/laporan`
- **Format:** HTML (scraping diperlukan) atau JSON internal
- **Update Frequency:** Kuasi-realtime (beberapa jam sekali)
- **Catatan:** MAGMA tidak menyediakan REST API publik resmi. Website akan menggunakan backend proxy + scraping/parsing resmi, atau memanfaatkan data struktural dari halaman publik mereka.

### Fallback: Data Statis Curated
- Dataset JSON lokal berisi 127 gunung api dengan koordinat dari **Smithsonian Global Volcanism Program (GVP)**
- Status awal di-seed dari scraping terakhir, diperbarui via backend cron job

### Geothermal Data
- Sumber: **Peta Potensi Panas Bumi Indonesia** dari ESDM/Kementerian ESDM
- Format: GeoJSON polygon (tersedia di portal data.esdm.go.id)
- Digunakan sebagai static asset yang di-update periodik

### Basemap
- **OpenStreetMap** via Leaflet default tile layer
- **Esri World Imagery** sebagai alternatif satellite view

---

## 7. Non-Functional Requirements

| Kategori | Requirement |
|----------|------------|
| Performance | FCP < 2s, TTI < 3s pada 4G |
| Availability | 99% uptime (static site di Vercel/Netlify) |
| Accessibility | WCAG 2.1 AA untuk warna dan kontras |
| Browser Support | Chrome 100+, Firefox 100+, Safari 15+, Edge 100+ |
| Mobile | iOS 15+, Android 10+ |
| Data Freshness | Status gunung api max 6 jam delay dari sumber |

---

## 8. Design Principles

- **Data-first:** Visualisasi mendahulukan kejelasan data, bukan estetika berlebihan
- **Indonesia-centric:** Peta defaultnya berpusat di Indonesia, bukan dunia
- **Dark mode default:** Kontras optimal untuk map visualization
- **Color-blind safe:** Gunakan shape + warna untuk accessibility
- **Bahasa Indonesia:** Seluruh UI dalam Bahasa Indonesia

---

## 9. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| MAGMA API tidak stabil/blok bot | Tinggi | Tinggi | Backend proxy + caching 6 jam + data fallback statis |
| Data koordinat gunung api tidak akurat | Sedang | Sedang | Cross-validate dengan GVP Smithsonian dataset |
| CORS error dari API MAGMA | Tinggi | Tinggi | Wajib backend/proxy layer (Next.js API routes) |
| Perubahan struktur HTML MAGMA | Sedang | Tinggi | Unit test scraper + alert monitoring |

---

## 10. Success Metrics

- Page load time < 2 detik (P90)
- Data akurasi ≥ 95% match dengan MAGMA website
- 0 stale data incident > 12 jam tanpa fallback notification
- Mobile Lighthouse score ≥ 80

---

*Dokumen ini adalah dasar untuk SRS, SDD, dan Task Breakdown. Setiap perubahan scope harus didokumentasikan sebagai versi baru.*
