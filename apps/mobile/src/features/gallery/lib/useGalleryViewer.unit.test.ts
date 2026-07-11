import { renderHook, act } from '@testing-library/react-native';
import { useGalleryViewer } from './useGalleryViewer';
import { useGalleryPhotos } from './useGalleryPhotos';
import { useImageVerification } from './useImageVerification';
import { useVerificationStore } from '@entities/verification';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library/legacy';

jest.mock('./useGalleryPhotos');
jest.mock('./useImageVerification');
jest.mock('expo-file-system', () => ({
  deleteAsync: jest.fn(),
}));
jest.mock('expo-media-library/legacy', () => ({
  deleteAssetsAsync: jest.fn(),
}));

describe('useGalleryViewer', () => {
  const mockUseGalleryPhotos = useGalleryPhotos as jest.Mock;
  const mockUseImageVerification = useImageVerification as jest.Mock;
  const mockVerifyPhoto = jest.fn();
  const mockSetPhotos = jest.fn();

  const mockPhotos = [
    { id: 'photo-1', uri: 'file:///images/photo1.jpg', filename: 'photo1.jpg' },
    { id: 'photo-2', uri: 'file:///images/photo2.jpg', filename: 'photo2.jpg' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useVerificationStore.setState({ verifiedMap: {}, verifyingUris: {} });
    mockUseGalleryPhotos.mockReturnValue({
      photos: mockPhotos,
      setPhotos: mockSetPhotos,
      loading: false,
      permissionGranted: true,
    });
    mockUseImageVerification.mockReturnValue({
      selectedPhoto: null,
      verifyPhoto: mockVerifyPhoto,
    });
  });

  it('selects the first photo by default if no initialUri is provided', () => {
    renderHook(() => useGalleryViewer(null));

    expect(mockVerifyPhoto).toHaveBeenCalledWith(mockPhotos[0]);
  });

  it('does not select a photo if loading is true', () => {
    mockUseGalleryPhotos.mockReturnValue({
      photos: mockPhotos,
      setPhotos: mockSetPhotos,
      loading: true,
      permissionGranted: true,
    });

    renderHook(() => useGalleryViewer(null));

    expect(mockVerifyPhoto).not.toHaveBeenCalled();
  });

  it('does not select a photo if photos list is empty', () => {
    mockUseGalleryPhotos.mockReturnValue({
      photos: [],
      setPhotos: mockSetPhotos,
      loading: false,
      permissionGranted: true,
    });

    renderHook(() => useGalleryViewer(null));

    expect(mockVerifyPhoto).not.toHaveBeenCalled();
  });

  it('selects photo matching initialUri exactly by uri', () => {
    const initialUri = 'file:///images/photo2.jpg';
    renderHook(() => useGalleryViewer(initialUri));

    expect(mockVerifyPhoto).toHaveBeenCalledWith(mockPhotos[1]);
  });

  it('selects photo matching initialUri by filename/id when full uri differs', () => {
    const initialUri = 'file:///other-path/photo2.jpg';
    renderHook(() => useGalleryViewer(initialUri));

    expect(mockVerifyPhoto).toHaveBeenCalledWith(mockPhotos[1]);
  });

  it('migrates verified state when auto-selecting photo matching initialUri by filename/id with different full uri', () => {
    const initialUri = 'file:///other-path/photo2.jpg';
    const finalUri = 'file:///images/photo2.jpg';
    
    useVerificationStore.getState().setVerified(initialUri, true);
    
    renderHook(() => useGalleryViewer(initialUri));

    expect(mockVerifyPhoto).toHaveBeenCalledWith(mockPhotos[1]);
    expect(useVerificationStore.getState().verifiedMap[finalUri]).toBe(true);
  });

  it('verifies a temporary initial photo if initialUri is not found in photos list', () => {
    const initialUri = 'file:///other-path/new-photo.jpg';
    renderHook(() => useGalleryViewer(initialUri));

    expect(mockVerifyPhoto).toHaveBeenCalledWith({
      id: 'initial',
      uri: initialUri,
      filename: 'new-photo.jpg',
    });
  });

  it('synchronously migrates temp preview to final capture when initialUri changes', () => {
    const tempUri = 'file:///data/preview-123.jpg';
    const finalUri = 'file:///storage/GVK-123.jpg';

    // Initial render with temp URI
    mockUseGalleryPhotos.mockReturnValue({
      photos: [{ id: 'preview-temp', uri: tempUri, filename: 'preview-123.jpg' }],
      setPhotos: mockSetPhotos,
      loading: false,
      permissionGranted: true,
    });
    mockUseImageVerification.mockReturnValue({
      selectedPhoto: { id: 'preview-temp', uri: tempUri, filename: 'preview-123.jpg' },
      verifyPhoto: mockVerifyPhoto,
    });

    const { rerender } = renderHook(
      (props: { initialUri: string }) => useGalleryViewer(props.initialUri),
      { initialProps: { initialUri: tempUri } }
    );

    // Re-render hook with final URI (simulate store/prop update)
    rerender({ initialUri: finalUri });

    // Verify it updated the photos array immediately replacing the temp one
    expect(mockSetPhotos).toHaveBeenCalled();
    const updateFn = mockSetPhotos.mock.calls[0][0];
    const originalPhotos = [{ id: 'preview-temp', uri: tempUri, filename: 'preview-123.jpg' }];
    const updatedPhotos = updateFn(originalPhotos);
    expect(updatedPhotos[0].uri).toBe(finalUri);

    // Verify verifyPhoto was immediately called with the new migrated final item
    expect(mockVerifyPhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        uri: finalUri,
      })
    );
  });

  it('removes temp preview entirely if the final capture is already present in the photos list', () => {
    const tempUri = 'file:///data/preview-123.jpg';
    const finalUri = 'file:///storage/GVK-123.jpg';

    // Initial render with temp URI
    mockUseGalleryPhotos.mockReturnValue({
      photos: [
        { id: 'preview-temp', uri: tempUri, filename: 'preview-123.jpg' },
        { id: 'GVK-123.jpg', uri: finalUri, filename: 'GVK-123.jpg' }
      ],
      setPhotos: mockSetPhotos,
      loading: false,
      permissionGranted: true,
    });
    mockUseImageVerification.mockReturnValue({
      selectedPhoto: { id: 'preview-temp', uri: tempUri, filename: 'preview-123.jpg' },
      verifyPhoto: mockVerifyPhoto,
    });

    const { rerender } = renderHook(
      (props: { initialUri: string }) => useGalleryViewer(props.initialUri),
      { initialProps: { initialUri: tempUri } }
    );

    // Re-render hook with final URI (simulate store/prop update)
    rerender({ initialUri: finalUri });

    // Verify it updated the photos array immediately removing the temp one
    expect(mockSetPhotos).toHaveBeenCalled();
    const updateFn = mockSetPhotos.mock.calls[0][0];
    const originalPhotos = [
      { id: 'preview-temp', uri: tempUri, filename: 'preview-123.jpg' },
      { id: 'GVK-123.jpg', uri: finalUri, filename: 'GVK-123.jpg' }
    ];
    const updatedPhotos = updateFn(originalPhotos);
    expect(updatedPhotos).toHaveLength(1);
    expect(updatedPhotos[0].uri).toBe(finalUri);
  });

  it('updates selection when onPhotoVisible is called with a new photo', () => {
    mockUseImageVerification.mockReturnValue({
      selectedPhoto: mockPhotos[0],
      verifyPhoto: mockVerifyPhoto,
    });

    const { result } = renderHook(() => useGalleryViewer(null));

    act(() => {
      result.current.onPhotoVisible(mockPhotos[1]);
    });

    expect(mockVerifyPhoto).toHaveBeenLastCalledWith(mockPhotos[1]);
  });

  it('does not update selection when onPhotoVisible is called with the already selected photo', () => {
    mockUseImageVerification.mockReturnValue({
      selectedPhoto: mockPhotos[0],
      verifyPhoto: mockVerifyPhoto,
    });

    const { result } = renderHook(() => useGalleryViewer(null));

    act(() => {
      result.current.onPhotoVisible(mockPhotos[0]);
    });

    // Not called because photo is already selected
    expect(mockVerifyPhoto).toHaveBeenCalledTimes(0);
  });

  it('verifies selected photo when onSelectPhoto is called', () => {
    mockUseImageVerification.mockReturnValue({
      selectedPhoto: mockPhotos[0],
      verifyPhoto: mockVerifyPhoto,
    });

    const { result } = renderHook(() => useGalleryViewer(null));

    act(() => {
      result.current.onSelectPhoto(mockPhotos[1]);
    });

    expect(mockVerifyPhoto).toHaveBeenLastCalledWith(mockPhotos[1]);
  });

  it('returns permissionGranted status correctly', () => {
    mockUseGalleryPhotos.mockReturnValue({
      photos: mockPhotos,
      setPhotos: mockSetPhotos,
      loading: false,
      permissionGranted: false,
    });

    const { result } = renderHook(() => useGalleryViewer(null));

    expect(result.current.permissionGranted).toBe(false);
    expect(result.current.photos).toEqual(mockPhotos);
  });

  describe('onDeletePhoto', () => {
    const mockDeleteAsync = FileSystem.deleteAsync as jest.Mock;
    const mockDeleteAssetsAsync = MediaLibrary.deleteAssetsAsync as jest.Mock;
    const mockOnClose = jest.fn();

    beforeEach(() => {
      mockDeleteAsync.mockReset();
      mockDeleteAssetsAsync.mockReset();
      mockOnClose.mockReset();
    });

    it('deletes temporary photo using FileSystem and updates selection', async () => {
      const tempPhoto = { id: 'preview-temp', uri: 'file:///data/preview.jpg' };
      mockUseGalleryPhotos.mockReturnValue({
        photos: [tempPhoto, mockPhotos[1]],
        setPhotos: mockSetPhotos,
        loading: false,
        permissionGranted: true,
      });

      const { result } = renderHook(() => useGalleryViewer(tempPhoto.uri, mockOnClose));

      await act(async () => {
        await result.current.onDeletePhoto(tempPhoto);
      });

      expect(mockDeleteAsync).toHaveBeenCalledWith(tempPhoto.uri, { idempotent: true });
      expect(mockDeleteAssetsAsync).not.toHaveBeenCalled();
      expect(mockVerifyPhoto).toHaveBeenCalledWith(mockPhotos[1]);
      expect(mockSetPhotos).toHaveBeenCalled();
    });

    it('deletes persistent asset using MediaLibrary and updates selection to next photo', async () => {
      mockUseGalleryPhotos.mockReturnValue({
        photos: [mockPhotos[0], mockPhotos[1]],
        setPhotos: mockSetPhotos,
        loading: false,
        permissionGranted: true,
      });

      mockDeleteAssetsAsync.mockResolvedValue(true);

      const { result } = renderHook(() => useGalleryViewer(null, mockOnClose));

      await act(async () => {
        await result.current.onDeletePhoto(mockPhotos[0]);
      });

      expect(mockDeleteAssetsAsync).toHaveBeenCalledWith([mockPhotos[0].id]);
      expect(mockVerifyPhoto).toHaveBeenCalledWith(mockPhotos[1]);
      expect(mockSetPhotos).toHaveBeenCalled();
    });

    it('deletes last persistent asset and updates selection to previous photo', async () => {
      mockUseGalleryPhotos.mockReturnValue({
        photos: [mockPhotos[0], mockPhotos[1]],
        setPhotos: mockSetPhotos,
        loading: false,
        permissionGranted: true,
      });

      mockDeleteAssetsAsync.mockResolvedValue(true);

      const { result } = renderHook(() => useGalleryViewer(null, mockOnClose));

      await act(async () => {
        await result.current.onDeletePhoto(mockPhotos[1]);
      });

      expect(mockDeleteAssetsAsync).toHaveBeenCalledWith([mockPhotos[1].id]);
      expect(mockVerifyPhoto).toHaveBeenCalledWith(mockPhotos[0]);
      expect(mockSetPhotos).toHaveBeenCalled();
    });

    it('closes the gallery and clears photos when deleting the last remaining photo', async () => {
      mockUseGalleryPhotos.mockReturnValue({
        photos: [mockPhotos[0]],
        setPhotos: mockSetPhotos,
        loading: false,
        permissionGranted: true,
      });

      mockDeleteAssetsAsync.mockResolvedValue(true);

      const { result } = renderHook(() => useGalleryViewer(null, mockOnClose));

      await act(async () => {
        await result.current.onDeletePhoto(mockPhotos[0]);
      });

      expect(mockDeleteAssetsAsync).toHaveBeenCalledWith([mockPhotos[0].id]);
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockSetPhotos).toHaveBeenCalledWith([]);
    });

    it('does not update state if user cancels the MediaLibrary deletion', async () => {
      mockUseGalleryPhotos.mockReturnValue({
        photos: [mockPhotos[0], mockPhotos[1]],
        setPhotos: mockSetPhotos,
        loading: false,
        permissionGranted: true,
      });

      mockDeleteAssetsAsync.mockResolvedValue(false); // User cancelled

      const { result } = renderHook(() => useGalleryViewer(null, mockOnClose));

      await act(async () => {
        await result.current.onDeletePhoto(mockPhotos[0]);
      });

      expect(mockDeleteAssetsAsync).toHaveBeenCalledWith([mockPhotos[0].id]);
      expect(mockSetPhotos).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('gracefully handles deletion errors', async () => {
      mockUseGalleryPhotos.mockReturnValue({
        photos: [mockPhotos[0]],
        setPhotos: mockSetPhotos,
        loading: false,
        permissionGranted: true,
      });

      mockDeleteAssetsAsync.mockRejectedValue(new Error('Test deletion error'));

      const { result } = renderHook(() => useGalleryViewer(null, mockOnClose));

      await act(async () => {
        await result.current.onDeletePhoto(mockPhotos[0]);
      });

      expect(mockSetPhotos).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
