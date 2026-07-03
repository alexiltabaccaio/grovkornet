import { renderHook, act } from '@testing-library/react-native';
import { useGalleryPermissions } from './useGalleryPermissions';
import * as MediaLibrary from 'expo-media-library/legacy';

describe('useGalleryPermissions', () => {
  beforeEach(() => {
    jest.spyOn(global, 'setTimeout').mockImplementation(() => {
      return 1 as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('dovrebbe concedere i permessi se MediaLibrary li restituisce come granted', async () => {
    (MediaLibrary.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted', granted: true });
    
    const { result } = renderHook(() => useGalleryPermissions());
    const activeRef = { current: true };
    
    let granted;
    await act(async () => {
      granted = await result.current.checkAndRequestPermissions(activeRef);
    });

    expect(granted).toBe(true);
    expect(result.current.permissionGranted).toBe(true);
    expect(result.current.loadingPerms).toBe(false);
  });

  it('dovrebbe gestire la negazione dei permessi', async () => {
    (MediaLibrary.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied', granted: false });
    (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied', granted: false });

    const { result } = renderHook(() => useGalleryPermissions());
    const activeRef = { current: true };

    let granted;
    await act(async () => {
      granted = await result.current.checkAndRequestPermissions(activeRef);
    });

    expect(granted).toBe(false);
    expect(result.current.permissionGranted).toBe(false);
    expect(result.current.loadingPerms).toBe(false);
  });
});
