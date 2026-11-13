import { MessageCircle } from 'lucide-react';
import { WHATSAPP_STORE_PHONE } from '../utils/commerce';

export function FloatingWhatsAppButton() {
  const defaultMessage = encodeURIComponent(
    'Olá, Casa da Prata! Gostaria de atendimento sobre joias em Prata 925 e opções de personalização sob encomenda.'
  );
  const whatsappHref = `https://wa.me/${WHATSAPP_STORE_PHONE}?text=${defaultMessage}`;

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="floating-whatsapp-button"
      aria-label="Atendimento rápido via WhatsApp — Vendas e Personalização"
      className="group fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 inline-flex items-center gap-2.5 h-11 pl-3 pr-4 bg-[#0B0B0B] text-white border border-white/15 rounded-full shadow-xl hover:bg-zinc-900 transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B0B0B] focus-visible:ring-offset-2"
    >
      <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
        <MessageCircle className="w-4 h-4" aria-hidden="true" />
      </span>
      <span className="flex flex-col text-left leading-none">
        <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-300 font-medium">
          Vendas & Sob Medida
        </span>
        <span className="text-xs font-semibold tracking-tight text-white mt-0.5 whitespace-nowrap">
          WhatsApp Casa da Prata
        </span>
      </span>
    </a>
  );
}
