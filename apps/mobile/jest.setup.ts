/* eslint-disable @typescript-eslint/no-require-imports */
 

// Polyfill Node fetch globals for Jest
global.Response = globalThis.Response || global.Response;
global.Request = globalThis.Request || global.Request;
global.Headers = globalThis.Headers || global.Headers;
global.fetch = globalThis.fetch || global.fetch;

// Mock Expo's winter fetch native module
jest.mock('expo/src/winter/fetch/ExpoFetchModule', () => {
  class StubNativeResponse {
    addListener = jest.fn();
    removeListener = jest.fn();
    removeAllListeners = jest.fn();
  }
  class StubNativeRequest {}
  return {
    ExpoFetchModule: {
      NativeRequest: StubNativeRequest,
      NativeResponse: StubNativeResponse,
    },
  };
});

// Mock Reanimated BEFORE everything else
jest.mock('react-native-reanimated', () => {
  const { View, Text, TextInput } = require('react-native');
  
  const val = (v: any) => ({ value: v });
  
  const mockReanimated = {
    __esModule: true,
    makeMutable: jest.fn(val),
    useSharedValue: jest.fn((v: any) => {
      const React = require('react');
      const ref = React.useRef({ value: v });
      return ref.current;
    }),
    useEvent: jest.fn((h: any) => h),
    useDerivedValue: jest.fn((cb: any) => {
      const React = require('react');
      const ref = React.useRef({ value: cb() });
      ref.current.value = cb();
      return ref.current;
    }),
    withSpring: jest.fn((value: any, config: any, callback: any) => {
      if (typeof callback === 'function') {
        callback(true);
      } else if (typeof config === 'function') {
        config(true);
      }
      return value;
    }),
    withTiming: jest.fn((value: any, config: any, callback: any) => {
      if (typeof callback === 'function') {
        callback(true);
      } else if (typeof config === 'function') {
        config(true);
      }
      return value;
    }),
    withDecay: jest.fn((value: any, config: any, callback: any) => {
      if (typeof callback === 'function') {
        callback(true);
      } else if (typeof config === 'function') {
        config(true);
      }
      return value;
    }),
    cancelAnimation: jest.fn(),
    withSequence: jest.fn((...args: any[]) => args[args.length - 1]),
    withRepeat: jest.fn((v: any) => v),
    Easing: {
      linear: jest.fn((v) => v),
      quad: jest.fn((v) => v),
      out: jest.fn((f) => f),
      bezier: jest.fn(() => jest.fn((v) => v)),
    },
    useAnimatedStyle: jest.fn((cb: any) => cb()),
    useAnimatedProps: jest.fn((cb: any) => cb()),
    createAnimatedComponent: jest.fn((comp: any) => comp),
    interpolate: jest.fn((v, i, o) => v),
    useAnimatedReaction: jest.fn((prepare: any, react: any) => {
      const React = require('react');
      const prevRef = React.useRef(prepare());
      React.useEffect(() => {
        const val = prepare();
        if (val !== prevRef.current) {
          react(val, prevRef.current);
          prevRef.current = val;
        }
      });
    }),
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
    requireNativeModule: jest.fn(() => ({
      verifyGrovkornetAuthenticity: jest.fn(() => Promise.resolve(true)),
      generatePresetPreview: jest.fn(() => Promise.resolve('')),
      deleteFile: jest.fn(() => Promise.resolve(true)),
      pauseStream: jest.fn(() => Promise.resolve()),
      resumeStream: jest.fn(() => Promise.resolve()),
    })),
  };
});

