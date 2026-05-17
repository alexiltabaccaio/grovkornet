/* eslint-disable @typescript-eslint/no-require-imports */
 

// Mock Reanimated BEFORE everything else
jest.mock('react-native-reanimated', () => {
  const { View, Text, TextInput } = require('react-native');
  
  const val = (v: any) => ({ value: v });
  
  const mockReanimated = {
    __esModule: true,
    makeMutable: jest.fn(val),
    useSharedValue: jest.fn(val),
    useEvent: jest.fn((h: any) => h),
    useDerivedValue: jest.fn((cb: any) => ({ value: cb() })),
    withSpring: jest.fn((v: any) => v),
    withTiming: jest.fn((v: any) => v),
    withSequence: jest.fn((...args: any[]) => args[args.length - 1]),
    useAnimatedStyle: jest.fn((cb: any) => cb()),
    useAnimatedProps: jest.fn((cb: any) => cb()),
    createAnimatedComponent: jest.fn((comp: any) => comp),
    interpolate: jest.fn((v, i, o) => v),
    Extrapolation: {
      CLAMP: 'clamp',
    },
    runOnJS: jest.fn((f: any) => f),
    interpolateColor: jest.fn((v, i, o) => '#FFFFFF'),
    FadeIn: { duration: jest.fn().mockReturnThis(), delay: jest.fn().mockReturnThis() },
    FadeOut: { duration: jest.fn().mockReturnThis(), delay: jest.fn().mockReturnThis() },
    LinearTransition: { duration: jest.fn().mockReturnThis() },
    default: {
      View,
      Text,
      TextInput,
      createAnimatedComponent: jest.fn((comp: any) => comp),
    },
  };
  
  (mockReanimated.default as any).View = View;
  (mockReanimated.default as any).Text = Text;
  (mockReanimated.default as any).TextInput = TextInput;
  
  return mockReanimated;
});

import 'react-native-gesture-handler/jestSetup';

// Mock Expo Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock Expo Modules Core
jest.mock('expo-modules-core', () => {
  const actual = jest.requireActual('expo-modules-core');
  return {
    ...actual,
    requireNativeViewManager: jest.fn(() => {
      const { View } = require('react-native');
      return View;
    }),
  };
});

// Mock Gesture Handler extensions
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
  
  Object.defineProperty(RN, 'LogBox', {
    value: {
      ignoreAllLogs: jest.fn(),
      ignoreLogs: jest.fn(),
    },
    writable: true,
  });
  
  return RN;
});

// Mock Expo Vector Icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

// Silence some warnings
console.warn = jest.fn();
console.error = jest.fn();
