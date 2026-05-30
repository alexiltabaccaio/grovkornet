import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore, useBodyWorklets } from '@entities/body';
import { useSystemStore } from '@entities/system';
import { PillButton } from '@shared/ui';
import * as Haptics from '@shared/lib/haptics';

export const ZoomControl = () => {
  const isDebugEnabled = useSystemStore((s) => s.isDebugEnabled);
  const { zoom, setZoom, capabilities } = useBodyStore(
    useShallow((state) => ({
      zoom: state.zoom,
      setZoom: state.setZoom,
      capabilities: state.capabilities,
    }))
  );

  const worklets = useBodyWorklets();

  const minZoom = capabilities.minZoom ?? 1.0;
  const maxZoom = capabilities.maxZoom ?? 1.0;

  // Declare hooks unconditionally at top level to satisfy React Rules of Hooks
  const is0_5Active = useDerivedValue(() => zoom.value === 0.5);
  const is1Active = useDerivedValue(() => zoom.value === 1.0);
  const is2Active = useDerivedValue(() => zoom.value === 2.0);
  const is3Active = useDerivedValue(() => zoom.value === 3.0);
  const is5Active = useDerivedValue(() => zoom.value === 5.0);
  const is10Active = useDerivedValue(() => zoom.value === 10.0);

  const activeMap: Record<number, SharedValue<boolean>> = {
    0.5: is0_5Active,
    1.0: is1Active,
    2.0: is2Active,
    3.0: is3Active,
    5.0: is5Active,
    10.0: is10Active,
  };

  // Define zoom options
  const defaultOptions = [0.5, 1.0, 2.0, 3.0, 5.0, 10.0];
  const options = defaultOptions.filter((opt) => opt >= minZoom && opt <= maxZoom);

  // Fallback if no options are in range (e.g. front camera where min=max=1.0)
  if (options.length === 0) {
    options.push(1.0);
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        {options.map((opt) => {
          const isActive = activeMap[opt] ?? is1Active;
          return (
            <PillButton
              key={`zoom-${opt}`}
              label={opt % 1 === 0 ? `${opt.toFixed(0)}x` : `${opt.toFixed(1)}x`}
              isActive={isActive}
              onPress={() => {
                void Haptics.selectionAsync();
                setZoom(opt);
                worklets.updateZoom(opt);
              }}
              isDebugEnabled={isDebugEnabled}
              style={styles.pressable}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressable: {
    width: 60,
  },
});
