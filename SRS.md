# Software Requirements Specification (SRS)
## GeoWatch Indonesia

**Versi:** 1.0.0
**Tanggal:** 15 Juni 2026
**Berdasarkan PRD versi:** 1.0.0

---

## 1. Ruang Lingkup

Dokumen ini merinci persyaratan teknis dan fungsional untuk website **GeoWatch Indonesia** — platform visualisasi peta interaktif gunung api aktif dan potensi panas bumi Indonesia menggunakan data dari PVMBG/Badan Geologi ESDM.

---

## 2. System Overview

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Leaflet Map │  │ React UI     │  │  Zustand  │  │
│  │  (peta +     │  │ (panel,      │  │  Store    │  │
│  │   markers)   │  │  sidebar)    │  │           │  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘  │
│         └─────────────────┴────────────────┘         │
│                       SWR Hooks                       │
└───────────────────────────┬─────────────────────────┘
                            │ HTTP
                ┌───────────▼───────────┐
                │   Next.js Server      │
                │   (API Routes)        │
                │  /api/volcanoes       │
                │  /api/geothermal      │
                └───────────┬───────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
    ┌─────────▼──┐  ┌───────▼───┐  ┌────▼──────────┐
    │   MAGMA    │  │ Smithsonian│  │ Static JSON   │
    │  ESDM      │  │    GVP    │  │ (fallback)    │
    │ (scraping) │  │ (koordinat│  │               │
    └────────────┘  └───────────┘  └───────────────┘
```

---

## 3. Functional Requirements

### FR-01: Peta Interaktif Indonesia

| ID | Requirement |
|----|-------------|
| FR-01.1 | Sistem HARUS menampilkan peta Indonesia menggunakan OpenStreetMap tiles |
| FR-01.2 | Default view HARUS mencakup seluruh wilayah Indonesia (`bounds: [[-11, 95], [6, 141]]`) |
| FR-01.3 | Pengguna HARUS dapat zoom in/out dan pan pada peta |
| FR-01.4 | Peta HARUS mendukung touch gesture (pinch-to-zoom) di perangkat mobile |
| FR-01.5 | Tiles peta HARUS ter-render dalam versi dark (brightness filter) |

### FR-02: Visualisasi Grid Gunung Api

| ID | Requirement |
|----|-------------|
| FR-02.1 | Setiap gunung api HARUS ditampilkan sebagai kotak (rectangle) di posisi koordinatnya |
| FR-02.2 | Warna kotak HARUS mengikuti 4-level color system: Hijau/Kuning/Oranye/Merah |
| FR-02.3 | Kotak HARUS menampilkan tooltip (nama gunung + status) saat hover |
| FR-02.4 | Klik pada kotak HARUS membuka panel detail gunung api |
| FR-02.5 | Kotak HARUS bereaksi visual (opacity increase) saat hover |
| FR-02.6 | Ukuran kotak HARUS konsisten dalam satuan derajat (bukan piksel) agar tidak berubah saat zoom |

### FR-03: Data Status Gunung Api

| ID | Requirement |
|----|-------------|
| FR-03.1 | Sistem HARUS mengambil data status dari MAGMA ESDM via backend proxy |
| FR-03.2 | Backend HARUS cache response MAGMA minimal 30 menit |
| FR-03.3 | Jika MAGMA tidak responsif, sistem HARUS menggunakan fallback data statis |
| FR-03.4 | Sistem HARUS mencatat sumber data (live vs fallback) dan timestamp fetch |
| FR-03.5 | Minimum 30 gunung api HARUS ada dalam database (fallback) |

### FR-04: Detail Panel

| ID | Requirement |
|----|-------------|
| FR-04.1 | Panel detail HARUS menampilkan: nama, provinsi, kabupaten, koordinat, ketinggian, status, tanggal laporan terakhir |
| FR-04.2 | Panel detail HARUS menyertakan link "Lihat laporan lengkap" ke MAGMA |
| FR-04.3 | Di desktop, panel detail HARUS muncul sebagai side panel (≥ 768px) |
| FR-04.4 | Di mobile, panel detail HARUS muncul sebagai bottom sheet (< 768px) |
| FR-04.5 | Panel HARUS dapat ditutup dengan tombol X atau klik di luar area |

### FR-05: Status Bar

| ID | Requirement |
|----|-------------|
| FR-05.1 | Status bar HARUS menampilkan jumlah gunung api per level (Normal: N, Waspada: N, Siaga: N, Awas: N) |
| FR-05.2 | Status bar HARUS menggunakan warna yang sesuai dengan level masing-masing |
| FR-05.3 | Total gunung api aktif yang terpantau HARUS ditampilkan |

### FR-06: Refresh Data

| ID | Requirement |
|----|-------------|
| FR-06.1 | Auto-refresh data HARUS terjadi setiap 30 menit |
| FR-06.2 | Tombol refresh manual HARUS tersedia |
| FR-06.3 | Timestamp "Terakhir diperbarui" HARUS ditampilkan dalam format "HH:MM WIB" |
| FR-06.4 | Animasi loading HARUS tampil saat data sedang di-fetch |
| FR-06.5 | Notifikasi berhasil/gagal HARUS muncul setelah refresh manual |

### FR-07: Layer Geothermal (v1.1)

| ID | Requirement |
|----|-------------|
| FR-07.1 | Toggle button HARUS menampilkan/menyembunyikan layer panas bumi |
| FR-07.2 | Area panas bumi HARUS ditampilkan sebagai polygon semi-transparan |
| FR-07.3 | Warna polygon panas bumi HARUS berbeda dari marker gunung api (ungu/magenta) |
| FR-07.4 | Popup area panas bumi HARUS menampilkan nama dan potensi MW |

---

## 4. Non-Functional Requirements

### NFR-01: Performance

| ID | Requirement |
|----|-------------|
| NFR-01.1 | First Contentful Paint HARUS < 2 detik pada koneksi 4G (10 Mbps) |
| NFR-01.2 | Time to Interactive HARUS < 3 detik |
| NFR-01.3 | Peta HARUS ter-render penuh dalam < 3 detik setelah FCP |
| NFR-01.4 | Lighthouse Performance score HARUS ≥ 80 di mobile |
| NFR-01.5 | Bundle size JavaScript HARUS < 500KB (gzip) |

### NFR-02: Reliability

| ID | Requirement |
|----|-------------|
| NFR-02.1 | Sistem HARUS tetap berfungsi (dengan data fallback) ketika MAGMA tidak responsif |
| NFR-02.2 | Uptime HARUS ≥ 99% (target Vercel SLA) |
| NFR-02.3 | Tidak ada 500 error yang sampai ke user — selalu ada graceful fallback |

### NFR-03: Usability

| ID | Requirement |
|----|-------------|
| NFR-03.1 | Seluruh UI HARUS dalam Bahasa Indonesia |
| NFR-03.2 | Kontras warna teks HARUS memenuhi WCAG 2.1 AA (rasio ≥ 4.5:1) |
| NFR-03.3 | Legenda peta HARUS mudah dibaca tanpa perlu membuka dokumentasi |
| NFR-03.4 | Status level gunung api HARUS dapat dipahami awam (dengan deskripsi singkat) |

### NFR-04: Compatibility

| ID | Requirement |
|----|-------------|
| NFR-04.1 | HARUS berjalan di Chrome 100+, Firefox 100+, Safari 15+, Edge 100+ |
| NFR-04.2 | HARUS responsive di viewport 375px hingga 1920px |
| NFR-04.3 | Touch interface HARUS berfungsi di iOS 15+ dan Android 10+ |

### NFR-05: Security

| ID | Requirement |
|----|-------------|
| NFR-05.1 | Tidak ada API key atau credential yang ter-expose di client-side |
| NFR-05.2 | CORS headers HARUS di-set dengan benar di API routes |
| NFR-05.3 | Input sanitization HARUS diterapkan pada data dari MAGMA sebelum dirender |

---

## 5. API Specification

### GET /api/volcanoes

**Response 200:**
```typescript
{
  volcanoes: Volcano[];  // Array gunung api dengan koordinat dan status
  fetchedAt: string;     // ISO timestamp
  source: 'magma_live' | 'fallback_static';
}
```

**Cache:** `Cache-Control: public, s-maxage=1800, stale-while-revalidate=3600`

### GET /api/geothermal

**Response 200:**
```typescript
{
  type: 'FeatureCollection';
  features: GeoJSONFeature[];  // Polygon area panas bumi
}
```

---

## 6. Data Requirements

### Minimum Dataset

Sistem HARUS memiliki data minimal untuk gunung api berikut dalam fallback JSON:

**Sumatera:** Sinabung, Kerinci, Marapi, Talang, Sorik Marapi
**Jawa:** Merapi, Semeru, Bromo, Ijen, Kelud, Slamet, Papandayan, Galunggung, Tangkuban Perahu, Agung (Bali)
**Nusa Tenggara:** Agung (Bali), Batur (Bali), Rinjani, Sangeang Api, Ebulobo, Egon, Lewotobi Laki-laki, Ili Lewotolok, Wurlali, Romokoa
**Sulawesi:** Lokon, Soputan, Mahawu, Karangetang (Siau)
**Maluku/Papua:** Gamalama, Dukono, Ibu, Banda Api, Awu, Kie Besi (Makian), Ruang

### Data Fields Wajib per Gunung Api

```
id, name, province, regency, lat, lng, elevation, level (default: 1)
```

---

## 7. Constraints

- MAGMA Indonesia tidak menyediakan REST API JSON publik — scraping diperlukan
- Koordinat gunung api harus akurat dalam radius 1km
- Data status tidak boleh lebih dari 12 jam stale tanpa notifikasi ke user
- Tidak ada biaya operasional (tidak ada paid API, tidak ada paid hosting)

---

*Dokumen ini valid untuk MVP v1.0. Revisi diperlukan untuk v1.1 (geothermal layer) dan v2.0 (BMKG integration).*
