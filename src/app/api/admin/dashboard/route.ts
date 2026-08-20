import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = cookies().get('admin_token')?.value;
    const adminSession = token ? await verifyAdminToken(token) : null;

    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Queries in parallel
    const [
      totalOrders,
      todaysOrdersCount,
      pendingOrdersCount,
      deliveredOrdersCount,
      pendingPaymentCount,
      totalProductsCount,
      activeProductsCount,
      activeSaleProductsCount,
      recentOrders,
      recentProducts,
      allVariants,
      completedOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.count({ where: { orderStatus: 'PENDING' } }),
      prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
      prisma.order.count({ where: { paymentStatus: 'PENDING' } }),
      prisma.product.count(),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.product.count({ where: { isPublished: true, salePrice: { not: null } } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { brand: true, variants: true, images: true },
      }),
      prisma.productVariant.findMany({
        select: { id: true, stockQuantity: true },
      }),
      prisma.order.findMany({
        where: { orderStatus: { not: 'CANCELLED' } },
        include: {
          items: {
            include: {
              product: {
                select: { wholesalePrice: true, retailPrice: true, salePrice: true },
              },
            },
          },
        },
      }),
    ]);

    // Low stock products count (variant stock <= 5)
    const lowStockCount = allVariants.filter((v) => v.stockQuantity <= 5).length;

    // Filter orders by period
    const ordersToday = completedOrders.filter((o) => new Date(o.createdAt) >= startOfToday);
    const orders7Days = completedOrders.filter((o) => new Date(o.createdAt) >= sevenDaysAgo);
    const orders30Days = completedOrders.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo);

    // Calculate revenue and estimated profit helper
    const calculateMetrics = (orderList: typeof completedOrders) => {
      let revenue = 0;
      let estimatedProfit = 0;

      for (const order of orderList) {
        revenue += order.grandTotal;

        for (const item of order.items) {
          const wholesale = item.product?.wholesalePrice || item.unitPrice * 0.6; // fallback 60% wholesale if null
          const profitPerUnit = item.unitPrice - wholesale;
          estimatedProfit += profitPerUnit * item.quantity;
        }
      }

      return {
        count: orderList.length,
        revenue,
        estimatedProfit,
      };
    };

    const metricsToday = calculateMetrics(ordersToday);
    const metrics7Days = calculateMetrics(orders7Days);
    const metrics30Days = calculateMetrics(orders30Days);

    return NextResponse.json({
      overview: {
        totalOrders,
        todaysOrders: todaysOrdersCount,
        pendingOrders: pendingOrdersCount,
        deliveredOrders: deliveredOrdersCount,
        pendingPaymentVerification: pendingPaymentCount,
        totalProducts: totalProductsCount,
        activeProducts: activeProductsCount,
        lowStockProducts: lowStockCount,
        activeSaleProducts: activeSaleProductsCount,
      },
      timePeriods: {
        today: metricsToday,
        sevenDays: metrics7Days,
        thirtyDays: metrics30Days,
      },
      recentOrders: recentOrders.map((o) => {
        // Compute estimated profit per order (ADMIN ONLY)
        const estProfit = o.items.reduce((sum, item) => {
          return sum + (item.totalPrice - (item.totalPrice * 0.6));
        }, 0);
        return { ...o, estimatedProfit: estProfit };
      }),
      recentProducts,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 });
  }
}
