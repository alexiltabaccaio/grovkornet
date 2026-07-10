import { scanDirectory } from '../src/core/Scanner.js';
import { parseFile } from '../src/core/Parser.js';
import * as typescriptLang from '../src/languages/typescript.js';
import * as kotlinLang from '../src/languages/kotlin.js';
import * as cppLang from '../src/languages/cpp.js';
import { Query } from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, 'fixtures');
const files = scanDirectory(fixturesDir);

// 1. Test scanning
console.log("Found files:", files.map(f => path.basename(f)));
if (files.length !== 5) {
  console.error(`❌ Test Failed: expected 5 files, found ${files.length}`);
  process.exit(1);
}
console.log("✅ Scan Directory passed.");

// 2. Test path resolution
const storeFile = files.find(f => f.endsWith('store.ts'));
const utilsFile = files.find(f => f.endsWith('utils.ts'));

console.log(`Testing resolver for: ${path.basename(storeFile)} importing './utils'`);
const resolved = typescriptLang.resolve(storeFile, './utils');
console.log("Resolved path:", resolved);

if (resolved !== utilsFile) {
  console.error(`❌ Test Failed: expected resolver to find ${utilsFile}, but got ${resolved}`);
  process.exit(1);
}
console.log("✅ Resolve Import passed.");

// 3. Test AST Queries for Export and Import
const exportQuery = new Query(TypeScript.tsx, `
  (export_statement
    declaration: (lexical_declaration
      (variable_declarator
        name: (identifier) @export_name)))
`);

const tree = parseFile(utilsFile);
const matches = exportQuery.matches(tree.rootNode);
console.log(`Found ${matches.length} exports in utils.ts`);

let foundAdd = false;
for (const match of matches) {
  for (const capture of match.captures) {
    if (capture.name === 'export_name' && capture.node.text === 'add') {
      foundAdd = true;
    }
  }
}

if (!foundAdd) {
  console.error("❌ Test Failed: expected to find export 'add' in utils.ts");
  process.exit(1);
}
console.log("✅ AST Query Export passed.");

// 4. Test Kotlin parsing
console.log("\n---- Testing Kotlin Parser ----");
const kotlinFile = files.find(f => f.endsWith('CameraView.kt'));
if (!kotlinFile) {
  console.error("❌ Test Failed: expected to find CameraView.kt in fixtures");
  process.exit(1);
}
console.log("Found Kotlin fixture:", path.basename(kotlinFile));

const ktTree = parseFile(kotlinFile);
const ktDefinitions = kotlinLang.extractDefinitions(ktTree);
console.log("Kotlin definitions:", [...ktDefinitions]);

if (!ktDefinitions.has('com.grovkornet.nativefilmcamera.ui.CameraView')) {
  console.error("❌ Test Failed: expected to find com.grovkornet.nativefilmcamera.ui.CameraView definition");
  process.exit(1);
}

const ktDependencies = kotlinLang.extractDependencies(ktTree);
console.log("Kotlin dependencies:", ktDependencies);

const hasEngineImport = ktDependencies.some(d => d.source === 'com.grovkornet.nativefilmcamera.camera.CameraEngine');
const hasJniDep = ktDependencies.some(d => d.source === 'jni:com.grovkornet.nativefilmcamera.ui.CameraView.nativePrepare' && d.isJni);

if (!hasEngineImport || !hasJniDep) {
  console.error("❌ Test Failed: missing expected imports or JNI dependencies in Kotlin file");
  process.exit(1);
}
console.log("✅ Kotlin parser AST checks passed.");

// 5. Test Kotlin path resolver (using a real file in codebase)
console.log("Testing Kotlin resolver for: com.grovkornet.nativefilmcamera.ui.NativeFilmCameraView");
const resolvedKt = kotlinLang.resolve(kotlinFile, 'com.grovkornet.nativefilmcamera.ui.NativeFilmCameraView');
console.log("Resolved Kotlin path:", resolvedKt);
if (!resolvedKt || !resolvedKt.endsWith('NativeFilmCameraView.kt') || !fs.existsSync(resolvedKt)) {
  console.error("❌ Test Failed: could not resolve NativeFilmCameraView");
  process.exit(1);
}
console.log("✅ Kotlin resolver passed.");

// 6. Test C++ parsing
console.log("\n---- Testing C++ Parser ----");
const cppFile = files.find(f => f.endsWith('Renderer.cpp'));
const hFile = files.find(f => f.endsWith('Renderer.h'));
if (!cppFile || !hFile) {
  console.error("❌ Test Failed: expected to find Renderer.cpp and Renderer.h in fixtures");
  process.exit(1);
}
console.log("Found C++ fixtures:", path.basename(cppFile), "and", path.basename(hFile));

const cppTree = parseFile(cppFile);
const cppDefinitions = cppLang.extractDefinitions(cppTree);
console.log("C++ definitions:", [...cppDefinitions]);

if (!cppDefinitions.has('jni:com.grovkornet.nativefilmcamera.rendering.OffscreenFilmProcessor.nativePrepare')) {
  console.error("❌ Test Failed: expected JNI symbol in C++ definitions");
  process.exit(1);
}

