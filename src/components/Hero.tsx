import { ArrowRight } from 'lucide-react';
import { ResilientImage } from './ResilientImage';

interface HeroProps {
  onSelectCategory: (category: string) => void;
}

export const HERO_BANNER_ARTWORK = '/assets/aistudio/image_3b1fd7dc.png';

export function Hero({ onSelectCategory }: HeroProps) {
  const scrollToCatalog = (category?: string) => {
    if (category) {
      onSelectCategory(category);
    }
    const el = document.getElementById('catalogo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="topo"
      aria-label="Apresentação Casa da Prata"
      className="relative overflow-hidden bg-[#FFFFFF] border-b border-black/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 sm:pt-8 sm:pb-12">
        {/* Top Editorial Kicker Row */}
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.26em] text-zinc-900 leading-relaxed">
              JOIAS AUTORAIS
              <br />
              QUE ATRAVESSAM
              <br />
              GERAÇÕES.
            </p>
            <div className="w-10 h-[2px] bg-[#0B0B0B]" aria-hidden="true" />
          </div>

          <div className="hidden sm:block text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-900">
              PRATA 925 DE LEI · PEDRAS NATURAIS
            </p>
            <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
              GOIÂNIA · DESDE 1996
            </p>
          </div>
        </div>

        {/* Main Editorial Banner Artwork (Imagem 2: "Casa da Prata" High-Contrast Serif + Drop Earrings) */}
        <div className="relative my-2 sm:my-4 flex items-center justify-center">
          <h1 className="sr-only">
            Casa da Prata — Joalheria Especializada em Prata 925, Pedras Naturais e Joias Sob Encomenda
          </h1>
          <div className="w-full max-w-6xl mx-auto overflow-hidden bg-[#FFFFFF]">
            <ResilientImage
              src={HERO_BANNER_ARTWORK}
              alt="Casa da Prata — Alta Joalheria em Prata 925 e Pedrarias"
              className="w-full h-auto max-h-[340px] sm:max-h-[450px] lg:max-h-[520px] object-contain mx-auto select-none"
            />
          </div>
        </div>

        {/* Bottom Action & Collection Stamp Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-2">
          <div className="flex flex-wrap items-center gap-5 sm:gap-7">
            <button
              type="button"
              onClick={() => scrollToCatalog()}
              className="inline-flex items-center justify-center gap-2.5 h-12 px-8 bg-[#0B0B0B] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B0B0B] focus-visible:ring-offset-2"
            >
              <span>Ver Coleção</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToCatalog('Sob Encomenda')}
              className="inline-flex items-center gap-2 py-2 border-b-2 border-[#0B0B0B] text-xs font-bold uppercase tracking-[0.18em] text-[#0B0B0B] hover:text-zinc-600 hover:border-zinc-600 transition-colors cursor-pointer"
            >
              <span>Explorar Sob Encomenda</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-[#0B0B0B] leading-relaxed">
              COLEÇÃO
              <br />
              PRATA &amp; PEDRAS
              <br />
              2026
            </p>
            <div
              className="w-10 h-[2px] bg-[#0B0B0B] sm:ml-auto"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Dark 3-Column Category Spotlight Strip with Real Casa da Prata Product Photos */}
      <div className="bg-[#0B0B0B] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="flex items-center gap-4 sm:gap-5 bg-white/[0.03] border border-white/10 p-3.5">
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-black shrink-0 overflow-hidden border border-white/10">
              <ResilientImage
                src="/assets/products/anel-pedra-natural-1.png"
                alt="Anéis e Pedras Naturais em Prata 925 Casa da Prata"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2 min-w-0">
              <h2 className="font-display text-sm sm:text-base font-bold uppercase tracking-[0.14em] text-white">
                ANÉIS &amp; PEDRAS
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                Pedras naturais lapidadas, solitários cravejados e ourivesaria autoral.
              </p>
              <button
                type="button"
                onClick={() => scrollToCatalog('Anéis & Pedras Naturais')}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white border-b border-white pb-0.5 hover:text-zinc-300 cursor-pointer"
              >
                <span>VER ANÉIS</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-5 bg-white/[0.03] border border-white/10 p-3.5">
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-black shrink-0 overflow-hidden border border-white/10">
              <ResilientImage
                src="/assets/products/pulseira-bali-real-1.png"
                alt="Pulseiras e braceletes em Prata 925 Casa da Prata"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2 min-w-0">
              <h2 className="font-display text-sm sm:text-base font-bold uppercase tracking-[0.14em] text-white">
                PULSEIRAS &amp; BERLOQUES
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                Braceletes trabalhados estilo Bali, fecho coração e berloques em Prata 925.
              </p>
              <button
                type="button"
                onClick={() => scrollToCatalog('Pulseiras & Masculino')}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white border-b border-white pb-0.5 hover:text-zinc-300 cursor-pointer"
              >
                <span>VER PULSEIRAS</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-5 bg-white/[0.03] border border-white/10 p-3.5">
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-black shrink-0 overflow-hidden border border-white/10">
              <ResilientImage
                src="/assets/products/argola-prata-1.png"
                alt="Brincos Argolas e Joias Religiosas em Prata 925 Casa da Prata"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2 min-w-0">
              <h2 className="font-display text-sm sm:text-base font-bold uppercase tracking-[0.14em] text-white">
                ARGOLAS &amp; RELIGIOSOS
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                Argolas clássicas com fecho italiano, brincos cruz e terços em Prata 925.
              </p>
              <button
                type="button"
                onClick={() => scrollToCatalog('Brincos & Argolas')}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white border-b border-white pb-0.5 hover:text-zinc-300 cursor-pointer"
              >
                <span>VER ARGOLAS</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
