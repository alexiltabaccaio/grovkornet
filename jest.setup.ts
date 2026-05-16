/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'react-native-gesture-handler/jestSetup';

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.makeMutable = jest.fn((val: any) => ({ value: val }));
  Reanimated.useSharedValue = jest.fn((val: any) => ({ value: val }));
  // Reanimated mock usually has createAnimatedComponent, but let's ensure it's there
  if (!Reanimated.createAnimatedComponent) {
    Reanimated.createAnimatedComponent = jest.fn((comp: any) => comp);
  }
  return {
    __esModule: true,
    ...Reanimated,
    default: Reanimated,
  };
});

// Mock Gesture Handler - we don't need to 'require' it here, just mock the specific parts that fail
jest.mock('react-native-gesture-handler', () => {
  const actual = jest.requireActual('react-native-gesture-handler');
  
  const createChainable = () => {
    const obj: any = {};
    obj.hitSlop = jest.fn(() => obj);
    obj.activeOffsetY = jest.fn(() => obj);
    obj.activeOffsetX = jest.fn(() => obj);
    obj.failOffsetX = jest.fn(() => obj);
    obj.failOffsetY = jest.fn(() => obj);
    obj.onStart = jest.fn(() => obj);
    obj.onUpdate = jest.fn(() => obj);
    obj.onEnd = jest.fn(() => obj);
    obj.onFinalize = jest.fn(() => obj);
    obj.minDistance = jest.fn(() => obj);
    obj.enabled = jest.fn(() => obj);
    obj.runOnJS = jest.fn(() => obj);
    obj.toGestureArray = jest.fn(() => [obj]);
    return obj;
  };

  return {
    ...actual,
    GestureDetector: ({ children }: any) => children,
    Gesture: {
      ...actual.Gesture,
      Pan: () => createChainable(),
      Tap: () => createChainable(),
      LongPress: () => createChainable(),
    },
  };
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
  RN.LogBox = {
    ignoreAllLogs: jest.fn(),
    ignoreLogs: jest.fn(),
  };
  return RN;
});

// Mock Expo Vector Icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

// Silence some warnings
console.warn = jest.fn();
console.error = jest.fn();
