import { SectionType, ModuleType } from './types';

export const SECTION_MODULES: Record<SectionType, readonly ModuleType[]> = {
  system: ['presets', 'preferences'],
  lens: ['optics', 'flaws'],
  body: ['exposure', 'lighting', 'capture'],
  film: ['tone', 'color', 'texture', 'flaws'],
  none: ['none'],
};
