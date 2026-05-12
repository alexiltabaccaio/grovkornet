import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SharedValue, 
  useDerivedValue 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Canvas, Rect, Shader, Skia } from '@shopify/react-native-skia';

import { TabType, ImageToolType } from '../types/camera';
import { FILM_GRAIN_SHADER } from '../shaders/FilmGrainShader';

const grainEffect = Skia.RuntimeEffect.Make(FILM_GRAIN_SHADER);

interface FooterProps {
  enabled: SharedValue<boolean>;
  activeImageTool: ImageToolType;
  onGrainToggle: (val: boolean) => void;
  onTabChange: (tab: TabType) => void;
  onImageToolChange: (tool: ImageToolType) => void;
  onResetTool: (tool: 'grain' | ImageToolType) => void;
}

export const Footer = ({
  enabled,
  activeImageTool,
  onGrainToggle,
  onTabChange,
  onImageToolChange,
  onResetTool
}: FooterProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('grain');
  const [isGrainEnabled, setIsGrainEnabled] = useState(false);
  const lastPressRef = useRef<{ [key: string]: number }>({});

  const handlePressWithDouble = (toolName: string, onSingle: () => void) => {
    const time = new Date().getTime();
    const lastTime = lastPressRef.current[toolName] || 0;
    if (time - lastTime < 300) {
      // Double press: reset value
      onResetTool(toolName as 'grain' | ImageToolType);
      lastPressRef.current[toolName] = 0;
    } else {
      // Single press
      onSingle();
      lastPressRef.current[toolName] = time;
    }
  };

  const uniforms = useDerivedValue(() => ({
    time: 0,
    resolution: [48, 48],
    intensity: 0.6,
  }));

  const handleToggle = (value: boolean) => {
    enabled.value = value;
    setIsGrainEnabled(value);
    onGrainToggle(value);
  };

  const handleTabChange = (tab: 'grain' | 'image') => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  return (
    <View style={styles.container}>
      {/* TOP FOOTER (CONTENT OF ACTIVE TAB) */}
      <View style={styles.topFooter}>
        {activeTab === 'grain' && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.tabContent}>
            <Pressable
              style={styles.filterThumb}
              onPress={() => handlePressWithDouble('grain', () => handleToggle(!isGrainEnabled))}
            >
              <View style={[
                styles.filterPlaceholder,
                isGrainEnabled && styles.filterPlaceholderActive
              ]}>
                {grainEffect && (
                  <Canvas style={styles.canvas}>
                    <Rect x={0} y={0} width={48} height={48}>
                      <Shader source={grainEffect} uniforms={uniforms} />
                    </Rect>
                  </Canvas>
                )}
              </View>
              <Text style={[
                styles.filterText,
                isGrainEnabled && styles.filterTextActive
              ]}>FILM GRAIN</Text>
            </Pressable>
          </Animated.View>
        )}

        {activeTab === 'image' && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.tabContent}>
            <View style={styles.imageToolsContainer}>
              <Pressable
                style={styles.filterThumb}
                onPress={() => handlePressWithDouble('saturation', () => onImageToolChange('saturation'))}
              >
                <View style={[
                  styles.filterPlaceholder,
                  activeImageTool === 'saturation' && styles.filterPlaceholderActive,
                  styles.iconPlaceholder
                ]}>
                  <Ionicons name="color-filter-outline" size={24} color={activeImageTool === 'saturation' ? "#FFF" : "#666"} />
                </View>
                <Text style={[
                  styles.filterText,
                  activeImageTool === 'saturation' && styles.filterTextActive
                ]}>SATURATION</Text>
              </Pressable>

              <Pressable
                style={styles.filterThumb}
                onPress={() => handlePressWithDouble('contrast', () => onImageToolChange('contrast'))}
              >
                <View style={[
                  styles.filterPlaceholder,
                  activeImageTool === 'contrast' && styles.filterPlaceholderActive,
                  styles.iconPlaceholder
                ]}>
                  <Ionicons name="contrast-outline" size={24} color={activeImageTool === 'contrast' ? "#FFF" : "#666"} />
                </View>
                <Text style={[
                  styles.filterText,
                  activeImageTool === 'contrast' && styles.filterTextActive
                ]}>CONTRAST</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </View>

      {/* BOTTOM FOOTER (PARENT TABS) */}
      <View style={styles.bottomFooter}>
        <Pressable
          style={styles.tabButton}
          onPress={() => handleTabChange('grain')}
          hitSlop={15}
        >
          <Ionicons name="apps-outline" size={24} color={activeTab === 'grain' ? "#FFF" : "#666"} />
          <Text style={[styles.tabLabel, activeTab === 'grain' && styles.tabLabelActive]}>GRAIN</Text>
        </Pressable>

        <Pressable
          style={styles.tabButton}
          onPress={() => handleTabChange('image')}
          hitSlop={15}
        >
          <Ionicons name="color-palette-outline" size={24} color={activeTab === 'image' ? "#FFF" : "#666"} />
          <Text style={[styles.tabLabel, activeTab === 'image' && styles.tabLabelActive]}>IMAGE</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  topFooter: {
    backgroundColor: '#000',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 16,
    paddingBottom: 0,
    minHeight: 80,
    justifyContent: 'center',
  },
  bottomFooter: {
    height: 90,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 10,
  },
  tabContent: {
    alignItems: 'center',
    width: '100%',
  },
  emptyContent: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageToolsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iconPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  infoText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tabLabel: {
    color: '#666',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: 1,
  },
  tabLabelActive: {
    color: '#FFF',
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterThumb: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  filterPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 0,
    backgroundColor: '#222',
    borderWidth: 2,
    borderColor: '#444',
    marginBottom: 8,
    overflow: 'hidden',
  },
  filterPlaceholderActive: {
    borderColor: '#FFF',
    backgroundColor: '#000',
  },
  canvas: {
    flex: 1,
  },
  filterText: {
    color: '#CCC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: '#FFF',
  },
});

