import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product } from '../../lib/firestore';

export type OrderItem = Product & {
    qty: number;
    effectivePrice: number;
};

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type Order = {
    id?: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    status: OrderStatus;
    paymentMethod: string;
    notes?: string;
    customer: {
        name: string;
        phone: string;
        address: string;
    };
    createdAt: any;
    shopId: string;
};

const SHOP_ID = 'hop-in-express-';

export class CheckoutService {
    /**
     * Places a new order in the 'orders' collection for the shop.
     */
    static async placeOrder(
        items: OrderItem[],
        totals: { subtotal: number; deliveryFee: number; total: number },
        customer: { name: string; phone: string; address: string },
        paymentMethod: string,
        notes?: string
    ): Promise<string> {
        try {
            const orderData: Order = {
                items,
                ...totals,
                customer,
                status: 'pending',
                paymentMethod,
                notes,
                createdAt: serverTimestamp(),
                shopId: SHOP_ID
            };

            const ordersRef = collection(db, 'shops', SHOP_ID, 'orders');
            const docRef = await addDoc(ordersRef, orderData);

            console.log("✅ Order Placed:", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("❌ Order Failed:", error);
            throw error;
        }
    }
}
