export interface ProductImage {
  id: string;
  url: string;
  altText: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  availableForSale: boolean;
  quantityAvailable: number;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  category: string;
  description: string;
  details: string[];
  createdAt: string;
  isCustomOrder?: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface CartItem {
  productId: string;
  productTitle: string;
  productHandle: string;
  image: ProductImage;
  variant: ProductVariant;
  quantity: number;
  customNote?: string;
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc';

export interface ApiConfig {
  useMockData: boolean;
  shopifyDomain: string;
  storefrontAccessToken: string;
}

export interface ShopifyCheckoutResult {
  cartId: string;
  checkoutUrl: string;
}

export interface CheckoutSimulationPayload {
  provider: 'Shopify Storefront API (2024-10)' | 'Mock Simulation (Bling ERP -> Shopify)';
  generatedAt: string;
  shopifyCartCreateInput: {
    lines: Array<{
      merchandiseId: string;
      quantity: number;
      attributes?: Array<{
        key: string;
        value: string;
      }>;
    }>;
    attributes: Array<{
      key: string;
      value: string;
    }>;
  };
  blingErpOrderSync: {
    origem: string;
    pagamento: string;
    subtotalBruto: number;
    descontoPix: number;
    totalPix: number;
    freteGratisAplicado: boolean;
    itens: Array<{
      codigoSku: string;
      descricao: string;
      variante: string;
      quantidade: number;
      valorUnitario: number;
      subtotal: number;
      personalizacao?: string;
    }>;
  };
}
