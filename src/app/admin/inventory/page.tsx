'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPKR } from '@/lib/utils';
import { Search, AlertTriangle, Save, RefreshCw, ArrowLeft, Filter, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [editingStocks, setEditingStocks] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        stockFilter,
      });

      const res = await fetch(`/api/admin/inventory?${queryParams.toString()}`);
      const data = await res.json();
      if (data.inventory) {
        setItems(data.inventory);
        const initialStocks: Record<string, number> = {};
        data.inventory.forEach((it: any) => {
          initialStocks[it.id] = it.stockQuantity;
        });
        setEditingStocks(initialStocks);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search, stockFilter]);

  const handleStockChange = (variantId: string, val: string) => {
    const num = parseInt(val, 10);
    setEditingStocks((prev) => ({
      ...prev,
      [variantId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleSaveStock = async (variantId: string) => {
    setSavingId(variantId);
    setSuccessMsg(null);
    const newStock = editingStocks[variantId];

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, stockQuantity: newStock }),
      });
      if (res.ok) {
        setSuccessMsg('Stock updated successfully!');
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

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
              Inventory & Stock Management
            </h1>
            <p className="text-xs text-stone-500">
              Monitor product variants, low stock alerts, and adjust inventory quantities.
            </p>
          </div>
        </div>

        <button
          onClick={fetchInventory}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 text-stone-800 text-xs font-semibold rounded-xs border hover:bg-stone-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Inventory</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50 p-4 rounded-sm border border-stone-200">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search product, SKU, size, color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xs focus:outline-none focus:border-stone-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-white border border-stone-200 rounded-xs px-3 py-2 font-medium text-stone-800 focus:outline-none"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="LOW_STOCK">Low Stock (≤ 5 units)</option>
            <option value="OUT_OF_STOCK">Out of Stock (0 units)</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-stone-200 rounded-sm overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-100/80 text-[11px] font-bold uppercase tracking-wider text-stone-600 border-b border-stone-200">
              <tr>
                <th className="p-3.5">Product & Brand</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Size / Color</th>
                <th className="p-3.5">Retail Price</th>
                <th className="p-3.5">Stock Status</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    Loading inventory...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500 font-serif">
                    No product variants match filter.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 font-medium">
                      <span className="font-bold text-stone-900 block">{it.productName}</span>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold">
                        {it.brandName}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-stone-600">{it.sku}</td>

                    <td className="p-3.5 font-medium">
                      <span className="bg-stone-100 border border-stone-200 text-stone-800 px-2 py-0.5 rounded-2xs text-[11px]">
                        {it.size}
                      </span>
                      {it.color && <span className="ml-1.5 text-stone-500">({it.color})</span>}
                    </td>

                    <td className="p-3.5 font-bold text-stone-900">
                      {formatPKR(it.salePrice || it.retailPrice)}
                    </td>

                    <td className="p-3.5">
                      {it.status === 'OUT_OF_STOCK' ? (
                        <span className="px-2 py-0.5 bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold uppercase rounded-xs">
                          Out of Stock
                        </span>
                      ) : it.status === 'LOW_STOCK' ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold uppercase rounded-xs flex items-center gap-1 w-fit">
                          <AlertTriangle className="h-3 w-3 text-amber-700" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase rounded-xs">
                          In Stock
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <input
                        type="number"
                        min="0"
                        value={editingStocks[it.id] !== undefined ? editingStocks[it.id] : it.stockQuantity}
                        onChange={(e) => handleStockChange(it.id, e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-bold text-stone-900 bg-white border border-stone-300 rounded-xs focus:outline-none focus:border-stone-500"
                      />
                    </td>

                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={savingId === it.id || editingStocks[it.id] === it.stockQuantity}
                        onClick={() => handleSaveStock(it.id)}
                        className="flex items-center gap-1 ml-auto"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>{savingId === it.id ? 'Saving...' : 'Update'}</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
