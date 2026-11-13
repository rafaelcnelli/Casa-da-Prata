import { useEffect, useState } from 'react';
import { Check, CheckCircle2, Copy, ExternalLink, X } from 'lucide-react';
import type {
  CheckoutSimulationPayload,
  ShopifyCheckoutResult,
} from '../types/commerce';

interface CheckoutSimulationModalProps {
  isOpen: boolean;
  payload: CheckoutSimulationPayload | null;
  liveCheckoutResult: ShopifyCheckoutResult | null;
  onClose: () => void;
  onConfirmMockOrder: () => void;
}

export function CheckoutSimulationModal({
  isOpen,
  payload,
  liveCheckoutResult,
  onClose,
  onConfirmMockOrder,
}: CheckoutSimulationModalProps) {
  const [copied, setCopied] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setOrderConfirmed(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || (!payload && !liveCheckoutResult)) return null;

  const formattedJson = payload ? JSON.stringify(payload, null, 2) : '';

  const handleCopy = async () => {
    if (!formattedJson) return;
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable in restricted iframe
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              {liveCheckoutResult
                ? 'Shopify Storefront API'
                : 'Casa da Prata · Integração Bling ERP -> Shopify'}
            </p>
            <h2
              id="checkout-modal-title"
              className="mt-1 font-display text-xl font-semibold text-[#0F172A]"
            >
              {liveCheckoutResult
                ? 'Checkout Oficial Gerado'
                : orderConfirmed
                  ? 'Pedido Simulado Registrado (#CDP-2048)'
                  : 'Payload JSON de Checkout'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de checkout"
            className="w-9 h-9 flex items-center justify-center rounded-md text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {liveCheckoutResult ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm space-y-1">
              <p className="font-semibold">
                Cart criado com sucesso na Shopify!
              </p>
              <p className="text-xs font-mono break-all text-emerald-800">
                Cart ID: {liveCheckoutResult.cartId}
              </p>
            </div>

            <a
              href={liveCheckoutResult.checkoutUrl}
              target="_top"
              rel="noopener noreferrer"
              className="w-full h-12 bg-[#0F172A] text-white rounded-md text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>Ir para Checkout Oficial Shopify</span>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        ) : orderConfirmed ? (
          <div className="p-5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-900">
              <CheckCircle2
                className="w-5 h-5 text-emerald-700"
                aria-hidden="true"
              />
              <span className="font-semibold text-sm">
                Simulação concluída e sacola limpa
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Em produção, os SKUs da Casa da Prata disparam a baixa automática
              de estoque no Bling ERP em Goiânia e emitem a NF-e assim que a
              Shopify confirma o pagamento.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#0F172A] text-white rounded-md text-xs font-semibold hover:bg-slate-800 cursor-pointer"
            >
              Voltar para a Joalheria
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              O Modo Mock está ativo. Abaixo está o payload JSON exato com{' '}
              <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">
                merchandiseId
              </code>
              , SKUs padrão{' '}
              <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">
                CDP-*
              </code>{' '}
              e observações de gravação enviados na mutation{' '}
              <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">
                cartCreate
              </code>
              :
            </p>

            <div className="relative">
              <button
                type="button"
                onClick={handleCopy}
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 text-slate-100 text-[11px] font-medium hover:bg-slate-700 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check
                      className="w-3.5 h-3.5 text-emerald-400"
                      aria-hidden="true"
                    />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copiar JSON</span>
                  </>
                )}
              </button>

              <pre
                data-testid="checkout-json-payload"
                className="p-4 pt-12 rounded-lg bg-[#0F172A] text-slate-100 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed"
              >
                {formattedJson}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Continuar Comprando
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrderConfirmed(true);
                  onConfirmMockOrder();
                }}
                className="px-5 py-2.5 bg-[#0F172A] text-white rounded-md text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Simular Confirmação de Pedido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
