import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSystemStore } from '../../model/useSystemStore';

interface ParameterPanelWrapperProps {
  animatedStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  gap?: number;
  paddingHorizontal?: number;
  scrollable?: boolean;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
}

export const ParameterPanelWrapper = ({
  animatedStyle,
  children,
  gap = 12,
  paddingHorizontal = 24,
  scrollable = false,
  leftAccessory,
  rightAccessory,
}: ParameterPanelWrapperProps) => {
  const isLayoutOverlayEnabled = useSystemStore(state => state.isLayoutOverlayEnabled);

  const renderRightAccessory = () => {
    if (rightAccessory) {
      return (
        <View style={styles.rightAccessoryContainer}>
          {rightAccessory}
        </View>
      );
    }
    if (leftAccessory && !scrollable) {
      return <View style={styles.rightPlaceholder} />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.parameterPanelContainer, animatedStyle]}>
        <View
          style={[
            styles.debugWrapper,
            isLayoutOverlayEnabled && {
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
              borderColor: 'green',
            },
          ]}
        >
          <View
            style={[
              styles.rowContainer,
              {
                paddingLeft: paddingHorizontal,
                paddingRight: scrollable && !rightAccessory ? 0 : paddingHorizontal,
              },
            ]}
          >
            {leftAccessory && (
              <View style={styles.leftAccessoryContainer}>
                {leftAccessory}
              </View>
            )}

            {scrollable ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                  styles.scrollContent,
                  { gap, paddingRight: rightAccessory ? 0 : paddingHorizontal },
                ]}
                style={styles.centerContainer}
              >
                {children}
              </ScrollView>
            ) : (
              <View style={[styles.buttonRow, { gap }]}>
                {children}
              </View>
            )}

            {renderRightAccessory()}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  parameterPanelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 5,
    paddingBottom: 0,
  },
  debugWrapper: {
    width: '100%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  leftAccessoryContainer: {
    width: 54,
    marginRight: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightAccessoryContainer: {
    width: 54,
    marginLeft: 16,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightPlaceholder: {
    width: 54,
    marginLeft: 16,
  },
  centerContainer: {
    flex: 1,
  },
  buttonRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
