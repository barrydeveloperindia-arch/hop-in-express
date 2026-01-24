import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    increment,
    writeBatch,
    setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { InventoryItem, Transaction, SystemSnapshot } from '../types';

// Collection References Helper
const getInventoryRef = (userId: string) => collection(db, 'shops', userId, 'inventory');
const getTransactionsRef = (userId: string) => collection(db, 'shops', userId, 'transactions');
const getSnapshotsRef = (userId: string) => collection(db, 'shops', userId, 'snapshots');

/**
 * Real-time Inventory Subscription
 */
export const subscribeToInventory = (userId: string, callback: (items: InventoryItem[]) => void) => {
    // Reverting to simple collection fetching to ensure ALL data appears (bypassing index requirements)
    return onSnapshot(getInventoryRef(userId), (snapshot) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InventoryItem));
        callback(items);
    });
};

/**
 * Real-time Transactions Subscription
 */
export const subscribeToTransactions = (userId: string, callback: (transactions: Transaction[]) => void) => {
    return onSnapshot(getTransactionsRef(userId), (snapshot) => {
        const transactions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
        callback(transactions);
    });
};

import { StaffMember, AttendanceRecord, LedgerEntry, Supplier, Bill, Expense, DailySalesRecord, Purchase } from '../types';

// Collection Helpers
const getStaffRef = (userId: string) => collection(db, 'shops', userId, 'staff');
const getAttendanceRef = (userId: string) => collection(db, 'shops', userId, 'attendance');
const getLedgerRef = (userId: string) => collection(db, 'shops', userId, 'ledger');
const getSuppliersRef = (userId: string) => collection(db, 'shops', userId, 'suppliers');
const getBillsRef = (userId: string) => collection(db, 'shops', userId, 'bills');
const getExpensesRef = (userId: string) => collection(db, 'shops', userId, 'expenses');
const getDailySalesRef = (userId: string) => collection(db, 'shops', userId, 'daily_sales');
const getPurchasesRef = (userId: string) => collection(db, 'shops', userId, 'purchases');

// Staff
export const subscribeToStaff = (userId: string, callback: (staff: StaffMember[]) => void) => {
    return onSnapshot(getStaffRef(userId), (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StaffMember)));
    }, (error) => {
        console.error("🔥 Permission Error or Staff Fetch Failed:", error);
    });
};

// Attendance
export const subscribeToAttendance = (userId: string, callback: (records: AttendanceRecord[]) => void) => {
    return onSnapshot(getAttendanceRef(userId), (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AttendanceRecord)));
    });
};

// Ledger (Financials)
export const subscribeToLedger = (userId: string, callback: (entries: LedgerEntry[]) => void) => {
    return onSnapshot(getLedgerRef(userId), (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LedgerEntry)));
    });
};

// Daily Sales
export const subscribeToDailySales = (userId: string, callback: (records: DailySalesRecord[]) => void) => {
    return onSnapshot(getDailySalesRef(userId), (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DailySalesRecord)));
    });
};
// Transactions
export const processTransaction = async (userId: string, transaction: Transaction) => {
    const batch = writeBatch(db);

    // 1. Add Transaction Record
    const txRef = doc(db, 'shops', userId, 'transactions', transaction.id);
    batch.set(txRef, transaction);

    // 2. Update Inventory Stock
    transaction.items.forEach(item => {
        const itemRef = doc(db, 'shops', userId, 'inventory', item.id);
        batch.update(itemRef, {
            stock: increment(-item.qty)
        });
    });

    // 3. Commit Batch
    await batch.commit();
};
// Attendance CRUD
export const addAttendanceRecord = async (userId: string, record: AttendanceRecord) => {
    const ref = doc(db, 'shops', userId, 'attendance', record.id);
    await setDoc(ref, record);
};

export const updateAttendanceRecord = async (userId: string, recordId: string, updates: Partial<AttendanceRecord>) => {
    const ref = doc(db, 'shops', userId, 'attendance', recordId);
    await updateDoc(ref, updates);
};

