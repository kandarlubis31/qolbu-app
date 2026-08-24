# Qolbu App â€” Project Context

> Aplikasi Ibadah Harian Terlengkap berbasis web (PWA-ready).
> Dibangun dengan **Astro 5 + Tailwind CSS 4 + TypeScript** â€” zero client framework, mobile-first `max-w-md`.

---

> ðŸ“˜ **Canonical source of truth:** [`docs/PRD.md`](./docs/PRD.md) â€” Product Requirements Document lengkap (spesifikasi, fitur, komponen, data, storage, API, arsitektur).
>
> File ini (`CONTEXT.md`) adalah ringkasan cepat (_quick reference_). Selalu rujuk ke `docs/PRD.md` untuk detail paling akurat. Jika ada perbedaan, `docs/PRD.md` yang berlaku.

---

## ðŸ— Arsitektur

### Stack Inti

| Teknologi    | Versi                 | Kegunaan                                                                                                      |
| ------------ | --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Astro        | ^5.17.1               | SSG (127 pages) + View Transitions                                                                            |
| Tailwind CSS | ^4.1.18               | Utility-first, @theme tokens                                                                                  |
| TypeScript   | via Astro `strict`    | Strict type checking (`astro check`)                                                                          |
| PWA          | Workbox vanilla       | `manifest.json` + `sw.js` v7                                                                                  |
| Fonts        | Self-host             | Plus Jakarta Sans Variable WOFF2 (27KB) + Amiri WOFF2 subset (arabic 204KB + latin 39KB), `font-display:swap` |
| Testing      | Vitest 4 + Playwright | Unit 30, E2E 66, CI split jobs                                                                                |
| Lint/Format  | ESLint 9 + Prettier   | `eslint-plugin-astro/tailwindcss`, Husky + lint-staged                                                        |

### Struktur Direktori

