'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPKR, getWhatsAppUrl } from '@/lib/utils';
import { Search, Users, MessageCircle, ArrowLeft, Eye, RefreshCw, X, MapPin, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ search });
      const res = await fetch(`/api/admin/customers?${queryParams.toString()}`);
      const data = await res.json();
      if (data.customers) setCustomers(data.customers);
    } catch (err) {
      console.error('Failed to fetch admin customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              Customer Management & Order History
            </h1>
            <p className="text-xs text-stone-500">
              View registered customer accounts, total order value, delivery addresses, and contact options.
            </p>
          </div>
        </div>

        <button
          onClick={fetchCustomers}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 text-stone-800 text-xs font-semibold rounded-xs border hover:bg-stone-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Customers</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-stone-50 p-4 rounded-sm border border-stone-200">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xs focus:outline-none focus:border-stone-400"
          />
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white border border-stone-200 rounded-sm overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-100/80 text-[11px] font-bold uppercase tracking-wider text-stone-600 border-b border-stone-200">
              <tr>
                <th className="p-3.5">Customer Name & Email</th>
                <th className="p-3.5">Phone / WhatsApp</th>
                <th className="p-3.5">Karachi Area</th>
                <th className="p-3.5">Registered On</th>
                <th className="p-3.5">Total Orders</th>
                <th className="p-3.5">Total Spent</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    Loading customer accounts...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500 font-serif">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 font-medium">
                      <span className="font-bold text-stone-900 block">{c.name}</span>
                      <span className="text-[11px] text-stone-500">{c.email}</span>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-stone-700">
                      {c.phone || c.whatsapp || <span className="text-stone-400">—</span>}
                    </td>

                    <td className="p-3.5 font-medium text-stone-800">
                      {c.karachiArea || <span className="text-stone-400">Karachi</span>}
                    </td>

                    <td className="p-3.5 text-stone-500 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="p-3.5 font-bold text-stone-900">
                      {c.orderCount} Orders
                    </td>

                    <td className="p-3.5 font-bold text-brand-dark">
                      {formatPKR(c.totalOrderValue)}
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xs transition-colors"
                        title="View Customer Order History"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {c.whatsapp || c.phone ? (
                        <a
                          href={getWhatsAppUrl(
                            `Hi ${c.name}! This is Laraib Studio contacting you regarding your account and orders.`,
                            c.whatsapp || c.phone
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xs transition-colors inline-block"
                          title="Contact Customer on WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm max-w-xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-stone-200 pb-3 space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                Customer Profile & Order History
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                {selectedCustomer.name}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 border border-stone-200 rounded-xs">
              <div>
                <span className="text-stone-400 font-medium block">Email:</span>
                <span className="font-semibold text-stone-900">{selectedCustomer.email}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block">Phone / WhatsApp:</span>
                <span className="font-semibold text-stone-900">{selectedCustomer.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block">Karachi Area:</span>
                <span className="font-semibold text-stone-900">{selectedCustomer.karachiArea || 'Karachi'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block">Lifetime Order Value:</span>
                <span className="font-bold text-brand-dark">{formatPKR(selectedCustomer.totalOrderValue)}</span>
              </div>
            </div>

            {/* Orders History */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-brand-dark" />
                <span>Placed Orders ({selectedCustomer.recentOrders?.length || 0})</span>
              </h3>

              <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto">
                {selectedCustomer.recentOrders?.length === 0 ? (
                  <p className="text-xs text-stone-400 py-3 text-center">No orders placed yet.</p>
                ) : (
                  selectedCustomer.recentOrders?.map((ord: any) => (
                    <div key={ord.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-stone-900">#{ord.orderNumber}</span>
                        <span className="text-stone-400 text-[11px] block">
                          {new Date(ord.createdAt).toLocaleDateString('en-PK')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-stone-900">{formatPKR(ord.grandTotal)}</span>
                        <span className="text-[10px] font-bold uppercase rounded-xs px-1.5 py-0.5 bg-stone-100 block border text-stone-700 mt-0.5">
                          {ord.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-200">
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
