import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const uploadRelDir = path.join('uploads', 'products');
    const uploadDir = path.join(process.cwd(), 'public', uploadRelDir);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const contentType = request.headers.get('content-type') || '';

    // A. Multipart file upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = (formData.get('image') || formData.get('file')) as File | null;
      if (!file) {
        return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(file.name) || '.webp';
      const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '') || 'prod';
      const filename = `${cleanName}_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({
        success: true,
        url: `/uploads/products/${filename}`,
        filename,
        message: 'Image uploaded successfully',
      });
    }

    // B. JSON Base64 data
    const body = await request.json();
    let b64 = body.image || body.data;
    if (!b64) {
      return NextResponse.json({ success: false, message: 'No image data provided' }, { status: 400 });
    }

    let ext = '.webp';
    if (b64.startsWith('data:image/')) {
      const match = b64.match(/^data:image\/(\w+);base64,/);
      if (match) {
        ext = '.' + (match[1] === 'jpeg' ? 'jpg' : match[1]);
      }
      b64 = b64.replace(/^data:image\/\w+;base64,/, '');
    }

    const buffer = Buffer.from(b64, 'base64');
    const cleanName = (body.name || 'prod').replace(/[^a-zA-Z0-9_-]/g, '') || 'prod';
    const filename = `${cleanName}_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);
    return NextResponse.json({
      success: true,
      url: `/uploads/products/${filename}`,
      filename,
      message: 'Image saved successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
