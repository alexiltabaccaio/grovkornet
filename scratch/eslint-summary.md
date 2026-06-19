Total: 25 errors, 22 warnings across 25 files.

--- Details ---

📄 File: [apps\mobile\src\entities\film\lib\useFilmWorklets.ts](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/entities/film/lib/useFilmWorklets.ts)
  Warnings:
    - L994: [react-hooks/exhaustive-deps] React Hook useMemo has missing dependencies: 'config', 'hasWarnedNaN_blackLevel', 'hasWarnedNaN_bloomIntensity', 'hasWarnedNaN_boundBluePurple', 'hasWarnedNaN_boundCyanBlue', 'hasWarnedNaN_boundGreenCyan', 'hasWarnedNaN_boundMagentaRed', 'hasWarnedNaN_boundOrangeYellow', 'hasWarnedNaN_boundPurpleMagenta', 'hasWarnedNaN_boundRedOrange', 'hasWarnedNaN_boundYellowGreen', 'hasWarnedNaN_chromaShift', 'hasWarnedNaN_chromaShiftDirection', 'hasWarnedNaN_chromaticAberration', 'hasWarnedNaN_contrast', 'hasWarnedNaN_grainChroma', 'hasWarnedNaN_grainIntensity', 'hasWarnedNaN_grainRoughness', 'hasWarnedNaN_grainSize', 'hasWarnedNaN_grainSpeed', 'hasWarnedNaN_highlights', 'hasWarnedNaN_hue', 'hasWarnedNaN_hueBlue', 'hasWarnedNaN_hueCyan', 'hasWarnedNaN_hueGreen', 'hasWarnedNaN_hueMagenta', 'hasWarnedNaN_hueOrange', 'hasWarnedNaN_huePurple', 'hasWarnedNaN_hueRed', 'hasWarnedNaN_hueYellow', 'hasWarnedNaN_noiseReductionMode', 'hasWarnedNaN_pivot', 'hasWarnedNaN_pixelationFactor', 'hasWarnedNaN_satBlue', 'hasWarnedNaN_satCyan', 'hasWarnedNaN_satGreen', 'hasWarnedNaN_satMagenta', 'hasWarnedNaN_satOrange', 'hasWarnedNaN_satPurple', 'hasWarnedNaN_satRed', 'hasWarnedNaN_satYellow', 'hasWarnedNaN_saturation', 'hasWarnedNaN_scanlines', 'hasWarnedNaN_scanlinesDensity', 'hasWarnedNaN_scanlinesMode', 'hasWarnedNaN_sharpening', 'hasWarnedNaN_tapeJitter', 'hasWarnedNaN_temperature', 'hasWarnedNaN_tint', and 'hasWarnedNaN_vignetteIntensity'. Either include them or remove the dependency array.

📄 File: [apps\mobile\src\features\body-controls\ui\lighting\torch\TorchSubPanel.smoke.test.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/body-controls/ui/lighting/torch/TorchSubPanel.smoke.test.tsx)
  Warnings:
    - L38: [react-hooks/exhaustive-deps] React Hook React.useEffect has a missing dependency: 'props'. Either include it or remove the dependency array. However, 'props' will change when *any* prop changes, so the preferred fix is to destructure the 'props' object outside of the useEffect call and refer to those specific props inside React.useEffect.

📄 File: [apps\mobile\src\features\film-controls\lib\useSelectiveColor.ts](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/film-controls/lib/useSelectiveColor.ts)
  Warnings:
    - L227: [react-hooks/exhaustive-deps] React Hook useCallback has a missing dependency: 'setActiveColorIndex'. Either include it or remove the dependency array.

📄 File: [apps\mobile\src\features\film-controls\ui\color\ColorRangeSlider.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/film-controls/ui/color/ColorRangeSlider.tsx)
  Warnings:
    - L27: [unused-imports/no-unused-vars] 'INITIAL_TRACK_WIDTH' is assigned a value but never used. Allowed unused vars must match /^_/u.

📄 File: [apps\mobile\src\features\film-controls\ui\color\HueSubPanel.smoke.test.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/film-controls/ui/color/HueSubPanel.smoke.test.tsx)
  Warnings:
    - L116: [unused-imports/no-unused-vars] 'useSystemStore' is assigned a value but never used. Allowed unused vars must match /^_/u.

📄 File: [apps\mobile\src\features\film-controls\ui\color\SaturationSubPanel.smoke.test.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/film-controls/ui/color/SaturationSubPanel.smoke.test.tsx)
  Warnings:
    - L117: [unused-imports/no-unused-vars] 'useSystemStore' is assigned a value but never used. Allowed unused vars must match /^_/u.

