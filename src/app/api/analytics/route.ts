import { NextResponse } from 'next/server';
import { serverDb } from '../../../server/db';

export async function GET() {
  try {
    const orders = serverDb.getOrders();
    const products = serverDb.getProducts();

    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const totalRev = validOrders.reduce((sum, o) => sum + o.total, 0);
    const advanceCollected = validOrders.reduce((sum, o) => sum + (o.advanceAmount || 0), 0);
    const remainingToCollect = validOrders.reduce((sum, o) => {
      const rem = o.remainAmount !== undefined ? o.remainAmount : Math.max(0, o.total - (o.advanceAmount || 0));
      return sum + rem;
    }, 0);

    const avgOrderValue = validOrders.length > 0 ? Math.round(totalRev / validOrders.length) : 0;

    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const codCount = orders.filter(o => o.paymentMethod === 'Cash on Delivery').length;
    const prepaidCount = orders.length - codCount;
    const codPct = orders.length > 0 ? Math.round((codCount / orders.length) * 100) : 0;
    const prepaidPct = 100 - codPct;

    const prodSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        if (!prodSales[item.id]) {
          prodSales[item.id] = { name: item.name, qty: 0, revenue: 0 };
        }
        prodSales[item.id].qty += item.quantity;
        prodSales[item.id].revenue += item.price * item.quantity;
      });
    });

    const topSelling = Object.values(prodSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

    const cityMap: Record<string, { count: number; total: number }> = {};
    orders.forEach(o => {
      const city = o.customer.city || 'Unknown';
      if (!cityMap[city]) cityMap[city] = { count: 0, total: 0 };
      cityMap[city].count += 1;
      cityMap[city].total += o.total;
    });
    const topCities = Object.entries(cityMap)
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        totalOrders: orders.length,
        totalRev,
        advanceCollected,
        remainingToCollect,
        avgOrderValue,
        statusCounts,
        topSelling,
        topCities,
        codPct,
        prepaidPct,
        productsCount: products.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
