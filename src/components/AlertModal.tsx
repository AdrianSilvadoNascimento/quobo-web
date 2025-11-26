import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    button: 'btn-success',
    glow: 'bg-green-100',
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    button: 'btn-error',
    glow: 'bg-red-100',
  },
  warning: {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    button: 'btn-warning',
    glow: 'bg-amber-100',
  },
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    button: 'btn-info',
    glow: 'bg-blue-100',
  },
};

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Ok',
}) => {
  if (!isOpen) return null;

  const Icon = iconMap[type];
  const colors = colorMap[type];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 btn btn-sm btn-circle btn-ghost hover:bg-slate-100"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {/* Background Glow */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 ${colors.glow} rounded-full blur-3xl -z-10 opacity-60`}
        ></div>

        {/* Icon */}
        <div
          className={`w-20 h-20 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white`}
        >
          <Icon className={`w-10 h-10 ${colors.text}`} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 mb-3">{title}</h2>

        {/* Message */}
        <p className="text-slate-600 mb-8 leading-relaxed">{message}</p>

        {/* Confirm Button */}
        <button
          onClick={onClose}
          className={`btn ${colors.button} btn-block text-white font-semibold shadow-lg`}
        >
          {confirmText}
        </button>
      </div>

      {/* Backdrop Click */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};
