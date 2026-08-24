import { describe, it, expect } from 'vitest';
import {
  addMinutes,
  getPDate,
  formatRupiah,
  parseRupiah,
  calculateZakatMaal,
  calculateZakatPenghasilan,
  calculateQibla,
  getNextPrayerTime,
  daysUntilHijriEvent,
  formatIndonesianDate,
  hijriMonthIndex,
  isAfterOrSame,
} from './utils';

describe('addMinutes', () => {
  it('should add minutes correctly', () => {
    expect(addMinutes('12:00', 30)).toBe('12:30');
    expect(addMinutes('12:30', 45)).toBe('13:15');
  });

  it('should handle midnight wrap', () => {
    expect(addMinutes('23:59', 2)).toBe('00:01');
    expect(addMinutes('23:50', 15)).toBe('00:05');
  });

  it('should handle negative minutes (subtraction)', () => {
    expect(addMinutes('12:30', -30)).toBe('12:00');
    expect(addMinutes('00:30', -60)).toBe('23:30');
  });

  it('should handle full day wrap', () => {
    expect(addMinutes('12:00', 1440)).toBe('12:00');
    expect(addMinutes('12:00', 2880)).toBe('12:00');
  });
});

describe('getPDate', () => {
  it('should create Date object with correct time', () => {
    const base = new Date('2024-01-15');
    const result = getPDate('12:30', base);
    expect(result.getHours()).toBe(12);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
  });
});

describe('formatRupiah', () => {
  it('should format numbers to Indonesian Rupiah', () => {
    // Intl.NumberFormat uses NBSP (U+00A0) between currency and amount
    expect(formatRupiah(1000)).toBe('Rp\u00A01.000');
    expect(formatRupiah(1000000)).toBe('Rp\u00A01.000.000');
    expect(formatRupiah(1234567)).toBe('Rp\u00A01.234.567');
  });

  it('should handle zero', () => {
    expect(formatRupiah(0)).toBe('Rp\u00A00');
  });
});

describe('parseRupiah', () => {
  it('should parse Rupiah string to number', () => {
    expect(parseRupiah('1.000')).toBe(1000);
    expect(parseRupiah('1.000.000')).toBe(1000000);
    expect(parseRupiah('Rp 1.234.567')).toBe(1234567);
    expect(parseRupiah('Rp1.234.567')).toBe(1234567);
  });

  it('should handle empty or invalid strings', () => {
    expect(parseRupiah('')).toBe(0);
    expect(parseRupiah('invalid')).toBe(0);
  });
});

describe('calculateZakatMaal', () => {
  it('should calculate zakat when wealth exceeds nishab', () => {
    const goldPrice = 1_200_000;
    const wealth = 150_000_000;
    const debt = 10_000_000;

    const result = calculateZakatMaal(goldPrice, wealth, debt);

    const expectedNishab = goldPrice * 85; // 102,000,000
    const netWealth = wealth - debt; // 140,000,000
    expect(result.nishab).toBe(expectedNishab);
    expect(result.isWajib).toBe(true);
    expect(result.zakat).toBe(netWealth * 0.025); // 3,500,000
  });

  it('should return 0 zakat when wealth below nishab', () => {
    const goldPrice = 1_200_000;
    const wealth = 50_000_000;
    const debt = 0;

    const result = calculateZakatMaal(goldPrice, wealth, debt);

    expect(result.isWajib).toBe(false);
    expect(result.zakat).toBe(0);
  });

  it('should account for debt correctly', () => {
    const goldPrice = 1_200_000;
    const wealth = 110_000_000;
    const debt = 20_000_000;

    const result = calculateZakatMaal(goldPrice, wealth, debt);

    // netWealth = wealth - debt = 90,000,000 (below nishab)
    expect(result.isWajib).toBe(false); // Below nishab of 102,000,000
  });
});

describe('calculateZakatPenghasilan', () => {
  it('should calculate zakat when income exceeds monthly nishab', () => {
    const goldPrice = 1_200_000;
    const monthlyIncome = 15_000_000;
    const bonusIncome = 5_000_000;

    const result = calculateZakatPenghasilan(goldPrice, monthlyIncome, bonusIncome);

    const monthlyNishab = (goldPrice * 85) / 12; // ~8,500,000
    const totalIncome = monthlyIncome + bonusIncome; // 20,000,000
    expect(result.nishab).toBeCloseTo(monthlyNishab, -3);
    expect(result.isWajib).toBe(true);
    expect(result.zakat).toBe(totalIncome * 0.025); // 500,000
  });

  it('should return 0 zakat when income below monthly nishab', () => {
    const goldPrice = 1_200_000;
    const monthlyIncome = 5_000_000;
    const bonusIncome = 0;

    const result = calculateZakatPenghasilan(goldPrice, monthlyIncome, bonusIncome);

    expect(result.isWajib).toBe(false);
    expect(result.zakat).toBe(0);
  });
});

