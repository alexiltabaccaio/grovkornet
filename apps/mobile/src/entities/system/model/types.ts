export type SectionType = 'system' | 'lens' | 'body' | 'film' | 'none';
export type ModuleType = 'preferences' | 'presets' | 'theme' | 'optics' | 'artifacts' | 'exposure' | 'lighting' | 'processing' | 'capture' | 'tone' | 'color' | 'texture' | 'debug' | 'none';
export type ParameterType = 'presets' | 'language' | 'vibration' | 'ui_overlay' | 'temperature_test' | 'developer_options' | 'camera_selection' | 'focus' | 'chromatic_aberration' | 'bloom' | 'vignette' | 'iso' | 'shutter_speed' | 'ev' | 'torch' | 'torch_strength' | 'aspect_ratio' | 'resolution_setting' | 'fps_setting' | 'temperature' | 'tint' | 'saturation' | 'contrast' | 'blackLevel' | 'highlights' | 'pivot' | 'grain' | 'noise_reduction' | 'sharpening' | 'pixelation' | 'zoom' | 'chroma_shift' | 'tape_jitter' | 'scanlines' | 'hue' | 'none';
export type ParameterDetailPanelType = 'grain_intensity' | 'grain_size' | 'grain_chroma' | 'torch_strength' | 'aberration_direction' | 'noise_reduction_mode' | 'lang_en' | 'lang_it' | 'none';

interface SystemState {
  activeSection: SectionType;
  activeModule: ModuleType;
  activeParameter: ParameterType;
  activeDetailPanel: ParameterDetailPanelType;
  isFpsOverlayEnabled: boolean;
  isLayoutOverlayEnabled: boolean;
  isLogsEnabled: boolean;
  isDetailPanelOpen: boolean;
  isCapturing: boolean;
  isCameraSecure: boolean;
  isTorchOn: boolean;
  latestPreviewUri: string | null;
  latestCapturedUri: string | null;
  lastActiveModules: Record<SectionType, ModuleType>;
  lastActiveParameters: Record<ModuleType, ParameterType>;
  lastNonNoneSection: SectionType;
  lastNonNoneModule: ModuleType;
  thermalState: 'normal' | 'warning' | 'critical';
  isLowRam: boolean;
}

interface SystemActions {
  setActiveSection: (section: SectionType) => void;
  setActiveModule: (module: ModuleType) => void;
  setActiveParameter: (param: ParameterType) => void;
  setActiveDetailPanel: (param: ParameterDetailPanelType) => void;
  setIsFpsOverlayEnabled: (enabled: boolean) => void;
  setIsLayoutOverlayEnabled: (enabled: boolean) => void;
  setIsLogsEnabled: (enabled: boolean) => void;
  setIsDetailPanelOpen: (open: boolean) => void;
  setIsCameraSecure: (enabled: boolean) => void;
  setIsTorchOn: (isOn: boolean) => void;
  triggerCapture: () => void;
  setLatestPreviewUri: (uri: string | null) => void;
  setLatestCapturedUri: (uri: string | null) => void;
  setThermalState: (state: 'normal' | 'warning' | 'critical') => void;
  setIsLowRam: (isLowRam: boolean) => void;
}

export interface SystemStore extends SystemState, SystemActions {}
