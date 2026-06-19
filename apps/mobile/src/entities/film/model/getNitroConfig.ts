import { type NitroCameraConfiguration } from '@grovkornet/engine';
import { NitroModules } from 'react-native-nitro-modules';
import { logger } from '@shared/lib/logger';

let nitroConfig: NitroCameraConfiguration | null = null;

export const getNitroConfig = (): NitroCameraConfiguration => {
  if (nitroConfig) return nitroConfig;
  try {
    nitroConfig = NitroModules.createHybridObject<NitroCameraConfiguration>('NitroCameraConfiguration');
    logger.info('Nitro', 'Successfully created NitroCameraConfiguration hybrid object!');
  } catch {
    logger.error('Nitro', 'Failed to create NitroCameraConfiguration hybrid object');
    // Return a dummy configuration object for test environments
    nitroConfig = { saturation: 1.0 } as unknown as NitroCameraConfiguration;
  }
  return nitroConfig;
};
