'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPKR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  ShoppingBag,
  Truck,
  Building2,
  PackagePlus,
  Sliders,
  DollarSign,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  Tag,
  Percent,
  Users,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'sevenDays' | 'thirtyDays'>('sevenDays');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      if (json.overview) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const currentPeriodMetrics = data?.timePeriods ? data.timePeriods[period] : { count: 0, revenue: 0, estimatedProfit: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-brand-accent">
            Business Operations Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Laraib Studio Business Overview
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time sales performance, Karachi fulfillment, inventory alerts & wholesale margin management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-xs hover:bg-stone-50 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link href="/admin/products/new">
            <Button variant="primary" size="sm" className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Rapid Product Drop</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Real-time Business Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-sm border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            Total Orders
          </span>
          <p className="text-2xl font-serif font-bold text-stone-900">
            {loading ? '...' : data?.overview.totalOrders}
          </p>
          <span className="text-[10px] text-stone-400">All-time recorded</span>
        </div>

        <div className="bg-white p-4 rounded-sm border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Pending Orders
          </span>
          <p className="text-2xl font-serif font-bold text-amber-800">
            {loading ? '...' : data?.overview.pendingOrders}
          </p>
          <span className="text-[10px] text-stone-400">Awaiting processing</span>
        </div>

        <div className="bg-white p-4 rounded-sm border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
            Delivered Orders
          </span>
          <p className="text-2xl font-serif font-bold text-emerald-800">
            {loading ? '...' : data?.overview.deliveredOrders}
          </p>
          <span className="text-[10px] text-stone-400">Fulfilled in Karachi</span>
        </div>

        <div className="bg-white p-4 rounded-sm border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            Active Catalog
          </span>
          <p className="text-2xl font-serif font-bold text-stone-900">
            {loading ? '...' : data?.overview.activeProducts}
          </p>
          <span className="text-[10px] text-stone-400">Published products</span>
        </div>

        <div className="bg-white p-4 rounded-sm border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 block flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Low Stock Variants
          </span>
          <p className="text-2xl font-serif font-bold text-red-700">
            {loading ? '...' : data?.overview.lowStockProducts}
          </p>
          <span className="text-[10px] text-stone-400">Stock ≤ 5 units</span>
        </div>
      </div>

      {/* Time Period Sales Overview Card (Internal Business Profit View) */}
      <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-700" />
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Sales Performance & Profit Estimate
              </h2>
              <span className="text-[10px] text-stone-400">
                Internal calculation based on wholesale purchase price vs retail price
              </span>
            </div>
          </div>

          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xs border text-xs">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1 font-semibold rounded-xs transition-colors ${
                period === 'today' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriod('sevenDays')}
              className={`px-3 py-1 font-semibold rounded-xs transition-colors ${
                period === 'sevenDays' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setPeriod('thirtyDays')}
              className={`px-3 py-1 font-semibold rounded-xs transition-colors ${
                period === 'thirtyDays' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-1">
            <span className="text-xs text-stone-500 font-medium block">Total Orders</span>
            <p className="text-2xl font-bold text-stone-900">{currentPeriodMetrics.count} Orders</p>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xs space-y-1">
            <span className="text-xs text-emerald-800 font-medium block">Total Gross Revenue</span>
            <p className="text-2xl font-bold text-emerald-900">{formatPKR(currentPeriodMetrics.revenue)}</p>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xs space-y-1">
            <span className="text-xs text-amber-900 font-medium block flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-amber-700" />
              <span>Estimated Internal Profit (Admin Only)</span>
            </span>
            <p className="text-2xl font-bold text-amber-900">{formatPKR(currentPeriodMetrics.estimatedProfit)}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Operations Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/orders"
          className="group bg-white p-5 border border-stone-200 rounded-sm shadow-2xs hover:shadow-luxury-hover hover:border-stone-300 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-sm flex items-center justify-center">
              <Truck className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-emerald-700 transition-colors" />
          </div>
          <h3 className="font-serif font-bold text-base text-stone-900">
            Order Fulfillment Center
          </h3>
          <p className="text-xs text-stone-500">
            Process Karachi COD & Bank Transfer orders, update status, and manage profit margins.
          </p>
        </Link>

        <Link
          href="/admin/inventory"
          className="group bg-white p-5 border border-stone-200 rounded-sm shadow-2xs hover:shadow-luxury-hover hover:border-stone-300 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 bg-red-50 text-red-700 border border-red-200 rounded-sm flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-red-700 transition-colors" />
          </div>
          <h3 className="font-serif font-bold text-base text-stone-900">
            Inventory & Stock Control
          </h3>
          <p className="text-xs text-stone-500">
            Monitor low stock variants, out of stock sizes, and update stock quantities directly.
          </p>
        </Link>

        <Link
          href="/admin/products"
          className="group bg-white p-5 border border-stone-200 rounded-sm shadow-2xs hover:shadow-luxury-hover hover:border-stone-300 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 bg-brand-cream text-brand-dark border border-stone-200 rounded-sm flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-brand-accent transition-colors" />
          </div>
          <h3 className="font-serif font-bold text-base text-stone-900">
            Catalog Management
          </h3>
          <p className="text-xs text-stone-500">
            Search, filter by brand/category, toggle publish, and archive catalog items.
          </p>
        </Link>

        <Link
          href="/admin/categories"
          className="group bg-white p-5 border border-stone-200 rounded-sm shadow-2xs hover:shadow-luxury-hover hover:border-stone-300 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 bg-stone-100 text-stone-800 border border-stone-200 rounded-sm flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-stone-900 transition-colors" />
          </div>
          <h3 className="font-serif font-bold text-base text-stone-900">
            Category Management
          </h3>
          <p className="text-xs text-stone-500">
            Organize catalog categories, subcategories, slugs, and display hierarchy.
          </p>
        </Link>

        <Link
          href="/admin/brands"
          className="group bg-white p-5 border border-stone-200 rounded-sm shadow-2xs hover:shadow-luxury-hover hover:border-stone-300 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 bg-stone-100 text-stone-800 border border-stone-200 rounded-sm flex items-center justify-center">
              <Tag className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-stone-900 transition-colors" />
          </div>
          <h3 className="font-serif font-bold text-base text-stone-900">
            Brand Management
          </h3>
          <p className="text-xs text-stone-500">
            Manage public product brands, logo URLs, and product associations.
          </p>
        </Link>

        <Link
          href="/admin/sales"
          className="group bg-white p-5 border border-stone-200 rounded-sm shadow-2xs hover:shadow-luxury-hover hover:border-stone-300 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 bg-stone-100 text-stone-800 border border-stone-200 rounded-sm flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-stone-900 transition-colors" />
          </div>
          <h3 className="font-serif font-bold text-base text-stone-900">
            Sales & Promotions
          </h3>
          <p className="text-xs text-stone-500">
            Create active/expired sale campaigns, start/end dates, and promotional prices.
          </p>
        </Link>

        <Link
          href="/admin/customers"
          className="group bg-white p-5 border border-stone-200 rounded-sm shadow-2xs hover:shadow-luxury-hover hover:border-stone-300 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 bg-stone-100 text-stone-800 border border-stone-200 rounded-sm flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-stone-900 transition-colors" />
          </div>
          <h3 className="font-serif font-bold text-base text-stone-900">
            Registered Customers
          </h3>
          <p className="text-xs text-stone-500">
            View customer order histories, contact information, and total lifetime spend.
          </p>
        </Link>

        <Link
          href="/admin/settings"
          className="group bg-white p-5 border border-stone-200 rounded-sm shadow-2xs hover:shadow-luxury-hover hover:border-stone-300 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 bg-stone-100 text-stone-800 border border-stone-200 rounded-sm flex items-center justify-center">
              <Sliders className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-stone-900 transition-colors" />
          </div>
          <h3 className="font-serif font-bold text-base text-stone-900">
            Centralized Site Settings
          </h3>
          <p className="text-xs text-stone-500">
            Bank account credentials, WhatsApp hotline, PKR 200 Karachi fee, and return policy.
          </p>
        </Link>
      </div>

      {/* Security & Sensitivity Reminder */}
      <div className="p-5 bg-stone-900 text-white rounded-sm border border-stone-800 space-y-1">
        <div className="flex items-center gap-2 text-brand-accent text-xs font-bold uppercase tracking-wider">
          <DollarSign className="h-4 w-4" />
          <span>Server-Side Data Security Active</span>
        </div>
        <p className="text-xs text-stone-300">
          Wholesale costs, internal notes, profit margins, and customer order details are strictly protected server-side and never exposed to public APIs or search engines.
        </p>
      </div>
    </div>
  );
}
