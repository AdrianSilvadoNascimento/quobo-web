import React, { useState } from 'react';
import { ApiTokenSection } from '../components/ApiTokenSection';
import { WebhookSection } from '../components/WebhookSection';
import { WebhookEventsView } from '../components/WebhookEventsView';

export const IntegrationPage: React.FC = () => {
  const [showEventsView, setShowEventsView] = useState(false);

  if (showEventsView) {
    return <WebhookEventsView onBack={() => setShowEventsView(false)} />;
  }

  return (
    <div className="space-y-8">
      <ApiTokenSection />
      <div className="divider"></div>
      <WebhookSection onViewEvents={() => setShowEventsView(true)} />
    </div>
  );
};
