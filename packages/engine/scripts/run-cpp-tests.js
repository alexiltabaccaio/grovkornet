const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function findBinary(baseDir, filename, abi) {
  // Common paths for Android Gradle Plugin CMake output
  const pathsToCheck = [
    path.join(baseDir, 'intermediates/cmake/debug/obj', abi, filename),
    path.join(baseDir, 'intermediates/cmake/release/obj', abi, filename),
  ];

  for (const p of pathsToCheck) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // Fallback: search recursively in intermediates directory for the ABI and filename
  const searchDir = path.join(baseDir, 'intermediates');
  if (fs.existsSync(searchDir)) {
    const files = getFilesRecursive(searchDir);
    const matched = files.find(f => f.endsWith(path.join(abi, filename)));
    if (matched) return matched;
  }

  return null;
}

function getFilesRecursive(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursive(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

function findLlvmTools() {
  const localPropertiesPath = path.resolve(__dirname, '../../../apps/mobile/android/local.properties');
  if (!fs.existsSync(localPropertiesPath)) {
    console.warn(`⚠️ Warning: local.properties not found at ${localPropertiesPath}. Skipping coverage report.`);
    return null;
  }

  const content = fs.readFileSync(localPropertiesPath, 'utf8');
  const sdkLine = content.split('\n').find(line => line.startsWith('sdk.dir='));
  if (!sdkLine) {
    console.warn('⚠️ Warning: sdk.dir not defined in local.properties. Skipping coverage report.');
    return null;
  }

  const sdkDir = sdkLine.split('=')[1].trim().replace(/\\/g, '/');
  const ndkDir = path.join(sdkDir, 'ndk');
  if (!fs.existsSync(ndkDir)) {
    console.warn(`⚠️ Warning: NDK directory not found at ${ndkDir}. Skipping coverage report.`);
    return null;
  }

  const ndkVersions = fs.readdirSync(ndkDir);
  if (ndkVersions.length === 0) {
    console.warn('⚠️ Warning: No NDK versions found. Skipping coverage report.');
    return null;
  }

  // Try to find the exact NDK version used by the project first
  let latestNdk = '26.1.10909125';
  if (!ndkVersions.includes(latestNdk)) {
    latestNdk = ndkVersions.sort().reverse()[0];
  }
  const ndkPath = path.join(ndkDir, latestNdk);

  const platform = process.platform;
  let prebuiltDir = 'windows-x86_64';
  let exeExtension = '.exe';
  if (platform === 'darwin') {
    prebuiltDir = 'darwin-x86_64';
    exeExtension = '';
  } else if (platform === 'linux') {
    prebuiltDir = 'linux-x86_64';
    exeExtension = '';
  }

  const ndkBinDir = path.join(ndkPath, 'toolchains/llvm/prebuilt', prebuiltDir, 'bin');
  const llvmProfdata = path.join(ndkBinDir, `llvm-profdata${exeExtension}`);
  const llvmCov = path.join(ndkBinDir, `llvm-cov${exeExtension}`);

  if (!fs.existsSync(llvmProfdata) || !fs.existsSync(llvmCov)) {
    console.warn('⚠️ Warning: llvm-profdata or llvm-cov not found in NDK toolchain bin directory. Skipping coverage report.');
    return null;
  }

  return { llvmProfdata, llvmCov };
}

try {
  // Check adb connection
  console.log('🔍 Checking connected Android devices...');
  const devices = execSync('adb devices').toString();
  const lines = devices.trim().split('\n').slice(1);
  const activeDevices = lines.filter(line => line.includes('\tdevice'));
  if (activeDevices.length === 0) {
    console.error('❌ Error: No Android device or emulator connected via ADB.');
    process.exit(1);
  }

  // Get target ABI
  const abi = execSync('adb shell getprop ro.product.cpu.abi').toString().trim();
  console.log(`📱 Connected device detected with ABI: ${abi}`);

  // Resolve paths
  const androidBuildDir = path.resolve(__dirname, '../android/build');
  const testBinaryPath = findBinary(androidBuildDir, 'grovkornet-engine-tests', abi);
  const libCppPath = findBinary(androidBuildDir, 'libc++_shared.so', abi);

  if (!testBinaryPath || !libCppPath) {
    console.error(`❌ Error: Cannot find precompiled C++ binaries for ABI ${abi}.`);
    console.error(`Make sure to compile the native Android module before running tests.`);
    process.exit(1);
  }

  console.log(`📂 Test executable found: ${testBinaryPath}`);
  console.log(`📂 C++ runtime found: ${libCppPath}`);

  console.log(`📤 Pushing ${path.basename(testBinaryPath)} to /data/local/tmp/...`);
  execSync(`adb push "${testBinaryPath}" /data/local/tmp/`, { stdio: 'inherit' });

  console.log(`📤 Pushing ${path.basename(libCppPath)} to /data/local/tmp/...`);
  execSync(`adb push "${libCppPath}" /data/local/tmp/`, { stdio: 'inherit' });

  console.log(`📤 Pushing materials to /data/local/tmp/materials/...`);
  const materialsDir = path.resolve(__dirname, '../android/src/main/assets/materials');
  execSync(`adb push "${materialsDir}" /data/local/tmp/`, { stdio: 'inherit' });

  console.log(`🔑 Setting execution permissions...`);
  execSync('adb shell chmod +x /data/local/tmp/grovkornet-engine-tests');

  console.log(`🏃 Running Google Test on device...\n`);
  execSync('adb shell "LD_LIBRARY_PATH=/data/local/tmp/ LLVM_PROFILE_FILE=/data/local/tmp/grovkornet_engine.profraw /data/local/tmp/grovkornet-engine-tests"', { stdio: 'inherit' });
  console.log(`\n✅ Google Test completed successfully!`);

  // Try to generate coverage report
  console.log('📥 Pulling C++ coverage profile from device...');
  const buildDir = path.resolve(__dirname, '../android/build');
  const profrawPath = path.join(buildDir, 'grovkornet_engine.profraw');
  const profdataPath = path.join(buildDir, 'grovkornet_engine.profdata');

  // Remove existing files if they exist to avoid stale data
  if (fs.existsSync(profrawPath)) fs.unlinkSync(profrawPath);
  if (fs.existsSync(profdataPath)) fs.unlinkSync(profdataPath);

  try {
    execSync(`adb pull /data/local/tmp/grovkornet_engine.profraw "${profrawPath}"`, { stdio: 'ignore' });
    
    const tools = findLlvmTools();
    if (tools) {
      console.log('🔄 Merging coverage data...');
      execSync(`"${tools.llvmProfdata}" merge -sparse "${profrawPath}" -o "${profdataPath}"`);
      
      console.log('\n📊 Generating C++ Code Coverage Report...');
      const srcCppDir = path.resolve(__dirname, '../android/src/main/cpp');
      const outputReport = execSync(`"${tools.llvmCov}" report "${testBinaryPath}" -instr-profile="${profdataPath}" "${srcCppDir}"`).toString();
      console.log(outputReport);
    }
  } catch (covError) {
    console.warn('⚠️ Warning: Failed to generate C++ coverage report:', covError.message);
  }
} catch (error) {
  console.error('\n❌ Error during native C++ tests execution:', error.message);
  process.exit(1);
}
