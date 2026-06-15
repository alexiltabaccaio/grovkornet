import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useForceLayoutSync } from './useForceLayoutSync';
import { useControlPanelStore } from '@entities/system';
import * as reanimatedModule from 'react-native-reanimated';

// Mock the system store
jest.mock('@entities/system', () => {
  const mockControlPanelStore = {
    getState: jest.fn(() => ({
      activeSection: 'none',
    })),
  };
  return {
    useControlPanelStore: mockControlPanelStore,
  };
});

describe('useForceLayoutSync', () => {
  let drawerAnimation: any;
  let footerTranslateY: any;
  let originalWithTiming: any;

  beforeAll(() => {
    originalWithTiming = reanimatedModule.withTiming;
    // Mock withTiming to run callback asynchronously (simulating animation end)
    (reanimatedModule.withTiming as jest.Mock).mockImplementation((value: any, config: any, callback: any) => {
      if (typeof callback === 'function') {
        setTimeout(() => {
          callback(true);
        }, 0);
      } else if (typeof config === 'function') {
        setTimeout(() => {
          config(true);
        }, 0);
      }
      return value;
    });
  });

  afterAll(() => {
    (reanimatedModule.withTiming as jest.Mock).mockImplementation(originalWithTiming);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Custom shared values that update their values when assigned to simulate real behavior
    drawerAnimation = {
      _val: 0,
      get value() {
        return this._val;
      },
      set value(v) {
        this._val = v;
      }
    };
    footerTranslateY = {
      _val: 0,
      get value() {
        return this._val;
      },
      set value(v) {
        this._val = v;
      }
    };

    (useControlPanelStore.getState as jest.Mock).mockReturnValue({
      activeSection: 'none',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not trigger timing layout synchronization on initial mount', () => {
    renderHook(() =>
      useForceLayoutSync({
        shouldRenderGallery: false,
        drawerAnimation,
        footerTranslateY,
      })
    );

    // Ensure no timers are running
    expect(jest.getTimerCount()).toBe(0);
    expect(drawerAnimation.value).toBe(0);
    expect(footerTranslateY.value).toBe(0);
  });

  it('triggers synchronization when shouldRenderGallery changes and activeSection is none', () => {
    const { rerender } = renderHook(
      ({ shouldRenderGallery }: { shouldRenderGallery: boolean }) =>
        useForceLayoutSync({
          shouldRenderGallery,
          drawerAnimation,
          footerTranslateY,
        }),
      {
        initialProps: { shouldRenderGallery: false },
      }
    );

    // Change shouldRenderGallery to true
    rerender({ shouldRenderGallery: true });

    // Expect a timer to be set
    expect(jest.getTimerCount()).toBe(1);

    // Fast-forward timers by 50ms (triggers the main timeout)
    act(() => {
      jest.advanceTimersByTime(50);
    });

    // The callback inside withTiming is deferred by setTimeout 0, so let's run all pending timers
    act(() => {
      jest.runAllTimers();
    });

    // When activeSection is 'none':
    // It runs withTiming(-0.1, {duration: 0}, callback) which sets it to withTiming(0, {duration: 0})
    expect(drawerAnimation.value).toBe(0);
    expect(footerTranslateY.value).toBe(0);
  });

  it('triggers synchronization when shouldRenderGallery changes and activeSection is set', () => {
    (useControlPanelStore.getState as jest.Mock).mockReturnValue({
      activeSection: 'filters',
    });

    const { rerender } = renderHook(
      ({ shouldRenderGallery }: { shouldRenderGallery: boolean }) =>
        useForceLayoutSync({
          shouldRenderGallery,
          drawerAnimation,
          footerTranslateY,
        }),
      {
        initialProps: { shouldRenderGallery: false },
      }
    );

    // Change shouldRenderGallery to true
    rerender({ shouldRenderGallery: true });

    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(50);
    });

    // Execute callback setTimeout
    act(() => {
      jest.runAllTimers();
    });

    // When activeSection is 'filters':
    // drawerAnimation ends at -250 (from withTiming(-250, {duration: 0}))
    // footerTranslateY ends at -50 (from withTiming(-50, {duration: 0}))
    expect(drawerAnimation.value).toBe(-250);
    expect(footerTranslateY.value).toBe(-50);
  });

  it('clears timeout on unmount', () => {
    const { rerender, unmount } = renderHook(
      ({ shouldRenderGallery }: { shouldRenderGallery: boolean }) =>
        useForceLayoutSync({
          shouldRenderGallery,
          drawerAnimation,
          footerTranslateY,
        }),
      {
        initialProps: { shouldRenderGallery: false },
      }
    );

    rerender({ shouldRenderGallery: true });
    expect(jest.getTimerCount()).toBe(1);

    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
