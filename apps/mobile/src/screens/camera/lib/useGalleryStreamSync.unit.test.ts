import { renderHook, act } from '@testing-library/react-native';
import { useGalleryStreamSync } from './useGalleryStreamSync';

const mockPauseStream = jest.fn().mockResolvedValue(undefined);
const mockResumeStream = jest.fn().mockResolvedValue(undefined);

jest.mock('@grovkornet/engine', () => ({
  pauseStream: () => mockPauseStream(),
  resumeStream: () => mockResumeStream(),
}));

let mockReactionCallback: ((current: number, previous: number | null | undefined) => void) | null = null;

jest.mock('react-native-reanimated', () => {
  return {
    __esModule: true,
    runOnJS: (fn: any) => fn,
    useAnimatedReaction: (prepare: any, react: any) => {
      mockReactionCallback = react;
    },
  };
});

describe('useGalleryStreamSync', () => {
  beforeEach(() => {
    mockPauseStream.mockClear();
    mockResumeStream.mockClear();
    mockReactionCallback = null;
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
});
