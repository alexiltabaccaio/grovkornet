/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'react-native-gesture-handler/jestSetup';

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.makeMutable = (initialValue: any) => ({
    value: initialValue,
  });
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
  }, RN);

  return mockRN;
});

// Mock Expo Vector Icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

// Silence some warnings
console.warn = jest.fn();
console.error = jest.fn();
