/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'react-native-gesture-handler/jestSetup';

// Patch Gesture Handler// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  return {
    ...Reanimated,
    makeMutable: (val: any) => ({ value: val }),
    useSharedValue: (val: any) => ({ value: val }),
    runOnJS: (fn: any) => fn,
    useEvent: (handler: any) => (event: any) => handler(event),
    useDerivedValue: (cb: any) => ({ value: cb() }),
    useAnimatedReaction: jest.fn(),
    useAnimatedStyle: (cb: any) => cb(),
    useAnimatedProps: (cb: any) => cb(),
    interpolate: (val: any, input: any, output: any) => output[0],
    interpolateColor: (val: any, input: any, output: any) => output[0],
    withTiming: (val: any) => val,
    withSpring: (val: any) => val,
  };
}, { virtual: true });

// Mock Gesture Handler
const mockGesture = {
  Pan: () => ({
    hitSlop: jest.fn().mockReturnThis(),
    activeOffsetY: jest.fn().mockReturnThis(),
    activeOffsetX: jest.fn().mockReturnThis(),
    onStart: jest.fn().mockReturnThis(),
    onUpdate: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    onFinalize: jest.fn().mockReturnThis(),
    minDistance: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
    toGestureArray: function() { return [this]; },
    initialize: jest.fn(),
    prepare: jest.fn(),
  }),
  Tap: () => ({
    onEnd: jest.fn().mockReturnThis(),
    onFinalize: jest.fn().mockReturnThis(),
    toGestureArray: function() { return [this]; },
    initialize: jest.fn(),
    prepare: jest.fn(),
  }),
  LongPress: () => ({
    onStart: jest.fn().mockReturnThis(),
    onFinalize: jest.fn().mockReturnThis(),
    toGestureArray: function() { return [this]; },
    initialize: jest.fn(),
    prepare: jest.fn(),
  }),
  Race: jest.fn().mockImplementation((...gestures: any[]) => ({
    gestures,
    toGestureArray: function() { return this.gestures; },
    initialize: jest.fn(),
    prepare: jest.fn(),
  })),
  Exclusive: jest.fn().mockImplementation((...gestures: any[]) => ({
    gestures,
    toGestureArray: function() { return this.gestures; },
    initialize: jest.fn(),
    prepare: jest.fn(),
  })),
  Simultaneous: jest.fn().mockImplementation((...gestures: any[]) => ({
    gestures,
    toGestureArray: function() { return this.gestures; },
    initialize: jest.fn(),
    prepare: jest.fn(),
  })),
};

jest.mock('react-native-gesture-handler', () => {
  const actual = jest.requireActual('react-native-gesture-handler');
  return {
    ...actual,
    GestureDetector: ({ children }: any) => children,
    Gesture: mockGesture,
    runOnJS: (fn: any) => fn,
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
