import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

// 1. Main full-width sliders: ScreenWidth - 2 * 24 (parent wrapper padding) - 2 * 24 (SliderThumb padding) - 54 (auto button) - 16 (margin) - 54 (value text) - 16 (margin) = ScreenWidth - 236
const initialMainWidth = screenWidth - 236;

// 2. Wide sub-sliders: ScreenWidth - 2 * 24 (SliderThumb padding) - 54 (auto placeholder) - 16 (margin) - 54 (value text) - 16 (margin) = ScreenWidth - 188
const initialSubFullWidth = screenWidth - 188;

// 3. Narrow sub-sliders (Grain): (ScreenWidth - 32 - 16) / 2 - 2 * 8 (SliderThumb padding) - 54 (value text) - 16 (margin) = (ScreenWidth - 48) / 2 - 86
const initialSubNarrowWidth = (screenWidth - 48) / 2 - 86;

export let globalMeasuredTrackWidth = initialMainWidth;
export let globalMainTrackWidth = initialMainWidth;
export let globalSubTrackWidth = initialSubNarrowWidth;
export let globalSubFullTrackWidth = initialSubFullWidth;

export const setGlobalMeasuredTrackWidth = (width: number) => {
  if (width > 0) {
    globalMeasuredTrackWidth = width;
  }
};

export const setGlobalMainTrackWidth = (width: number) => {
  if (width > 0) {
    globalMainTrackWidth = width;
    globalMeasuredTrackWidth = width;
  }
};

export const setGlobalSubTrackWidth = (width: number) => {
  if (width > 0) {
    globalSubTrackWidth = width;
  }
};

export const setGlobalSubFullTrackWidth = (width: number) => {
  if (width > 0) {
    globalSubFullTrackWidth = width;
  }
};
