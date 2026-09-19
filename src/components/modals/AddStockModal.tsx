import React, { useState } from 'react';
import { StockMetal } from '../../types';
import { X, Package, Plus } from 'lucide-react';

interface AddStockModalProps {
  stockMetals: StockMetal[];
  onUpdateStock?: (updated: StockMetal[]) => void;
  onSave?: (updated: StockMetal[]) => void;
  onSaveStock?: (updated: StockMetal[]) => void;
  onClose: () => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({
  stockMetals,
  onUpdateStock,
  onSave,
  onSaveStock,
  onClose,
}) => {
  const [stocks, setStocks] = useState<StockMetal[]>(stockMetals);

  const handlePercentageChange = (id: string, newPct: number) => {
    setStocks(
      stocks.map((s) => (s.id === id ? { ...s, percentage: Math.min(100, Math.max(0, newPct)) } : s))
    );
  };

  const handleAvailableTextChange = (id: string, text: string) => {
    setStocks(stocks.map((s) => (s.id === id ? { ...s, availableText: text } : s)));
  };

  const handleSave = () => {
    const saveHandler = onUpdateStock || onSave || onSaveStock;
    if (saveHandler) {
      saveHandler(stocks);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#14171D] border border-[#2B3342] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-[#232832] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F2530] border border-[#2F3947] flex items-center justify-center text-[#E5B842]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#E2E8F0]">
                Update Stock Status
              </h3>
              <p className="text-xs text-[#8A95A6]">Modify vault bullion & diamond reserves</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7E8B9C] hover:text-[#E2E8F0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {stocks.map((item) => (
            <div key={item.id} className="p-3 bg-[#181C23] border border-[#242A34] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#E2E8F0] tracking-wider uppercase">{item.metal}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.percentage}
                    onChange={(e) => handlePercentageChange(item.id, parseInt(e.target.value) || 0)}
                    className="w-14 bg-[#101318] border border-[#2F3745] text-[#E5B842] font-bold rounded px-1.5 py-0.5 text-center text-xs"
                  />
                  <span className="text-[#8A95A6] font-bold">%</span>
                </div>
              </div>

              <input
                type="text"
                value={item.availableText}
                onChange={(e) => handleAvailableTextChange(item.id, e.target.value)}
                placeholder="e.g. 2.5 kg available"
                className="w-full bg-[#101318] border border-[#282F3B] text-xs text-[#E2E8F0] rounded px-2.5 py-1.5"
              />
            </div>
          ))}
        </div>

        <div className="p-5 bg-[#101317] border-t border-[#232832] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-[#8A95A6] hover:text-[#E2E8F0]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-[#E5B842] hover:bg-[#F3C757] text-[#121417] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Save Stock
          </button>
        </div>
      </div>
    </div>
  );
};
