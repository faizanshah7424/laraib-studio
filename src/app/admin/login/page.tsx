'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { STORE_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, ShieldAlert, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 border border-stone-200 shadow-luxury rounded-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-dark text-brand-accent rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark">
            {STORE_NAME} Staff Portal
          </h1>
          <p className="text-xs text-stone-500">
            Secure access for product management, wholesale pricing & orders.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-sm flex items-center gap-2 text-xs text-red-700">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Staff Email"
            type="email"
            required
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Sign In to Staff Panel
          </Button>
        </form>
      </div>
    </div>
  );
}
