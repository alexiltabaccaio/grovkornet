export type SectionType = 'system' | 'lens' | 'body' | 'film' | 'none';
export type ModuleType = 'preferences' | 'optics' | 'flaws' | 'exposure' | 'lighting' | 'capture' | 'development' | 'texture' | 'none';
export type ParameterType = 'presets' | 'language' | 'debug' | 'camera_selection' | 'focus' | 'chromatic_aberration' | 'bloom' | 'iso' | 'shutter_speed' | 'ev' | 'torch' | 'torch_strength' | 'aspect_ratio' | 'resolution_setting' | 'fps_setting' | 'temperature' | 'tint' | 'saturation' | 'contrast' | 'grain' | 'noise_reduction' | 'sharpening' | 'none';
export type ParameterDetailPanelType = 'grain_intensity' | 'grain_size' | 'grain_chroma' | 'torch_strength' | 'aberration_direction' | 'noise_reduction_mode' | 'lang_en' | 'lang_it' | 'none';

interface SystemState {
  activeSection: SectionType;
  activeModule: ModuleType;
  activeParameter: ParameterType;
  activeDetailPanel: ParameterDetailPanelType;
  isDebugEnabled: boolean;
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
}

interface SystemActions {
  setActiveSection: (section: SectionType) => void;
  setActiveModule: (module: ModuleType) => void;
  setActiveParameter: (param: ParameterType) => void;
  setActiveDetailPanel: (param: ParameterDetailPanelType) => void;
  setIsDebugEnabled: (enabled: boolean) => void;
  setIsLogsEnabled: (enabled: boolean) => void;
  setIsDetailPanelOpen: (open: boolean) => void;
  setIsCameraSecure: (enabled: boolean) => void;
  setIsTorchOn: (isOn: boolean) => void;
  triggerCapture: () => void;
  setLatestPreviewUri: (uri: string | null) => void;
  setLatestCapturedUri: (uri: string | null) => void;
}

export interface SystemStore extends SystemState, SystemActions {}
