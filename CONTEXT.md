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
│   ├── logo.png            # Logo aplikasi (2000x2000, fallback)
│   ├── logo-192.png        # Logo 192x192 (PWA icon)
│   ├── logo-512.png        # Logo 512x512 (PWA icon)
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker (offline cache)
├── src/
│   ├── components/         # Komponen Astro reusable
│   │   ├── HeaderBack.astro
│   │   ├── SearchBar.astro
│   │   ├── SettingsModal.astro
│   │   └── Toast.astro
│   ├── data/               # Data JSON statis
│   │   ├── doa.json        # 40+ Doa Harian
│   │   ├── dzikir.json     # 22 Dzikir Pagi & Petang
│   │   ├── events-hijri.json # 12 Event Islam (Hijriah)
│   │   ├── asmaul-husna.json # 99 Asmaul Husna
│   │   ├── tahlil.json     # Bacaan Tahlil
│   │   └── yasin.json      # Ayat Surat Yasin
│   ├── docs/
│   │   └── PRD.md          # Canonical PRD (Product Requirements Document)
│   ├── layouts/
│   │   └── BaseLayout.astro # Layout utama (header, footer, theme, SEO, PWA)
│   ├── pages/
│   │   ├── index.astro      # Dashboard (prayer card, hijri events, menu grid, quote)
│   │   ├── asmaul-husna.astro # 99 Nama Allah (searchable)
│   │   ├── doa.astro        # Ensiklopedia Doa Harian
│   │   ├── dzikir.astro     # Dzikir Pagi & Petang (tab filter)
│   │   ├── sholat.astro     # Jadwal Sholat + Arah Kiblat
│   │   ├── sholat-guide.astro # Panduan Sholat Lengkap
│   │   ├── tahlil.astro     # Tahlil & Doa Arwah
│   │   ├── tasbih.astro     # Tasbih Digital
│   │   ├── zakat.astro      # Kalkulator Zakat
│   │   ├── offline.astro    # Offline fallback page
│   │   └── quran/
│   │       ├── index.astro  # Daftar Surat & Juz (cache, bookmark)
│   │       ├── [nomor].astro # Detail Surat (audio, bookmark, auto-cache)
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
Bottom sheet modal reusable — menyediakan overlay backdrop, tombol close, animasi slide-up. **Fully self-contained UX:** Escape key close, focus trapping (Tab cycle), backdrop click to close, autofocus on close button.

| Prop | Default | Deskripsi |
|------|---------|-----------|
| `modalId` | `"settings-modal"` | ID modal container |
| `overlayId` | `"overlay"` | ID backdrop overlay |
| `closeId` | `"close-settings"` | ID tombol close |
| `title` | `"Pengaturan Tampilan"` | Judul modal |

**Dipakai di:** sholat, tahlil, quran/[nomor]

### `Toast.astro`
Notifikasi snackbar bawah dengan **global debounced `window.showToast(msg, duration)`** — semua halaman mendelegasikan ke fungsi ini, timeout otomatis di-clear sebelum toast baru (mencegah rapid-toast bug).

| Prop | Default | Deskripsi |
|------|---------|-----------|
| `id` | `"toast"` | ID container |
| `msgId` | `"toast-msg"` | ID span pesan |

**Dipakai di:** sholat, sholat-guide, doa, dzikir, quran/[nomor]

---

## 📄 Halaman & Fitur

### 1. Dashboard (`/`)
- **Prayer Card** — live countdown to next prayer + 5 waktu + arah kiblat (reads from sholat-cache localStorage)
- **Hijri Event Bar** — bar amber: event Islam terdekat (baca dari sholat-cache, reuse data Aladhan)
- **Quran Offline Badge** — compact badge jumlah surah tersimpan di IndexedDB
- Menu grid 2 kolom (9 menu utama):
  - Jadwal Sholat (featured — full-width gradient card)
  - Al-Qur'an
  - Doa Harian
  - Kalkulator Zakat
  - Panduan Sholat
  - Tahlil & Doa
  - Tasbih Digital
  - Asmaul Husna
  - Dzikir Pagi & Petang
