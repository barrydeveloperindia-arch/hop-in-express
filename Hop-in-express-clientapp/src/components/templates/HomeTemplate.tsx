import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
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

import { FlashList } from '@shopify/flash-list';

interface HomeTemplateProps {
    inventory: Product[];
}

export const HomeTemplate: React.FC<HomeTemplateProps> = ({ inventory }) => {
    // Global Cart State
    const { getItemQty, addToCart, removeFromCart } = useCart();

    const handleAddRecipe = (recipe: any) => {
        Alert.alert("Recipe Added", `Added ingredients for ${recipe.name} to your bag (Demo).`);
    };

    // Optimized Rail using FlashList for 60fps scrolling
    const Rail = ({ title, items }: { title: string, items: Product[] }) => (
        <View style={tw`mb-8`}>
            <View style={tw`px-4 flex-row justify-between items-end mb-4`}>
                <Typography variant="h3" style={tw`text-lg tracking-tight font-black text-gray-900`}>{title}</Typography>
                <Typography variant="tiny" color={COLORS.primary} style={tw`font-bold`}>See all</Typography>
            </View>
            <View style={{ height: 260 }}>
                <FlashList
                    data={items.slice(0, 10)}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            qty={getItemQty(item.id)}
                            onAdd={() => addToCart(item.id)}
                            onRemove={() => removeFromCart(item.id)}
                        />
                    )}
                    estimatedItemSize={128}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                />
            </View>
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
                    <Typography variant="h3" style={tw`mb-3 text-gray-800 text-lg font-black`}>Cook Tonight 👨‍🍳</Typography>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {RecipeService.getSeasonalRecipes().map(recipe => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                onAdd={() => handleAddRecipe(recipe)}
                            />
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
                <View style={[tw`mx-4 h-40 bg-indigo-600 rounded-2xl mb-8 items-start justify-center px-6 relative overflow-hidden shadow-lg shadow-indigo-200`]}>
                    {/* Background Pattern */}
                    <View style={tw`absolute right-0 top-0 bottom-0 w-32 bg-indigo-500 transform rotate-12 translate-x-10 scale-150 rounded-full opacity-50`} />

                    <View style={tw`max-w-[70%]`}>
                        <Typography variant="h2" color="#FFF" style={tw`text-2xl mb-2 font-black`}>50% OFF</Typography>
                        <Typography variant="body" color="#E0E7FF" style={tw`mb-4 font-medium`}>On your first order above £20. Use code: WELCOME50</Typography>
                        <View style={tw`bg-white px-4 py-2 rounded-lg self-start`}>
                            <Typography variant="tiny" style={tw`font-bold text-indigo-700`}>Claim Offer</Typography>
                        </View>
                    </View>
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
