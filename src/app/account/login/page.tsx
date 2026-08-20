'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { POPULAR_KARACHI_AREAS } from '@/lib/constants';
import { Lock, User, Mail, AlertCircle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { login } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regArea, setRegArea] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/customer/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.customer);
      router.push('/account');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error logging in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/customer/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
          whatsapp: regWhatsapp || regPhone,
          deliveryAddress: regAddress,
          karachiArea: regArea,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Registration failed');
      }

      login(data.customer);
      router.push('/account');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 md:py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-accent">
          <Sparkles className="h-4 w-4" />
          <span>Laraib Studio Privé</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-stone-900">
          Customer Portal
        </h1>
        <p className="text-xs text-stone-500">
          Access your Karachi delivery address, order history, and saved wishlists.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => {
            setActiveTab('login');
            setErrorMsg(null);
          }}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
            activeTab === 'login'
              ? 'border-brand-dark text-brand-dark font-serif text-sm'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setActiveTab('register');
            setErrorMsg(null);
          }}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
            activeTab === 'register'
              ? 'border-brand-dark text-brand-dark font-serif text-sm'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          Create Account
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {activeTab === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="bg-white p-6 rounded-sm border border-stone-200 space-y-4 shadow-2xs">
          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. fatima@gmail.com"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
          />

          <Input
            label="Password *"
            type="password"
            placeholder="••••••••"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />

          <Button variant="primary" type="submit" className="w-full" disabled={isSubmitting} size="lg">
            {isSubmitting ? 'Signing In...' : 'Sign In to Account'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="bg-white p-6 rounded-sm border border-stone-200 space-y-4 shadow-2xs">
          <Input
            label="Full Name *"
            placeholder="e.g. Fatima Ahmed"
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. fatima@gmail.com"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            required
          />

          <Input
            label="Password (min 6 chars) *"
            type="password"
            placeholder="••••••••"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            placeholder="e.g. 0300 1234567"
            value={regPhone}
            onChange={(e) => setRegPhone(e.target.value)}
          />

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Karachi Area / Locality
            </label>
            <select
              value={regArea}
              onChange={(e) => setRegArea(e.target.value)}
              className="w-full text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-xs p-2.5"
            >
              <option value="">Select your Karachi area...</option>
              {POPULAR_KARACHI_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Default Delivery Address"
            placeholder="House/Apartment #, Street #"
            value={regAddress}
            onChange={(e) => setRegAddress(e.target.value)}
          />

          <Button variant="primary" type="submit" className="w-full" disabled={isSubmitting} size="lg">
            {isSubmitting ? 'Creating Account...' : 'Create Customer Account'}
          </Button>
        </form>
      )}
    </div>
  );
}
