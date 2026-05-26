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

  console.log(`🔑 Setting execution permissions...`);
  execSync('adb shell chmod +x /data/local/tmp/grovkornet-engine-tests');

  console.log(`🏃 Running Google Test on device...\n`);
  execSync('adb shell "LD_LIBRARY_PATH=/data/local/tmp/ /data/local/tmp/grovkornet-engine-tests"', { stdio: 'inherit' });
  console.log(`\n✅ Google Test completed successfully!`);
} catch (error) {
  console.error('\n❌ Error during native C++ tests execution:', error.message);
  process.exit(1);
}
