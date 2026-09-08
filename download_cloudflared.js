const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe';
const dest = path.join(__dirname, 'cloudflared.exe');

console.log('Downloading cloudflared.exe...');

function download(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      console.log('Redirecting to:', response.headers.location);
      return download(response.headers.location, dest, cb);
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close(cb);
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error('Download error:', err.message);
  });
}

download(url, dest, () => {
  console.log('Downloaded cloudflared.exe successfully!');
});
