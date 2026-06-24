import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useImageVerification } from './useImageVerification';
import { verifyGrovkornetAuthenticity } from '@grovkornet/engine';
import { useVerificationStore } from '@entities/verification';
import { GalleryItem } from './types';

jest.mock('@grovkornet/engine', () => ({
  verifyGrovkornetAuthenticity: jest.fn(),
}));

describe('useImageVerification', () => {
  beforeEach(() => {
    useVerificationStore.setState({ verifiedMap: {}, verifyingUris: {} });
    jest.clearAllMocks();
  });

  it('verifies photo authenticity successfully and writes to store', async () => {
    (verifyGrovkornetAuthenticity as jest.Mock).mockResolvedValueOnce(true);

    const { result } = renderHook(() => useImageVerification());

    const item: GalleryItem = { id: '1', uri: 'file:///test/1.jpg' };

    act(() => {
      void result.current.verifyPhoto(item);
    });

    expect(result.current.verifying).toBe(true);

    await waitFor(() => expect(result.current.verifying).toBe(false));

    expect(useVerificationStore.getState().verifiedMap['file:///test/1.jpg']).toBe(true);
    expect(result.current.selectedPhoto?.uri).toBe('file:///test/1.jpg');
  });

  it('handles verification failure gracefully and writes false to store', async () => {
    (verifyGrovkornetAuthenticity as jest.Mock).mockRejectedValueOnce(new Error('Verification failed'));

    const { result } = renderHook(() => useImageVerification());

    const item: GalleryItem = { id: '2', uri: 'file:///test/2.jpg' };

    act(() => {
      void result.current.verifyPhoto(item);
    });

    await waitFor(() => expect(result.current.verifying).toBe(false));

    expect(useVerificationStore.getState().verifiedMap['file:///test/2.jpg']).toBe(false);
  });

  it('skips verification if photo is already verified in store', () => {
    useVerificationStore.setState({
      verifiedMap: { 'file:///test/3.jpg': true },
    });

    const { result } = renderHook(() => useImageVerification());

    const item: GalleryItem = { id: '3', uri: 'file:///test/3.jpg' };

    act(() => {
      void result.current.verifyPhoto(item);
    });

    expect(result.current.verifying).toBe(false);
    expect(verifyGrovkornetAuthenticity).not.toHaveBeenCalled();
    expect(result.current.selectedPhoto?.uri).toBe('file:///test/3.jpg');
  });

  it('deduplicates concurrent calls to verifyPhoto for the same item', async () => {
    (verifyGrovkornetAuthenticity as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useImageVerification());

    const item: GalleryItem = { id: '4', uri: 'file:///test/4.jpg' };

    act(() => {
      void result.current.verifyPhoto(item);
      void result.current.verifyPhoto(item);
    });

    expect(result.current.verifying).toBe(true);

    await waitFor(() => expect(result.current.verifying).toBe(false));

    // verifyGrovkornetAuthenticity should only be called once because of deduplication
    expect(verifyGrovkornetAuthenticity).toHaveBeenCalledTimes(1);
    expect(verifyGrovkornetAuthenticity).toHaveBeenCalledWith('file:///test/4.jpg');
  });

  it('desynchronizes verifying state when verification is requested across different hook instances', async () => {
    let resolveVerification: (value: boolean) => void = () => {};
    (verifyGrovkornetAuthenticity as jest.Mock).mockImplementation(() => {
      return new Promise<boolean>((resolve) => {
        resolveVerification = resolve;
      });
    });

    const { result: resultA } = renderHook(() => useImageVerification());
    const { result: resultB } = renderHook(() => useImageVerification());

    const item: GalleryItem = { id: '5', uri: 'file:///test/5.jpg' };

    // Instance A starts verifying
    act(() => {
      void resultA.current.verifyPhoto(item);
    });

    expect(resultA.current.verifying).toBe(true);
    expect(resultB.current.verifying).toBe(false);

    // Instance B also selects and verifies the same photo (e.g. user selects it in B)
    act(() => {
      void resultB.current.verifyPhoto(item);
    });

    // BUG: B's verifying state is false because it returned early due to module-level queue,
    // so B does not know verification is happening. This is the assertion that will FAIL.
    expect(resultB.current.verifying).toBe(true);

    await act(async () => {
      resolveVerification(true);
      await Promise.resolve();
    });

    // Both should finish verifying and set verifying to false
    expect(resultA.current.verifying).toBe(false);
    expect(resultB.current.verifying).toBe(false);
  });
});
