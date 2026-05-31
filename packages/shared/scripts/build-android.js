const { spawn } = require('child_process');
const path = require('path');
const helper = require('./android-helper');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');

async function start() {
  const args = process.argv.slice(2);
  const mode = args.includes('--simulator') ? '--simulator' : '--device';
  const targetArgs = helper.getTargetDeviceArg(mode);

  console.log('\n🏗️ Spawning Android Release Build...');
  const buildArgs = ['run', 'build', '-w', '@grovkornet/mobile'];
  if (targetArgs.length > 0) {
    buildArgs.push('--', ...targetArgs);
  }

  const build = spawn('npm', buildArgs, {
    stdio: 'inherit',
    shell: true,
    cwd: PROJECT_ROOT
  });

  build.on('close', (code) => {
    process.exit(code);
  });
}

start();
