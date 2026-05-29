const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const ERRORS_JSON_PATH = path.join(PROJECT_ROOT, 'packages/shared/camera-errors.json');

const FILE_PATHS = {
  tsErrors: 'packages/engine/src/errors.ts',
  kotlinErrors: 'packages/engine/android/src/main/java/com/grovkornet/nativefilmcamera/errors/CameraErrors.kt'
};

function main() {
  console.log(`Loading errors from: ${ERRORS_JSON_PATH}`);
  if (!fs.existsSync(ERRORS_JSON_PATH)) {
    throw new Error(`Errors JSON file not found at ${ERRORS_JSON_PATH}`);
  }

  const content = fs.readFileSync(ERRORS_JSON_PATH, 'utf8');
  let data;
  try {
    data = JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to parse camera-errors.json: ${err.message}`);
  }

  if (!data.errors || !Array.isArray(data.errors)) {
    throw new Error("Invalid schema: 'errors' array is required.");
  }

  const errors = data.errors;
  console.log(`Loaded ${errors.length} errors. Generating code...`);

  // 1. Generate TS Errors File
  const tsEnumEntries = errors.map(e => `  ${e.name} = '${e.name}',`).join('\n');
  const tsDetailsEntries = errors.map(e => {
    return `  [CameraErrorCode.${e.name}]: {
    code: ${e.code},
    severity: '${e.severity}',
    description: "${e.description.replace(/"/g, '\\"')}"
  },`;
  }).join('\n');

  const tsContent = `// Generated from camera-errors.json. Do not modify directly.

export enum CameraErrorCode {
${tsEnumEntries}
}

export interface CameraErrorDetail {
  code: number;
  severity: 'fatal' | 'warning';
  description: string;
}

export const CAMERA_ERROR_DETAILS: Record<CameraErrorCode, CameraErrorDetail> = {
${tsDetailsEntries}
};
`;

  // 2. Generate Kotlin Errors File
  const kotlinEnumEntries = errors.map((e, idx, arr) => {
    const comma = idx === arr.length - 1 ? ';' : ',';
    return `    ${e.name}(${e.code}, "${e.severity}")${comma}`;
  }).join('\n');

  const kotlinContent = `package com.grovkornet.nativefilmcamera.errors

// Generated from camera-errors.json. Do not modify directly.
enum class CameraErrorCode(val code: Int, val severity: String) {
${kotlinEnumEntries}
}
`;

  // Write TS File
  const tsPath = path.resolve(PROJECT_ROOT, FILE_PATHS.tsErrors);
  fs.mkdirSync(path.dirname(tsPath), { recursive: true });
  fs.writeFileSync(tsPath, tsContent, 'utf8');
  console.log(`Successfully generated TS errors: ${FILE_PATHS.tsErrors}`);

  // Write Kotlin File
  const kotlinPath = path.resolve(PROJECT_ROOT, FILE_PATHS.kotlinErrors);
  fs.mkdirSync(path.dirname(kotlinPath), { recursive: true });
  fs.writeFileSync(kotlinPath, kotlinContent, 'utf8');
  console.log(`Successfully generated Kotlin errors: ${FILE_PATHS.kotlinErrors}`);
}

try {
  main();
} catch (err) {
  console.error(`Codegen Failed: ${err.message}`);
  process.exit(1);
}
