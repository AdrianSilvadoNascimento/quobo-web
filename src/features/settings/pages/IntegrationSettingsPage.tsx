import React from 'react';
import { ApiTokenSection } from '@/features/account/components/ApiTokenSection';

export const IntegrationSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-xl font-bold text-slate-800">Tokens de API</h2>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie chaves de acesso para integrar a Quobo em seus sistemas externos.
        </p>
      </div>
      <div className="bg-white/50 rounded-2xl p-4">
        <ApiTokenSection />
      </div>
    </div>
  );
};
