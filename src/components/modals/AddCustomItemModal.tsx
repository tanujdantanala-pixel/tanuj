import React, { useState } from 'react';
import { Product, ProductCategory } from '../../types';
import { X, Sparkles, Gem } from 'lucide-react';

interface AddCustomItemModalProps {
  onAddProduct?: (product: Product) => void;
  onAdd?: (product: Product) => void;
  onSave?: (product: Product) => void;
  onClose: () => void;
}

export const AddCustomItemModal: React.FC<AddCustomItemModalProps> = ({
  onAddProduct,
  onAdd,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('necklaces');
  const [purity, setPurity] = useState('22K Gold');
  const [weightGrams, setWeightGrams] = useState('24.5');
  const [ratePerGram, setRatePerGram] = useState('6250');
  const [fixedPrice, setFixedPrice] = useState('');
  const [tag, setTag] = useState('Bespoke Custom');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const w = parseFloat(weightGrams) || 10;
    const newProd: Product = {
      id: `custom-prod-${Date.now()}`,
      name: name.trim(),
      code: `CUS-${Math.floor(100 + Math.random() * 900)}`,
      category,
      purity,
      handcrafted: true,
      priceType: fixedPrice ? 'fixed' : 'per_gram',
      fixedPrice: fixedPrice ? parseFloat(fixedPrice) : undefined,
      ratePerGram: parseFloat(ratePerGram) || 6250,
      grossWeightGrams: w,
      netWeightGrams: w,
      weightGrams: w,
      image: imageUrl,
      tag,
      inStock: true,
      stockCount: 1,
    };

    const addHandler = onAddProduct || onAdd || onSave;
    if (addHandler) {
      addHandler(newProd);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#14171D] border border-[#2B3342] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-[#232832] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F2530] border border-[#2F3947] flex items-center justify-center text-[#E5B842]">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#E2E8F0]">
                Add Custom Jewellery Item
              </h3>
              <p className="text-xs text-[#8A95A6]">Enter bespoke design details & weight</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7E8B9C] hover:text-[#E2E8F0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
              ITEM DESIGN NAME *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Navratna Royal Choker"
              className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              >
                <option value="necklaces">Necklace / Choker</option>
                <option value="bangles">Bangles / Kadas</option>
                <option value="rings">Rings</option>
                <option value="earrings">Earrings</option>
                <option value="coins">Coins / Bullion</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                PURITY
              </label>
              <select
                value={purity}
                onChange={(e) => setPurity(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              >
                <option value="24K Solid Gold">24K Solid Gold</option>
                <option value="22K Gold">22K Gold</option>
                <option value="18K Gold">18K Gold</option>
                <option value="Platinum 950">Platinum 950</option>
                <option value="92.5 Sterling Silver">92.5 Sterling Silver</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                WEIGHT IN GRAMS
              </label>
              <input
                type="number"
                step="0.01"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                RATE / GRAM (₹)
              </label>
              <input
                type="number"
                value={ratePerGram}
                onChange={(e) => setRatePerGram(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
              OR FIXED PRICE (₹) (OPTIONAL)
            </label>
            <input
              type="number"
              value={fixedPrice}
              onChange={(e) => setFixedPrice(e.target.value)}
              placeholder="Leave empty to calculate from rate × weight"
              className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#232832]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#8A95A6] hover:text-[#E2E8F0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#E5B842] hover:bg-[#F3C757] text-[#121417] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Add To Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
