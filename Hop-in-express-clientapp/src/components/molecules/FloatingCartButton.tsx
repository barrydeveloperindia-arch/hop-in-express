import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Animated, Image } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { ShoppingBag, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../../lib/theme';
import { useCart } from '../../context/CartContext';
import { useRouter, usePathname } from 'expo-router';
import { useInventory } from '../../hooks/useInventory';

export const FloatingCartButton = () => {
    const { quantities } = useCart();
    const { inventory } = useInventory();
    const router = useRouter();
    const pathname = usePathname();

    const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

    // Don't show if empty or already on cart screen
    if (totalItems === 0 || pathname === '/cart') return null;

    // Calculate basic total
    const estimatedTotal = inventory.reduce((acc: number, item: any) => {
        const qty = quantities[item.id] || 0;
        if (qty === 0) return acc;

        const price = item.memberPrice ?? item.price;
        return acc + (price * qty);
    }, 0);

    const FREE_THRESHOLD = 15.0;
    const remainingForFree = Math.max(0, FREE_THRESHOLD - estimatedTotal);
    const progress = Math.min(100, (estimatedTotal / FREE_THRESHOLD) * 100);

    return (
        <View style={tw`absolute bottom-4 left-4 right-4 z-40`}>
            {/* Gamification Bar */}
            {remainingForFree > 0 ? (
                <View style={tw`bg-white rounded-t-xl px-4 py-2 border-t border-x border-gray-100 shadow-sm flex-row items-center justify-center mb-[-10px] pb-4 z-0`}>
                    <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/2972/2972528.png" }} style={tw`w-4 h-4 mr-2`} />
                    <Typography variant="tiny" style={tw`text-gray-600`}>
                        Add <Typography variant="tiny" style={tw`text-green-700 font-bold`}>£{remainingForFree.toFixed(2)}</Typography> for FREE delivery
                    </Typography>
                </View>
            ) : (
                <View style={tw`bg-green-50 rounded-t-xl px-4 py-2 border-t border-x border-green-100 flex-row items-center justify-center mb-[-10px] pb-4 z-0`}>
                    <Typography variant="tiny" style={tw`text-green-800 font-bold`}>🎉 FREE Delivery Unlocked!</Typography>
                </View>
            )}

            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push('/cart')}
                style={tw`bg-green-600 rounded-xl p-3 flex-row items-center justify-between shadow-xl border-t border-green-500 z-10`}
            >
                <View style={tw`flex-row items-center`}>
                    <View style={tw`bg-green-800/50 p-2 rounded-lg mr-3`}>
                        <ShoppingBag size={20} color="#FFF" />
                    </View>
                    <View>
                        <Typography variant="caption" color="#FFF" style={tw`font-bold`}>{totalItems} items</Typography>
                        <Typography variant="h3" color="#FFF" style={tw`leading-tight`}>£{estimatedTotal.toFixed(2)}</Typography>
                    </View>
                </View>

                <View style={tw`flex-row items-center`}>
                    <Typography variant="body" color="#FFF" style={tw`font-medium mr-1`}>View Cart</Typography>
                    <ChevronRight size={16} color="#FFF" />
                </View>
            </TouchableOpacity>
        </View>
    );
};
