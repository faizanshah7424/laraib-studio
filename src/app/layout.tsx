import type { Metadata } from 'next';
import './globals.css';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { STORE_NAME, KARACHI_DELIVERY_FEE } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    template: `%s | ${STORE_NAME}`,
    default: `${STORE_NAME} | Karachi Online Fashion & Daily Drops`,
  },
  description: `Shop curated luxury Pakistani fashion at ${STORE_NAME}. Daily new arrivals in women's & men's pret and unstitched collections. Fast Karachi delivery for flat PKR ${KARACHI_DELIVERY_FEE}.`,
  keywords: [
    'Laraib Studio',
    'Karachi Fashion',
    'Pakistani Clothes Karachi',
    'Women Pret Karachi',
    'Unstitched Lawn Karachi',
    'Mens Kurta Karachi',
    'Cash on Delivery Karachi',
  ],
  authors: [{ name: 'Laraib Studio' }],
  openGraph: {
    title: `${STORE_NAME} — Curated Fashion`,
    description: `Everyday luxury and daily fashion drops delivered across Karachi for PKR ${KARACHI_DELIVERY_FEE}.`,
    url: 'https://laraibstudio.pk',
    siteName: STORE_NAME,
    locale: 'en_PK',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col justify-between bg-brand-cream text-stone-900 selection:bg-brand-accent selection:text-white">
        <CustomerAuthProvider>
          <WishlistProvider>
            <CartProvider>
              <div>
                <AnnouncementBar />
                <Header />
                <main>{children}</main>
              </div>
              <Footer />
              <WhatsAppFloatingButton />
              <CartDrawer />
            </CartProvider>
          </WishlistProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
