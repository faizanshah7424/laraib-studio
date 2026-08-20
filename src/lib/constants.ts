// Store Constants & Karachi Configuration for Laraib Studio

export const STORE_NAME = 'Laraib Studio';
export const STORE_TAGLINE = 'Curated Pakistani Fashion & Daily Drops';
export const OFFICIAL_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923001234567';

// Delivery Configuration (Strictly Karachi Only)
export const DELIVERY_CITY = 'Karachi';
export const KARACHI_DELIVERY_FEE = 200; // PKR 200 flat delivery
export const DEFAULT_NEW_ARRIVAL_DAYS = 14;

// 3-Day WhatsApp Return Policy constant
export const RETURN_POLICY_DAYS = 3;
export const RETURN_POLICY_SUMMARY =
  'Contact Laraib Studio via WhatsApp within 3 days of delivery for issues or exchange inquiries.';

// Extensible Karachi Areas (Suggested common areas for convenience; form allows custom typing)
export const POPULAR_KARACHI_AREAS = [
  'DHA (Defence)',
  'Clifton',
  'Gulshan-e-Iqbal',
  'Gulistan-e-Jauhar',
  'PECHS / Tariq Road',
  'North Nazimabad',
  'Nazimabad',
  'Federal B Area (F.B Area)',
  'Bahria Town Karachi',
  'KDA Scheme 1 / Karsaz',
  'Saddar / Cantt',
  'Garden / Soldier Bazar',
  'Malir / Malir Cantt',
  'Gulshan-e-Maymar',
  'Buffer Zone / North Karachi',
  'Korangi / Landhi',
  'Shah Faisal Colony',
  'Site / Nazimabad West',
  'Other Karachi Area',
];

// Standard Size options for quick selection in Admin
export const STANDARD_SIZES = [
  'Unstitched',
  'XS',
  'Small',
  'Medium',
  'Large',
  'XL',
  'XXL',
  'Free Size',
];

// Standard Color options
export const STANDARD_COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Off White / Cream', hex: '#FAF8F5' },
  { name: 'Beige / Gold', hex: '#C5A880' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Emerald Green', hex: '#065F46' },
  { name: 'Ruby Maroon', hex: '#881337' },
  { name: 'Dusty Pink', hex: '#BE185D' },
  { name: 'Teal', hex: '#0F766E' },
  { name: 'Rust Orange', hex: '#C2410C' },
  { name: 'Mustard Yellow', hex: '#CA8A04' },
];

export const NAV_LINKS = [
  { label: 'New Arrivals', href: '/collections/new-in', highlight: true },
  { label: 'Women', href: '/collections/women' },
  { label: 'Men', href: '/collections/men' },
  { label: 'Sale', href: '/collections/sale', badge: 'Sale' },
  { label: 'About Us', href: '/pages/about' },
  { label: 'Contact', href: '/pages/contact' },
];
