import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useCameraAppState = () => {
  const [cameraKey, setCameraKey] = useState(0);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // We only want to increment cameraKey and remount native views when coming back
      // from the background. We ignore transitions from 'inactive' (like pulling down 
      // the notification shade) to prevent unwanted position resets.
      if (appState.current?.match?.(/background/) && nextAppState === 'active') {
        setCameraKey((prev) => prev + 1);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    cameraKey,
  };
};

