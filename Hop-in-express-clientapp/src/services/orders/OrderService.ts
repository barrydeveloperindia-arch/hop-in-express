import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, OrderItem, OrderStatus } from '../checkout/CheckoutService';

// Reusing Order type from CheckoutService
export { Order, OrderItem, OrderStatus };

const SHOP_ID = 'hop-in-express-';

export class OrderService {
    /**
     * Fetch orders for a given phone number.
     * This is a simple implementation for the "Guest" system.
     */
    static async getMyOrders(phone: string): Promise<Order[]> {
        if (!phone) return [];

        try {
            const ordersRef = collection(db, 'shops', SHOP_ID, 'orders');
            // Index might be needed for this query: shopId + customer.phone + createdAt
            const q = query(
                ordersRef,
                where('customer.phone', '==', phone),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        } catch (error) {
            console.error("❌ Failed to fetch orders:", error);
            // Fallback for when index is missing or other errors
            return [];
        }
    }
}
