# Qolbu App — Project Context

> Aplikasi Ibadah Harian Terlengkap berbasis web (PWA-ready).
> Dibangun dengan **Astro 5 + Tailwind CSS 4 + TypeScript** — zero client framework, mobile-first `max-w-md`.

---

> 📘 **Canonical source of truth:** [`docs/PRD.md`](./docs/PRD.md) — Product Requirements Document lengkap (spesifikasi, fitur, komponen, data, storage, API, arsitektur).
>
> File ini (`CONTEXT.md`) adalah ringkasan cepat (_quick reference_). Selalu rujuk ke `docs/PRD.md` untuk detail paling akurat. Jika ada perbedaan, `docs/PRD.md` yang berlaku.

---

## 🏗 Arsitektur

### Stack Inti

| Teknologi    | Versi                 | Kegunaan                                                     |
| ------------ | --------------------- | ------------------------------------------------------------ |
| Astro        | ^5.17.1               | SSG (127 pages) + View Transitions                           |
| Tailwind CSS | ^4.1.18               | Utility-first, @theme tokens                                 |
| TypeScript   | via Astro `strict`    | Strict type checking (`astro check`)                         |
| PWA          | Workbox vanilla       | `manifest.json` + `sw.js` v6                                 |
| Fonts        | Self-host             | Inter Variable WOFF2 (23KB) + Amiri TTF, `font-display:swap` |
| Testing      | Vitest 4 + Playwright | Unit 30, E2E 48, CI split jobs                               |
| Lint/Format  | ESLint 9 + Prettier   | `eslint-plugin-astro/tailwindcss`, Husky + lint-staged       |

### Struktur Direktori

```
/
├── public/
│   ├── fonts/               # Inter-VariableFont_wght.woff2 (23KB), Amiri-*.ttf
│   ├── logo.png / 192 / 512
│   ├── manifest.json
│   └── sw.js                # v6: font precache, audio cache-first, HTML network-first
├── src/
│   ├── components/
│   │   ├── HeaderSticky.astro  # Sticky top-16, truncate, leftSlot/rightSlot, history.back
│   │   ├── SearchBar.astro     # type=search, aria-label, sr-only label
│   │   ├── SettingsModal.astro # Bottom sheet, backdrop, Esc, focus-trap
│   │   ├── Toast.astro         # Fixed bottom, queue + click dismiss, role=status
│   │   ├── BottomNav.astro     # Mobile thumb-zone (Home/Sholat/Qur'an/Doa), auto-hide scroll
│   │   ├── ScrollFade.astro    # Mask fade untuk pills overflow
│   │   ├── EmptyState.astro    # icon + title + desc + CTA Reset
│   │   └── Skeleton.astro      # Variants: prayer/quran/dzikir/card/avatar, shimmer
│   ├── data/
│   │   ├── doa.json            # 47 Doa (9 kategori)
│   │   ├── dzikir.json         # 32 Dzikir (6 kategori: pagi/petang/subuh/sesudah/tidur/umum)
│   │   ├── events-hijri.json   # 12 bulan, detail deskripsi (dipakai page + dashboard bar)
│   │   ├── asmaul-husna.json   # 99 Nama
│   │   ├── tahlil.json         # 7 Bacaan
│   │   └── yasin.json          # 5 ayat sample (page yasin fetch 83 via API)
│   ├── lib/
│   │   ├── utils.ts            # addMinutes, qibla, zakat, rupiah, hijri helpers
│   │   └── utils.test.ts       # 30 unit tests
│   ├── layouts/
│   │   └── BaseLayout.astro    # header sticky + theme + BottomNav + skip-link + SEO + PWA + ClientRouter
│   ├── pages/
│   │   ├── index.astro         # Dashboard: prayer-card skeleton+CTA, hijri bar, cache badge, menu 10, quote
│   │   ├── asmaul-husna.astro  # 99 + counter + search + EmptyState
│   │   ├── doa.astro           # 47 filter + ScrollFade + search + EmptyState + aria-pressed
│   │   ├── dzikir.astro        # 32 via <script type="application/json">, ScrollFade, 6 tabs
│   │   ├── events-hijri.astro  # Import JSON, HeaderSticky
│   │   ├── sholat.astro        # Countdown, qibla needle, Skeleton prayer, correction, GPS
│   │   ├── sholat-guide.astro  # 28 langkah accordion, progress, bookmark modal
│   │   ├── tahlil.astro        # 7 step + SettingsModal
│   │   ├── tasbih.astro        # Circle 72, haptic, Web Audio, progress, aria-labels
│   │   ├── zakat.astro         # Tabs role=tablist, Rupiah cursor preserve, disabled btn
│   │   ├── offline.astro
│   │   └── quran/
│   │       ├── index.astro     # 114 surat + 30 juz, tabs ARIA, content-visibility
│   │       ├── [nomor].astro   # Per surat: header leftSlot/rightSlot + SettingsModal (single id), Per Ayat/Mushaf tabs ARIA, audio, share-btn (Web Share)
│   │       └── yasin.astro
│   ├── styles/global.css       # @font-face variable, @theme tokens, scroll-padding, shimmer, content-visibility
│   └── env.d.ts                # Window globals (_sholatInterval, _quranDetailInitialized, etc.)
├── e2e/                        # Playwright: home, sholat, quran, quran-detail, doa, tasbih (48)
├── .github/workflows/ci.yml    # jobs: test (typecheck+lint+unit+build) + e2e (chromium)
├── playwright.config.ts
├── vitest.config.mjs + vitest.setup.ts
├── eslint.config.mjs           # flat, astro+tailwind, ignores e2e
├── .prettierrc / .prettierignore
├── astro.config.mjs (Tailwind Vite)
├── tsconfig.json (extends astro/tsconfigs/strict)
├── package.json (scripts: dev/build/preview/typecheck/lint/test/test:e2e/format)
└── README.md / CONTEXT.md / docs/PRD.md
```

