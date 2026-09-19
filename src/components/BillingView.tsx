import React, { useState } from 'react';
import {
  Product,
  Customer,
  InvoiceItem,
  AppSettings,
  ProductCategory,
  Transaction,
} from '../types';
import {
  Plus,
  Minus,
  Trash2,
  Search,
  Receipt,
  Printer,
  Save,
  Send,
  UserPlus,
  QrCode,
  Tag,
  Sparkles,
  ChevronRight,
  Edit3,
  X,
  Layers,
} from 'lucide-react';
import { formatCurrency, generateInvoiceNumber } from '../utils/formatters';

interface BillingViewProps {
  products: Product[];
  customers: Customer[];
  settings: AppSettings;
  onGenerateBill: (transaction: Transaction, items: InvoiceItem[]) => void;
  onAddCustomItemModal: () => void;
  isMobileLayout?: boolean;
}

export const BillingView: React.FC<BillingViewProps> = ({
  products,
  customers,
  settings,
  onGenerateBill,
  onAddCustomItemModal,
  isMobileLayout = false,
}) => {
  // Invoice items cart state (starts clean with no demo data)
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  // Client Details
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);

  // Search and category filters
  const [catalogSearch, setCatalogSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');

  // Pricing customizations
  const [makingChargePct, setMakingChargePct] = useState(settings.makingChargePct || 8);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [gstPct] = useState(settings.gstPct || 3);
  const [invoiceNum] = useState(generateInvoiceNumber());

  // Category list
  const categories: { id: ProductCategory; label: string }[] = [
    { id: 'all', label: 'ALL' },
    { id: 'necklaces', label: 'NECKLACES' },
    { id: 'rings', label: 'RINGS' },
    { id: 'bangles', label: 'BANGLES' },
    { id: 'earrings', label: 'EARRINGS' },
    { id: 'coins', label: 'COINS/POOJA' },
  ];

  // Filter products
  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.code.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const subtotal = invoiceItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const makingCharges = (subtotal * makingChargePct) / 100;
  const taxableAmount = Math.max(0, subtotal + makingCharges - discountAmount);
  const taxGST = (taxableAmount * gstPct) / 100;
  const grandTotal = Math.max(0, taxableAmount + taxGST);

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    const existingIndex = invoiceItems.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const updated = [...invoiceItems];
      const item = updated[existingIndex];
      item.quantity += 1;
      item.totalPrice = item.unitPrice * item.quantity;
      setInvoiceItems(updated);
    } else {
      let unitPrice = 0;
      const itemWeight = product.netWeightGrams || product.grossWeightGrams || product.weightGrams || 10;
      if (product.priceType === 'fixed' && product.fixedPrice) {
        unitPrice = product.fixedPrice;
      } else if (product.ratePerGram) {
        unitPrice = itemWeight * product.ratePerGram;
      } else {
        unitPrice = itemWeight * (settings.goldRate22k || 6150);
      }

      const makingCharges = (unitPrice * (product.makingChargesPerGram ? 0 : makingChargePct)) / 100 + (product.makingChargesPerGram ? product.makingChargesPerGram * itemWeight : 0);

      const newItem: InvoiceItem = {
        id: `item-${Date.now()}`,
        product,
        quantity: 1,
        weightGrams: itemWeight,
        ratePerGram: product.ratePerGram || settings.goldRate22k,
        makingCharges,
        unitPrice,
        totalPrice: unitPrice + makingCharges,
      };
      setInvoiceItems([...invoiceItems, newItem]);
    }
  };

  // Update item quantity
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setInvoiceItems(
      invoiceItems
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as InvoiceItem[]
    );
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setInvoiceItems(invoiceItems.filter((i) => i.id !== itemId));
  };

  // Inline alert/feedback toast
  const [feedbackNotice, setFeedbackNotice] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null);

  const showNotice = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setFeedbackNotice({ message, type });
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 3000);
  };

  // Handle bill generation
  const handleGenerateInvoice = () => {
    if (invoiceItems.length === 0) {
      showNotice('Please add at least one item to generate an invoice.', 'error');
      return;
    }

    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber: invoiceNum,
      customerName: customerName || 'Valued Client',
      customerPhone: customerPhone,
      itemName:
        invoiceItems.length === 1
          ? invoiceItems[0].product.name
          : `${invoiceItems[0].product.name} + ${invoiceItems.length - 1} items`,
      items: invoiceItems,
      amount: grandTotal,
      status: 'COMPLETED',
      date: 'Today, 14 Oct 2023',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'UPI / Card / Cash',
    };

    onGenerateBill(tx, invoiceItems);
  };

  // Select customer from list
  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setShowCustomerPicker(false);
  };

  // Mobile Layout matching Image 13
  if (isMobileLayout) {
    return (
      <div id="billing-mobile-view" className="p-4 space-y-5 pb-28 animate-in fade-in duration-200">
        {/* Select Customer Card */}
        <div
          onClick={() => setShowCustomerPicker(true)}
          className="bg-[#16191F] border border-[#242A33] rounded-2xl p-4 flex items-center justify-between shadow-md cursor-pointer hover:border-[#E5B842]/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F2530] border border-[#2A3340] flex items-center justify-center text-[#E5B842]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#E2E8F0]">
                {customerName ? customerName : 'Select Customer'}
              </h3>
              <p className="text-xs text-[#8A95A6]">
                {customerPhone ? customerPhone : 'Tap to add customer details'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#7E8B9C]" />
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={catalogSearch}
            onChange={(e) => setCatalogSearch(e.target.value)}
            placeholder="Search by item code or name..."
            className="w-full bg-[#16191F] border border-[#242A33] text-sm text-[#E2E8F0] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#E5B842] transition-colors placeholder-[#6A7788]"
          />
          <Search className="w-4 h-4 text-[#7A8799] absolute left-3.5 top-3.5 pointer-events-none" />
        </div>

        {/* Invoice Cart Items List */}
        <div className="space-y-3">
          {invoiceItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#16191F] border border-[#242A33] rounded-2xl p-4 flex items-center justify-between shadow-md relative"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-xl object-cover ring-1 ring-[#28303C] shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-serif-luxury font-bold text-sm text-[#E2E8F0] line-clamp-1">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-[#8A95A6] mt-0.5">
                    Code: {item.product.code} • {item.weightGrams}g
                  </p>

                  {/* Quantity +/- Buttons */}
                  <div className="flex items-center gap-2 mt-2 bg-[#12151A] border border-[#262D38] rounded-lg px-2 py-0.5 w-fit">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="text-[#8A95A6] hover:text-[#E2E8F0] text-xs font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-[#E2E8F0] px-1">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="text-[#8A95A6] hover:text-[#E2E8F0] text-xs font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price & Delete */}
              <div className="text-right flex flex-col justify-between items-end h-full">
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-[#68768A] hover:text-[#FF6B6B] transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="font-serif-luxury text-base font-bold text-[#E5B842] mt-4">
                  {formatCurrency(item.totalPrice, settings.currency)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Item Dashed Button */}
        <button
          onClick={onAddCustomItemModal}
          className="w-full border-2 border-dashed border-[#2D3542] hover:border-[#E5B842]/60 bg-[#14171D]/40 text-[#A0AEC0] hover:text-[#E5B842] rounded-2xl py-3.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ADD CUSTOM ITEM</span>
        </button>

        {/* Bill Summary Card */}
        <div className="bg-[#16191F] border border-[#242A33] rounded-2xl p-5 shadow-lg space-y-3.5">
          <h3 className="font-serif-luxury text-xl font-bold text-[#E2E8F0] border-b border-[#242A33] pb-3">
            Bill Summary
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#8A95A6]">
              <span>Subtotal ({invoiceItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
              <span className="text-[#E2E8F0] font-medium">
                {formatCurrency(subtotal, settings.currency)}
              </span>
            </div>

            <div className="flex justify-between text-[#8A95A6]">
              <span>Making Charges (est. {makingChargePct}%)</span>
              <span className="text-[#E2E8F0] font-medium">
                {formatCurrency(makingCharges, settings.currency)}
              </span>
            </div>

            <div className="flex justify-between text-[#8A95A6] items-center">
              <span>Discount</span>
              {discountAmount > 0 ? (
                <span className="text-rose-400 font-medium">
                  -{formatCurrency(discountAmount, settings.currency)}
                </span>
              ) : (
                <button
                  onClick={() => setDiscountAmount(500)}
                  className="text-[#E5B842] hover:underline font-medium"
                >
                  Add Coupon
                </button>
              )}
            </div>

            <div className="flex justify-between text-[#8A95A6]">
              <span>Tax (GST {gstPct}%)</span>
              <span className="text-[#E2E8F0] font-medium">
                {formatCurrency(taxGST, settings.currency)}
              </span>
            </div>
          </div>

          <div className="border-t border-[#242A33] pt-3 flex items-baseline justify-between">
            <span className="text-sm font-bold text-[#E2E8F0]">Grand Total</span>
            <span className="font-serif-luxury text-2xl font-bold text-[#E5B842]">
              {formatCurrency(grandTotal, settings.currency)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleGenerateInvoice}
              className="w-full bg-[#E5B842] hover:bg-[#F3C757] text-[#121417] font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4 stroke-[2.5]" />
              <span>GENERATE BILL & SEND</span>
            </button>

            <button
              onClick={() => showNotice('Draft invoice saved successfully in local drafts.', 'success')}
              className="w-full bg-transparent border border-[#303846] hover:bg-[#1C212A] text-[#A0AEC0] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>SAVE DRAFT</span>
            </button>
          </div>

          {feedbackNotice && (
            <div
              className={`p-3 rounded-xl text-xs font-bold text-center border animate-in fade-in duration-200 ${
                feedbackNotice.type === 'error'
                  ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {feedbackNotice.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout matching Image 7
  return (
    <div id="billing-desktop-view" className="p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header Information */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#20252E] pb-5">
        <div>
          <h1 className="font-serif-luxury text-3xl font-bold text-[#E2E8F0]">
            Luxury Billing Suite
          </h1>
          <p className="text-sm text-[#8492A6] mt-1">
            Create new invoice & catalog selection
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-bold text-[#E5B842] tracking-wider uppercase">
            INVOICE {invoiceNum}
          </div>
          <div className="text-xs text-[#8492A6] mt-0.5">Today, 14 Oct 2023</div>
        </div>
      </div>

      {/* Main 2-Column Suite: Catalog (Left 7 cols) & Invoice Panel (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Catalog Selection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Search and Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search catalog by name or code..."
                className="w-full bg-[#14171D] border border-[#232832] text-sm text-[#E2E8F0] rounded-md pl-9 pr-4 py-2 focus:outline-none focus:border-[#E5B842] transition-colors placeholder-[#64748B]"
              />
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5 pointer-events-none" />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#E5B842] text-[#121417]'
                      : 'bg-transparent text-[#8492A6] border border-[#232832] hover:text-[#E2E8F0]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid (2 columns in desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className="bg-[#14171D] border border-[#232832] rounded-xl overflow-hidden shadow-md flex flex-col justify-between hover:border-[#323947] transition-all group"
              >
                {/* Product Image */}
                <div className="relative h-48 w-full bg-[#0D0F13] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {product.tag && (
                    <span className="absolute top-3 right-3 bg-[#111418]/90 border border-[#2B3340] text-[#E5B842] text-[10px] font-bold px-2.5 py-1 rounded tracking-wider uppercase shadow-md">
                      {product.tag}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif-luxury text-lg font-bold text-[#E2E8F0]">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#8492A6] mt-0.5">
                      {product.purity} • {product.handcrafted ? 'Handcrafted' : 'Precision Cast'}
                    </p>
                  </div>

                  {/* Pricing and + Add Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1C212B]">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-[#718096] uppercase block">
                        {product.priceType === 'fixed' ? 'FIXED PRICE' : 'RATE / GRAM'}
                      </span>
                      <div className="font-serif-luxury text-xl font-bold text-[#E5B842] mt-0.5">
                        {product.priceType === 'fixed' && product.fixedPrice
                          ? formatCurrency(product.fixedPrice, settings.currency)
                          : formatCurrency(product.ratePerGram || 85.5, settings.currency)}
                      </div>
                    </div>

                    <button
                      id={`add-to-cart-btn-${product.id}`}
                      onClick={() => handleAddToCart(product)}
                      className="w-10 h-10 rounded-md border border-[#D4AF37] hover:bg-[#E5B842] hover:text-[#121417] text-[#E5B842] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
                      title="Add to Invoice"
                    >
                      <Plus className="w-5 h-5 stroke-[2.2]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Invoice Panel */}
        <div className="lg:col-span-5 bg-[#14171D] border border-[#232832] rounded-xl p-6 shadow-xl space-y-6 sticky top-24">
          {/* Client Details Form */}
          <div className="space-y-3 border-b border-[#232832] pb-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-[#E5B842] uppercase flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                <span>CLIENT DETAILS</span>
              </span>
              <button
                onClick={() => setShowCustomerPicker(true)}
                className="text-[11px] text-[#8492A6] hover:text-[#E5B842] underline cursor-pointer"
              >
                Choose Existing
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-[#718096] uppercase block mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded px-3 py-1.5 focus:outline-none focus:border-[#E5B842]"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#718096] uppercase block mb-1">
                  CONTACT NUMBER (WHATSAPP)
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded px-3 py-1.5 focus:outline-none focus:border-[#E5B842]"
                />
              </div>
            </div>
          </div>

          {/* Cart Items Table */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 text-[10px] font-bold text-[#718096] uppercase tracking-wider pb-2 border-b border-[#1F242E]">
              <div className="col-span-6">ITEM & DETAILS</div>
              <div className="col-span-2 text-center">WT(G)</div>
              <div className="col-span-2 text-center">RATE</div>
              <div className="col-span-2 text-right">TOTAL</div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {invoiceItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center text-xs text-[#E2E8F0] py-2 border-b border-[#1C212A] gap-1"
                >
                  <div className="col-span-6">
                    <div className="font-serif-luxury font-bold text-sm">{item.product.name}</div>
                    <div className="text-[11px] text-[#718096]">
                      {item.product.purity} • {item.product.priceType === 'fixed' ? 'Fixed' : 'Custom'}
                    </div>
                  </div>

                  <div className="col-span-2 text-center">
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        handleUpdateQuantity(item.id, val - item.quantity);
                      }}
                      className="w-10 text-center bg-[#181C23] border border-[#272E3A] rounded py-0.5 text-xs text-[#E5B842] font-bold"
                    />
                  </div>

                  <div className="col-span-2 text-center text-[#8492A6] font-mono text-[11px]">
                    {item.ratePerGram ? formatCurrency(item.ratePerGram, settings.currency) : '--'}
                  </div>

                  <div className="col-span-2 text-right font-serif-luxury font-bold text-[#E5B842]">
                    {formatCurrency(item.totalPrice, settings.currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="space-y-2.5 pt-2 border-t border-[#232832] text-xs">
            <div className="flex justify-between text-[#8492A6]">
              <span className="uppercase font-semibold tracking-wider">SUBTOTAL</span>
              <span className="text-[#E2E8F0] font-mono font-medium">
                {formatCurrency(subtotal, settings.currency)}
              </span>
            </div>

            <div className="flex justify-between text-[#8492A6]">
              <span className="uppercase font-semibold tracking-wider">
                MAKING CHARGES ({makingChargePct}%)
              </span>
              <span className="text-[#E2E8F0] font-mono font-medium">
                {formatCurrency(makingCharges, settings.currency)}
              </span>
            </div>

            <div className="flex justify-between text-[#8492A6] items-center">
              <span className="uppercase font-semibold tracking-wider flex items-center gap-1">
                <span>DISCOUNT</span>
                <button
                  onClick={() => setIsEditingDiscount(!isEditingDiscount)}
                  className="text-[#64748B] hover:text-[#E5B842]"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </span>
              {isEditingDiscount ? (
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-[#181C23] border border-[#E5B842] rounded px-2 py-0.5 text-right text-xs text-rose-400 font-mono"
                />
              ) : (
                <span className="text-rose-400 font-mono font-medium">
                  -{formatCurrency(discountAmount, settings.currency)}
                </span>
              )}
            </div>

            <div className="flex justify-between text-[#8492A6]">
              <span className="uppercase font-semibold tracking-wider">
                TAX (GST {gstPct}%)
              </span>
              <span className="text-[#E2E8F0] font-mono font-medium">
                {formatCurrency(taxGST, settings.currency)}
              </span>
            </div>

            {/* Grand Total */}
            <div className="border-t-2 border-[#2A313E] pt-3 flex items-baseline justify-between">
              <span className="text-sm font-bold tracking-wider text-[#E2E8F0] uppercase">
                Grand Total
              </span>
              <span className="font-serif-luxury text-3xl font-bold text-[#E5B842]">
                {formatCurrency(grandTotal, settings.currency)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              id="billing-generate-send-btn"
              onClick={handleGenerateInvoice}
              className="w-full bg-[#E5B842] hover:bg-[#F3C757] text-[#121417] font-bold py-3.5 px-4 rounded-md uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer text-xs"
            >
              <Receipt className="w-4 h-4 stroke-[2.5]" />
              <span>GENERATE BILL & SEND</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                id="billing-save-draft-btn"
                onClick={() => showNotice('Invoice draft saved successfully in local storage!', 'success')}
                className="bg-transparent hover:bg-[#181C23] border border-[#2B3342] text-[#A0AEC0] font-bold py-2.5 px-3 rounded-md uppercase tracking-wider flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE DRAFT</span>
              </button>

              <button
                id="billing-print-btn"
                onClick={handleGenerateInvoice}
                className="bg-transparent hover:bg-[#181C23] border border-[#2B3342] text-[#A0AEC0] font-bold py-2.5 px-3 rounded-md uppercase tracking-wider flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PRINT</span>
              </button>
            </div>

            {feedbackNotice && (
              <div
                className={`p-3 rounded-lg text-xs font-bold text-center border animate-in fade-in duration-200 ${
                  feedbackNotice.type === 'error'
                    ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                    : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                }`}
              >
                {feedbackNotice.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Picker Modal */}
      {showCustomerPicker && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-[#14171D] border border-[#2B3342] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232832] pb-3">
              <h3 className="font-serif-luxury text-lg font-bold text-[#E5B842]">
                Select Existing Customer
              </h3>
              <button
                onClick={() => setShowCustomerPicker(false)}
                className="text-[#8492A6] hover:text-[#E2E8F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {customers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCustomer(c)}
                  className="p-3 bg-[#181C23] hover:bg-[#202631] border border-[#242A34] rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-semibold text-sm text-[#E2E8F0]">{c.name}</div>
                    <div className="text-xs text-[#8492A6]">{c.phone}</div>
                  </div>
                  <span className="text-[10px] bg-[#E5B842]/20 text-[#E5B842] font-bold px-2 py-0.5 rounded">
                    {c.tier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