```
/
â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ fonts/               # PlusJakartaSans-Variable.woff2 (27KB), AmiriArabic/Latin-*.woff2
â”‚   â”œâ”€â”€ logo.png / 192 / 512
â”‚   â”œâ”€â”€ manifest.json
â”‚   â””â”€â”€ sw.js                # v7: font precache, audio cache-first, HTML network-first
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ HeaderSticky.astro  # Sticky top-16, truncate, leftSlot/rightSlot, history.back
â”‚   â”‚   â”œâ”€â”€ SearchBar.astro     # type=search, aria-label, sr-only label
â”‚   â”‚   â”œâ”€â”€ SettingsModal.astro # Bottom sheet, backdrop, Esc, focus-trap
â”‚   â”‚   â”œâ”€â”€ Toast.astro         # Fixed bottom, queue + click dismiss, role=status
â”‚   â”‚   â”œâ”€â”€ BottomNav.astro     # Mobile thumb-zone (Home/Sholat/Qur'an/Doa), auto-hide scroll
â”‚   â”‚   â”œâ”€â”€ ScrollFade.astro    # Mask fade untuk pills overflow
â”‚   â”‚   â”œâ”€â”€ EmptyState.astro    # icon + title + desc + CTA Reset
â”‚   â”‚   â””â”€â”€ Skeleton.astro      # Variants: prayer/quran/dzikir/card/avatar, shimmer
â”‚   â”œâ”€â”€ data/
â”‚   â”‚   â”œâ”€â”€ doa.json            # 47 Doa (9 kategori)
â”‚   â”‚   â”œâ”€â”€ dzikir.json         # 32 Dzikir (6 kategori: pagi/petang/subuh/sesudah/tidur/umum)
â”‚   â”‚   â”œâ”€â”€ events-hijri.json   # 12 bulan Hijriah (page + dashboard bar)
â”‚   â”‚   â”œâ”€â”€ asmaul-husna.json   # 99 Nama
â”‚   â”‚   â”œâ”€â”€ tahlil.json         # 7 Bacaan
â”‚   â”‚   â””â”€â”€ yasin.json          # 5 ayat sample (page yasin fetch 83 via API)
â”‚   â”œâ”€â”€ lib/
â”‚   â”‚   â”œâ”€â”€ utils.ts            # addMinutes, qibla, zakat, rupiah, hijri helpers
â”‚   â”‚   â””â”€â”€ utils.test.ts       # 30 unit tests
â”‚   â”œâ”€â”€ layouts/
â”‚   â”‚   â””â”€â”€ BaseLayout.astro    # header sticky + theme + BottomNav + skip-link + SEO + PWA + ClientRouter
â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”œâ”€â”€ index.astro         # Dashboard: prayer-card skeleton+CTA, hijri bar, cache badge, menu 10, quote
â”‚   â”‚   â”œâ”€â”€ asmaul-husna.astro  # 99 + counter + search + EmptyState
â”‚   â”‚   â”œâ”€â”€ doa.astro           # 47 filter + ScrollFade + search + EmptyState + aria-pressed
â”‚   â”‚   â”œâ”€â”€ dzikir.astro        # 32 via <script type="application/json">, ScrollFade, 6 tabs
â”‚   â”‚   â”œâ”€â”€ events-hijri.astro  # Import JSON, HeaderSticky
â”‚   â”‚   â”œâ”€â”€ sholat.astro        # Countdown, qibla needle, Skeleton prayer, correction, GPS
â”‚   â”‚   â”œâ”€â”€ sholat-guide.astro  # 28 langkah accordion, progress, bookmark modal
â”‚   â”‚   â”œâ”€â”€ tahlil.astro        # 7 step + SettingsModal
â”‚   â”‚   â”œâ”€â”€ tasbih.astro        # Circle 72, haptic, Web Audio, progress, aria-labels
â”‚   â”‚   â”œâ”€â”€ zakat.astro         # Tabs role=tablist, Rupiah cursor preserve, disabled btn
â”‚   â”‚   â”œâ”€â”€ offline.astro
â”‚   â”‚   â””â”€â”€ quran/
â”‚   â”‚       â”œâ”€â”€ index.astro     # 114 surat + 30 juz, tabs ARIA, content-visibility
â”‚   â”‚       â”œâ”€â”€ [nomor].astro   # Per surat: header leftSlot/rightSlot + SettingsModal (single id), Per Ayat/Mushaf tabs ARIA, audio, share-btn (Web Share)
â”‚   â”‚       â””â”€â”€ yasin.astro
â”‚   â”œâ”€â”€ styles/global.css       # @font-face variable, @theme tokens, scroll-padding, shimmer, content-visibility
â”‚   â””â”€â”€ env.d.ts                # Window globals (_sholatInterval, _quranDetailInitialized, etc.)
â”œâ”€â”€ e2e/                        # Playwright: home, sholat, quran, quran-detail, doa, tasbih, events, guide \(66\)
â”œâ”€â”€ .github/workflows/ci.yml    # jobs: test (typecheck+lint+unit+build) + e2e (chromium)
â”œâ”€â”€ playwright.config.ts
â”œâ”€â”€ vitest.config.mjs + vitest.setup.ts
â”œâ”€â”€ eslint.config.mjs           # flat, astro+tailwind, ignores e2e
â”œâ”€â”€ .prettierrc / .prettierignore
â”œâ”€â”€ astro.config.mjs (Tailwind Vite)
â”œâ”€â”€ tsconfig.json (extends astro/tsconfigs/strict)
â”œâ”€â”€ package.json (scripts: dev/build/preview/typecheck/lint/test/test:e2e/format)
â””â”€â”€ README.md / CONTEXT.md / docs/PRD.md
```

### Layout `BaseLayout.astro:1`

- `<html lang="id" scroll-smooth>` `max-w-md mx-auto` `overflow-x-hidden`
- Header `sticky top-0 z-50 backdrop-blur-xl` `transition:name="site-header"` + logo + `#theme-toggle` `transition:persist`
- `<a href="#main-content" sr-only>` skip-link + `<main id="main-content" min-h-[50vh] flex-1>`
- Footer PakLubis + `<BottomNav>` mobile `md:hidden` auto-hide on scroll
- **PWA:** `manifest link` + `sw.js` register on `load`
- **SEO:** OG + Twitter per `pageTitle`
- **Theme inline:** `localStorage('theme')` â†’ `prefers-color-scheme`, re-apply `astro:after-swap`, `colorScheme` dark/light
- **Viewport:** `width=device-width, initial-scale=1.0, maximum-scale=5.0` (A11y zoom)
- **Fonts preload:** `PlusJakartaSans-Variable.woff2` + `AmiriArabic-Regular.woff2` `crossorigin`, `font-display:swap`

