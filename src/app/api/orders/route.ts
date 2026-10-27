import { NextResponse } from 'next/server';
import { serverDb } from '../../../server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';

    let orders = serverDb.getOrders();

    if (status && status !== 'All') {
      orders = orders.filter(o => o.status === status);
    }
    if (paymentStatus && paymentStatus !== 'All') {
      orders = orders.filter(o => o.paymentStatus === paymentStatus);
    }
    if (search) {
      orders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(search) ||
        o.customer.name.toLowerCase().includes(search) ||
        o.customer.phone.toLowerCase().includes(search) ||
        o.customer.city.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.customer || !body.items || !body.total) {
      return NextResponse.json({ success: false, message: 'Missing required order fields' }, { status: 400 });
    }

    // Default payment is set to 'Pending' upon placing order
    const newOrder = serverDb.createOrder({
      customer: body.customer,
      items: body.items,
      subtotal: Number(body.subtotal) || Number(body.total),
      discount: Number(body.discount) || 0,
      shipping: Number(body.shipping) || 0,
      total: Number(body.total),
      advanceAmount: typeof body.advanceAmount === 'number' ? body.advanceAmount : 0,
      remainAmount: typeof body.remainAmount === 'number' ? body.remainAmount : Number(body.total),
      paymentMethod: body.paymentMethod || 'UPI / QR',
      paymentStatus: body.paymentStatus || 'Pending',
      status: body.status || 'Pending',
      notes: body.notes || 'Order placed via online store.',
      trackingNumber: body.trackingNumber || '',
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
