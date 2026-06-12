const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const errorsCodegen = require('./errors');
const { PROJECT_ROOT } = require('./utils/config-loader');

test('Camera Errors Codegen generates expected outputs', (t) => {
  // Run generator
  errorsCodegen.main();

  // Define paths
  const tsPath = path.resolve(PROJECT_ROOT, 'packages/engine/src/errors.ts');
  const kotlinPath = path.resolve(PROJECT_ROOT, 'packages/engine/android/src/main/java/com/grovkornet/nativefilmcamera/errors/CameraErrors.kt');

  // Verify files exist
  assert.ok(fs.existsSync(tsPath), 'TS errors file should be created');
  assert.ok(fs.existsSync(kotlinPath), 'Kotlin errors file should be created');

  // Verify TS file content
  const tsContent = fs.readFileSync(tsPath, 'utf8');
  assert.match(tsContent, /export enum CameraErrorCode/, 'TS should export CameraErrorCode enum');
  assert.match(tsContent, /E_CAMERA_UNAUTHORIZED = 'E_CAMERA_UNAUTHORIZED'/, 'TS should contain E_CAMERA_UNAUTHORIZED');
  assert.match(tsContent, /export const CAMERA_ERROR_DETAILS/, 'TS should export CAMERA_ERROR_DETAILS');

  // Verify Kotlin file content
  const kotlinContent = fs.readFileSync(kotlinPath, 'utf8');
  assert.match(kotlinContent, /enum class CameraErrorCode/, 'Kotlin should define CameraErrorCode');
  assert.match(kotlinContent, /object CameraErrorFactory/, 'Kotlin should define CameraErrorFactory');
  assert.match(kotlinContent, /fun createCameraUnauthorized/, 'Kotlin should define factory method for CameraUnauthorized');
});
