import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Creamos un ID único para el archivo para evitar duplicados y mejorar la seguridad
    const uniqueId = crypto.randomUUID();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${uniqueId}-${originalName}`;
    
    // Ruta en la carpeta pública del proyecto
    const publicPath = join(process.cwd(), 'public', 'shares');
    
    // Asegurarse de que el directorio existe
    await mkdir(publicPath, { recursive: true });
    
    const filePath = join(publicPath, fileName);
    
    // Guardar el archivo físicamente en el servidor
    await writeFile(filePath, buffer);

    // Retornamos la URL relativa que el navegador puede descargar directamente
    const fileUrl = `/shares/${fileName}`;
    
    return NextResponse.json({ link: fileUrl });

  } catch (error: any) {
    console.error('Local Share API Error:', error);
    return NextResponse.json({ error: 'Error al guardar el archivo en el servidor local' }, { status: 500 });
  }
}
