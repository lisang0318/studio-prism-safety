const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const cloudflaredPath = path.join(__dirname, 'cloudflared.exe');
const tunnelUrlFile = path.join(__dirname, 'data', 'tunnel_url.txt');

if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

console.log('Starting Cloudflare Tunnel to http://127.0.0.1:3000...');

const child = spawn(cloudflaredPath, ['tunnel', '--url', 'http://127.0.0.1:3000'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let found = false;

function handleOutput(data) {
  const str = data.toString();
  process.stdout.write(str);
  
  // Look for https://*.trycloudflare.com
  const match = str.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match && !found) {
    found = true;
    const tunnelUrl = match[0];
    console.log('\n=============================================');
    console.log('✅ CLOUDFLARE PUBLIC MOBILE TUNNEL URL:');
    console.log(tunnelUrl);
    console.log('=============================================\n');
    fs.writeFileSync(tunnelUrlFile, tunnelUrl, 'utf8');
  }
}

child.stdout.on('data', handleOutput);
child.stderr.on('data', handleOutput);

child.on('close', (code) => {
  console.log(`Cloudflared exited with code ${code}`);
});
