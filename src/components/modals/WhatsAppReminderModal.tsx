import React, { useState } from 'react';
import { Customer, AppSettings } from '../../types';
import { MessageSquare, X, Copy, Check, Send, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface WhatsAppReminderModalProps {
  customer: Customer;
  settings: AppSettings;
  onClose: () => void;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  customer,
  settings,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const formattedDue = formatCurrency(customer.dueAmount, settings.currency);

  const defaultMessage = `Namaste ${customer.name} ji,\n\nGreetings from ${settings.storeName}! ✨\n\nThis is a gentle reminder regarding your outstanding jewellery balance of ${formattedDue}.\n\nYou may clear your dues securely via UPI or visit our flagship showroom at your convenience.\n\nThank you for choosing ${settings.storeName}.\nWarm regards,\nVyshnavi Jewellery Management`;

  const [message, setMessage] = useState(defaultMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    // Clean phone number
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div
      id="whatsapp-reminder-modal-overlay"
      className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div className="bg-[#14171D] border border-[#2B3342] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#232832] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F2922] border border-[#285E3F] flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#E2E8F0]">
                WhatsApp Due Reminder
              </h3>
              <p className="text-xs text-[#8A95A6]">
                Recipient: <span className="text-[#E5B842] font-semibold">{customer.name}</span> ({customer.phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7E8B9C] hover:text-[#E2E8F0] hover:bg-[#202631]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Due Amount Highlight Card */}
          <div className="bg-[#181C23] border border-[#29323E] rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">
                OUTSTANDING DUE
              </span>
              <div className="font-serif-luxury text-2xl font-bold text-[#FF7E70] mt-0.5">
                {formattedDue}
              </div>
            </div>
            <span className="px-3 py-1 bg-[#281F1A] border border-[#69311E] rounded-full text-xs font-semibold text-[#FF8A65]">
              {customer.tier} Client
            </span>
          </div>

          {/* Editable Message Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#A0AEC0] uppercase tracking-wider text-[11px]">
                Message Preview
              </label>
              <button
                onClick={handleCopy}
                className="text-[#E5B842] hover:text-[#F3C757] flex items-center gap-1 font-semibold text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#101318] border border-[#262D38] rounded-xl p-3.5 text-xs text-[#E2E8F0] font-sans focus:outline-none focus:border-[#E5B842] transition-colors leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-[#101317] border-t border-[#232832] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-[#2F3745] text-xs font-semibold text-[#8A95A6] hover:text-[#E2E8F0] hover:bg-[#1C212A] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0E1B13] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
