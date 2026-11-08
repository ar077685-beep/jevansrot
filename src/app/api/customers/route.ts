import { NextResponse } from 'next/server';
import { serverDb } from '../../../server/db';

export async function GET() {
  try {
    const customers = serverDb.getCustomers();
    return NextResponse.json({ success: true, count: customers.length, customers });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const customer = serverDb.upsertCustomer(body);
    return NextResponse.json({ success: true, customer }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

