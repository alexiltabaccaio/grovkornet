/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'react-native-gesture-handler/jestSetup';

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const Reanimated = require('react-native-reanimated/mock');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  Reanimated.makeMutable = <T>(initialValue: T) => ({
    value: initialValue,
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Reanimated;
});

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock react-native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  const mockRN = Object.setPrototypeOf({
    LogBox: {
      ignoreAllLogs: jest.fn(),
      ignoreLogs: jest.fn(),
      install: jest.fn(),
      uninstall: jest.fn(),
    },
    PermissionsAndroid: {
      request: jest.fn().mockResolvedValue('granted'),
      check: jest.fn().mockResolvedValue(true),
      RESULTS: { GRANTED: 'granted' },
      PERMISSIONS: { CAMERA: 'android.permission.CAMERA' },
    },
  }, RN as object);

  return mockRN;
});

// Mock Expo Vector Icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

// Silence some warnings
console.warn = jest.fn();
console.error = jest.fn();
