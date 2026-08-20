'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Save, AlertCircle, CheckCircle2, Building2, Sliders, MessageCircle, Truck } from 'lucide-react';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('Laraib Studio');
  const [whatsappNumber, setWhatsappNumber] = useState('+923001234567');
  const [karachiDeliveryFee, setKarachiDeliveryFee] = useState('200');
  const [newArrivalDays, setNewArrivalDays] = useState('14');
  const [announcementText, setAnnouncementText] = useState(
    'Karachi Delivery Only: Flat PKR 200 Delivery Across Karachi | 3-Day WhatsApp Return Support'
  );

  // Bank Transfer Credentials
  const [bankName, setBankName] = useState('Meezan Bank Ltd');
  const [bankAccountTitle, setBankAccountTitle] = useState('LARAIB STUDIO');
  const [bankAccountNumber, setBankAccountNumber] = useState('01010101010101');
  const [bankIban, setBankIban] = useState('PK45MEZN0001010101010101');

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.settings) {
          const s = data.settings;
          if (s.store_name) setStoreName(s.store_name);
          if (s.whatsapp_number) setWhatsappNumber(s.whatsapp_number);
          if (s.karachi_delivery_fee) setKarachiDeliveryFee(s.karachi_delivery_fee);
          if (s.new_arrival_duration_days) setNewArrivalDays(s.new_arrival_duration_days);
          if (s.announcement_text) setAnnouncementText(s.announcement_text);

          if (s.bank_name) setBankName(s.bank_name);
          if (s.bank_account_title) setBankAccountTitle(s.bank_account_title);
          if (s.bank_account_number) setBankAccountNumber(s.bank_account_number);
          if (s.bank_iban) setBankIban(s.bank_iban);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    const settingsPayload = [
      { key: 'store_name', value: storeName, description: 'Storefront Name' },
      { key: 'whatsapp_number', value: whatsappNumber, description: 'Official WhatsApp Number' },
      { key: 'karachi_delivery_fee', value: karachiDeliveryFee, description: 'Flat Karachi Delivery Fee' },
      { key: 'new_arrival_duration_days', value: newArrivalDays, description: 'New Arrival Duration Days' },
      { key: 'announcement_text', value: announcementText, description: 'Header Announcement Bar' },
      { key: 'bank_name', value: bankName, description: 'Official Bank Name' },
      { key: 'bank_account_title', value: bankAccountTitle, description: 'Official Account Title' },
      { key: 'bank_account_number', value: bankAccountNumber, description: 'Official Account Number' },
      { key: 'bank_iban', value: bankIban, description: 'Official IBAN' },
    ];

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsPayload }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setSuccessMsg('Store settings and bank transfer account details updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-500 font-serif">
        Loading store settings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Store & Payment Configuration
          </h1>
          <p className="text-xs text-stone-500">
            Configure bank account credentials, WhatsApp hotline, and Karachi delivery parameters.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          <span>{isSubmitting ? 'Saving...' : 'Save Settings'}</span>
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
        {/* BANK TRANSFER CREDENTIALS */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <Building2 className="h-5 w-5 text-emerald-700" />
            <h2 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900">
              1. Configurable Bank Account Transfer Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Official Bank Name *"
              placeholder="e.g. Meezan Bank Ltd / HBL"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />

            <Input
              label="Account Title *"
              placeholder="e.g. LARAIB STUDIO"
              value={bankAccountTitle}
              onChange={(e) => setBankAccountTitle(e.target.value)}
              required
            />

            <Input
              label="Account Number *"
              placeholder="e.g. 01010101010101"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              required
            />

            <Input
              label="IBAN Number *"
              placeholder="e.g. PK45MEZN0001010101010101"
              value={bankIban}
              onChange={(e) => setBankIban(e.target.value)}
              required
            />
          </div>
        </div>

        {/* STORE & DELIVERY CONFIG */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <Sliders className="h-5 w-5 text-brand-dark" />
            <h2 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900">
              2. Storefront & Karachi Delivery Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Official WhatsApp Support Phone Number *"
              placeholder="e.g. +923001234567"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              required
            />

            <Input
              label="Karachi Flat Delivery Fee (PKR) *"
              type="number"
              value={karachiDeliveryFee}
              onChange={(e) => setKarachiDeliveryFee(e.target.value)}
              required
            />

            <Input
              label="New Arrival Duration (Days) *"
              type="number"
              value={newArrivalDays}
              onChange={(e) => setNewArrivalDays(e.target.value)}
              helperText="Days from publish date to flag as New Arrival automatically"
              required
            />

            <Input
              label="Storefront Brand Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>

          <Textarea
            label="Announcement Bar Text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
}