---

## ðŸ§© Komponen Reusable

### `HeaderSticky.astro:1` â€” Pengganti `HeaderBack`

Sticky `top-16 z-40 -mx-4 px-4 mb-4 gap-2` dengan truncate & history.back fallback.

| Prop                   | Default   | Desc                                          |
| ---------------------- | --------- | --------------------------------------------- |
| `title`                | â€”       | Judul, `truncate max-w-[140px] sm:180 flex-1` |
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

## ðŸ“„ Halaman & Fitur (Update)

### 1. Dashboard `/` `index.astro:1`

- **Prayer Card + Skeleton:** `prayer-card` hidden â†’ skeleton `prayer-card-skeleton` shimmer sampai `sholat-cache-*` ada; jika kosong tampil CTA `Aktifkan GPS â†’ /sholat`. âš ï¸ Lihat Known Issues: cache ini belum pernah ditulis siapa pun.
- **Hijri Event Bar:** amber bar hidden sampai hijri dari cache terparse, `HIJRI_EVENTS` 12 item + `MONTH_ALIASES` normalization. Tergantung `sholat-cache-*` juga (dampak known issue yang sama).
- **Cache Badge:** `qolbu-quran-cache` count via IndexedDB
- **Grid 9 menu** (tile "Jadwal Sholat" dihapus — widget card live + BottomNav sudah menautkan /sholat; menghilangkan duplikasi visual dua kartu hijau): **Al-Qur'an kini tile featured** `col-span-2 gradient`, Doa, Zakat, Panduan, Tahlil, Tasbih, Asmaul, Dzikir, Surat Yasin, Events Hijri
- **Quote Of The Day** `quotesData` inline ~100 quotes. Quote pertama **dirender server-side tanpa opacity gate** (kartu tidak pernah kosong walau JS lambat/blokir); JS menimpa dengan quote harian deterministik (`Math.floor(Date.now()/864e5) % len`). Rotasi 10s fade dengan `setTimeout` terlacak (`window._quoteTimeout`), skip tick saat `document.hidden` (anti burst-flicker throttled timers), anti-repeat quote berurutan, hormati `prefers-reduced-motion`. Cleanup interval+timeout di `astro:before-swap`. Deklarasi global di `env.d.ts` (`_quoteInterval/_quoteTimeout/_prayerInterval`).

### 2. Jadwal Sholat `/sholat` `sholat.astro:1`

- API Aladhan + Nominatim, `addMinutes` modulo 1440, ihtiyat hanya Fajr/Dhuhr/Asr/Maghrib/Isha+Imsak
- Countdown `setInterval 1s`, `getNextPrayerTime` post-midnight fix, `fetchInFlight` dedup
- Qibla spherical `21.4225,39.8262`, preview needle `800ms`, full modal `z-[200]` DeviceOrientation + iOS permission `ios-permission-btn`
- Settings: ihtiyat Â±, GPS toggle + manual lat/lng validated, method, adzan/remind + volume + test, **tabs tidak** â€” single modal
- **Skeleton:** `Skeleton prayer` 5 items sebelum fetch
- **A11y:** `aria-label` settings-btn, `type="search"` tidak ada (sholat tidak pakai SearchBar)
- **Storage:** `sholat-settings` (âš ï¸ lat/lng GPS sukses TIDAK dipersist â€” hanya mode manual yang menyimpan; lihat Known Issues). Notif dedup via in-memory `lastNotifiedAdhan/Remind`, bukan localStorage.

### 3. Al-Qur'an `/quran` `quran/index.astro:1`

- `fetch equran.id` SSG 114, `daftarJuz` 30 static
- Tabs `role=tablist` `aria-selected` + `aria-controls`, toggle `aria-selected` via JS `quran/index.astro:127`
- Search `ariaLabel="Cari surat Al-Qur'an"`, filter `surat-nama` + empty `EmptyState`
- Card `content-visibility:auto` + `contain-intrinsic-size`
- Yasin navigasi via `page.goto('/quran/yasin')` (tidak ada featured card lagi di index)