📄 File: [apps\mobile\src\features\film-controls\ui\texture\grain\GrainSubPanel.smoke.test.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/film-controls/ui/texture/grain/GrainSubPanel.smoke.test.tsx)
  Errors:
    - L27: [@typescript-eslint/no-require-imports] A `require()` style import is forbidden.
    - L28: [@typescript-eslint/no-require-imports] A `require()` style import is forbidden.
    - L58: [@typescript-eslint/no-require-imports] A `require()` style import is forbidden.
    - L59: [@typescript-eslint/no-require-imports] A `require()` style import is forbidden.

📄 File: [apps\mobile\src\features\film-controls\ui\texture\scanlines\ScanlinesSubPanel.smoke.test.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/film-controls/ui/texture/scanlines/ScanlinesSubPanel.smoke.test.tsx)
  Errors:
    - L23: [@typescript-eslint/no-require-imports] A `require()` style import is forbidden.
    - L24: [@typescript-eslint/no-require-imports] A `require()` style import is forbidden.
    - L54: [@typescript-eslint/no-require-imports] A `require()` style import is forbidden.
    - L55: [@typescript-eslint/no-require-imports] A `require()` style import is forbidden.

📄 File: [apps\mobile\src\features\film-controls\ui\tone\ContrastSubPanel.smoke.test.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/film-controls/ui/tone/ContrastSubPanel.smoke.test.tsx)
  Errors:
    - L31: [@typescript-eslint/no-require-imports] A `require()` style import is forbidden.
    - L32: [@typescript-eslint/no-require-imports] A `require()` style import is forbidden.

📄 File: [apps\mobile\src\features\film-controls\ui\tone\ContrastSubPanel.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/film-controls/ui/tone/ContrastSubPanel.tsx)
  Warnings:
    - L18: [unused-imports/no-unused-vars] 'pivotAuto' is assigned a value but never used. Allowed unused vars must match /^_/u.

📄 File: [apps\mobile\src\features\gallery\lib\useImageVerification.unit.test.ts](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/gallery/lib/useImageVerification.unit.test.ts)
  Errors:
    - L91: [@typescript-eslint/require-await] Async arrow function has no 'await' expression.

📄 File: [apps\mobile\src\features\gallery\lib\usePhotoPreviewGestures.ts](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/gallery/lib/usePhotoPreviewGestures.ts)
  Warnings:
    - L34: [unused-imports/no-unused-vars] 'currentIndex' is defined but never used. Allowed unused args must match /^_/u.
    - L69: [react-hooks/exhaustive-deps] React Hook useEffect has missing dependencies: 'isZoomed', 'savedZoomScale', 'savedZoomTranslateX', 'savedZoomTranslateY', 'zoomScale', 'zoomTranslateX', and 'zoomTranslateY'. Either include them or remove the dependency array.

📄 File: [apps\mobile\src\features\gallery\lib\usePhotoPreviewGestures.unit.test.ts](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/gallery/lib/usePhotoPreviewGestures.unit.test.ts)
  Warnings:
    - L233: [unused-imports/no-unused-vars] 'result' is assigned a value but never used. Allowed unused vars must match /^_/u.

📄 File: [apps\mobile\src\features\gallery\lib\useRecentMediaThumbnail.ts](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/gallery/lib/useRecentMediaThumbnail.ts)
  Errors:
    - L17: [@typescript-eslint/no-explicit-any] Unexpected any. Specify a different type.

📄 File: [apps\mobile\src\features\gallery\ui\components\AnimatedSlot.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/gallery/ui/components/AnimatedSlot.tsx)
  Warnings:
    - L34: [unused-imports/no-unused-vars] 'initialUri' is defined but never used. Allowed unused args must match /^_/u.

📄 File: [apps\mobile\src\features\lens-controls\ui\GestureController.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/lens-controls/ui/GestureController.tsx)
  Warnings:
    - L48: [react-hooks/exhaustive-deps] React Hook React.useEffect has a missing dependency: 'activeSectionSV'. Either include it or remove the dependency array.
    - L64: [unused-imports/no-unused-vars] 'finished' is defined but never used. Allowed unused args must match /^_/u.
    - L123: [unused-imports/no-unused-vars] 'ftVal' is assigned a value but never used. Allowed unused vars must match /^_/u.
    - L124: [unused-imports/no-unused-vars] 'daVal' is assigned a value but never used. Allowed unused vars must match /^_/u.
    - L125: [unused-imports/no-unused-vars] 'aspectVal' is assigned a value but never used. Allowed unused vars must match /^_/u.
    - L154: [no-console] Unexpected console statement. Only these console methods are allowed: warn, error.
    - L245: [react-hooks/exhaustive-deps] React Hook useMemo has missing dependencies: 'activeSectionSV.value', 'getDynamicLimit', 'hasWarnedPanNaN', and 'isPanning'. Either include them or remove the dependency array.

