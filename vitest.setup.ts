// vitest.setup.ts
import { vi, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
  },
});

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  value: {
    permission: 'granted',
    requestPermission: vi.fn().mockResolvedValue('granted'),
  },
});

// Mock AudioContext
Object.defineProperty(window, 'AudioContext', {
  value: vi.fn().mockImplementation(() => ({
    createOscillator: vi.fn().mockReturnValue({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0 },
      type: 'sine',
    }),
    createGain: vi.fn().mockReturnValue({
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    }),
    destination: {},
    currentTime: 0,
  })),
});

// Mock vibration
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReset();
  localStorageMock.setItem.mockReset();
});
