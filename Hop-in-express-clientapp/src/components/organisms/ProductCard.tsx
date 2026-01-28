import React from 'react';
import { View, Image, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { AddToCartButton } from '../molecules/AddToCartButton';
import { Product } from '../../lib/firestore'; // Using shared type
import { COLORS } from '../../lib/theme';
import { Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 3 - 16; // 3 Column Grid Logic

interface ProductCardProps {
    product: Product;
    qty?: number;
    onAdd: () => void;
    onRemove: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    qty = 0,
    onAdd,
    onRemove
}) => {
    const router = useRouter();

    // Discount Calculation logic
    const discount = product.memberPrice && product.memberPrice < product.price
        ? Math.round(((product.price - product.memberPrice) / product.price) * 100)
        : 0;

    const handlePress = () => {
        router.push(`/product/${product.id}` as any);
    };

    return (
        <View style={tw`mr-3 mb-2`}>
            <Pressable
                onPress={handlePress}
                style={({ pressed }) => [
                    tw`bg-white rounded-xl overflow-hidden border border-gray-100`, // Standard border
                    {
                        width: 120, // Slightly wider for better breathing room
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05, // Soft shadow
                        shadowRadius: 8,
                        elevation: 2, // Android soft shadow
                    }
                ]}
            >
                {/* Image Area - Clean & Clear */}
                <View style={tw`h-32 w-full items-center justify-center p-3 bg-white relative`}>
                    <Image
                        source={{ uri: product.image }}
                        style={tw`w-24 h-24`}
                        resizeMode="contain"
                    />

                    {/* Discount Badge - Modern Pill */}
                    {discount > 0 && (
                        <View style={tw`absolute top-2 left-2 bg-blue-600 px-1.5 py-0.5 rounded-[4px]`}>
                            <Typography variant="tiny" color="#FFF" style={tw`font-black text-[9px]`}>{discount}% OFF</Typography>
                        </View>
                    )}
                </View>

                {/* Info Area - Dense & Data Rich */}
                <View style={tw`px-2.5 pb-3 pt-1`}>
                    {/* Delivery Time Pill */}
                    <View style={tw`flex-row items-center bg-gray-50 self-start px-1.5 py-0.5 rounded-[4px] mb-1.5 border border-gray-100`}>
                        <Clock size={9} color="#6B7280" />
                        <Typography variant="tiny" style={tw`ml-1 text-[9px] font-bold text-gray-500`}>12 MINS</Typography>
                    </View>

                    {/* Title */}
                    <Typography variant="body" numberOfLines={2} style={tw`text-[12px] font-semibold leading-4 h-8 text-gray-800 mb-1`}>
                        {product.name}
                    </Typography>

                    {/* Size/Weight */}
                    <Typography variant="caption" style={tw`text-[11px] text-gray-400 mb-2.5 font-medium`}>{product.size}</Typography>

                    {/* Price & Action */}
                    <View style={tw`flex-row justify-between items-center mt-1`}>
                        <View>
                            {/* Member/Discount Price */}
                            <Typography variant="price" style={tw`text-[13px] text-gray-900 font-bold`}>
                                £{product.memberPrice ? product.memberPrice.toFixed(2) : product.price.toFixed(2)}
                            </Typography>

                            {/* Strike Price */}
                            {product.memberPrice && (
                                <Typography variant="tiny" style={tw`line-through text-gray-400 text-[10px]`}>
                                    £{product.price.toFixed(2)}
                                </Typography>
                            )}
                        </View>

                        {/* Button Wrapper */}
                        <View style={tw`ml-1`}>
                            <AddToCartButton
                                onIncrement={onAdd}
                                onDecrement={onRemove}
                                count={qty} // Actually passing real qty
                            />
                        </View>
                    </View>
                </View>
            </Pressable>
        </View>
    );
};
