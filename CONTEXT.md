# Qolbu App — Project Context

> Aplikasi Ibadah Harian Terlengkap berbasis web (PWA-ready).
> Dibangun dengan **Astro 5 + Tailwind CSS 4 + TypeScript**.

---

> 📘 **Canonical source of truth:** [`docs/PRD.md`](./docs/PRD.md) — Product Requirements Document yang mencakup seluruh spesifikasi, fitur, komponen, data, storage, API, dan arsitektur proyek secara detail.
>
> File ini (`CONTEXT.md`) adalah ringkasan cepat (_quick reference_). Selalu rujuk ke `docs/PRD.md` untuk informasi paling lengkap dan akurat.

---

## 🏗 Arsitektur

### Stack Inti
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| Astro | ^5.17.1 | Static Site Generator + SSR-ready |
| Tailwind CSS | ^4.1.18 | Utility-first styling |
| TypeScript | via Astro | Strict type checking |

### Struktur Direktori

```
/
├── public/                  # Static assets
│   ├── logo.png            # Logo aplikasi
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker (offline cache)
├── src/
│   ├── components/         # Komponen Astro reusable
│   │   ├── HeaderBack.astro
│   │   ├── SearchBar.astro
│   │   ├── SettingsModal.astro
│   │   └── Toast.astro
│   ├── data/               # Data JSON statis
│   │   ├── yasin.json      # Ayat Surat Yasin
│   │   ├── tahlil.json     # Bacaan Tahlil
│   │   └── doa.json        # 40+ Doa Harian
│   ├── docs/
│   │   └── PRD.md          # Canonical PRD (Product Requirements Document)
│   ├── layouts/
│   │   └── BaseLayout.astro # Layout utama (header, footer, theme, SEO, PWA)
│   ├── pages/
│   │   ├── index.astro      # Dashboard (menu grid + quote of the day)
│   │   ├── doa.astro        # Ensiklopedia Doa Harian
│   │   ├── sholat.astro     # Jadwal Sholat + Arah Kiblat
│   │   ├── sholat-guide.astro # Panduan Sholat Lengkap
│   │   ├── tahlil.astro     # Tahlil & Doa Arwah
│   │   ├── tasbih.astro     # Tasbih Digital
│   │   ├── zakat.astro      # Kalkulator Zakat
│   │   └── quran/
│   │       ├── index.astro  # Daftar Surat & Juz
│   │       ├── [nomor].astro # Detail Surat (dengan audio)
│   │       └── yasin.astro  # Surat Yasin Lengkap
│   └── styles/
│       └── global.css       # Global styles + Tailwind directives
├── astro.config.mjs         # Astro config (Tailwind Vite plugin)
├── tsconfig.json            # Strict TypeScript config
├── package.json
├── CONTEXT.md               # Ringkasan arsitektur (quick reference)
├── docs/PRD.md              # Canonical PRD — source of truth lengkap
└── README.md                # Panduan pengguna
```

### Layout (BaseLayout.astro)
- Header sticky dengan logo + theme toggle (dark/light)
- Main content wrapper `max-w-md mx-auto` (mobile-first)
- Footer dengan credit ke PakLubis
- **PWA:** manifest.json link + service worker registration otomatis
- **SEO:** Open Graph + Twitter Cards meta tags per halaman
- **Inline script** untuk theme: membaca `localStorage('theme')` → fallback `prefers-color-scheme`
- HTML `<html lang="id">` dengan `scroll-smooth`
- **View Transitions API** — `astro:transitions/ClientRouter` untuk animasi halaman:
  - `<ClientRouter />` di `<head>` — mengaktifkan client-side navigation
  - `transition:animate="slide"` pada `<html>` — slide-from-right antar halaman
  - `transition:name="site-header"` — header persistent morphing tanpa kedip
  - `transition:persist` pada tombol theme toggle — state tetap terjaga

---

## 🧩 Komponen Reusable

### `HeaderBack.astro`
Back navigation header sticky dengan slot untuk tombol kanan.

| Prop | Default | Deskripsi |
|------|---------|-----------|
| `href` | `"/"` | Link tujuan tombol back |
| `label` | `"Kembali"` | Teks tombol back |
| `title` | — | Judul tengah (jika ada) |
| `rightSlot` | `false` | Aktifkan `<slot name="right">` |

**Dipakai di:** doa, zakat, quran/index, tahlil, sholat-guide

### `SearchBar.astro`
Input pencarian dengan icon search.

