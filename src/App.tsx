import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpDown,
  Gem,
  Loader2,
  Lock,
  MapPin,
  Search,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import { ApiConfigModal } from './components/ApiConfigModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutSimulationModal } from './components/CheckoutSimulationModal';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { Footer } from './components/Footer';
import { Header, STORE_CATEGORIES } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { ResilientImage } from './components/ResilientImage';
import {
  createShopifyCheckout,
  fetchProductsFromShopify,
  loadApiConfig,
  saveApiConfig,
} from './services/shopifyService';
import type {
  ApiConfig,
  CartItem,
  CheckoutSimulationPayload,
  Product,
  ProductVariant,
  ShopifyCheckoutResult,
  SortOption,
} from './types/commerce';
import {
  buildCheckoutPayload,
  calculateCartTotals,
  filterAndSortProducts,
} from './utils/commerce';

const CART_STORAGE_KEY = 'casadaprata_headless_cart';

function loadSavedCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => loadApiConfig());
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] =
    useState<string>('Todas as Joias');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => loadSavedCart());
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [simulationPayload, setSimulationPayload] =
    useState<CheckoutSimulationPayload | null>(null);
  const [liveCheckoutResult, setLiveCheckoutResult] =
    useState<ShopifyCheckoutResult | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);

  const loadCatalog = useCallback(async (configToUse: ApiConfig) => {
    setIsLoadingProducts(true);
    setApiError(null);
    try {
      const loaded = await fetchProductsFromShopify(configToUse);
      setProducts(loaded);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o catálogo de joias.';
      setApiError(message);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog(apiConfig);
  }, [apiConfig, loadCatalog]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage errors
    }
  }, [cartItems]);

  const categories = useMemo(() => {
    if (apiConfig.useMockData) {
      return [...STORE_CATEGORIES];
    }
    const unique = Array.from(new Set(products.map((p) => p.category)));
    return ['Todas as Joias', ...unique];
  }, [apiConfig.useMockData, products]);

  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, {
      category: activeCategory,
      search: searchQuery,
      sort: sortBy,
    });
  }, [products, activeCategory, searchQuery, sortBy]);

  const cartTotals = useMemo(() => calculateCartTotals(cartItems), [cartItems]);

  const customOrderHighlightProduct = useMemo(
    () => products.find((p) => p.isCustomOrder) ?? null,
    [products]
  );

  const handleAddToCart = (
    product: Product,
    variant: ProductVariant,
    customNote?: string
  ) => {
    if (!variant.availableForSale || variant.quantityAvailable <= 0) return;

    const normalizedNote = customNote?.trim() || undefined;
    setCheckoutError(null);

    setCartItems((prev) => {
      const totalForVariant = prev
        .filter((item) => item.variant.id === variant.id)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (totalForVariant >= variant.quantityAvailable) {
        return prev;
      }

      const existing = prev.find(
        (item) =>
          item.variant.id === variant.id &&
          (item.customNote || undefined) === normalizedNote
      );

      if (existing) {
        return prev.map((item) =>
          item.variant.id === variant.id &&
          (item.customNote || undefined) === normalizedNote
            ? { ...item, variant, quantity: item.quantity + 1 }
            : item
        );
      }

      const fallbackImage = product.images[0] ?? {
        id: 'fallback',
        url: '',
        altText: product.title,
      };

      return [
        ...prev,
        {
          productId: product.id,
          productTitle: product.title,
          productHandle: product.handle,
          image: fallbackImage,
          variant,
          quantity: 1,
          ...(normalizedNote ? { customNote: normalizedNote } : {}),
        },
      ];
    });

    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (
    variantId: string,
    nextQuantity: number,
    customNote?: string
  ) => {
    setCheckoutError(null);
    const normalizedNote = customNote?.trim() || undefined;

    if (nextQuantity <= 0) {
      setCartItems((prev) =>
        prev.filter(
          (item) =>
            !(
              item.variant.id === variantId &&
              (item.customNote || undefined) === normalizedNote
            )
        )
      );
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (
          item.variant.id !== variantId ||
          (item.customNote || undefined) !== normalizedNote
        ) {
          return item;
        }
        const clamped = Math.min(
          nextQuantity,
          Math.max(1, item.variant.quantityAvailable)
        );
        return { ...item, quantity: clamped };
      })
    );
  };

  const handleRemoveCartItem = (variantId: string, customNote?: string) => {
    setCheckoutError(null);
    const normalizedNote = customNote?.trim() || undefined;
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.variant.id === variantId &&
            (item.customNote || undefined) === normalizedNote
          )
      )
    );
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setCheckoutError(null);

    if (apiConfig.useMockData) {
      const payload = buildCheckoutPayload(cartItems, 'mock');
      setLiveCheckoutResult(null);
      setSimulationPayload(payload);
      setIsCartOpen(false);
      setIsCheckoutModalOpen(true);
      return;
    }

    setIsCheckingOut(true);
    try {
      const result = await createShopifyCheckout(cartItems, apiConfig);
      setSimulationPayload(null);
      setLiveCheckoutResult(result);
      setIsCartOpen(false);
      setIsCheckoutModalOpen(true);
      try {
        window.location.assign(result.checkoutUrl);
      } catch {
        // Ignore if sandboxed iframe restricts top navigation
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao criar checkout na Shopify.';
      setCheckoutError(message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleSaveApiConfig = async (nextConfig: ApiConfig) => {
    saveApiConfig(nextConfig);
    setApiConfig(nextConfig);
    setActiveCategory('Todas as Joias');
    await loadCatalog(nextConfig);
  };

  const resetFilters = () => {
    setActiveCategory('Todas as Joias');
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F3EF] text-[#0B0B0B]">
      <Header
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartTotals.itemCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1">
        <Hero onSelectCategory={setActiveCategory} />

        {/* Editorial Mid-Page Split Banner (GAZU "NEW SEASON / NEW VIBES" layout adapted to Casa da Prata Custom Jewelry) */}
        <section
          aria-label="Ourivesaria Sob Encomenda"
          className="bg-[#DFDDD4] border-b border-black/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-zinc-700">
                OURIVESARIA AUTORAL · GOIÂNIA
              </p>
              <h2 className="font-display font-extrabold uppercase tracking-tight text-[#0B0B0B] text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[0.96]">
                JOIAS SOB
                <br />
                ENCOMENDA
              </h2>
              <p className="text-sm sm:text-base text-zinc-700 max-w-md leading-relaxed">
                Colares personalizados com nome em Prata 925 cortados a laser e
                alianças em Ouro 18k produzidos sob medida em nossa bancada.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (customOrderHighlightProduct) {
                      setSelectedProduct(customOrderHighlightProduct);
                    } else {
                      setActiveCategory('Sob Encomenda');
                      document
                        .getElementById('catalogo')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 h-11 px-7 bg-[#0B0B0B] text-white text-xs font-semibold uppercase tracking-[0.18em] hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <span>Personalizar Joia</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white border border-black/10 p-3 shadow-sm">
                <div className="aspect-[4/3] bg-black overflow-hidden">
                  <ResilientImage
                    src="./assets/products/aliancas-prata-1.png"
                    alt="Alianças e Anéis Sob Encomenda em Prata 925 Casa da Prata"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0B0B0B]">
                  Alianças &amp; Gravação · Prata 925
                </p>
                <p className="text-[11px] text-zinc-500">
                  Feitas sob medida na bancada
                </p>
              </div>

              <div className="bg-white border border-black/10 p-3 shadow-sm">
                <div className="aspect-[4/3] bg-black overflow-hidden">
                  <ResilientImage
                    src="./assets/products/pulseira-coracao-1.png"
                    alt="Pulseira Prata 925 Fecho Coração Cravejado Casa da Prata"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0B0B0B]">
                  Cravação &amp; Presentes
                </p>
                <p className="text-[11px] text-zinc-500">
                  Prata 925 de Lei com Certificado
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Column Service & Institutional Trust Bar (GAZU 4-Icon Strip) */}
        <section
          id="diferenciais"
          aria-label="Diferenciais Casa da Prata"
          className="bg-[#ECEAE4] border-b border-black/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 border border-black/20 bg-white flex items-center justify-center shrink-0 text-[#0B0B0B]">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-[#0B0B0B]">
                  Prata 925 de Lei
                </h3>
                <p className="mt-0.5 text-xs text-zinc-600 leading-relaxed">
                  Joias autênticas com garantia vitalícia do teor do metal.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 border border-black/20 bg-white flex items-center justify-center shrink-0 text-[#0B0B0B]">
                <Gem className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-[#0B0B0B]">
                  Pedras Naturais Selecionadas
                </h3>
                <p className="mt-0.5 text-xs text-zinc-600 leading-relaxed">
                  Ametista, Turquesa, Quartzo Verde, Coral e Pérolas legítimas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 border border-black/20 bg-white flex items-center justify-center shrink-0 text-[#0B0B0B]">
                <MapPin className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-[#0B0B0B]">
                  Loja Física &amp; Envio Rápido
                </h3>
                <p className="mt-0.5 text-xs text-zinc-600 leading-relaxed">
                  Tradição em Goiânia com envio seguro e segurado para o Brasil.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 border border-black/20 bg-white flex items-center justify-center shrink-0 text-[#0B0B0B]">
                <Lock className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-[#0B0B0B]">
                  Compra 100% Segura
                </h3>
                <p className="mt-0.5 text-xs text-zinc-600 leading-relaxed">
                  5% OFF no Pix imediato ou em até 6x sem juros no cartão.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BEST OF CASA DA PRATA Product Grid Section */}
        <section
          id="catalogo"
          aria-label="Catálogo de joias"
          className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
        >
          {/* Section Header + Smart Filters (GAZU "BEST OF GAZU" + "VIEW ALL" bar) */}
          <div className="flex flex-col gap-5 pb-6 border-b border-black/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  CURADORIA EM PRATA 925 · BLING ERP + SHOPIFY
                </p>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#0B0B0B]">
                  DESTAQUES CASA DA PRATA
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {activeCategory !== 'Todas as Joias' && (
                  <button
                    type="button"
                    onClick={() => setActiveCategory('Todas as Joias')}
                    className="text-xs font-bold uppercase tracking-[0.16em] text-[#0B0B0B] border-b border-[#0B0B0B] pb-0.5 hover:text-zinc-600 cursor-pointer"
                  >
                    VER TODAS
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="catalog-sort"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 whitespace-nowrap"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Ordenar:</span>
                  </label>
                  <select
                    id="catalog-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-9 px-3 bg-white border border-black/15 text-xs font-semibold text-[#0B0B0B] focus:outline-none focus:border-[#0B0B0B] cursor-pointer"
                  >
                    <option value="newest">Lançamentos</option>
                    <option value="price_asc">Menor preço</option>
                    <option value="price_desc">Maior preço</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Filter Tabs + Mobile Search */}
            <div className="flex flex-col gap-3">
              <div
                className="flex items-center gap-2 overflow-x-auto pb-1"
                role="group"
                aria-label="Filtrar por categoria"
              >
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      aria-pressed={isActive}
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B0B0B] ${
                        isActive
                          ? 'bg-[#0B0B0B] text-white'
                          : 'bg-white text-zinc-700 border border-black/15 hover:border-[#0B0B0B] hover:text-[#0B0B0B]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <div className="relative md:hidden">
                <Search
                  className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por joia ou SKU (ex: CDP-AN)..."
                  aria-label="Buscar por joia ou SKU"
                  className="w-full h-10 pl-9 pr-8 bg-white border border-black/15 text-xs text-[#0B0B0B] placeholder:text-zinc-400 focus:outline-none focus:border-[#0B0B0B]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpar busca"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#0B0B0B] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live API Error Banner */}
          {apiError && (
            <div
              role="alert"
              className="mt-6 p-4 bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-red-900">
                <AlertCircle
                  className="w-4 h-4 text-red-700 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{apiError}</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  void handleSaveApiConfig({
                    ...apiConfig,
                    useMockData: true,
                  })
                }
                className="px-4 py-2 bg-[#0B0B0B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Voltar para Modo Mock
              </button>
            </div>
          )}

          {/* Product Grid */}
          {isLoadingProducts ? (
            <div className="py-24 flex flex-col items-center justify-center text-zinc-600 gap-3">
              <Loader2
                className="w-6 h-6 animate-spin text-[#0B0B0B]"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">
                Carregando catálogo via{' '}
                {apiConfig.useMockData
                  ? 'Mock Data'
                  : 'Shopify Storefront API'}
                ...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white border border-black/10 mt-8 px-6">
              <p className="font-display text-lg font-bold uppercase text-[#0B0B0B]">
                Nenhuma joia encontrada
              </p>
              <p className="mt-1.5 text-sm text-zinc-500">
                Não encontramos peças para os filtros ou código SKU informados.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 px-5 py-2.5 bg-[#0B0B0B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div
              key={`${activeCategory}::${sortBy}::${searchQuery.trim().toLowerCase()}`}
              data-testid="product-grid"
              className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  animationIndex={index}
                  onSelect={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Express Delivery & Authenticity Banner */}
        <section
          aria-label="Garantia e Tradição Casa da Prata"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
        >
          <div className="bg-white border border-black/10 p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>01 · Prata 925 de Lei</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Joias autênticas acompanhadas de Certificado de Garantia
                Vitalícia do teor da Prata 925 e embalagem presenteável.
              </p>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0B0B0B]">
                <Gem className="w-4 h-4" aria-hidden="true" />
                <span>02 · Pedras Naturais Selecionadas</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Curadoria de Ametista, Turquesa, Pérola Cultivada e Marcassitas
                com lapidação de alta joalheria.
              </p>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0B0B0B]">
                <Truck className="w-4 h-4" aria-hidden="true" />
                <span>03 · Loja Física &amp; Envio Rápido</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Tradição em Goiânia - GO desde 1996, com entrega expressa local
                e despacho segurado integrado ao Bling ERP.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <ProductModal
        product={selectedProduct}
        cartItems={cartItems}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        useMockData={apiConfig.useMockData}
        isCheckingOut={isCheckingOut}
        checkoutError={checkoutError}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => void handleCheckout()}
      />

      <CheckoutSimulationModal
        isOpen={isCheckoutModalOpen}
        payload={simulationPayload}
        liveCheckoutResult={liveCheckoutResult}
        onClose={() => setIsCheckoutModalOpen(false)}
        onConfirmMockOrder={() => setCartItems([])}
      />

      <ApiConfigModal
        config={apiConfig}
        isLoadingProducts={isLoadingProducts}
        apiError={apiError}
        onSaveConfig={handleSaveApiConfig}
      />

      <FloatingWhatsAppButton />
    </div>
  );
}
