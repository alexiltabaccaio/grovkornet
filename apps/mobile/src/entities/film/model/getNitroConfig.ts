import { type NitroCameraConfiguration } from '@grovkornet/engine';

let nitroConfig: NitroCameraConfiguration | null = null;

export const getNitroConfig = (): NitroCameraConfiguration => {
  if (nitroConfig) return nitroConfig;
  try {
    const { NitroModules } = require('react-native-nitro-modules');
    nitroConfig = NitroModules.createHybridObject('NitroCameraConfiguration');
    console.log('[Nitro] Successfully created NitroCameraConfiguration hybrid object!');
  } catch {
    console.error('[Nitro] Failed to create NitroCameraConfiguration hybrid object');
    // Return a dummy configuration object for test environments
    nitroConfig = { saturation: 1.0 } as any;
  }
  return nitroConfig!;
};
