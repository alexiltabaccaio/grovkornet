import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { ParameterPanelWrapper } from '@entities/system';
import { useBodyStore } from '@entities/body';
import { usePreferencesStore } from '@entities/preferences';
import { PillButton } from '@shared/ui';

interface StabilizationPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

const StabilizationPanelComponent = ({ animatedStyle }: StabilizationPanelProps) => {
  const { t } = useTranslation();
  const { stabilizationModeShared, setStabilizationMode } = useBodyStore(
    useShallow((state) => ({
      stabilizationModeShared: state.stabilizationMode,
      setStabilizationMode: state.setStabilizationMode,
    }))
  );

  const [localStabilization, setLocalStabilization] = React.useState(() => stabilizationModeShared.value);

  useAnimatedReaction(
    () => stabilizationModeShared.value,
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setLocalStabilization)(currentValue);
      }
    },
    [stabilizationModeShared]
  );

  const handleSelect = (mode: number) => {
    setStabilizationMode(mode);
    setLocalStabilization(mode);
    usePreferencesStore.getState().setStabilizationModePref(mode);
  };

  return (
    <ParameterPanelWrapper animatedStyle={animatedStyle} gap={12} paddingHorizontal={16}>
      <PillButton
        label={t('parameters.stabilization_off')}
        isActive={localStabilization === 0}
        onPress={() => handleSelect(0)}
        style={styles.pressable}
      />
      <PillButton
        label={t('parameters.stabilization_standard')}
        isActive={localStabilization === 1}
        onPress={() => handleSelect(1)}
        style={styles.pressable}
      />
      <PillButton
        label={t('parameters.stabilization_action')}
        isActive={localStabilization === 2}
        onPress={() => handleSelect(2)}
        style={styles.pressable}
      />
    </ParameterPanelWrapper>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    maxWidth: 120,
  },
});

export const StabilizationPanel = React.memo(StabilizationPanelComponent);
