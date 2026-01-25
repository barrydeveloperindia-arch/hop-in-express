
export type UserRole = 'Owner' | 'Manager' | 'Till Manager' | 'Inventory Staff' | 'Cashier';

export type ContractType = 'Full-time' | 'Part-time' | 'Zero-hour' | 'Contractor';

export type LedgerAccount =
  | 'Sales Revenue'
  | 'Cost of Goods Sold'
  | 'Inventory Asset'
  | 'Accounts Payable'
  | 'Cash in Hand'
  | 'Bank Account'
  | 'VAT Liability'
  | 'Operational Expense'
  | 'Payroll Expense'
  | 'Stock Variance';

export interface LedgerEntry {
  id: string;
  timestamp: string;
  account: LedgerAccount;
  type: 'Debit' | 'Credit';
  amount: number;
  referenceId: string;
  description: string;
  category: 'Sales' | 'Purchase' | 'Inventory' | 'Expense' | 'Payroll' | 'Adjustment';
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  category: string;
  totalSpend: number;
  outstandingBalance: number;
  orderCount: number;
  lastOrderDate?: string;
}

export interface Bill {
  id: string;
  supplierId: string;
  purchaseId: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'Unpaid' | 'Partial' | 'Settled';
  note?: string;
}

export interface VatBandSummary {
  gross: number;
  net: number;
  vat: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  staffId: string;
  staffName: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  vatTotal: number;
  paymentMethod: 'Cash' | 'Card';
  items: {
    id: string;
    name: string;
    brand: string;
    price: number;
    costPrice?: number;
    qty: number;
    vatRate: number;
    sku: string;
  }[];
  vatBreakdown: {
    0: VatBandSummary;
    5: VatBandSummary;
    20: VatBandSummary;
  };
}

