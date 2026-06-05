import { Dimensions } from 'react-native';

const initialWidth = Dimensions.get('window').width - 188;

export let globalMeasuredTrackWidth = initialWidth;
export let globalMainTrackWidth = initialWidth;
export let globalSubTrackWidth = initialWidth;

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
