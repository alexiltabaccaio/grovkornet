import { useGalleryStore } from './useGalleryStore';

describe('useGalleryStore', () => {
  beforeEach(() => {
    useGalleryStore.setState({
      isOpen: false,
      latestPreviewUri: null,
      latestCapturedUri: null,
    });
  });

  it('initializes with default values', () => {
    const state = useGalleryStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.latestPreviewUri).toBeNull();
    expect(state.latestCapturedUri).toBeNull();
  });

  it('updates isOpen correctly', () => {
    const { setIsOpen } = useGalleryStore.getState();
    setIsOpen(true);
    expect(useGalleryStore.getState().isOpen).toBe(true);
  });

  it('sets latest preview uri correctly', () => {
    const { setLatestPreviewUri } = useGalleryStore.getState();
    setLatestPreviewUri('file:///test/preview.jpg');
    expect(useGalleryStore.getState().latestPreviewUri).toBe('file:///test/preview.jpg');
  });

  it('sets latest captured uri correctly and resets preview uri', () => {
    const { setLatestPreviewUri, setLatestCapturedUri } = useGalleryStore.getState();
    setLatestPreviewUri('file:///test/preview.jpg');
    setLatestCapturedUri('file:///test/captured.jpg');
    expect(useGalleryStore.getState().latestCapturedUri).toBe('file:///test/captured.jpg');
    expect(useGalleryStore.getState().latestPreviewUri).toBeNull();
  });

  describe('Zustand Persist Configuration', () => {
    it('partializes only necessary gallery storage state keys', () => {
      const persistOptions = (useGalleryStore as any).persist?.getOptions();
      expect(persistOptions).toBeDefined();
      
      const mockState = {
        isOpen: true,
        latestPreviewUri: 'file:///preview.jpg',
        latestCapturedUri: 'file:///captured.jpg',
      };
      
      const partialized = persistOptions.partialize(mockState);
      expect(partialized).toEqual({
        latestCapturedUri: 'file:///captured.jpg',
      });
    });
  });
});
