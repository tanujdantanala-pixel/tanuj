export type ScreenType = 'dashboard' | 'products' | 'attendance' | 'staff' | 'customers' | 'billing';
export type ViewMode = 'auto' | 'desktop' | 'mobile';

export type CustomerTier = 'VIP' | 'ELITE' | 'REGULAR' | 'NEW';

export interface Customer {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email?: string;
  totalPurchase: number;
  dueAmount: number;
  tier: CustomerTier;
  avatarUrl?: string;
  lastVisit?: string;
  notes?: string;
  createdAt?: string;
}

export type StaffStatus = 'Present' | 'Absent' | 'On Leave' | 'Break';
export type PayrollStatus = 'Cleared' | 'Pending' | 'Partially Paid' | 'Paid';
export type AttendanceStatus = 'Present' | 'Absent' | 'Half-day' | 'Leave' | 'Holiday';

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName?: string;
  date: string; // 'YYYY-MM-DD'
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  inTime?: string;
  outTime?: string;
  overtimeHours?: number;
  notes?: string;
}

export interface BankDetails {
  accountNumber?: string;
  ifsc?: string;
  upiId?: string;
  bankName?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  rating: number;
  status: StaffStatus;
  schedule?: string;
  returnDate?: string;
  payrollStatus: PayrollStatus;
  avatarUrl?: string;
  phone: string;
  email?: string;
  salesThisMonth?: number;
  joinDate?: string;
  
  // Salary and Payroll structure
  salaryType: 'monthly' | 'daily';
  baseSalary: number; // Monthly base or Daily wage
  dailyAllowance?: number;
  overtimeRatePerHour?: number;
  bonus?: number;
  deductions?: number;
  advanceTaken?: number;
  bankDetails?: BankDetails;
}

export interface SalaryPayment {
  id: string;
  staffId: string;
  staffName: string;
  month: string; // 'YYYY-MM' (e.g. '2026-08')
  paymentDate: string; // 'YYYY-MM-DD'
  baseSalary: number;
  daysPresent: number;
  daysHalf: number;
  daysAbsent: number;
  overtimeHours: number;
  overtimePay: number;
  allowance: number;
  bonus: number;
  deductions: number;
  advanceDeducted: number;
  netPayable: number;
  netPaid: number;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  referenceNo?: string;
  notes?: string;
  status: 'PAID' | 'PARTIAL';
}

export type ProductCategory = 'all' | 'necklaces' | 'rings' | 'bangles' | 'earrings' | 'coins' | 'chains' | 'pendants' | 'silverware' | 'diamonds';
export type PriceType = 'per_gram' | 'fixed';

export interface Product {
  id: string;
  name: string;
  code: string;
  category: ProductCategory;
  purity: string; // '24K Solid Gold', '22K Gold', '18K Gold', '14K Gold', 'Platinum 950', '92.5 Sterling Silver', 'VVS Diamond'
  grossWeightGrams: number;
  netWeightGrams: number;
  weightGrams?: number;
  stoneWeightGrams?: number;
  wastagePct?: number;
  makingChargesPerGram?: number;
  fixedMakingCharge?: number;
  priceType: PriceType;
  ratePerGram?: number;
  fixedPrice?: number;
  huid?: string; // BIS Hallmark UID
  image: string;
  tag?: string; // 'BESTSELLER', 'EXCLUSIVE', 'NEW ARRIVAL', 'BRIDAL', 'MENS'
  inStock: boolean;
  stockCount: number;
  description?: string;
  createdAt?: string;
  handcrafted?: boolean;
}

export interface InvoiceItem {
  id: string;
  product: Product;
  quantity: number;
  weightGrams: number;
  ratePerGram?: number;
  makingCharges: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  itemName: string;
  items?: InvoiceItem[];
  subtotal?: number;
  makingCharges?: number;
  gstAmount?: number;
  discount?: number;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  date: string;
  time?: string;
  paymentMethod?: string;
}

export interface StockMetal {
  id: string;
  metal: string;
  percentage: number;
  availableText: string;
  colorClass: string;
}

export interface AppSettings {
  storeName: string;
  storeSubtitle: string;
  address?: string;
  gstin?: string;
  phone?: string;
  email?: string;
  currency: '₹' | '$';
  currencyMultiplier: number;
  goldRate22k: number;
  goldRate24k: number;
  silverRate: number;
  makingChargePct: number;
  gstPct: number;
  ownerPin?: string;
}

export interface UndoItem {
  id: string;
  type: 'employee' | 'staff' | 'product' | 'customer' | 'transaction' | 'attendance' | 'salary';
  item?: any;
  data?: any;
  title: string;
  description?: string;
  timestamp: number;
  expiresAt?: number;
}
