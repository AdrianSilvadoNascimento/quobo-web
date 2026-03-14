import React, { useState } from 'react';
import { WebhookSection } from '@/features/account/components/WebhookSection';
import { WebhookEventsView } from '@/features/account/components/WebhookEventsView';

export const WebhookSettingsPage: React.FC = () => {
  const [showEventsView, setShowEventsView] = useState(false);

  if (showEventsView) {
    return <WebhookEventsView onBack={() => setShowEventsView(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-xl font-bold text-slate-800">Webhooks</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure URLs para receber notificações em tempo real sobre eventos na sua conta.
        </p>
      </div>
      <div className="bg-white/50 rounded-2xl p-4">
        <WebhookSection onViewEvents={() => setShowEventsView(true)} />
      </div>
    </div>
  );
};
