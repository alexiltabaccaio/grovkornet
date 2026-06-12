import { renderHook, act } from '@testing-library/react-native';
import { useResetTool } from './useResetTool';
import { resetFilmParameter } from '@features/film-controls';
import { resetBodyParameter } from '@features/body-controls';
import { resetLensParameter } from '@features/lens-controls';

jest.mock('@features/film-controls', () => ({
  resetFilmParameter: jest.fn(),
}));

jest.mock('@features/body-controls', () => ({
  resetBodyParameter: jest.fn(),
}));

jest.mock('@features/lens-controls', () => ({
  resetLensParameter: jest.fn(),
}));

describe('useResetTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates to resetBodyParameter and stops chain if it handles the parameter', () => {
    (resetBodyParameter as jest.Mock).mockReturnValue(true);
    (resetLensParameter as jest.Mock).mockReturnValue(false);
    (resetFilmParameter as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useResetTool());

    act(() => {
      result.current('ev');
    });

    expect(resetBodyParameter).toHaveBeenCalledWith('ev');
    expect(resetLensParameter).not.toHaveBeenCalled();
    expect(resetFilmParameter).not.toHaveBeenCalled();
  });

  it('passes down the chain to resetLensParameter if body action cannot handle it', () => {
    (resetBodyParameter as jest.Mock).mockReturnValue(false);
    (resetLensParameter as jest.Mock).mockReturnValue(true);
    (resetFilmParameter as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useResetTool());

    act(() => {
      result.current('focus');
    });

    expect(resetBodyParameter).toHaveBeenCalledWith('focus');
    expect(resetLensParameter).toHaveBeenCalledWith('focus');
    expect(resetFilmParameter).not.toHaveBeenCalled();
  });

  it('passes down the chain to resetFilmParameter if both body and lens actions fail to handle it', () => {
    (resetBodyParameter as jest.Mock).mockReturnValue(false);
    (resetLensParameter as jest.Mock).mockReturnValue(false);
    (resetFilmParameter as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useResetTool());

    act(() => {
      result.current('grain');
    });

    expect(resetBodyParameter).toHaveBeenCalledWith('grain');
    expect(resetLensParameter).toHaveBeenCalledWith('grain');
    expect(resetFilmParameter).toHaveBeenCalledWith('grain');
  });

  it('does nothing if tool is none', () => {
    const { result } = renderHook(() => useResetTool());

    act(() => {
      result.current('none');
    });

    expect(resetBodyParameter).not.toHaveBeenCalled();
    expect(resetLensParameter).not.toHaveBeenCalled();
    expect(resetFilmParameter).not.toHaveBeenCalled();
  });
});
