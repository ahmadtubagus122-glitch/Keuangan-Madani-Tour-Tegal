import React from 'react';
import { AlertTriangle, Send, Trash2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  details?: { label: string; value: string }[];
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'primary',
  isLoading = false,
  details = [],
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className={`p-4 px-6 flex items-center justify-between border-b ${
          isDanger ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center gap-2.5 font-bold text-sm">
            {isDanger ? (
              <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Send className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            {description}
          </p>

          {details.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
              {details.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 font-medium shrink-0">{item.label}:</span>
                  <span className="font-semibold text-slate-800 text-right break-all">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>Tindakan ini akan diproses langsung ke akun Google/Gmail Anda.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
