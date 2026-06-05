import { type HybridObject } from 'react-native-nitro-modules';

export interface NitroCameraConfiguration extends HybridObject<{ ios: 'c++'; android: 'kotlin' }> {
  saturation: number;
}
