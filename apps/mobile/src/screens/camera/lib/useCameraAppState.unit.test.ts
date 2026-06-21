import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useCameraAppState } from './useCameraAppState';

describe('useCameraAppState', () => {
  let appStateCallback: ((state: string) => void) | null = null;
  const mockRemoveSubscription = jest.fn();
  let addEventListenerSpy: jest.SpyInstance;
  let mockCurrentAppState: string = 'active';

  beforeAll(() => {
    Object.defineProperty(AppState, 'currentState', {
      get: () => mockCurrentAppState,
      configurable: true
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockCurrentAppState = 'active';
    appStateCallback = null;

    addEventListenerSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (event, cb: any) => {
        appStateCallback = cb;
        return { remove: mockRemoveSubscription };
      }
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sets up the AppState listener and tears it down on unmount', () => {
    const { unmount } = renderHook(() => useCameraAppState());

    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(mockRemoveSubscription).toHaveBeenCalled();
  });

  it('increments cameraKey when app transitions from background to active', () => {
    mockCurrentAppState = 'background';
    const { result } = renderHook(() => useCameraAppState());

    expect(result.current.cameraKey).toBe(0);

    act(() => {
      if (appStateCallback) {
        appStateCallback('active');
      }
    });

    expect(result.current.cameraKey).toBe(1);
  });

  it('does not increment cameraKey when app transitions from inactive to active', () => {
    mockCurrentAppState = 'active';
    const { result } = renderHook(() => useCameraAppState());

    act(() => {
      if (appStateCallback) {
        appStateCallback('inactive'); // pull down notification shade
      }
    });
    
    act(() => {
      if (appStateCallback) {
        appStateCallback('active'); // push up notification shade
      }
    });

    expect(result.current.cameraKey).toBe(0);
  });
});