- **Quote of the Day** — random dari 100+ quotes (Al-Qur'an, Hadits, Ulama), auto-rotasi 10 detik
- Animasi fade-in

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
- **Offline Cache:** IndexedDB (`qolbu-quran-cache`, store `surah-cache`) — cache semua 114 surat (batch 5, progress bar)
- **Audio Cache:** Opsional — download audio files (~500MB-2GB, cache-first via SW)
- **Lanjut Baca** banner — dari localStorage `quran-last-read`
- **Bookmark Surah** — localStorage `quran-bookmarks` dengan list di index
- Tampilan Per Ayat (arab + latin + terjemah) dan Mushaf Mode
- **Audio:** Misyari Rasyid Al-Afasi (equran.nos.wjv-1.neo.id)
- Auto-play ayat berurutan, prefetch 3 ayat berikutnya
- **Pengaturan:** ukuran font arab (range slider), toggle latin & terjemah

### 4. Asmaul Husna (`/asmaul-husna`)
- **Data:** `src/data/asmaul-husna.json` (99 nama)
- Search filter by latin name & arabic text
- Tampilan: nomor + latin + meaning + arabic
- Layout sederhana, gradient header

### 5. Dzikir Pagi & Petang (`/dzikir`)
- **Data:** `src/data/dzikir.json` (22 dzikir dengan arab, latin, arti, sumber, jumlah)
- **Tab filter:** Pagi, Petang, Keduanya
  - Tab Pagi: dzikir waktu pagi + keduanya
  - Tab Petang: dzikir waktu petang + keduanya
  - Tab Keduanya: semua dzikir
- **Info badge:** jumlah pengulangan ("33x", "100x")
- **Copy to clipboard** — formatted latin + arti
- Amber theme

### 6. Doa Harian (`/doa`)
- **Inline data:** 40+ doa dalam berbagai kategori
- **Kategori filter:** Semua, Sehari-hari, Al-Qur'an, Sholat, Rizki, Keluarga, Sakit, Perjalanan, Taubat
- Search (by title, latin, arti)
- Copy-to-clipboard dengan format rapi

### 7. Panduan Sholat (`/sholat-guide`)
- **Inline data:** 28 langkah (syarat sah → niat → gerakan → dzikir)
- Accordion UI (hanya 1 terbuka dalam satu waktu)
- **Progress tracker** — localStorage('sholat-completed')
- **Bookmark** — localStorage('sholat-bookmarks') dengan badge notif
- **Mode Praktik** — auto-play tiap 15 detik
- **Audio** — untuk bacaan Al-Fatihah & Surat Pendek
- Search langkah

### 8. Tahlil (`/tahlil`)
- Data dari tahlil.json (7 item)
- Pengaturan ukuran font arab & toggle latin/terjemah
- Layout sederhana step-by-step

### 9. Tasbih Digital (`/tasbih`)
- Counter lingkaran besar dengan feedback:
  - **Haptic:** navigator.vibrate() (15ms per hitung)
  - **Audio:** Web Audio API (oscillator sine wave)
  - **Animasi:** scale + color pulse
- Target: 33, 99, 100, atau tanpa batas
- Modal sukses saat target tercapai
- Keyboard shortcut: Spasi / Enter
- Statistik harian: total hitungan, sesi, streak
- Pemilihan dzikir: Subhanallah, Alhamdulillah, Allahu Akbar, Laa ilaaha illallah

### 10. Kalkulator Zakat (`/zakat`)
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
- **Animasi:** Tailwind transitions + CSS `@keyframes` (fadeIn, slideUp) — **semua animasi keyframe didefinisikan terpusat di `global.css`**, halaman hanya menggunakan class utility `.animate-fade-in` / `.animate-slide-up`
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
| `quran-bookmarks` | JSON | Bookmark surah & ayat |
| `quran-settings` | JSON | Ukuran font, toggle latin/terjemah |

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
- **Static Site Generation** — semua halaman di-pre-render saat build (126 pages)
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

---

## 🛡 Code Quality Patterns

Semua halaman mengikuti pola standar untuk mencegah bug umum:

### Guard Flag (Duplicate Listener Prevention)
Setiap halaman dengan `DOMContentLoaded` + `astro:after-swap` menggunakan flag `window._xxxInitialized` untuk mencegah registrasi listener ganda:
```js
const initPage = () => {
  if (window._pageInitialized) return;
  window._pageInitialized = true;
  // ... register event listeners
};
document.addEventListener('DOMContentLoaded', initPage);
document.addEventListener('astro:after-swap', initPage);
document.addEventListener('astro:before-swap', () => { window._pageInitialized = false; });
```
**Diterapkan di:** asmaul-husna, tahlil, zakat, quran/index, quran/[nomor], dzikir, tasbih

### Memory Leak Cleanup (astro:before-swap)
Halaman dengan timer/interval/audio/scroll listeners membersihkan resource saat navigasi keluar:
```js
document.addEventListener('astro:before-swap', () => {
  if (window._timer) { clearInterval(window._timer); delete window._timer; }
  if (window._audio) { window._audio.pause(); delete window._audio; }
});
```
**Diterapkan di:** sholat, sholat-guide, yasin, quran/[nomor], index, dzikir

### XSS Prevention
- **onclick attributes:** Semua interpolasi string ke `onclick` di-escape dari single quote (`'` → `\'`)
- **innerHTML:** Data dari localStorage/user di-escape menggunakan helper `textContent`-based escaping:
  ```js
  const htmlEscape = (() => { const el = document.createElement('div'); return (s) => { el.textContent = String(s); return el.innerHTML; }; })();
  ```
- **innerText / textContent diprioritaskan** untuk data user (hindari innerHTML jika tidak perlu)
**Diterapkan di:** doa, dzikir, quran/index

### CSS DRY (Single Source)
- Semua `@keyframes` didefinisikan satu kali di `global.css`
- Halaman hanya menggunakan class utility (`.animate-fade-in`, `.animate-slide-up`)
- Tidak ada duplikasi `<style>` block antar halaman

### Sholat Time Math
- `addMinutes` menggunakan modulo 1440 arithmetic (mencegah midnight wrap: 23:59 + 2 = 00:01)
- `getNextPrayerTime` menangani post-midnight scenario (00:00–Fajr mengembalikan Fajr hari ini, bukan besok)
- Koreksi ihtiyat hanya diterapkan ke 5 waktu sholat + Imsak (Sunrise tidak dikoreksi — aman untuk Fajr timing)
- GPS fetch deduplication via `fetchInFlight` map (mencegah double API call saat GPS retry)
