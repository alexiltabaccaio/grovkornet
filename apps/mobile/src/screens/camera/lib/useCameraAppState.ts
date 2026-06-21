import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useControlPanelStore } from '@entities/system';

export const useCameraAppState = () => {
  const initialActiveSection = useControlPanelStore.getState().activeSection;
  const [cameraKey, setCameraKey] = useState(0);
  
  // These SharedValues are initialized once and passed down to the ControlPanel and CameraScreen.
  // Because they are instantiated here (outside the keyed Fragment), they survive the unmount/remount
  // cycle of the UI overlays on Activity resume. The freshly mounted native views will automatically 
  // read these current JS values, guaranteeing perfect synchronization without the need for timeout hacks.
  const drawerAnimation = useSharedValue(initialActiveSection === 'none' ? 0 : -250);
  const footerTranslateY = useSharedValue(initialActiveSection === 'none' ? 0 : -50);
  const viewfinderTranslateY = useSharedValue(0);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // We only want to increment cameraKey and remount native views when coming back
      // from the background. We ignore transitions from 'inactive' (like pulling down 
      // the notification shade) to prevent unwanted position resets.
      if (appState.current.match(/background/) && nextAppState === 'active') {
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
    drawerAnimation,
    footerTranslateY,
    viewfinderTranslateY,
  };
};