| Prop | Default | Deskripsi |
|------|---------|-----------|
| `placeholder` | `"Cari..."` | Placeholder text |
| `id` | `"search-input"` | ID element |

**Dipakai di:** doa

### `SettingsModal.astro`
Bottom sheet modal reusable — menyediakan overlay backdrop, tombol close, animasi slide-up.

| Prop | Default | Deskripsi |
|------|---------|-----------|
| `modalId` | `"settings-modal"` | ID modal container |
| `overlayId` | `"overlay"` | ID backdrop overlay |
| `closeId` | `"close-settings"` | ID tombol close |
| `title` | `"Pengaturan Tampilan"` | Judul modal |

**Dipakai di:** sholat, tahlil, quran/[nomor]

### `Toast.astro`
Notifikasi snackbar bawah.

| Prop | Default | Deskripsi |
|------|---------|-----------|
| `id` | `"toast"` | ID container |
| `msgId` | `"toast-msg"` | ID span pesan |

**Dipakai di:** sholat

---

## 📄 Halaman & Fitur

### 1. Dashboard (`/`)
- Menu grid 2 kolom (7 menu utama):
  - Jadwal Sholat (featured — full-width gradient card)
  - Al-Qur'an
  - Doa Harian
  - Kalkulator Zakat
  - Panduan Sholat
  - Tahlil & Doa
  - Tasbih Digital
