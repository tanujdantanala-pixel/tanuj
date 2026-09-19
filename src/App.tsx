import React, { useState, useEffect, useCallback } from 'react';
import {
  ScreenType,
  ViewMode,
  Customer,
  StaffMember,
  Product,
  Transaction,
  StockMetal,
  AppSettings,
  InvoiceItem,
  StaffStatus,
  PayrollStatus,
  AttendanceRecord,
  SalaryPayment,
  UndoItem,
} from './types';
import {
  initialSettings,
  initialCustomers,
  initialStaff,
  initialProducts,
  initialTransactions,
  initialStockMetals,
  sampleStaffPack,
  sampleProductPack,
} from './data/mockData';
import {
  loadSavedState,
  saveState,
  StorageKeys,
  clearAllAppData,
} from './utils/storage';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { AttendanceView } from './components/AttendanceView';
import { StaffView } from './components/StaffView';
import { CustomersView } from './components/CustomersView';
import { BillingView } from './components/BillingView';
import { UndoToast } from './components/UndoToast';

// Modals
import { WhatsAppReminderModal } from './components/modals/WhatsAppReminderModal';
import { InvoiceModal } from './components/modals/InvoiceModal';
import { AddCustomerModal } from './components/modals/AddCustomerModal';
import { AddEmployeeModal } from './components/modals/AddEmployeeModal';
import { AddProductModal } from './components/modals/AddProductModal';
import { AddStockModal } from './components/modals/AddStockModal';
import { AddCustomItemModal } from './components/modals/AddCustomItemModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { OwnerLockModal } from './components/modals/OwnerLockModal';
import { playLockSound, playUnlockSound } from './utils/audio';

