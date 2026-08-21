'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPKR } from '@/lib/utils';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lock,
} from 'lucide-react';

export default function AdminProductsListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        admin: 'true',
        page: page.toString(),
        limit: '20',
        search,
      });

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();

      if (data.products) {
        let list = data.products;
        if (statusFilter === 'published') list = list.filter((p: any) => p.isPublished);
        if (statusFilter === 'draft') list = list.filter((p: any) => !p.isPublished);
        if (statusFilter === 'new') list = list.filter((p: any) => p.isNewArrival);
        if (statusFilter === 'sale') list = list.filter((p: any) => p.salePrice);

        setProducts(list);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, statusFilter]);

  const handleTogglePublished = async (product: any) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !product.isPublished }),
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleNewArrival = async (product: any) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isNewArrival: !product.isNewArrival }),
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeatured = async (product: any) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !product.isFeatured }),
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Product Management
          </h1>
          <p className="text-xs text-stone-500">
            Total {totalCount} product catalog drops in database. Wholesale costs are strictly internal.
          </p>
        </div>

        <Link href="/admin/products/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add New Product (Daily Drop)</span>
          </Button>
        </Link>
      </div>

      {/* Controls Bar (Search + Filter Tabs) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-stone-50 p-4 rounded-sm border border-stone-200">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name, brand, or supplier note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xs focus:outline-none focus:border-stone-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Products' },
            { id: 'published', label: 'Published' },
            { id: 'draft', label: 'Drafts' },
            { id: 'new', label: 'New Arrivals' },
            { id: 'sale', label: 'On Sale' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xs transition-all flex-shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-brand-dark text-white'
                  : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-stone-200 rounded-sm overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-100/80 text-[11px] font-bold uppercase tracking-wider text-stone-600 border-b border-stone-200">
              <tr>
                <th className="p-3.5">Item & Photo</th>
                <th className="p-3.5">Category / Brand</th>
                <th className="p-3.5">Retail Price</th>
                <th className="p-3.5 text-amber-900 bg-amber-50/50">
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-amber-700" />
                    <span>Wholesale Cost</span>
                  </div>
                </th>
                <th className="p-3.5">Status Toggles</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    Loading products list...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500 font-serif">
                    No products found matching query.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const thumbnail =
                    p.images?.find((i: any) => i.isThumbnail) ||
                    p.images?.[0] || {
                      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
                    };

                  const profit = p.retailPrice - p.wholesalePrice;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Photo & Name */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-16 flex-shrink-0 bg-stone-100 rounded-xs overflow-hidden border border-stone-200">
                            <Image
                              src={thumbnail.url}
                              alt={p.name}
                              fill
                              sizes="50px"
                              className="object-cover"
                            />
                          </div>
                          <div className="space-y-0.5 max-w-xs">
                            <Link
                              href={`/products/${p.slug}`}
                              target="_blank"
                              className="font-semibold text-stone-900 hover:text-brand-accent line-clamp-1"
                            >
                              {p.name}
                            </Link>
                            <span className="text-[11px] text-stone-400 block font-mono">
                              SKU: {p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category / Brand */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-stone-800 block">
                            {p.category?.name || 'Uncategorized'}
                          </span>
                          <span className="text-stone-500 text-[11px]">
                            {p.brand?.name || 'No Brand'}
                          </span>
                        </div>
                      </td>

                      {/* Retail Price */}
                      <td className="p-3.5 font-medium">
                        <div>
                          <span className="font-bold text-stone-900">
                            {formatPKR(p.salePrice || p.retailPrice)}
                          </span>
                          {p.salePrice && (
                            <span className="block text-[10px] text-red-600 line-through">
                              {formatPKR(p.retailPrice)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Wholesale Cost (ADMIN ONLY) */}
                      <td className="p-3.5 bg-amber-50/30">
                        <div className="space-y-0.5">
                          <span className="font-bold text-amber-900">
                            {formatPKR(p.wholesalePrice)}
                          </span>
                          <span className="block text-[10px] text-emerald-700 font-semibold">
                            Est. Margin: +{formatPKR(profit)}
                          </span>
                        </div>
                      </td>

                      {/* Status Toggles */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleTogglePublished(p)}
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs border flex items-center gap-1 transition-all ${
                              p.isPublished
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-stone-100 border-stone-300 text-stone-500'
                            }`}
                          >
                            {p.isPublished ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-stone-400" />
                                <span>Draft</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleNewArrival(p)}
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs border flex items-center gap-1 transition-all ${
                              p.isNewArrival
                                ? 'bg-amber-50 border-amber-300 text-amber-900'
                                : 'bg-stone-50 border-stone-200 text-stone-400'
                            }`}
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>New</span>
                          </button>

                          <button
                            onClick={() => handleToggleFeatured(p)}
                            className={`p-1 rounded-xs border transition-all ${
                              p.isFeatured
                                ? 'bg-amber-100 border-amber-300 text-amber-700'
                                : 'bg-stone-50 border-stone-200 text-stone-300'
                            }`}
                            title="Toggle Featured"
                          >
                            <Star className="h-3.5 w-3.5 fill-current" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-2">
                        <Link href={`/products/${p.slug}`} target="_blank">
                          <button
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xs transition-colors"
                            title="View Storefront Page"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <button
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xs transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xs transition-colors"
                          title="Delete Product"
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
    </div>
  );
}
