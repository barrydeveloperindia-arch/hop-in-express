import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import tw from '../../lib/tw';
import { BlurView } from 'expo-blur';
import { Plus } from 'lucide-react-native';
import { Product } from '../../lib/mockInventory';
import { useRouter } from 'expo-router';

export const ProductCard = ({ product }: { product: Product }) => {
    const router = useRouter();

    // Calculate Savings logic
    const savings = Math.round(((product.price - product.memberPrice) / product.price) * 100);

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/product/${product.id}`)}
            style={tw`w-36 h-56 mr-4 relative`}
        >
            <View style={tw`w-full h-full bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-lg justify-between p-3`}>

                {/* Image Section */}
                <View style={tw`w-full h-24 bg-black rounded-2xl overflow-hidden mb-2 relative`}>
                    <Image
                        source={{ uri: product.image }}
                        style={tw`w-full h-full opacity-90`}
                        resizeMode="cover"
                    />
                    {/* Tags */}
                    <View style={tw`absolute top-1 left-1 flex-row gap-1`}>
                        {product.tags.includes('Veg') && (
                            <View style={tw`w-3 h-3 rounded-full bg-green-500 border border-white shadow`} />
                        )}
                        {product.tags.includes('Frozen') && (
                            <View style={tw`w-3 h-3 rounded-full bg-blue-500 border border-white shadow`} />
                        )}
                    </View>
                </View>

                {/* Info Section */}
                <View>
                    <Text style={tw`text-white font-medium text-xs leading-none mb-1`} numberOfLines={2}>{product.name}</Text>
                    <Text style={tw`text-zinc-500 text-[10px] mb-2`}>{product.size}</Text>

                    {/* Pricing */}
                    <View style={tw`flex-row items-end gap-1 mb-1`}>
                        <Text style={tw`text-indigo-400 font-bold text-sm`}>£{product.memberPrice.toFixed(2)}</Text>
                        <Text style={tw`text-zinc-600 text-[10px] line-through mb-[2px]`}>£{product.price.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Add Button */}
                <TouchableOpacity style={tw`absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/10 items-center justify-center border border-white/20 active:bg-indigo-600`}>
                    <Plus size={16} color="#FFF" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};
