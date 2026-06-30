export type SectionType = 'system' | 'lens' | 'body' | 'film' | 'none';
export type ModuleType = 'preferences' | 'presets' | 'theme' | 'optics' | 'optical_effects' | 'artifacts' | 'exposure' | 'lighting' | 'processing' | 'capture' | 'tone' | 'color' | 'texture' | 'details' | 'debug' | 'none';
export type ParameterType = 'presets' | 'language' | 'vibration' | 'ui_overlay' | 'temperature_test' | 'developer_options' | 'camera_selection' | 'focus' | 'chromatic_aberration' | 'bloom' | 'vignette' | 'iso' | 'shutter_speed' | 'ev' | 'torch' | 'torch_strength' | 'aspect_ratio' | 'resolution_setting' | 'fps_setting' | 'temperature' | 'tint' | 'saturation' | 'contrast' | 'blackLevel' | 'highlights' | 'pivot' | 'grain' | 'noise_reduction' | 'sharpening' | 'pixelation' | 'zoom' | 'chroma_shift' | 'tape_jitter' | 'scanlines' | 'hue' | 'lens_distortion' | 'halation' | 'none';
export type ParameterDetailPanelType = 'grain_intensity' | 'grain_size' | 'grain_chroma' | 'torch_strength' | 'aberration_direction' | 'noise_reduction_mode' | 'lang_en' | 'lang_it' | 'none';

export interface SystemState {
  isFpsOverlayEnabled: boolean;
  isLayoutOverlayEnabled: boolean;
  isLogsEnabled: boolean;
}

export interface SystemActions {
  setIsFpsOverlayEnabled: (enabled: boolean) => void;
  setIsLayoutOverlayEnabled: (enabled: boolean) => void;
  setIsLogsEnabled: (enabled: boolean) => void;
}

export interface SystemStore extends SystemState, SystemActions {}
