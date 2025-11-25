import React from 'react';
import { Wifi } from 'lucide-react';

interface CreditCard3DProps {
  cardNumber: string;
  holderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  isFlipped?: boolean;
}

export const CreditCard3D: React.FC<CreditCard3DProps> = ({
  cardNumber,
  holderName,
  expiryMonth,
  expiryYear,
  cvv,
  isFlipped = false,
}) => {
  const formattedNumber = cardNumber.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim();
  const formattedExpiry = `${expiryMonth.toString().padStart(2, '0')}/${expiryYear.toString().slice(-2)}`;

  return (
    <div className="group w-full max-w-[380px] h-[240px] [perspective:1000px]">
      <div
        className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 shadow-2xl border border-slate-700/50 flex flex-col justify-between relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

            {/* Top Row: Chip & Contactless */}
            <div className="flex justify-between items-start z-10">
              <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 border border-yellow-600/50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 border-[0.5px] border-black/20 rounded-md"></div>
                <div className="w-full h-[1px] bg-black/20 absolute top-1/2 -translate-y-1/2"></div>
                <div className="h-full w-[1px] bg-black/20 absolute left-1/2 -translate-x-1/2"></div>
                <div className="w-6 h-4 border border-black/20 rounded-sm"></div>
              </div>
              <Wifi className="w-8 h-8 text-white/80 rotate-90" />
            </div>

            {/* Middle: Card Number */}
            <div className="mt-4 z-10">
              <div className="text-2xl font-mono tracking-widest drop-shadow-md">
                {formattedNumber}
              </div>
            </div>

            {/* Bottom: Name & Expiry */}
            <div className="flex justify-between items-end z-10">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Nome do Titular</span>
                <span className="font-medium tracking-wide uppercase truncate max-w-[200px]">
                  {holderName || 'NOME DO TITULAR'}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Validade</span>
                <span className="font-mono font-medium tracking-wider">
                  {formattedExpiry}
                </span>
              </div>
            </div>

            {/* Brand Logo (Placeholder) */}
            <div className="absolute bottom-6 right-6 opacity-50">
              {/* Simple circles for generic card brand */}
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full bg-red-500/80"></div>
                <div className="w-8 h-8 rounded-full bg-orange-500/80"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border border-slate-700/50 relative overflow-hidden">
            {/* Magnetic Strip */}
            <div className="w-full h-12 bg-black/80 mt-6 backdrop-blur-sm"></div>

            {/* CVV Area */}
            <div className="px-6 mt-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/60 uppercase tracking-wider mb-1 mr-2">CVV</span>
                <div className="w-full h-10 bg-white rounded flex items-center justify-end px-3">
                  <span className="text-slate-900 font-mono font-bold tracking-widest">
                    {cvv || '•••'}
                  </span>
                </div>
              </div>
            </div>

            {/* Hologram/Details */}
            <div className="px-6 mt-6 flex justify-between items-center opacity-60">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/20"></div>
              </div>
              <p className="text-[8px] text-justify max-w-[180px] leading-tight">
                Este cartão é intransferível e de propriedade do emissor.
                O uso deste cartão implica na aceitação dos termos de contrato.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
