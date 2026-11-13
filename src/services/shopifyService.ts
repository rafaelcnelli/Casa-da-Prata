import { MOCK_PRODUCTS } from '../data/mockProducts';
import type {
  ApiConfig,
  CartItem,
  Product,
  ShopifyCheckoutResult,
} from '../types/commerce';

export const USE_MOCK_DATA = true;
export const SHOPIFY_API_VERSION = '2024-10';
const CONFIG_STORAGE_KEY = 'casadaprata_headless_api_config';

export const DEFAULT_API_CONFIG: ApiConfig = {
  useMockData: USE_MOCK_DATA,
  shopifyDomain: '',
  storefrontAccessToken: '',
};

export function loadApiConfig(): ApiConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_API_CONFIG;
    const parsed = JSON.parse(raw) as Partial<ApiConfig>;
    return {
      useMockData:
        typeof parsed.useMockData === 'boolean'
          ? parsed.useMockData
          : USE_MOCK_DATA,
      shopifyDomain:
        typeof parsed.shopifyDomain === 'string' ? parsed.shopifyDomain : '',
      storefrontAccessToken:
        typeof parsed.storefrontAccessToken === 'string'
          ? parsed.storefrontAccessToken
          : '',
    };
  } catch {
    return DEFAULT_API_CONFIG;
  }
}

export function saveApiConfig(config: ApiConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage quota errors in restricted contexts
  }
}

function normalizeShopifyDomain(domain: string): string {
  return domain
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
}

const PRODUCTS_QUERY = `
  query FetchProductsForBlingSync($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          productType
          tags
          description
          createdAt
          images(first: 5) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                quantityAvailable
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface ShopifyProductsQueryData {
  products: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        handle: string;
        productType: string;
        tags?: string[];
        description: string;
        createdAt: string;
        images: {
          edges: Array<{
            node: {
              id: string;
              url: string;
              altText: string | null;
            };
          }>;
        };
        variants: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              sku: string | null;
              availableForSale: boolean;
              quantityAvailable: number | null;
              price: { amount: string; currencyCode: string };
              compareAtPrice: { amount: string; currencyCode: string } | null;
            };
          }>;
        };
      };
    }>;
  };
}

interface ShopifyCartCreateData {
  cartCreate: {
    cart: {
      id: string;
      checkoutUrl: string;
    } | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
    }>;
  };
}

async function shopifyGraphQLRequest<T>(
  config: ApiConfig,
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const domain = normalizeShopifyDomain(config.shopifyDomain);
  const token = config.storefrontAccessToken.trim();

  if (!domain || !token) {
    throw new Error(
      'Configure o domínio Shopify (ex: casadaprata.myshopify.com) e o Storefront Access Token no Dev Mode.'
    );
  }

  const endpoint = `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `Erro na Shopify Storefront API (${response.status} ${response.statusText}).`
    );
  }

  const json = (await response.json()) as ShopifyGraphQLResponse<T>;
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e) => e.message).join(' · '));
  }
  if (!json.data) {
    throw new Error('Resposta vazia da Shopify Storefront API.');
  }

  return json.data;
}

export async function fetchProductsFromShopify(
  config: ApiConfig = loadApiConfig()
): Promise<Product[]> {
  if (config.useMockData) {
    return MOCK_PRODUCTS;
  }

  const data = await shopifyGraphQLRequest<ShopifyProductsQueryData>(
    config,
    PRODUCTS_QUERY,
    { first: 20 }
  );

  return data.products.edges.map(({ node }) => {
    const images = node.images.edges.map((edge) => ({
      id: edge.node.id,
      url: edge.node.url,
      altText: edge.node.altText || node.title,
    }));

    const variants = node.variants.edges.map((edge) => ({
      id: edge.node.id,
      title: edge.node.title,
      sku: edge.node.sku || 'SEM-SKU',
      price: Number.parseFloat(edge.node.price.amount),
      compareAtPrice: edge.node.compareAtPrice
        ? Number.parseFloat(edge.node.compareAtPrice.amount)
        : null,
      availableForSale: edge.node.availableForSale,
      quantityAvailable:
        typeof edge.node.quantityAvailable === 'number'
          ? edge.node.quantityAvailable
          : edge.node.availableForSale
            ? 10
            : 0,
    }));

    const category = node.productType || 'Joias em Prata 925';
    const isCustomOrder =
      category.toLowerCase().includes('encomenda') ||
      (node.tags ?? []).some((tag) =>
        tag.toLowerCase().includes('sob-encomenda')
      );

    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      category,
      description:
        node.description || 'Joia em Prata 925 legítima integrada via Shopify.',
      details: [
        'Garantia vitalícia na autenticidade da Prata 925',
        'Sincronização de estoque por SKU integrada ao Bling ERP',
      ],
      createdAt: node.createdAt,
      isCustomOrder,
      images,
      variants,
    };
  });
}

export async function createShopifyCheckout(
  cartItems: CartItem[],
  config: ApiConfig = loadApiConfig()
): Promise<ShopifyCheckoutResult> {
  const lines = cartItems.map((item) => ({
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
  }));

  const data = await shopifyGraphQLRequest<ShopifyCartCreateData>(
    config,
    CART_CREATE_MUTATION,
    {
      input: {
        lines,
        attributes: [
          { key: 'origem', value: 'casa_da_prata_headless' },
          { key: 'erp_sync', value: 'bling' },
        ],
      },
    }
  );

  const { cart, userErrors } = data.cartCreate;
  if (userErrors && userErrors.length > 0) {
    throw new Error(userErrors.map((err) => err.message).join(' · '));
  }

  if (!cart?.checkoutUrl) {
    throw new Error('A Shopify não retornou uma checkoutUrl válida.');
  }

  return {
    cartId: cart.id,
    checkoutUrl: cart.checkoutUrl,
  };
}
