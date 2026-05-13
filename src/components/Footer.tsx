import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SharedValue, 
  useDerivedValue,
  useAnimatedStyle
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Canvas, Rect, Shader, Skia } from '@shopify/react-native-skia';

import { TabType, ParameterType, ModuleType } from '../types/camera';
import { FILM_GRAIN_SHADER } from '../shaders/FilmGrainShader';

const grainEffect = Skia.RuntimeEffect.Make(FILM_GRAIN_SHADER);

interface FooterProps {
  enabled: SharedValue<boolean>;
  grainIntensity: SharedValue<number>;
  saturation: SharedValue<number>;
  contrast: SharedValue<number>;
  activeTab: TabType;
  activeModule: ModuleType;
  activeParameter: ParameterType;
  onGrainToggle: (val: boolean) => void;
  onTabChange: (tab: TabType) => void;
  onModuleChange: (module: ModuleType) => void;
  onParameterChange: (tool: ParameterType) => void;
  onResetTool: (tool: 'grain' | ParameterType) => void;
}

export const Footer = ({
  enabled,
  grainIntensity,
  saturation,
  contrast,
  activeTab,
  activeModule,
  activeParameter,
  onGrainToggle,
  onTabChange,
  onModuleChange,
  onParameterChange,
  onResetTool
}: FooterProps) => {
  const lastPressRef = useRef<{ [key: string]: number }>({});

  const handlePressWithDouble = (toolName: string, onSingle: () => void) => {
    const time = new Date().getTime();
    const lastTime = lastPressRef.current[toolName] || 0;
    if (time - lastTime < 300) {
      // Double press: reset value
      onResetTool(toolName as 'grain' | ParameterType);
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

  const saturationFillStyle = useAnimatedStyle(() => {
    return {
      height: `${(saturation.value / 2.0) * 100}%`,
    };
  });

  const contrastFillStyle = useAnimatedStyle(() => {
    return {
      height: `${(contrast.value / 2.0) * 100}%`,
    };
  });

  const grainFillStyle = useAnimatedStyle(() => {
    return {
      height: `${Math.min(Math.max(grainIntensity.value * 100, 0), 100)}%`,
    };
  });


  const handleTabChange = (tab: TabType) => {
    const newTab = activeTab === tab ? 'none' : tab;
    if (newTab === 'color') onModuleChange('color_grading');
    else if (newTab === 'tape') onModuleChange('grain');
    else onModuleChange('none'); // Reset module for lens, crt, or none
    onTabChange(newTab);
  };

  return (
    <View style={styles.container}>
      {/* TOP FOOTER (CONTENT OF ACTIVE TAB) */}
      {activeTab !== 'none' && (
        <View style={styles.topFooter}>
          
          {/* PILL MENU (LEVEL 2) */}
          {(activeTab === 'color' || activeTab === 'tape') && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.pillMenuContainer}
              style={styles.pillMenuWrapper}
            >
              {activeTab === 'color' && (
                <>
                  <Pressable style={[styles.pill, activeModule === 'color_grading' && styles.pillActive]} onPress={() => onModuleChange('color_grading')}>
                    <Text style={[styles.pillText, activeModule === 'color_grading' && styles.pillTextActive]}>Color Grading</Text>
                  </Pressable>
                  <Pressable style={[styles.pill, activeModule === 'fade' && styles.pillActive]} onPress={() => onModuleChange('fade')}>
                    <Text style={[styles.pillText, activeModule === 'fade' && styles.pillTextActive]}>Fade</Text>
                  </Pressable>
                </>
              )}
              {activeTab === 'tape' && (
                <>
                  <Pressable style={[styles.pill, activeModule === 'grain' && styles.pillActive]} onPress={() => onModuleChange('grain')}>
                    <Text style={[styles.pillText, activeModule === 'grain' && styles.pillTextActive]}>Grana</Text>
                  </Pressable>
                  <Pressable style={[styles.pill, activeModule === 'jitter' && styles.pillActive]} onPress={() => onModuleChange('jitter')}>
                    <Text style={[styles.pillText, activeModule === 'jitter' && styles.pillTextActive]}>Jitter</Text>
                  </Pressable>
                  <Pressable style={[styles.pill, activeModule === 'dropouts' && styles.pillActive]} onPress={() => onModuleChange('dropouts')}>
                    <Text style={[styles.pillText, activeModule === 'dropouts' && styles.pillTextActive]}>Dropouts</Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          )}

          {/* PARAMETERS (LEVEL 3) */}
          {activeModule === 'grain' && (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.tabContent}>
              <Pressable
                style={styles.filterThumb}
                onPress={() => handlePressWithDouble('grain', () => onParameterChange('grain'))}
              >
                <View style={[
                  styles.filterPlaceholder,
                  activeParameter === 'grain' && styles.filterPlaceholderActive
                ]}>
                  <Animated.View style={[styles.progressFill, grainFillStyle]} />
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
                  activeParameter === 'grain' && styles.filterTextActive
                ]}>AMOUNT</Text>
              </Pressable>
            </Animated.View>
          )}

          {activeModule === 'color_grading' && (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.tabContent}>
              <View style={styles.imageToolsContainer}>
                <Pressable
                  style={styles.filterThumb}
                  onPress={() => handlePressWithDouble('saturation', () => onParameterChange('saturation'))}
                >
                  <View style={[
                    styles.filterPlaceholder,
                    activeParameter === 'saturation' && styles.filterPlaceholderActive,
                    styles.iconPlaceholder
                  ]}>
                    <Animated.View style={[styles.progressFill, saturationFillStyle]} />
                    <Ionicons name="color-filter-outline" size={24} color={activeParameter === 'saturation' ? "#FFF" : "#666"} style={{ zIndex: 1 }} />
                  </View>
                  <Text style={[
                    styles.filterText,
                    activeParameter === 'saturation' && styles.filterTextActive
                  ]}>SATURATION</Text>
                </Pressable>

                <Pressable
                  style={styles.filterThumb}
                  onPress={() => handlePressWithDouble('contrast', () => onParameterChange('contrast'))}
                >
                  <View style={[
                    styles.filterPlaceholder,
                    activeParameter === 'contrast' && styles.filterPlaceholderActive,
                    styles.iconPlaceholder
                  ]}>
                    <Animated.View style={[styles.progressFill, contrastFillStyle]} />
                    <Ionicons name="contrast-outline" size={24} color={activeParameter === 'contrast' ? "#FFF" : "#666"} style={{ zIndex: 1 }} />
                  </View>
                  <Text style={[
                    styles.filterText,
                    activeParameter === 'contrast' && styles.filterTextActive
                  ]}>CONTRAST</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {(activeModule !== 'grain' && activeModule !== 'color_grading') && (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.tabContent}>
              <View style={styles.emptyContent}>
                <Text style={styles.infoText}>COMING SOON</Text>
              </View>
            </Animated.View>
          )}
        </View>
      )}

      {/* BOTTOM FOOTER (PARENT TABS) */}
      <View style={styles.bottomFooter}>
        <Pressable
          style={styles.tabButton}
          onPress={() => handleTabChange('settings')}
          hitSlop={15}
        >
          <Ionicons name="cog-outline" size={24} color={activeTab === 'settings' ? "#FFF" : "#666"} />
          <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>SETTINGS</Text>
        </Pressable>

        <Pressable
          style={styles.tabButton}
          onPress={() => handleTabChange('lens')}
          hitSlop={15}
        >
          <Ionicons name="aperture-outline" size={24} color={activeTab === 'lens' ? "#FFF" : "#666"} />
          <Text style={[styles.tabLabel, activeTab === 'lens' && styles.tabLabelActive]}>LENS</Text>
        </Pressable>

        <Pressable
          style={styles.tabButton}
          onPress={() => handleTabChange('color')}
          hitSlop={15}
        >
          <Ionicons name="color-palette-outline" size={24} color={activeTab === 'color' ? "#FFF" : "#666"} />
          <Text style={[styles.tabLabel, activeTab === 'color' && styles.tabLabelActive]}>COLOR</Text>
        </Pressable>

        <Pressable
          style={styles.tabButton}
          onPress={() => handleTabChange('tape')}
          hitSlop={15}
        >
          <Ionicons name="film-outline" size={24} color={activeTab === 'tape' ? "#FFF" : "#666"} />
          <Text style={[styles.tabLabel, activeTab === 'tape' && styles.tabLabelActive]}>TAPE</Text>
        </Pressable>

        <Pressable
          style={styles.tabButton}
          onPress={() => handleTabChange('crt')}
          hitSlop={15}
        >
          <Ionicons name="tv-outline" size={24} color={activeTab === 'crt' ? "#FFF" : "#666"} />
          <Text style={[styles.tabLabel, activeTab === 'crt' && styles.tabLabelActive]}>CRT</Text>
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
    zIndex: 100,
  },
  topFooter: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 10,
    paddingBottom: 0,
    height: 120,
    justifyContent: 'flex-end',
  },
  bottomFooter: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 24,
  },
  tabContent: {
    alignItems: 'center',
    width: '100%',
    height: 65,
    justifyContent: 'center',
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
    textAlign: 'center',
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
    marginBottom: 6,
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
  pillMenuWrapper: {
    maxHeight: 35,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  pillMenuContainer: {
    alignItems: 'center',
    paddingRight: 32, // for scroll padding
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#222',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#FFF',
  },
  pillText: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#000',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff9800',
    opacity: 0.3,
  },
});

