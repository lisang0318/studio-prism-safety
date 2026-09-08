const { spawn, exec } = require('child_process');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const cloudflaredPath = path.join(__dirname, 'cloudflared.exe');
const tunnelUrlFile = path.join(__dirname, 'data', 'tunnel_url.txt');

if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

console.log('\n===============================================================');
console.log('  🛡️  스튜디오프리즘 안전관리 시스템을 시작하는 중입니다...');
console.log('===============================================================\n');

// 1. Start Next.js dev server
console.log('[1/3] 로컬 웹 서버 시작 중...');
const nextProcess = spawn('npm.cmd', ['run', 'dev'], {
  cwd: __dirname,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true
});

let tunnelProcess = null;
let tunnelUrl = '';
let readyPrinted = false;
let serverReady = false;

// 2. Poll until Next.js local server is actually ready on port 3000
function checkLocalServer(callback) {
  const req = http.get('http://127.0.0.1:3000/api/safety-data', res => {
    if (res.statusCode === 200) {
      callback(true);
    } else {
      callback(false);
    }
  });
  req.on('error', () => callback(false));
  req.setTimeout(1000, () => {
    req.destroy();
    callback(false);
  });
}

function waitForLocalServer(attempts = 0) {
  if (serverReady) return;
  checkLocalServer(isReady => {
    if (serverReady) return;
    if (isReady) {
      serverReady = true;
      console.log('✅ [2/3] 로컬 웹 서버 준비 완료! (http://localhost:3000)');
      startTunnel();
    } else {
      if (attempts % 6 === 0 && attempts > 0) {
        console.log('... 로컬 서버 로딩 대기 중 (' + (attempts * 0.5).toFixed(1) + '초)...');
      }
      setTimeout(() => waitForLocalServer(attempts + 1), 500);
    }
  });
}

// 3. Start Cloudflare Tunnel once local server is 100% listening
function startTunnel() {
  console.log('[3/3] 외부 모바일 QR 터널 연결 중...');
  tunnelProcess = spawn(cloudflaredPath, ['tunnel', '--url', 'http://127.0.0.1:3000'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  function handleTunnelData(data) {
    const str = data.toString();
    const match = str.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && !tunnelUrl) {
      tunnelUrl = match[0];
      fs.writeFileSync(tunnelUrlFile, tunnelUrl, 'utf8');
      
      setTimeout(() => {
        printReadyBanner();
      }, 1000);
    }
  }

  tunnelProcess.stdout.on('data', handleTunnelData);
  tunnelProcess.stderr.on('data', handleTunnelData);

  tunnelProcess.on('close', code => {
    console.log(`Cloudflared exited with code ${code}`);
  });
}

function printReadyBanner() {
  if (readyPrinted) return;
  readyPrinted = true;

  console.log('\n===============================================================');
  console.log('  🎉 스튜디오프리즘 안전관리 시스템이 정상 실행되었습니다!');
  console.log('===============================================================');
  console.log('  💻 PC 관리자 화면 : http://localhost:3000');
  console.log('  📱 모바일 QR 접속 : ' + (tunnelUrl || '연결 준비 중...'));
  console.log('  🔑 관리자 로그인  : e26e100 (이상욱 총괄책임자)');
  console.log('===============================================================');
  console.log('  📌 안내:');
  console.log('  - 이 검은색 창을 켜두시면 모바일과 PC에서 계속 작동합니다.');
  console.log('  - 프로그램을 종료하시려면 창을 닫으시거나 종료 아이콘을 누르세요.');
  console.log('===============================================================\n');

  // Auto-open browser
  setTimeout(() => {
    exec('start http://localhost:3000', () => {});
  }, 1000);
}

// Start waiting for local server
waitForLocalServer();

// Handle clean shutdown
process.on('SIGINT', () => {
  console.log('\n서버를 종료합니다...');
  try { if (nextProcess) nextProcess.kill(); } catch (e) {}
  try { if (tunnelProcess) tunnelProcess.kill(); } catch (e) {}
  process.exit(0);
});

process.on('SIGTERM', () => {
  try { if (nextProcess) nextProcess.kill(); } catch (e) {}
  try { if (tunnelProcess) tunnelProcess.kill(); } catch (e) {}
  process.exit(0);
});
