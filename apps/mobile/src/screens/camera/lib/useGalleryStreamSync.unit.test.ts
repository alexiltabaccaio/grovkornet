import { renderHook, act } from '@testing-library/react-native';
import { useGalleryStreamSync } from './useGalleryStreamSync';
import { useAnimatedReaction } from 'react-native-reanimated';

const mockPauseStream = jest.fn().mockResolvedValue(undefined);
const mockResumeStream = jest.fn().mockResolvedValue(undefined);

jest.mock('@grovkornet/engine', () => ({
  pauseStream: () => mockPauseStream(),
  resumeStream: () => mockResumeStream(),
}));

let mockReactionCallback: ((current: number, previous: number | null | undefined) => void) | null = null;
let mockPrepareCallback: (() => any) | null = null;

jest.mock('react-native-reanimated', () => {
  return {
    __esModule: true,
    runOnJS: jest.fn((fn: any) => fn),
    useAnimatedReaction: jest.fn((prepare: any, react: any) => {
      mockReactionCallback = react;
      mockPrepareCallback = prepare;
    }),
  };
});

describe('useGalleryStreamSync', () => {
  beforeEach(() => {
    mockPauseStream.mockClear();
    mockResumeStream.mockClear();
    mockReactionCallback = null;
    mockPrepareCallback = null;
    jest.clearAllMocks();
  });

  it('resumes stream when gallery is closed', () => {
    const galleryTransition = { value: 0 };
    renderHook(() => useGalleryStreamSync(false, galleryTransition, 0));

    expect(mockResumeStream).toHaveBeenCalledTimes(1);
    expect(mockPauseStream).not.toHaveBeenCalled();
  });

  it('pauses stream immediately when gallery is already open and transition is 1', () => {
    const galleryTransition = { value: 1 };
    renderHook(() => useGalleryStreamSync(true, galleryTransition, 0));

    expect(mockPauseStream).toHaveBeenCalledTimes(1);
    expect(mockResumeStream).not.toHaveBeenCalled();
  });

  it('does not pause stream immediately if gallery is open but transition is not 1 (animating)', () => {
    const galleryTransition = { value: 0.5 };
    renderHook(() => useGalleryStreamSync(true, galleryTransition, 0));

    expect(mockPauseStream).not.toHaveBeenCalled();
    expect(mockResumeStream).not.toHaveBeenCalled();
  });

  it('pauses stream when animation reaches 1 via useAnimatedReaction', () => {
    const galleryTransition = { value: 0 };
    renderHook(() => useGalleryStreamSync(true, galleryTransition, 0));

    expect(mockReactionCallback).not.toBeNull();

    act(() => {
      if (mockReactionCallback) {
        mockReactionCallback(1, 0.9);
      }
    });

    expect(mockPauseStream).toHaveBeenCalledTimes(1);
  });

  it('resumes stream when animation starts closing from 1 via useAnimatedReaction', () => {
    const galleryTransition = { value: 1 };
    renderHook(() => useGalleryStreamSync(true, galleryTransition, 0));

    expect(mockReactionCallback).not.toBeNull();

    act(() => {
      if (mockReactionCallback) {
        mockReactionCallback(0.99, 1);
      }
    });

    expect(mockResumeStream).toHaveBeenCalledTimes(1);
  });

  it('calls useAnimatedReaction with correct prepare function and dependencies', () => {
    const galleryTransition = { value: 0.75 };
    renderHook(() => useGalleryStreamSync(true, galleryTransition, 0));

    expect(useAnimatedReaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      [galleryTransition]
    );

    expect(mockPrepareCallback).not.toBeNull();
    expect(mockPrepareCallback!()).toBe(0.75);
  });

  it('runs effect when dependencies change', () => {
    const { rerender } = renderHook(
      (props: { isOpen: boolean; galleryTransition: { value: number }; cameraKey: number }) =>
        useGalleryStreamSync(props.isOpen, props.galleryTransition, props.cameraKey),
      {
        initialProps: {
          isOpen: true,
          galleryTransition: { value: 0 },
          cameraKey: 0,
        },
      }
    );

    expect(mockPauseStream).not.toHaveBeenCalled();

    // Rerender with changed dependencies (new galleryTransition reference with value 1)
    rerender({
      isOpen: true,
      galleryTransition: { value: 1 },
      cameraKey: 0,
    });

    expect(mockPauseStream).toHaveBeenCalledTimes(1);
  });

  it('does not trigger pause/resume on non-target animation values', () => {
    const galleryTransition = { value: 0 };
    renderHook(() => useGalleryStreamSync(true, galleryTransition, 0));
    mockPauseStream.mockClear();
    mockResumeStream.mockClear();

    // Change to non-target value
    act(() => {
      mockReactionCallback?.(0.8, 0.7);
    });
    expect(mockPauseStream).not.toHaveBeenCalled();
    expect(mockResumeStream).not.toHaveBeenCalled();

    // Reaching 1 from 1 (should not trigger pause since previous was 1)
    act(() => {
      mockReactionCallback?.(1, 1);
    });
    expect(mockPauseStream).not.toHaveBeenCalled();
    expect(mockResumeStream).not.toHaveBeenCalled();

    // Falling below 1 but previous was not 1 (should not trigger resume)
    act(() => {
      mockReactionCallback?.(0.9, 0.9);
    });
    expect(mockPauseStream).not.toHaveBeenCalled();
    expect(mockResumeStream).not.toHaveBeenCalled();
  });
});
