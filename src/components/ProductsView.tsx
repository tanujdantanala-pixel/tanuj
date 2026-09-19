import React, { useState } from 'react';
import { Product, ProductCategory, AppSettings } from '../types';
import {
  Plus,
  Search,
  Filter,
  Gem,
  Sparkles,
  Tag,
  Scale,
  Edit3,
  Trash2,
  Package,
  Layers,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  settings: AppSettings;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateStockCount?: (id: string, newCount: number) => void;
  onLoadSampleProducts?: () => void;
  isMobileLayout?: boolean;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  settings,
  searchQuery,
  onSearchChange,
  onAddNewProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateStockCount,
  onLoadSampleProducts,
  isMobileLayout,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [selectedPurity, setSelectedPurity] = useState<string>('all');

  const categories: { id: ProductCategory; label: string }[] = [
    { id: 'all', label: 'ALL JEWELS' },
    { id: 'necklaces', label: 'NECKLACES' },
    { id: 'bangles', label: 'BANGLES' },
    { id: 'rings', label: 'RINGS' },
    { id: 'earrings', label: 'EARRINGS' },
    { id: 'chains', label: 'CHAINS' },
    { id: 'pendants', label: 'PENDANTS' },
    { id: 'coins', label: 'BULLION / COINS' },
    { id: 'diamonds', label: 'DIAMONDS' },
    { id: 'silverware', label: 'SILVER' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.huid && p.huid.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.purity && p.purity.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesPurity = selectedPurity === 'all' || p.purity === selectedPurity;

    return matchesSearch && matchesCategory && matchesPurity;
  });

  const totalStockItems = products.reduce((acc, p) => acc + (p.stockCount || 0), 0);
  const totalValuation = products.reduce((acc, p) => {
    if (p.priceType === 'fixed') {
      return acc + (p.fixedPrice || 0) * (p.stockCount || 1);
    }
    const rate = p.ratePerGram || settings.goldRate22k;
    const mc = p.makingChargesPerGram || 0;
    const itemCost = (p.netWeightGrams || p.grossWeightGrams || 0) * (rate + mc);
    return acc + itemCost * (p.stockCount || 1);
  }, 0);

  return (
    <div id="products-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#E5B842] uppercase tracking-widest bg-[#E5B842]/10 border border-[#E5B842]/20 px-2.5 py-0.5 rounded-full">
              CUSTOM CATALOG & INVENTORY
            </span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#E2E8F0] mt-1">
            Jewellery Products
          </h2>
          <p className="text-xs text-[#8A95A6] mt-0.5">
            Manage your bespoke pieces, custom photos, metal purity, weights & BIS hallmarks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAddNewProduct}
            className="bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Custom Product</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#14171E] border border-[#232832] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Catalog Designs</span>
            <Gem className="w-4 h-4 text-[#E5B842]" />
          </div>
          <div className="text-xl font-bold text-[#E2E8F0]">{products.length}</div>
          <p className="text-[10px] text-[#718096] mt-0.5">Unique jewelry codes</p>
        </div>

        <div className="bg-[#14171E] border border-[#232832] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Stock In Vault</span>
            <Package className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="text-xl font-bold text-[#34D399]">{totalStockItems} pcs</div>
          <p className="text-[10px] text-[#718096] mt-0.5">Ready for billing</p>
        </div>

        <div className="bg-[#14171E] border border-[#232832] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Estimated Valuation</span>
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-xl font-bold text-[#E5B842]">
            {settings.currency} {totalValuation.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-[#718096] mt-0.5">At current bullion rates</p>
        </div>

        <div className="bg-[#14171E] border border-[#232832] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">22K Gold Benchmark</span>
            <Layers className="w-4 h-4 text-[#E5B842]" />
          </div>
          <div className="text-xl font-bold text-[#E2E8F0]">
            {settings.currency} {settings.goldRate22k} /g
          </div>
          <p className="text-[10px] text-[#718096] mt-0.5">Store benchmark</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, SKU code, HUID, or purity (e.g. 22K, SV-HRM, Haram)..."
              className="w-full bg-[#14171E] border border-[#242A34] text-xs text-[#E2E8F0] pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E5B842] transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedPurity}
              onChange={(e) => setSelectedPurity(e.target.value)}
              className="bg-[#14171E] border border-[#242A34] text-xs text-[#E2E8F0] px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#E5B842]"
            >
              <option value="all">All Purities</option>
              <option value="24K Solid Gold">24K Solid Gold</option>
              <option value="22K Gold">22K Gold</option>
              <option value="18K Gold">18K Gold</option>
              <option value="Platinum 950">Platinum 950</option>
              <option value="92.5 Sterling Silver">92.5 Silver</option>
              <option value="VVS Diamond">Diamond</option>
            </select>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#E5B842] text-[#111418] shadow-md'
                  : 'bg-[#14171E] text-[#8A95A6] hover:text-[#E2E8F0] border border-[#232832]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#14171E] border border-[#232832] rounded-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#1E232E] border border-[#2F3746] flex items-center justify-center mx-auto text-[#E5B842]">
            <Gem className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif-luxury text-lg font-bold text-[#E2E8F0]">
              {products.length === 0 ? 'No Products In Catalog' : 'No Matching Products Found'}
            </h3>
            <p className="text-xs text-[#8A95A6] max-w-md mx-auto mt-1">
              {products.length === 0
                ? 'Your catalog is clean and ready. Add your first custom jewellery piece with your own photos, purity specifications, and weight.'
                : 'Try adjusting your search query or category filters.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onAddNewProduct}
              className="bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-lg uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Custom Piece</span>
            </button>

            {products.length === 0 && onLoadSampleProducts && (
              <button
                onClick={onLoadSampleProducts}
                className="bg-[#1E232E] hover:bg-[#28303E] text-[#E5B842] border border-[#E5B842]/30 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Sample Jewelry Items</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const calculatedUnitPrice =
              product.priceType === 'fixed'
                ? product.fixedPrice || 0
                : (product.netWeightGrams || product.grossWeightGrams || 0) *
                    (product.ratePerGram || settings.goldRate22k) +
                  (product.makingChargesPerGram || 0) *
                    (product.netWeightGrams || product.grossWeightGrams || 0);

            return (
              <div
                key={product.id}
                className="bg-[#14171E] border border-[#232832] hover:border-[#384252] rounded-2xl overflow-hidden transition-all flex flex-col group shadow-lg"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-4/3 bg-[#0B0D10] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1013] via-transparent to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {product.tag && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#E5B842] text-[#111418] shadow-md uppercase tracking-wider">
                        {product.tag}
                      </span>
                    )}
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[#E2E8F0] border border-white/10 uppercase">
                      {product.purity}
                    </span>
                  </div>

                  {/* Top Right Actions */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="w-7 h-7 rounded-lg bg-black/70 hover:bg-[#E5B842] hover:text-[#111418] text-[#E2E8F0] flex items-center justify-center transition-colors shadow-md cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="w-7 h-7 rounded-lg bg-black/70 hover:bg-rose-600 text-[#E2E8F0] flex items-center justify-center transition-colors shadow-md cursor-pointer"
                      title="Delete Product (Undo available for 30s)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-[#A0AEC0] font-mono">{product.code}</span>
                    {product.huid && (
                      <span className="text-[10px] text-[#E5B842] font-semibold bg-black/60 px-1.5 py-0.2 rounded border border-[#E5B842]/30">
                        BIS: {product.huid}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif-luxury text-sm font-bold text-[#E2E8F0] leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-[11px] text-[#7E8B9C] line-clamp-1 mt-0.5">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Weight Specs Grid */}
                  <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#0E1013] border border-[#212630] rounded-xl text-center text-[10px]">
                    <div>
                      <div className="text-[#718096]">Gross Wt</div>
                      <div className="font-bold text-[#E2E8F0]">
                        {product.grossWeightGrams || product.weightGrams || 0}g
                      </div>
                    </div>
                    <div>
                      <div className="text-[#718096]">Net Gold</div>
                      <div className="font-bold text-[#E5B842]">
                        {product.netWeightGrams || product.grossWeightGrams || product.weightGrams || 0}g
                      </div>
                    </div>
                    <div>
                      <div className="text-[#718096]">Stones</div>
                      <div className="font-bold text-[#E2E8F0]">
                        {product.stoneWeightGrams || 0}g
                      </div>
                    </div>
                  </div>

                  {/* Price and Stock Row */}
                  <div className="pt-2 border-t border-[#20252E] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#718096] uppercase font-bold">Est. Price</div>
                      <div className="text-sm font-bold text-[#E5B842]">
                        {settings.currency} {calculatedUnitPrice.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Stock Counter Controls */}
                    <div className="flex items-center gap-1.5 bg-[#0E1013] border border-[#242A34] px-2 py-1 rounded-lg">
                      <span className="text-[10px] text-[#8A95A6]">Stock:</span>
                      <button
                        onClick={() =>
                          onUpdateStockCount &&
                          onUpdateStockCount(product.id, Math.max(0, (product.stockCount || 0) - 1))
                        }
                        className="w-4 h-4 rounded bg-[#1F2530] text-[#E2E8F0] hover:bg-[#2F3746] flex items-center justify-center text-xs font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-[#E2E8F0] min-w-4 text-center">
                        {product.stockCount || 0}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateStockCount &&
                          onUpdateStockCount(product.id, (product.stockCount || 0) + 1)
                        }
                        className="w-4 h-4 rounded bg-[#1F2530] text-[#E2E8F0] hover:bg-[#2F3746] flex items-center justify-center text-xs font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
