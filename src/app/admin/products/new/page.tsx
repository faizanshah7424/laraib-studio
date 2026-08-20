'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PublicCategory, PublicBrand } from '@/types';
import { STANDARD_SIZES, STANDARD_COLORS } from '@/lib/constants';
import { AdminImageUploader, ImageItem } from '@/components/admin/AdminImageUploader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, Save, Plus, AlertCircle, CheckCircle2, Lock, Eye, Sparkles } from 'lucide-react';

export default function RapidProductNewPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [brands, setBrands] = useState<PublicBrand[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [gender, setGender] = useState<'WOMEN' | 'MEN' | 'UNISEX'>('WOMEN');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');

  // Sensitive Internal vs Public Pricing
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [supplierNotes, setSupplierNotes] = useState('');
  const [supplierBrand, setSupplierBrand] = useState('');

  // Attributes & Variants
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['Unstitched']);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [stockQuantity, setStockQuantity] = useState('10');
  const [sku, setSku] = useState('');

  // Images
  const [images, setImages] = useState<ImageItem[]>([]);

  // Toggles
  const [isPublished, setIsPublished] = useState(true);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick Inline Category/Brand Creation State
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/brands'),
        ]);
        const catData = await catRes.json();
        const brandData = await brandRes.json();

        if (catData.categories) setCategories(catData.categories);
        if (brandData.brands) setBrands(brandData.brands);
      } catch (err) {
        console.error('Failed to load categories/brands:', err);
      } finally {
        setIsLoadingMetadata(false);
      }
    }
    loadData();
  }, []);

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter((s) => s !== size));
      }
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const toggleColor = (colorName: string) => {
    if (selectedColors.includes(colorName)) {
      setSelectedColors(selectedColors.filter((c) => c !== colorName));
    } else {
      setSelectedColors([...selectedColors, colorName]);
    }
  };

  const handleQuickAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (data.category) {
        setCategories([...categories, data.category]);
        setCategoryId(data.category.id);
        setNewCatName('');
        setShowAddCatModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBrandName.trim() }),
      });
      const data = await res.json();
      if (data.brand) {
        setBrands([...brands, data.brand]);
        setBrandId(data.brand.id);
        setNewBrandName('');
        setShowAddBrandModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Client validation
    if (!name.trim()) {
      setErrorMsg('Product name is required');
      return;
    }
    if (!retailPrice || parseFloat(retailPrice) < 0) {
      setErrorMsg('Valid retail price is required');
      return;
    }
    if (!wholesalePrice || parseFloat(wholesalePrice) < 0) {
      setErrorMsg('Valid wholesale price is required (Internal Admin Info)');
      return;
    }
    if (isPublished && images.length === 0) {
      setErrorMsg('Published products must have at least one product photo uploaded.');
      return;
    }

    setIsSubmitting(true);

    // Construct Variants
    const variants = selectedSizes.map((sz) => ({
      size: sz,
      color: selectedColors.length > 0 ? selectedColors.join(', ') : null,
      stockQuantity: parseInt(stockQuantity || '10', 10),
      sku: sku.trim() || undefined,
    }));

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: customSlug.trim() || undefined,
          description: description.trim() || undefined,
          material: material.trim() || undefined,
          gender,
          retailPrice: parseFloat(retailPrice),
          salePrice: salePrice ? parseFloat(salePrice) : null,
          wholesalePrice: parseFloat(wholesalePrice),
          supplierNotes: supplierNotes.trim() || undefined,
          supplierBrand: supplierBrand.trim() || undefined,
          isPublished,
          isNewArrival,
          isFeatured,
          categoryId: categoryId || undefined,
          brandId: brandId || undefined,
          images,
          variants,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create product');
      }

      setSuccessMsg(`Product "${name}" published successfully to Laraib Studio catalog!`);
      // Clear form for rapid next drop
      setName('');
      setCustomSlug('');
      setDescription('');
      setMaterial('');
      setWholesalePrice('');
      setRetailPrice('');
      setSalePrice('');
      setSupplierNotes('');
      setSupplierBrand('');
      setImages([]);
      setSku('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error publishing product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-accent">
              <Sparkles className="h-4 w-4" />
              <span>WhatsApp Daily Drop Entry</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              Rapid Product Entry
            </h1>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          <span>{isSubmitting ? 'Publishing...' : 'Publish Product'}</span>
        </Button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xs">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <div className="flex gap-2">
            <Link href="/collections/new-in" target="_blank" className="underline font-bold text-emerald-900">
              View New Arrivals Storefront
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: PUBLIC PRODUCT INFO */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <Eye className="h-4 w-4 text-emerald-700" />
            <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900">
              1. Public Storefront Information (Visible to Customers)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Product Title *"
              placeholder="e.g. Embroidered Swiss Lawn 3-Piece Festive Suit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Gender *"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                options={[
                  { label: 'Women', value: 'WOMEN' },
                  { label: 'Men', value: 'MEN' },
                  { label: 'Unisex', value: 'UNISEX' },
                ]}
              />

              <Input
                label="Material / Fabric"
                placeholder="e.g. Swiss Lawn & Silk"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(!showAddCatModal)}
                  className="text-xs text-brand-dark font-medium hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Quick Add
                </button>
              </div>

              {showAddCatModal && (
                <div className="flex gap-2 mb-2 bg-stone-50 p-2 rounded-xs border">
                  <input
                    type="text"
                    placeholder="New category name"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 text-xs px-2 py-1 border rounded-xs"
                  />
                  <Button size="sm" onClick={handleQuickAddCategory}>
                    Add
                  </Button>
                </div>
              )}

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-xs p-2.5 focus:outline-none focus:border-stone-400"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Brand / Collection Tag
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddBrandModal(!showAddBrandModal)}
                  className="text-xs text-brand-dark font-medium hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Quick Add
                </button>
              </div>

              {showAddBrandModal && (
                <div className="flex gap-2 mb-2 bg-stone-50 p-2 rounded-xs border">
                  <input
                    type="text"
                    placeholder="New brand name"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    className="flex-1 text-xs px-2 py-1 border rounded-xs"
                  />
                  <Button size="sm" onClick={handleQuickAddBrand}>
                    Add
                  </Button>
                </div>
              )}

              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-xs p-2.5 focus:outline-none focus:border-stone-400"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Textarea
            label="Product Description"
            placeholder="Detailed description of embroidery, suit components (shirt, dupatta, trouser), and style guide..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* SECTION 2: SENSITIVE SUPPLIER & PRICING */}
        <div className="bg-amber-50/40 p-6 rounded-sm border border-amber-200/80 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-700" />
              <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-amber-900">
                2. Pricing & Sensitive Internal Supplier Info (STRICTLY ADMIN ONLY)
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-xs">
              Never Exposed to Customers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Wholesale Price (Purchase Cost PKR) *"
              type="number"
              placeholder="e.g. 2900"
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(e.target.value)}
              helperText="Internal cost from franchise or wholesale supplier"
              required
            />

            <Input
              label="Retail Sale Price (PKR) *"
              type="number"
              placeholder="e.g. 4850"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              helperText="Public price charged on website"
              required
            />

            <Input
              label="Discounted Sale Price (Optional PKR)"
              type="number"
              placeholder="e.g. 4200"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              helperText="Leave empty if regular retail price"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-amber-200/60">
            <Input
              label="Supplier / Franchise Original Catalog Name"
              placeholder="e.g. Zamzama Vendor #12 / Khaadi Drop Batch 4"
              value={supplierBrand}
              onChange={(e) => setSupplierBrand(e.target.value)}
            />

            <Input
              label="Internal Supplier Notes"
              placeholder="e.g. Sourced from Tariq Road hub. High margin."
              value={supplierNotes}
              onChange={(e) => setSupplierNotes(e.target.value)}
            />
          </div>
        </div>

        {/* SECTION 3: MULTI-IMAGE UPLOADER */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-2xs">
          <AdminImageUploader images={images} onChange={setImages} />
        </div>

        {/* SECTION 4: VARIANTS & ATTRIBUTES */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-6 shadow-2xs">
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3">
            4. Sizes, Colors & Inventory
          </h3>

          {/* Quick Size Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
              Available Sizes
            </label>
            <div className="flex gap-2 flex-wrap">
              {STANDARD_SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xs border transition-all ${
                      isSelected
                        ? 'border-brand-dark bg-brand-dark text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Color Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
              Color Options (Optional)
            </label>
            <div className="flex gap-2 flex-wrap">
              {STANDARD_COLORS.map((c) => {
                const isSelected = selectedColors.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggleColor(c.name)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-xs border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-brand-dark bg-stone-900 text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <Input
              label="Default Stock Quantity per Variant"
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />

            <Input
              label="Custom SKU / Ref (Optional)"
              placeholder="e.g. SL-SWISS-01"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>
        </div>

        {/* SECTION 5: PUBLISHING TOGGLES */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-4 shadow-2xs">
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3">
            5. Catalog Drop Badges & Visibility
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-3 border border-stone-200 rounded-xs bg-stone-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded-xs text-brand-dark focus:ring-stone-400"
              />
              <div>
                <span className="text-xs font-bold text-stone-900 block">Published</span>
                <span className="text-[11px] text-stone-500">Live on storefront</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-stone-200 rounded-xs bg-stone-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="rounded-xs text-brand-dark focus:ring-stone-400"
              />
              <div>
                <span className="text-xs font-bold text-brand-accent block">New Arrival</span>
                <span className="text-[11px] text-stone-500">Show in Today's Drop</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-stone-200 rounded-xs bg-stone-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded-xs text-brand-dark focus:ring-stone-400"
              />
              <div>
                <span className="text-xs font-bold text-stone-900 block">Featured</span>
                <span className="text-[11px] text-stone-500">Showcase on Homepage</span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-stone-200">
          <Link href="/admin/products">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save className="h-5 w-5" />
            <span>{isSubmitting ? 'Publishing Product...' : 'Publish Product to Store'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