### Layout `BaseLayout.astro:1`

- `<html lang="id" scroll-smooth>` `max-w-md mx-auto` `overflow-x-hidden`
- Header `sticky top-0 z-50 backdrop-blur-xl` `transition:name="site-header"` + logo + `#theme-toggle` `transition:persist`
- `<a href="#main-content" sr-only>` skip-link + `<main id="main-content" min-h-[50vh] flex-1>`
- Footer PakLubis + `<BottomNav>` mobile `md:hidden` auto-hide on scroll
- **PWA:** `manifest link` + `sw.js` register on `load`
- **SEO:** OG + Twitter per `pageTitle`
- **Theme inline:** `localStorage('theme')` → `prefers-color-scheme`, re-apply `astro:after-swap`, `colorScheme` dark/light
- **Viewport:** `width=device-width, initial-scale=1.0, maximum-scale=5.0` (A11y zoom)
- **Fonts preload:** `Inter-VariableFont_wght.woff2` + `Amiri-Regular.ttf` `crossorigin`, `font-display:swap`

---

## 🧩 Komponen Reusable

### `HeaderSticky.astro:1` — Pengganti `HeaderBack`

Sticky `top-16 z-40 -mx-4 px-4 mb-4 gap-2` dengan truncate & history.back fallback.

| Prop                   | Default   | Desc                                          |
| ---------------------- | --------- | --------------------------------------------- |
| `title`                | —         | Judul, `truncate max-w-[140px] sm:180 flex-1` |
| `href`                 | `/`       | Back target                                   |
| `backLabel`            | `Kembali` | `hidden xs:inline`                            |
| `leftSlot`/`rightSlot` | `false`   | Aktifkan `<slot name="left                    | right">` |

Dipakai: **semua halaman** (doa, dzikir, asma, zakat, tahlil, sholat-guide, quran/index, events-hijri, quran/[nomor] leftSlot+rightSlot, quran/yasin).

### `SearchBar.astro:1`

`type="search"` + `sr-only label` + `aria-label` fallback placeholder.

| Prop          | Default        |
| ------------- | -------------- |
| `placeholder` | `Cari...`      |
| `id`          | `search-input` |
| `ariaLabel`   | `placeholder`  |

Dipakai: doa, dzikir, asmaul, quran/index.

### `SettingsModal.astro`

Bottom sheet `max-h-[85vh]` `animate-slide-up`, backdrop blur, `Esc` close, focus-trap Tab cycle, `aria-modal`.

