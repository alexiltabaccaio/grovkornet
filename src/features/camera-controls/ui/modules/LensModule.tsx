import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ParameterType, CameraCapabilities } from '@shared/types/camera';
import { FooterParameterControl } from '../FooterParameterControl';
import { footerStyles } from '../Footer.styles';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

interface LensModuleProps {
  activeParameter: ParameterType;
  setActiveParameter: (param: ParameterType) => void;
  capabilities: CameraCapabilities;
  cameraId: string;
  setCameraId: (id: string) => void;
  cameraAuto: boolean;
  setCameraAuto: (auto: boolean) => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const LensModule = ({
  activeParameter,
  setActiveParameter,
  capabilities,
  cameraId,
  setCameraId,
  cameraAuto,
  setCameraAuto,
  handlePressWithDouble,
}: LensModuleProps) => {
  const { t } = useTranslation();
  
  // Sincronizza il boolean nativo di React con l'attributo isAuto richiesto da FooterParameterControl
  const autoShared = useSharedValue(cameraAuto);
  React.useEffect(() => {
    autoShared.value = cameraAuto;
  }, [cameraAuto]);

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        {capabilities.availableCameras.map((cam) => (
          <FooterParameterControl
            key={cam.id}
            label={t('parameters.lens')}
            isActive={activeParameter === 'lens' && cameraId === cam.id}
            onPress={() => {
                setCameraId(cam.id);
                setActiveParameter('lens');
            }}
            variant="text"
            isAuto={autoShared}
            onLongPress={() => setCameraAuto(true)}
            staticText={`${cam.focalLength35mm}mm`}
          />
        ))}
      </View>
    </Animated.View>
  );
};
