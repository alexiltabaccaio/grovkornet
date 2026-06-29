import { useSharedValue } from 'react-native-reanimated';
import { useControlPanelStore } from '@entities/system';

export const useCameraUIAnimations = () => {
  const initialActiveSection = useControlPanelStore.getState().activeSection;

  // These SharedValues are initialized once and passed down to the ControlPanel and CameraScreen.
  // Because they are instantiated here (outside the unmounting viewfinder/keyed Fragment),
  // they survive the unmount/remount cycle of the UI overlays on Activity resume.
  const drawerAnimation = useSharedValue(initialActiveSection === 'none' ? 0 : -250);
  const footerTranslateY = useSharedValue(initialActiveSection === 'none' ? 0 : -50);
  const viewfinderTranslateY = useSharedValue(0);
  
  // layoutSyncOffset provides a continuous micro-animation when the sheet is open
  // to force Android HWUI to retain reanimated transform/opacity properties across layout passes.
  const layoutSyncOffset = useSharedValue(0);

  return {
    drawerAnimation,
    footerTranslateY,
    viewfinderTranslateY,
    layoutSyncOffset,
  };
};
