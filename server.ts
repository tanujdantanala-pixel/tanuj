import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const rootDir = process.cwd();
const DB_FILE = path.join(rootDir, 'data', 'database.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(rootDir, 'data'))) {
  fs.mkdirSync(path.join(rootDir, 'data'), { recursive: true });
}

interface DatabaseSchema {
  staff: any[];
  attendance: any[];
  products: any[];
  customers: any[];
  transactions: any[];
  salaryPayments: any[];
  stock: any[];
  settings: any;
}

const defaultSettings = {
  storeName: 'Sri Vyshnavi Jewellery',
  storeSubtitle: 'Gold & Diamond Palace',
  address: 'Main Bazaar Road, Somajiguda, Hyderabad, Telangana 500082',
  gstin: '36AAACP9876Q1Z3',
  phone: '+91 98480 12345',
  email: 'contact@srivyshnavijewellers.com',
  currency: '₹',
  currencyMultiplier: 1,
  goldRate22k: 6150,
  goldRate24k: 6710,
  silverRate: 88,
  makingChargePct: 12.5,
  gstPct: 3.0,
};

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        staff: Array.isArray(parsed.staff) ? parsed.staff : [],
        attendance: Array.isArray(parsed.attendance) ? parsed.attendance : [],
        products: Array.isArray(parsed.products) ? parsed.products : [],
        customers: Array.isArray(parsed.customers) ? parsed.customers : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        salaryPayments: Array.isArray(parsed.salaryPayments) ? parsed.salaryPayments : [],
        stock: Array.isArray(parsed.stock) ? parsed.stock : [],
        settings: parsed.settings || defaultSettings,
      };
    }
  } catch (err) {
    console.error('Error reading database file, initializing clean database:', err);
  }

  const cleanDb: DatabaseSchema = {
    staff: [],
    attendance: [],
    products: [],
    customers: [],
    transactions: [],
    salaryPayments: [],
    stock: [],
    settings: defaultSettings,
  };
  saveDatabase(cleanDb);
  return cleanDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to database file:', err);
  }
}

