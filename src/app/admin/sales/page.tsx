'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Percent, AlertCircle, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export default function AdminSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('15');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSalesAndProducts = async () => {
    setLoading(true);
    try {
      const [salesRes, prodRes] = await Promise.all([
        fetch('/api/admin/sales'),
        fetch('/api/products?limit=100'),
      ]);
      const salesData = await salesRes.json();
      const prodData = await prodRes.json();

      if (salesData.sales) setSales(salesData.sales);
      if (prodData.products) setProducts(prodData.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesAndProducts();

    // Default dates for new sale
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setStartDate(now.toISOString().slice(0, 10));
    setEndDate(nextWeek.toISOString().slice(0, 10));
  }, []);

  const openCreateModal = () => {
    setTitle('');
    setBannerText('Exclusive Karachi Flash Sale — Limited Time');
    setDiscountPercentage('15');
    setSelectedProductIds([]);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const payload = {
      title,
      bannerText,
      discountPercentage,
      startDate,
      endDate,
      isActive: true,
      productIds: selectedProductIds,
    };

    try {
      const res = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create sale');
      }

      setShowModal(false);
      fetchSalesAndProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this sale campaign?')) return;
    try {
      const res = await fetch(`/api/admin/sales/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSalesAndProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleProductSelect = (pId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId]
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
              Sales & Promotions Management
            </h1>
            <p className="text-xs text-stone-500">
              Schedule promotional campaigns, start/end dates, banner copy, and sale pricing.
            </p>
          </div>
        </div>

        <Button variant="primary" onClick={openCreateModal} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          <span>Create Sale Campaign</span>
        </Button>
      </div>

      {/* Sales List Table */}
      <div className="bg-white border border-stone-200 rounded-sm overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-100/80 text-[11px] font-bold uppercase tracking-wider text-stone-600 border-b border-stone-200">
              <tr>
                <th className="p-3.5">Campaign Title</th>
                <th className="p-3.5">Discount %</th>
                <th className="p-3.5">Schedule</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Attached Products</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    Loading sales...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500 font-serif">
                    No promotional campaigns found.
                  </td>
                </tr>
              ) : (
                sales.map((s) => {
                  const now = new Date();
                  const isCurrentlyActive = s.isActive && new Date(s.startDate) <= now && new Date(s.endDate) >= now;

                  return (
                    <tr key={s.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900 flex items-center gap-2">
                        <Percent className="h-4 w-4 text-brand-dark flex-shrink-0" />
                        <div>
                          <span>{s.title}</span>
                          {s.bannerText && <span className="text-[10px] text-stone-400 block font-normal">{s.bannerText}</span>}
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-red-600 font-mono">
                        {s.discountPercentage ? `${s.discountPercentage}% OFF` : 'Custom Sale'}
                      </td>

                      <td className="p-3.5 text-stone-600 text-[11px]">
                        {new Date(s.startDate).toLocaleDateString('en-PK')} to{' '}
                        {new Date(s.endDate).toLocaleDateString('en-PK')}
                      </td>

                      <td className="p-3.5">
                        {isCurrentlyActive ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase rounded-xs">
                            Active Now
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-bold uppercase rounded-xs">
                            Inactive / Expired
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-semibold text-stone-900">
                        {s._count?.products || s.products?.length || 0} Products
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-red-500 hover:text-red-800 rounded-xs hover:bg-red-50"
                          title="Archive Campaign"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm max-w-xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-stone-200 pb-3">
              <h2 className="text-xl font-serif font-bold text-stone-900">
                Create Sale Campaign
              </h2>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xs">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <Input
                label="Campaign Title *"
                placeholder="e.g. Festive Lawn Clearance Sale"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <Input
                label="Header Banner Copy"
                placeholder="e.g. Karachi Flash Sale — Flat 15% OFF Lawn Drops"
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
              />

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Discount % *"
                  type="number"
                  placeholder="15"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  required
                />

                <Input
                  label="Start Date *"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />

                <Input
                  label="End Date *"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              {/* Product Selection List */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-900 block">
                  Select Products to Attach ({selectedProductIds.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-xs divide-y divide-stone-100 p-2">
                  {products.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProductSelect(p.id)}
                        className={`p-2 cursor-pointer rounded-2xs flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-stone-100 font-semibold' : 'hover:bg-stone-50'
                        }`}
                      >
                        <span className="line-clamp-1">{p.name}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="text-brand-dark focus:ring-0"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Launch Campaign'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
