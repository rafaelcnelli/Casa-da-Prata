import { Search, ShoppingBag, X } from 'lucide-react';
import { WHATSAPP_STORE_PHONE } from '../utils/commerce';

interface HeaderProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const STORE_CATEGORIES = [
  'Todas as Joias',
  'Anéis & Pedras Naturais',
  'Brincos & Argolas',
  'Pulseiras & Masculino',
  'Religiosos',
  'Sob Encomenda',
] as const;

const HEADER_NAV_ITEMS: Array<{
  label: string;
  category: (typeof STORE_CATEGORIES)[number];
}> = [
  { label: 'TODAS', category: 'Todas as Joias' },
  { label: 'ANÉIS', category: 'Anéis & Pedras Naturais' },
  { label: 'BRINCOS', category: 'Brincos & Argolas' },
  { label: 'PULSEIRAS', category: 'Pulseiras & Masculino' },
  { label: 'ENCOMENDA', category: 'Sob Encomenda' },
];

export function Header({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
}: HeaderProps) {
  const handleNavClick = (categoryValue: string) => {
    onSelectCategory(categoryValue);
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-black/10">
      {/* Top Black Utility Bar */}
      <div className="bg-[#0B0B0B] text-zinc-200 h-8 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6 text-[10px] sm:text-[11px] uppercase tracking-[0.13em]">
        <p className="truncate font-medium">
          <span className="sm:hidden">
            💎 Garantia Vitalícia Prata 925 · Goiânia &amp; Brasil · 5% OFF no Pix
          </span>
          <span className="hidden sm:inline">
            💎 Garantia Vitalícia Prata 925 · Enviamos para todo o Brasil e Entrega Expressa em Goiânia · 5% OFF no Pix
          </span>
        </p>

        <div className="hidden xl:flex items-center gap-3 shrink-0 text-[10px] text-zinc-300 font-medium">
          <button
            type="button"
            onClick={() => handleNavClick('Religiosos')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            RELIGIOSOS
          </button>
          <span aria-hidden="true" className="text-zinc-600">
            |
          </span>
          <button
            type="button"
            onClick={() => handleNavClick('Sob Encomenda')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            GRAVAÇÃO &amp; OURO 18K
          </button>
          <span aria-hidden="true" className="text-zinc-600">
            |
          </span>
          <a
            href={`https://wa.me/${WHATSAPP_STORE_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            ATENDIMENTO GOIÂNIA
          </a>
        </div>
      </div>

      {/* Main 3-Zone Editorial Navigation — guaranteed non-overlapping */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Zone: Concise GAZU-style Uppercase Links */}
        <nav
          aria-label="Categorias de joias"
          className="hidden lg:flex flex-1 items-center gap-4 xl:gap-5 min-w-0 pr-4 overflow-hidden"
        >
          {HEADER_NAV_ITEMS.map((item) => {
            const isActive = activeCategory === item.category;
            return (
              <button
                key={item.category}
                type="button"
                onClick={() => handleNavClick(item.category)}
                className={`text-[11px] font-semibold tracking-[0.1em] uppercase whitespace-nowrap shrink-0 py-1 transition-colors border-b cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B0B0B] ${
                  isActive
                    ? 'text-[#0B0B0B] border-[#0B0B0B]'
                    : 'text-zinc-600 border-transparent hover:text-[#0B0B0B]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Center Zone: Brand Wordmark with guaranteed horizontal clearance */}
        <div className="shrink-0 flex items-center justify-start lg:justify-center lg:px-4">
          <a
            href="#topo"
            className="flex flex-col items-start lg:items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B0B0B] rounded-sm"
          >
            <span className="font-serif-editorial text-xl sm:text-2xl font-bold tracking-[0.14em] text-[#0B0B0B] whitespace-nowrap leading-none">
              CASA DA PRATA
            </span>
            <span className="mt-1 text-[9px] font-semibold tracking-[0.26em] text-zinc-500 uppercase whitespace-nowrap leading-none">
              JOALHERIA • PRATA 925
            </span>
          </a>
        </div>

        {/* Right Zone: Search & Cart */}
        <div className="flex-1 flex items-center justify-end gap-3 shrink-0 pl-4">
          <div className="relative hidden md:block w-44 xl:w-52">
            <Search
              className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="BUSCAR JOIA OU SKU..."
              aria-label="Buscar joia ou SKU"
              className="w-full h-9 pl-8 pr-7 bg-[#F4F3EF] border border-black/15 text-[11px] font-medium tracking-wider text-[#0B0B0B] placeholder:text-zinc-500 focus:outline-none focus:bg-white focus:border-[#0B0B0B] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#0B0B0B] p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Abrir sacola de joias (${cartCount} ${cartCount === 1 ? 'item' : 'itens'})`}
            className="inline-flex items-center gap-2 h-9 px-3.5 bg-[#0B0B0B] text-white text-[11px] font-semibold uppercase tracking-[0.14em] hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B0B0B] focus-visible:ring-offset-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
            <span>SACOLA</span>
            <span
              data-testid="cart-count-badge"
              className="font-mono font-bold tabular-nums"
            >
              ({cartCount})
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
