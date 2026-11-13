import { CASA_DA_PRATA_LOGO } from '../data/mockProducts';
import { ResilientImage } from './ResilientImage';

export function Footer() {
  return (
    <footer className="bg-[#0B0B0B] text-zinc-300 border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-black border border-white/15 shrink-0 p-1">
            <ResilientImage
              src={CASA_DA_PRATA_LOGO}
              alt="Logo Casa da Prata"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-display text-lg font-extrabold tracking-[0.16em] text-white block">
              CASA DA PRATA
            </span>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-zinc-400 uppercase">
              Joalheria e Pedrarias · Desde 1996
            </span>
            <p className="mt-3 text-xs text-zinc-400 leading-relaxed max-w-xs">
              Goiânia - GO · Prata 925 legítima, pedras naturais selecionadas e
              alianças ou joias personalizadas em Ouro 18k sob encomenda.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
            Operação Headless
          </h3>
          <ul className="mt-3.5 space-y-2 text-xs text-zinc-400">
            <li>Bling ERP · Controle fiscal e SKUs por aro/tamanho (CDP-*)</li>
            <li>Shopify Storefront API (2024-10) · Catálogo e Cart GraphQL</li>
            <li>Checkout Seguro · Redirecionamento oficial e 5% OFF no Pix</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
            Atendimento &amp; Envios
          </h3>
          <ul className="mt-3.5 space-y-2 text-xs text-zinc-400">
            <li>Entrega Expressa em Goiânia e envio segurado para todo o Brasil</li>
            <li>Frete grátis acima de R$ 249,00 e 6x sem juros no cartão</li>
            <li>Certificado Vitalício Prata 925 e embalagem presenteável</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 pb-20 sm:pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500">
        <span>
          © 2026 Casa da Prata Joalheria — Goiânia - GO. Todos os direitos
          reservados.
        </span>
        <span>Headless Commerce · Bling ERP + Shopify Storefront</span>
      </div>
    </footer>
  );
}
