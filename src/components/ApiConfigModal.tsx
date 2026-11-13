import { useEffect, useState } from 'react';
import { Check, RefreshCw, Settings, X } from 'lucide-react';
import type { ApiConfig } from '../types/commerce';

interface ApiConfigModalProps {
  config: ApiConfig;
  isLoadingProducts: boolean;
  apiError: string | null;
  onSaveConfig: (nextConfig: ApiConfig) => Promise<void>;
}

export function ApiConfigModal({
  config,
  isLoadingProducts,
  apiError,
  onSaveConfig,
}: ApiConfigModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ApiConfig>(config);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setDraft(config);
  }, [config, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(false);
    await onSaveConfig(draft);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        data-testid="dev-mode-trigger"
        aria-label={`Configurar API (Dev Mode - ${config.useMockData ? 'Mock' : 'Live'})`}
        title={`Configurar API (Dev Mode · ${config.useMockData ? 'Modo Mock' : 'Shopify Live'})`}
        className="group fixed bottom-4 left-4 z-40 inline-flex items-center justify-center h-10 w-10 hover:w-auto hover:px-3.5 bg-zinc-950/90 hover:bg-zinc-950 text-white backdrop-blur border border-zinc-800 shadow-lg rounded-full text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
      >
        <Settings className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="hidden group-hover:inline-block ml-2 whitespace-nowrap">
          API ({config.useMockData ? 'Mock' : 'Live'})
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="api-config-title"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  Dev Mode · Integração Headless
                </p>
                <h2
                  id="api-config-title"
                  className="mt-1 font-display text-xl font-semibold text-[#0F172A]"
                >
                  Configurar Shopify Storefront API
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar configurações de API"
                className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-2">
                  Fonte de Dados do Catálogo & Checkout
                </span>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, useMockData: true }))
                    }
                    className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      draft.useMockData
                        ? 'bg-white text-[#0F172A] shadow-sm'
                        : 'text-slate-600 hover:text-[#0F172A]'
                    }`}
                  >
                    Modo Mock (Teste)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, useMockData: false }))
                    }
                    className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      !draft.useMockData
                        ? 'bg-white text-[#0F172A] shadow-sm'
                        : 'text-slate-600 hover:text-[#0F172A]'
                    }`}
                  >
                    Modo Shopify Live
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="shopify-domain-input"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    SHOPIFY_DOMAIN
                  </label>
                  <input
                    id="shopify-domain-input"
                    type="text"
                    value={draft.shopifyDomain}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        shopifyDomain: e.target.value,
                      }))
                    }
                    placeholder="casadaprata.myshopify.com"
                    className="w-full h-10 px-3 rounded-md border border-slate-300 text-xs font-mono text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0F172A]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shopify-token-input"
                    className="block text-xs font-medium text-zinc-700 mb-1"
                  >
                    STOREFRONT_ACCESS_TOKEN
                  </label>
                  <input
                    id="shopify-token-input"
                    type="password"
                    value={draft.storefrontAccessToken}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        storefrontAccessToken: e.target.value,
                      }))
                    }
                    placeholder="shpat_ ou token público Storefront API"
                    className="w-full h-10 px-3 rounded-md border border-zinc-300 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950"
                  />
                </div>
              </div>

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                As credenciais são salvas exclusivamente no{' '}
                <code className="font-mono">localStorage</code> do seu navegador.
                No modo Shopify Live, as chamadas usam o endpoint GraphQL{' '}
                <code className="font-mono">/api/2024-10/graphql.json</code>.
              </p>

              {apiError && (
                <div
                  role="alert"
                  className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-800"
                >
                  {apiError}
                </div>
              )}

              {savedNotice && !apiError && (
                <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Configuração salva e catálogo atualizado.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-md border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={isLoadingProducts}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 disabled:opacity-60 cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isLoadingProducts ? 'animate-spin' : ''
                    }`}
                    aria-hidden="true"
                  />
                  <span>Salvar e Aplicar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
