/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { FilmStore } from '@entities/film';
import { BodyStore } from '@entities/body';
import { FilmPresetPayload, BodyPresetPayload, GeneratedFilmExcludedKeys, GeneratedBodyExcludedKeys, GeneratedFilmActionKeys, GeneratedBodyActionKeys } from '@entities/preset';

// ============================================================================
// TypeScript Exhaustiveness Guards
// Ensures that every key in FilmStore and BodyStore is accounted for.
// Located in app layer to avoid cross-slice entity imports.
// ============================================================================

type FilmActionsKeys = GeneratedFilmActionKeys | 'setCapabilities';

type FilmExcludedKeys = 'capabilities' | GeneratedFilmExcludedKeys;

type IsFilmStoreFullyCategorized = Exclude<
  keyof FilmStore,
  keyof FilmPresetPayload | FilmActionsKeys | FilmExcludedKeys
> extends never
  ? true
  : never;

// This will trigger a TypeScript error if any key in FilmStore state is added without being categorized
const _assertFilmStoreCategorized: IsFilmStoreFullyCategorized = true;

type BodyActionsKeys = GeneratedBodyActionKeys | 'setDebugInfo' | 'setCapabilities';

type BodyExcludedKeys = 'capabilities' | GeneratedBodyExcludedKeys;

type IsBodyStoreFullyCategorized = Exclude<
  keyof BodyStore,
  keyof BodyPresetPayload | BodyActionsKeys | BodyExcludedKeys
> extends never
  ? true
  : never;

// This will trigger a TypeScript error if any key in BodyStore state is added without being categorized
const _assertBodyStoreCategorized: IsBodyStoreFullyCategorized = true;
