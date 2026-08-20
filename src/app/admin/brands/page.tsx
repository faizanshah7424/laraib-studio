'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Edit2, Trash2, Tag, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/brands');
      const data = await res.json();
      if (data.brands) setBrands(data.brands);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openCreateModal = () => {
    setEditingBrand(null);
    setName('');
    setDescription('');
    setLogoUrl('');
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (b: any) => {
    setEditingBrand(b);
    setName(b.name);
    setDescription(b.description || '');
    setLogoUrl(b.logoUrl || '');
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const payload = {
      name,
      description,
      logoUrl,
    };

    try {
      const url = editingBrand ? `/api/admin/brands/${editingBrand.id}` : '/api/admin/brands';
      const method = editingBrand ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Operation failed');
      }

      setShowModal(false);
      fetchBrands();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this brand? Products will remain unassigned.')) return;
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBrands();
    } catch (err) {
      console.error(err);
    }
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
              Brand Management
            </h1>
            <p className="text-xs text-stone-500">
              Manage public storefront brands, logos, descriptions, and catalog associations.
            </p>
          </div>
        </div>

        <Button variant="primary" onClick={openCreateModal} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          <span>Add New Brand</span>
        </Button>
      </div>

      {/* Brands Table */}
      <div className="bg-white border border-stone-200 rounded-sm overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-100/80 text-[11px] font-bold uppercase tracking-wider text-stone-600 border-b border-stone-200">
              <tr>
                <th className="p-3.5">Brand Logo & Name</th>
                <th className="p-3.5">Slug</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Catalog Products</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400">
                    Loading brands...
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500 font-serif">
                    No brands found.
                  </td>
                </tr>
              ) : (
                brands.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-stone-900 flex items-center gap-3">
                      {b.logoUrl ? (
                        <div className="w-8 h-8 relative rounded-full overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0">
                          <Image src={b.logoUrl} alt={b.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 flex-shrink-0">
                          <Tag className="h-4 w-4" />
                        </div>
                      )}
                      <span>{b.name}</span>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-stone-500">{b.slug}</td>

                    <td className="p-3.5 text-stone-600 line-clamp-1 max-w-xs">
                      {b.description || <span className="text-stone-400">—</span>}
                    </td>

                    <td className="p-3.5 font-semibold text-stone-900">
                      {b._count?.products || 0} Products
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(b)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 rounded-xs hover:bg-stone-100"
                        title="Edit Brand"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 text-red-500 hover:text-red-800 rounded-xs hover:bg-red-50"
                        title="Archive Brand"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Brand Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-stone-200 pb-3">
              <h2 className="text-xl font-serif font-bold text-stone-900">
                {editingBrand ? 'Edit Brand' : 'Create New Brand'}
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
                label="Brand Name *"
                placeholder="e.g. Maria.B, Sana Safinaz, Gul Ahmed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Textarea
                label="Description"
                placeholder="Brief brand description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />

              <Input
                label="Logo Image URL (Optional)"
                placeholder="https://..."
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingBrand ? 'Save Changes' : 'Create Brand'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
