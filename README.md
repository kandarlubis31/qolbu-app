# Qolbu App

Aplikasi Ibadah Harian Terlengkap berbasis web (PWA-ready). Dibangun dengan **Astro 5 + Tailwind CSS 4 + TypeScript**.

## ✨ Fitur Utama

- **🕐 Jadwal Sholat & Arah Kiblat** — GPS otomatis, countdown real-time, kompas kiblat, notifikasi adzan
- **📖 Al-Qur'an** — 114 surat pre-rendered (SSG), offline cache via IndexedDB, audio per-ayat (Misyari Rasyid Al-Afasi)
- **🤲 Doa Harian** — 47 doa dalam 9 kategori dengan pencarian & copy-to-clipboard
- **📿 Dzikir Pagi & Petang** — 25+ dzikir (6 kategori), tab filter, info pengulangan
- **📅 Kalender Hijriah** — 12 bulan, event Islami penting, disclaimer hisab/rukyat
- **📋 Panduan Sholat** — 28 langkah (syarat sah → niat → rukun → dzikir), progress tracker, bookmark, mode praktik
- **📜 Tahlil & Doa Arwah** — 7 bacaan lengkap, pengaturan font
- **🔢 Tasbih Digital** — Counter haptic/sound, 4 dzikr, auto-cycle, statistik harian
- **💰 Kalkulator Zakat** — Zakat Maal & Penghasilan, format Rupiah, nishab 85gr emas
- **🌟 Asmaul Husna** — 99 nama Allah dengan search
- **💬 Quote of the Day** — 100+ quotes rotasi 10 detik

## 🚀 Quick Start

### Prasyarat

- Node.js 20+
- npm 10+

### Instalasi

```bash
# Clone repo
git clone <repo-url>
cd qolbu-app

# Install dependencies
npm install

# Development server (localhost:4321)
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

### PWA Install

1. Buka di browser mobile (Chrome/Edge/Safari)
2. Klik menu browser → "Install App" / "Add to Home Screen"
3. App bisa diakses offline setelah install

## 🛠 Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start dev server dengan hot reload       |
| `npm run build`     | Build static site ke folder `dist/`      |
| `npm run preview`   | Preview build production                 |
| `npm run typecheck` | TypeScript type checking (`astro check`) |
| `npm run lint`      | ESLint check (Astro, TS, JS)             |
| `npm run format`    | Prettier format all files                |
| `npm run prepare`   | Setup Husky git hooks                    |

## 🏗 Arsitektur

```
qolbu-app/
├── public/                 # Static assets (logo, manifest, sw.js)
├── src/
│   ├── components/         # Reusable Astro components
│   │   ├── HeaderBack.astro
│   │   ├── SearchBar.astro
│   │   ├── SettingsModal.astro
│   │   └── Toast.astro
│   ├── data/               # Static JSON data
│   │   ├── doa.json (47 doa)
│   │   ├── dzikir.json (13 dzikir pagi)
│   │   ├── events-hijri.json
│   │   ├── asmaul-husna.json (99 nama)
│   │   ├── tahlil.json (7 item)
│   │   └── yasin.json (5 ayat)
│   ├── layouts/
│   │   └── BaseLayout.astro # Global layout: header, footer, PWA, SEO, theme
│   ├── pages/              # 127 static routes (SSG)
│   │   ├── index.astro     # Dashboard
│   │   ├── quran/[nomor].astro # 114 surat detail
│   │   └── ...
│   ├── styles/
│   │   └── global.css      # Tailwind v4 + animations
│   └── env.d.ts            # Global type declarations
├── .github/workflows/ci.yml # CI pipeline
├── .husky/pre-commit       # Pre-commit hooks
├── astro.config.mjs
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc
├── CONTEXT.md              # Architecture quick reference
├── docs/PRD.md             # Product Requirements Document
└── package.json
```

## 🔧 Tech Stack

| Layer       | Technology                                                    |
| ----------- | ------------------------------------------------------------- |
| Framework   | Astro 5 (SSG)                                                 |
| Styling     | Tailwind CSS 4                                                |
| Type Safety | TypeScript (strict)                                           |
| PWA         | Manifest + Service Worker (network-first + cache-first audio) |
| Animations  | View Transitions API (slide, header morphing)                 |
| Icons       | Inline SVG                                                    |

## 📱 PWA Features

- **Manifest**: `display: standalone`, icons 192×192 & 512×512
- **Service Worker**: Network-first untuk halaman, Cache-first untuk audio Qur'an
- **Offline Page**: `/offline` fallback dengan daftar fitur available offline
- **Theme Persistence**: localStorage + View Transitions `transition:persist`

## 📋 Code Quality

- **TypeScript**: Strict mode via `astro/tsconfigs/strict`
- **ESLint**: Flat config with `eslint-plugin-astro`, `eslint-plugin-tailwindcss`, `@typescript-eslint`
- **Prettier**: With `prettier-plugin-astro` & `prettier-plugin-tailwindcss`
- **Husky + lint-staged**: Pre-commit auto-fix & format

## 🔌 External APIs

| API          | Endpoint                                 | Usage                       |
| ------------ | ---------------------------------------- | --------------------------- |
| Aladhan      | `api.aladhan.com/v1/timings`             | Prayer times by coordinates |
| Equran.id    | `equran.id/api/v2/surat`                 | Surah list & detail         |
| Nominatim    | `nominatim.openstreetmap.org/reverse`    | Reverse geocoding           |
| EveryAyah    | `everyayah.com/data/Alafasy_128kbps/`    | Yasin audio fallback        |
| Equran Audio | `equran.nos.wjv-1.neo.id/audio-partial/` | Per-ayat audio              |

## 📦 Deploy

### Netlify (Recommended)

1. Connect repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Netlify auto-detects Astro

### Vercel

```bash
npx vercel deploy dist --prod
```

### Cloudflare Pages

- Build command: `npm run build`
- Output: `dist`

### Static Hosting (nginx/Apache)

Upload folder `dist/` ke web server

## 📝 Catatan Pengembangan

- **Zero client-side framework**: Semua JS inline vanilla (`is:inline`)
- **View Transitions**: SPA-like navigation dengan slide animation
- **Mobile-first**: Layout `max-w-md` (448px), touch-optimized
- **127 halaman SSG**: Dashboard + 11 fitur + 114 surat Qur'an
- **Type-safe**: Global types di `src/env.d.ts` untuk window extensions

## 📄 Lisensi

MIT License — Dibuat oleh [PakLubis](https://paklubis.my.id)
