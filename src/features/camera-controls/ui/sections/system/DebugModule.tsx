import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { DebugThumb } from '@shared/ui';
import { footerStyles } from '../../Footer.styles';

interface DebugModuleProps {
  isDebugEnabled: boolean;
  setIsDebugEnabled: (enabled: boolean) => void;
}

export const DebugModule = ({ isDebugEnabled, setIsDebugEnabled }: DebugModuleProps) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <DebugThumb
          label={t('modules.debug')}
          isActive={isDebugEnabled}
          onPress={() => setIsDebugEnabled(!isDebugEnabled)}
        />
      </View>
    </Animated.View>
  );
};
