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
    const q = query(getInventoryRef(userId), orderBy('name'));
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InventoryItem));
        callback(items);
    });
};

/**
 * Real-time Transactions Subscription
 */
export const subscribeToTransactions = (userId: string, callback: (transactions: Transaction[]) => void) => {
    const q = query(getTransactionsRef(userId), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const transactions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
        callback(transactions);
    });
};

/**
 * Inventory Operations
 */
export const addInventoryItem = async (userId: string, item: Omit<InventoryItem, 'id'>) => {
    return await addDoc(getInventoryRef(userId), item);
};

export const updateInventoryItem = async (userId: string, itemId: string, updates: Partial<InventoryItem>) => {
    const docRef = doc(db, 'shops', userId, 'inventory', itemId);
    return await updateDoc(docRef, updates);
};


export const deleteInventoryItem = async (userId: string, itemId: string) => {
    const docRef = doc(db, 'shops', userId, 'inventory', itemId);
    return await deleteDoc(docRef);
};

export const batchImportInventory = async (userId: string, items: Omit<InventoryItem, 'id'>[]) => {
    const batchSize = 500;
    const inventoryRef = getInventoryRef(userId);

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = items.slice(i, i + batchSize);

        chunk.forEach(item => {
            const docRef = doc(inventoryRef); // Auto-gen ID
            batch.set(docRef, { ...item, id: docRef.id });
        });

        await batch.commit();
        await batch.commit();
    }
};

export const batchUpdateInventory = async (userId: string, updates: { id: string, data: Partial<InventoryItem> }[]) => {
    const batchSize = 500;

    for (let i = 0; i < updates.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = updates.slice(i, i + batchSize);

        chunk.forEach(update => {
            const docRef = doc(db, 'shops', userId, 'inventory', update.id);
            batch.update(docRef, update.data);
        });

        await batch.commit();
    }
};

/**
 * Transaction Operations & Stock Management
 * Uses a batch write to ensure atomicity: Transaction Record + Inventory Decrement
 */
export const processTransaction = async (userId: string, transaction: Transaction) => {
    const batch = writeBatch(db);

    // 1. Create Transaction Record
    const newTransactionRef = doc(getTransactionsRef(userId)); // Auto-gen ID for reference if needed
    // Ensure we save the specific ID if provided, or let Firestore gen one (but we passed ID in types usually)
    // To stick to Firestore auto-ids for documents but keep our internal IDs consistent:
    const transactionRef = doc(getTransactionsRef(userId), transaction.id);
    batch.set(transactionRef, transaction);

    // 2. Decrement Stock for each item
    transaction.items.forEach(item => {
        // Assumption: item.id relates to the document ID in inventory
        // If scanning finds an item, we must ensure we have its Doc ID. 
        // Types might need checking if item.id is the Firestore Doc ID.
        const itemRef = doc(db, 'shops', userId, 'inventory', item.id);
        batch.update(itemRef, {
            stock: increment(-item.qty)
        });
    });

    await batch.commit();
};

/**
 * Snapshot/Rollback Operations (Placeholder/Basic)
 */
export const saveSystemSnapshot = async (userId: string, snapshot: SystemSnapshot) => {
    return await addDoc(getSnapshotsRef(userId), {
        ...snapshot,
        createdAt: serverTimestamp()
    });
};

// --- Expanded Persistence (Phase 2) ---

import { StaffMember, AttendanceRecord, LedgerEntry, Supplier, Bill, Expense } from '../types';

// Collection Helpers
const getStaffRef = (userId: string) => collection(db, 'shops', userId, 'staff');
const getAttendanceRef = (userId: string) => collection(db, 'shops', userId, 'attendance');
const getLedgerRef = (userId: string) => collection(db, 'shops', userId, 'ledger');
const getSuppliersRef = (userId: string) => collection(db, 'shops', userId, 'suppliers');
const getBillsRef = (userId: string) => collection(db, 'shops', userId, 'bills');
const getExpensesRef = (userId: string) => collection(db, 'shops', userId, 'expenses');

// Staff
export const subscribeToStaff = (userId: string, callback: (staff: StaffMember[]) => void) => {
    return onSnapshot(getStaffRef(userId), (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StaffMember)));
    });
};

export const addStaffMember = async (userId: string, staff: StaffMember) => {
    // Use setDoc if ID is provided, or addDoc if not causing ID mismatch. 
    // Staff usually has an ID from logic. Let's rely on setDoc with specific ID.
    const ref = doc(getStaffRef(userId), staff.id);
    return await setDoc(ref, staff);
};

