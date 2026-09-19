import React, { useEffect } from 'react';
import { Transaction, InvoiceItem, AppSettings } from '../../types';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  Sparkles,
  Download,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import confetti from 'canvas-confetti';

interface InvoiceModalProps {
  transaction: Transaction;
  items: InvoiceItem[];
  settings: AppSettings;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  transaction,
  items,
  settings,
  onClose,
}) => {
  // Fire celebratory gold confetti on bill generation
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F3C757', '#FFFFFF', '#AA822A'],
      });
    } catch {
      // ignore
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `🧾 *TAX INVOICE ${transaction.invoiceNumber}*\nStore: ${settings.storeName}\nClient: ${transaction.customerName}\nTotal Amount: ${formatCurrency(transaction.amount, settings.currency)}\nStatus: ${transaction.status}\n\nThank you for choosing ${settings.storeName}! ✨`;
    const cleanPhone = (transaction.customerPhone || '').replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      id="invoice-modal-overlay"
      className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[#111418] border border-[#2B3342] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        {/* Top Modal Controls */}
        <div className="bg-[#16191F] px-6 py-4 border-b border-[#242A33] flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Invoice Generated Successfully</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-[#1F2530] text-[#A0AEC0] hover:text-[#E2E8F0] hover:bg-[#28303C] transition-colors"
              title="Print Invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="p-2 rounded-lg bg-[#1F2922] text-emerald-400 hover:bg-[#283E31] transition-colors"
              title="Share to WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#1F2530] text-[#A0AEC0] hover:text-[#E2E8F0] hover:bg-[#28303C] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-8 bg-[#0D1013] text-[#E2E8F0] space-y-6">
          {/* Store Brand Header */}
          <div className="text-center border-b border-[#242B36] pb-6 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E5B842]" />
              <h2 className="font-serif-luxury text-2xl font-bold text-[#E5B842] tracking-wider uppercase">
                {settings.storeName}
              </h2>
            </div>
            <p className="text-xs text-[#8A95A6] tracking-widest uppercase font-medium">
              Fine Diamond & Sovereign Gold Jewellers • Est. 1988
            </p>
            <p className="text-[11px] text-[#6E7B8D]">
              GSTIN: 36AAACG1234F1Z8 • BIS Hallmark Certified
            </p>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 gap-6 text-xs border-b border-[#242B36] pb-6">
            <div>
              <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                BILLED TO
              </span>
              <div className="font-serif-luxury font-bold text-sm text-[#E2E8F0]">
                {transaction.customerName}
              </div>
              <div className="text-[#8A95A6] mt-0.5">{transaction.customerPhone}</div>
              <div className="text-[#8A95A6]">Valued Clientele</div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                INVOICE DETAILS
              </span>
              <div className="font-mono font-bold text-[#E5B842] text-sm">
                {transaction.invoiceNumber}
              </div>
              <div className="text-[#8A95A6] mt-0.5">{transaction.date}</div>
              <div className="text-emerald-400 font-semibold mt-0.5">{transaction.status}</div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#242B36] text-[#718096] uppercase tracking-wider text-[10px]">
                  <th className="pb-2 font-bold">ITEM & DESCRIPTION</th>
                  <th className="pb-2 text-center font-bold">QTY</th>
                  <th className="pb-2 text-right font-bold">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B212A]">
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id} className="py-2.5">
                      <td className="py-2.5">
                        <div className="font-semibold text-[#E2E8F0]">{item.product.name}</div>
                        <div className="text-[11px] text-[#718096]">
                          {item.product.purity} • {item.weightGrams}g
                        </div>
                      </td>
                      <td className="py-2.5 text-center text-[#8A95A6] font-mono">{item.quantity}</td>
                      <td className="py-2.5 text-right font-serif-luxury font-bold text-[#E5B842]">
                        {formatCurrency(item.totalPrice, settings.currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="py-2.5">
                    <td className="py-2.5 font-semibold text-[#E2E8F0]">{transaction.itemName}</td>
                    <td className="py-2.5 text-center text-[#8A95A6] font-mono">1</td>
                    <td className="py-2.5 text-right font-serif-luxury font-bold text-[#E5B842]">
                      {formatCurrency(transaction.amount, settings.currency)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Grand Total & Hallmark Seal */}
          <div className="border-t border-[#242B36] pt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#181C23] border border-[#2E3645] flex items-center justify-center text-[#E5B842]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-[10px] text-[#8A95A6]">
                <p className="font-bold text-[#E2E8F0]">100% Certified Hallmark Gold</p>
                <p>Authenticity guaranteed by Sri Vyshnavi</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">
                GRAND TOTAL
              </span>
              <div className="font-serif-luxury text-3xl font-bold text-[#E5B842]">
                {formatCurrency(transaction.amount, settings.currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-6 bg-[#16191F] border-t border-[#242A33] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#8A95A6]">
            Payment Received via: <span className="text-[#E2E8F0] font-semibold">{transaction.paymentMethod}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0F1D15] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Invoice</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-[#E5B842] hover:bg-[#F3C757] text-[#121417] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
