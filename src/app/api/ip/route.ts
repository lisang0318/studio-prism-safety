import { NextResponse } from 'next/server';
import os from 'os';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];

  for (const k in interfaces) {
    for (const k2 of interfaces[k] || []) {
      if (k2.family === 'IPv4' && !k2.internal) {
        addresses.push(k2.address);
      }
    }
  }

  const primaryIp = addresses.find(ip => !ip.startsWith('169.254')) || addresses[0] || 'localhost';

  let tunnelUrl = '';
  const tunnelFile = path.join(process.cwd(), 'data', 'tunnel_url.txt');
  if (fs.existsSync(tunnelFile)) {
    try {
      tunnelUrl = fs.readFileSync(tunnelFile, 'utf8').trim();
    } catch (e) {}
  }

  return NextResponse.json({
    ip: primaryIp,
    tunnelUrl: tunnelUrl || null,
    port: 3000
  });
}
