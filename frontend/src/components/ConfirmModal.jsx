import React from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm Restore',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#FE7F42]/25 bg-[#2A1617] p-6 shadow-2xl text-[#FFFB97] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl border border-[#B32C1A] bg-[#B32C1A]/20 text-[#FE7F42]">
              <AlertTriangle className="w-5 h-5 text-[#FE7F42]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                {title}
              </h3>
              <span className="text-[10px] font-mono text-[#FE7F42] tracking-wider uppercase">
                S3 Head Duplication Rollback
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 rounded-lg text-[#7A4B47] hover:text-[#FFFB97] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 text-xs font-mono text-[#FFFB97]/85 leading-relaxed">
          {message && <p>{message}</p>}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#FE7F42]/20 font-mono">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-[#7A4B47] text-[#7A4B47] hover:text-[#FFFB97] hover:border-[#FFFB97] transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl text-xs font-black tracking-wider uppercase bg-[#B32C1A] hover:bg-[#B32C1A]/85 text-white transition flex items-center space-x-2 shadow-lg shadow-[#B32C1A]/30 disabled:opacity-50"
          >
            {isLoading ? (
              <span>RESTORING...</span>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