let db = loadDatabase();

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ==========================================
  // API ENDPOINTS
  // ==========================================

  // 1. Health check & status
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Sri Vyshnavi Jewellery Backend Server',
      timestamp: new Date().toISOString(),
      counts: {
        staff: db.staff.length,
        attendance: db.attendance.length,
        products: db.products.length,
        customers: db.customers.length,
        transactions: db.transactions.length,
        salaryPayments: db.salaryPayments.length,
      },
    });
  });

  // 2. Full Bootstrap data (for initial application load)
  app.get('/api/bootstrap', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: db,
    });
  });

  // ------------------------------------------
  // STAFF ENDPOINTS
  // ------------------------------------------
  app.get('/api/staff', (req: Request, res: Response) => {
    res.json({ success: true, data: db.staff });
  });

  app.post('/api/staff', (req: Request, res: Response) => {
    const newStaff = req.body;
    if (!newStaff || !newStaff.name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const id = newStaff.id || `staff-${Date.now()}`;
    const staffItem = { ...newStaff, id };

    const idx = db.staff.findIndex((s) => s.id === id);
    if (idx >= 0) {
      db.staff[idx] = staffItem;
    } else {
      db.staff.unshift(staffItem);
    }
    saveDatabase(db);
    res.json({ success: true, data: staffItem });
  });

  app.delete('/api/staff/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLen = db.staff.length;
    db.staff = db.staff.filter((s) => s.id !== id);
    saveDatabase(db);
    res.json({ success: true, deleted: initialLen !== db.staff.length });
  });

  // ------------------------------------------
  // ATTENDANCE ENDPOINTS (Daily Register & Monthly)
  // ------------------------------------------
  app.get('/api/attendance', (req: Request, res: Response) => {
    const { date, month, staffId } = req.query;
    let records = db.attendance;

    if (date && typeof date === 'string') {
      records = records.filter((r) => r.date === date);
    }
    if (month && typeof month === 'string') {
      records = records.filter((r) => r.date.startsWith(month));
    }
    if (staffId && typeof staffId === 'string') {
      records = records.filter((r) => r.staffId === staffId);
    }

    res.json({ success: true, data: records });
  });

  // Punch single attendance record
  app.post('/api/attendance', (req: Request, res: Response) => {
    const record = req.body;
    if (!record || !record.staffId || !record.date || !record.status) {
      return res.status(400).json({ success: false, error: 'Invalid attendance record' });
    }

    const id = record.id || `${record.staffId}_${record.date}`;
    const recordItem = { ...record, id };

    const idx = db.attendance.findIndex((r) => r.staffId === record.staffId && r.date === record.date);
    if (idx >= 0) {
      db.attendance[idx] = recordItem;
    } else {
      db.attendance.unshift(recordItem);
    }
    saveDatabase(db);
    res.json({ success: true, data: recordItem, all: db.attendance });
  });

  // Bulk punch / update attendance records
  app.post('/api/attendance/bulk', (req: Request, res: Response) => {
    const { records } = req.body;
    if (!Array.isArray(records)) {
      return res.status(400).json({ success: false, error: 'Records must be an array' });
    }

    records.forEach((record) => {
      const id = record.id || `${record.staffId}_${record.date}`;
      const recordItem = { ...record, id };
      const idx = db.attendance.findIndex((r) => r.staffId === record.staffId && r.date === record.date);
      if (idx >= 0) {
        db.attendance[idx] = recordItem;
      } else {
        db.attendance.unshift(recordItem);
      }
    });

    saveDatabase(db);
    res.json({ success: true, count: records.length, data: db.attendance });
  });

  app.delete('/api/attendance/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.attendance = db.attendance.filter((r) => r.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // ------------------------------------------
  // PRODUCTS / JEWELLERY INVENTORY ENDPOINTS
  // ------------------------------------------
  app.get('/api/products', (req: Request, res: Response) => {
    res.json({ success: true, data: db.products });
  });

  app.post('/api/products', (req: Request, res: Response) => {
    const prod = req.body;
    if (!prod || !prod.name) {
      return res.status(400).json({ success: false, error: 'Product name is required' });
    }

    const id = prod.id || `prod-${Date.now()}`;
    const productItem = { ...prod, id };

    const idx = db.products.findIndex((p) => p.id === id);
    if (idx >= 0) {
      db.products[idx] = productItem;
    } else {
      db.products.unshift(productItem);
    }
    saveDatabase(db);
    res.json({ success: true, data: productItem });
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.products = db.products.filter((p) => p.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // ------------------------------------------
  // CUSTOMERS ENDPOINTS
  // ------------------------------------------
  app.get('/api/customers', (req: Request, res: Response) => {
    res.json({ success: true, data: db.customers });
  });

  app.post('/api/customers', (req: Request, res: Response) => {
    const cust = req.body;
    if (!cust || !cust.name) {
      return res.status(400).json({ success: false, error: 'Customer name is required' });
    }

    const id = cust.id || `cust-${Date.now()}`;
    const customerItem = { ...cust, id };

    const idx = db.customers.findIndex((c) => c.id === id);
    if (idx >= 0) {
      db.customers[idx] = customerItem;
    } else {
      db.customers.unshift(customerItem);
    }
    saveDatabase(db);
    res.json({ success: true, data: customerItem });
  });

  app.delete('/api/customers/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.customers = db.customers.filter((c) => c.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // ------------------------------------------
  // BILLING / TRANSACTIONS ENDPOINTS
  // ------------------------------------------
  app.get('/api/transactions', (req: Request, res: Response) => {
    res.json({ success: true, data: db.transactions });
  });

  app.post('/api/transactions', (req: Request, res: Response) => {
    const tx = req.body;
    if (!tx || !tx.customerName) {
      return res.status(400).json({ success: false, error: 'Transaction customer is required' });
    }

    const id = tx.id || `tx-${Date.now()}`;
    const invoiceNumber = tx.invoiceNumber || `SVJ-${Math.floor(100000 + Math.random() * 900000)}`;
    const txItem = { ...tx, id, invoiceNumber };

    db.transactions.unshift(txItem);
    saveDatabase(db);
    res.json({ success: true, data: txItem });
  });

  app.delete('/api/transactions/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.transactions = db.transactions.filter((t) => t.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // ------------------------------------------
  // SALARY & PAYROLL VOUCHERS ENDPOINTS
  // ------------------------------------------
  app.get('/api/salary-payments', (req: Request, res: Response) => {
    res.json({ success: true, data: db.salaryPayments });
  });

  app.post('/api/salary-payments', (req: Request, res: Response) => {
    const payment = req.body;
    if (!payment || !payment.staffId) {
      return res.status(400).json({ success: false, error: 'Staff ID is required' });
    }

    const id = payment.id || `sal-pay-${Date.now()}`;
    const paymentItem = { ...payment, id };

    db.salaryPayments.unshift(paymentItem);

    // Automatically update staff member's payrollStatus
    const staffIdx = db.staff.findIndex((s) => s.id === payment.staffId);
    if (staffIdx >= 0) {
      db.staff[staffIdx].payrollStatus = 'Cleared';
    }

    saveDatabase(db);
    res.json({ success: true, data: paymentItem });
  });

  app.delete('/api/salary-payments/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.salaryPayments = db.salaryPayments.filter((p) => p.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // ------------------------------------------
  // STOCK / METALS ENDPOINTS
  // ------------------------------------------
  app.get('/api/stock', (req: Request, res: Response) => {
    res.json({ success: true, data: db.stock });
  });

  app.post('/api/stock', (req: Request, res: Response) => {
    const stock = req.body;
    db.stock = Array.isArray(stock) ? stock : [];
    saveDatabase(db);
    res.json({ success: true, data: db.stock });
  });

  // ------------------------------------------
  // SETTINGS ENDPOINTS
  // ------------------------------------------
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json({ success: true, data: db.settings });
  });

  app.post('/api/settings', (req: Request, res: Response) => {
    const newSettings = req.body;
    db.settings = { ...db.settings, ...newSettings };
    saveDatabase(db);
    res.json({ success: true, data: db.settings });
  });

  // ------------------------------------------
  // SYSTEM / RESET / SEED ENDPOINTS
  // ------------------------------------------
  app.post('/api/reset', (req: Request, res: Response) => {
    db = {
      staff: [],
      attendance: [],
      products: [],
      customers: [],
      transactions: [],
      salaryPayments: [],
      stock: [],
      settings: defaultSettings,
    };
    saveDatabase(db);
    res.json({ success: true, message: 'All backend data reset to clean slate', data: db });
  });

  app.post('/api/sync-all', (req: Request, res: Response) => {
    const clientData = req.body;
    if (clientData) {
      if (Array.isArray(clientData.staff)) db.staff = clientData.staff;
      if (Array.isArray(clientData.attendance)) db.attendance = clientData.attendance;
      if (Array.isArray(clientData.products)) db.products = clientData.products;
      if (Array.isArray(clientData.customers)) db.customers = clientData.customers;
      if (Array.isArray(clientData.transactions)) db.transactions = clientData.transactions;
      if (Array.isArray(clientData.salaryPayments)) db.salaryPayments = clientData.salaryPayments;
      if (Array.isArray(clientData.stock)) db.stock = clientData.stock;
      if (clientData.settings) db.settings = clientData.settings;
      saveDatabase(db);
    }
    res.json({ success: true, data: db });
  });

  // ==========================================
  // VITE MIDDLEWARE / STATIC ASSETS
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Sri Vyshnavi Jewellery Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
