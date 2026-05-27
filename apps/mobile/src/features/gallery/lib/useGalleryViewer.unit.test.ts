import { renderHook, act } from '@testing-library/react-native';
import { useGalleryViewer } from './useGalleryViewer';
import { useGalleryPhotos } from './useGalleryPhotos';
import { useImageVerification } from './useImageVerification';

jest.mock('./useGalleryPhotos');
jest.mock('./useImageVerification');

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

  it('verifies a temporary initial photo if initialUri is not found in photos list', () => {
    const initialUri = 'file:///other-path/new-photo.jpg';
    renderHook(() => useGalleryViewer(initialUri));

    expect(mockVerifyPhoto).toHaveBeenCalledWith({
      id: 'initial',
      uri: initialUri,
      filename: 'new-photo.jpg',
    });
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

  it('returns empty photos array if permission is not granted', () => {
    mockUseGalleryPhotos.mockReturnValue({
      photos: mockPhotos,
      setPhotos: mockSetPhotos,
      loading: false,
      permissionGranted: false,
    });

    const { result } = renderHook(() => useGalleryViewer(null));

    expect(result.current.photos).toEqual([]);
  });
});
