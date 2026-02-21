import { Button } from '@/components/ui';
import React from 'react';

interface SessionExpiryModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onLogout: () => void;
  isChangingToken: boolean;
  timeLeft: string;
}

export const SessionExpiryModal: React.FC<SessionExpiryModalProps> = ({ isOpen, onContinue, onLogout, isChangingToken, timeLeft }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 transform transition-all scale-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Sessão Expirando</h2>
        <p className="text-gray-600 text-center mb-8">
          Sua sessão irá expirar em {timeLeft}. <br />
          Deseja continuar logado?
        </p>

        <div className="flex gap-4 justify-center">
          <Button variant="primary" onClick={onLogout}>Sair</Button>
          <Button
            variant="secondary"
            onClick={onContinue}
            isLoading={isChangingToken}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};
