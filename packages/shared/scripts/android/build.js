const { spawn } = require('child_process');
const path = require('path');
const helper = require('./helper');

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');

async function start() {
  process.env.APP_ENV = 'production';
  const args = process.argv.slice(2);
  const mode = args.includes('--simulator') ? '--simulator' : '--device';
  const targetArgs = helper.getTargetDeviceArg(mode);

  console.log('\n🏗️ Spawning Android Release Build...');
  const buildArgs = ['run', 'build', '-w', '@grovkornet/mobile'];
  const extraArgs = ['--app-id', 'com.grovkornet.app'];
  if (targetArgs.length > 0) {
    extraArgs.push(...targetArgs);
  }
  buildArgs.push('--', ...extraArgs);

  const fullCommand = `npm ${buildArgs.join(' ')}`;
  const build = spawn(fullCommand, {
    stdio: 'inherit',
    shell: true,
    cwd: PROJECT_ROOT
  });

  build.on('close', (code) => {
    process.exit(code);
  });
}

start();
