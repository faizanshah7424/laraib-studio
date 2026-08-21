const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Laraib Studio database...');

  // 1. Seed Store Settings
  const settings = [
    {
      key: 'store_name',
      value: 'Laraib Studio',
      description: 'Official brand name for the storefront',
    },
    {
      key: 'whatsapp_number',
      value: '03702393767',
      description: 'Official WhatsApp support and ordering phone number',
    },
    {
      key: 'karachi_delivery_fee',
      value: '200',
      description: 'Flat Karachi delivery fee in PKR',
    },
    {
      key: 'new_arrival_duration_days',
      value: '14',
      description: 'Number of days from publishedAt to mark as New Arrival automatically',
    },
    {
      key: 'announcement_text',
      value: 'Karachi Delivery Only: Flat PKR 200 Delivery Across Karachi | 3-Day WhatsApp Return Support',
      description: 'Header announcement bar text',
    },
    {
      key: 'bank_name',
      value: 'Meezan Bank Ltd',
      description: 'Official bank name for account transfer orders',
    },
    {
      key: 'bank_account_title',
      value: 'LARAIB STUDIO',
      description: 'Official account title',
    },
    {
      key: 'bank_account_number',
      value: '01010101010101',
      description: 'Official account number',
    },
    {
      key: 'bank_iban',
      value: 'PK45MEZN0001010101010101',
      description: 'Official IBAN number',
    },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }

  // 2. Seed Default Admin User
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@laraibstudio.pk';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'LaraibAdmin2026!#';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: 'Laraib Studio Admin' },
    create: {
      email: adminEmail,
      name: 'Laraib Studio Admin',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  // 3. Seed Default Categories
  const categories = [
    {
      name: 'Women Pret',
      slug: 'women-pret',
      description: 'Ready-to-wear kurtis, 2-piece and 3-piece stitched suits',
      displayOrder: 1,
    },
    {
      name: 'Unstitched Luxury',
      slug: 'unstitched-luxury',
      description: 'Premium embroidered lawn, chiffon, silk, and organza unstitched fabrics',
      displayOrder: 2,
    },
    {
      name: 'Men Kurta & Casuals',
      slug: 'men-kurta',
      description: 'Tailored Egyptian cotton kurtas, shalwar kameez, and waistcoats',
      displayOrder: 3,
    },
    {
      name: 'Festive & Formal',
      slug: 'festive-formal',
      description: 'Handcrafted luxury party wear and occasion collections',
      displayOrder: 4,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, displayOrder: cat.displayOrder },
      create: cat,
    });
  }

  // 4. Seed Default Brands
  const brands = [
    {
      name: 'Laraib Studio Signature',
      slug: 'laraib-studio-signature',
      description: 'Flagship curated in-house collections',
    },
    {
      name: 'Laraib Heritage',
      slug: 'laraib-heritage',
      description: 'Traditional craft, embroidery, and timeless textiles',
    },
    {
      name: 'Laraib Homme',
      slug: 'laraib-homme',
      description: 'Men’s essential and formal eastern wear',
    },
  ];

  for (const b of brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, description: b.description },
      create: b,
    });
  }

  // 5. Seed Initial Sample Products
  const pretCat = await prisma.category.findUnique({ where: { slug: 'women-pret' } });
  const luxuryCat = await prisma.category.findUnique({ where: { slug: 'unstitched-luxury' } });
  const menCat = await prisma.category.findUnique({ where: { slug: 'men-kurta' } });
  const formalCat = await prisma.category.findUnique({ where: { slug: 'festive-formal' } });

  const sigBrand = await prisma.brand.findUnique({ where: { slug: 'laraib-studio-signature' } });
  const herBrand = await prisma.brand.findUnique({ where: { slug: 'laraib-heritage' } });
  const hommeBrand = await prisma.brand.findUnique({ where: { slug: 'laraib-homme' } });

  // Seed a Sale
  const eidSale = await prisma.sale.upsert({
    where: { slug: 'mid-season-sale' },
    update: {
      title: 'Mid-Season Luxury Sale',
      discountPercentage: 15,
      isActive: true,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
    },
    create: {
      title: 'Mid-Season Luxury Sale',
      slug: 'mid-season-sale',
      bannerText: 'Up to 20% OFF on Selected Luxury Pret & Unstitched Suits',
      discountPercentage: 15,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
  });

  const productsData = [
    {
      name: 'Embroidered Swiss Lawn 3-Piece Festive Suit',
      slug: 'embroidered-swiss-lawn-3-piece-festive-suit',
      description: 'Intricately embroidered premium Swiss lawn shirt with organza border, digitally printed silk dupatta, and dyed cambric trouser.',
      material: 'Swiss Lawn & Printed Silk',
      gender: 'WOMEN',
      retailPrice: 4850,
      salePrice: 4200,
      wholesalePrice: 2900,
      supplierNotes: 'Sourced from Tariq Road Franchise batch #402. High demand colorway.',
      supplierBrand: 'Khaadi Original Catalog Drops',
      isFeatured: true,
      isNewArrival: true,
      isPublished: true,
      categoryId: luxuryCat?.id,
      brandId: herBrand?.id,
      saleId: eidSale?.id,
      publishedAt: new Date(),
      images: [
        { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800', altText: 'Front View', displayOrder: 1, isThumbnail: true },
        { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800', altText: 'Dupatta Detail', displayOrder: 2, isThumbnail: false },
      ],
      variants: [
        { size: 'Unstitched', color: 'Emerald Green', colorHex: '#065F46', stockQuantity: 15, sku: 'SL-01-GRN' },
        { size: 'Stitched Medium', color: 'Emerald Green', colorHex: '#065F46', stockQuantity: 8, sku: 'SL-01-M' },
      ],
    },
    {
      name: 'Midnight Black Raw Silk Pret Kurti',
      slug: 'midnight-black-raw-silk-pret-kurti',
      description: 'Statement raw silk tailored kurti featuring delicate gold tilla threadwork along neckline and cuffs.',
      material: 'Pure Raw Silk',
      gender: 'WOMEN',
      retailPrice: 3600,
      salePrice: null,
      wholesalePrice: 2100,
      supplierNotes: 'Supplier: Zamzama Wholesale Hub. Margin: PKR 1500.',
      supplierBrand: 'Zari Pret Direct',
      isFeatured: true,
      isNewArrival: true,
      isPublished: true,
      categoryId: pretCat?.id,
      brandId: sigBrand?.id,
      publishedAt: new Date(),
      images: [
        { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800', altText: 'Front Shot', displayOrder: 1, isThumbnail: true },
        { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800', altText: 'Side Detail', displayOrder: 2, isThumbnail: false },
      ],
      variants: [
        { size: 'Small', color: 'Midnight Black', colorHex: '#111111', stockQuantity: 6, sku: 'BLK-S' },
        { size: 'Medium', color: 'Midnight Black', colorHex: '#111111', stockQuantity: 10, sku: 'BLK-M' },
        { size: 'Large', color: 'Midnight Black', colorHex: '#111111', stockQuantity: 4, sku: 'BLK-L' },
      ],
    },
    {
      name: 'Men Classic Giza Egyptian Cotton Kurta',
      slug: 'men-classic-giza-egyptian-cotton-kurta',
      description: 'Refined men’s staple kurta tailored from long-staple Egyptian Giza cotton with crisp band collar.',
      material: '100% Egyptian Giza Cotton',
      gender: 'MEN',
      retailPrice: 2950,
      salePrice: 2500,
      wholesalePrice: 1650,
      supplierNotes: 'Boltan Market Fabric Mills batch A1. Very smooth texture.',
      supplierBrand: 'Homme Essentials PK',
      isFeatured: true,
      isNewArrival: false,
      isPublished: true,
      categoryId: menCat?.id,
      brandId: hommeBrand?.id,
      saleId: eidSale?.id,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      images: [
        { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800', altText: 'Men Kurta White', displayOrder: 1, isThumbnail: true },
      ],
      variants: [
        { size: 'Small (38)', color: 'Off White', colorHex: '#FAF8F5', stockQuantity: 12, sku: 'MK-WHT-38' },
        { size: 'Medium (40)', color: 'Off White', colorHex: '#FAF8F5', stockQuantity: 14, sku: 'MK-WHT-40' },
        { size: 'Large (42)', color: 'Off White', colorHex: '#FAF8F5', stockQuantity: 9, sku: 'MK-WHT-42' },
      ],
    },
    {
      name: 'Chiffon Dupatta Embroidered 2-Piece Pret',
      slug: 'chiffon-dupatta-embroidered-2-piece-pret',
      description: 'Chic stitched two-piece outfit with handcrafted thread embroidered neckline and pure crinkle chiffon dupatta.',
      material: 'Slub Lawn & Crinkle Chiffon',
      gender: 'WOMEN',
      retailPrice: 3800,
      salePrice: null,
      wholesalePrice: 2300,
      supplierNotes: 'Rabi Center Vendor #12. Hand embroidery.',
      supplierBrand: 'Silk Route Pret',
      isFeatured: false,
      isNewArrival: true,
      isPublished: true,
      categoryId: pretCat?.id,
      brandId: sigBrand?.id,
      publishedAt: new Date(),
      images: [
        { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800', altText: 'Chiffon Set Front', displayOrder: 1, isThumbnail: true },
      ],
      variants: [
        { size: 'Small', color: 'Ruby Maroon', colorHex: '#881337', stockQuantity: 5, sku: 'CHF-MRN-S' },
        { size: 'Medium', color: 'Ruby Maroon', colorHex: '#881337', stockQuantity: 7, sku: 'CHF-MRN-M' },
      ],
    },
    {
      name: 'Royal Velvet Embroidered Festive Kaftan',
      slug: 'royal-velvet-embroidered-festive-kaftan',
      description: 'Opulent micro-velvet kaftan featuring zardozi and sequins border along sleeve cuffs and neckline.',
      material: 'Micro Velvet 9000',
      gender: 'WOMEN',
      retailPrice: 7500,
      salePrice: 6500,
      wholesalePrice: 4800,
      supplierNotes: 'Winter Festive Drop. High margin piece.',
      supplierBrand: 'Laraib Royal Privé',
      isFeatured: true,
      isNewArrival: false,
      isPublished: true,
      categoryId: formalCat?.id,
      brandId: sigBrand?.id,
      saleId: eidSale?.id,
      publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago (Not new arrival by date unless flagged)
      images: [
        { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800', altText: 'Velvet Kaftan Front', displayOrder: 1, isThumbnail: true },
      ],
      variants: [
        { size: 'Free Size', color: 'Navy Blue', colorHex: '#1E3A8A', stockQuantity: 10, sku: 'VLV-NVY-FS' },
      ],
    },
  ];

  for (const item of productsData) {
    const { images, variants, ...prodData } = item;
    const existing = await prisma.product.findUnique({ where: { slug: prodData.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          ...prodData,
          images: {
            create: images,
          },
          variants: {
            create: variants,
          },
        },
      });
    }
  }

  console.log('Database seeded successfully with store settings, admin user, categories, brands, and products!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