export const updateStaffMember = async (userId: string, staffId: string, updates: Partial<StaffMember>) => {
    return await updateDoc(doc(getStaffRef(userId), staffId), updates);
};

export const deleteStaffMember = async (userId: string, staffId: string) => {
    return await deleteDoc(doc(getStaffRef(userId), staffId));
};

// Attendance
export const subscribeToAttendance = (userId: string, callback: (records: AttendanceRecord[]) => void) => {
    const q = query(getAttendanceRef(userId), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AttendanceRecord)));
    });
};

export const addAttendanceRecord = async (userId: string, record: AttendanceRecord) => {
    const ref = doc(getAttendanceRef(userId), record.id);
    return await setDoc(ref, record);
};

export const updateAttendanceRecord = async (userId: string, recordId: string, updates: Partial<AttendanceRecord>) => {
    return await updateDoc(doc(getAttendanceRef(userId), recordId), updates);
};

export const deleteAttendanceRecord = async (userId: string, recordId: string) => {
    return await deleteDoc(doc(getAttendanceRef(userId), recordId));
};

// Ledger (Financials)
export const subscribeToLedger = (userId: string, callback: (entries: LedgerEntry[]) => void) => {
    const q = query(getLedgerRef(userId), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LedgerEntry)));
    });
};

export const addLedgerEntry = async (userId: string, entry: LedgerEntry) => {
    const ref = doc(getLedgerRef(userId), entry.id);
    return await setDoc(ref, entry);
};

// Purchases & Suppliers
export const subscribeToSuppliers = (userId: string, callback: (suppliers: Supplier[]) => void) => {
    return onSnapshot(getSuppliersRef(userId), (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Supplier)));
    });
};

export const addSupplier = async (userId: string, supplier: Supplier) => {
    const ref = doc(getSuppliersRef(userId), supplier.id);
    return await setDoc(ref, supplier);
};

export const updateSupplier = async (userId: string, supplierId: string, updates: Partial<Supplier>) => {
    return await updateDoc(doc(getSuppliersRef(userId), supplierId), updates);
};

export const subscribeToBills = (userId: string, callback: (bills: Bill[]) => void) => {
    return onSnapshot(getBillsRef(userId), (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Bill)));
    });
};

export const addBill = async (userId: string, bill: Bill) => {
    const ref = doc(getBillsRef(userId), bill.id);
    return await setDoc(ref, bill);
};

export const updateBill = async (userId: string, billId: string, updates: Partial<Bill>) => {
    return await updateDoc(doc(getBillsRef(userId), billId), updates);
};

// Expenses
export const subscribeToExpenses = (userId: string, callback: (expenses: Expense[]) => void) => {
    return onSnapshot(getExpensesRef(userId), (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Expense)));
    });
};

export const addExpense = async (userId: string, expense: Expense) => {
    const ref = doc(getExpensesRef(userId), expense.id);
    return await setDoc(ref, expense);
};

// Purchases (Stock In)
import { Purchase } from '../types';
const getPurchasesRef = (userId: string) => collection(db, 'shops', userId, 'purchases');

export const subscribeToPurchases = (userId: string, callback: (purchases: Purchase[]) => void) => {
    return onSnapshot(getPurchasesRef(userId), (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Purchase)));
    });
};

export const addPurchase = async (userId: string, purchase: Purchase) => {
    const ref = doc(getPurchasesRef(userId), purchase.id);
    return await setDoc(ref, purchase);
};

export const updatePurchase = async (userId: string, purchaseId: string, updates: Partial<Purchase>) => {
    return await updateDoc(doc(getPurchasesRef(userId), purchaseId), updates);
};

// Daily Sales
import { DailySalesRecord } from '../types';
const getDailySalesRef = (userId: string) => collection(db, 'shops', userId, 'daily_sales');

export const addDailySales = async (userId: string, record: DailySalesRecord) => {
    const ref = doc(getDailySalesRef(userId), record.id);
    return await setDoc(ref, record);
};

export const batchImportDailySales = async (userId: string, records: DailySalesRecord[]) => {
    const batch = writeBatch(db);
    records.forEach(record => {
        const docRef = doc(getDailySalesRef(userId), record.id);
        batch.set(docRef, record);
    });
    await batch.commit();
};

export const subscribeToDailySales = (userId: string, callback: (records: DailySalesRecord[]) => void) => {
    const q = query(getDailySalesRef(userId), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DailySalesRecord)));
    });
};
