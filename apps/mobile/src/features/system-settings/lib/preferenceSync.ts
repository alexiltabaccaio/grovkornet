import { useLensStore, setLensStoreListener } from '@entities/lens';
import { usePreferencesStore } from '@entities/preferences';

let prefTimeout: NodeJS.Timeout | null = null;

export const initPreferenceSync = () => {
  setLensStoreListener(() => {
    if (prefTimeout) clearTimeout(prefTimeout);
    prefTimeout = setTimeout(() => {
      try {
        const lensState = useLensStore.getState();
        const prefActions = usePreferencesStore.getState();

        // Sync focusAuto
        const focusAutoVal = lensState.focusAuto.value;
        if (usePreferencesStore.getState().focusAuto !== focusAutoVal) {
          prefActions.setFocusAutoPref(focusAutoVal);
        }

        // Sync focusDistance
        const focusDistanceVal = lensState.focusDistance.value;
        if (usePreferencesStore.getState().focusDistance !== focusDistanceVal) {
          prefActions.setFocusDistancePref(focusDistanceVal);
        }

        // Sync cameraId
        const cameraIdVal = lensState.cameraId;
        if (usePreferencesStore.getState().cameraId !== cameraIdVal) {
          prefActions.setCameraIdPref(cameraIdVal);
        }

        // Sync cameraAuto
        const cameraAutoVal = lensState.cameraAuto;
        if (usePreferencesStore.getState().cameraAuto !== cameraAutoVal) {
          prefActions.setCameraAutoPref(cameraAutoVal);
        }
      } catch (e) {
        console.error('[preferenceSync] Failed to sync lens settings to preferences:', e);
      }
    }, 100);
  });
};
