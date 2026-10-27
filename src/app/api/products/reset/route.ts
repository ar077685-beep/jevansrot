import { NextResponse } from 'next/server';
import { serverDb } from '../../../../server/db';

export async function POST() {
  try {
    const products = serverDb.resetProducts();
    return NextResponse.json({ success: true, message: 'Products reset to defaults', products });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
