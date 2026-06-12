const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const eventsCodegen = require('./events');
const { PROJECT_ROOT } = require('./utils/config-loader');

test('Camera Events Codegen generates expected outputs', (t) => {
  // Run generator
  eventsCodegen.main();

  // Define paths
  const tsPath = path.resolve(PROJECT_ROOT, 'packages/engine/src/events.ts');
  const kotlinPath = path.resolve(PROJECT_ROOT, 'packages/engine/android/src/main/java/com/grovkornet/nativefilmcamera/events/CameraEvents.kt');
  const cppPath = path.resolve(PROJECT_ROOT, 'packages/engine/android/src/main/cpp/core/CameraEvents.h');

  // Verify files exist
  assert.ok(fs.existsSync(tsPath), 'TS events file should be created');
  assert.ok(fs.existsSync(kotlinPath), 'Kotlin events file should be created');
  assert.ok(fs.existsSync(cppPath), 'C++ events file should be created');

  // Verify TS file content
  const tsContent = fs.readFileSync(tsPath, 'utf8');
  assert.match(tsContent, /export interface OnDebugUpdateEvent/, 'TS should export OnDebugUpdateEvent');
  assert.match(tsContent, /export interface OnExposureUpdateEvent/, 'TS should export OnExposureUpdateEvent');
  assert.match(tsContent, /export interface GeneratedCameraViewEvents/, 'TS should export GeneratedCameraViewEvents');
  assert.match(tsContent, /availableCameras: OnCapabilitiesUpdateEventAvailableCamerasItem\[\];/, 'TS should type availableCameras correctly');

  // Verify Kotlin file content
  const kotlinContent = fs.readFileSync(kotlinPath, 'utf8');
  assert.match(kotlinContent, /object CameraEvents/, 'Kotlin should define CameraEvents object');
  assert.match(kotlinContent, /fun createOnDebugUpdate/, 'Kotlin should define createOnDebugUpdate');
  assert.match(kotlinContent, /fun createOnExposureUpdate/, 'Kotlin should define createOnExposureUpdate');
  assert.match(kotlinContent, /fun createOnCapabilitiesUpdateAvailableCamerasItem/, 'Kotlin should define createOnCapabilitiesUpdateAvailableCamerasItem');

  // Verify C++ file content
  const cppContent = fs.readFileSync(cppPath, 'utf8');
  assert.match(cppContent, /struct OnDebugUpdateEvent/, 'C++ should define struct OnDebugUpdateEvent');
  assert.match(cppContent, /enum class ThermalState/, 'C++ should define enum class ThermalState');
  assert.match(cppContent, /inline jobject toJNI\(JNIEnv\* env, const OnDebugUpdateEvent& event\)/, 'C++ should define toJNI for OnDebugUpdateEvent');
  assert.match(cppContent, /inline void dispatchJsiEvent/, 'C++ should define dispatchJsiEvent for JSI');
});
