import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const requireNode = createRequire(__filename);
const yamlPath = path.resolve(__dirname, '../../../../../../node_modules/yaml/dist/index.js');
const YAML = requireNode(yamlPath);
import { act } from '@testing-library/react-native';
import { useFilmStore } from '@entities/film';
import { useLensStore } from '@entities/lens';
import { useBodyStore } from '@entities/body';

describe('Parameter Sync & Zustand Stores Integration', () => {
  let parameters: any[] = [];

  beforeAll(() => {
    // Resolve path to packages/shared/camera-parameters folder from current directory
    const paramsDir = path.resolve(__dirname, '../../../../../../packages/shared/camera-parameters');
    const files = fs.readdirSync(paramsDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    parameters = [];
    files.forEach(file => {
      const content = fs.readFileSync(path.join(paramsDir, file), 'utf8');
      const parsed = YAML.parse(content);
      if (parsed && Array.isArray(parsed.parameters)) {
        parameters.push(...parsed.parameters);
      }
    });
  });

  it('loads parameters successfully', () => {
    expect(parameters.length).toBeGreaterThan(0);
  });

  it('validates that all arrayIndex configurations are unique and non-negative', () => {
    const renderAndTransientIndices = parameters
      .filter((p) => p.arrayIndex !== undefined)
      .map((p) => p.arrayIndex);

    const uniqueIndices = new Set(renderAndTransientIndices);

    expect(renderAndTransientIndices.length).toBe(uniqueIndices.size);

    renderAndTransientIndices.forEach((index) => {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(index)).toBe(true);
    });
  });

  it('verifies that each parameter mapped to Zustand has a valid store, state property, and setter', () => {
    parameters.forEach((param) => {
      if (!param.zustand) {
        return;
      }

      const storeName = param.zustand.store;
      let store: any;

      if (storeName === 'film') {
        store = useFilmStore;
      } else if (storeName === 'lens') {
        store = useLensStore;
      } else if (storeName === 'body') {
        store = useBodyStore;
      } else {
        throw new Error(`Unknown store name: ${storeName} for parameter ${param.name}`);
      }

      const propName = param.zustand.name || param.name;
      const setterName = `set${propName.charAt(0).toUpperCase()}${propName.slice(1)}`;

      const state = store.getState();

      // 1. Verify setter exists in store
      expect(state[setterName]).toBeDefined();
      expect(typeof state[setterName]).toBe('function');

      // 2. Verify state property exists in store
      expect(state[propName]).toBeDefined();

      // 3. Verify setter modifies state correctly
      // Determine dummy test value based on type
      let testValue: any;
      if (param.ts.type === 'boolean') {
        testValue = true;
      } else if (param.ts.type === 'number') {
        testValue = 99.5;
      } else if (param.ts.type === 'string') {
        testValue = 'test_string_value';
      } else {
        testValue = 42;
      }

      act(() => {
        state[setterName](testValue);
      });

      const updatedState = store.getState();
      const valueContainer = updatedState[propName];

      // Handle Reanimated SharedValue objects (mocked as { value: ... } under the hood)
      if (valueContainer && typeof valueContainer === 'object' && 'value' in valueContainer) {
        expect(valueContainer.value).toBe(testValue);
      } else {
        expect(updatedState[propName]).toBe(testValue);
      }
    });
  });
});
