import { usePresetStore } from '@entities/preset';

let customizedThumbTimeout: NodeJS.Timeout | null = null;
let lastGenerationUri: string | null = null;
let isSubscriptionEnabled = process.env.NODE_ENV !== 'test';

export const enablePresetSubscriptionForTesting = () => {
  isSubscriptionEnabled = true;
};

export const disablePresetSubscriptionForTesting = () => {
  isSubscriptionEnabled = false;
};

export const clearPresetSubscriptionTimeout = () => {
  if (customizedThumbTimeout) {
    clearTimeout(customizedThumbTimeout);
    customizedThumbTimeout = null;
  }
};

const scheduleThumbnailGeneration = (filmPayload: NonNullable<ReturnType<typeof usePresetStore.getState>['customizedPayload']>['film']) => {
  if (customizedThumbTimeout) clearTimeout(customizedThumbTimeout);
  
  customizedThumbTimeout = setTimeout(() => {
    void (async () => {
      /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
      try {
        const { Asset } = require('expo-asset');
        const { generatePresetPreview, deleteFile } = require('@grovkornet/engine');
        const monoscopeAssetSource = require('../../../../assets/monoscope.jpg') as number;
        
        const asset = Asset.fromModule(monoscopeAssetSource);
        await asset.downloadAsync();
        const inputUri = (asset.localUri || asset.uri) as string | undefined;
        if (!inputUri) return;

        const uri = (await generatePresetPreview(inputUri, filmPayload)) as string;
        
        const currentUri = usePresetStore.getState().customizedThumbnailUri;
        if (currentUri && currentUri !== lastGenerationUri) {
          void deleteFile(currentUri);
        }
        
        lastGenerationUri = uri;
        usePresetStore.setState({ customizedThumbnailUri: uri });

      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        console.error('Failed to generate customized thumbnail:', error);
        if (error?.code) {
          const { CameraErrorCode, CAMERA_ERROR_DETAILS } = require('@grovkornet/engine') as {
            CameraErrorCode: Record<string, string>;
            CAMERA_ERROR_DETAILS: Record<string, { description: string }>;
          };
          if (Object.values(CameraErrorCode).includes(error.code)) {
            console.warn('Camera Error:', CAMERA_ERROR_DETAILS[error.code].description);
          }
        }
      }
      /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    })();
  }, 500); // 500ms debounce
};

export const initThumbnailGenerator = () => {
  const initialState = usePresetStore.getState();
  if (isSubscriptionEnabled && initialState.customizedPayload && !initialState.customizedThumbnailUri) {
    scheduleThumbnailGeneration(initialState.customizedPayload.film);
  }

  return usePresetStore.subscribe((state, prevState) => {
    if (!isSubscriptionEnabled) return;
    if (state.customizedPayload && state.customizedPayload !== prevState.customizedPayload) {
      scheduleThumbnailGeneration(state.customizedPayload.film);
    } else if (!state.customizedPayload && prevState.customizedPayload) {
      // cleanup when customized payload is reset
      if (customizedThumbTimeout) clearTimeout(customizedThumbTimeout);
      const currentUri = state.customizedThumbnailUri;
      if (currentUri) {
         /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
         const { deleteFile } = require('@grovkornet/engine');
         void deleteFile(currentUri);
         usePresetStore.setState({ customizedThumbnailUri: null });
         /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
      }
    }
  });
};