| Prop        | Default               |
| ----------- | --------------------- |
| `modalId`   | `settings-modal`      |
| `overlayId` | `overlay`             |
| `closeId`   | `close-settings`      |
| `title`     | `Pengaturan Tampilan` |

Dipakai: `quran/[nomor]` (single id, sebelumnya duplikat dihapus `quran/[nomor].astro:151`).

### `Toast.astro:1`

Fixed `bottom-6 left-1/2` `role=status aria-live` `truncate`, queue via `clearTimeout`, click dismiss.
Global `window.showToast(msg,duration=2500)`.
Dipakai: sholat, sholat-guide, doa, dzikir, quran/[nomor], asmaul.

### `BottomNav.astro` (baru)

Mobile `fixed bottom-0 md:hidden` 4 item (Home/Sholat/Qur'an/Doa) `aria-current=page`, auto-hide on scroll `translateY`.
Dipakai: `BaseLayout` global.

### `ScrollFade.astro` (baru)

Wrapper pills `overflow-x-auto snap-x` + mask `linear-gradient` + `role=group`.
Dipakai: doa `category-container`, dzikir `category-container`.

### `EmptyState.astro` (baru)

`icon=search|book|inbox` + `title` + `desc` + `actionLabel/actionId` CTA `bg-emerald-600`.
Dipakai: doa, dzikir, asmaul (juga quran/index error fallback).

### `Skeleton.astro` (baru)

`variant=text|title|card|avatar|circle|prayer|quran|dzikir` + `animate-shimmer` light/dark.
Dipakai: `sholat.astro:86` `count={5}` untuk prayer list.

---

## 📄 Halaman & Fitur (Update)

### 1. Dashboard `/` `index.astro:1`

- **Prayer Card + Skeleton:** `prayer-card` hidden → skeleton `prayer-card-skeleton` shimmer sampai `sholat-cache-*` ada; jika kosong tampil CTA `Aktifkan GPS → /sholat`
- **Hijri Event Bar:** amber bar hidden sampai hijri dari cache terparse, `HIJRI_EVENTS` 12 item + `MONTH_ALIASES` normalization
- **Cache Badge:** `qolbu-quran-cache` count via IndexedDB
- **Grid 10 menu** (sebelumnya 9, tambah Events Hijri): Jadwal Sholat `col-span-2 gradient`, Al-Qur'an, Doa, Zakat, Panduan, Tahlil, Tasbih, Asmaul, Dzikir, **Surat Yasin + Events Hijri**
- **Quote Of The Day** `quotesData` inline ~100 quotes, `setInterval 10s` fade, cleanup `astro:before-swap`

### 2. Jadwal Sholat `/sholat` `sholat.astro:1`

- API Aladhan + Nominatim, `addMinutes` modulo 1440, ihtiyat hanya Fajr/Dhuhr/Asr/Maghrib/Isha+Imsak
- Countdown `setInterval 1s`, `getNextPrayerTime` post-midnight fix, `fetchInFlight` dedup
- Qibla spherical `21.4225,39.8262`, preview needle `800ms`, full modal `z-[200]` DeviceOrientation + iOS permission `ios-permission-btn`
- Settings: ihtiyat ±, GPS toggle + manual lat/lng validated, method, adzan/remind + volume + test, **tabs tidak** — single modal
- **Skeleton:** `Skeleton prayer` 5 items sebelum fetch
- **A11y:** `aria-label` settings-btn, `type="search"` tidak ada (sholat tidak pakai SearchBar)
- **Storage:** `sholat-settings`, `sholat-cache-*`, `sholat-notified-*`

### 3. Al-Qur'an `/quran` `quran/index.astro:1`

- `fetch equran.id` SSG 114, `daftarJuz` 30 static
- Tabs `role=tablist` `aria-selected` + `aria-controls`, toggle `aria-selected` via JS `quran/index.astro:127`
- Search `ariaLabel="Cari surat Al-Qur'an"`, filter `surat-nama` + empty `EmptyState`
- Card `content-visibility:auto` + `contain-intrinsic-size`
- Yasin navigasi via `page.goto('/quran/yasin')` (tidak ada featured card lagi di index)

### 4. Detail Surat `/quran/[nomor].astro:1`

- `getStaticPaths` 114, `toArabic` map `٠-٩`
- Header `HeaderSticky leftSlot rightSlot`: left = back + `Per Ayat/Mushaf` tabs `role=tablist`, right = `settings-btn aria-label`
- Tabs `Per Ayat/Mushaf` `role=tab aria-selected` toggle
- Ayat card `ayat-card` arab `font-amiri 2rem` + latin + terjemah, `view-terjemah` vs `view-mushaf` `role=tabpanel`
- **Audio:** `btn-audio data-audio` play/pause `Audio()`, `window._quranDetailAudio` cleanup `astro:before-swap`, auto-next + scroll
- **Share:** `share-btn` `data-share` → `navigator.share` fallback `clipboard.writeText` + toast (baru)
- **Settings:** single `SettingsModal` (duplikat dihapus), font slider 1-5 `arabSizes`, toggles latin/arti → `localStorage('quran-settings')`
- **Scroll hash:** `#ayat-10` smooth

### 5. Asmaul Husna `/asmaul-husna.astro:1`

- `SearchBar ariaLabel="Cari Asmaul Husna"` + `content-visibility`, grid 99, `EmptyState` + `empty-reset-asmaul` + `aria-live`
- Counter `counter-btn` tap+1 dbl-tap reset, copy `copy-btn`, detail `card-detail` toggle

### 6. Dzikir `/dzikir.astro:1`

- **Data:** `import dzikirData from '../data/dzikir.json'` 32 item (6 cat) via `<script type="application/json" set:html>` + `JSON.parse(textContent)` (sebelumnya hidden div 60KB)
- `ScrollFade` kategori 7 pills `snap-start aria-pressed`, `SearchBar ariaLabel`
- Render `dzikir-container` + `EmptyState` + `empty-count` live, copy via delegation `clipboard.writeText` + `window.showToast`

### 7. Events Hijri `/events-hijri.astro:1`

- `import eventsHijri from '../data/events-hijri.json'` (sebelumnya inline 12 bulan)
- `HeaderSticky` (sebelumnya custom sticky)
- List per bulan badge, fallback `-`, disclaimer hisab/rukyat

### 8. Doa Harian `/doa.astro:1`

- `ScrollFade` 9 kategori + `aria-pressed`, `SearchBar ariaLabel="Cari doa harian"`, `EmptyState` + `empty-reset` CTA
- Render 47 inline `doaData`, copy delegation, `card-anim` stagger

### 9. Panduan Sholat `/sholat-guide.astro`

- 28 langkah inline, accordion single open, progress `localStorage('sholat-completed')`, bookmark `sholat-bookmarks` + badge, praktik 15s, audio Fatihah, search, `HeaderSticky rightSlot` bookmark, sticky progress `top-32`

### 10. Tahlil `/tahlil.astro` + 11. Tasbih `/tasbih.astro` + 12. Zakat `/zakat.astro`

- **Tahlil:** 7 item JSON, `HeaderSticky rightSlot` settings, modal font/latin
- **Tasbih:** Circle 288px `active:scale-95`, `select target` `aria-label`, `reset-btn aria-label`, haptic 15ms + Web Audio sine, `progress-bar` + stats, `HeaderSticky` (custom sebelumnya — sekarang masih custom tapi dengan aria)
- **Zakat:** `role=tablist` Maal/Penghasilan + `tabpanel`, Rupiah `formatRupiah` preserve `selectionStart`, `btn-calculate disabled opacity-50` sampai input valid, `scrollIntoView` result, nishab 85gr/12

---

## 🎨 Theming & Styling `global.css:1`

- **Dark:** `class` on `<html>` `colorScheme` dark/light, `BaseLayout` inline script anti-FOIT + `astro:after-swap`
- **Palette:** Emerald primary, slate/neutral, amber for hijri, slate-900/black for quote
- **Fonts:** `Inter Variable WOFF2` (23KB, 100-900, `font-display:swap`) + `Amiri` TTF 400/700, preload `Inter-Variable + Amiri-Regular`, `@font-face` swap
- **Tokens:** `@theme { --radius-card:1rem; --radius-sheet:1.5rem; --shadow-card }`, `scroll-padding-top:112px` (header+sticky), `content-visibility:auto` untuk `.surat-card/.asmaul-card`
- **Anim:** `slideUp 0.3s cb(0.16,1,0.3,1)`, `fadeIn 0.4s`, `shimmer 1.5s` + `dark` variant, `animate-fade-in/slide-up/shimmer`, skeleton utilities
- **Layout:** `max-w-md 448px` `flex-1 min-h-[50vh]` + `sr-only skip-link` `Lompat ke konten`
- **Selection:** `selection:bg-emerald-500 selection:text-white`

---

## 💾 Data & Storage

| Key                                                     | Tipe                                               | Kegunaan                                                       |
| ------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| `theme`                                                 | `dark\|light`                                      | Theme                                                          |
| `sholat-settings`                                       | JSON                                               | lat,lng,city,method,useGPS,adhan,remind,adhanVolume,correction |
| `sholat-cache-*`                                        | JSON                                               | Timings per date/coords, juga dipakai dashboard prayer+ hijri  |
| `sholat-notified-adhan/remind`                          | JSON                                               | Dedup notif                                                    |
| `quran-settings` / `yasin-settings` / `tahlil-settings` | JSON                                               | size, showLatin, showArti                                      |
| `quran-last-read`                                       | JSON                                               | surah, ayat, surahName, timestamp                              |
| `quran-bookmarks`                                       | JSON                                               | [{surah,surahName,ayat}]                                       |
| `sholat-completed` / `sholat-bookmarks`                 | `string[]`                                         | Panduan sholat                                                 |
| `tasbih-*`                                              | `count/target/dhikr/vibrate/sound/autocycle/stats` | Tasbih                                                         |
| `qolbu-asmaul-counts`                                   | JSON                                               | Counter per Asmaul                                             |
| `qolbu-quran-cache`                                     | IndexedDB `surah-cache`                            | Offline 114 surat                                              |

**Static JSON:** `doa.json 47`, `dzikir.json 32`, `events-hijri.json 12 bulan detail`, `asmaul 99`, `tahlil 7`, `yasin 5` (page fetch 83).

---

## 🔌 API Eksternal

| API          | Endpoint                                           | Pakai                  |
| ------------ | -------------------------------------------------- | ---------------------- |
| Aladhan      | `api.aladhan.com/v1/timings/{date}?lat&lng&method` | Sholat                 |
| Equran.id    | `equran.id/api/v2/surat` + `/{nomor}`              | Quran list/detail, SSG |
| Nominatim    | `nominatim.openstreetmap.org/reverse`              | GPS → kota             |
| EveryAyat    | `everyayah.com/.../Alafasy_128kbps/`               | Yasin fallback audio   |
| Equran Audio | `equran.nos.wjv-1.neo.id/audio-partial/...`        | Per ayat               |

---

## ⚡ Performance & PWA

- **SSG 127 pages** (10 top + 114 surat + yasin + offline) `dist/`, `getStaticPaths` build-time fetch equran.id
- **SW v6** `public/sw.js`: precache `/` `/offline` `/fonts` `/*.png` `/dzikir/.../quran/yasin`, cleanup old `qolbu-cache-*`, **Audio cache-first** (equran.nos, everyayah, download.quranicaudio), **HTML network-first**, **Assets stale-while-revalidate** + `isFresh` 7 days, `message cleanup-cache`
- **Fonts:** Variable WOFF2 23KB + preload, `font-display:swap`, `content-visibility` untuk list 99/114
- **View Transitions:** `ClientRouter` slide, `site-header` morph, `theme-toggle persist`
- **Skeletons:** `Skeleton.astro` + shimmer, `prayer-card-skeleton` di dashboard, `Skeleton prayer` di sholat

---

## 🧪 Testing & CI `package.json:scripts`

| Script          | Desk                                                         |
| --------------- | ------------------------------------------------------------ |
| `dev`           | `astro dev` :4321                                            |
| `build`         | `astro build` → `dist/`                                      |
| `preview`       | `astro preview`                                              |
| `typecheck`     | `astro check`                                                |
| `lint`          | `eslint . --ext .astro,.js,.ts,.mjs` (flat + astro/tailwind) |
| `test`          | `vitest run`                                                 |
| `test:watch`    | `vitest`                                                     |
| `test:coverage` | `vitest run --coverage`                                      |
| `test:e2e`      | `playwright test`                                            |
| `format`        | `prettier --write`                                           |

**Unit `src/lib/utils.ts:1` 30 tests `utils.test.ts`:**
`addMinutes` modulo, `qibla`, `zakatMaal/Penghasilan`, `rupiah`, `hijriMonthIndex`, `daysUntil`. `vitest.setup.ts` mock localStorage, geolocation, Notification, AudioContext, vibrate.

**E2E `e2e/` 48 tests** (chromium, mobile-chrome, mobile-safari): home 7, sholat 7, quran 6, quran-detail 8, doa 7, tasbih 6. Run via `webServer: npm run preview`.

**CI `.github/workflows/ci.yml`:** jobs `test` (typecheck+lint+unit+build) + `e2e` needs test (install chromium, build, `test:e2e`, upload report).

**Husky:** `pre-commit` `lint-staged` eslint --fix + prettier.

---

## 🛡 Code Quality Patterns

**Guard Flag:** `window._xxxInitialized` `astro:page-load` + `astro:before-swap` reset — `asmaul, tahlil, zakat, quran/index, quran/[nomor], dzikir, tasbih, doa, sholat-guide, index (quote/cache/prayer/hijri)` (`docs/PRD.md` §8).

**Memory Leak Cleanup `astro:before-swap`:**

```js
if (window._timer) clearInterval(...); window._audio.pause();
```

`sholat, sholat-guide, yasin, quran/[nomor], index, dzikir` + `quran/[nomor]` `window._quranDetailAudio`.

**XSS Prevention:**

- `onclick` escape `'` → `\'`
- `htmlEscape` via `textContent` helper, `innerText` prioritas
- `doa, dzikir, quran/index, quran/[nomor]`

**CSS DRY:** `@keyframes` hanya di `global.css` (`slideUp`, `fadeIn`, `shimmer`), pages pakai `.animate-*`, no duplikat `<style>`.

**Sholat Math:**

- `addMinutes` modulo 1440 `sholat.astro:332`, `utils.ts:7`
- `getNextPrayerTime` post-midnight `utils.ts`
- Ihtiyat hanya 5 waktu + Imsak
- `fetchInFlight` dedup

**A11y (baru Fase 1):**

- Viewport `maximum-scale=5.0` (sebelumnya 1.0) `BaseLayout.astro:16`
- `Skip-link` `sr-only focus:not-sr-only` `BaseLayout.astro:70`
- `SearchBar` `type=search` `sr-only label` `aria-label`
- Tabs `role=tablist/tab` `aria-selected` + JS toggle `setAttribute` (`zakat.astro:12`, `quran/index.astro:59`, `quran/[nomor].astro:50`)
- Icon btn `aria-label` (`quran/[nomor]:60`, `tasbih:20`)
- Pills `aria-pressed` + `ScrollFade role=group`
- `EmptyState` `aria-live` + `role=status` Toast
- `scroll-padding-top:112px`

---

## 📝 Catatan Penting

> **Referensi utama `docs/PRD.md`**. File ini ringkas; jika beda, PRD berlaku.

- Semua client script `is:inline` vanilla JS, no React/Vue. Data JSON import via frontmatter + `<script type="application/json" set:html>` untuk dzikir (bukan hidden div).
- `HeaderSticky` (baru) ganti `HeaderBack` — dipakai semua halaman, truncate `max-w-[140px]` + `leftSlot/rightSlot` + `history.back` fallback.
- `BottomNav` mobile only `md:hidden` auto-hide on scroll, skip-link, safe-area.
- Fonts: Inter Variable WOFF2 23KB (sebelumnya 5×TTF 1.6MB), Amiri TTF, `font-display:swap`, preload variable.
- `Skeleton` shimmer light/dark, `content-visibility:auto` untuk list 99/114.
- SW v6 bump cache version, font precache, audio CDN cache-first, HTML network-first, cleanup 7d.
- Zakat `getInt` preserve `selectionStart`, `btn-calculate disabled opacity-50` sampai input valid.
- Share per ayat `quran/[nomor].astro:110` `share-btn` → `navigator.share` fallback `clipboard`.
- Prayer skeleton + CTA `Aktifkan GPS → /sholat` di dashboard jika `sholat-cache` kosong.