- **Quote of the Day** — random dari 100+ quotes (Al-Qur'an, Hadits, Ulama)
- Animasi fade-in, auto-rotasi tiap 10 detik

### 2. Jadwal Sholat (`/sholat`)
- **API:** aladhan.com/v1/timings
- **GPS:** navigator.geolocation → reverse geocoding via nominatim.openstreetmap.org
- **Countdown** ke waktu sholat berikutnya (real-time per detik)
- **Kompas Kiblat** — sensor deviceorientation (iOS permission handling)
- **Pengaturan:**
  - Koreksi Ihtiyat (± menit)
  - Manual location (lat/lng)
  - Metode perhitungan (Kemenag, MWL, ISNA, dll.)
  - Notifikasi Adzan & Pengingat (10 menit sebelumnya)
- **Data persistence:** localStorage('sholat-settings')
- **Qibla:** rumus spherical trigonometry (Ka'bah: 21.4225, 39.8262)

### 3. Al-Qur'an (`/quran`)
- **API:** equran.id/api/v2/surat
- Tab view: Daftar Surat (searchable) & Daftar Juz
- **Static paths:** getStaticPaths() — build-time pre-render semua 114 surat
- Tampilan Per Ayat (arab + latin + terjemah) dan Mushaf Mode
- **Audio:** Misyari Rasyid Al-Afasi (equran.nos.wjv-1.neo.id)
- Auto-play ayat berurutan
- **Pengaturan:** ukuran font arab (range slider), toggle latin & terjemah

### 4. Doa Harian (`/doa`)
- **Inline data:** 40+ doa dalam berbagai kategori
- **Kategori filter:** Semua, Sehari-hari, Al-Qur'an, Sholat, Rizki, Keluarga, Sakit, Perjalanan, Taubat
- Search (by title, latin, arti)
- Copy-to-clipboard dengan format rapi

### 5. Panduan Sholat (`/sholat-guide`)
- **Inline data:** 28 langkah (syarat sah → niat → gerakan → dzikir)
- Accordion UI (hanya 1 terbuka dalam satu waktu)
- **Progress tracker** — localStorage('sholat-completed')
- **Bookmark** — localStorage('sholat-bookmarks') dengan badge notif
- **Mode Praktik** — auto-play tiap 15 detik
- **Audio** — untuk bacaan Al-Fatihah & Surat Pendek
- Search langkah

### 6. Tahlil (`/tahlil`)
- Data dari tahlil.json (7 item)
- Pengaturan ukuran font arab & toggle latin/terjemah
- Layout sederhana step-by-step

### 7. Tasbih Digital (`/tasbih`)
- Counter lingkaran besar dengan feedback:
  - **Haptic:** navigator.vibrate() (15ms per hitung)
  - **Audio:** Web Audio API (oscillator sine wave)
  - **Animasi:** scale + color pulse
- Target: 33, 99, 100, atau tanpa batas
- Modal sukses saat target tercapai
- Keyboard shortcut: Spasi / Enter
- Statistik harian: total hitungan, sesi, streak
- Pemilihan dzikir: Subhanallah, Alhamdulillah, Allahu Akbar, Laa ilaaha illallah

### 8. Kalkulator Zakat (`/zakat`)
- Dua mode: **Zakat Maal** (haul 1 tahun, nishab 85gr emas) & **Zakat Penghasilan**
- Input dengan format Rupiah (otomatis ribuan)
- Harga emas: default Rp1.200.000/gram (bisa diubah)
- Menampilkan status nishab & jumlah zakat 2.5%

---

## 🎨 Theming & Styling

- **Dark mode:** class-based (`dark` class on `<html>`)
- **Palette:** Emerald sebagai primary, slate/neutral untuk teks & background
- **Font:** Inter (body) + Amiri (Arabic)
- **Layout:** Mobile-first (max-w-md: 448px), border-radius ekstra (`rounded-2xl`, `rounded-[2rem]`)
- **Animasi:** Tailwind transitions + CSS `@keyframes` (fadeIn, slideUp)
- **Selection:** `selection:bg-emerald-500 selection:text-white`

---

## 💾 Data & Storage

| Storage Key | Tipe | Kegunaan |
|-------------|------|----------|
| `theme` | `"dark" \| "light"` | Tema global |
| `sholat-settings` | JSON | Lokasi, metode, notifikasi, koreksi |
| `sholat-data` | JSON | (legacy — tidak dipakai) |
| `sholat-cache-*` | JSON | Cache jadwal sholat per tanggal/koordinat |
| `sholat-notified-adhan` | JSON | Deduplikasi notifikasi adzan |
| `sholat-notified-remind` | JSON | Deduplikasi notifikasi pengingat |
| `yasin-settings` | JSON | Ukuran font, toggle latin/terjemah untuk Yasin |
| `tasbih-autocycle` | boolean | Auto-cycle dzikir ON/OFF |
| `quran-last-read` | JSON | Posisi baca terakhir (surah, ayat, timestamp) |
| `quran-settings` | JSON | Ukuran font, toggle latin/terjemah |
| `tahlil-settings` | JSON | Ukuran font, toggle latin/terjemah |
| `sholat-completed` | `string[]` | ID step yang sudah selesai |
| `sholat-bookmarks` | `string[]` | ID step yang di-bookmark |
| `tasbih-count` | number | Hitungan tasbih |
| `tasbih-target` | number | Target hitungan |
| `tasbih-dhikr` | string | Dzikir yang dipilih |
| `tasbih-vibrate` | boolean | Getar ON/OFF |
| `tasbih-sound` | boolean | Suara ON/OFF |
| `tasbih-stats` | JSON | Statistik harian |

---

## 🔌 API Eksternal

| API | Endpoint | Penggunaan |
|-----|----------|------------|
| **Aladhan** | `api.aladhan.com/v1/timings` | Jadwal sholat berdasarkan koordinat |
| **Equran.id** | `equran.id/api/v2/surat` | Daftar & detail surat Al-Qur'an |
| **Nominatim** | `nominatim.openstreetmap.org/reverse` | Reverse geocoding (GPS → nama kota) |
| **EveryAyat** | `everyayah.com/data/Alafasy_128kbps/` | Audio Qur'an (Yasin, via yasin.json) |
| **Equran Audio** | `equran.nos.wjv-1.neo.id/audio-partial/...` | Audio per ayat surat |

---

## ⚡ Performance

- **Cache Stale-While-Revalidate** — jadwal sholat di-cache ke localStorage + background refresh
- **Static Site Generation** — semua halaman di-pre-render saat build (123 pages)
- **Mobile-first** — layout max-w-md, optimasi touch interactions
- **View Transitions** — navigasi SPA-like dengan animasi slide, <html> persist, header morphing

---

## 🧪 Catatan Penting

> **⚠️ Referensi utama:** Semua detail fitur, interaksi, komponen, data, storage keys, dan API dijelaskan secara lengkap di [`docs/PRD.md`](./docs/PRD.md).
> File ini hanya ringkasan. Jika ada perbedaan, `docs/PRD.md` yang berlaku (_canonical source of truth_).

- **Semua script client-side menggunakan `is:inline`** — tidak ada client-side framework (React/Vue)
- **Data doa** sudah dipisah ke `src/data/doa.json`
- **Data tahlil** diambil dari `src/data/tahlil.json`
- **PWA** sudah aktif dengan manifest + service worker
- **yasin.json** sudah digunakan di halaman `/quran/yasin`
- **File `databasequotes`** sudah dihapus (duplikat dari index.astro)
