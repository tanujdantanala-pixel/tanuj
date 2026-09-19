import React, { useState } from 'react';
import { AppSettings } from '../../types';
import { X, Settings as SettingsIcon, Sparkles, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onSave?: (updated: AppSettings) => void;
  onSaveSettings?: (updated: AppSettings) => void;
  onResetData?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onSaveSettings,
  onResetData,
  onClose,
}) => {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [goldRate22k, setGoldRate22k] = useState(settings.goldRate22k.toString());
  const [goldRate24k, setGoldRate24k] = useState(settings.goldRate24k.toString());
  const [silverRate, setSilverRate] = useState(settings.silverRate.toString());
  const [currency, setCurrency] = useState<'₹' | '$'>(settings.currency);
  const [makingChargePct, setMakingChargePct] = useState(settings.makingChargePct.toString());
  const [gstPct, setGstPct] = useState(settings.gstPct.toString());
  const [ownerPin, setOwnerPin] = useState(settings.ownerPin || '1234');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = ownerPin.replace(/\D/g, '').slice(0, 6) || '1234';
    const updatedSettings = {
      ...settings,
      storeName,
      goldRate22k: parseFloat(goldRate22k) || 6150,
      goldRate24k: parseFloat(goldRate24k) || 6720,
      silverRate: parseFloat(silverRate) || 82,
      currency,
      makingChargePct: parseFloat(makingChargePct) || 8,
      gstPct: parseFloat(gstPct) || 3,
      ownerPin: cleanPin,
    };
    const saveHandler = onSave || onSaveSettings;
    if (saveHandler) {
      saveHandler(updatedSettings);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#14171D] border border-[#2B3342] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-[#232832] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F2530] border border-[#2F3947] flex items-center justify-center text-[#E5B842]">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#E2E8F0]">
                Store & Rates Configuration
              </h3>
              <p className="text-xs text-[#8A95A6]">Realtime bullion benchmark and taxes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7E8B9C] hover:text-[#E2E8F0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
              STORE NAME
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                22K GOLD RATE (/g)
              </label>
              <input
                type="number"
                value={goldRate22k}
                onChange={(e) => setGoldRate22k(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E5B842] font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                24K GOLD RATE (/g)
              </label>
              <input
                type="number"
                value={goldRate24k}
                onChange={(e) => setGoldRate24k(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E5B842] font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                SILVER RATE (/g)
              </label>
              <input
                type="number"
                value={silverRate}
                onChange={(e) => setSilverRate(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                CURRENCY FORMAT
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as '₹' | '$')}
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              >
                <option value="₹">₹ (INR Rupee - Lakhs/Crores)</option>
                <option value="$">$ (USD Dollar - Millions)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                MAKING CHARGES (%)
              </label>
              <input
                type="number"
                value={makingChargePct}
                onChange={(e) => setMakingChargePct(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                GST / TAX (%)
              </label>
              <input
                type="number"
                value={gstPct}
                onChange={(e) => setGstPct(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              />
            </div>
          </div>

          <div className="p-3 bg-[#171B22] border border-[#2A3342] rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-[#E5B842] uppercase tracking-wider block">
                OWNER SECURITY PIN (4-DIGITS)
              </label>
              <span className="text-[10px] text-[#718096]">Protects Staff & Admin</span>
            </div>
            <input
              type="password"
              maxLength={6}
              value={ownerPin}
              onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              className="w-full bg-[#11141A] border border-[#2B3545] text-sm text-[#E5B842] font-mono tracking-widest font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
            />
            <p className="text-[10px] text-[#8A95A6]">
              Used to unlock Staff & Payroll, modify customer data, and authorize attendance adjustments.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#232832]">
            {onResetData ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all catalog, staff, clients, and transaction data to factory demo default?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="text-[11px] text-[#FF6B6B] hover:text-[#FFA0A0] flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded hover:bg-rose-950/20 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs text-[#8A95A6] hover:text-[#E2E8F0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#E5B842] hover:bg-[#F3C757] text-[#121417] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Apply Rates
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
