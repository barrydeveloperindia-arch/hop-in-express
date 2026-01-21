import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import moment from "moment-timezone";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function finalPrice(price: number, vatPercent: number): number {
    return +(price * (1 + vatPercent / 100)).toFixed(2);
}

export function generateInventoryReport(products: { name: string; price: number; vatRate: number; stock: number }[]) {
    return products.map(p => ({
        name: p.name,
        price_gbp: p.price,
        price_with_vat: finalPrice(p.price, p.vatRate),
        stock: p.stock
    }));
}

export function formatTransactionDate(date: string | Date | number) {
    return moment(date).tz("Europe/London").format("YYYY-MM-DD HH:mm:ss");
}

export function getVATByCategory(category: string): number {
    const zeroVatItems = ["Grains", "Dairy", "Bakery", "Essentials"];
    return zeroVatItems.includes(category) ? 0 : 20;
}

export function isExpired(expiryDate: string | Date | undefined): boolean {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
}

export function checkExpiryRisk(product: { name: string; expiryDate?: string }) {
    if (!product.expiryDate) return;
    const diff = (new Date(product.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 7) {
        console.warn(`[EXPIRY] ⚠️ Expiry soon: ${product.name} (${Math.ceil(diff)} days)`);
    }
}

export function checkLowStock(product: { name: string; stock: number }) {
    if (product.stock <= 5) {
        console.warn(`[STOCK] ⚠️ Low stock alert: ${product.name} (${product.stock} units)`);
    }
}
