import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { ProductDetailTemplate } from '../../src/components/templates/ProductDetailTemplate';
import { useInventory } from '../../src/hooks/useInventory';
import { Product } from '../../src/lib/firestore';
import tw from '../../src/lib/tw';

export default function ProductScreen() {
    const { id } = useLocalSearchParams();
    const { inventory, loading } = useInventory();
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (!loading && inventory.length > 0) {
            const found = inventory.find(p => p.id === id);
            setProduct(found || null);
        }
    }, [id, inventory, loading]);

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
