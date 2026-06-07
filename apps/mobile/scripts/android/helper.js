const { execSync } = require('child_process');

function getAdbNameForDeviceId(pid) {
  try {
    const results = execSync(`adb -s ${pid} emu avd name`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const name = results.trim().split(/[\r\n]+/).shift();
    if (name && !name.includes('could not connect') && !name.includes('error')) {
      return name;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function getConnectedPhysicalDevices() {
  try {
    const output = execSync('adb devices -l', { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    const devices = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(/\s+/);
      if (parts.length >= 2 && parts[1] === 'device') {
        const id = parts[0];
        if (!id.startsWith('emulator-') && !id.startsWith('127.0.0.1:')) {
          const modelPart = parts.find(p => p.startsWith('model:'));
          const name = modelPart ? modelPart.replace('model:', '') : `Device ${id}`;
          devices.push({ id, name });
        }
      }
    }
    return devices;
  } catch (e) {
    return [];
  }
}

function getRunningEmulators() {
  try {
    const output = execSync('adb devices -l', { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    const emulators = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(/\s+/);
      if (parts.length >= 2 && parts[1] === 'device') {
        const id = parts[0];
        if (id.startsWith('emulator-') || id.startsWith('127.0.0.1:')) {
          let name = getAdbNameForDeviceId(id);
          if (!name) {
            const modelPart = parts.find(p => p.startsWith('model:'));
            name = modelPart ? modelPart.replace('model:', '') : id;
          }
          emulators.push({ id, name });
        }
      }
    }
    return emulators;
  } catch (e) {
    return [];
  }
}

function getAVDs() {
  try {
    const output = execSync('emulator -list-avds', { encoding: 'utf8' });
    return output.trim().split('\n').map(line => line.trim()).filter(Boolean);
  } catch (e) {
    return [];
  }
}

function getTargetDeviceArg(mode) {
  if (mode === '--simulator') {
    const emulators = getRunningEmulators();
    if (emulators.length > 0) {
      console.log(`🤖 Running emulator detected: ${emulators[0].name} (${emulators[0].id}). Targeting simulator.`);
      return ['-d', emulators[0].name];
    }
    const avds = getAVDs();
    if (avds.length > 0) {
      console.log(`🤖 No emulator running, but found configured AVD: ${avds[0]}. Booting and targeting simulator.`);
      return ['-d', avds[0]];
    }
    console.log('⚠️ No emulator found or configured. Defaulting target selection.');
    return [];
  } else {
    // Default to device
    const devices = getConnectedPhysicalDevices();
    if (devices.length > 0) {
      console.log(`📱 Physical device detected: ${devices[0].name} (${devices[0].id}). Targeting smartphone.`);
      return ['-d', devices[0].name];
    }
    console.log('⚠️ No physical device connected via ADB. Defaulting target selection.');
    return [];
  }
}

module.exports = {
  getConnectedPhysicalDevices,
  getRunningEmulators,
  getAVDs,
  getTargetDeviceArg
};