### 4. Detail Surat `/quran/[nomor].astro:1`

- `getStaticPaths` 114, `toArabic` map `Ù -Ù©`
- Header `HeaderSticky leftSlot rightSlot`: left = back + `Per Ayat/Mushaf` tabs `role=tablist`, right = `settings-btn aria-label`
- Tabs `Per Ayat/Mushaf` `role=tab aria-selected` toggle
- Ayat card `ayat-card` arab `font-amiri 2rem` + latin + terjemah, `view-terjemah` vs `view-mushaf` `role=tabpanel`
- **Audio:** `btn-audio data-audio` play/pause `Audio()`, `window._quranDetailAudio` cleanup `astro:before-swap`, auto-next + scroll
- **Share:** `share-btn` `data-share` â†’ `navigator.share` fallback `clipboard.writeText` + toast (baru)
- **Settings:** single `SettingsModal` (duplikat dihapus), font slider 1-5 `arabSizes`, toggles latin/arti â†’ `localStorage('quran-settings')`
- **Scroll hash:** `#ayat-10` smooth

### 5. Asmaul Husna `/asmaul-husna.astro:1`

- `SearchBar ariaLabel="Cari Asmaul Husna"` + `content-visibility`, grid 99, `EmptyState` + `empty-reset-asmaul` + `aria-live`
- Counter `counter-btn` tap+1 dbl-tap reset, copy `copy-btn`, detail `card-detail` toggle

### 6. Dzikir `/dzikir.astro:1`

- **Data:** `import dzikirData from '../data/dzikir.json'` 32 item (6 cat) via `<script type="application/json" set:html>` + `JSON.parse(textContent)` (sebelumnya hidden div 60KB)
- `ScrollFade` kategori 7 pills `snap-start aria-pressed`, `SearchBar ariaLabel`
- Render `dzikir-container` + `EmptyState` + `empty-count` live, copy via delegation `clipboard.writeText` + `window.showToast`

### 7. Events Kalender `/events-hijri.astro:1`

- **Tabs ARIA** `role=tablist` Hijriah 🌙 | Masehi 🇮🇩 — `aria-selected` + panel toggle via JS (guard `_eventsTabsInit` + reset before-swap), styling pakai variant `aria-selected:`
- `import events-hijri.json` (12 bulan Hijriah) + `import events-masehi.json` (hari besar nasional & peringatan Indonesia, tanggal tetap; badge `Libur Nasional` vs `Peringatan`)
- `HeaderSticky`, disclaimer hisab/rukyat (hijri) + disclaimer SKB tahunan (masehi, event variabel: Imlek/Nyepi/Wafat/Kenaikan/Waisak)

### 8. Doa Harian `/doa.astro:1`

- `ScrollFade` 9 kategori + `aria-pressed`, `SearchBar ariaLabel="Cari doa harian"`, `EmptyState` + `empty-reset` CTA
- Render 47 inline `doaData`, copy delegation, `card-anim` stagger

### 9. Panduan Sholat `/sholat-guide.astro`

