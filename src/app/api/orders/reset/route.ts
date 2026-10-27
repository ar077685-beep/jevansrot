import { NextResponse } from 'next/server';
import { serverDb } from '../../../../server/db';

export async function POST() {
  try {
    const orders = serverDb.resetOrders();
    return NextResponse.json({ success: true, message: 'Orders reset to defaults', orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
