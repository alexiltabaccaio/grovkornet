const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');

// Helper to run a command synchronously and log output
function runScript(scriptPath) {
  return new Promise((resolve) => {
    const absPath = path.resolve(PROJECT_ROOT, scriptPath);
    console.log(`\n⚙️ Running: node ${scriptPath}`);
    const proc = spawn('node', [absPath], { stdio: 'inherit', cwd: PROJECT_ROOT });
    proc.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Script ${scriptPath} failed with code ${code}`);
      } else {
        console.log(`✅ Script ${scriptPath} completed.`);
      }
      resolve(code === 0);
    });
  });
}

// Debounce helper
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

async function start() {
  console.log('🚀 Starting Codegen & GraphRAG Watcher...');
  
  // 1. Initial run of all three
  const paramOk = await runScript('packages/shared/scripts/codegen-parameters.js');
  const errorOk = await runScript('packages/shared/scripts/codegen-errors.js');
  const graphOk = await runScript('packages/shared/scripts/graphrag/builder.js');

  if (!paramOk || !errorOk || !graphOk) {
    console.error('⚠️ Initial codegen failed. Starting watchers anyway...');
  }

  // 2. Watcher for camera-parameters.json
  const paramsPath = path.resolve(PROJECT_ROOT, 'packages/shared/camera-parameters.json');
  fs.watch(paramsPath, debounce(async (event) => {
    if (event === 'change') {
      console.log(`\n📝 camera-parameters.json changed.`);
      await runScript('packages/shared/scripts/codegen-parameters.js');
    }
  }, 100));

  // 3. Watcher for camera-errors.json
  const errorsPath = path.resolve(PROJECT_ROOT, 'packages/shared/camera-errors.json');
  fs.watch(errorsPath, debounce(async (event) => {
    if (event === 'change') {
      console.log(`\n📝 camera-errors.json changed.`);
      await runScript('packages/shared/scripts/codegen-errors.js');
    }
  }, 100));

  // 4. Watcher for source directories (FSD/GraphRAG)
  const watchDirs = [
    path.resolve(PROJECT_ROOT, 'apps/mobile/src'),
    path.resolve(PROJECT_ROOT, 'packages/shared/src')
  ];

  const rebuildGraph = debounce(async () => {
    console.log(`\n📝 Source code changed. Rebuilding GraphRAG...`);
    await runScript('packages/shared/scripts/graphrag/builder.js');
  }, 1000); // 1 second debounce for code typing

  for (const dir of watchDirs) {
    if (fs.existsSync(dir)) {
      fs.watch(dir, { recursive: true }, (event, filename) => {
        // Only trigger on typescript/javascript file changes
        if (filename && (filename.endsWith('.ts') || filename.endsWith('.tsx') || filename.endsWith('.js') || filename.endsWith('.jsx'))) {
          // Ignore output.graph.json self-changes or temp files
          if (!filename.includes('output.graph.json') && !filename.includes('node_modules')) {
            rebuildGraph();
          }
        }
      });
    }
  }

  console.log('👀 Watchers are active. Monitoring files for changes...');

  // 5. Spawn React Native Metro bundler
  const helper = require('./android-helper');
  const args = process.argv.slice(2);
  const mode = args.includes('--simulator') ? '--simulator' : '--device';
  const targetArgs = helper.getTargetDeviceArg(mode);

  console.log('\n📱 Spawning Metro Bundler...');
  const metroArgs = ['run', 'dev', '-w', '@grovkornet/mobile'];
  const extraArgs = ['--app-id', 'com.grovkornet.app.dev'];
  if (targetArgs.length > 0) {
    extraArgs.push(...targetArgs);
  }
  metroArgs.push('--', ...extraArgs);

  const fullCommand = `npm ${metroArgs.join(' ')}`;
  const metro = spawn(fullCommand, {
    stdio: 'inherit',
    shell: true,
    cwd: PROJECT_ROOT
  });

  metro.on('close', (code) => {
    console.log(`Metro bundler exited with code ${code}`);
    process.exit(code);
  });

  // Handle termination signals to kill metro
  process.on('SIGINT', () => {
    metro.kill('SIGINT');
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    metro.kill('SIGTERM');
    process.exit(0);
  });
}

start();
