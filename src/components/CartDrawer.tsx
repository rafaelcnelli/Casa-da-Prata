import { useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import type { CartItem } from '../types/commerce';
import {
  FREE_SHIPPING_THRESHOLD,
  calculateCartTotals,
  calculateFreeShippingProgress,
  formatBRL,
} from '../utils/commerce';
import { ResilientImage } from './ResilientImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  useMockData: boolean;
  isCheckingOut: boolean;
  checkoutError: string | null;
  onClose: () => void;
  onUpdateQuantity: (
    variantId: string,
    nextQuantity: number,
    customNote?: string
  ) => void;
  onRemoveItem: (variantId: string, customNote?: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  items,
  useMockData,
  isCheckingOut,
  checkoutError,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totals = calculateCartTotals(items);
  const shipping = calculateFreeShippingProgress(
    totals.subtotal,
    FREE_SHIPPING_THRESHOLD
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Sacola de joias"
      onClick={onClose}
    >
      <aside
        className="w-full max-w-md h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#0F172A]" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-[#0F172A]">
              Sua Sacola
            </h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              ({totals.itemCount})
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar sacola"
            className="w-9 h-9 flex items-center justify-center rounded-md text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-6 py-3.5 bg-[#F8FAFC] border-b border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
            <Truck
              className={`w-4 h-4 shrink-0 ${
                shipping.unlocked ? 'text-emerald-700' : 'text-slate-600'
              }`}
              aria-hidden="true"
            />
            {shipping.unlocked ? (
              <span className="text-emerald-800 font-semibold">
                Parabéns! Você ganhou Frete Grátis Segurado!
              </span>
            ) : (
              <span className="tabular-nums">
                Faltam{' '}
                <strong className="font-semibold text-[#0F172A]">
                  {formatBRL(shipping.remaining)}
                </strong>{' '}
                para você ganhar Frete Grátis!
              </span>
            )}
          </div>
          <div
            className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={shipping.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso para frete grátis"
          >
            <div
              className={`h-full transition-all duration-300 ${
                shipping.unlocked ? 'bg-emerald-700' : 'bg-[#0F172A]'
              }`}
              style={{ width: `${shipping.percentage}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="font-display text-base font-semibold text-[#0F172A]">
                Sua sacola está vazia
              </p>
              <p className="mt-1 text-xs text-slate-500 max-w-[240px]">
                Explore nossas joias em Prata 925 para visualizar o desconto no
                Pix e o frete grátis.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 px-4 py-2 bg-[#0F172A] text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Explorar Joias
              </button>
            </div>
          ) : (
            items.map((item) => {
              const atMaxStock = item.quantity >= item.variant.quantityAvailable;
              const lineKey = `${item.variant.id}::${item.customNote ?? ''}`;
              return (
                <div key={lineKey} className="py-4 flex gap-4 items-start">
                  <div className="w-20 h-20 rounded-md overflow-hidden bg-[#F8FAFC] border border-slate-200 shrink-0">
                    <ResilientImage
                      src={item.image.url}
                      alt={item.image.altText || item.productTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[#0F172A] leading-snug line-clamp-2">
                        {item.productTitle}
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          onRemoveItem(item.variant.id, item.customNote)
                        }
                        aria-label={`Remover ${item.productTitle} (${item.variant.title})`}
                        className="text-slate-400 hover:text-[#0F172A] p-1 -mr-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 mt-0.5">
                      {item.variant.title}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 tabular-nums">
                      SKU: {item.variant.sku}
                    </p>

                    {item.customNote && (
                      <p
                        data-testid="cart-item-custom-note"
                        className="mt-1 text-[11px] text-slate-700 bg-slate-100 border border-slate-200 rounded px-2 py-0.5 inline-block"
                      >
                        Gravação: {item.customNote}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center border border-slate-200 rounded-md bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(
                              item.variant.id,
                              item.quantity - 1,
                              item.customNote
                            )
                          }
                          aria-label={`Diminuir quantidade de ${item.productTitle}`}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <span
                          data-testid={`cart-qty-${item.variant.sku}`}
                          className="w-8 text-center text-xs font-mono font-semibold text-[#0F172A] tabular-nums"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={atMaxStock}
                          onClick={() =>
                            onUpdateQuantity(
                              item.variant.id,
                              item.quantity + 1,
                              item.customNote
                            )
                          }
                          aria-label={`Aumentar quantidade de ${item.productTitle}`}
                          className={`w-7 h-7 flex items-center justify-center ${
                            atMaxStock
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 cursor-pointer'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="text-right tabular-nums">
                        <p className="text-sm font-semibold text-[#0F172A]">
                          {formatBRL(item.variant.price * item.quantity)}
                        </p>
                        {atMaxStock && (
                          <p className="text-[10px] text-amber-700 font-medium">
                            Máx. estoque ({item.variant.quantityAvailable})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary & Checkout Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-[#F8FAFC] space-y-4">
            {checkoutError && (
              <div
                role="alert"
                className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2"
              >
                <AlertCircle
                  className="w-4 h-4 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{checkoutError}</span>
              </div>
            )}

            <div className="space-y-1.5 text-sm tabular-nums">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatBRL(totals.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
                <span>Desconto no Pix (5% OFF)</span>
                <span>-{formatBRL(totals.pixDiscount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                <span className="font-semibold text-[#0F172A]">
                  Total no Pix
                </span>
                <span className="text-xl font-bold text-[#0F172A]">
                  {formatBRL(totals.pixTotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isCheckingOut}
              onClick={onCheckout}
              data-testid="checkout-button"
              className="w-full h-12 bg-[#0F172A] text-white rounded-md text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-2"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Gerando Checkout Shopify...</span>
                </>
              ) : (
                <>
                  <span>Finalizar Compra Segura</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-500">
              {useMockData
                ? 'Modo Mock ativo: gera simulação do payload JSON Shopify + Bling.'
                : 'Modo Shopify Live ativo: redireciona para o checkout oficial.'}
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
