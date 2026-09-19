import React, { useEffect, useState } from 'react';
import { UndoItem } from '../types';
import { RotateCcw, X, AlertCircle } from 'lucide-react';

interface UndoToastProps {
  undoItem: UndoItem | null;
  onUndo: (item: UndoItem) => void;
  onDismiss: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  undoItem,
  onUndo,
  onDismiss,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  useEffect(() => {
    if (!undoItem) return;

    setSecondsRemaining(30);

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((undoItem.expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [undoItem, onDismiss]);

  if (!undoItem || secondsRemaining <= 0) return null;

  const progressPct = (secondsRemaining / 30) * 100;

  return (
    <div
      id="global-undo-toast"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full sm:w-[380px] bg-[#161A22] border border-[#374151] rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
    >
      {/* 30-Second Progress Bar */}
      <div className="h-1.5 w-full bg-[#222936]">
        <div
          className="h-full bg-gradient-to-r from-[#E5B842] to-[#F59E0B] transition-all duration-200 ease-linear"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#F3F4F6] truncate">
                {undoItem.title}
              </span>
              <span className="text-[10px] text-[#9CA3AF] bg-[#222936] px-1.5 py-0.2 rounded">
                {secondsRemaining}s
              </span>
            </div>
            <p className="text-[11px] text-[#9CA3AF] truncate">
              {undoItem.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onUndo(undoItem)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>UNDO</span>
          </button>
          <button
            onClick={onDismiss}
            className="w-7 h-7 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#222936] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
