import React, { useState, useRef } from 'react';
import { Product, ProductCategory, PriceType } from '../../types';
import {
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Camera,
  Gem,
  Plus,
  Scale,
  DollarSign,
  Tag,
  CheckCircle2,
} from 'lucide-react';

interface AddProductModalProps {
  productToEdit?: Product | null;
  settings?: any;
  onSave?: (product: Product) => void;
  onSaveProduct?: (product: Product) => void;
  onAdd?: (product: Product) => void;
  onClose: () => void;
}

const PRESET_JEWELRY_IMAGES = [
  { label: 'Temple Necklace', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Polki Choker', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80' },
  { label: 'Gold Bangles', url: 'https://images.unsplash.com/photo-1611591475155-4286fa2c2e74?auto=format&fit=crop&w=800&q=80' },
  { label: 'Diamond Ring', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Royal Earrings', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80' },
  { label: 'Gold Coins', url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80' },
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  productToEdit,
  settings,
  onSave,
  onSaveProduct,
  onAdd,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(productToEdit?.name || '');
  const [code, setCode] = useState(
    productToEdit?.code || `SV-${Math.floor(100 + Math.random() * 900)}`
  );
  const [category, setCategory] = useState<ProductCategory>(
    productToEdit?.category || 'necklaces'
  );
  const [purity, setPurity] = useState(productToEdit?.purity || '22K Gold');
  const [grossWeightGrams, setGrossWeightGrams] = useState(
    productToEdit?.grossWeightGrams?.toString() || '18.5'
  );
  const [netWeightGrams, setNetWeightGrams] = useState(
    productToEdit?.netWeightGrams?.toString() || '18.0'
  );
  const [stoneWeightGrams, setStoneWeightGrams] = useState(
    productToEdit?.stoneWeightGrams?.toString() || '0.5'
  );
  const [priceType, setPriceType] = useState<PriceType>(
    productToEdit?.priceType || 'per_gram'
  );
  const [ratePerGram, setRatePerGram] = useState(
    productToEdit?.ratePerGram?.toString() || '6150'
  );
  const [fixedPrice, setFixedPrice] = useState(
    productToEdit?.fixedPrice?.toString() || ''
  );
  const [makingChargesPerGram, setMakingChargesPerGram] = useState(
    productToEdit?.makingChargesPerGram?.toString() || '450'
  );
  const [huid, setHuid] = useState(productToEdit?.huid || '');
  const [tag, setTag] = useState(productToEdit?.tag || 'EXCLUSIVE');
  const [stockCount, setStockCount] = useState(
    productToEdit?.stockCount?.toString() || '1'
  );
  const [description, setDescription] = useState(
    productToEdit?.description || ''
  );

  // Image Upload State
  const [imagePreview, setImagePreview] = useState<string>(
    productToEdit?.image || PRESET_JEWELRY_IMAGES[0].url
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url' | 'presets'>('upload');

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const gross = parseFloat(grossWeightGrams) || 0;
    const net = parseFloat(netWeightGrams) || gross;
    const stone = parseFloat(stoneWeightGrams) || 0;

    const newProd: Product = {
      id: productToEdit?.id || `prod-${Date.now()}`,
      name: name.trim(),
      code: code.trim() || `SV-${Math.floor(100 + Math.random() * 900)}`,
      category,
      purity,
      grossWeightGrams: gross,
      netWeightGrams: net,
      stoneWeightGrams: stone,
      priceType,
      ratePerGram: priceType === 'per_gram' ? parseFloat(ratePerGram) || 6150 : undefined,
      fixedPrice: priceType === 'fixed' ? parseFloat(fixedPrice) || 0 : undefined,
      makingChargesPerGram: parseFloat(makingChargesPerGram) || 0,
      huid: huid.trim() || undefined,
      image: imagePreview || PRESET_JEWELRY_IMAGES[0].url,
      tag: tag || undefined,
      inStock: parseInt(stockCount) > 0,
      stockCount: Math.max(0, parseInt(stockCount) || 1),
      description: description.trim() || undefined,
      createdAt: productToEdit?.createdAt || new Date().toISOString().split('T')[0],
    };

    const saveHandler = onSave || onSaveProduct || onAdd;
    if (saveHandler) {
      saveHandler(newProd);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#14171E] border border-[#2B3342] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#232832] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F2530] border border-[#2F3947] flex items-center justify-center text-[#E5B842]">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#E2E8F0]">
                {productToEdit ? 'Edit Jewellery Product' : 'Add New Jewellery Product'}
              </h3>
              <p className="text-xs text-[#8A95A6]">
                Upload custom product photo, purity, hallmarks, and pricing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7E8B9C] hover:text-[#E2E8F0] hover:bg-[#1E232D]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* IMAGE UPLOAD SECTION */}
          <div>
            <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block mb-2">
              PRODUCT PHOTO *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              {/* Image Preview Box */}
              <div className="sm:col-span-4 aspect-square bg-[#0E1013] border-2 border-[#2B3342] rounded-xl overflow-hidden relative flex items-center justify-center group shadow-inner">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#E5B842] text-[#111418] rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Change Photo
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-3 text-[#718096]">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px]">No image selected</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="sm:col-span-8 space-y-2.5">
                <div className="flex items-center gap-1 p-1 bg-[#101318] border border-[#222834] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`flex-1 py-1 px-2 rounded text-[11px] font-semibold transition-all ${
                      imageMode === 'upload'
                        ? 'bg-[#E5B842] text-[#111418]'
                        : 'text-[#8A95A6] hover:text-[#E2E8F0]'
                    }`}
                  >
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('presets')}
                    className={`flex-1 py-1 px-2 rounded text-[11px] font-semibold transition-all ${
                      imageMode === 'presets'
                        ? 'bg-[#E5B842] text-[#111418]'
                        : 'text-[#8A95A6] hover:text-[#E2E8F0]'
                    }`}
                  >
                    Sample Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`flex-1 py-1 px-2 rounded text-[11px] font-semibold transition-all ${
                      imageMode === 'url'
                        ? 'bg-[#E5B842] text-[#111418]'
                        : 'text-[#8A95A6] hover:text-[#E2E8F0]'
                    }`}
                  >
                    Image URL
                  </button>
                </div>

                {imageMode === 'upload' && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-[#E5B842] bg-[#E5B842]/10'
                        : 'border-[#2D3748] hover:border-[#4A5568] bg-[#0E1013]/60'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <Upload className="w-5 h-5 mx-auto text-[#E5B842] mb-1.5" />
                    <p className="text-xs font-semibold text-[#E2E8F0]">
                      Click to choose photo or drag & drop
                    </p>
                    <p className="text-[10px] text-[#718096] mt-0.5">
                      JPG, PNG, WebP up to 10MB
                    </p>
                  </div>
                )}

                {imageMode === 'presets' && (
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_JEWELRY_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImagePreview(preset.url)}
                        className={`p-1 bg-[#101318] border rounded-lg flex flex-col items-center gap-1 text-[10px] cursor-pointer transition-all ${
                          imagePreview === preset.url
                            ? 'border-[#E5B842] text-[#E5B842]'
                            : 'border-[#252C38] text-[#8A95A6] hover:border-[#3E495B]'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-10 object-cover rounded"
                          referrerPolicy="no-referrer"
                        />
                        <span className="truncate w-full text-center">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {imageMode === 'url' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="https://example.com/jewellery-photo.jpg"
                      className="flex-1 bg-[#101318] border border-[#272E3A] text-xs text-[#E2E8F0] rounded-lg px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customImageUrl.trim()) {
                          setImagePreview(customImageUrl.trim());
                        }
                      }}
                      className="bg-[#242C38] hover:bg-[#323D4D] text-[#E2E8F0] px-3 py-2 rounded-lg font-bold text-xs cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BASIC INFORMATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block mb-1">
                PRODUCT TITLE / DESIGN NAME *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Mayura Antique Haram"
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block mb-1">
                ITEM / SKU CODE
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SV-HRM-101"
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block mb-1">
                CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-xs text-[#E2E8F0] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#E5B842]"
              >
                <option value="necklaces">Necklace / Haram / Choker</option>
                <option value="bangles">Bangles & Kadas</option>
                <option value="rings">Rings & Bands</option>
                <option value="earrings">Earrings & Jhumkas</option>
                <option value="chains">Chains & Mangalsutra</option>
                <option value="pendants">Pendants</option>
                <option value="coins">Coins & Bullion</option>
                <option value="silverware">Silverware & Pooja</option>
                <option value="diamonds">Diamond Collection</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block mb-1">
                PURITY
              </label>
              <select
                value={purity}
                onChange={(e) => setPurity(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-xs text-[#E2E8F0] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#E5B842]"
              >
                <option value="24K Solid Gold">24K Solid Gold (999)</option>
                <option value="22K Gold">22K Hallmark Gold (916)</option>
                <option value="18K Gold">18K Gold (750)</option>
                <option value="14K Gold">14K Gold (585)</option>
                <option value="Platinum 950">Platinum 950</option>
                <option value="92.5 Sterling Silver">92.5 Sterling Silver</option>
                <option value="VVS Diamond">VVS Certified Diamond</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block mb-1">
                COLLECTION TAG / BADGE
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-xs text-[#E2E8F0] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#E5B842]"
              >
                <option value="EXCLUSIVE">EXCLUSIVE</option>
                <option value="BESTSELLER">BESTSELLER</option>
                <option value="BRIDAL">BRIDAL</option>
                <option value="NEW ARRIVAL">NEW ARRIVAL</option>
                <option value="MENS">MENS</option>
                <option value="ANTIQUE">ANTIQUE</option>
              </select>
            </div>
          </div>

          {/* WEIGHT & HALLMARK BREAKDOWN */}
          <div className="p-3.5 bg-[#101318] border border-[#242A34] rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E5B842]">
              <Scale className="w-3.5 h-3.5" />
              <span>Weight & BIS Hallmark Details</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  Gross Wt (g) *
                </label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={grossWeightGrams}
                  onChange={(e) => {
                    setGrossWeightGrams(e.target.value);
                    if (!stoneWeightGrams || parseFloat(stoneWeightGrams) === 0) {
                      setNetWeightGrams(e.target.value);
                    }
                  }}
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-[#E2E8F0] font-bold rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  Stone Wt (g)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={stoneWeightGrams}
                  onChange={(e) => {
                    setStoneWeightGrams(e.target.value);
                    const gross = parseFloat(grossWeightGrams) || 0;
                    const stone = parseFloat(e.target.value) || 0;
                    setNetWeightGrams((gross - stone > 0 ? gross - stone : gross).toFixed(3));
                  }}
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-[#E2E8F0] rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  Net Gold Wt (g) *
                </label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={netWeightGrams}
                  onChange={(e) => setNetWeightGrams(e.target.value)}
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-[#E5B842] font-bold rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  BIS HUID Code
                </label>
                <input
                  type="text"
                  value={huid}
                  onChange={(e) => setHuid(e.target.value)}
                  placeholder="e.g. HUID9821"
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-[#E2E8F0] rounded px-2.5 py-1.5 uppercase"
                />
              </div>
            </div>
          </div>

          {/* PRICING AND STOCK */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block mb-1">
                PRICE CALCULATION
              </label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value as PriceType)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-xs text-[#E2E8F0] rounded-lg px-3 py-2.5"
              >
                <option value="per_gram">By Weight (Rate/g + Making)</option>
                <option value="fixed">Fixed Price MRP</option>
              </select>
            </div>

            {priceType === 'per_gram' ? (
              <>
                <div>
                  <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block mb-1">
                    RATE / GRAM (₹)
                  </label>
                  <input
                    type="number"
                    value={ratePerGram}
                    onChange={(e) => setRatePerGram(e.target.value)}
                    className="w-full bg-[#181C23] border border-[#272E3A] text-xs text-[#E5B842] font-bold rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block mb-1">
                    MAKING CHARGE / G (₹)
                  </label>
                  <input
                    type="number"
                    value={makingChargesPerGram}
                    onChange={(e) => setMakingChargesPerGram(e.target.value)}
                    className="w-full bg-[#181C23] border border-[#272E3A] text-xs text-[#E2E8F0] rounded-lg px-3 py-2"
                  />
                </div>
              </>
            ) : (
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block mb-1">
                  FIXED PIECE PRICE (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={fixedPrice}
                  onChange={(e) => setFixedPrice(e.target.value)}
                  placeholder="e.g. 145000"
                  className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E5B842] font-bold rounded-lg px-3 py-2"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block mb-1">
                AVAILABLE STOCK QUANTITY
              </label>
              <input
                type="number"
                min="0"
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-xs text-[#E2E8F0] font-bold rounded-lg px-3 py-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block mb-1">
                ITEM DESCRIPTION / DETAILS (OPTIONAL)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Antique nakshi handcrafted motif with certified stones."
                className="w-full bg-[#181C23] border border-[#272E3A] text-xs text-[#E2E8F0] rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#232832]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#8A95A6] hover:text-[#E2E8F0] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#E5B842] hover:bg-[#F3C757] text-[#121417] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{productToEdit ? 'Update Product' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
