'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { POPULAR_KARACHI_AREAS } from '@/lib/constants';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, User } from 'lucide-react';

export default function AccountProfilePage() {
  const router = useRouter();
  const { customer, isLoggedIn, isLoading, refreshProfile } = useCustomerAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [karachiArea, setKarachiArea] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/account/login');
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
      setWhatsapp(customer.whatsapp || '');
      setDeliveryAddress(customer.deliveryAddress || '');
      setKarachiArea(customer.karachiArea || '');
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Full name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          deliveryAddress: deliveryAddress.trim(),
          karachiArea: karachiArea.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update profile');
      }

      await refreshProfile();
      setSuccessMsg('Profile and default Karachi delivery details updated!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-stone-500 font-serif">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
        <Link
          href="/account"
          className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Account Profile & Address
          </h1>
          <p className="text-xs text-stone-500">
            Manage your customer information and default Karachi shipping destination.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xs">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm border border-stone-200 space-y-6 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Email Address (Read-only)
            </label>
            <input
              type="email"
              value={customer?.email || ''}
              disabled
              className="w-full text-xs font-medium text-stone-500 bg-stone-100 border border-stone-200 rounded-xs p-2.5 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone Number (for Delivery Riders)"
            placeholder="e.g. 0300 1234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="WhatsApp Hotline Number"
            placeholder="e.g. 0300 1234567"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>

        <div className="space-y-4 pt-2 border-t border-stone-200">
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900">
            Default Karachi Delivery Destination
          </h3>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Karachi Area / Locality
            </label>
            <select
              value={karachiArea}
              onChange={(e) => setKarachiArea(e.target.value)}
              className="w-full text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-xs p-2.5"
            >
              <option value="">Select Karachi area...</option>
              {POPULAR_KARACHI_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <Textarea
            label="Complete Delivery Address"
            placeholder="House/Apartment #, Street #"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-stone-200">
          <Button variant="primary" type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? 'Saving Profile...' : 'Save Profile Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
