import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface DebugThumbProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export const DebugThumb = ({ 
  label, 
  isActive, 
  onPress 
}: DebugThumbProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[
        styles.placeholder,
        isActive && styles.placeholderActive
      ]}>
        <Text style={[styles.statusText, isActive && styles.statusTextActive]}>
          {isActive ? 'ON' : 'OFF'}
        </Text>
      </View>
      <Text style={[styles.text, isActive && styles.textActive]}>
        {label.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  placeholder: {
    width: 48,
    height: 48,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#444',
    marginBottom: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderActive: {
    borderColor: '#FFF',
    backgroundColor: '#000',
  },
  statusText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '900',
  },
  statusTextActive: {
    color: '#FFF',
  },
  text: {
    color: '#CCC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textActive: {
    color: '#FFF',
  },
});
