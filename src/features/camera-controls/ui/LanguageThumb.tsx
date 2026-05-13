import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'react-native';

const enFlag = require('../../../../assets/flags/en.png');
const itFlag = require('../../../../assets/flags/it.png');

interface LanguageThumbProps {
  label: string;
  languageCode: 'en' | 'it';
  isActive: boolean;
  onPress: () => void;
}

export const LanguageThumb = ({ 
  label, 
  languageCode,
  isActive, 
  onPress 
}: LanguageThumbProps) => {
  const imageSource = languageCode === 'en' ? enFlag : itFlag;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={[
        styles.placeholder,
        isActive && styles.placeholderActive
      ]}>
        <Image 
          source={imageSource} 
          style={styles.image} 
          resizeMode="cover"
        />
      </View>
      <Text style={[styles.text, isActive && styles.textActive]}>
        {label.toUpperCase()}
      </Text>
    </Pressable>
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
  image: {
    width: '100%',
    height: '100%',
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
