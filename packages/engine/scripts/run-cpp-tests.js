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
  console.log('🔍 Verifica dei dispositivi Android connessi...');
  const devices = execSync('adb devices').toString();
  const lines = devices.trim().split('\n').slice(1);
  const activeDevices = lines.filter(line => line.includes('\tdevice'));
  if (activeDevices.length === 0) {
    console.error('❌ Errore: Nessun dispositivo o emulatore Android connesso via ADB.');
    process.exit(1);
  }

  // Get target ABI
  const abi = execSync('adb shell getprop ro.product.cpu.abi').toString().trim();
  console.log(`📱 Dispositivo connesso rilevato con ABI: ${abi}`);

  // Resolve paths
  const androidBuildDir = path.resolve(__dirname, '../android/build');
  const testBinaryPath = findBinary(androidBuildDir, 'grovkornet-engine-tests', abi);
  const libCppPath = findBinary(androidBuildDir, 'libc++_shared.so', abi);

  if (!testBinaryPath || !libCppPath) {
    console.error(`❌ Errore: Impossibile trovare i binari C++ precompilati per l'ABI ${abi}.`);
    console.error(`Assicurati di compilare il modulo nativo Android prima di lanciare i test.`);
    process.exit(1);
  }

  console.log(`📂 Trovato eseguibile di test: ${testBinaryPath}`);
  console.log(`📂 Trovato runtime C++: ${libCppPath}`);

  console.log(`📤 Pushing ${path.basename(testBinaryPath)} to /data/local/tmp/...`);
  execSync(`adb push "${testBinaryPath}" /data/local/tmp/`, { stdio: 'inherit' });

  console.log(`📤 Pushing ${path.basename(libCppPath)} to /data/local/tmp/...`);
  execSync(`adb push "${libCppPath}" /data/local/tmp/`, { stdio: 'inherit' });

  console.log(`🔑 Impostando i permessi di esecuzione...`);
  execSync('adb shell chmod +x /data/local/tmp/grovkornet-engine-tests');

  console.log(`🏃 Esecuzione di Google Test sul dispositivo...\n`);
  execSync('adb shell "LD_LIBRARY_PATH=/data/local/tmp/ /data/local/tmp/grovkornet-engine-tests"', { stdio: 'inherit' });
  console.log(`\n✅ Google Test completato con successo!`);
} catch (error) {
  console.error('\n❌ Errore durante l\'esecuzione dei test nativi C++:', error.message);
  process.exit(1);
}