export interface Refund {
  id: string;
  timestamp: string;
  staffId: string;
  staffName: string;
  amount: number;
  reason: string;
  originalTransactionId?: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface Purchase {
  id: string;
  date: string;
  supplierId: string;
  invoiceNumber: string;
  amount: number;
  items: string;
  status: 'Received' | 'Pending' | 'Cancelled';
  receiptData?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  userRole: UserRole;
  staffName: string;
  terminalId: string;
  module: ViewType;
  details: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface AdjustmentLog {
  id: string;
  date: string;
  type: 'relative' | 'fixed' | 'audit';
  amount?: number;
  previousStock?: number;
  newStock?: number;
  reason: 'Inward' | 'Sale' | 'Damage' | 'Correction' | 'Return' | 'Price Revision' | 'Metadata Update' | 'Registry Creation' | 'Bulk Action' | 'VAT Change';
  note?: string;
  user?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export type UnitType = 'pcs' | 'kg' | 'g' | 'litre' | 'ml' | 'pack';

export interface InventoryItem {
  id: string;
  barcode: string;
  sku: string;
  name: string;
  brand: string;
  packSize: string;
  unitType: UnitType;
  category: string;
  supplierId: string;
  origin: string;
  shelfLocation?: string;
  stock: number;
  minStock: number;
  costPrice: number;
  price: number; // This is the selling price, which should include VAT if applicable
  vatRate: number; // The VAT rate applied to this item
  status: 'Active' | 'Discontinued' | 'Out of Stock' | 'Audit' | 'UNVERIFIED' | 'VERIFIED' | 'LIVE';
  expiryDate?: string; // Corresponds to expiry_date
  batchNumber?: string;
  logs?: AdjustmentLog[];
  photo?: string;
  photoUrl?: string;
  currency?: string;
  imageUrl?: string; // Corresponds to image_url
  createdAt?: string; // Corresponds to created_at
  lastBuyPrice?: number;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Sick' | 'Holiday' | 'Pending' | 'Half Day';
  clockIn?: string;
  clockOut?: string;
  hoursWorked?: number;
  overtime?: number;
  notes?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  year: string;
}

export interface ExperienceEntry {
  company: string;
  lastSalary: number;
  salarySlip?: string;
}

export interface IdentificationDocs {
  aadhar: { number: string; proof?: string };
  pan: { number: string; proof?: string };
  voterId: { number: string; proof?: string };
  drivingLicense: { number: string; proof?: string };
}

export interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  contractType: ContractType;
  pin: string;
  loginBarcode?: string;
  niNumber: string;
  taxCode: string;
  rightToWork: boolean;
  emergencyContact: string;
  joinedDate: string;
  status: 'Active' | 'Inactive' | 'Pending Approval';
  monthlyRate: number;
  hourlyRate: number;
  dailyRate: number;
  advance: number;
  holidayEntitlement: number;
  accruedHoliday: number;
  photo?: string;
  email?: string; // Link to Firebase Auth for RBAC
  phone?: string;
  address?: string;
  assignedShiftId?: string;
  department?: string;
  pensionEnrolment?: boolean;
  gdprConsent?: boolean;
  hmrcStarterDeclaration?: string;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  idDocuments?: IdentificationDocs;
  startingSalary?: number;
  validUntil?: string;
  holidayTaken?: number;
  holidayRemaining?: number;
}

export type LeaveType = 'Annual' | 'Sick' | 'Unpaid' | 'Compassionate';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRequest {
  id: string;
  staffId: string;
  type: LeaveType;
  startDate: string; // ISO Date YYYY-MM-DD
  endDate: string;   // ISO Date YYYY-MM-DD
  totalDays: number;
  status: LeaveStatus;
  reason?: string;
  approvedBy?: string; // Manager ID
  approvedAt?: string;
  createdAt: string;
}

export type ViewType =
  | 'dashboard'
  | 'sales'
  | 'inventory'
  | 'ai-command'
  | 'purchases'
  | 'financials'
  | 'staff'
  | 'help-support'
  | 'about-us'
  | 'smart-intake'
  | 'expenses'
  | 'suppliers'
  | 'salary'
  | 'sales-ledger'
  | 'support';

export interface SalaryRecord {
  id: string;
  staffId: string;
  employeeName: string;
  month: string;
  payDate: string;
  taxCode: string;
  niNumber: string;
  basePay: number;
  overtimePay: number;
  holidayPay: number;
  sickPay: number;
  totalHours: number;
  totalOvertime: number;
  incomeTax: number;
  nationalInsurance: number;
  pension: number;
  deductions: number;
  grossPay: number;
  totalAmount: number;
  ytdGross: number;
  ytdTax: number;
  ytdNI: number;
  ytdPension: number;
  status: 'Pending' | 'Paid' | 'Cancelled';
  generatedAt: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface SmartIntakeItem {
  name: string;
  brand?: string;
  qty: number;
  costPrice: number;
  price: number;
  category: string;
  shelfLocation: string;
  barcode?: string;
  sku?: string;
  image?: string;
  box_2d?: [number, number, number, number];
}

export interface AIInventoryResult {
  name: string;
  brand?: string;
  qty: number;
  costPrice: number;
  price: number;
  category: string;
  shelfLocation: string;
  barcode?: string;
  sku?: string;
}

export interface AIAttendanceResult {
  employeeName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Late';
  clockIn?: string;
  clockOut?: string;
}

export interface AICommandResult {
  modality: 'INVENTORY' | 'ATTENDANCE' | 'ROLLBACK';
  inventoryItems?: AIInventoryResult[];
  attendanceRecords?: AIAttendanceResult[];
  rollbackParams?: {
    type: 'time' | 'steps';
    value: number; // minutes if time, count if steps
  };
  summary: string;
}

/**
 * System state snapshot for full rollback.
 */
export interface SystemSnapshot {
  id: string;
  timestamp: string;
  description: string;
  inventory: InventoryItem[];
  attendance: AttendanceRecord[];
  transactions: Transaction[];
  ledgerEntries: LedgerEntry[];
  expenses: Expense[];
  purchases: Purchase[];
  bills: Bill[];
  suppliers: Supplier[];
}

export interface DailySalesRecord {
  id: string;
  date: string; // ISO Date YYYY-MM-DD
  dayOfWeek?: string;
  categoryBreakdown: {
    alcohol: number;
    tobacco: number;
    lottery: number;
    drinks: number;
    groceries: number;
    household: number;
    snacks: number;
    paypoint: number;
    news: number;
    other: number;
  };
  totalSales: number;
  cashTaken: number;
  cardTaken: number;
  cashPurchases: number;
  netBalance: number;
  timestamp: string;
}