export function App() {
  // Navigation & View Mode
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() =>
    loadSavedState<ScreenType>(StorageKeys.SCREEN, 'dashboard')
  );
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    loadSavedState<ViewMode>(StorageKeys.VIEWMODE, 'auto')
  );
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Backend Sync Status
  const [isServerSynced, setIsServerSynced] = useState(false);

  // Core App Data State with LocalStorage Persistence
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadSavedState<AppSettings>(StorageKeys.SETTINGS, initialSettings)
  );
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadSavedState<Customer[]>(StorageKeys.CUSTOMERS, initialCustomers)
  );
  const [staffList, setStaffList] = useState<StaffMember[]>(() =>
    loadSavedState<StaffMember[]>(StorageKeys.STAFF, initialStaff)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadSavedState<Product[]>(StorageKeys.PRODUCTS, initialProducts)
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadSavedState<Transaction[]>(StorageKeys.TRANSACTIONS, initialTransactions)
  );
  const [stockMetals, setStockMetals] = useState<StockMetal[]>(() =>
    loadSavedState<StockMetal[]>(StorageKeys.STOCK, initialStockMetals)
  );
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() =>
    loadSavedState<AttendanceRecord[]>(StorageKeys.ATTENDANCE, [])
  );
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>(() =>
    loadSavedState<SalaryPayment[]>(StorageKeys.SALARY_PAYMENTS, [])
  );

  // 30-Second Undo Queue
  const [undoStack, setUndoStack] = useState<UndoItem[]>([]);

  // Owner Lock & Role Security State (PIN protected: Default 1234)
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState<boolean>(() =>
    loadSavedState<boolean>(StorageKeys.OWNER_UNLOCKED, false)
  );
  const [showOwnerLockModal, setShowOwnerLockModal] = useState(false);
  const [pendingOwnerActionTitle, setPendingOwnerActionTitle] = useState<string | undefined>(undefined);
  const [pendingOwnerCallback, setPendingOwnerCallback] = useState<(() => void) | null>(null);
  const [roleToast, setRoleToast] = useState<{ message: string; isOwner: boolean } | null>(null);

  // Persist Owner Unlock State
  useEffect(() => {
    saveState(StorageKeys.OWNER_UNLOCKED, isOwnerUnlocked);
  }, [isOwnerUnlocked]);

  const handleRequestOwnerUnlock = useCallback(
    (actionTitle?: string, onApproved?: () => void) => {
      setPendingOwnerActionTitle(actionTitle);
      setPendingOwnerCallback(() => onApproved || null);
      setShowOwnerLockModal(true);
    },
    []
  );

  const handleOwnerUnlockSuccess = () => {
    setIsOwnerUnlocked(true);
    saveState(StorageKeys.OWNER_UNLOCKED, true);
    playUnlockSound();
    setRoleToast({
      message: '👑 Owner Mode Unlocked: Store rates, salaries, and sensitive records accessible.',
      isOwner: true,
    });
    setTimeout(() => setRoleToast(null), 4500);
    if (pendingOwnerCallback) {
      pendingOwnerCallback();
      setPendingOwnerCallback(null);
    }
  };

  const handleLockStore = () => {
    setIsOwnerUnlocked(false);
    saveState(StorageKeys.OWNER_UNLOCKED, false);
    playLockSound();
    setRoleToast({
      message: '🔒 Switched to Staff Mode: Salaries, customer deletion, and rates are now protected.',
      isOwner: false,
    });
    setTimeout(() => setRoleToast(null), 4500);
  };

  // ----------------------------------------------------
  // BACKEND BOOTSTRAP & SYNC
  // ----------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    async function initBackend() {
      try {
        const bootstrap = await api.getBootstrapData();
        if (bootstrap && isMounted) {
          setIsServerSynced(true);
          // If server already has data, load it; otherwise sync current local data to server
          const hasServerData =
            bootstrap.staff.length > 0 ||
            bootstrap.products.length > 0 ||
            bootstrap.customers.length > 0 ||
            bootstrap.transactions.length > 0 ||
            bootstrap.attendance.length > 0 ||
            bootstrap.salaryPayments.length > 0;

          if (hasServerData) {
            setStaffList(bootstrap.staff || []);
            setAttendanceRecords(bootstrap.attendance || []);
            setProducts(bootstrap.products || []);
            setCustomers(bootstrap.customers || []);
            setTransactions(bootstrap.transactions || []);
            setSalaryPayments(bootstrap.salaryPayments || []);
            if (bootstrap.stock && bootstrap.stock.length > 0) setStockMetals(bootstrap.stock);
            if (bootstrap.settings) setSettings(bootstrap.settings);
          } else {
            // Push current state to server
            api.syncAll({
              staff: staffList,
              attendance: attendanceRecords,
              products,
              customers,
              transactions,
              salaryPayments,
              stock: stockMetals,
              settings,
            });
          }
        }
      } catch (err) {
        console.warn('Backend sync failed on startup:', err);
      }
    }
    initBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state changes to storage
  useEffect(() => {
    saveState(StorageKeys.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    saveState(StorageKeys.CUSTOMERS, customers);
  }, [customers]);

  useEffect(() => {
    saveState(StorageKeys.STAFF, staffList);
  }, [staffList]);

  useEffect(() => {
    saveState(StorageKeys.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveState(StorageKeys.TRANSACTIONS, transactions);
  }, [transactions]);

  useEffect(() => {
    saveState(StorageKeys.STOCK, stockMetals);
  }, [stockMetals]);

  useEffect(() => {
    saveState(StorageKeys.ATTENDANCE, attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    saveState(StorageKeys.SALARY_PAYMENTS, salaryPayments);
  }, [salaryPayments]);

  useEffect(() => {
    saveState(StorageKeys.SCREEN, currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    saveState(StorageKeys.VIEWMODE, viewMode);
  }, [viewMode]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [whatsAppCustomer, setWhatsAppCustomer] = useState<Customer | null>(null);
  const [generatedInvoiceData, setGeneratedInvoiceData] = useState<{
    tx: Transaction;
    items: InvoiceItem[];
  } | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showAddCustomItemModal, setShowAddCustomItemModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if active view should render mobile layout
  const isMobile = windowWidth < 1024;

  // ----------------------------------------------------
  // UNDO MANAGEMENT
  // ----------------------------------------------------
  const handlePushUndo = (item: UndoItem) => {
    setUndoStack((prev) => [item, ...prev]);
  };

  const handleDismissUndo = (id: string) => {
    setUndoStack((prev) => prev.filter((u) => u.id !== id));
  };

  const handleExecuteUndo = (id: string) => {
    const item = undoStack.find((u) => u.id === id);
    if (!item) return;

    if (item.type === 'staff') {
      const restored = item.data as StaffMember;
      setStaffList((prev) => [restored, ...prev]);
      api.saveStaff(restored);
    } else if (item.type === 'product') {
      const restored = item.data as Product;
      setProducts((prev) => [restored, ...prev]);
      api.saveProduct(restored);
    } else if (item.type === 'customer') {
      const restored = item.data as Customer;
      setCustomers((prev) => [restored, ...prev]);
      api.saveCustomer(restored);
    } else if (item.type === 'attendance') {
      const restored = item.data as AttendanceRecord;
      setAttendanceRecords((prev) => [restored, ...prev]);
      api.punchAttendance(restored);
    } else if (item.type === 'salary') {
      const restored = item.data as SalaryPayment;
      setSalaryPayments((prev) => [restored, ...prev]);
      api.recordSalaryPayment(restored);
    }

    // Remove from undo stack
    setUndoStack((prev) => prev.filter((u) => u.id !== id));
  };

  // ----------------------------------------------------
  // STAFF HANDLERS
  // ----------------------------------------------------
  const handleSaveStaff = (staff: StaffMember) => {
    const exists = staffList.some((s) => s.id === staff.id);
    let updated: StaffMember[];
    if (exists) {
      updated = staffList.map((s) => (s.id === staff.id ? staff : s));
    } else {
      updated = [staff, ...staffList];
    }
    setStaffList(updated);
    saveState(StorageKeys.STAFF, updated);
    api.saveStaff(staff);
  };

  const handleDeleteStaff = (id: string) => {
    const target = staffList.find((s) => s.id === id);
    if (!target) return;

    // Remove from active list
    const updated = staffList.filter((s) => s.id !== id);
    setStaffList(updated);
    saveState(StorageKeys.STAFF, updated);
    api.deleteStaff(id);

    // Push to undo stack with 30s window
    handlePushUndo({
      id: `undo-staff-${id}-${Date.now()}`,
      type: 'staff',
      title: `Deleted employee "${target.name}"`,
      data: target,
      timestamp: Date.now(),
    });
  };

  const handleUpdateStaffStatus = (id: string, status: StaffStatus) => {
    const updated = staffList.map((s) => (s.id === id ? { ...s, status } : s));
    setStaffList(updated);
    saveState(StorageKeys.STAFF, updated);
    const target = updated.find((s) => s.id === id);
    if (target) api.saveStaff(target);
  };

  const handleUpdateStaffPayroll = (id: string, payrollStatus: PayrollStatus) => {
    const updated = staffList.map((s) => (s.id === id ? { ...s, payrollStatus } : s));
    setStaffList(updated);
    saveState(StorageKeys.STAFF, updated);
    const target = updated.find((s) => s.id === id);
    if (target) api.saveStaff(target);
  };

  // ----------------------------------------------------
  // ATTENDANCE HANDLERS
  // ----------------------------------------------------
  const handleMarkAttendance = (
    staffId: string,
    date: string,
    status: 'Present' | 'Absent' | 'Half-day' | 'Leave',
    overtimeHours?: number,
    notes?: string
  ) => {
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff) return;

    const existingIndex = attendanceRecords.findIndex(
      (r) => r.staffId === staffId && r.date === date
    );

    const record: AttendanceRecord = {
      id: existingIndex > -1 ? attendanceRecords[existingIndex].id : `${staffId}_${date}`,
      staffId,
      staffName: staff.name,
      date,
      status,
      inTime: status === 'Present' || status === 'Half-day' ? '09:30 AM' : undefined,
      outTime: status === 'Present' ? '07:30 PM' : status === 'Half-day' ? '02:00 PM' : undefined,
      checkInTime: status === 'Present' || status === 'Half-day' ? '09:30 AM' : undefined,
      checkOutTime: status === 'Present' ? '07:30 PM' : status === 'Half-day' ? '02:00 PM' : undefined,
      overtimeHours: overtimeHours ?? (existingIndex > -1 ? attendanceRecords[existingIndex].overtimeHours : 0),
      notes: notes ?? (existingIndex > -1 ? attendanceRecords[existingIndex].notes : ''),
    };

    let updated: AttendanceRecord[];
    if (existingIndex > -1) {
      updated = [...attendanceRecords];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...attendanceRecords];
    }

    setAttendanceRecords(updated);
    saveState(StorageKeys.ATTENDANCE, updated);
    api.punchAttendance(record);
  };

  const handleBulkMarkAttendance = (
    date: string,
    status: 'Present' | 'Absent' | 'Half-day' | 'Leave'
  ) => {
    const updated = [...attendanceRecords];
    const touched: AttendanceRecord[] = [];

    staffList.forEach((staff) => {
      const idx = updated.findIndex((r) => r.staffId === staff.id && r.date === date);
      const record: AttendanceRecord = {
        id: idx > -1 ? updated[idx].id : `${staff.id}_${date}`,
        staffId: staff.id,
        staffName: staff.name,
        date,
        status,
        inTime: status === 'Present' || status === 'Half-day' ? '09:30 AM' : undefined,
        outTime: status === 'Present' ? '07:30 PM' : status === 'Half-day' ? '02:00 PM' : undefined,
        checkInTime: status === 'Present' || status === 'Half-day' ? '09:30 AM' : undefined,
        checkOutTime: status === 'Present' ? '07:30 PM' : status === 'Half-day' ? '02:00 PM' : undefined,
        overtimeHours: idx > -1 ? updated[idx].overtimeHours : 0,
      };

      if (idx > -1) {
        updated[idx] = record;
      } else {
        updated.push(record);
      }
      touched.push(record);
    });

    setAttendanceRecords(updated);
    saveState(StorageKeys.ATTENDANCE, updated);
    api.punchAttendanceBulk(touched);
  };

  const handleUpdateAttendanceRecords = (records: AttendanceRecord[]) => {
    setAttendanceRecords(records);
    saveState(StorageKeys.ATTENDANCE, records);
    api.punchAttendanceBulk(records);
  };

  // ----------------------------------------------------
  // SALARY & PAYROLL HANDLERS
  // ----------------------------------------------------
  const handleRecordSalaryPayment = (payment: SalaryPayment) => {
    const updated = [payment, ...salaryPayments];
    setSalaryPayments(updated);
    saveState(StorageKeys.SALARY_PAYMENTS, updated);
    api.recordSalaryPayment(payment);

    // Update staff payroll status to Cleared
    handleUpdateStaffPayroll(payment.staffId, 'Cleared');
  };

  const handleDeleteSalaryPayment = (paymentId: string) => {
    const target = salaryPayments.find((p) => p.id === paymentId);
    if (!target) return;

    const updated = salaryPayments.filter((p) => p.id !== paymentId);
    setSalaryPayments(updated);
    saveState(StorageKeys.SALARY_PAYMENTS, updated);
    api.deleteSalaryPayment(paymentId);

    handlePushUndo({
      id: `undo-sal-${paymentId}-${Date.now()}`,
      type: 'salary',
      title: `Deleted salary voucher for "${target.staffName}"`,
      data: target,
      timestamp: Date.now(),
    });
  };

  // ----------------------------------------------------
  // PRODUCT HANDLERS
  // ----------------------------------------------------
  const handleSaveProduct = (prod: Product) => {
    const exists = products.some((p) => p.id === prod.id);
    let updated: Product[];
    if (exists) {
      updated = products.map((p) => (p.id === prod.id ? prod : p));
    } else {
      updated = [prod, ...products];
    }
    setProducts(updated);
    saveState(StorageKeys.PRODUCTS, updated);
    api.saveProduct(prod);
  };

  const handleUpdateProductStockCount = (id: string, newCount: number) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, stockCount: newCount, inStock: newCount > 0 } : p
    );
    setProducts(updated);
    saveState(StorageKeys.PRODUCTS, updated);
    const target = updated.find((p) => p.id === id);
    if (target) api.saveProduct(target);
  };

  const handleDeleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    saveState(StorageKeys.PRODUCTS, updated);
    api.deleteProduct(id);

    handlePushUndo({
      id: `undo-prod-${id}-${Date.now()}`,
      type: 'product',
      title: `Deleted product "${target.name}"`,
      data: target,
      timestamp: Date.now(),
    });
  };

  // ----------------------------------------------------
  // CUSTOMER HANDLERS
  // ----------------------------------------------------
  const handleAddNewCustomer = (cust: Customer) => {
    const updated = [cust, ...customers];
    setCustomers(updated);
    saveState(StorageKeys.CUSTOMERS, updated);
    api.saveCustomer(cust);
  };

  const handleDeleteCustomer = (id: string) => {
    const target = customers.find((c) => c.id === id);
    if (!target) return;

    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    saveState(StorageKeys.CUSTOMERS, updated);
    api.deleteCustomer(id);

    handlePushUndo({
      id: `undo-cust-${id}-${Date.now()}`,
      type: 'customer',
      title: `Deleted customer "${target.name}"`,
      data: target,
      timestamp: Date.now(),
    });
  };

  // ----------------------------------------------------
  // BILLING & INVOICING HANDLERS
  // ----------------------------------------------------
  const handleGenerateBill = (tx: Transaction, items: InvoiceItem[]) => {
    const updated = [tx, ...transactions];
    setTransactions(updated);
    saveState(StorageKeys.TRANSACTIONS, updated);
    api.createTransaction(tx);
    setGeneratedInvoiceData({ tx, items });
  };

  // Sample data loaders
  const handleLoadSampleStaff = () => {
    setStaffList(sampleStaffPack);
    saveState(StorageKeys.STAFF, sampleStaffPack);
    api.syncAll({ staff: sampleStaffPack });
  };

  const handleLoadSampleProducts = () => {
    setProducts(sampleProductPack);
    saveState(StorageKeys.PRODUCTS, sampleProductPack);
    api.syncAll({ products: sampleProductPack });
  };

  const handleResetToCleanState = () => {
    clearAllAppData();
    setSettings(initialSettings);
    setCustomers([]);
    setStaffList([]);
    setProducts([]);
    setTransactions([]);
    setStockMetals(initialStockMetals);
    setAttendanceRecords([]);
    setSalaryPayments([]);
    api.resetAll();
  };

  return (
    <div className="min-h-screen bg-[#0E1013] text-[#E2E8F0] font-sans antialiased flex flex-col selection:bg-[#E5B842] selection:text-[#111418]">
      {/* Undo Toast Notification Center */}
      <UndoToast
        undoStack={undoStack}
        onUndo={handleExecuteUndo}
        onDismiss={handleDismissUndo}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Desktop Sidebar (hidden in mobile mode) */}
        {!isMobile && (
          <Sidebar
            currentScreen={currentScreen}
            onNavigate={(screen) => {
              setCurrentScreen(screen);
              setSearchQuery('');
            }}
            onNewSaleClick={() => {
              setCurrentScreen('billing');
            }}
            onOpenSettings={() => setShowSettingsModal(true)}
            isOwnerUnlocked={isOwnerUnlocked}
            onLockStore={handleLockStore}
            onRequestOwnerUnlock={handleRequestOwnerUnlock}
          />
        )}

        {/* Right Main Body Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
          {/* Desktop Top Navigation Bar */}
          {!isMobile ? (
            <Header
              currentScreen={currentScreen}
              settings={settings}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenSettings={() => setShowSettingsModal(true)}
              isOwnerUnlocked={isOwnerUnlocked}
              onLockStore={handleLockStore}
              onRequestOwnerUnlock={handleRequestOwnerUnlock}
            />
          ) : (
            <MobileHeader
              currentScreen={currentScreen}
              onNavigate={setCurrentScreen}
              onOpenSettings={() => setShowSettingsModal(true)}
              isOwnerUnlocked={isOwnerUnlocked}
              onLockStore={handleLockStore}
              onRequestOwnerUnlock={handleRequestOwnerUnlock}
            />
          )}

          {/* Screen Content Switcher */}
          <main className="flex-1 overflow-x-hidden">
            {currentScreen === 'dashboard' && (
              <DashboardView
                transactions={transactions}
                stockMetals={stockMetals}
                products={products}
                staffList={staffList}
                attendanceRecords={attendanceRecords}
                settings={settings}
                onNewBill={() => setCurrentScreen('billing')}
                onAddStock={() => setShowAddStockModal(true)}
                onNavigateToProducts={() => setCurrentScreen('products')}
                onNavigateToAttendance={() => setCurrentScreen('attendance')}
                onNavigateToStaff={() => setCurrentScreen('staff')}
                onNavigateToBilling={() => setCurrentScreen('billing')}
                isMobileLayout={isMobile}
                isOwnerUnlocked={isOwnerUnlocked}
                onLockStore={handleLockStore}
                onRequestOwnerUnlock={handleRequestOwnerUnlock}
              />
            )}

            {currentScreen === 'products' && (
              <ProductsView
                products={products}
                settings={settings}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddNewProduct={() => {
                  setEditingProduct(null);
                  setShowAddProductModal(true);
                }}
                onEditProduct={(prod) => {
                  setEditingProduct(prod);
                  setShowAddProductModal(true);
                }}
                onDeleteProduct={handleDeleteProduct}
                onUpdateStockCount={handleUpdateProductStockCount}
                onLoadSampleProducts={handleLoadSampleProducts}
                isMobileLayout={isMobile}
              />
            )}

            {currentScreen === 'attendance' && (
              <AttendanceView
                staffList={staffList}
                attendanceRecords={attendanceRecords}
                settings={settings}
                onUpdateAttendance={handleUpdateAttendanceRecords}
                onMarkAttendance={handleMarkAttendance}
                onBulkMarkAttendance={handleBulkMarkAttendance}
                onNavigateToPayroll={() => setCurrentScreen('staff')}
                onNavigateToStaff={() => setCurrentScreen('staff')}
                onAddEmployeeClick={() => {
                  setEditingStaff(null);
                  setShowAddEmployeeModal(true);
                }}
                onAddNewStaff={() => {
                  setEditingStaff(null);
                  setShowAddEmployeeModal(true);
                }}
                isMobileLayout={isMobile}
                isOwnerUnlocked={isOwnerUnlocked}
                onRequestOwnerUnlock={handleRequestOwnerUnlock}
              />
            )}

            {currentScreen === 'staff' && (
              <StaffView
                staffList={staffList}
                attendanceRecords={attendanceRecords}
                salaryPayments={salaryPayments}
                settings={settings}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddNewStaff={() => {
                  setEditingStaff(null);
                  setShowAddEmployeeModal(true);
                }}
                onEditStaff={(staff) => {
                  setEditingStaff(staff);
                  setShowAddEmployeeModal(true);
                }}
                onUpdateStatus={handleUpdateStaffStatus}
                onUpdatePayroll={handleUpdateStaffPayroll}
                onDeleteStaff={handleDeleteStaff}
                onRecordSalaryPayment={handleRecordSalaryPayment}
                onDeleteSalaryPayment={handleDeleteSalaryPayment}
                onLoadSampleStaff={handleLoadSampleStaff}
                onNavigateToAttendance={() => setCurrentScreen('attendance')}
                isMobileLayout={isMobile}
                isOwnerUnlocked={isOwnerUnlocked}
                onRequestOwnerUnlock={handleRequestOwnerUnlock}
              />
            )}

            {currentScreen === 'customers' && (
              <CustomersView
                customers={customers}
                settings={settings}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddNewCustomer={() => setShowAddCustomerModal(true)}
                onOpenWhatsAppReminder={setWhatsAppCustomer}
                onViewProfile={(cust) => setWhatsAppCustomer(cust)}
                onDeleteCustomer={handleDeleteCustomer}
                isMobileLayout={isMobile}
                isOwnerUnlocked={isOwnerUnlocked}
                onRequestOwnerUnlock={handleRequestOwnerUnlock}
              />
            )}

            {currentScreen === 'billing' && (
              <BillingView
                products={products}
                customers={customers}
                settings={settings}
                onGenerateBill={handleGenerateBill}
                onAddCustomItemModal={() => setShowAddCustomItemModal(true)}
                isMobileLayout={isMobile}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible on mobile/narrow screens) */}
      {isMobile && (
        <MobileBottomNav
          currentScreen={currentScreen}
          onNavigate={(screen) => {
            setCurrentScreen(screen);
            setSearchQuery('');
          }}
          isOwnerUnlocked={isOwnerUnlocked}
          onRequestOwnerUnlock={handleRequestOwnerUnlock}
        />
      )}

      {/* MODALS */}
      {showAddProductModal && (
        <AddProductModal
          productToEdit={editingProduct}
          settings={settings}
          onSave={handleSaveProduct}
          onSaveProduct={handleSaveProduct}
          onAdd={handleSaveProduct}
          onClose={() => {
            setShowAddProductModal(false);
            setEditingProduct(null);
          }}
        />
      )}

      {showAddEmployeeModal && (
        <AddEmployeeModal
          staffToEdit={editingStaff}
          onSave={handleSaveStaff}
          onAdd={handleSaveStaff}
          onClose={() => {
            setShowAddEmployeeModal(false);
            setEditingStaff(null);
          }}
        />
      )}

      {showAddCustomerModal && (
        <AddCustomerModal
          onAdd={handleAddNewCustomer}
          onSave={handleAddNewCustomer}
          onClose={() => setShowAddCustomerModal(false)}
        />
      )}

      {showAddCustomItemModal && (
        <AddCustomItemModal
          onAddProduct={handleSaveProduct}
          onAdd={handleSaveProduct}
          onSave={handleSaveProduct}
          onClose={() => setShowAddCustomItemModal(false)}
        />
      )}

      {showAddStockModal && (
        <AddStockModal
          stockMetals={stockMetals}
          onUpdateStock={(newStock) => {
            setStockMetals(newStock);
            saveState(StorageKeys.STOCK, newStock);
            api.saveStock(newStock);
          }}
          onSave={(newStock) => {
            setStockMetals(newStock);
            saveState(StorageKeys.STOCK, newStock);
            api.saveStock(newStock);
          }}
          onClose={() => setShowAddStockModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onSave={(newSettings) => {
            setSettings(newSettings);
            saveState(StorageKeys.SETTINGS, newSettings);
            api.saveSettings(newSettings);
          }}
          onSaveSettings={(newSettings) => {
            setSettings(newSettings);
            saveState(StorageKeys.SETTINGS, newSettings);
            api.saveSettings(newSettings);
          }}
          onResetData={handleResetToCleanState}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {whatsAppCustomer && (
        <WhatsAppReminderModal
          customer={whatsAppCustomer}
          settings={settings}
          onClose={() => setWhatsAppCustomer(null)}
        />
      )}

      {generatedInvoiceData && (
        <InvoiceModal
          transaction={generatedInvoiceData.tx}
          items={generatedInvoiceData.items}
          settings={settings}
          onClose={() => setGeneratedInvoiceData(null)}
        />
      )}

      {/* Security: Owner PIN Unlock Modal */}
      <OwnerLockModal
        isOpen={showOwnerLockModal}
        onClose={() => {
          setShowOwnerLockModal(false);
          setPendingOwnerCallback(null);
          setPendingOwnerActionTitle(undefined);
        }}
        onSuccess={handleOwnerUnlockSuccess}
        targetActionTitle={pendingOwnerActionTitle}
        correctPin={settings.ownerPin || '1234'}
      />

      {/* Role State Switch Notification Toast */}
      {roleToast && (
        <div
          id="role-switch-toast"
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-md ${
            roleToast.isOwner
              ? 'bg-[#151921]/95 border-[#E5B842] text-[#E5B842]'
              : 'bg-[#151921]/95 border-red-500/50 text-red-300'
          }`}
        >
          <span>{roleToast.message}</span>
          <button
            onClick={() => setRoleToast(null)}
            className="text-white/60 hover:text-white ml-2 cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
export default App;
