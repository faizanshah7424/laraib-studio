import prisma from '@/lib/db';
import { PublicProduct, PublicCategory, PublicBrand } from '@/types';
import { toPublicProduct, toPublicProductList } from './dto/product.dto';
import { DEFAULT_NEW_ARRIVAL_DAYS } from './constants';

export interface GetProductsOptions {
  categorySlug?: string;
  brandSlug?: string;
  gender?: 'WOMEN' | 'MEN' | 'UNISEX';
  isSale?: boolean;
  isNewIn?: boolean;
  isFeatured?: boolean;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: 'in-stock' | 'all';
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'featured';
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: PublicProduct[];
  totalCount: number;
  page: number;
  totalPages: number;
}

/**
 * Fetch configured new arrival duration in days from store settings
 */
export async function getNewArrivalDurationDays(): Promise<number> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'new_arrival_duration_days' },
    });
    if (setting && setting.value) {
      const parsed = parseInt(setting.value, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch (err) {
    console.error('Error fetching new_arrival_duration_days setting:', err);
  }
  return DEFAULT_NEW_ARRIVAL_DAYS;
}

/**
 * Server-side public products retrieval with full filtering, search, and sorting.
 * ABSOLUTE SECURITY GUARANTEE: Uses DTO conversion to strip wholesale & supplier data.
 */
export async function getPublicProducts(
  options: GetProductsOptions = {}
): Promise<ProductsResponse> {
  const newArrivalDays = await getNewArrivalDurationDays();
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 12;
  const skip = (page - 1) * limit;

  // Build Prisma Where Clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    isPublished: true,
  };

  // Category filter (support category slug)
  if (options.categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: options.categorySlug },
      include: { children: true },
    });

    if (category) {
      const childIds = category.children.map((c) => c.id);
      where.OR = [
        { categoryId: category.id },
        { categoryId: { in: childIds } },
      ];
    } else {
      where.category = { slug: options.categorySlug };
    }
  }

  // Brand filter
  if (options.brandSlug) {
    where.brand = { slug: options.brandSlug };
  }

  // Gender filter
  if (options.gender) {
    where.gender = options.gender;
  }

  // Featured filter
  if (options.isFeatured) {
    where.isFeatured = true;
  }

  // New In filter
  if (options.isNewIn) {
    const cutoffDate = new Date(Date.now() - newArrivalDays * 24 * 60 * 60 * 1000);
    const newInCondition = [
      { isNewArrival: true },
      { publishedAt: { gte: cutoffDate } },
    ];
    if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: newInCondition }];
      delete where.OR;
    } else {
      where.OR = newInCondition;
    }
  }

  // Sale filter
  if (options.isSale) {
    const now = new Date();
    where.OR = [
      { salePrice: { not: null } },
      {
        sale: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      },
    ];
  }

  // Search Query filter (Case-insensitive)
  if (options.searchQuery && options.searchQuery.trim() !== '') {
    const term = options.searchQuery.trim();
    const searchConditions = [
      { name: { contains: term } },
      { description: { contains: term } },
      { material: { contains: term } },
      { category: { name: { contains: term } } },
      { brand: { name: { contains: term } } },
    ];

    if (where.AND) {
      where.AND.push({ OR: searchConditions });
    } else if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: searchConditions }];
      delete where.OR;
    } else {
      where.OR = searchConditions;
    }
  }

  // Price range filters
  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    where.retailPrice = {};
    if (options.minPrice !== undefined) {
      where.retailPrice.gte = options.minPrice;
    }
    if (options.maxPrice !== undefined) {
      where.retailPrice.lte = options.maxPrice;
    }
  }

  // Availability filter
  if (options.availability === 'in-stock') {
    where.variants = {
      some: {
        stockQuantity: { gt: 0 },
      },
    };
  }

  // Build OrderBy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { publishedAt: 'desc' };
  if (options.sortBy === 'price-asc') {
    orderBy = { retailPrice: 'asc' };
  } else if (options.sortBy === 'price-desc') {
    orderBy = { retailPrice: 'desc' };
  } else if (options.sortBy === 'name-asc') {
    orderBy = { name: 'asc' };
  } else if (options.sortBy === 'featured') {
    orderBy = [{ isFeatured: 'desc' }, { publishedAt: 'desc' }];
  }

  const [rawProducts, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
        sale: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  const publicProducts = toPublicProductList(rawProducts, newArrivalDays);
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    products: publicProducts,
    totalCount,
    page,
    totalPages,
  };
}

/**
 * Fetch a single public product by slug.
 */
export async function getPublicProductBySlug(slug: string): Promise<PublicProduct | null> {
  const newArrivalDays = await getNewArrivalDurationDays();
  const rawProduct = await prisma.product.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      category: true,
      brand: true,
      images: true,
      variants: true,
      sale: true,
    },
  });

  if (!rawProduct) return null;
  return toPublicProduct(rawProduct, newArrivalDays);
}

/**
 * Fetch related products for product detail page recommendation grid.
 */
export async function getRelatedProducts(
  productId: string,
  categoryId?: string | null,
  brandId?: string | null,
  gender?: string,
  limit = 4
): Promise<PublicProduct[]> {
  const newArrivalDays = await getNewArrivalDurationDays();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orConditions: any[] = [];
  if (categoryId) orConditions.push({ categoryId });
  if (brandId) orConditions.push({ brandId });
  if (gender) orConditions.push({ gender });

  const rawProducts = await prisma.product.findMany({
    where: {
      id: { not: productId },
      isPublished: true,
      ...(orConditions.length > 0 ? { OR: orConditions } : {}),
    },
    take: limit,
    orderBy: { publishedAt: 'desc' },
    include: {
      category: true,
      brand: true,
      images: true,
      variants: true,
    },
  });

  return toPublicProductList(rawProducts, newArrivalDays);
}

/**
 * Fetch public categories list
 */
export async function getPublicCategories(): Promise<PublicCategory[]> {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.imageUrl,
    displayOrder: c.displayOrder,
  }));
}

/**
 * Fetch public brands list
 */
export async function getPublicBrands(): Promise<PublicBrand[]> {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
  });
  return brands.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    description: b.description,
    logoUrl: b.logoUrl,
  }));
}
