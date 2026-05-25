import { Dimensions } from 'react-native';

export let globalMeasuredTrackWidth = Dimensions.get('window').width - 188;

export const setGlobalMeasuredTrackWidth = (width: number) => {
  if (width > 0) {
    globalMeasuredTrackWidth = width;
  }
};