describe('calculateQibla', () => {
  it('should calculate qibla direction for Jakarta', () => {
    // Jakarta: -6.2088, 106.8456
    const direction = calculateQibla(-6.2088, 106.8456);
    expect(direction).toBeGreaterThan(0);
    expect(direction).toBeLessThan(360);
    // Jakarta qibla should be around 295° (northwest)
    expect(direction).toBeCloseTo(295, 0);
  });

  it('should calculate qibla direction for Makkah (should be 0 or 360)', () => {
    // Ka'bah coordinates
    const direction = calculateQibla(21.4225, 39.8262);
    expect(direction).toBeCloseTo(0, 0); // Should be ~0 (same location)
  });

  it('should return value between 0 and 360', () => {
    // Test various coordinates
    const testCoords = [
      [-6.2088, 106.8456], // Jakarta
      [35.6895, 139.6917], // Tokyo
      [40.7128, -74.006], // New York
      [51.5074, -0.1278], // London
    ];

    testCoords.forEach(([lat, lng]) => {
      const direction = calculateQibla(lat, lng);
      expect(direction).toBeGreaterThanOrEqual(0);
      expect(direction).toBeLessThan(360);
    });
  });
});

describe('getNextPrayerTime', () => {
  const mockTimings = {
    Fajr: '04:30',
    Dhuhr: '12:00',
    Asr: '15:30',
    Maghrib: '18:00',
    Isha: '19:30',
  };

  it('should return next prayer during the day', () => {
    const now = new Date('2024-01-15T10:00:00');
    const result = getNextPrayerTime(mockTimings, now);

    expect(result).not.toBeNull();
    expect(result!.prayer).toBe('Dhuhr');
    expect(result!.time.getHours()).toBe(12);
    expect(result!.time.getMinutes()).toBe(0);
  });

  it('should return Fajr tomorrow after Isha', () => {
    const now = new Date('2024-01-15T20:00:00');
    const result = getNextPrayerTime(mockTimings, now);

    expect(result).not.toBeNull();
    expect(result!.prayer).toBe('Fajr');
    expect(result!.time.getDate()).toBe(16); // Next day
  });

  it('should handle Fajr correctly before Fajr time', () => {
    const now = new Date('2024-01-15T03:00:00');
    const result = getNextPrayerTime(mockTimings, now);

    expect(result).not.toBeNull();
    expect(result!.prayer).toBe('Fajr');
    expect(result!.time.getDate()).toBe(15); // Today
  });
});

describe('daysUntilHijriEvent', () => {
  it('should calculate days within same month', () => {
    expect(daysUntilHijriEvent(1, 5, 1, 10)).toBe(5);
    expect(daysUntilHijriEvent(1, 1, 1, 1)).toBe(0);
  });

  it('should calculate days across months', () => {
    expect(daysUntilHijriEvent(1, 1, 2, 1)).toBe(30);
    expect(daysUntilHijriEvent(1, 15, 3, 1)).toBe(15 + 30 + 1);
  });

  it('should wrap to next year', () => {
    // From month 12 to month 1: remaining days in month 12 + 0 intermediate months + event day
    expect(daysUntilHijriEvent(12, 20, 1, 1)).toBe(10 + 1);
    expect(daysUntilHijriEvent(12, 30, 1, 1)).toBe(0 + 1);
  });
});

describe('formatIndonesianDate', () => {
  it('should format date in Indonesian locale', () => {
    const date = new Date('2024-01-15');
    const formatted = formatIndonesianDate(date);

    expect(formatted).toContain('2024');
    expect(formatted).toContain('Januari');
    expect(formatted).toContain('15');
    expect(formatted).toContain('Senin'); // 2024-01-15 is Monday
  });
});

describe('hijriMonthIndex', () => {
  it('should return correct index for standard months', () => {
    expect(hijriMonthIndex('Muharram')).toBe(0);
    expect(hijriMonthIndex('Ramadan')).toBe(8);
    expect(hijriMonthIndex('Dhu al-Hijjah')).toBe(11);
  });

  it('should handle aliases', () => {
    // Using right single quotation mark (U+2019) as in the aliases
    expect(hijriMonthIndex('Rabi\u2019 I')).toBe(2);
    expect(hijriMonthIndex('Jumada II')).toBe(5);
    expect(hijriMonthIndex('Dhu\u2019l-Hijjah')).toBe(11);
  });

  it('should return -1 for unknown months', () => {
    expect(hijriMonthIndex('Invalid')).toBe(-1);
  });
});

describe('isAfterOrSame', () => {
  it('should return true when first date is after', () => {
    expect(isAfterOrSame(2, 15, 1, 10)).toBe(true);
    expect(isAfterOrSame(1, 20, 1, 10)).toBe(true);
  });

  it('should return true when same month and day', () => {
    expect(isAfterOrSame(1, 10, 1, 10)).toBe(true);
  });

  it('should return false when first date is before', () => {
    expect(isAfterOrSame(1, 5, 1, 10)).toBe(false);
    expect(isAfterOrSame(1, 10, 2, 1)).toBe(false);
  });
});
