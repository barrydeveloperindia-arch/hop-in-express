import React from 'react';
import { View, Image, TouchableOpacity, Dimensions } from 'react-native';
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

    // Discount Calculation logic (simulated for now if not in DB)
    const discount = product.memberPrice && product.memberPrice < product.price
        ? Math.round(((product.price - product.memberPrice) / product.price) * 100)
        : 0;

    const handlePress = () => {
        router.push(`/product/${product.id}`);
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            style={[tw`bg-white rounded-xl overflow-hidden border border-gray-100 mb-3 shadow-sm`, { width: 108 }]}
        >
            {/* Image Area */}
            <View style={tw`h-28 w-full items-center justify-center p-2 relative bg-gray-50`}>
                <Image
                    source={{ uri: product.image }}
                    style={tw`w-20 h-20`}
                    resizeMode="contain"
                />
                {discount > 0 && (
                    <View style={{ position: 'absolute', top: 0, left: 0, backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2, borderBottomRightRadius: 8 }}>
                        <Typography variant="tiny" color="#FFF" style={tw`font-bold`}>{discount}% OFF</Typography>
                    </View>
                )}
            </View>

            {/* Info Area */}
            <View style={tw`px-2 pb-3`}>
                {/* Delivery Time */}
                <View style={tw`flex-row items-center self-start px-1.5 py-0.5 roundedElement mb-1.5 overflow-hidden rounded bg-gray-100`}>
                    <Clock size={8} color="#9CA3AF" />
                    <Typography variant="tiny" style={tw`ml-1 text-[8px] font-bold text-gray-500`}>12 MINS</Typography>
                </View>

                {/* Title */}
                <Typography variant="body" numberOfLines={2} style={tw`text-[11px] font-medium leading-4 h-8 mb-1 text-gray-900`}>
                    {product.name}
                </Typography>

                {/* Size */}
                <Typography variant="caption" style={tw`text-[10px] mb-2 text-gray-400`}>{product.size}</Typography>

                {/* Price + Action Row */}
                <View style={tw`flex-row justify-between items-end mt-auto`}>
                    <View>
                        <Typography variant="price" style={tw`text-xs text-gray-900`}>£{product.memberPrice ? product.memberPrice.toFixed(2) : product.price.toFixed(2)}</Typography>
                        {product.memberPrice && (
                            <Typography variant="tiny" style={tw`line-through text-gray-400`}>£{product.price.toFixed(2)}</Typography>
                        )}
                    </View>

                    {/* Compact Add Button */}
                    <View style={tw`scale-90 origin-bottom-right`}>
                        <AddToCartButton
                            count={qty}
                            onIncrement={onAdd}
                            onDecrement={onRemove}
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};
