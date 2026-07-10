## Description
Provide a brief summary of the changes introduced by this Pull Request and their motivation.

## Checklist
Before submitting this PR, please check the following:

- [ ] **Feature-Sliced Design (FSD)**: My changes strictly adhere to FSD guidelines.
  - [ ] No circular dependencies.
  - [ ] No direct relative imports crossing slice boundaries (imports use path aliases `@features/...`).
  - [ ] Exports are exposed through slice root `index.ts` files.
- [ ] **Code Generation**: I have updated the JSON files (e.g. `camera-parameters.json`, `camera-errors.json`) and run `npm run codegen` instead of writing boilerplate code manually (if applicable).
- [ ] **GraphRAG**: I have queried GraphRAG to check the impact of architectural modifications (if modifying shared packages or core modules).
- [ ] **Performance**: 
  - [ ] Continuous event handlers run in Worklets (contain `'worklet';`).
  - [ ] Camera components rely only on `NativeFilmCamera`.
  - [ ] Used `useCallback`, `useMemo`, and `React.memo` where necessary to avoid dropped frames.
- [ ] **State & Localisation**:
  - [ ] I avoided monolithic stores, keeping Zustand stores small and atomic.
  - [ ] No hardcoded text. Used `react-i18next` for UI strings.
- [ ] **Tests**:
  - [ ] I have run local unit tests (`npm run test`).
  - [ ] (Optional) Mutation testing was verified where necessary.

## Testing & Verification
Describe how you verified these changes (e.g., ran on Android physical device, simulator, web, etc.). Provide screenshots/recordings if applicable.
