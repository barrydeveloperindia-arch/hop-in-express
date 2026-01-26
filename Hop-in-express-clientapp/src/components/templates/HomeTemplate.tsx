import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import tw from '../../lib/tw';
import { Header } from '../organisms/Header';
import { CategoryGrid } from '../organisms/CategoryGrid';
import { ProductCard } from '../organisms/ProductCard';
import { NavigationDock } from '../organisms/NavigationDock';
import { ImpulseRail } from '../organisms/ImpulseRail';
import { RecipeCard } from '../organisms/RecipeCard'; // New
import { Typography } from '../atoms/Typography';
import { Product } from '../../lib/firestore';
import { COLORS } from '../../lib/theme';
import { StatusBar } from 'expo-status-bar';
import { RecipeService } from '../../services/recipe/RecipeService.v1'; // New
import { useCart } from '../../context/CartContext';

interface HomeTemplateProps {
    inventory: Product[];
}

export const HomeTemplate: React.FC<HomeTemplateProps> = ({ inventory }) => {
    // Global Cart State
    const { getItemQty, addToCart, removeFromCart } = useCart();

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
                            qty={getItemQty(product.id)}
                            onAdd={() => addToCart(product.id)}
                            onRemove={() => removeFromCart(product.id)}
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

                {/* 2. Recipe Rail (One-Tap Cook) - NEW */}
                <View style={tw`pl-4 mb-6`}>
                    <Typography variant="h3" style={tw`mb-3 text-gray-800`}>Cook Tonight 👨‍🍳</Typography>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {RecipeService.getSeasonalRecipes().map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                    </ScrollView>
                </View>

                {/* 3. Category Grid (First Fold) */}
                <CategoryGrid />

                {/* 4. Ready Meals (New!) */}
                <Rail
                    title="Ready Meals 🍲"
                    items={inventory.filter(i => {
                        const cat = String(i.category || '').toLowerCase();
                        // Allow 'Ready Meals' category explicitly, plus Chiller/Frozen
                        const isCategoryMatch = ['chiller', 'frozen', 'ready meals', 'readymeals'].some(c => cat.includes(c));

                        // If it's explicitly a Ready Meal category, include it. 
                        // If it's generic Chiller/Frozen, filter by name keywords OR just include if stock > 0 (permissive)
                        // Using permissive logic: If category matches and stock > 0, show it.
                        // We also keep the keywords just in case we want to prioritize highlighting them, 
                        // but strictly speaking the previous logic (regex || stock>0) was effectively "All Stocked Items in Category".
                        // So we stick to "All Stocked Items in these Categories".
                        return isCategoryMatch && i.stock > 0;
                    }).slice(0, 10)}
                />

                {/* 5. Hero Banner Placeholder */}
                <View style={tw`mx-4 h-36 bg-indigo-50 rounded-xl mb-8 items-center justify-center border border-indigo-100`}>
                    <Typography variant="h3" style={{ color: COLORS.primary }}>Banner: 50% OFF First Order</Typography>
                </View>

                {/* 6. Rails */}
                <Rail title="Must Haves in Eastleigh" items={inventory} />
                <Rail title="Fresh Vegetables" items={inventory.filter(i => i.category === 'Fresh' || i.name.includes('Veg'))} />
                <Rail title="Snacks Corner" items={inventory.filter(i => i.category === 'Snacks' || i.name.includes('Chip'))} />

            </ScrollView>

            <NavigationDock />
        </View>
    );
};
