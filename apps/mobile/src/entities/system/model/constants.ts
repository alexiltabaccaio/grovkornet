import { SectionType, ModuleType } from './types';

export const SECTION_MODULES: Record<SectionType, readonly ModuleType[]> = {
  system: ['presets', 'theme', 'preferences'],
  lens: ['optics'],
  body: ['exposure', 'lighting', 'processing', 'capture'],
  film: ['tone', 'color', 'texture', 'artifacts'],
  none: ['none'],
};
