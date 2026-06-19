# PRD: Qolbu by PakLubis — Aplikasi Ibadah Harian

> **Product Requirements Document**
> Version: 2.0 | Last Updated: June 20, 2026
> Tech Stack: **Astro 5 + Tailwind CSS 4 + TypeScript** (zero client-side framework)

---

## 1. Product Overview

### 1.1 Vision
Aplikasi web ibadah harian terlengkap berbasis PWA yang mobile-first, dapat diinstal ke homescreen HP, dan membantu Muslim menjalankan ibadah sehari-hari.

### 1.2 Target Users
- Muslim Indonesia (bahasa Indonesia utama)
- Usia 15–50 tahun, smartphone-first
- Mencari solusi all-in-one untuk ibadah harian

### 1.3 Key Differentiators
- **Zero framework client-side** — semua inline vanilla JS, tanpa React/Vue
- **PWA-full** — manifest + service worker, installable
- **114 Surat pre-rendered** via SSG `getStaticPaths()`
- **Offline-first** untuk jadwal sholat (cache stale-while-revalidate)
- **Mobile-first** max-w-md layout

---

## 2. Tech Stack & Arsitektur

### 2.1 Stack Inti
| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Framework | Astro | ^5.17.1 |
| CSS | Tailwind CSS | ^4.1.18 |
| Type Safety | TypeScript | via Astro |
| Build | Astro SSG | Static Site Generation |
| PWA | Manifest + Service Worker | Vanilla |

### 2.2 Struktur Direktori
```
/
├── public/
│   ├── logo.png
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service Worker (network-first)
├── src/
│   ├── components/            # Reusable Astro components
│   │   ├── HeaderBack.astro
│   │   ├── SearchBar.astro
│   │   ├── SettingsModal.astro
│   │   └── Toast.astro
│   ├── data/                  # Static JSON data
│   │   ├── yasin.json         # 83 ayat Surat Yasin
│   │   ├── tahlil.json        # 7 bacaan tahlil
│   │   └── doa.json           # 40+ doa harian (9 kategori)
│   ├── layouts/
│   │   └── BaseLayout.astro   # Global layout: header, footer, SEO, PWA, theme
│   ├── pages/
│   │   ├── index.astro        # Dashboard + quote of the day
│   │   ├── doa.astro          # Doa harian encyclopedia
│   │   ├── sholat.astro       # Prayer times + qibla compass
│   │   ├── sholat-guide.astro # Complete prayer guide (28 steps)
│   │   ├── tahlil.astro       # Tahlil & arwah prayers
│   │   ├── tasbih.astro       # Digital tasbih counter
│   │   ├── zakat.astro        # Zakat calculator
│   │   └── quran/
│   │       ├── index.astro    # Surah & Juz list (searchable)
│   │       ├── [nomor].astro  # Per-surah detail page (114 pages)
│   │       └── yasin.astro    # Full Surah Yasin
│   └── styles/
│       └── global.css         # Tailwind v4 import + dark variant
├── astro.config.mjs           # Tailwind CSS Vite plugin
├── tsconfig.json              # Strict TypeScript
├── package.json
├── CONTEXT.md                 # Architecture documentation
├── README.md                  # User guide
└── docs/PRD.md                # ← This document
```

### 2.3 Build & Deploy
- **Build:** `npm run build` → static output to `dist/`
- **Dev:** `npm run dev` → localhost:4321
- **Routes:** All Astro pages are pre-rendered at build time
- **SSG:** 123 pages total (index + 7 subpages + 114 surat + 1 yasin)

---

## 3. Pages & Features

### 3.1 Dashboard (`/`)
**Route:** `src/pages/index.astro`

**Purpose:** Landing page with prayer widget, menu grid + daily Islamic quote.

**Components Used:** None (inline everything)

