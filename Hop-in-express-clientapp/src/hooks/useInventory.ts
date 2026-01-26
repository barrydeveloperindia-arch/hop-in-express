import { useEffect, useState } from 'react';
import { subscribeToLiveInventory, Product } from '../lib/firestore';

export const useInventory = () => {
    const [inventory, setInventory] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to real-time updates from 'shops/hop-in-express-/inventory'
        const unsubscribe = subscribeToLiveInventory((products) => {
            setInventory(products);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { inventory, loading };
};
