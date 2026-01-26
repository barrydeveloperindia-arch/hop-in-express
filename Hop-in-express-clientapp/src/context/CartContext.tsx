import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CartContextType = {
    quantities: Record<string, number>;
    addToCart: (id: string) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    getItemQty: (id: string) => number;
    totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    // Persist Cart
    useEffect(() => {
        AsyncStorage.getItem('hopin_cart').then(json => {
            if (json) {
                try {
                    setQuantities(JSON.parse(json));
                } catch (e) {
                    console.error("Failed to parse cart", e);
                }
            }
        });
    }, []);

    useEffect(() => {
        if (Object.keys(quantities).length > 0) {
            AsyncStorage.setItem('hopin_cart', JSON.stringify(quantities));
        }
    }, [quantities]);

    const addToCart = (id: string) => {
        setQuantities(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + 1
        }));
    };

    const removeFromCart = (id: string) => {
        setQuantities(prev => {
            const next = { ...prev };
            if (next[id] > 1) {
                next[id]--;
            } else {
                delete next[id];
            }
            return next;
        });
    };

    const clearCart = () => {
        setQuantities({});
        AsyncStorage.removeItem('hopin_cart');
    };

    const getItemQty = (id: string) => quantities[id] || 0;

    const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

    return (
        <CartContext.Provider value={{ quantities, addToCart, removeFromCart, clearCart, getItemQty, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