**Features:**
- **Prayer Widget** — live countdown to next prayer + 5 waktu kompak + arah kiblat
  - Reads from `sholat-cache-*` localStorage (shared with `/sholat`)
  - Auto-countdown per detik, cleanup on page swap
  - Qibla formula spherical trigonometry (identik dengan `/sholat`)
  - Hidden when no cached data available
- **Quran Offline Badge** — compact badge showing cached surah count (replaces old ring)
- **8 Menu Grid** (2 columns):
  1. Jadwal Sholat (featured — full-width gradient card)
  2. Al-Qur'an
  3. Doa Harian
  4. Kalkulator Zakat
  5. Panduan Sholat
  6. Tahlil & Doa
  7. Tasbih Digital
  8. Asmaul Husna
- **Quote of the Day:** Rotasi random tiap 10 detik dari 100+ quotes (Al-Qur'an, Hadits, Ulama)
- **Date display** in Indonesian locale
- **Fade-in animation** on page load

**Data:**
- `quotesData` — inline array of 100+ quotes (no JSON file)

**Interactions:**
- Click any menu card → navigate to respective page
- Auto-rotasi quote tiap 10 detik dengan fade transition
- Hover scale effect on cards

### 3.2 Jadwal Sholat (`/sholat`)
**Route:** `src/pages/sholat.astro`

**Purpose:** Real-time prayer times with countdown, qibla compass, and notifications.

**Components Used:** `SettingsModal`, `Toast`

**External APIs:**
- **Aladhan API:** `https://api.aladhan.com/v1/timings/{date}?latitude={lat}&longitude={lng}&method={method}`
- **Nominatim OSM:** `https://nominatim.openstreetmap.org/reverse` (reverse geocoding GPS → city name)

**Features:**
- **Countdown timer** to next prayer (real-time per second)
- **5 Prayer times:** Subuh, Dzuhur, Ashar, Maghrib, Isya
- **Imsak & Sunrise** display
- **Dhuha time** (Sunrise + 20 menit)
- **Progress bar** — elapsed time within current prayer window
- **Hijri date + Gregorian date** display
- **Qibla compass:** Spherical trigonometry formula (Ka'bah: 21.4225, 39.8262)
  - Full-screen compass modal with DeviceOrientation API
  - iOS permission handling via `DeviceOrientationEvent.requestPermission()`
- **Settings modal:**
  - Koreksi Ihtiyat (± menit, default 2)
  - GPS otomatis toggle + manual lat/lng input
  - Metode perhitungan (Kemenag, MWL, ISNA, Umm Al-Qura, Egyptian, MUIS)
  - Suara Adzan (Web Audio API — triangle oscillator, melodic "Allahu Akbar")
  - Volume slider (0-100%)
  - Pengingat 10 menit sebelum sholat
  - Test Adzan button
  - All settings persisted to localStorage

**Caching:**
- `sholat-cache-{date}-{lat}-{lng}-{method}-{correction}` in localStorage
- Stale-while-revalidate: render cached data, then fetch fresh data

**Notifications:**
- Browser Notification API (`Notification.permission`)
- Adzan notification at prayer time + audio playback
- Reminder notification 10 minutes before

**Interaction Details:**
- GPS auto-detect on page load with 2 retries
- Manual refresh button with spinning icon
- Click qibla button → full-screen compass mode
- Active prayer card highlighted with emerald-500 bg
- Imsak & Sunrise shown only when relevant

**localStorage Keys:**
- `sholat-settings` — all settings object
- `sholat-cache-*` — cached prayer data per date/location
- `sholat-notified-adhan` — notification dedup
- `sholat-notified-remind` — notification dedup

### 3.3 Al-Qur'an (`/quran`)
**Routes:**
- `/quran` — `src/pages/quran/index.astro` (daftar surat + juz)
- `/quran/[nomor]` — `src/pages/quran/[nomor].astro` (detail surat, 114 halaman)
- `/quran/yasin` — `src/pages/quran/yasin.astro` (surat yasin lengkap)

**Purpose:** Read Al-Qur'an with arabic text, latin transliteration, translation, and audio per-ayat.

**External APIs:**
- **Equran.id API v2:** `https://equran.id/api/v2/surat` (daftar surat)
- **Equran.id API v2:** `https://equran.id/api/v2/surat/{nomor}` (detail surat)
- **Equran Audio CDN:** `https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/{nomorsurat}{nomorayat}.mp3`
- **EveryAyah:** `https://everyayah.com/data/Alafasy_128kbps/{nomor}.mp3` (fallback for Yasin)

**Features:**

**Index Page (`/quran`):**
- Tab view: Daftar Surat & Daftar Juz (30 juz)
- **Search surat** by latin name
- **Lanjut Baca** banner — "continue reading" link from localStorage
- Surat card: nomor, arabic name, latin name, revelation type, ayat count
- **Surat Yasin** featured card (gradient)
- Juz list with starting surah & ayat
- **Offline Cache Section** — cache all 114 surah with progress bar
  - Checkbox to include audio files (~500MB-2GB total)
  - Batch download (5 concurrent), 2 phases: surah data → audio files
  - Green check badges on cached surah cards
  - Cache count display (X/114)
- **Bookmark Section** — list of bookmarked surah/ayat from localStorage

**Detail Page (`/quran/[nomor]`):**
- SSG via `getStaticPaths()` — 114 pre-rendered pages
- Header: arabic name, latin name, meaning, ayat count
- Ayat-by-ayat view: arabic text, latin, translation
- **Mushaf Mode** toggle — continuous arabic text with surah markers
- **Audio per-ayat** — play, pause, auto-play next
- **Audio auto-sequence** — after one ayat finishes, play next ayat automatically
- **Audio prefecth** — prefecth next 3 ayat audio URLs (HTTP cache warming)
- **Bookmark button** — save/remove surah bookmark (localStorage `quran-bookmarks`)
- **Auto-cache on visit** — automatically cache current surah to IndexedDB (background)
- **Last Read position** — saved on scroll (debounced 1.5s) + audio click
- **Scroll-to-hash** on page load (e.g., `#ayat-10`)
- Highlight on target ayat with ring + shadow (2s fade)
- **Settings:** font size (slider 1-5), toggle latin/terjemah

**Yasin Page (`/quran/yasin`):**
- 83 ayat from local `yasin.json`
- Same layout as surat detail page
- **Play All** button — plays entire surah sequentially with progress bar
- Stop button
- **Audio prefecth** — prefecth next 3 ayat audio
- Last Read position persisted to `quran-last-read` (shared with other surat)

**Interactions:**
- Click audio button → play/pause specific ayat
- Click play all → auto-play from ayat 1
- Scroll → auto-save last read position
- Click "Lanjut Baca" → scroll to last read ayat
- Settings: slider for arabic font size, toggles for latin/translation

**IndexedDB:**
- **Database:** `qolbu-quran-cache` (v1)
- **Store:** `surah-cache` with keyPath `nomor`
- **Data:** Full surah data (ayat, audio URLs) cached offline

**localStorage Keys:**
- `quran-settings` — { size, showLatin, showArti }
- `yasin-settings` — { size, showLatin, showArti }
- `quran-last-read` — { surah, ayat, surahName, timestamp }
- `quran-bookmarks` — [{ surah, surahName, ayat, timestamp }]

### 3.4 Doa Harian (`/doa`)
**Route:** `src/pages/doa.astro`

**Purpose:** Encyclopedia of 40+ daily prayers from Qur'an & Hadith.

**Components Used:** `HeaderBack`, `SearchBar`, `Toast`

**Data:** `src/data/doa.json` — array of 42 doa objects

**Features:**
- **9 Category filters:** Semua, Sehari-hari, Al-Qur'an, Sholat, Rizki, Keluarga, Sakit, Perjalanan, Taubat
- **Search** by title, latin, or translation
- **Copy to clipboard** — formatted text with title, arabic, latin, translation, app attribution
- **Empty state** when no results match

**Interaction Details:**
- Category pills horizontally scrollable (hide scrollbar)
- Category button active state: emerald-600 bg
- Click copy button → toast notification "Teks berhasil disalin!"
- Toast auto-hides after 2s

**Categories in doa.json:**
- `harian` — daily prayers (bangun tidur, makan, WC, dll.)
- `quran` — doa from Al-Qur'an
- `sholat` — prayer-related doa
- `rizki` — sustenance & ease
- `keluarga` — family
- `sakit` — sickness & calamity
- `safar` — travel
- `taubat` — repentance & heart

### 3.5 Panduan Sholat (`/sholat-guide`)
**Route:** `src/pages/sholat-guide.astro`

**Purpose:** Complete step-by-step prayer guide (mazhab Syafi'i) with 28 steps.

**Components Used:** `Toast`

**Data:** Inline array of 28 guide objects (no JSON file)

**Features:**
- **28 Steps** covering: Syarat Sah, Niat (5 waktu), Rukun Sholat (Takbir → Salam), Dzikir Setelah Sholat, Ringkasan Rakaat
- **Accordion UI** — only one step open at a time
- **Progress tracker** — localStorage `sholat-completed` (array of step IDs)
- **Mark Complete / Undo** per step
- **Bookmark** steps — localStorage `sholat-bookmarks`
- **Bookmark modal** — list all bookmarked steps, click to navigate
- **Search** by step text
- **Practice Mode** — auto-plays steps every 15 seconds with audio
- **Audio playback** for Al-Fatihah & Surat Pendek (Al-Ikhlas)
- **Reset progress** button
- **Step SVG diagrams** for: Takbir, Ruku, I'tidal, Sujud, Duduk Antar Sujud, Tasyahud Awal, Tasyahud Akhir, Salam

**Steps Categories:**
1. Syarat Sah (1 step)
2. Niat Sholat (5 steps — Subuh, Dhuhur, Ashar, Maghrib, Isya)
3. Rukun Sholat (10 steps — Takbir → Doa Sebelum Salam)
4. Sunnah Sholat Subuh (1 step — Qunut)
5. Tasyahud (3 steps — Awal, Akhir, Shalawat)
6. Dzikir Setelah Sholat (4 steps — Istighfar → Doa Penutup)
7. Ringkasan Rakaat (1 step)

**Interactions:**
- Click step header → expand/collapse accordion
- Click "Tandai Selesai" → mark step as completed
- Click bookmark icon → toggle bookmark
- Click audio button → play audio file (.mp3)
- Click "Mulai Praktik" → auto-navigate through steps
- Search → filter visible steps
- View bookmarks → modal with scrollable list

**localStorage Keys:**
- `sholat-completed` — string[] of completed step IDs
- `sholat-bookmarks` — string[] of bookmarked step IDs

### 3.6 Tahlil & Doa Arwah (`/tahlil`)
**Route:** `src/pages/tahlil.astro`

**Purpose:** Tahlil recitation for deceased family prayer.

**Components Used:** `SettingsModal`

**Data:** `src/data/tahlil.json` — 7 items

**Features:**
- Step-by-step tahlil display (arabic + latin + translation)
- **Settings modal:** font size slider (1-5), toggle latin/terjemah
- Closing card with "Kembali ke Dashboard" button

**localStorage Keys:**
- `tahlil-settings` — { size, showLatin, showArti }

### 3.7 Tasbih Digital (`/tasbih`)
**Route:** `src/pages/tasbih.astro`

**Purpose:** Digital dhikr counter with haptic feedback, sound, and statistics.

**Components Used:** `HeaderBack`

**Features:**
- **Big circle counter** (288px) — click or press Space/Enter
- **4 Dhikr options:** Subhanallah, Alhamdulillah, Allahu Akbar, Laa ilaaha illallah
- **Auto-Cycle mode** — after reaching target, auto-switch to next dhikr in sequence
- Sequence indicator when Auto-Cycle is active
- **Progress bar** with count/target display
- **Target selector:** 33, 99, 100, or unlimited (0)
- **Haptic feedback:** `navigator.vibrate(15ms)` per count
- **Audio feedback:** Web Audio API (sine wave 800Hz, 100ms)
- **Keyboard shortcut:** Space / Enter
- **Success modal** when target reached (with "Lanjut"/"Reset" buttons)
- **Statistics:** today's total count, sessions, streak (consecutive days completed)
- **Date-aware stats** — checks every 60s for date change

**Interaction Details:**
- Tap circle → increment counter
- Long press detection prevention (no double-tap zoom)
- Scale + color pulse animation on count
- Success: longer vibration pattern + success sound + modal
- Auto-cycle wraps around through all 4 dhikr types

**localStorage Keys:**
- `tasbih-count` — number
- `tasbih-target` — number (33, 99, 100, 0)
- `tasbih-dhikr` — string
- `tasbih-vibrate` — boolean
- `tasbih-sound` — boolean
- `tasbih-autocycle` — boolean
- `tasbih-stats` — JSON object with daily data

### 3.8 Kalkulator Zakat (`/zakat`)
**Route:** `src/pages/zakat.astro`

**Purpose:** Zakat calculator for Maal (wealth) and income.

**Components Used:** `HeaderBack`

**Features:**
- **Two modes:** Zakat Maal & Zakat Penghasilan (tab switch)
- **Maal inputs:** Harga emas/gram, total harta, hutang jatuh tempo
- **Income inputs:** Penghasilan per bulan, bonus/THR opsional
- **Rupiah auto-format** (1.234.567) on input
- **Nishab calculation:**
  - Maal: 85 gram emas (haul 1 tahun)
  - Income: 85 gram emas / 12 bulan
- **Zakat rate:** 2.5% of eligible wealth
- **Result card:** zakat amount + nishab status (wajib/belum wajib)
- **Automatic scroll** to result after calculation

**Interaction Details:**
- Click "Hitung Zakat" → calculate and show result
- Result card with gradient bg + decorative SVG
- Status badges: green (wajib) / red (belum wajib)
- Smooth fade-in animation on result

---

## 4. Design System

### 4.1 Layout
- **Mobile-first** — all pages constrained to `max-w-md mx-auto` (448px)
- **Sticky headers** — `top-16` (below global header), backdrop-blur
- **Footer** — centered, attribution to PakLubis
- **Global header** — logo + Qolbu brand + theme toggle

### 4.2 Color Palette
| Token | Light | Dark |
|-------|-------|------|
| Primary | emerald-500 (#10b981) | emerald-400 (#34d399) |
| Background | slate-50 | slate-950 |
| Surface | white | slate-900 |
| Text | slate-800 | slate-100 |
| Border | slate-200/60 | slate-800/60 |

### 4.3 Typography
| Font | Usage |
|------|-------|
| **Inter** | Body text, headings, UI elements |
| **Amiri** | Arabic text (400, 700) |

### 4.4 Border Radius
- Cards: `rounded-2xl` (16px), `rounded-3xl` (24px)
- Buttons: `rounded-xl` (12px), `rounded-full`
- Modals: `rounded-t-3xl` (top-only, 24px)

### 4.5 Dark Mode
- **Strategy:** `class`-based dark mode (`dark` class on `<html>`)
- **Persistence:** localStorage `theme` key
- **Fallback:** `prefers-color-scheme` (system preference)
- **Implementation:** Inline `<script>` in head to prevent flash (FOIT)
- **Toggle:** Button in global header, persists across pages via `transition:persist`

---

## 5. Components

### 5.1 BaseLayout.astro
**File:** `src/layouts/BaseLayout.astro`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageTitle` | string | "Dashboard" | Title without suffix |
| `description` | string | (default SEO) | Meta description |
| `image` | string | "/logo.png" | OG image URL |

**Includes:**
- HTML5 boilerplate with `<html lang="id">`
- View Transitions API (`ClientRouter`, `transition:animate="slide"`, `transition:name`, `transition:persist`)
- PWA meta tags (manifest, apple-touch-icon, theme-color)
- SEO meta tags (Open Graph, Twitter Card)
- Google Fonts (Inter + Amiri)
- Theme inline script (anti-FOIT)
- Global sticky header with logo + theme toggle
- Main content wrapper
- Footer with dynamic year
- Theme toggle script (cloneNode pattern for astro:after-swap)
- Service Worker registration

### 5.2 HeaderBack.astro
**File:** `src/components/HeaderBack.astro`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | string | "/" | Back link target |
| `label` | string | "Kembali" | Back button text |
| `title` | string | — | Optional center title |
| `rightSlot` | boolean | false | Enable right slot |

**Used by:** doa, zakat, quran/index, tahlil, quran/yasin (partial)

### 5.3 SearchBar.astro
**File:** `src/components/SearchBar.astro`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | string | "Cari..." | Input placeholder |
| `id` | string | "search-input" | Input element ID |

**Used by:** doa

### 5.4 SettingsModal.astro
**File:** `src/components/SettingsModal.astro`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modalId` | string | "settings-modal" | Modal container ID |
| `overlayId` | string | "overlay" | Backdrop ID |
| `closeId` | string | "close-settings" | Close button ID |
| `title` | string | "Pengaturan Tampilan" | Modal title |

**Features:**
- Bottom sheet (slide-up animation)
- Backdrop overlay with blur
- Close on overlay click or close button
- Max height 85vh, scrollable

**Used by:** sholat, tahlil, quran/[nomor]

### 5.5 Toast.astro
**File:** `src/components/Toast.astro`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | "toast" | Container ID |
| `msgId` | string | "toast-msg" | Message span ID |

**Features:**
- Fixed bottom-center position
- Slide-up + fade-in animation
- Auto-hide via JS (2-2.5s timeout)
- Always `pointer-events-none`

**Used by:** doa, sholat, sholat-guide

---

## 6. Data & Storage

### 6.1 Static Data Files
| File | Format | Content | Used By |
|------|--------|---------|---------|
| `src/data/doa.json` | JSON array | 42 doa with cat, title, arab, latin, arti, source | `/doa` |
| `src/data/tahlil.json` | JSON array | 7 tahlil items with judul, arab, latin, arti | `/tahlil` |
| `src/data/yasin.json` | JSON array | 83 ayat with nomor, arab, latin, arti, audio | `/quran/yasin` |
| `src/data/asmaul-husna.json` | JSON array | 99 Asmaul Husna with index, latin, arabic, meaning | `/asmaul-husna` |
### 6.2 localStorage Keys Registry
| Key | Type | Format | Used By | Purpose |
|-----|------|--------|---------|---------|
| `theme` | string | `"dark"\|"light"` | BaseLayout | Theme persistence |
| `sholat-settings` | JSON | object | `/sholat` | All prayer settings |
| `sholat-cache-*` | JSON | object | `/sholat`, `/` | Cached prayer times (shared with home widget) |
| `sholat-notified-adhan` | JSON | object | `/sholat` | Adzan notification dedup |
| `sholat-notified-remind` | JSON | object | `/sholat` | Reminder notification dedup |
| `quran-settings` | JSON | object | `/quran/[nomor]` | Font size, latin, arti toggles |
| `yasin-settings` | JSON | object | `/quran/yasin` | Font size, latin, arti toggles |
| `tahlil-settings` | JSON | object | `/tahlil` | Font size, latin, arti toggles |
| `sholat-completed` | JSON | string[] | `/sholat-guide` | Completed step IDs |
| `sholat-bookmarks` | JSON | string[] | `/sholat-guide` | Bookmarked step IDs |
| `quran-bookmarks` | JSON | array | `/quran/*` | Bookmarked surah list |
| `tasbih-count` | number | plain | `/tasbih` | Current count |
| `tasbih-target` | number | plain | `/tasbih` | Target count |
| `tasbih-dhikr` | string | plain | `/tasbih` | Selected dhikr |
| `tasbih-vibrate` | boolean | plain | `/tasbih` | Vibration toggle |
| `tasbih-sound` | boolean | plain | `/tasbih` | Sound toggle |
| `tasbih-autocycle` | boolean | plain | `/tasbih` | Auto-cycle toggle |
| `tasbih-stats` | JSON | object | `/tasbih` | Daily statistics |
| `quran-last-read` | JSON | object | `/quran/*` | Last read position |
| `quran-bookmarks` | JSON | array | `/quran/*` | Bookmarked surah list |
| `sholat-settings` | JSON | object | `/sholat` | All prayer settings |
| `sholat-cache-*` | JSON | object | `/sholat`, `/` | Cached prayer times (shared with home widget) |
| `quran-bookmarks` | JSON | array | `/quran/*` | Bookmarked surah list |

### 6.3 External APIs
| API | Endpoint | Purpose | Used By |
|-----|----------|---------|---------|
| **Aladhan** | `api.aladhan.com/v1/timings` | Prayer times | `/sholat` |
| **Equran.id** | `equran.id/api/v2/surat` | Surah list + detail | `/quran/*` |
| **Nominatim** | `nominatim.openstreetmap.org/reverse` | Reverse geocoding | `/sholat` |
| **EveryAyat** | `everyayah.com/data/Alafasy_128kbps/` | Quran audio (Yasin) | `/quran/yasin` |
| **Equran Audio** | `equran.nos.wjv-1.neo.id/audio-partial/...` | Audio per ayat | `/quran/[nomor]` |

---

## 7. PWA & Performance

### 7.1 Service Worker
**File:** `public/sw.js`

**Strategy:** Network-first with cache fallback, audio cache-first
- **Install:** Cache shell (all route pages + logo)
- **Fetch (pages):** Network-first — try network → cache on success → fallback to cache on failure
- **Fetch (audio):** Cache-first — serve from cache if available, fetch otherwise (for Quran audio CDN)
- **Activate:** Clean old caches, claim clients

**Audio CDN Routes (cache-first):**
- `equran.nos.wjv-1.neo.id` (Quran audio partial)
- `everyayah.com` (Quran audio fallback)
- `download.quranicaudio.com` (Quran audio)
- Any URL containing `audio` and ending in `.mp3`

**Cached Assets:**
- `/`, `/sholat`, `/quran`, `/quran/yasin`, `/doa`, `/sholat-guide`, `/tahlil`, `/tasbih`, `/zakat`, `/logo.png`

### 7.2 Manifest
**File:** `public/manifest.json`

**Properties:**
- `display: standalone` (full-screen app-like)
- `orientation: portrait`
- `theme_color: #10b981` (emerald-500)
- `background_color: #ffffff`
- Icons: 192x192 + 512x512 (maskable)

### 7.3 View Transitions
- **ClientRouter** in `<head>` — enables SPA-like navigation
- **Slide animation** on `<html>` — slide-from-right between pages
- **Header morphing** via `transition:name="site-header"` — no flash
- **Theme toggle persistence** via `transition:persist`

### 7.4 Performance Considerations
- **Static Site Generation** — 124 pages pre-rendered at build
- **Ponytail Philosophy** — minimal code, reuse stdlib/native features, no unrequested abstractions
- **Stale-while-revalidate** — prayer data cached + background refresh
- **Mobile-first** — max-w-md layout, touch-optimized
- **Inline scripts** only — no hydration overhead
- **Arabic font** preconnected + preloaded

---

## 8. Development Guidelines

### 8.1 Code Conventions
- **All client scripts** use `is:inline` — no framework client-side JS
- **Event listeners** attached in `DOMContentLoaded` + `astro:after-swap` for View Transitions
- **JSON data** imported directly in Astro frontmatter (static import)
- **HTML `<script>`** uses `set:html` for inline SVG/icons
- **TypeScript** via Astro frontmatter types `interface Props {}`
- **Tailwind** utility classes exclusively (no custom CSS except animations)

### 8.2 Responsive Strategy
- **Desktop:** Content centered in `max-w-md` container
- **Mobile:** Full width, touch targets at least 44px
- **Sticky headers** adapt for both viewport sizes
- **Modals** expand to `max-w-md` with `translateX(-50%)` centering

### 8.3 Accessibility
- `aria-label` on icon-only buttons (theme toggle)
- `sr-only` class for hidden checkboxes (toggle switches)
- Semantic HTML (main, nav, header, footer)
- `tabular-nums` for countdown digits

### 8.4 Testing Considerations
- **Unit tests:** Not yet implemented
- **Manual testing:** Build → preview in mobile browser
- **PWA testing:** Chrome DevTools → Lighthouse → PWA audit
- **Audio testing:** Web Audio API requires user interaction

---

## 9. Future Roadmap (Suggestions)

1. **Push notifications** for adzan times via Service Worker
2. **Offline Quran reading** — cache surah data in IndexedDB
3. **Jadwal sholat bulanan** — calendar view for monthly schedule
4. **Multiple language support** — English/Arabic locale
5. **Audio streaming** for full murottal (not just per-ayat)
6. **Community doa requests** — user-submitted prayers
7. **Widget** — homescreen widget for prayer times
8. **Sync across devices** — via account system

---

## 10. Appendix

### 10.1 Route Map
| Route | Page | SSG | Title |
|-------|------|-----|-------|
| `/` | index.astro | ✅ | Home → Dashboard |
| `/sholat` | sholat.astro | ✅ | Jadwal Sholat & Kiblat |
| `/quran` | quran/index.astro | ✅ | Al-Qur'an |
| `/quran/[nomor]` | quran/[nomor].astro | ✅ (114x) | Surat {namaLatin} |
| `/quran/yasin` | quran/yasin.astro | ✅ | Surat Yasin |
| `/doa` | doa.astro | ✅ | Kumpulan Doa Mustajab |
| `/sholat-guide` | sholat-guide.astro | ✅ | Panduan Sholat Lengkap |
| `/tahlil` | tahlil.astro | ✅ | Tahlil & Doa |
| `/tasbih` | tasbih.astro | ✅ | Tasbih Digital |
| `/zakat` | zakat.astro | ✅ | Kalkulator Zakat |
| `/asmaul-husna` | asmaul-husna.astro | ✅ | Asmaul Husna |

### 10.2 localStorage Schema Details
```typescript
// sholat-settings
interface SholatSettings {
  lat: number;
  lng: number;
  city: string;
  method: number; // 20=Kemenag, 11=MUIS, 3=MWL, 2=ISNA, 4=UmmAlQura, 5=Egypt
  useGPS: boolean;
  adhan: boolean;
  remind: boolean;
  adhanVolume: number; // 0-100
  correction: number; // minutes (default: 2)
}

// quran-last-read
interface QuranLastRead {
  surah: string; // nomor surat
  ayat: number;
  surahName: string;
  timestamp: number;
}

// tasbih-stats
interface TasbihStats {
  [dateString: string]: {
    total: number;
    sessions: number;
    completed: boolean;
  };
}
```

### 10.3 JSON Data Structures
```typescript
// doa.json item
interface DoaItem {
  cat: "harian" | "quran" | "sholat" | "rizki" | "keluarga" | "sakit" | "safar" | "taubat";
  title: string;
  arab: string;
  latin: string;
  arti: string;
  source: string;
}

// tahlil.json item
interface TahlilItem {
  judul: string;
  arab: string;
  latin: string;
  arti: string;
}

// yasin.json item
interface YasinAyat {
  nomor: number;
  arab: string;
  latin: string;
  arti: string;
  audio: string; // URL to mp3
}
```
