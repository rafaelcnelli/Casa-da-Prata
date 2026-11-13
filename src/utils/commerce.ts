import type {
  CartItem,
  CheckoutSimulationPayload,
  Product,
  ProductVariant,
  SortOption,
} from '../types/commerce';

export const FREE_SHIPPING_THRESHOLD = 249.0;
export const PIX_DISCOUNT_RATE = 0.05;
export const MAX_INSTALLMENTS = 6;
export const WHATSAPP_STORE_PHONE = '5562999990925';

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculatePixPrice(price: number): number {
  return roundCurrency(price * (1 - PIX_DISCOUNT_RATE));
}

export function calculateInstallmentPrice(
  price: number,
  installments: number = MAX_INSTALLMENTS
): number {
  if (installments <= 0) return roundCurrency(price);
  return roundCurrency(price / installments);
}

export function calculateDiscountPercentage(
  price: number,
  compareAtPrice: number | null
): number {
  if (!compareAtPrice || compareAtPrice <= price || compareAtPrice <= 0) {
    return 0;
  }
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export type VariantStockStatus = 'out_of_stock' | 'low_stock' | 'in_stock';

export function getVariantStockStatus(
  variant: Pick<ProductVariant, 'availableForSale' | 'quantityAvailable'>
): VariantStockStatus {
  if (!variant.availableForSale || variant.quantityAvailable <= 0) {
    return 'out_of_stock';
  }
  if (variant.quantityAvailable <= 3) {
    return 'low_stock';
  }
  return 'in_stock';
}

export function isProductSoldOut(product: Pick<Product, 'variants'>): boolean {
  if (product.variants.length === 0) return true;
  return product.variants.every(
    (variant) => getVariantStockStatus(variant) === 'out_of_stock'
  );
}

export function getDefaultVariant(product: Product): ProductVariant {
  const firstAvailable = product.variants.find(
    (v) => getVariantStockStatus(v) !== 'out_of_stock'
  );
  return firstAvailable ?? product.variants[0];
}

export function getProductLowestPrice(product: Pick<Product, 'variants'>): number {
  if (product.variants.length === 0) return 0;
  return Math.min(...product.variants.map((v) => v.price));
}

export function calculateFreeShippingProgress(
  subtotal: number,
  threshold: number = FREE_SHIPPING_THRESHOLD
): {
  remaining: number;
  percentage: number;
  unlocked: boolean;
} {
  const safeSubtotal = Math.max(0, subtotal);
  const remaining = roundCurrency(Math.max(0, threshold - safeSubtotal));
  const percentage = Math.min(100, Math.round((safeSubtotal / threshold) * 100));
  return {
    remaining,
    percentage,
    unlocked: safeSubtotal >= threshold,
  };
}

export function calculateCartTotals(items: CartItem[]): {
  itemCount: number;
  subtotal: number;
  pixDiscount: number;
  pixTotal: number;
} {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0)
  );
  const pixTotal = calculatePixPrice(subtotal);
  const pixDiscount = roundCurrency(subtotal - pixTotal);
  return {
    itemCount,
    subtotal,
    pixDiscount,
    pixTotal,
  };
}

export function filterAndSortProducts(
  products: Product[],
  options: {
    category: string;
    search: string;
    sort: SortOption;
  }
): Product[] {
  const normalizedCategory = options.category.trim().toLowerCase();
  const normalizedQuery = options.search.trim().toLowerCase();

  const filtered = products.filter((product) => {
    const isAllCategory =
      !normalizedCategory ||
      normalizedCategory === 'todos' ||
      normalizedCategory === 'todas as joias';

    const matchesCategory =
      isAllCategory || product.category.toLowerCase() === normalizedCategory;

    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;

    const matchesTitle = product.title.toLowerCase().includes(normalizedQuery);
    const matchesHandle = product.handle.toLowerCase().includes(normalizedQuery);
    const matchesCategoryText = product.category
      .toLowerCase()
      .includes(normalizedQuery);
    const matchesSku = product.variants.some((v) =>
      v.sku.toLowerCase().includes(normalizedQuery)
    );

    return matchesTitle || matchesHandle || matchesCategoryText || matchesSku;
  });

  return [...filtered].sort((a, b) => {
    if (options.sort === 'price_asc') {
      return getProductLowestPrice(a) - getProductLowestPrice(b);
    }
    if (options.sort === 'price_desc') {
      return getProductLowestPrice(b) - getProductLowestPrice(a);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function buildWhatsAppQuoteUrl(
  productTitle: string,
  variantTitle: string,
  sku: string,
  customNote?: string
): string {
  const trimmedNote = customNote?.trim();
  const lines = [
    'Olá, Casa da Prata! Gostaria de orçar / encomendar uma joia sob medida:',
    `• Peça: ${productTitle}`,
    `• Opção: ${variantTitle}`,
    `• SKU (Bling): ${sku}`,
  ];
  if (trimmedNote) {
    lines.push(`• Personalização / Gravação: ${trimmedNote}`);
  }
  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${WHATSAPP_STORE_PHONE}?text=${message}`;
}

export function buildCheckoutPayload(
  items: CartItem[],
  mode: 'mock' | 'shopify'
): CheckoutSimulationPayload {
  const totals = calculateCartTotals(items);
  const shipping = calculateFreeShippingProgress(totals.subtotal);

  return {
    provider:
      mode === 'shopify'
        ? 'Shopify Storefront API (2024-10)'
        : 'Mock Simulation (Bling ERP -> Shopify)',
    generatedAt: new Date().toISOString(),
    shopifyCartCreateInput: {
      lines: items.map((item) => ({
        merchandiseId: item.variant.id,
        quantity: item.quantity,
        ...(item.customNote?.trim()
          ? {
              attributes: [
                {
                  key: 'personalizacao_gravacao',
                  value: item.customNote.trim(),
                },
              ],
            }
          : {}),
      })),
      attributes: [
        { key: 'store_brand', value: 'casa_da_prata_goiania' },
        { key: 'erp_integration', value: 'bling_v3' },
        { key: 'payment_preference', value: 'pix_5_off' },
        {
          key: 'free_shipping_eligible',
          value: shipping.unlocked ? 'true' : 'false',
        },
      ],
    },
    blingErpOrderSync: {
      origem: 'Casa da Prata Headless (Shopify -> Bling)',
      pagamento: 'Pix (5% OFF)',
      subtotalBruto: totals.subtotal,
      descontoPix: totals.pixDiscount,
      totalPix: totals.pixTotal,
      freteGratisAplicado: shipping.unlocked,
      itens: items.map((item) => ({
        codigoSku: item.variant.sku,
        descricao: item.productTitle,
        variante: item.variant.title,
        quantidade: item.quantity,
        valorUnitario: item.variant.price,
        subtotal: roundCurrency(item.variant.price * item.quantity),
        ...(item.customNote?.trim()
          ? { personalizacao: item.customNote.trim() }
          : {}),
      })),
    },
  };
}
