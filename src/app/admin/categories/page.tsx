'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Layers, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setParentId('');
    setImageUrl('');
    setDisplayOrder('0');
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setParentId(cat.parentId || '');
    setImageUrl(cat.imageUrl || '');
    setDisplayOrder(cat.displayOrder?.toString() || '0');
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
      parentId: parentId || null,
      imageUrl,
      displayOrder: parseInt(displayOrder, 10) || 0,
    };

    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

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
      fetchCategories();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this category? Products will remain unassigned.')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCategories();
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
              Category Management
            </h1>
            <p className="text-xs text-stone-500">
              Organize storefront collections, subcategories, slugs, and display hierarchy.
            </p>
          </div>
        </div>

        <Button variant="primary" onClick={openCreateModal} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          <span>Add New Category</span>
        </Button>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-stone-200 rounded-sm overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-100/80 text-[11px] font-bold uppercase tracking-wider text-stone-600 border-b border-stone-200">
              <tr>
                <th className="p-3.5">Category Name</th>
                <th className="p-3.5">Slug</th>
                <th className="p-3.5">Parent Category</th>
                <th className="p-3.5">Attached Products</th>
                <th className="p-3.5">Display Order</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500 font-serif">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-stone-900 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-brand-dark flex-shrink-0" />
                      <span>{cat.name}</span>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-stone-500">{cat.slug}</td>

                    <td className="p-3.5 text-stone-600">
                      {cat.parent ? cat.parent.name : <span className="text-stone-400">— Top Level</span>}
                    </td>

                    <td className="p-3.5 font-semibold text-stone-900">
                      {cat._count?.products || 0} Products
                    </td>

                    <td className="p-3.5 font-mono">{cat.displayOrder}</td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 rounded-xs hover:bg-stone-100"
                        title="Edit Category"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-red-500 hover:text-red-800 rounded-xs hover:bg-red-50"
                        title="Archive Category"
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

      {/* Category Create/Edit Modal */}
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
                {editingCategory ? 'Edit Category' : 'Create New Category'}
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
                label="Category Name *"
                placeholder="e.g. Unstitched Lawn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Parent Category (Optional)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-xs p-2.5"
                >
                  <option value="">None (Top-level Collection)</option>
                  {categories
                    .filter((c) => c.id !== editingCategory?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <Textarea
                label="Description"
                placeholder="Brief category description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />

              <Input
                label="Cover Image URL (Optional)"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />

              <Input
                label="Display Order (Sort Priority)"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
