import {
  AppSettings,
  Customer,
  StaffMember,
  Product,
  Transaction,
  StockMetal,
  ScreenType,
  ViewMode,
  AttendanceRecord,
  SalaryPayment,
} from '../types';
import {
  initialSettings,
  initialCustomers,
  initialStaff,
  initialProducts,
  initialTransactions,
  initialStockMetals,
  initialAttendance,
  initialSalaryPayments,
} from '../data/mockData';

const KEYS = {
  SETTINGS: 'sri_vyshnavi_settings_v3',
  CUSTOMERS: 'sri_vyshnavi_customers_v3',
  STAFF: 'sri_vyshnavi_staff_v3',
  PRODUCTS: 'sri_vyshnavi_products_v3',
  TRANSACTIONS: 'sri_vyshnavi_transactions_v3',
  STOCK: 'sri_vyshnavi_stock_v3',
  ATTENDANCE: 'sri_vyshnavi_attendance_v3',
  SALARY_PAYMENTS: 'sri_vyshnavi_salary_payments_v3',
  SCREEN: 'sri_vyshnavi_screen_v3',
  VIEWMODE: 'sri_vyshnavi_viewmode_v3',
  OWNER_UNLOCKED: 'sri_vyshnavi_owner_unlocked_v3',
};

export function loadSavedState<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Failed to load key ${key} from storage:`, err);
    return fallback;
  }
}

export function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save key ${key} to storage:`, err);
  }
}

export function clearAllAppData(): void {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error('Failed to clear storage:', e);
  }
}

export const StorageKeys = KEYS;
