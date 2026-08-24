// Shared utility functions for testing

/**
 * Add minutes to a time string (HH:MM) with modulo 1440 arithmetic
 * Prevents midnight wrap issues (23:59 + 2 = 00:01)
 */
export function addMinutes(timeStr: string, minutesToAdd: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  let totalMinutes = h * 60 + m + minutesToAdd;
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440; // Clamping modulo 24 jam

  const resH = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const resM = (totalMinutes % 60).toString().padStart(2, '0');
  return `${resH}:${resM}`;
}

/**
 * Convert time string to Date object for comparison
 */
export function getPDate(timeStr: string, relativeDate = new Date()): Date {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(relativeDate);
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * Format Rupiah currency string
 */
export function formatRupiah(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Parse Rupiah string to number
 */
export function parseRupiah(str: string): number {
  if (!str) return 0;
  // Remove "Rp" prefix and dots
  const cleaned = str.replace(/^Rp\s*/, '').replace(/\./g, '');
  return parseInt(cleaned) || 0;
}

/**
 * Calculate Zakat Maal (2.5% of wealth above nishab)
 * Nishab = 85 grams of gold
 */
export function calculateZakatMaal(
  goldPricePerGram: number,
  totalWealth: number,
  debtDue: number
): { zakat: number; nishab: number; isWajib: boolean } {
  const nishab = goldPricePerGram * 85;
  const netWealth = totalWealth - debtDue;
  const isWajib = netWealth >= nishab;
  const zakat = isWajib ? netWealth * 0.025 : 0;
  return { zakat, nishab, isWajib };
}

/**
 * Calculate Zakat Penghasilan (2.5% of income above monthly nishab)
 * Monthly nishab = 85g gold / 12 months
 */
export function calculateZakatPenghasilan(
  goldPricePerGram: number,
  monthlyIncome: number,
  bonusIncome: number
): { zakat: number; nishab: number; isWajib: boolean } {
  const monthlyNishab = (goldPricePerGram * 85) / 12;
  const totalIncome = monthlyIncome + bonusIncome;
  const isWajib = totalIncome >= monthlyNishab;
  const zakat = isWajib ? totalIncome * 0.025 : 0;
  return { zakat, nishab: monthlyNishab, isWajib };
}

/**
 * Calculate Qibla direction from coordinates to Ka'bah
 * Uses spherical trigonometry
 */
export function calculateQibla(lat: number, lng: number): number {
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;

  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (kaabaLat * Math.PI) / 180;
  const Δλ = ((kaabaLng - lng) * Math.PI) / 180;

  const x = Math.sin(Δλ) * Math.cos(φ2);
  const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let q = (Math.atan2(x, y) * 180) / Math.PI;
  return (q + 360) % 360;
}

/**
 * Get next prayer time from current time
 * Handles post-midnight scenario correctly
 */
export function getNextPrayerTime(
  timings: Record<string, string>,
  now = new Date()
): { prayer: string; time: Date } | null {
  const ordered = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  // Find next prayer today
  for (const k of ordered) {
    const t = getPDate(timings[k], now);
    if (t > now) {
      return { prayer: k, time: t };
    }
  }

  // If all passed, next is Fajr tomorrow
  const fajrTime = getPDate(timings.Fajr, now);
  const tomorrow = new Date(fajrTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { prayer: 'Fajr', time: tomorrow };
}

/**
 * Calculate days until Hijri event (approximate)
 */
export function daysUntilHijriEvent(
  currentMonth: number,
  currentDay: number,
  eventMonth: number,
  eventDay: number
): number {
  const daysPerMonth = 30; // Approximate

  if (eventMonth > currentMonth || (eventMonth === currentMonth && eventDay >= currentDay)) {
    // Same year
    if (eventMonth === currentMonth) {
      return eventDay - currentDay;
    } else {
      return daysPerMonth - currentDay + (eventMonth - currentMonth - 1) * daysPerMonth + eventDay;
    }
  } else {
    // Wrap to next year
    return (
      daysPerMonth -
      currentDay +
      (12 - currentMonth) * daysPerMonth +
      (eventMonth - 1) * daysPerMonth +
      eventDay
    );
  }
}

/**
 * Format date to Indonesian locale
 */
export function formatIndonesianDate(date = new Date()): string {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Hijri month normalization
 */
export const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi\u2019 al-Awwal',
  'Rabi\u2019 al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Sha\u2019ban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qi\u2019dah',
  'Dhu al-Hijjah',
];

export const MONTH_ALIASES: Record<string, string> = {
  'Jumada I': 'Jumada al-Awwal',
  'Jumada al-Ula': 'Jumada al-Awwal',
  'Jumada II': 'Jumada al-Thani',
  'Jumada al-Akhirah': 'Jumada al-Thani',
  'Rabi\u2019 I': 'Rabi\u2019 al-Awwal',
  'Rabi\u2019 II': 'Rabi\u2019 al-Thani',
  'Dhu\u2019l-Qi\u2019dah': 'Dhu al-Qi\u2019dah',
  'Dhu\u2019l-Hijjah': 'Dhu al-Hijjah',
  // Common alternatives
  "Rabi' I": 'Rabi\u2019 al-Awwal',
  "Rabi' II": 'Rabi\u2019 al-Thani',
  "Dhu'l-Qi'dah": 'Dhu al-Qi\u2019dah',
  "Dhu'l-Hijjah": 'Dhu al-Hijjah',
};

export function hijriMonthIndex(name: string): number {
  const normalized = MONTH_ALIASES[name] || name;
  return HIJRI_MONTHS.indexOf(normalized);
}

export function isAfterOrSame(m1: number, d1: number, m2: number, d2: number): boolean {
  return m1 > m2 || (m1 === m2 && d1 >= d2);
}
