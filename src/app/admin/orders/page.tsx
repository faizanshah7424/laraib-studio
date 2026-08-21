'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPKR, getWhatsAppUrl } from '@/lib/utils';
import {
  Search,
  Eye,
  MessageCircle,
  Truck,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  X,
  Filter,
  DollarSign,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminOrdersListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search,
        orderStatus: orderStatusFilter,
        paymentStatus: paymentStatusFilter,
      });

      const res = await fetch(`/api/orders?${queryParams.toString()}`);
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();

      if (data.orders) {
        setOrders(data.orders);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, orderStatusFilter, paymentStatusFilter]);

  useEffect(() => {
    if (selectedOrder) {
      setInternalNotes(selectedOrder.internalNotes || '');
      setSaveSuccessMsg(null);
    }
  }, [selectedOrder]);

  const handleUpdateOrderStatus = async (orderId: string, newOrderStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newOrderStatus }),
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newOrderStatus });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveInternalNotes = async () => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes }),
      });
      if (res.ok) {
        setSaveSuccessMsg('Internal notes saved!');
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const buildCustomerWhatsAppMessage = (ord: any): string => {
    return `Hi ${ord.customerName}! 👋
This is Laraib Studio regarding your Order #${ord.orderNumber}.

Current Order Status: *${ord.orderStatus}*
Payment Status: *${ord.paymentStatus}*

We are preparing your Karachi delivery. Please let us know if you have any questions!`;
  };

  // Helper for internal estimated profit
  const calculateOrderProfit = (ord: any): number => {
    if (!ord || !ord.items) return 0;
    return ord.items.reduce((sum: number, it: any) => {
      const unitWholesale = it.product?.wholesalePrice || it.unitPrice * 0.6;
      return sum + (it.unitPrice - unitWholesale) * it.quantity;
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Order Fulfillment Center
          </h1>
          <p className="text-xs text-stone-500">
            Manage Karachi COD & Bank Transfer orders, profit estimates & internal notes ({totalCount} orders).
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 text-stone-800 text-xs font-semibold rounded-xs border hover:bg-stone-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-stone-50 p-4 rounded-sm border border-stone-200">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by Order #, Customer, Phone, Area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xs focus:outline-none focus:border-stone-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto text-xs">
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="bg-white border border-stone-200 rounded-xs px-2.5 py-1.5 font-medium text-stone-800 focus:outline-none"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="bg-white border border-stone-200 rounded-xs px-2.5 py-1.5 font-medium text-stone-800 focus:outline-none"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PENDING">Payment Pending</option>
            <option value="VERIFIED">Payment Verified</option>
            <option value="FAILED">Payment Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-stone-200 rounded-sm overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-100/80 text-[11px] font-bold uppercase tracking-wider text-stone-600 border-b border-stone-200">
              <tr>
                <th className="p-3.5">Order # & Date</th>
                <th className="p-3.5">Customer & Phone</th>
                <th className="p-3.5">Karachi Area</th>
                <th className="p-3.5">Grand Total</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Order Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500 font-serif">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 font-medium">
                      <span className="font-bold text-stone-900 font-mono block">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(ord.createdAt).toLocaleDateString('en-PK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-semibold text-stone-900 block">
                        {ord.customerName}
                      </span>
                      <span className="text-stone-500 font-mono text-[11px]">
                        {ord.customerPhone}
                      </span>
                    </td>

                    <td className="p-3.5 font-medium text-stone-800">
                      {ord.karachiArea}
                    </td>

                    <td className="p-3.5 font-bold text-brand-dark">
                      {formatPKR(ord.grandTotal)}
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider block text-stone-700">
                          {ord.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'COD'}
                        </span>
                        <select
                          value={ord.paymentStatus}
                          onChange={(e) => handleUpdatePaymentStatus(ord.id, e.target.value)}
                          className={`text-[10px] font-bold uppercase rounded-xs px-1.5 py-0.5 border focus:outline-none ${
                            ord.paymentStatus === 'VERIFIED'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : ord.paymentStatus === 'FAILED'
                              ? 'bg-red-50 border-red-300 text-red-800'
                              : 'bg-amber-50 border-amber-300 text-amber-900'
                          }`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="VERIFIED">Verified</option>
                          <option value="FAILED">Failed</option>
                        </select>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className={`text-xs font-bold uppercase rounded-xs px-2 py-1 border focus:outline-none ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : ord.orderStatus === 'SHIPPED'
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : ord.orderStatus === 'CANCELLED'
                            ? 'bg-red-50 border-red-300 text-red-800'
                            : 'bg-amber-50 border-amber-300 text-amber-900'
                        }`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xs transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <a
                        href={getWhatsAppUrl(
                          buildCustomerWhatsAppMessage(ord),
                          ord.customerWhatsapp || ord.customerPhone
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xs transition-colors inline-block"
                        title="Contact Customer on WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal with Profit Calculation & Internal Notes */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-stone-200 pb-3 space-y-1">
              <span className="text-xs uppercase font-bold text-brand-accent tracking-widest">
                Order Management & Internal Profit Analysis
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Order #{selectedOrder.orderNumber}
              </h2>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-stone-400 font-medium block">Customer Name:</span>
                <span className="font-semibold text-stone-900">{selectedOrder.customerName}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block">Phone / WhatsApp:</span>
                <span className="font-semibold text-stone-900">{selectedOrder.customerPhone}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block">Karachi Delivery Area:</span>
                <span className="font-semibold text-stone-900">{selectedOrder.karachiArea}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block">Delivery Address:</span>
                <span className="font-semibold text-stone-900">{selectedOrder.deliveryAddress}</span>
              </div>
              {selectedOrder.paymentReference && (
                <div className="col-span-2 bg-amber-50 p-2 border border-amber-200 rounded-xs">
                  <span className="text-amber-800 font-bold block">Bank Reference ID:</span>
                  <span className="font-mono text-stone-900">{selectedOrder.paymentReference}</span>
                </div>
              )}
            </div>

            {/* INTERNAL BUSINESS PROFIT VIEW (ADMIN ONLY) */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xs space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold uppercase tracking-wider">
                <DollarSign className="h-4 w-4 text-amber-700" />
                <span>Internal Profit Estimate (Admin Only)</span>
              </div>
              <div className="flex justify-between items-center text-stone-800">
                <span>Order Subtotal:</span>
                <span className="font-semibold">{formatPKR(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-amber-900 font-bold border-t border-amber-200/80 pt-1">
                <span>Estimated Gross Margin Profit:</span>
                <span>{formatPKR(calculateOrderProfit(selectedOrder))}</span>
              </div>
            </div>

            {/* Purchased Items Table */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                Purchased Items
              </h3>
              <div className="divide-y divide-stone-100">
                {selectedOrder.items?.map((it: any) => (
                  <div key={it.id} className="py-2 flex justify-between text-xs">
                    <div>
                      <span className="font-semibold text-stone-900">{it.productName}</span>
                      <span className="text-stone-500 block text-[11px]">
                        Size: {it.size} {it.color ? `| Color: ${it.color}` : ''} × {it.quantity}
                      </span>
                    </div>
                    <span className="font-bold text-stone-900">{formatPKR(it.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div className="space-y-2 border-t border-stone-200 pt-3 text-xs">
              <label className="font-bold text-stone-900 uppercase tracking-wider block">
                Internal Admin Notes (Private)
              </label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add supplier sourcing notes or bank verification remarks..."
                rows={2}
                className="w-full text-xs p-2 border border-stone-200 rounded-xs focus:outline-none focus:border-stone-400"
              />
              <div className="flex justify-between items-center pt-1">
                {saveSuccessMsg && (
                  <span className="text-emerald-700 font-semibold text-[11px]">
                    {saveSuccessMsg}
                  </span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveInternalNotes}
                  disabled={isUpdatingStatus}
                  className="ml-auto flex items-center gap-1"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Internal Notes</span>
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
