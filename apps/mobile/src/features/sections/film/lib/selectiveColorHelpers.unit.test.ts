import { getAdjacentBoundIndices, COLORS, DEFAULT_BOUNDS } from './selectiveColorHelpers';

describe('selectiveColorHelpers', () => {
  it('dovrebbe calcolare correttamente gli indici dei bound adiacenti per un dato indice colore', () => {
    expect(getAdjacentBoundIndices(0)).toEqual([0, 1]); // Red -> boundMagentaRed e boundRedOrange
    expect(getAdjacentBoundIndices(1)).toEqual([1, 2]); // Orange -> boundRedOrange e boundOrangeYellow
    expect(getAdjacentBoundIndices(7)).toEqual([7, 0]); // Magenta -> boundPurpleMagenta e boundMagentaRed
  });

  it('dovrebbe definire 8 colori e 8 bounds di default', () => {
    expect(COLORS).toHaveLength(8);
    expect(DEFAULT_BOUNDS).toHaveLength(8);
  });
});
