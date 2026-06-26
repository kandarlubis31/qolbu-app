# Qolbu App — Aplikasi Ibadah Harian

> **Qolbu by PakLubis** — Aplikasi web ibadah harian terlengkap berbasis **Astro 5 + Tailwind CSS 4**.
> Mobile-first, PWA-ready, dan bisa di-install ke homescreen HP.

![Qolbu App](public/logo.png)

---

## ✨ Fitur-Fitur

| Fitur | Deskripsi |
|-------|-----------|
| 🕌 **Jadwal Sholat** | Waktu sholat otomatis berdasarkan lokasi GPS + kompas kiblat + notifikasi adzan |
| 📖 **Al-Qur'an** | 114 surat lengkap dengan arab, latin, terjemah, dan audio Misyari Rasyid |
| 📜 **Surat Yasin** | Bacaan Surat Yasin lengkap dengan audio per ayat |
| 🤲 **Doa Harian** | 40+ doa sehari-hari dari Al-Qur'an & Hadits (dengan kategori & pencarian) |
| 🧮 **Kalkulator Zakat** | Hitung Zakat Maal & Zakat Penghasilan otomatis |
| 📋 **Panduan Sholat** | Panduan lengkap dari niat hingga salam (28 langkah) + mode praktik |
| 📿 **Tahlil & Doa** | Bacaan tahlil lengkap untuk doa arwah |
| 🔢 **Tasbih Digital** | Hitung dzikir dengan getar, suara, statistik harian & streak |
| 🌙 **Mode Gelap/Terang** | Toggle tema dengan persistensi lokal |

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js 18+
- npm / pnpm / yarn

### Install & Dev

```bash
# Clone repositori
git clone https://github.com/paklubis/qolbu-app.git
cd qolbu-app

# Install dependencies
npm install

# Jalankan dev server (localhost:4321)
npm run dev
```

### Build & Preview

```bash
# Build production
npm run build

# Preview hasil build
npm run preview
```

### Perintah Lain

| Perintah | Aksi |
|----------|------|
| `npm run dev` | Start dev server di `localhost:4321` |
| `npm run build` | Build production ke `dist/` |
| `npm run preview` | Preview hasil build lokal |
| `npm run astro ...` | CLI Astro (add, check, dll) |

---

## 🏗 Tech Stack

| Teknologi | Keterangan |
|-----------|------------|
| [Astro](https://astro.build) | Static Site Generator (v5) |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first CSS (v4) |
| [TypeScript](https://typescriptlang.org) | Type safety (strict) |
| PWA | Manifest + Service Worker (offline cache) |
| Web Audio API | Feedback suara Tasbih Digital |
| Geolocation API | Deteksi lokasi untuk jadwal sholat |
| DeviceOrientation API | Kompas kiblat real-time |

### API Eksternal

- **Aladhan API** — Jadwal sholat berdasarkan koordinat
- **Equran.id API** — Data Al-Qur'an (surat, ayat, audio)
- **Nominatim** — Reverse geocoding (GPS → nama kota)

---

## 📁 Struktur Project

```
/
├── public/
│   ├── logo.png           # Logo aplikasi
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service Worker
├── src/
│   ├── components/        # Komponen reusable
│   ├── data/              # Data JSON statis (doa, tahlil, yasin)
│   ├── layouts/           # Layout utama
│   ├── pages/             # Halaman aplikasi
│   │   ├── index.astro
│   │   ├── sholat.astro
│   │   ├── quran/
│   │   ├── doa.astro
│   │   └── ...
│   └── styles/            # Global CSS
├── astro.config.mjs
├── CONTEXT.md             # Dokumentasi arsitektur
└── package.json
```

---

## 📄 Halaman Routes

| Route | Halaman |
|-------|---------|
| `/` | Dashboard (menu grid + kutipan harian) |
| `/sholat` | Jadwal Sholat & Arah Kiblat |
| `/quran` | Daftar Surat & Juz Al-Qur'an |
| `/quran/[nomor]` | Detail Surat (arab, latin, terjemah, audio) |
| `/quran/yasin` | Surat Yasin lengkap |
| `/doa` | Ensiklopedia Doa Harian |
| `/sholat-guide` | Panduan Sholat Lengkap |
| `/tahlil` | Tahlil & Doa Arwah |
| `/tasbih` | Tasbih Digital |
| `/zakat` | Kalkulator Zakat |

---

## 👨‍💻 Author

Dibuat oleh [PakLubis](https://paklubis.my.id) — Semoga bermanfaat dan bernilai ibadah. Aamiin.

> "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia." (HR. Ahmad)

---

## 📜 Lisensi

&copy; 2024 PakLubis — Dilarang memperjualbelikan aplikasi ini.
