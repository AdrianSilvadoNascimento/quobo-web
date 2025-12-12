import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ConfirmationType = 'danger' | 'warning' | 'info';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: ConfirmationType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const iconMap = {
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styleMap = {
  danger: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confirmBtn: 'btn-error text-white',
    glow: 'bg-red-100',
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    confirmBtn: 'btn-warning text-white',
    glow: 'bg-amber-100',
  },
  info: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    confirmBtn: 'btn-info text-white',
    glow: 'bg-blue-100',
  },
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const Icon = iconMap[type];
  const styles = styleMap[type];

  return (
    <div className="fixed inset-0 h-full w-full z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 btn btn-sm btn-circle btn-ghost hover:bg-slate-100"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {/* Background Glow */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 ${styles.glow} rounded-full blur-3xl -z-10 opacity-60`}
        ></div>

        {/* Icon */}
        <div
          className={`w-20 h-20 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white`}
        >
          <Icon className={`w-10 h-10 ${styles.iconColor}`} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 mb-3">{title}</h2>

        {/* Message */}
        <p className="text-slate-600 mb-8 leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-ghost flex-1 text-slate-600 font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`btn ${styles.confirmBtn} flex-1 font-semibold shadow-lg`}
          >
            {isLoading ? <span className="loading loading-spinner loading-sm"></span> : confirmText}
          </button>
        </div>
      </div>

      {/* Backdrop Click */}
      <div className="absolute inset-0 -z-10" onClick={!isLoading ? onClose : undefined}></div>
    </div>
  );
};
