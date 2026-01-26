import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import tw from '../../lib/tw';
import { AddToCartButton } from '../molecules/AddToCartButton';
import { Product } from '../../lib/firestore';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';

export const ProductCard = ({ product }: { product: Product }) => {
    const router = useRouter();
    const { quantities, addToCart, removeFromCart } = useCart();

    const count = quantities[product.id] || 0;
    const memberPrice = product.memberPrice ?? product.price;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/product/${product.id}`)}
            style={tw`w-36 h-60 mr-4 relative`}
        >
            <View style={tw`w-full h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm justify-between p-3`}>

                {/* Image Section */}
                <View style={tw`w-full h-28 bg-white rounded-xl overflow-hidden mb-2 relative items-center justify-center`}>
                    <Image
                        source={{ uri: product.image }}
                        style={tw`w-full h-full`}
                        resizeMode="contain"
                    />
                    {/* Tags */}
                    <View style={tw`absolute top-1 left-1 flex-row gap-1`}>
                        {product.tags?.includes('Veg') && (
                            <View style={tw`w-3 h-3 rounded-full bg-green-500 border border-white shadow`} />
                        )}
                        {product.tags?.includes('Non-Veg') && (
                            <View style={tw`w-3 h-3 rounded-full bg-red-500 border border-white shadow`} />
                        )}
                        {product.tags?.includes('Frozen') && (
                            <View style={tw`w-3 h-3 rounded-full bg-blue-500 border border-white shadow`} />
                        )}
                    </View>
                </View>

                {/* Info Section */}
                <View style={tw`flex-1`}>
                    {/* Time Badge - Blinkit Style */}
                    <View style={tw`bg-gray-100 self-start px-1.5 py-0.5 roundedElement mb-1.5 rounded-md`}>
                        <Text style={tw`text-[9px] font-bold text-gray-600 uppercase`}>12 MINS</Text>
                    </View>

                    <Text style={tw`text-gray-800 font-semibold text-xs leading-4 mb-0.5`} numberOfLines={2}>{product.name}</Text>
                    <Text style={tw`text-gray-400 text-[10px] mb-2`}>{product.size}</Text>

                    <View style={tw`flex-row items-center justify-between mt-auto`}>
                        <View>
                            <Text style={tw`text-black font-bold text-xs`}>£{memberPrice.toFixed(2)}</Text>
                            {product.price > memberPrice && (
                                <Text style={tw`text-gray-400 text-[10px] line-through`}>£{product.price.toFixed(2)}</Text>
                            )}
                        </View>

                        {/* Stepper Button */}
                        <View style={tw`absolute -right-1 -bottom-1`}>
                            <AddToCartButton
                                count={count}
                                onIncrement={() => addToCart(product.id)}
                                onDecrement={() => removeFromCart(product.id)}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};
