# DECISIONS.md — GeoWatch Indonesia
## Architecture Decision Records (ADR)

Dokumen ini mencatat setiap keputusan arsitektur signifikan beserta konteksnya, agar sesi Claude Code berikutnya tidak mempertanyakan ulang keputusan yang sudah dibuat.

---

## ADR-001: Next.js sebagai Framework (bukan Vite + React)

**Tanggal:** 15 Juni 2026
**Status:** ✅ Accepted

**Konteks:**
Website membutuhkan proxy backend untuk menghindari CORS dari MAGMA ESDM. Opsi: (1) Next.js dengan API Routes, (2) Vite + Express terpisah, (3) Vite + Cloudflare Workers.

**Keputusan:**
Pilih Next.js 14 dengan App Router.

**Alasan:**
- API Routes menggabungkan proxy dan frontend dalam satu codebase
- Vercel deployment zero-config untuk Next.js
- SSR membantu performance awal peta
- Tidak perlu manage dua server terpisah

**Konsekuensi:**
- Bundle size sedikit lebih besar dari Vite
- Map component wajib dynamic import dengan `ssr: false`

---

## ADR-002: Leaflet.js (bukan Mapbox GL atau Deck.gl)

**Tanggal:** 15 Juni 2026
**Status:** ✅ Accepted

**Konteks:**
Pilihan map library untuk visualisasi peta Indonesia.

**Keputusan:**
Pilih Leaflet.js v1.9 + react-leaflet v4.

**Alasan:**
- Gratis, tidak ada API key, tidak ada billing
- Coverage OSM Indonesia sangat baik
- react-leaflet memiliki TypeScript types lengkap
- L.Rectangle dan L.GeoJSON cukup untuk kebutuhan grid + polygon
- Mapbox memerlukan token + ada usage limit

**Konsekuensi:**
- Tidak ada 3D terrain view (tapi tidak diperlukan untuk MVP)
- Custom styling tile layer terbatas vs Mapbox styles

---

## ADR-003: Scraping MAGMA HTML (bukan REST API)

**Tanggal:** 15 Juni 2026
**Status:** ✅ Accepted

**Konteks:**
MAGMA Indonesia (`magma.esdm.go.id`) tidak menyediakan REST API publik resmi dengan endpoint JSON untuk data status gunung api.

**Keputusan:**
Gunakan server-side scraping dengan Cheerio di Next.js API Route, dengan fallback ke data statis JSON.

**Alasan:**
- Tidak ada alternatif resmi untuk mendapatkan data ini secara programatik
- Data statis saja tidak cukup karena level status berubah
- Server-side scraping (di API Route) tidak melanggar CORS
- Cache 30 menit mengurangi beban pada server MAGMA

**Risiko:**
- MAGMA bisa memblokir IP server (sudah terbukti dari hasil search)
- Struktur HTML bisa berubah tanpa pemberitahuan

**Mitigasi:**
- Rate limit request: max 1 request per 30 menit
- Set User-Agent ke browser biasa
- Fallback ke JSON statis jika scraping gagal
- Monitor dengan unit test untuk deteksi perubahan HTML

---

## ADR-004: Zustand sebagai State Manager

**Tanggal:** 15 Juni 2026
**Status:** ✅ Accepted

**Konteks:**
State yang perlu dishare: volcano yang dipilih, layer aktif, data list volcano, timestamp refresh.

**Keputusan:**
Gunakan Zustand v4.

**Alasan:**
- Tidak ada boilerplate seperti Redux
- TypeScript support sempurna
- Tidak perlu Provider wrapper di root
- Bundle size ~3KB vs Redux Toolkit ~40KB

---

## ADR-005: Data Koordinat dari Smithsonian GVP (bukan parsing dari MAGMA)

**Tanggal:** 15 Juni 2026
**Status:** ✅ Accepted

**Konteks:**
MAGMA menyimpan koordinat gunung api di teks deskripsi laporan, bukan dalam format terstruktur yang mudah diparse. Perlu sumber koordinat yang reliable.

**Keputusan:**
Gunakan **Smithsonian Global Volcanism Program (GVP)** dataset sebagai sumber koordinat, cross-validated dengan data PVMBG.

**Alasan:**
- GVP menyediakan dataset CSV publik dengan koordinat presisi untuk semua gunung api dunia
- Data koordinat jarang berubah (posisi gunung tidak berpindah)
- Lebih reliable daripada parsing teks HTML MAGMA

**Implementasi:**
- Buat `public/data/volcanoes-fallback.json` dari GVP CSV yang difilter untuk Indonesia
- Field level status akan di-overlay dari scraping MAGMA

---

## ADR-006: Dark Mode sebagai Default (bukan Light Mode)

**Tanggal:** 15 Juni 2026
**Status:** ✅ Accepted

**Konteks:**
Pilihan default tema visual untuk aplikasi peta.

**Keputusan:**
Dark mode sebagai default dengan tema gelap `#0f172a` (slate-900).

**Alasan:**
- Peta/map lebih baik dibaca di background gelap (kontras lebih tinggi)
- Warna marker merah/kuning/hijau lebih mencolok di dark background
- Konsisten dengan aplikasi monitoring/surveillance profesional

---

---

## ADR-007: Penanganan Intersepsi Gateway dan Proxy pada API MAGMA

**Tanggal:** 15 Juni 2026
**Status:** ✅ Accepted

**Konteks:**
Server MAGMA menggunakan Web Application Firewall / Gateway Security (F5 BIG-IP ASM) yang menyisipkan cookie perlindungan (seperti `TS016e1ef8`). Hal ini dapat memblokir/mengintersepsi request dari server-side Next.js dengan mengembalikan respon kosong atau halaman tantangan (Challenge Page/CAPTCHA) dengan status HTTP 200. Hal ini menyebabkan error "API returned an empty or malformed response".

**Keputusan:**
1. Tambahkan browser-like header lengkap (User-Agent, Accept, Accept-Language, Cache-Control) pada request Axios.
2. Validasi respon scraping secara ketat. Jika data HTML kosong, tidak mengandung teks "Daftar Tingkat Aktivitas", atau tidak ada baris tabel gunung api yang ter-parse (count = 0), deteksi sebagai intersepsi gateway.
3. Alihkan secara otomatis (graceful fallback) ke loader data statis `volcanoes-fallback.json` agar website tetap berfungsi 100% menggunakan data cadangan berumur terbaru, alih-alih mengembalikan data kosong atau error.

**Alasan:**
- Menghindari crash pada map visualisasi jika server MAGMA melakukan rate limiting atau mendeteksi scraper sebagai bot.
- Menjamin ketersediaan website dengan service level yang tinggi (fail-safe).

**Konsekuensi:**
- Jika intersepsi terjadi terus-menerus, data visualisasi akan memakai status statis terakhir sampai server MAGMA dapat diakses kembali.

