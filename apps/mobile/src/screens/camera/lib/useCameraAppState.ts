import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const nextIsActive = nextAppState === 'active';
      if (nextIsActive) {
        // Incrementing the cameraKey causes the UI overlays (wrapped in a React.Fragment in CameraScreen) 
        // to cleanly unmount and remount. This is a robust React pattern to handle Android's Activity 
        // recreation and layout shifts, avoiding complex imperative Reanimated sync hacks.
        setCameraKey((prev) => prev + 1);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    cameraKey,
    drawerAnimation,
    footerTranslateY,
  };
};
