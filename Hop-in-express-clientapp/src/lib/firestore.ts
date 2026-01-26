import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export type Product = {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    memberPrice?: number; // Optional in DB, computed often
    image: string;
    stock: number;
    tags?: string[];
    size?: string;
};

// Config: The Shop ID you are connecting to
const SHOP_ID = 'hop-in-express-'; // From VITE_USER_ID

export const subscribeToLiveInventory = (callback: (products: Product[]) => void) => {
    const inventoryRef = collection(db, 'shops', SHOP_ID, 'inventory');

    // Subscribe to all items
    return onSnapshot(inventoryRef, (snapshot) => {
        const items = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || 'Unknown Item',
                brand: data.brand || 'Generic',
                category: data.category || 'Pantry',
                price: parseFloat(data.price) || 0,
                memberPrice: parseFloat(data.offerPrice) || (parseFloat(data.price) * 0.9), // Default 10% off if no offer
                image: data.image || data.imageUrl || 'https://images.pexels.com/photos/1666067/pexels-photo-1666067.jpeg?auto=compress&cs=tinysrgb&w=600', // Box placeholder
                stock: data.stock || 0,
                tags: data.tags || [],
                size: data.unit || '1 unit'
            } as Product;
        });
        callback(items);
    });
};
