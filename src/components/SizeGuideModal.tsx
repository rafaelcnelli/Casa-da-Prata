import { useEffect } from 'react';
import { Ruler, X } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RING_SIZE_ROWS = [
  { aro: '14', circumference: '54 mm', diameter: '16,2 mm' },
  { aro: '15', circumference: '55 mm', diameter: '16,5 mm' },
  { aro: '16', circumference: '56 mm', diameter: '16,8 mm' },
  { aro: '17', circumference: '57 mm', diameter: '17,2 mm' },
  { aro: '18', circumference: '58 mm', diameter: '17,5 mm' },
  { aro: '19', circumference: '59 mm', diameter: '17,8 mm' },
  { aro: '20', circumference: '60 mm', diameter: '18,2 mm' },
];

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[88vh] overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Ruler className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                Casa da Prata · Joalheria
              </p>
              <h3
                id="size-guide-title"
                className="font-display text-xl font-semibold text-[#0F172A]"
              >
                Guia de Medidas (Anéis & Correntes)
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar guia de medidas"
            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600">
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-2">
            <h4 className="font-semibold text-[#0F172A]">
              1. Como descobrir seu Aro de Anel
            </h4>
            <p className="text-xs leading-relaxed">
              Enrole uma tira fina de papel ou linha ao redor do dedo sem
              apertar, marque onde as pontas se encontram e meça em uma régua em
              milímetros. Você também pode medir o diâmetro interno (em mm) de
              um anel que já sirva confortavelmente.
            </p>
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-left text-xs tabular-nums border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-1.5 font-semibold">Aro</th>
                    <th className="py-1.5 font-semibold">Circunferência</th>
                    <th className="py-1.5 font-semibold">Diâmetro Interno</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RING_SIZE_ROWS.map((row) => (
                    <tr key={row.aro}>
                      <td className="py-1.5 font-semibold text-[#0F172A]">
                        Aro {row.aro}
                      </td>
                      <td className="py-1.5">{row.circumference}</td>
                      <td className="py-1.5">{row.diameter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-2">
            <h4 className="font-semibold text-[#0F172A]">
              2. Comprimento de Correntes & Pulseiras
            </h4>
            <ul className="space-y-1.5 text-xs leading-relaxed tabular-nums">
              <li>
                <strong className="text-[#0F172A]">40 cm:</strong> Altura da
                clavícula (choker ajustado ao pescoço).
              </li>
              <li>
                <strong className="text-[#0F172A]">45 cm:</strong> Comprimento
                tradicional feminino na altura do colo.
              </li>
              <li>
                <strong className="text-[#0F172A]">60 cm – 70 cm:</strong>{' '}
                Caimento alongado na altura do peito (ideal para modelos
                masculinos e terços).
              </li>
              <li>
                <strong className="text-[#0F172A]">Pulseiras 19 cm – 21 cm:</strong>{' '}
                19 cm para pulsos finos/médios e 20–21 cm para pulsos médios/largos.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#0F172A] text-white rounded-md text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Entendi, voltar à joia
          </button>
        </div>
      </div>
    </div>
  );
}
