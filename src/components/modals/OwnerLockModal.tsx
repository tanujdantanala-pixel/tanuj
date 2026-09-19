import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, X, KeyRound, AlertCircle, Delete } from 'lucide-react';

interface OwnerLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetActionTitle?: string;
  correctPin: string;
}

export const OwnerLockModal: React.FC<OwnerLockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetActionTitle,
  correctPin,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
    }
  }, [isOpen]);

  // Keyboard handler for laptop/desktop physical typing
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        verifyPin(pin);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, correctPin]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(null);

    // Auto-verify when 4th digit entered
    if (newPin.length === 4) {
      verifyPin(newPin);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const verifyPin = (candidatePin: string) => {
    if (candidatePin === correctPin) {
      onSuccess();
      onClose();
    } else {
      setError('Incorrect Owner PIN. Access denied.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#13161C] border border-[#2B3444] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#7E8B9C] hover:text-[#E2E8F0] hover:bg-[#1A1F28] transition-colors cursor-pointer"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#947124]/30 to-[#E5B842]/20 border border-[#E5B842]/40 flex items-center justify-center mx-auto text-[#E5B842] shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif-luxury text-xl font-bold text-[#E2E8F0] tracking-wide">
              Owner Access Required
            </h3>
            <p className="text-xs text-[#8A95A6] mt-0.5">
              Enter 4-digit Owner PIN to authorize
            </p>
          </div>

          {targetActionTitle && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A202A] border border-[#2B3545] rounded-full text-[11px] font-medium text-[#E5B842]">
              <Lock className="w-3 h-3 text-[#E5B842]" />
              <span>{targetActionTitle}</span>
            </div>
          )}
        </div>

        {/* PIN Circles Display */}
        <div className="my-6">
          <div className="flex justify-center items-center gap-4">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = index < pin.length;
              return (
                <div
                  key={index}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                    isFilled
                      ? 'border-[#E5B842] bg-[#E5B842]/10 text-[#E5B842] shadow-[0_0_12px_rgba(229,184,66,0.25)]'
                      : 'border-[#28313E] bg-[#181C23] text-[#4A5568]'
                  }`}
                >
                  {isFilled ? (
                    showPin ? (
                      <span className="font-mono text-xl font-bold text-[#E5B842]">
                        {pin[index]}
                      </span>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#E5B842]" />
                    )
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#323C4B]" />
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs mt-3 animate-shake">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Onscreen Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-xl bg-[#1A1F27] hover:bg-[#242C38] active:bg-[#E5B842]/20 border border-[#27313F] text-lg font-bold text-[#E2E8F0] hover:text-[#E5B842] transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-[#171B22] hover:bg-[#202632] border border-[#242D3B] text-xs font-semibold text-[#8A95A6] hover:text-[#E2E8F0] transition-all flex items-center justify-center cursor-pointer uppercase tracking-wider active:scale-95"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-xl bg-[#1A1F27] hover:bg-[#242C38] active:bg-[#E5B842]/20 border border-[#27313F] text-lg font-bold text-[#E2E8F0] hover:text-[#E5B842] transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-[#171B22] hover:bg-[#202632] border border-[#242D3B] text-[#8A95A6] hover:text-[#FF6B6B] transition-all flex items-center justify-center cursor-pointer active:scale-95"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Footer & Hint */}
        <div className="mt-5 pt-4 border-t border-[#202633] flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full text-[11px] text-[#718096]">
            <span>Default PIN: <strong className="text-[#E5B842]">1234</strong></span>
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="text-[#8A95A6] hover:text-[#E2E8F0] transition-colors cursor-pointer"
            >
              {showPin ? 'Hide PIN' : 'Peek PIN'}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-1 py-2 text-xs font-semibold text-[#8A95A6] hover:text-[#E2E8F0] bg-transparent hover:bg-[#1A1F28] rounded-lg transition-colors cursor-pointer"
          >
            Cancel / Stay in Staff Mode
          </button>
        </div>
      </div>
    </div>
  );
};
