import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export const config = {
  api: { bodyParser: false },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3006';

// Extensiones que un navegador puede renderizar/ejecutar si se abren directamente
// (servidas como estáticas desde /public/shares) — bloqueadas para evitar XSS same-origin.
const BLOCKED_EXTENSIONS = new Set([
  'html', 'htm', 'xhtml', 'shtml', 'svg', 'svgz',
  'js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx',
  'exe', 'bat', 'cmd', 'sh', 'ps1', 'com', 'scr', 'msi', 'dll',
]);

async function isAuthorized(request: Request): Promise<boolean> {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ') || auth.length < 15) return false;
  try {
    const res = await fetch(`${API_BASE}/members`, { headers: { Authorization: auth } });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const contentLength = request.headers.get('content-length');
    const MAX = 120 * 1024 * 1024; // 120 MB
    if (contentLength && parseInt(contentLength) > MAX) {
      return NextResponse.json({ error: 'Archivo demasiado grande (máx 100MB)' }, { status: 413 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (BLOCKED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 415 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueId = crypto.randomUUID();
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${uniqueId}-${originalName}`;

    const publicPath = join(process.cwd(), 'public', 'shares');
    await mkdir(publicPath, { recursive: true });

    const filePath = join(publicPath, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({ link: `/shares/${fileName}` });

  } catch (error: any) {
    console.error('Share API Error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Error al guardar el archivo' }, { status: 500 });
  }
}