const cppDependencies = cppLang.extractDependencies(cppTree);
console.log("C++ dependencies:", cppDependencies);

const hasHeaderInclude = cppDependencies.some(d => d.source === 'Renderer.h');
const hasVectorInclude = cppDependencies.some(d => d.source.includes('vector'));

if (!hasHeaderInclude || hasVectorInclude) {
  console.error("❌ Test Failed: incorrect preprocessor includes in C++ dependencies");
  process.exit(1);
}
console.log("✅ C++ parser AST checks passed.");

// 7. Test C++ resolver
console.log("Testing C++ resolver for relative: Renderer.h");
const resolvedRelativeCpp = cppLang.resolve(cppFile, 'Renderer.h');
console.log("Resolved relative path:", resolvedRelativeCpp);
if (resolvedRelativeCpp !== hFile) {
  console.error("❌ Test Failed: could not resolve relative include Renderer.h");
  process.exit(1);
}

console.log("Testing C++ resolver for real include: core/FrameRenderer.h");
const resolvedRealCpp = cppLang.resolve(cppFile, 'core/FrameRenderer.h');
console.log("Resolved C++ path:", resolvedRealCpp);
if (!resolvedRealCpp || !resolvedRealCpp.endsWith('FrameRenderer.h') || !fs.existsSync(resolvedRealCpp)) {
  console.error("❌ Test Failed: could not resolve real include core/FrameRenderer.h");
  process.exit(1);
}
console.log("✅ C++ resolver passed.");

// 8. Test Regex Fallback Parsers
console.log("\n---- Testing Regex Fallback Parsers ----");

// 8.1 TypeScript Fallback
const utilsCode = fs.readFileSync(utilsFile, 'utf8');
const tsFbDefinitions = typescriptLang.extractDefinitionsFallback(utilsCode);
console.log("TS Fallback definitions:", [...tsFbDefinitions]);
if (!tsFbDefinitions.has('add')) {
  console.error("❌ Test Failed: expected TS Fallback to extract 'add'");
  process.exit(1);
}

const storeCode = fs.readFileSync(storeFile, 'utf8');
const storeFbDependencies = typescriptLang.extractDependenciesFallback(storeCode);
console.log("TS Fallback store dependencies:", storeFbDependencies);
if (!storeFbDependencies.some(d => d.source === './utils')) {
  console.error("❌ Test Failed: expected TS Fallback to extract './utils' dependency from store.ts");
  process.exit(1);
}
console.log("✅ TypeScript Fallback checks passed.");

// 8.2 Kotlin Fallback
const ktCode = fs.readFileSync(kotlinFile, 'utf8');
const ktFbDefinitions = kotlinLang.extractDefinitionsFallback(ktCode);
console.log("Kotlin Fallback definitions:", [...ktFbDefinitions]);
if (!ktFbDefinitions.has('com.grovkornet.nativefilmcamera.ui.CameraView')) {
  console.error("❌ Test Failed: expected Kotlin Fallback to extract 'com.grovkornet.nativefilmcamera.ui.CameraView'");
  process.exit(1);
}

const ktFbDependencies = kotlinLang.extractDependenciesFallback(ktCode);
console.log("Kotlin Fallback dependencies:", ktFbDependencies);
const hasKtFbEngineImport = ktFbDependencies.some(d => d.source === 'com.grovkornet.nativefilmcamera.camera.CameraEngine');
const hasKtFbJniDep = ktFbDependencies.some(d => d.source === 'jni:com.grovkornet.nativefilmcamera.ui.CameraView.nativePrepare' && d.isJni);
if (!hasKtFbEngineImport || !hasKtFbJniDep) {
  console.error("❌ Test Failed: missing expected imports or JNI dependencies in Kotlin Fallback");
  process.exit(1);
}
console.log("✅ Kotlin Fallback checks passed.");

// 8.3 C++ Fallback
const cppCode = fs.readFileSync(cppFile, 'utf8');
const cppFbDefinitions = cppLang.extractDefinitionsFallback(cppCode);
console.log("C++ Fallback definitions:", [...cppFbDefinitions]);
if (!cppFbDefinitions.has('jni:com.grovkornet.nativefilmcamera.rendering.OffscreenFilmProcessor.nativePrepare')) {
  console.error("❌ Test Failed: expected JNI symbol in C++ Fallback definitions");
  process.exit(1);
}

const cppFbDependencies = cppLang.extractDependenciesFallback(cppCode);
console.log("C++ Fallback dependencies:", cppFbDependencies);
const hasCppFbHeaderInclude = cppFbDependencies.some(d => d.source === 'Renderer.h');
if (!hasCppFbHeaderInclude) {
  console.error("❌ Test Failed: expected C++ Fallback to extract Renderer.h include");
  process.exit(1);
}
console.log("✅ C++ Fallback checks passed.");

console.log("\n🎉 All GraphRAG Core Tests Passed successfully!");