// Mock Gesture Handler extensions
jest.mock('react-native-gesture-handler', () => {
  const actual = jest.requireActual('react-native-gesture-handler');
  const React = require('react');
  
  const createChainable = () => {
    const obj: any = {};
    obj.toGestureArray = jest.fn(() => [proxy]);

    const proxy: any = new Proxy(obj, {
      get(target, prop) {
        if (prop in target) {
          return target[prop];
        }
        if (typeof prop === 'string') {
          if (
            prop.startsWith('_') ||
            prop === 'type' ||
            prop === 'gestures' ||
            prop === 'then' ||
            prop === 'toJSON' ||
            prop === '$$typeof'
          ) {
            return target[prop];
          }
          target[prop] = jest.fn((cb) => {
            if (typeof cb === 'function') {
              target['_' + prop] = cb;
            }
            return proxy;
          });
          return target[prop];
        }
        return undefined;
      },
    });

    return proxy;
  };

  return {
    ...actual,
    TouchableOpacity: require('react-native').TouchableOpacity,
    ScrollView: require('react-native').ScrollView,
    GestureDetector: ({ children, gesture }: any) => {
      const findHandler = (g: any): (() => void) | undefined => {
        if (!g) return undefined;
        if (typeof g._onEnd === 'function') return g._onEnd;
        if (typeof g._onStart === 'function') return g._onStart;
        if (typeof g._onChange === 'function') return g._onChange;
        if (typeof g._onUpdate === 'function') return g._onUpdate;
        if (g.gestures && Array.isArray(g.gestures)) {
          for (const sub of g.gestures) {
            const h = findHandler(sub);
            if (h) return h;
          }
        }
        return undefined;
      };

      const handler = findHandler(gesture);
      if (handler && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
          onPress: handler,
        });
      }
      return children;
    },
    Gesture: {
      ...actual.Gesture,
      Pan: () => createChainable(),
      Pinch: () => createChainable(),
      Tap: () => createChainable(),
      LongPress: () => createChainable(),
      Race: (...gestures: any[]) => ({ gestures, type: 'race' }),
      Simultaneous: (...gestures: any[]) => ({ gestures, type: 'simultaneous' }),
      Exclusive: (...gestures: any[]) => ({ gestures, type: 'exclusive' }),
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

// Mock react-native-share
jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {
    shareSingle: jest.fn(),
    open: jest.fn(),
  },
  Social: {
    InstagramStories: 'instagramstories',
  },
}));

// Mock expo-media-library and expo-media-library/legacy
const mockMediaLibrary = {
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted', granted: true, canAskAgain: true })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted', granted: true })),
  getAlbumAsync: jest.fn(() => Promise.resolve({ id: 'album-id', title: 'Grovkornet' })),
  getAlbumsAsync: jest.fn(() => Promise.resolve([{ id: 'album-id', title: 'Grovkornet' }])),
  getAssetsAsync: jest.fn(() => Promise.resolve({
    assets: [
      { id: '1', uri: 'file:///test/1.jpg' },
      { id: '2', uri: 'file:///test/2.jpg' },
    ],
  })),
  MediaType: {
    photo: 'photo',
  },
  SortBy: {
    creationTime: 'creationTime',
  },
};
jest.mock('expo-media-library', () => mockMediaLibrary);
jest.mock('expo-media-library/legacy', () => mockMediaLibrary);

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

// Silence some warnings
console.warn = jest.fn();
console.error = jest.fn();

// Mock expo-system-ui
jest.mock('expo-system-ui', () => ({
  setBackgroundColorAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-image to support triggering onLoad
jest.mock('expo-image', () => {
  const actualExpoImage = jest.requireActual('expo-image');
  const React = require('react');
  const { View } = require('react-native');

  const MockImage = React.forwardRef(({ onLoad, source, ...props }: any, ref: any) => {
    React.useEffect(() => {
      if (onLoad) {
        const timer = setTimeout(() => {
          onLoad({ source });
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [onLoad, source]);

    return React.createElement(View, { ref, source, ...props });
  });

  MockImage.prefetch = jest.fn().mockImplementation(() => Promise.resolve(true));
  MockImage.displayName = 'MockImage';

  return {
    ...actualExpoImage,
    Image: MockImage,
  };
});

// Mock expo-sensors
jest.mock('expo-sensors', () => ({
  Accelerometer: {
    addListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
    removeAllListeners: jest.fn(),
    setUpdateInterval: jest.fn(),
  },
}));

// Mock react-native-nitro-modules
jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {},
}));

// Mock react-native-mmkv
const mockMMKVGlobalStores = new Map<string, Map<string, string>>();

jest.mock('react-native-mmkv', () => {
  return {
    createMMKV: jest.fn((config?: { id?: string }) => {
      const id = config?.id ?? 'default';
      if (!mockMMKVGlobalStores.has(id)) {
        mockMMKVGlobalStores.set(id, new Map<string, string>());
      }
      const store = mockMMKVGlobalStores.get(id)!;
      return {
        set: jest.fn((key: string, value: any) => {
          store.set(key, String(value));
        }),
        getString: jest.fn((key: string) => {
          return store.get(key) ?? null;
        }),
        getNumber: jest.fn((key: string) => {
          const val = store.get(key);
          return val ? Number(val) : undefined;
        }),
        getBoolean: jest.fn((key: string) => {
          const val = store.get(key);
          return val ? val === 'true' : undefined;
        }),
        remove: jest.fn((key: string) => {
          store.delete(key);
        }),
        clearAll: jest.fn(() => {
          store.clear();
        }),
      };
    }),
    // Expose registry for tests to inspect or clear if needed
    _globalStores: mockMMKVGlobalStores,
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const insetValues = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => insetValues,
    initialWindowMetrics: {
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: insetValues,
    },
  };
});

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn((uri: string) => Promise.resolve({ exists: true, uri })),
}));


