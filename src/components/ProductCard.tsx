import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { Product } from '../types/commerce';
import {
  calculateDiscountPercentage,
  calculateInstallmentPrice,
  calculatePixPrice,
  formatBRL,
  getDefaultVariant,
  isProductSoldOut,
} from '../utils/commerce';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  animationIndex?: number;
}

const STAGGER_DELAY_CLASSES = [
  '[animation-delay:0ms]',
  '[animation-delay:45ms]',
  '[animation-delay:90ms]',
  '[animation-delay:135ms]',
  '[animation-delay:180ms]',
  '[animation-delay:225ms]',
  '[animation-delay:270ms]',
  '[animation-delay:315ms]',
] as const;

export function ProductCard({
  product,
  onSelect,
  animationIndex = 0,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const soldOut = isProductSoldOut(product);
  const primaryVariant = getDefaultVariant(product);
  const primaryImage = product.images[0];
  const secondaryImage = product.images[1] ?? product.images[0];

  const discountPct = calculateDiscountPercentage(
    primaryVariant.price,
    primaryVariant.compareAtPrice
  );
  const pixPrice = calculatePixPrice(primaryVariant.price);
  const installmentPrice = calculateInstallmentPrice(primaryVariant.price);
  const delayClass =
    STAGGER_DELAY_CLASSES[
      Math.min(Math.max(0, animationIndex), STAGGER_DELAY_CLASSES.length - 1)
    ];

  return (
    <div className={`flex animate-card-fade-in ${delayClass}`}>
      <article className="group relative flex-1 flex flex-col bg-white border border-black/10 overflow-hidden transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:border-black/30">
        {/* Top-Right Wishlist Circle Icon (GAZU Best Of Card Pattern) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted((prev) => !prev);
          }}
          aria-label={
            isWishlisted
              ? `Remover ${product.title} dos favoritos`
              : `Salvar ${product.title} nos favoritos`
          }
          aria-pressed={isWishlisted}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-black/10 flex items-center justify-center text-[#0B0B0B] hover:bg-[#0B0B0B] hover:text-white transition-colors cursor-pointer"
        >
          <Heart
            className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={() => onSelect(product)}
          aria-label={`Ver detalhes de ${product.title}`}
          className="text-left flex flex-col flex-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0B0B0B]"
        >
          <div className="relative aspect-square w-full overflow-hidden bg-[#0B0B0B] border-b border-black/10">
            {primaryImage && (
              <ResilientImage
                src={primaryImage.url}
                alt={primaryImage.altText || product.title}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                  secondaryImage && secondaryImage.url !== primaryImage.url
                    ? 'group-hover:opacity-0'
                    : ''
                } ${soldOut ? 'opacity-70 grayscale-[25%]' : ''}`}
              />
            )}

            {secondaryImage &&
              primaryImage &&
              secondaryImage.url !== primaryImage.url && (
                <ResilientImage
                  src={secondaryImage.url}
                  alt={secondaryImage.altText || product.title}
                  className={`absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                    soldOut ? 'grayscale-[25%]' : ''
                  }`}
                />
              )}

            {soldOut ? (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-white text-[#0B0B0B] text-[10px] font-bold tracking-[0.14em] uppercase shadow-sm">
                Esgotado
              </span>
            ) : discountPct > 0 ? (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-white text-[#0B0B0B] text-[10px] font-mono font-bold tabular-nums tracking-wider shadow-sm">
                -{discountPct}% OFF
              </span>
            ) : product.isCustomOrder ? (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-white text-[#0B0B0B] text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm">
                Sob Encomenda
              </span>
            ) : null}
          </div>

          <div className="p-5 flex flex-col flex-1 justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                {product.category}
              </p>
              <h3 className="mt-1.5 font-display text-base font-bold text-[#0B0B0B] leading-snug group-hover:underline decoration-zinc-400 underline-offset-4">
                {product.title}
              </h3>
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-1">
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-xs font-medium text-zinc-500">
                  {formatBRL(primaryVariant.price)}
                </span>
                {primaryVariant.compareAtPrice &&
                  primaryVariant.compareAtPrice > primaryVariant.price && (
                    <span className="text-xs text-zinc-400 line-through">
                      {formatBRL(primaryVariant.compareAtPrice)}
                    </span>
                  )}
              </div>

              <div className="flex items-baseline gap-1.5 tabular-nums">
                <span className="text-lg font-extrabold text-[#0B0B0B]">
                  {formatBRL(pixPrice)}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  no Pix (5% OFF)
                </span>
              </div>

              <p className="text-xs text-zinc-500 tabular-nums">
                ou 6x de {formatBRL(installmentPrice)} sem juros
              </p>
            </div>
          </div>
        </button>
      </article>
    </div>
  );
}
