import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { ProductDetailTemplate } from '../../src/components/templates/ProductDetailTemplate';
import { subscribeToLiveInventory, Product } from '../../src/lib/firestore'; // Using existing fetcher for now
import tw from '../../src/lib/tw';

export default function ProductScreen() {
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [inventory, setInventory] = useState<Product[]>([]);

    useEffect(() => {
        // In real app, we'd fetch single doc. Here we filter from subscription for MVP speed.
        const unsubscribe = subscribeToLiveInventory((items) => {
            setInventory(items);
            const found = items.find(p => p.id === id);
            setProduct(found || null);
        });
        return () => unsubscribe();
    }, [id]);

    if (!product) {
        return (
            <View style={tw`flex-1 items-center justify-center bg-white`}>
                <ActivityIndicator size="large" color="#0C831F" />
            </View>
        );
    }

    return (
        <ProductDetailTemplate
            product={product}
            similarProducts={inventory.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5)}
        />
    );
}
