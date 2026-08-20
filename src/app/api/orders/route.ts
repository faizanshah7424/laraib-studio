import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth/session';
import { generateOrderNumber } from '@/lib/utils';
import { KARACHI_DELIVERY_FEE } from '@/lib/constants';

interface OrderItemInput {
  productId: string;
  variantId?: string;
  size: string;
  color?: string;
  quantity: number;
}

/**
 * GET /api/orders
 * Admin Order Listing
 */
export async function GET(req: NextRequest) {
  try {
    const token = cookies().get('admin_token')?.value;
    const adminSession = token ? await verifyAdminToken(token) : null;

    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const orderStatus = searchParams.get('orderStatus') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { karachiArea: { contains: search } },
      ];
    }

    if (orderStatus && orderStatus !== 'ALL') {
      where.orderStatus = orderStatus;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit) || 1,
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customerName,
      customerPhone,
      customerWhatsapp,
      deliveryAddress,
      karachiArea,
      city = 'Karachi',
      paymentMethod = 'COD',
      customerNotes,
      paymentReference,
      items,
    } = body;

    // 1. Validation of Customer Details
    if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }
    if (!customerPhone || typeof customerPhone !== 'string' || customerPhone.trim() === '') {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 });
    }
    if (!deliveryAddress || typeof deliveryAddress !== 'string' || deliveryAddress.trim() === '') {
      return NextResponse.json({ error: 'Karachi delivery address is required' }, { status: 400 });
    }
    if (!karachiArea || typeof karachiArea !== 'string' || karachiArea.trim() === '') {
      return NextResponse.json({ error: 'Karachi area/locality is required' }, { status: 400 });
    }

    // 2. Strict Karachi-Only Delivery Validation
    if (city && city.toLowerCase() !== 'karachi') {
      return NextResponse.json(
        { error: 'Laraib Studio currently delivers exclusively within Karachi.' },
        { status: 400 }
      );
    }

    // 3. Payment Method Validation
    if (paymentMethod !== 'COD' && paymentMethod !== 'BANK_TRANSFER') {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    // 4. Server-Side Price & Stock Recalculation (NEVER TRUST BROWSER PRICES)
    let calculatedSubtotal = 0;
    const preparedOrderItems: {
      productId: string;
      variantId?: string | null;
      productName: string;
      size: string;
      color?: string | null;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
    }[] = [];

    const variantStockUpdates: { variantId: string; newStock: number }[] = [];

    for (const item of items as OrderItemInput[]) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json({ error: 'Invalid order item specified' }, { status: 400 });
      }

      // Fetch product from DB (Published products only)
      const dbProduct = await prisma.product.findFirst({
        where: { id: item.productId, isPublished: true },
        include: { variants: true },
      });

      if (!dbProduct) {
        return NextResponse.json(
          { error: `Product is no longer available.` },
          { status: 400 }
        );
      }

      // Find matching variant
      let dbVariant = dbProduct.variants.find((v) => v.id === item.variantId);
      if (!dbVariant) {
        dbVariant = dbProduct.variants.find(
          (v) => v.size === item.size && (!item.color || v.color === item.color)
        );
      }
      if (!dbVariant && dbProduct.variants.length > 0) {
        dbVariant = dbProduct.variants[0];
      }

      if (dbVariant && dbVariant.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${dbProduct.name}" (${item.size}). Only ${dbVariant.stockQuantity} remaining.`,
          },
          { status: 400 }
        );
      }

      // Calculate unit price strictly from DB
      const effectiveUnitPrice =
        typeof dbProduct.salePrice === 'number' && dbProduct.salePrice > 0
          ? dbProduct.salePrice
          : dbProduct.retailPrice;

      const itemTotalPrice = effectiveUnitPrice * item.quantity;
      calculatedSubtotal += itemTotalPrice;

      preparedOrderItems.push({
        productId: dbProduct.id,
        variantId: dbVariant?.id || null,
        productName: dbProduct.name,
        size: item.size || dbVariant?.size || 'Unstitched',
        color: item.color || dbVariant?.color || null,
        unitPrice: effectiveUnitPrice,
        quantity: item.quantity,
        totalPrice: itemTotalPrice,
      });

      if (dbVariant) {
        variantStockUpdates.push({
          variantId: dbVariant.id,
          newStock: dbVariant.stockQuantity - item.quantity,
        });
      }
    }

    // 5. Strict Delivery Charge: Flat PKR 200 (No free shipping)
    const deliveryFee = KARACHI_DELIVERY_FEE;
    const calculatedGrandTotal = calculatedSubtotal + deliveryFee;

    // 6. Generate Human-Readable Unique Order Number
    const orderNumber = generateOrderNumber();

    // 7. Atomic Transaction: Create Order & Update Stock
    const newOrder = await prisma.$transaction(async (tx) => {
      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerWhatsapp: customerWhatsapp ? customerWhatsapp.trim() : customerPhone.trim(),
          deliveryAddress: deliveryAddress.trim(),
          karachiArea: karachiArea.trim(),
          city: 'Karachi',
          subtotal: calculatedSubtotal,
          deliveryFee,
          grandTotal: calculatedGrandTotal,
          paymentMethod,
          paymentStatus: 'PENDING',
          orderStatus: 'PENDING',
          customerNotes: customerNotes ? customerNotes.trim() : null,
          paymentReference: paymentReference ? paymentReference.trim() : null,
          items: {
            create: preparedOrderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Update variant stocks
      for (const update of variantStockUpdates) {
        await tx.productVariant.update({
          where: { id: update.variantId },
          data: { stockQuantity: Math.max(0, update.newStock) },
        });
      }

      return createdOrder;
    });

    return NextResponse.json({
      success: true,
      orderNumber: newOrder.orderNumber,
      orderId: newOrder.id,
      grandTotal: newOrder.grandTotal,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order on server. Please try again.' },
      { status: 500 }
    );
  }
}