📄 File: [apps\mobile\src\features\lens-controls\ui\GestureController.unit.test.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/lens-controls/ui/GestureController.unit.test.tsx)
  Errors:
    - L339: [react/no-children-prop] Do not pass children as props. Instead, nest children between the opening and closing tags.
    - L354: [react/no-children-prop] Do not pass children as props. Instead, nest children between the opening and closing tags.
  Warnings:
    - L31: [unused-imports/no-unused-vars] 'mockStartY' is assigned a value but never used. Allowed unused vars must match /^_/u.

📄 File: [apps\mobile\src\features\system-controls\ui\SystemParameterWheel.unit.test.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/system-controls/ui/SystemParameterWheel.unit.test.tsx)
  Errors:
    - L31: [@typescript-eslint/no-require-imports] A `require()` style import is forbidden.
    - L34: [@typescript-eslint/no-require-imports] A `require()` style import is forbidden.

📄 File: [apps\mobile\src\features\system-settings\lib\presetActions.ts](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/system-settings/lib/presetActions.ts)
  Errors:
    - L155: [@typescript-eslint/no-explicit-any] Unexpected any. Specify a different type.
    - L155: [@typescript-eslint/no-unsafe-member-access] Unsafe member access [k] on an `any` value.
    - L193: [@typescript-eslint/no-explicit-any] Unexpected any. Specify a different type.
    - L193: [@typescript-eslint/no-unsafe-member-access] Unsafe member access [k] on an `any` value.

📄 File: [apps\mobile\src\features\system-settings\ui\presets\AddPresetModal.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/system-settings/ui/presets/AddPresetModal.tsx)
  Warnings:
    - L113: [react-hooks/exhaustive-deps] React Hook useEffect has a missing dependency: 't'. Either include it or remove the dependency array.

📄 File: [apps\mobile\src\features\system-settings\ui\presets\PresetsPanel.unit.test.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/features/system-settings/ui/presets/PresetsPanel.unit.test.tsx)
  Warnings:
    - L106: [unused-imports/no-unused-vars] 'getByText' is assigned a value but never used. Allowed unused vars must match /^_/u.

📄 File: [apps\mobile\src\screens\camera\lib\useCameraPermissions.unit.test.ts](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/screens/camera/lib/useCameraPermissions.unit.test.ts)
  Errors:
    - L65: [@typescript-eslint/unbound-method] A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`.

📄 File: [apps\mobile\src\screens\camera\ui\CameraScreen.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/screens/camera/ui/CameraScreen.tsx)
  Errors:
    - L10: [unused-imports/no-unused-imports] 'useControlPanelStore' is defined but never used.

📄 File: [apps\mobile\src\shared\ui\resettable-label\ResettableLabel.unit.test.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/shared/ui/resettable-label/ResettableLabel.unit.test.tsx)
  Warnings:
    - L44: [unused-imports/no-unused-vars] 'queryByTestId' is assigned a value but never used. Allowed unused vars must match /^_/u.

📄 File: [apps\mobile\src\widgets\viewfinder\ui\DeviceHealthWarningBanner.tsx](file:///C:/Users/alexg/Documents/grovkornet/apps/mobile/src/widgets/viewfinder/ui/DeviceHealthWarningBanner.tsx)
  Errors:
    - L64: [react-hooks/refs] Error: Cannot access refs during render

React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef).

C:\Users\alexg\Documents\grovkornet\apps\mobile\src\widgets\viewfinder\ui\DeviceHealthWarningBanner.tsx:64:11
  62 |     if (!shouldShow) {
  63 |       setIsTextVisible(false);
> 64 |       if (timeoutRef.current) {
     |           ^^^^^^^^^^^^^^^^^^ Cannot access ref value during render
  65 |         clearTimeout(timeoutRef.current);
  66 |         timeoutRef.current = null;
  67 |       }
    - L65: [react-hooks/refs] Error: Cannot access refs during render

React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef).

C:\Users\alexg\Documents\grovkornet\apps\mobile\src\widgets\viewfinder\ui\DeviceHealthWarningBanner.tsx:65:22
  63 |       setIsTextVisible(false);
  64 |       if (timeoutRef.current) {
> 65 |         clearTimeout(timeoutRef.current);
     |                      ^^^^^^^^^^^^^^^^^^ Passing a ref to a function may read its value during render
  66 |         timeoutRef.current = null;
  67 |       }
  68 |     }
    - L66: [react-hooks/refs] Error: Cannot access refs during render

React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef).

C:\Users\alexg\Documents\grovkornet\apps\mobile\src\widgets\viewfinder\ui\DeviceHealthWarningBanner.tsx:66:9
  64 |       if (timeoutRef.current) {
  65 |         clearTimeout(timeoutRef.current);
> 66 |         timeoutRef.current = null;
     |         ^^^^^^^^^^^^^^^^^^ Cannot update ref during render
  67 |       }
  68 |     }
  69 |   }
