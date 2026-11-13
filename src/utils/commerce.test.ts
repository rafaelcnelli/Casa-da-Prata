import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCheckoutPayload,
  buildWhatsAppQuoteUrl,
  calculateCartTotals,
  calculateDiscountPercentage,
  calculateFreeShippingProgress,
  calculateInstallmentPrice,
  calculatePixPrice,
  filterAndSortProducts,
  formatBRL,
  getDefaultVariant,
  getVariantStockStatus,
  isProductSoldOut,
} from './commerce';
import type { CartItem, Product } from '../types/commerce';

const sampleProducts: Product[] = [
  {
    id: 'gid://shopify/Product/1',
    title: 'Anel de Prata 925 com Ametista Natural',
    handle: 'anel-prata-925-ametista-natural',
    category: 'Anéis & Pedras Naturais',
    description: 'Anel com ametista.',
    details: ['Prata 925'],
    createdAt: '2026-10-01T10:00:00Z',
    images: [{ id: 'img-1', url: '/img1.svg', altText: 'Ametista' }],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/101',
        title: 'Aro 18',
        sku: 'CDP-AN-AME-18',
        price: 189.9,
        compareAtPrice: 229.9,
        availableForSale: true,
        quantityAvailable: 2,
      },
      {
        id: 'gid://shopify/ProductVariant/102',
        title: 'Aro 20',
        sku: 'CDP-AN-AME-20',
        price: 189.9,
        compareAtPrice: 229.9,
        availableForSale: false,
        quantityAvailable: 0,
      },
    ],
  },
  {
    id: 'gid://shopify/Product/2',
    title: 'Colar Personalizado com Nome em Prata 925',
    handle: 'colar-personalizado-nome-prata-925',
    category: 'Sob Encomenda',
    description: 'Sob encomenda.',
    details: ['Prata 925'],
    isCustomOrder: true,
    createdAt: '2026-10-10T10:00:00Z',
    images: [{ id: 'img-2', url: '/img2.svg', altText: 'Colar' }],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/201',
        title: 'Corrente Veneziana 45cm',
        sku: 'CDP-ENC-NOM-45',
        price: 219.9,
        compareAtPrice: null,
        availableForSale: true,
        quantityAvailable: 99,
      },
    ],
  },
];

test('formatBRL formats Brazilian Real currency cleanly', () => {
  const formatted = formatBRL(189.9);
  assert.match(formatted, /R\$\s*189,90/);
});

test('Pix discount applies 5% off and installments divide by 6', () => {
  assert.equal(calculatePixPrice(200), 190);
  assert.equal(calculateInstallmentPrice(300), 50);
  assert.equal(calculateDiscountPercentage(189.9, 229.9), 17);
  assert.equal(calculateDiscountPercentage(200, null), 0);
});

test('Stock status rules detect out_of_stock, low_stock (<=3), and in_stock', () => {
  assert.equal(
    getVariantStockStatus({ availableForSale: true, quantityAvailable: 5 }),
    'in_stock'
  );
  assert.equal(
    getVariantStockStatus({ availableForSale: true, quantityAvailable: 2 }),
    'low_stock'
  );
  assert.equal(
    getVariantStockStatus({ availableForSale: true, quantityAvailable: 0 }),
    'out_of_stock'
  );
});

test('isProductSoldOut and getDefaultVariant handle mixed variants', () => {
  assert.equal(isProductSoldOut(sampleProducts[0]), false);
  assert.equal(getDefaultVariant(sampleProducts[0]).sku, 'CDP-AN-AME-18');
});

test('Free shipping progress calculates remaining amount toward R$ 249.00', () => {
  const below = calculateFreeShippingProgress(189.9);
  assert.equal(below.unlocked, false);
  assert.equal(below.remaining, 59.1);
});

test('filterAndSortProducts handles Todas as Joias, SKU search, and price sorting', () => {
  const all = filterAndSortProducts(sampleProducts, {
    category: 'Todas as Joias',
    search: '',
    sort: 'newest',
  });
  assert.equal(all.length, 2);

  const bySku = filterAndSortProducts(sampleProducts, {
    category: 'Todas as Joias',
    search: 'CDP-AN-AME-18',
    sort: 'newest',
  });
  assert.equal(bySku.length, 1);
  assert.equal(bySku[0].title, 'Anel de Prata 925 com Ametista Natural');

  const sortedAsc = filterAndSortProducts(sampleProducts, {
    category: 'Todas as Joias',
    search: '',
    sort: 'price_asc',
  });
  assert.equal(sortedAsc[0].title, 'Anel de Prata 925 com Ametista Natural');
});

test('buildWhatsAppQuoteUrl encodes piece title, variant, Bling SKU, and custom engraving note', () => {
  const url = buildWhatsAppQuoteUrl(
    'Colar Personalizado com Nome em Prata 925',
    'Corrente Veneziana 45cm',
    'CDP-ENC-NOM-45',
    'Maria Clara'
  );
  assert.ok(url.startsWith('https://wa.me/'));
  const decoded = decodeURIComponent(url);
  assert.ok(decoded.includes('CDP-ENC-NOM-45'));
  assert.ok(decoded.includes('Maria Clara'));
});

test('calculateCartTotals and buildCheckoutPayload map SKUs and customNote for Bling + Shopify', () => {
  const items: CartItem[] = [
    {
      productId: sampleProducts[1].id,
      productTitle: sampleProducts[1].title,
      productHandle: sampleProducts[1].handle,
      image: sampleProducts[1].images[0],
      variant: sampleProducts[1].variants[0],
      quantity: 2,
      customNote: 'Helena · Fonte cursiva',
    },
  ];

  const totals = calculateCartTotals(items);
  assert.equal(totals.itemCount, 2);
  assert.equal(totals.subtotal, 439.8);

  const payload = buildCheckoutPayload(items, 'mock');
  assert.equal(
    payload.shopifyCartCreateInput.lines[0].attributes?.[0].value,
    'Helena · Fonte cursiva'
  );
  assert.equal(
    payload.blingErpOrderSync.itens[0].personalizacao,
    'Helena · Fonte cursiva'
  );
  assert.equal(payload.blingErpOrderSync.itens[0].codigoSku, 'CDP-ENC-NOM-45');
});
