import { NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const LINKS_DIR = join(process.cwd(), 'data', 'links');

function genCode(len = 6): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customCode, ...payload } = body;
    await mkdir(LINKS_DIR, { recursive: true });

    let code: string;
    if (customCode) {
      const clean = customCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean.length < 3) return NextResponse.json({ error: 'El código debe tener al menos 3 caracteres' }, { status: 400 });
      if (existsSync(join(LINKS_DIR, `${clean}.json`))) return NextResponse.json({ error: 'Ese código ya está en uso' }, { status: 409 });
      code = clean;
    } else {
      code = genCode();
      while (existsSync(join(LINKS_DIR, `${code}.json`))) code = genCode();
    }

    await writeFile(join(LINKS_DIR, `${code}.json`), JSON.stringify(payload));
    return NextResponse.json({ code });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawCode = searchParams.get('code');
    if (!rawCode) return NextResponse.json({ error: 'Falta code' }, { status: 400 });
    const code = rawCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!code) return NextResponse.json({ error: 'Código inválido' }, { status: 400 });

    const filePath = join(LINKS_DIR, `${code}.json`);
    if (!existsSync(filePath)) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

    const data = JSON.parse(await readFile(filePath, 'utf-8'));
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
