import { DEFAULT_PRESET_PAYLOAD } from './apps/mobile/src/entities/preset';
import { useFilmStore } from './apps/mobile/src/entities/film';
import { useBodyStore } from './apps/mobile/src/entities/body';
import { snapshotCurrentPayload } from './apps/mobile/src/features/system-settings/lib/presetActions';

const EPSILON = 0.0001;

const arePayloadsEqual = (p1: any, p2: any): boolean => {
  const filmKeys = Object.keys(p1.film);
  for (const k of filmKeys) {
    const v1 = p1.film[k];
    const v2 = p2.film[k];
    if (typeof v1 === 'number' && typeof v2 === 'number') {
      if (Math.abs(v1 - v2) > EPSILON) {
        console.log(`Mismatch on film.${k}: ${v1} !== ${v2}`);
        return false;
      }
    } else {
      if (v1 !== v2) {
        console.log(`Mismatch on film.${k}: ${v1} !== ${v2}`);
        return false;
      }
    }
  }

  const bodyKeys = Object.keys(p1.body);
  for (const k of bodyKeys) {
    const v1 = p1.body[k];
    const v2 = p2.body[k];
    if (typeof v1 === 'number' && typeof v2 === 'number') {
      if (Math.abs(v1 - v2) > EPSILON) {
        console.log(`Mismatch on body.${k}: ${v1} !== ${v2}`);
        return false;
      }
    } else {
      if (v1 !== v2) {
        console.log(`Mismatch on body.${k}: ${v1} !== ${v2}`);
        return false;
      }
    }
  }

  return true;
};

// Test
const payload = snapshotCurrentPayload();
const isEqual = arePayloadsEqual(payload, DEFAULT_PRESET_PAYLOAD);
console.log('Is Equal to default?', isEqual);
