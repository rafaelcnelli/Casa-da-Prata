import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  MessageCircle,
  PackageCheck,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  X,
} from 'lucide-react';
import type { CartItem, Product, ProductVariant } from '../types/commerce';
import {
  buildWhatsAppQuoteUrl,
  calculateDiscountPercentage,
  calculateInstallmentPrice,
  calculatePixPrice,
  formatBRL,
  getDefaultVariant,
  getVariantStockStatus,
} from '../utils/commerce';
import { ResilientImage } from './ResilientImage';
import { SizeGuideModal } from './SizeGuideModal';

interface ProductModalProps {
  product: Product | null;
  cartItems: CartItem[];
  onClose: () => void;
  onAddToCart: (
    product: Product,
    variant: ProductVariant,
    customNote?: string
  ) => void;
}

export function ProductModal({
  product,
  cartItems,
  onClose,
  onAddToCart,
}: ProductModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [openAccordion, setOpenAccordion] = useState<
    'details' | 'shipping' | null
  >('details');
  const [justAdded, setJustAdded] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    if (product) {
      const initialVariant = getDefaultVariant(product);
      setSelectedVariantId(initialVariant?.id ?? '');
      setActiveImageIndex(0);
      setOpenAccordion('details');
      setJustAdded(false);
      setCustomNote('');
      setIsSizeGuideOpen(false);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSizeGuideOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, isSizeGuideOpen, onClose]);

  if (!product) return null;

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    product.variants[0];

  const stockStatus = getVariantStockStatus(selectedVariant);
  const isOutOfStock = stockStatus === 'out_of_stock';
  const isLowStock = stockStatus === 'low_stock';

  const existingInCart = cartItems
    .filter((item) => item.variant.id === selectedVariant.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const reachedCartLimit =
    !isOutOfStock && existingInCart >= selectedVariant.quantityAvailable;

  const activeImage = product.images[activeImageIndex] ?? product.images[0];
  const discountPct = calculateDiscountPercentage(
    selectedVariant.price,
    selectedVariant.compareAtPrice
  );
  const pixPrice = calculatePixPrice(selectedVariant.price);
  const installmentPrice = calculateInstallmentPrice(selectedVariant.price);

  const whatsappUrl = buildWhatsAppQuoteUrl(
    product.title,
    selectedVariant.title,
    selectedVariant.sku,
    customNote
  );

  const handleAddClick = () => {
    if (isOutOfStock || reachedCartLimit) return;
    setJustAdded(true);
    onAddToCart(
      product,
      selectedVariant,
      product.isCustomOrder ? customNote.trim() : undefined
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-product-title"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar visualização da joia"
            className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-md bg-white/95 border border-slate-200 text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Left: Interactive Gallery */}
          <div className="bg-[#F8FAFC] p-5 sm:p-6 flex flex-col gap-3 border-b md:border-b-0 md:border-r border-slate-200">
            <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-white border border-slate-200/80">
              {activeImage && (
                <ResilientImage
                  src={activeImage.url}
                  alt={activeImage.altText || product.title}
                  className="w-full h-full object-cover"
                />
              )}
              {discountPct > 0 && !isOutOfStock && (
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#0F172A] text-white text-xs font-mono font-semibold tabular-nums rounded-sm">
                  -{discountPct}% OFF
                </span>
              )}
            </div>

            {product.images.length > 1 && (
              <div
                className="grid grid-cols-4 gap-2.5"
                role="group"
                aria-label="Miniaturas da galeria"
              >
                {product.images.map((img, idx) => {
                  const isSelected = idx === activeImageIndex;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`Ver imagem ${idx + 1} de ${product.title}`}
                      aria-pressed={isSelected}
                      className={`aspect-[4/3] rounded-md overflow-hidden border-2 bg-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] ${
                        isSelected
                          ? 'border-[#0F172A] opacity-100'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <ResilientImage
                        src={img.url}
                        alt={
                          img.altText || `${product.title} miniatura ${idx + 1}`
                        }
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    {product.category}
                  </span>
                  <span
                    data-testid="modal-variant-sku"
                    className="text-xs font-mono text-slate-500 tabular-nums"
                  >
                    SKU: {selectedVariant.sku}
                  </span>
                </div>

                <h2
                  id="modal-product-title"
                  className="mt-1.5 font-display text-2xl font-semibold text-[#0F172A] leading-tight"
                >
                  {product.title}
                </h2>
              </div>

              {/* Dynamic Stock Badge */}
              <div>
                {isOutOfStock ? (
                  <div
                    data-testid="modal-stock-status"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold"
                  >
                    <X className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                    <span>Esgotado</span>
                  </div>
                ) : isLowStock ? (
                  <div
                    data-testid="modal-stock-status"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold"
                  >
                    <AlertTriangle
                      className="w-3.5 h-3.5 text-amber-700 shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      {selectedVariant.quantityAvailable === 1
                        ? 'Resta apenas 1 unidade em estoque!'
                        : `Restam apenas ${selectedVariant.quantityAvailable} unidades em estoque!`}
                    </span>
                  </div>
                ) : (
                  <div
                    data-testid="modal-stock-status"
                    className="inline-flex items-center gap-2 text-xs font-medium text-emerald-800"
                  >
                    <PackageCheck
                      className="w-4 h-4 text-emerald-700 shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      {product.isCustomOrder
                        ? 'Disponível sob encomenda · Produção artesanal'
                        : `Em estoque (${selectedVariant.quantityAvailable} un. disponíveis)`}
                    </span>
                  </div>
                )}
              </div>

              {/* Price Block */}
              <div className="py-3.5 border-y border-slate-100 space-y-1 tabular-nums">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-base font-medium text-slate-600">
                    {formatBRL(selectedVariant.price)}
                  </span>
                  {selectedVariant.compareAtPrice &&
                    selectedVariant.compareAtPrice > selectedVariant.price && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatBRL(selectedVariant.compareAtPrice)}
                      </span>
                    )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#0F172A]">
                    {formatBRL(pixPrice)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">
                    no Pix (5% OFF)
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  ou em até 6x de {formatBRL(installmentPrice)} sem juros no
                  cartão
                </p>
              </div>

              {/* Interactive Variant Selector + Size Guide Trigger */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Opção: <span className="text-[#0F172A]">{selectedVariant.title}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    data-testid="size-guide-trigger"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-[#0F172A] underline decoration-slate-300 underline-offset-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] rounded-sm"
                  >
                    <Ruler className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Descubra seu tamanho (Guia de Medidas)</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((variant) => {
                    const active = variant.id === selectedVariant.id;
                    const variantSoldOut =
                      getVariantStockStatus(variant) === 'out_of_stock';
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          setJustAdded(false);
                        }}
                        aria-pressed={active}
                        className={`px-3 py-2.5 rounded-md border text-xs font-medium text-left transition-all cursor-pointer flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] ${
                          active
                            ? 'border-[#0F172A] bg-[#0F172A] text-white'
                            : variantSoldOut
                              ? 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'
                              : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
                        }`}
                      >
                        <span className={variantSoldOut ? 'line-through' : ''}>
                          {variant.title}
                        </span>
                        {variantSoldOut && (
                          <span
                            className={`text-[10px] uppercase tracking-wide ${
                              active ? 'text-slate-300' : 'text-slate-400'
                            }`}
                          >
                            Esgotado
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hybrid Flow for Custom / Made-to-Order Jewelry */}
              {product.isCustomOrder && (
                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-3">
                  <div>
                    <label
                      htmlFor="custom-engraving-input"
                      className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                    >
                      Digite o nome para gravação ou especificações
                    </label>
                    <input
                      id="custom-engraving-input"
                      type="text"
                      maxLength={60}
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="Ex: Maria Clara · Fonte cursiva ou aro Ouro 18k"
                      className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="whatsapp-quote-link"
                    className="w-full h-10 px-4 rounded-md border border-emerald-700/40 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    <span>Orçar / Encomendar via WhatsApp</span>
                  </a>
                </div>
              )}

              {/* Primary CTA + Certificate Seal */}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isOutOfStock || reachedCartLimit}
                  onClick={handleAddClick}
                  data-testid="modal-add-to-cart"
                  className={`w-full h-12 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-2 ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : reachedCartLimit
                        ? 'bg-slate-200 text-slate-600 cursor-not-allowed'
                        : 'bg-[#0F172A] text-white hover:bg-slate-800 cursor-pointer'
                  }`}
                >
                  {isOutOfStock ? (
                    <span>Esgotado</span>
                  ) : reachedCartLimit ? (
                    <span>Limite de estoque já na sacola</span>
                  ) : justAdded ? (
                    <>
                      <Check className="w-4 h-4" aria-hidden="true" />
                      <span>Adicionado à Sacola</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                      <span>Adicionar à Sacola</span>
                    </>
                  )}
                </button>

                <div
                  data-testid="prata925-certificate-seal"
                  className="p-2.5 rounded-md bg-[#F8FAFC] border border-slate-200 flex items-center gap-2 text-xs text-slate-700"
                >
                  <ShieldCheck
                    className="w-4 h-4 text-emerald-700 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    Acompanha <strong>Certificado de Garantia Prata 925</strong> e
                    Embalagem Presenteável
                  </span>
                </div>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-slate-200 divide-y divide-slate-200">
              <div>
                <button
                  type="button"
                  aria-expanded={openAccordion === 'details'}
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === 'details' ? null : 'details'
                    )
                  }
                  className="w-full py-3.5 flex items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-[#0F172A] cursor-pointer"
                >
                  <span>Descrição e Detalhes</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      openAccordion === 'details' ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {openAccordion === 'details' && (
                  <div className="pb-4 text-xs sm:text-sm text-slate-600 space-y-2.5 leading-relaxed">
                    <p>{product.description}</p>
                    {product.details.length > 0 && (
                      <ul className="space-y-1 text-xs text-slate-500 list-disc pl-4">
                        {product.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  aria-expanded={openAccordion === 'shipping'}
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === 'shipping' ? null : 'shipping'
                    )
                  }
                  className="w-full py-3.5 flex items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-[#0F172A] cursor-pointer"
                >
                  <span>Envio e Garantias</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      openAccordion === 'shipping' ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {openAccordion === 'shipping' && (
                  <div className="pb-4 text-xs text-slate-600 space-y-2 leading-relaxed">
                    <p>
                      Entrega Expressa em Goiânia - GO no mesmo dia útil e envio
                      segurado para todo o Brasil (Frete Grátis acima de R$
                      249,00).
                    </p>
                    <p>
                      Garantia vitalícia na autenticidade da Prata 925 de Lei e
                      polimento gratuito em nossa loja física.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </>
  );
}
