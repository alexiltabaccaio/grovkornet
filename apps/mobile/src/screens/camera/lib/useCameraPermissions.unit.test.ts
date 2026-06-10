import { renderHook, act } from '@testing-library/react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import { useCameraPermissions } from './useCameraPermissions';
import { logger } from '@shared/lib/logger';

jest.mock('@shared/lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('useCameraPermissions', () => {
  const originalPlatformOS = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    Platform.OS = originalPlatformOS;
  });

  it('handles Platform.OS = ios without requesting PermissionsAndroid', () => {
    Platform.OS = 'ios';
    const requestSpy = jest.spyOn(PermissionsAndroid, 'request');

    const { result } = renderHook(() => useCameraPermissions());

    expect(requestSpy).not.toHaveBeenCalled();
    expect(result.current.hasPermission).toBe(true);
  });

  it('handles Platform.OS = android with GRANTED status', async () => {
    Platform.OS = 'android';
    const requestSpy = jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);

    const { result } = renderHook(() => useCameraPermissions());

    // Wait for the asynchronous effect
    await act(async () => {
      await Promise.resolve();
    });

    expect(requestSpy).toHaveBeenCalledWith(PermissionsAndroid.PERMISSIONS.CAMERA);
    expect(result.current.hasPermission).toBe(true);
  });

  it('handles Platform.OS = android with DENIED status', async () => {
    Platform.OS = 'android';
    const requestSpy = jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);

    const { result } = renderHook(() => useCameraPermissions());

    await act(async () => {
      await Promise.resolve();
    });

    expect(requestSpy).toHaveBeenCalledWith(PermissionsAndroid.PERMISSIONS.CAMERA);
    expect(result.current.hasPermission).toBe(false);
  });

  it('handles permission request rejection and logs error', async () => {
    Platform.OS = 'android';
    const requestSpy = jest.spyOn(PermissionsAndroid, 'request').mockRejectedValue(new Error('Permission system crash'));
    const mockLoggerError = logger.error as jest.Mock;

    const { result } = renderHook(() => useCameraPermissions());

    await act(async () => {
      await Promise.resolve();
    });

    expect(requestSpy).toHaveBeenCalledWith(PermissionsAndroid.PERMISSIONS.CAMERA);
    expect(result.current.hasPermission).toBe(false);
    expect(mockLoggerError).toHaveBeenCalledWith('CameraScreen', 'Camera permission error', expect.any(Error));
  });
});
