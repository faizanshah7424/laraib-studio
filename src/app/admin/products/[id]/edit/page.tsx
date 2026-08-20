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
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Lock, Eye } from 'lucide-react';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default function AdminEditProductPage({ params }: EditProductPageProps) {
  const { id } = params;
  const router = useRouter();

  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [brands, setBrands] = useState<PublicBrand[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [stockQuantity, setStockQuantity] = useState('10');
  const [sku, setSku] = useState('');

  // Images
  const [images, setImages] = useState<ImageItem[]>([]);

  // Toggles
  const [isPublished, setIsPublished] = useState(true);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, brandRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/brands'),
          fetch(`/api/products/${id}`),
        ]);

        const catData = await catRes.json();
        const brandData = await brandRes.json();
        const prodData = await prodRes.json();

        if (catData.categories) setCategories(catData.categories);
        if (brandData.brands) setBrands(brandData.brands);

        if (prodData.product) {
          const p = prodData.product;
          setName(p.name || '');
          setCustomSlug(p.slug || '');
          setDescription(p.description || '');
          setMaterial(p.material || '');
          setGender(p.gender || 'WOMEN');
          setCategoryId(p.categoryId || '');
          setBrandId(p.brandId || '');

          setWholesalePrice(p.wholesalePrice ? p.wholesalePrice.toString() : '');
          setRetailPrice(p.retailPrice ? p.retailPrice.toString() : '');
          setSalePrice(p.salePrice ? p.salePrice.toString() : '');
          setSupplierNotes(p.supplierNotes || '');
          setSupplierBrand(p.supplierBrand || '');

          setIsPublished(Boolean(p.isPublished));
          setIsNewArrival(Boolean(p.isNewArrival));
          setIsFeatured(Boolean(p.isFeatured));

          if (p.images && p.images.length > 0) {
            setImages(
              p.images.map((img: any) => ({
                id: img.id,
                url: img.url,
                altText: img.altText || '',
                isThumbnail: Boolean(img.isThumbnail),
              }))
            );
          }

          if (p.variants && p.variants.length > 0) {
            const sizes = Array.from(new Set(p.variants.map((v: any) => v.size)));
            setSelectedSizes(sizes as string[]);
            setStockQuantity(p.variants[0].stockQuantity?.toString() || '10');
            setSku(p.variants[0].sku || '');
          }
        }
      } catch (err) {
        console.error('Failed to load product data:', err);
        setErrorMsg('Failed to load product data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Product name is required');
      return;
    }
    if (!retailPrice || parseFloat(retailPrice) < 0) {
      setErrorMsg('Valid retail price is required');
      return;
    }
    if (!wholesalePrice || parseFloat(wholesalePrice) < 0) {
      setErrorMsg('Valid wholesale price is required');
      return;
    }

    setIsSubmitting(true);

    const variants = selectedSizes.map((sz) => ({
      size: sz,
      color: selectedColors.length > 0 ? selectedColors.join(', ') : null,
      stockQuantity: parseInt(stockQuantity || '10', 10),
      sku: sku.trim() || undefined,
    }));

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
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
        throw new Error(data.error || 'Failed to update product');
      }

      setSuccessMsg('Product updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-stone-500 font-serif">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              Edit Product: {name}
            </h1>
            <p className="text-xs text-stone-500">
              Update pricing, photos, variants, or supplier info.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
        </Button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xs">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xs">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* PUBLIC INFO */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <Eye className="h-4 w-4 text-emerald-700" />
            <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900">
              1. Public Storefront Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Product Title *"
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
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-xs p-2.5"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Brand / Collection Tag
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-xs p-2.5"
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* INTERNAL PRICING */}
        <div className="bg-amber-50/40 p-6 rounded-sm border border-amber-200/80 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-700" />
              <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-amber-900">
                2. Pricing & Sensitive Internal Supplier Info (ADMIN ONLY)
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Wholesale Price (Purchase Cost PKR) *"
              type="number"
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(e.target.value)}
              required
            />

            <Input
              label="Retail Sale Price (PKR) *"
              type="number"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              required
            />

            <Input
              label="Discounted Sale Price (Optional PKR)"
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-amber-200/60">
            <Input
              label="Supplier Original Catalog Name"
              value={supplierBrand}
              onChange={(e) => setSupplierBrand(e.target.value)}
            />

            <Input
              label="Internal Supplier Notes"
              value={supplierNotes}
              onChange={(e) => setSupplierNotes(e.target.value)}
            />
          </div>
        </div>

        {/* MULTI-IMAGE UPLOADER */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-2xs">
          <AdminImageUploader images={images} onChange={setImages} />
        </div>

        {/* VARIANTS & ATTRIBUTES */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-6 shadow-2xs">
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3">
            4. Sizes & Inventory
          </h3>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <Input
              label="Default Stock Quantity per Variant"
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />

            <Input
              label="SKU / Ref"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>
        </div>

        {/* PUBLISHING TOGGLES */}
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
            <span>{isSubmitting ? 'Saving Changes...' : 'Save Product Changes'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