export const deleteAttendanceRecord = async (userId: string, recordId: string) => {
    const ref = doc(db, 'shops', userId, 'attendance', recordId);
    await deleteDoc(ref);
};

// -- MISSING EXPORTS RESTORED --

// Subscriptions
export const subscribeToSuppliers = (userId: string, callback: (items: Supplier[]) => void) => {
    return onSnapshot(getSuppliersRef(userId), (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Supplier)));
    });
};

export const subscribeToBills = (userId: string, callback: (items: Bill[]) => void) => {
    return onSnapshot(getBillsRef(userId), (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Bill)));
    });
};

export const subscribeToExpenses = (userId: string, callback: (items: Expense[]) => void) => {
    return onSnapshot(getExpensesRef(userId), (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Expense)));
    });
};

export const subscribeToPurchases = (userId: string, callback: (items: Purchase[]) => void) => {
    return onSnapshot(getPurchasesRef(userId), (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Purchase)));
    });
};

// CRUD: Inventory
export const addInventoryItem = async (userId: string, item: InventoryItem) => {
    const ref = doc(db, 'shops', userId, 'inventory', item.id);
    await setDoc(ref, item);
};

export const updateInventoryItem = async (userId: string, itemId: string, updates: Partial<InventoryItem>) => {
    const ref = doc(db, 'shops', userId, 'inventory', itemId);
    await updateDoc(ref, updates);
};

// CRUD: Staff
export const addStaffMember = async (userId: string, staff: StaffMember) => {
    const ref = doc(db, 'shops', userId, 'staff', staff.id);
    await setDoc(ref, staff);
};

export const updateStaffMember = async (userId: string, staffId: string, updates: Partial<StaffMember>) => {
    const ref = doc(db, 'shops', userId, 'staff', staffId);
    await updateDoc(ref, updates);
};

// CRUD: Ledger
export const addLedgerEntry = async (userId: string, entry: LedgerEntry) => {
    const ref = doc(db, 'shops', userId, 'ledger', entry.id);
    await setDoc(ref, entry);
};

// CRUD: Expenses
export const addExpense = async (userId: string, expense: Expense) => {
    const ref = doc(db, 'shops', userId, 'expenses', expense.id);
    await setDoc(ref, expense);
};

// CRUD: Daily Sales (Batch Import)
export const batchImportDailySales = async (userId: string, records: DailySalesRecord[]) => {
    const batch = writeBatch(db);
    records.forEach(record => {
        const ref = doc(db, 'shops', userId, 'daily_sales', record.id);
        batch.set(ref, record);
    });
    await batch.commit();
};

// CRUD: Purchases
export const addPurchase = async (userId: string, purchase: Purchase) => {
    const ref = doc(db, 'shops', userId, 'purchases', purchase.id);
    await setDoc(ref, purchase);
};

export const updatePurchase = async (userId: string, purchaseId: string, updates: Partial<Purchase>) => {
    const ref = doc(db, 'shops', userId, 'purchases', purchaseId);
    await updateDoc(ref, updates);
};

// CRUD: Bills
export const addBill = async (userId: string, bill: Bill) => {
    const ref = doc(db, 'shops', userId, 'bills', bill.id);
    await setDoc(ref, bill);
};

export const updateBill = async (userId: string, billId: string, updates: Partial<Bill>) => {
    const ref = doc(db, 'shops', userId, 'bills', billId);
    await updateDoc(ref, updates);
};

// CRUD: Suppliers
export const addSupplier = async (userId: string, supplier: Supplier) => {
    const ref = doc(db, 'shops', userId, 'suppliers', supplier.id);
    await setDoc(ref, supplier);
};

export const updateSupplier = async (userId: string, supplierId: string, updates: Partial<Supplier>) => {
    const ref = doc(db, 'shops', userId, 'suppliers', supplierId);
    await updateDoc(ref, updates);
};
