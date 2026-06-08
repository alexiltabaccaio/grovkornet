import { SectionType, ModuleType } from './types';

export const SECTION_MODULES: Record<SectionType, readonly ModuleType[]> = {
  system: ['presets', 'theme', 'preferences', ...(__DEV__ ? ['debug' as const] : [])],
  lens: ['optics'],
  body: ['exposure', 'lighting', 'processing', 'capture'],
  film: ['tone', 'color', 'texture', 'artifacts', 'details'],
  none: ['none'],
};
