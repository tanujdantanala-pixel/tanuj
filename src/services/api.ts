import {
  StaffMember,
  AttendanceRecord,
  Product,
  Customer,
  Transaction,
  SalaryPayment,
  StockMetal,
  AppSettings,
} from '../types';

const API_BASE = '/api';

export interface BootstrapResponse {
  staff: StaffMember[];
  attendance: AttendanceRecord[];
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  salaryPayments: SalaryPayment[];
  stock: StockMetal[];
  settings: AppSettings;
}

export const api = {
  // Health check
  async checkHealth(): Promise<{ status: string; counts?: any }> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch (err) {
      console.warn('Backend health check error:', err);
      return { status: 'offline' };
    }
  },

  // Bootstrap initial load
  async getBootstrapData(): Promise<BootstrapResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/bootstrap`);
      if (!res.ok) throw new Error('Failed to fetch bootstrap data');
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('API getBootstrapData error:', err);
      return null;
    }
  },

  // Sync entire dataset to backend
  async syncAll(data: Partial<BootstrapResponse>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/sync-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch (err) {
      console.warn('API syncAll error:', err);
      return false;
    }
  },

  // ------------------------------------
  // Staff
  // ------------------------------------
  async getStaff(): Promise<StaffMember[]> {
    try {
      const res = await fetch(`${API_BASE}/staff`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async saveStaff(staff: StaffMember): Promise<StaffMember | null> {
    try {
      const res = await fetch(`${API_BASE}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff),
      });
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('saveStaff error:', err);
      return null;
    }
  },

  async deleteStaff(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/staff/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ------------------------------------
  // Attendance
  // ------------------------------------
  async getAttendance(query?: { date?: string; month?: string; staffId?: string }): Promise<AttendanceRecord[]> {
    try {
      const params = new URLSearchParams();
      if (query?.date) params.append('date', query.date);
      if (query?.month) params.append('month', query.month);
      if (query?.staffId) params.append('staffId', query.staffId);

      const url = `${API_BASE}/attendance${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async punchAttendance(record: AttendanceRecord): Promise<AttendanceRecord | null> {
    try {
      const res = await fetch(`${API_BASE}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('punchAttendance error:', err);
      return null;
    }
  },

  async punchAttendanceBulk(records: AttendanceRecord[]): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/attendance/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });
      return res.ok;
    } catch (err) {
      console.warn('punchAttendanceBulk error:', err);
      return false;
    }
  },

  async deleteAttendance(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/attendance/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ------------------------------------
  // Products
  // ------------------------------------
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async saveProduct(prod: Product): Promise<Product | null> {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prod),
      });
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('saveProduct error:', err);
      return null;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ------------------------------------
  // Customers
  // ------------------------------------
  async getCustomers(): Promise<Customer[]> {
    try {
      const res = await fetch(`${API_BASE}/customers`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async saveCustomer(customer: Customer): Promise<Customer | null> {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('saveCustomer error:', err);
      return null;
    }
  },

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ------------------------------------
  // Transactions / Bills
  // ------------------------------------
  async getTransactions(): Promise<Transaction[]> {
    try {
      const res = await fetch(`${API_BASE}/transactions`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async createTransaction(tx: Transaction): Promise<Transaction | null> {
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      });
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('createTransaction error:', err);
      return null;
    }
  },

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ------------------------------------
  // Salary Payments
  // ------------------------------------
  async getSalaryPayments(): Promise<SalaryPayment[]> {
    try {
      const res = await fetch(`${API_BASE}/salary-payments`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async recordSalaryPayment(payment: SalaryPayment): Promise<SalaryPayment | null> {
    try {
      const res = await fetch(`${API_BASE}/salary-payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('recordSalaryPayment error:', err);
      return null;
    }
  },

  async deleteSalaryPayment(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/salary-payments/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ------------------------------------
  // Stock Metals
  // ------------------------------------
  async saveStock(stock: StockMetal[]): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stock),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ------------------------------------
  // Settings
  // ------------------------------------
  async saveSettings(settings: AppSettings): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ------------------------------------
  // Reset all
  // ------------------------------------
  async resetAll(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  },
};
