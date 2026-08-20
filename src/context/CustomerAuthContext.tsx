'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  deliveryAddress?: string | null;
  karachiArea?: string | null;
}

interface CustomerAuthContextType {
  customer: CustomerProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (customerData: CustomerProfile) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/customer/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.customer) {
          setCustomer(data.customer);
        } else {
          setCustomer(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch customer profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = (customerData: CustomerProfile) => {
    setCustomer(customerData);
  };

  const logout = async () => {
    try {
      await fetch('/api/customer/auth/logout', { method: 'POST' });
      setCustomer(null);
    } catch (err) {
      console.error('Failed to logout customer:', err);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoggedIn: Boolean(customer),
        isLoading,
        login,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
