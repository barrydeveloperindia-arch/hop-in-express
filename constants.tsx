
import { StaffMember, InventoryItem, Supplier } from './types';

export const SHOP_INFO = {
  name: 'HOP IN EXPRESS',
  address: '37 HIGH STREET, EASTLEIGH, SO50 5LG UK',
  whatsapp: '+44-7453313017',
  currency: '£',
  taxType: 'VAT',
  taxRate: 20
};

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'Bestway Wholesale', contactName: 'John Doe', phone: '020 8453 1234', email: 'orders@bestway.co.uk', category: 'General Wholesale', totalSpend: 12450.50, outstandingBalance: 0, orderCount: 12 },
  { id: 'sup-2', name: 'Booker Wholesale', contactName: 'Jane Smith', phone: '01933 371000', email: 'support@booker.co.uk', category: 'General Wholesale', totalSpend: 8900.20, outstandingBalance: 0, orderCount: 8 }
];

export const INITIAL_CATEGORIES: string[] = [
  'Alcohols',
  'Chiller',
  'Drinks',
  'Groceries',
  'Household',
  'Snacks',
  'Tobacco',
  'Pet',
  'Alternative',
  'Unclassified'
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'p-1',
    name: 'Basmati Rice',
    brand: 'A',
    packSize: '5kg',
    unitType: 'pack',
    category: 'Alternative',
    price: 1499,
    stock: 45,
    costPrice: 1124,
    lastBuyPrice: 1124,
    vatRate: 0,
    barcode: "5040000000000",
    sku: "HOP-GRO-101",
    minStock: 10,
    status: 'Active',
    origin: 'India',
    supplierId: 'sup-1',
    shelfLocation: 'Aisle 2, Bay B'
  }
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'sales', label: 'Daily Sales', icon: '🛒' },
  { id: 'inventory', label: 'Inventory Data', icon: '📦' },
  { id: 'ai-command', label: 'AI Command', icon: '🧠' },
  { id: 'purchases', label: 'Procurement', icon: '📥' },
  { id: 'staff', label: 'Staff Management', icon: '👥' },
  { id: 'financials', label: 'Master Ledger', icon: '📕' },
  { id: 'help-support', label: 'Help & Support', icon: '❓' },
  { id: 'about-us', label: 'About Us', icon: '🏪' },
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: '1',
    name: 'Bharat Anand',
    role: 'Owner',
    contractType: 'Full-time',
    pin: '1111',
    loginBarcode: 'OWNER01',
    niNumber: 'QQ123456A',
    taxCode: '1257L',
    rightToWork: true,
    emergencyContact: 'Jane Doe - 07700900123',
    joinedDate: '2025-01-01',
    status: 'Active',
    monthlyRate: 0,
    hourlyRate: 0,
    dailyRate: 1500,
    advance: 0,
    holidayEntitlement: 28,
    accruedHoliday: 0,
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: '2',
    name: 'Sarah Jones',
    role: 'Manager',
    contractType: 'Full-time',
    pin: '2222',
    loginBarcode: 'MGR01',
    niNumber: 'AB123456C',
    taxCode: '1257L',
    rightToWork: true,
    emergencyContact: 'Mike Jones - 07700900456',
    joinedDate: '2025-02-15',
    status: 'Active',
    monthlyRate: 2500,
    hourlyRate: 0,
    dailyRate: 0,
    advance: 0,
    holidayEntitlement: 28,
    accruedHoliday: 2,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: '3',
    name: 'David Smith',
    role: 'Cashier',
    contractType: 'Part-time',
    pin: '3333',
    loginBarcode: 'CSH01',
    niNumber: 'CD123456D',
    taxCode: '1257L',
    rightToWork: true,
    emergencyContact: 'Emma Smith - 07700900789',
    joinedDate: '2025-03-01',
    status: 'Active',
    monthlyRate: 0,
    hourlyRate: 12.50,
    dailyRate: 0,
    advance: 50,
    holidayEntitlement: 14,
    accruedHoliday: 0,
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];
