import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import tw from '../../lib/tw';
import { Header } from '../organisms/Header';
import { CategoryGrid } from '../organisms/CategoryGrid';
import { ProductCard } from '../organisms/ProductCard';
import { NavigationDock } from '../organisms/NavigationDock';
import { ImpulseRail } from '../organisms/ImpulseRail';
import { Typography } from '../atoms/Typography';
import { Product } from '../../lib/firestore';
import { COLORS } from '../../lib/theme';
import { StatusBar } from 'expo-status-bar';

interface HomeTemplateProps {
    inventory: Product[];
}

export const HomeTemplate: React.FC<HomeTemplateProps> = ({ inventory }) => {
    // Simulated Cart State for the Add Buttons
    const [cart, setCart] = useState<Record<string, number>>({});

    const handleAdd = (id: string) => {
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const handleRemove = (id: string) => {
        setCart(prev => {
            const next = { ...prev };
            if (next[id] > 1) next[id]--;
            else delete next[id];
            return next;
        });
    };

    const Rail = ({ title, items }: { title: string, items: Product[] }) => (
        <View style={tw`mb-8`}>
            <View style={tw`px-4 flex-row justify-between items-end mb-4`}>
                <Typography variant="h3">{title}</Typography>
                <Typography variant="tiny" color={COLORS.primary}>See all</Typography>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tw`px-4`}
                decelerationRate="fast"
            >
                {items.slice(0, 6).map(product => (
                    <View key={product.id} style={tw`mr-3`}>
                        <ProductCard
                            product={product}
                            qty={cart[product.id] || 0}
                            onAdd={() => handleAdd(product.id)}
                            onRemove={() => handleRemove(product.id)}
                        />
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <View style={tw`flex-1 bg-gray-50`}>
            <StatusBar style="dark" />
            <Header />

            <ScrollView contentContainerStyle={tw`pb-32 pt-4`}>
                {/* 1. Impulse Rail (Night Shop) */}
                <ImpulseRail />

                {/* 2. Category Grid (First Fold) */}
                <CategoryGrid />

                {/* 3. Hero Banner Placeholder */}
                <View style={tw`mx-4 h-36 bg-green-100 rounded-xl mb-8 items-center justify-center border border-green-200 border-dashed`}>
                    <Typography variant="h3" color={COLORS.primary}>Banner: 50% OFF First Order</Typography>
                </View>

                {/* 4. Rails */}
                <Rail title="Must Haves in Eastleigh" items={inventory} />
                <Rail title="Fresh Vegetables" items={inventory.filter(i => i.category === 'Fresh' || i.name.includes('Veg'))} />
                <Rail title="Snacks Corner" items={inventory.filter(i => i.category === 'Snacks' || i.name.includes('Chip'))} />

            </ScrollView>

            <NavigationDock />
        </View>
    );
};
