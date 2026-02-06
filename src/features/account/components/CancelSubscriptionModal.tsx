import React, { useState } from 'react';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountApi } from '@/services/accountApi';
import { AlertModal, type AlertType } from '@/components/AlertModal';
import { Button } from '@/components/ui';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string;
  renewalDate: string;
}

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscriptionId,
  renewalDate,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const queryClient = useQueryClient();

  const { mutate: cancelSubscription, isPending: isLoading } = useMutation({
    mutationFn: () => accountApi.cancelSubscription(subscriptionId),
    onSuccess: () => {
      setAlert({
        isOpen: true,
        title: 'Cancelamento Confirmado',
        message: 'Sua assinatura foi cancelada com sucesso. Você ainda pode usar a plataforma até o fim do período.',
        type: 'success'
      });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      // Don't close immediately, wait for user to read alert or close it
    },
    onError: (error: any) => {
      console.error('Error canceling subscription:', error);
      setAlert({
        isOpen: true,
        title: 'Erro no Cancelamento',
        message: error.message || 'Ocorreu um erro ao cancelar sua assinatura.',
        type: 'error'
      });
    },
  });

  const handleConfirm = () => {
    if (isChecked) {
      cancelSubscription();
    }
  };

  const handleAlertClose = () => {
    setAlert({ ...alert, isOpen: false });
    if (alert.type === 'success') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">

          {/* Header - Danger Theme */}
          <div className="bg-red-50 p-6 flex flex-col items-center justify-center text-center border-b border-red-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-bold text-red-900">Cancelar Assinatura?</h2>
            <p className="text-red-700 text-sm mt-2">
              Essa ação interromperá as cobranças futuras.
            </p>
          </div>

          <Button
            onClick={onClose}
            variant="back"
            icon={<X size={20} />}
            className="absolute top-4 right-4"
          />

          <div className="p-6 space-y-6">

            <div className="alert alert-warning shadow-sm">
              <AlertCircle className="w-5 h-5" />
              <div className="text-sm">
                <span className="font-bold">Atenção: </span>
                <p>
                  Sua assinatura permanecerá ativa até o final do ciclo atual ({renewalDate}).
                  Após essa data, o cancelamento será efetivado.
                </p>
                <p>Seu acesso à plataforma será interrompido imediatamente após o cancelamento.</p>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4 items-center p-0">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error text-white shrink-0 mt-1"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                />
                <span className="w-1/2 text-sm label-text text-slate-700 leading-tight">
                  Estou ciente que terei acesso à plataforma até o dia <strong>{renewalDate}</strong>.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                Manter Assinatura
              </Button>
              <Button
                variant={isChecked ? 'danger' : 'secondary'}
                className="flex-1"
                onClick={handleConfirm}
                disabled={!isChecked || isLoading}
                isLoading={isLoading}
              >
                Confirmar Cancelamento
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={handleAlertClose}
      />
    </>
  );
};
