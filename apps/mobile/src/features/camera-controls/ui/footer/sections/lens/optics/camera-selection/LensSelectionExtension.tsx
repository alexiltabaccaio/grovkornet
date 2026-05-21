import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, Pressable } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterExtensionWrapper } from '@features/camera-controls/ui/footer/components/ParameterExtensionWrapper';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

interface LensSelectionExtensionProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

interface AutoButtonProps {
  cameraAuto: boolean;
  setCameraAuto: (auto: boolean) => void;
}

const AutoButton = ({ cameraAuto, setCameraAuto }: AutoButtonProps) => {
  const isDebugEnabled = useUIStore((s) => s.isDebugEnabled);

  const animatedStyle = useAnimatedStyle(() => {
    const isAuto = cameraAuto;
    return {
      borderColor: isAuto ? '#FF453A' : '#333',
      backgroundColor: isAuto ? 'rgba(255, 69, 58, 0.15)' : 'rgba(255, 255, 255, 0.04)',
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const isAuto = cameraAuto;
    return {
      color: isAuto ? '#FF453A' : '#888',
    };
  });

  return (
    <Pressable
      onPress={() => {
        setCameraAuto(!cameraAuto);
      }}
      style={styles.autoPressable}
    >
      <Animated.View style={[
        styles.pillButton,
        { width: 32 },
        animatedStyle,
        isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderColor: 'green' }
      ]}>
        <Animated.Text style={[styles.pillText, animatedTextStyle]}>
          A
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

interface CamButtonProps {
  cam: { id: string; focalLength35mm: number };
  cameraAuto: boolean;
  cameraId: string;
  setCameraId: (id: string) => void;
  setCameraAuto: (auto: boolean) => void;
}

const CamButton = ({ cam, cameraAuto, cameraId, setCameraId, setCameraAuto }: CamButtonProps) => {
  const isDebugEnabled = useUIStore((s) => s.isDebugEnabled);

  const animatedStyle = useAnimatedStyle(() => {
    const isSelected = !cameraAuto && cameraId === cam.id;
    return {
      borderColor: isSelected ? '#FFF' : '#333',
      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
      opacity: cameraAuto ? 0.4 : 1,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const isSelected = !cameraAuto && cameraId === cam.id;
    return {
      color: isSelected ? '#FFF' : '#888',
    };
  });

  return (
    <Pressable
      onPress={() => {
        setCameraAuto(false);
        setCameraId(cam.id);
      }}
      style={styles.pressable}
    >
      <Animated.View style={[
        styles.pillButton,
        animatedStyle,
        isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderColor: 'green' }
      ]}>
        <Animated.Text style={[styles.pillText, animatedTextStyle]}>
          {`${cam.focalLength35mm}mm`}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export const LensSelectionExtension = ({ parameterExtensionAnimatedStyle }: LensSelectionExtensionProps) => {
  const { capabilities, cameraId, setCameraId, cameraAuto, setCameraAuto } = useHardwareStore(useShallow(state => ({
    capabilities: state.capabilities,
    cameraId: state.cameraId,
    setCameraId: state.setCameraId,
    cameraAuto: state.cameraAuto,
    setCameraAuto: state.setCameraAuto,
  })));

  return (
    <ParameterExtensionWrapper animatedStyle={parameterExtensionAnimatedStyle}>
      <AutoButton cameraAuto={cameraAuto} setCameraAuto={setCameraAuto} />
      {capabilities.availableCameras.map(cam => (
        <CamButton
          key={cam.id}
          cam={cam}
          cameraAuto={cameraAuto}
          cameraId={cameraId}
          setCameraId={setCameraId}
          setCameraAuto={setCameraAuto}
        />
      ))}
    </ParameterExtensionWrapper>
  );
};

const styles = StyleSheet.create({
  autoPressable: {
    width: 32,
  },
  pressable: {
    flex: 1,
    maxWidth: 75,
  },
  pillButton: {
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
