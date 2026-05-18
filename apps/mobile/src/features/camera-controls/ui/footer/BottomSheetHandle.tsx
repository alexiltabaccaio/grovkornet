import React from 'react';
import { StyleSheet, View } from 'react-native';

export const BottomSheetHandle = () => {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handle} />
    </View>
  );
};

const styles = StyleSheet.create({
  handleContainer: {
    width: '100%',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: -10, // Per avvicinarlo un po' al top
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
