// Global type declarations for window extensions
declare global {
  interface Window {
    // Sholat page
    _sholatInterval: ReturnType<typeof setInterval> | null;
    _sholatInitialized: boolean;

    // Doa page
    _doaInitialized: boolean;

    // Asmaul Husna page
    _asmaulInitialized: boolean;

    // Tasbih page
    _tasbihInitialized: boolean;

    // Quran pages
    _quranDetailInitialized: boolean;
    _yasinInitialized: boolean;
    _quranIndexInitialized: boolean;

    // Zakat page
    _zakatInitialized: boolean;

    // Dzikir page
    _dzikirInitialized: boolean;

    // Sholat Guide page
    _guideTimer: ReturnType<typeof setInterval> | null;
    _guideAudio: HTMLAudioElement | null;
    _guideInitialized: boolean;

    // Tahlil page
    _tahlilInitialized: boolean;

    // Index page
    _indexInitialized: boolean;
    _quoteInitialized: boolean;
    _quoteInterval: ReturnType<typeof setInterval> | null;
    _quoteTimeout: ReturnType<typeof setTimeout> | null;
    _prayerInterval: ReturnType<typeof setInterval> | null;

    // Events page
    _eventsTabsInit: boolean;

    // Global toast function
    showToast: (msg: string, duration?: number) => void;

    // WebKit AudioContext (for Safari)
    webkitAudioContext: typeof AudioContext;
  }
}

export {};