- 28 langkah inline (mazhab Syafi'i), accordion single open (`<details>`), progress `localStorage('sholat-completed')`, bookmark `sholat-bookmarks` + badge, praktik 15s per langkah, search, `HeaderSticky rightSlot` bookmark, sticky progress `top-32`
- **Audio full-surah**: Fatihah & Al-Ikhlas via `download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/00X.mp3` (SW cache-first → offline setelah play pertama); 26 langkah lain tanpa audio (disabled "Audio N/A")
- **Robustness**: `safeParse()` membungkus semua `JSON.parse(localStorage)` — data korup tidak mematikan halaman/guard flag; `stopPractice()` reset state audio (`resetAllAudioBtns` + null kanan) supaya tombol tidak nyangkut "Jeda"
- Konvensi: `transition-[colors,box-shadow]`/`[colors,transform]` (bukan transition-all), bookmark-btn ber-`aria-label` per langkah

### 10. Tahlil `/tahlil.astro` + 11. Tasbih `/tasbih.astro` + 12. Zakat `/zakat.astro`

- **Tahlil:** 7 item JSON, `HeaderSticky rightSlot` settings, modal font/latin
- **Tasbih:** Circle 288px `active:scale-95`, `select target` `aria-label`, `reset-btn aria-label`, haptic 15ms + Web Audio sine, `progress-bar` + stats, `HeaderSticky` (custom sebelumnya â€” sekarang masih custom tapi dengan aria)
- **Zakat:** `role=tablist` Maal/Penghasilan + `tabpanel`, Rupiah `formatRupiah` preserve `selectionStart`, `btn-calculate disabled opacity-50` sampai input valid, `scrollIntoView` result, nishab 85gr/12

---

## ðŸŽ¨ Theming & Styling `global.css:1`

- **Dark:** `class` on `<html>` `colorScheme` dark/light, `BaseLayout` inline script anti-FOIT + `astro:after-swap`
- **Palette:** Emerald primary, slate/neutral, amber for hijri, slate-900/black for quote
- **Fonts:** `Plus Jakarta Sans Variable WOFF2` (27KB, 200-800, `font-display:swap`) + `Amiri` WOFF2 subset arabic/latin 400+700 (bold tak diprecache — lazy), preload `PJS + AmiriArabic-Regular`, `@font-face` swap
- **Tokens:** `@theme { --radius-card:1rem; --radius-sheet:1.5rem; --shadow-card }`, `scroll-padding-top:112px` (header+sticky), `content-visibility:auto` untuk `.surat-card/.asmaul-card`
- **Anim:** `slideUp 0.3s cb(0.16,1,0.3,1)`, `fadeIn 0.4s`, `shimmer 1.5s` + `dark` variant, `animate-fade-in/slide-up/shimmer`, skeleton utilities
- **Layout:** `max-w-md 448px` `flex-1 min-h-[50vh]` + `sr-only skip-link` `Lompat ke konten`
- **Selection:** `selection:bg-emerald-500 selection:text-white`
- **Glassmorphism desktop-only:** semua `backdrop-blur` wajib `md:` gate + bg solid di mobile (perf mobile: `backdrop-filter` mahal di GPU). Pola: `bg-white dark:bg-slate-900 md:bg-white/80 md:backdrop-blur-xl md:dark:bg-slate-900/80`. Komponen mobile-only (`BottomNav`) = solid tanpa blur sama sekali.
- **Hover desktop-only:** efek hover fisik (translate/scale/shadow/border) wajib `md:hover:` gate â€” di layar sentuh `:hover` nyangkut setelah tap dan memicu transisi (jank). Pola kartu list: `transition-[colors,box-shadow] md:hover:border-emerald-500/50 md:hover:shadow-md`. Hover warna/opacity kecil boleh tetap.
- **Tap responsiveness:** `global.css` memberi `touch-action: manipulation` + `-webkit-tap-highlight-color: transparent` pada `a/button/[role=button]/input/select/label` (hapus delay double-tap zoom & highlight kotak).
- **Transition DRY:** hindari `transition-all` di elemen panas â€” sebut properti eksplisit (`transition-[colors,box-shadow]`, `transition-transform`, `transition-colors`).

---

## ðŸ’¾ Data & Storage

| Key                                                     | Tipe                                               | Kegunaan                                                                                            |
| ------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `theme`                                                 | `dark\|light`                                      | Theme                                                                                               |
| `sholat-settings`                                       | JSON                                               | lat,lng,city,method,useGPS,adhan,remind,adhanVolume,correction                                      |
| `sholat-cache-*`                                        | JSON `{date, data}`                                | Timings per date/coords â€” dibaca dashboard prayer + hijri. âš ï¸ **Belum ada writer** (known bug) |
| ~~`sholat-notified-adhan/remind`~~                      | â€”                                                | Tidak ada di kode: notif dedup pakai variabel in-memory                                             |
| `quran-settings` / `yasin-settings` / `tahlil-settings` | JSON                                               | size, showLatin, showArti                                                                           |
| `quran-last-read`                                       | JSON                                               | surah, ayat, surahName, timestamp                                                                   |
| `quran-bookmarks`                                       | JSON                                               | [{surah,surahName,ayat}]                                                                            |
| `sholat-completed` / `sholat-bookmarks`                 | `string[]`                                         | Panduan sholat                                                                                      |
| `tasbih-*`                                              | `count/target/dhikr/vibrate/sound/autocycle/stats` | Tasbih                                                                                              |
| `qolbu-asmaul-counts`                                   | JSON                                               | Counter per Asmaul                                                                                  |
| `qolbu-quran-cache`                                     | IndexedDB `surah-cache`                            | Offline 114 surat                                                                                   |

**Static JSON:** `doa.json 47`, `dzikir.json 32`, `events-hijri.json 12 bulan + events-masehi.json hari besar nasional`, `asmaul 99`, `tahlil 7`, `yasin 5` (page fetch 83).

---

## ðŸ”Œ API Eksternal

| API          | Endpoint                                           | Pakai                  |
| ------------ | -------------------------------------------------- | ---------------------- |
| Aladhan      | `api.aladhan.com/v1/timings/{date}?lat&lng&method` | Sholat                 |
| Equran.id    | `equran.id/api/v2/surat` + `/{nomor}`              | Quran list/detail, SSG |
| Nominatim    | `nominatim.openstreetmap.org/reverse`              | GPS â†’ kota           |
| EveryAyat    | `everyayah.com/.../Alafasy_128kbps/`               | Yasin fallback audio   |
| Equran Audio | `equran.nos.wjv-1.neo.id/audio-partial/...`        | Per ayat               |

---

## âš¡ Performance & PWA

- **SSG 127 pages** (10 top + 114 surat + yasin + offline) `dist/`, `getStaticPaths` build-time fetch equran.id
- **SW v7** `public/sw.js`: precache `/` `/offline` `/fonts` `/*.png` `/dzikir/.../quran/yasin`, cleanup old `qolbu-cache-*`, **Audio cache-first** (equran.nos, everyayah, download.quranicaudio), **HTML network-first**, **Assets stale-while-revalidate** + `isFresh` 7 days, `message cleanup-cache`
- **Fonts:** Variable WOFF2 23KB + preload, `font-display:swap`, `content-visibility` untuk list 99/114
- **View Transitions:** `ClientRouter` slide, `site-header` morph, `theme-toggle persist`
- **Skeletons:** `Skeleton.astro` + shimmer, `prayer-card-skeleton` di dashboard, `Skeleton prayer` di sholat

---

## ðŸ§ª Testing & CI `package.json:scripts`

| Script          | Desk                                                         |
| --------------- | ------------------------------------------------------------ |
| `dev`           | `astro dev` :4321                                            |
| `build`         | `astro build` â†’ `dist/`                                    |
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

**E2E `e2e/` 66 tests** (chromium, mobile-chrome, mobile-safari/webkit): home 12 (incl. quote 3 + prayer pipeline 2), sholat 9 (semua mocked, tanpa API live), sholat-guide 7, quran 7, quran-detail 9, doa 7, tasbih 10, events 5. Run via `webServer: npm run preview`. CI install browser: `chromium webkit`.

**CI `.github/workflows/ci.yml`:** jobs `test` (typecheck+lint+unit+build) + `e2e` needs test (install chromium+webkit, build, `test:e2e`, upload report).

**Husky:** `pre-commit` `lint-staged`: `eslint --fix --no-warn-ignored` + `prettier --write`. âš ï¸ Gotcha lint-staged v17: task **harus bentuk string** (`"eslint --fix --no-warn-ignored"`) â€” array-form `["eslint","--fix"]` dieksekusi sebagai command terpisah per elemen. Prettier Tailwind v4 auto-detect â€” jangan set `tailwindConfig` di `.prettierrc` (harus string path; TW4 tidak pakai file config).

---

## ðŸ›¡ Code Quality Patterns

**Guard Flag:** `window._xxxInitialized` `astro:page-load` + `astro:before-swap` reset â€” `asmaul, tahlil, zakat, quran/index, quran/[nomor], dzikir, tasbih, doa, sholat-guide, index (quote/cache/prayer/hijri)` (`docs/PRD.md` Â§8).

**Memory Leak Cleanup `astro:before-swap`:**

```js
if (window._timer) clearInterval(...); window._audio.pause();
```

`sholat, sholat-guide, yasin, quran/[nomor], index, dzikir` + `quran/[nomor]` `window._quranDetailAudio`.

**XSS Prevention:**

- `onclick` escape `'` â†’ `\'`
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

## ðŸ“ Catatan Penting

> **Referensi utama `docs/PRD.md`**. File ini ringkas; jika beda, PRD berlaku.

- Semua client script `is:inline` vanilla JS, no React/Vue. Data JSON import via frontmatter + `<script type="application/json" set:html>` untuk dzikir (bukan hidden div).
- `HeaderSticky` (baru) ganti `HeaderBack` â€” dipakai semua halaman, truncate `max-w-[140px]` + `leftSlot/rightSlot` + `history.back` fallback.
- `BottomNav` mobile only `md:hidden` auto-hide on scroll, skip-link, safe-area.
- Fonts: Plus Jakarta Sans WOFF2 27KB (sebelumnya 5Ã—TTF 1.6MB), Amiri WOFF2 subset (dari TTF 737KB → 243KB, bold lazy-load), `font-display:swap`, preload variable.
- `Skeleton` shimmer light/dark, `content-visibility:auto` untuk list 99/114.
- SW v6 bump cache version, font precache, audio CDN cache-first, HTML network-first, cleanup 7d.
- Zakat `getInt` preserve `selectionStart`, `btn-calculate disabled opacity-50` sampai input valid.
- Share per ayat `quran/[nomor].astro:110` `share-btn` â†’ `navigator.share` fallback `clipboard`.
- Prayer skeleton + CTA `Aktifkan GPS â†’ /sholat` di dashboard jika `sholat-cache` kosong.

### ðŸž Known Issues

1. **(Selesai 2026-08-24) Dashboard "Belum ada jadwal sholat" meski GPS aktif** â€” root cause: `sholat-cache-*` tidak pernah ditulis siapa pun + koordinat GPS tidak dipersist. **Implementasi fix:** (a) `fetchPrayer()` di `sholat.astro` kini menulis cache `{date: toDateString(), data}` dengan format key identik dashboard; (b) `getGPS()` sukses/error memanggil `persistLastLocation()` â€” merge `lat/lng/city` ke `sholat-settings` tanpa menyentuh `useGPS`; (c) dashboard `initPrayerCard` kini **fetch mandiri** (`fetchDashboardPrayer`) saat cache kosong tapi koordinat tersimpan â€” apply ihtiyat sendiri, tulis cache, render, lalu panggil `updateHijriBar()` untuk refresh hijri bar tanpa buka /sholat. CTA hanya untuk fresh-install tanpa koordinat. Guard flag `_dashPrayerFetching` anti duplikasi fetch. (d) e2e regression: `Prayer Schedule Pipeline` describe di home.spec.ts (SW diblok via `serviceWorkers:'block'` agar mock `page.route` tidak bocor ke request SW â€” penting di WebKit); gotcha: `#prayer-list > div` sudah berisi 5 skeleton sejak load â€” jangan dipakai sebagai sinyal fetch selesai, gunakan `expect.poll` pada cache key.

2. **(Selesai 2026-08-24) Glassmorphism mobile-off** â€” seluruh `backdrop-blur` (14 titik, 11 file) digate `md:` + bg solid di mobile; terverifikasi computed style: mobile `backdrop-filter: none`, desktop tetap blur. Konvensi: efek morphism baru WAJIB pakai pola `md:` gate yang sama.

3. **(Selesai 2026-08-24) Mobile responsiveness phase 2** â€” (a) `touch-action: manipulation` + tap-highlight transparent global; (b) hover fisik digate `md:hover:` pada menu dashboard, kartu doa/dzikir/asmaul/quran(index surat+juz); (c) `transition-all` â†’ properti eksplisit di elemen panas; (d) countdown sholat + index diguard `document.hidden`; (e) stagger `card-anim` doa/dzikir dicap 200ms. Font TIDAK diubah (konversi WOFF2 ditunda atas preferensi visual user). Verifikasi: lint 0, typecheck 0, build 127, e2e 100/100, probe computed-style mobile+desktop OK.
