import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { AddToCartButton } from '../molecules/AddToCartButton';
import { Product } from '../../lib/firestore';
import { COLORS } from '../../lib/theme';
import { Clock, ShieldCheck, Truck, ChevronLeft, Share2 } from 'lucide-react-native';
import { PricingService } from '../../services/pricing/PricingService.v1';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface ProductDetailTemplateProps {
    product: Product;
    similarProducts: Product[];
}

export const ProductDetailTemplate: React.FC<ProductDetailTemplateProps> = ({
    product,
    similarProducts
}) => {
    const router = useRouter();
    const [qty, setQty] = useState(0);
    const [deliveryFee, setDeliveryFee] = useState(0);

    useEffect(() => {
        // Calculate dynamic fee based on this single item being in cart (simulation)
        const fee = PricingService.calculateDeliveryFee(product.price);
        setDeliveryFee(fee);
    }, [product]);

    return (
        <View style={tw`flex-1 bg-white`}>
            <StatusBar style="dark" />

            {/* Nav Header */}
            <View style={tw`flex-row justify-between items-center px-4 pt-14 pb-4 bg-white z-10`}>
                <TouchableOpacity onPress={() => router.back()} style={tw`p-2 bg-gray-50 rounded-full`}>
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={tw`p-2 bg-gray-50 rounded-full`}>
                    <Share2 size={20} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={tw`pb-32`}>
                {/* Hero Image */}
                <View style={tw`w-full h-72 items-center justify-center bg-white mb-6`}>
                    <Image
                        source={{ uri: product.image }}
                        style={{ width: width * 0.8, height: width * 0.8 }}
                        resizeMode="contain"
                    />
                </View>

                {/* Main Info */}
                <View style={tw`px-4 mb-6`}>
                    <View style={tw`flex-row items-center mb-2`}>
                        <View style={tw`bg-green-100 px-2 py-1 rounded flex-row items-center self-start`}>
                            <Clock size={12} color={COLORS.primary} />
                            <Typography variant="tiny" style={tw`ml-1 font-bold text-green-800`}>12 MINS</Typography>
                        </View>
                    </View>

                    <Typography variant="h1" style={tw`mb-1`}>{product.name}</Typography>
                    <Typography variant="body" color={COLORS.textSub} style={tw`mb-4`}>{product.size}</Typography>

                    <View style={tw`flex-row items-center justify-between`}>
                        <View>
                            <View style={tw`flex-row items-end`}>
                                <Typography variant="h2">£{product.price.toFixed(2)}</Typography>
                                {product.memberPrice && (
                                    <Typography variant="body" style={tw`ml-2 text-gray-400 line-through bottom-1`}>
                                        £{(product.price * 1.2).toFixed(2)}
                                    </Typography>
                                )}
                            </View>
                            <Typography variant="tiny" color={COLORS.textSub}>(Inclusive of all taxes)</Typography>
                        </View>

                        <View style={tw`scale-125 origin-right`}>
                            <AddToCartButton
                                count={qty}
                                onIncrement={() => setQty(q => q + 1)}
                                onDecrement={() => setQty(q => q - 1)}
                            />
                        </View>
                    </View>
                </View>

                {/* Trust/Delivery Logic */}
                <View style={tw`mx-4 bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6`}>
                    <View style={tw`flex-row items-center mb-2`}>
                        <Truck size={18} color={COLORS.primary} />
                        <Typography variant="h3" style={tw`ml-2 text-sm`}>Delivery Partner Fee: £{deliveryFee.toFixed(2)}</Typography>
                    </View>
                    <Typography variant="caption" style={tw`text-blue-800`}>
                        {deliveryFee === 0
                            ? "✨ You've unlocked FREE delivery!"
                            : `Add £${(15 - product.price).toFixed(2)} more for FREE delivery.`}
                    </Typography>
                </View>

                {/* "Why buy this?" */}
                <View style={tw`px-4 mb-8`}>
                    <Typography variant="h3" style={tw`mb-3`}>Product Details</Typography>
                    <View style={tw`border-l-2 border-gray-200 pl-4`}>
                        <Typography variant="body" color={COLORS.textSub}>
                            Sourced directly from local partners in Eastleigh. Freshness guaranteed.
                        </Typography>
                        <View style={tw`flex-row items-center mt-2`}>
                            <ShieldCheck size={16} color={COLORS.success} />
                            <Typography variant="caption" style={tw`ml-1 text-green-700`}>Quality Checked</Typography>
                        </View>
                    </View>
                </View>

                {/* Similar Products Placeholder */}
                <View style={tw`px-4`}>
                    <Typography variant="h3" style={tw`mb-3`}>Similar Items</Typography>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {similarProducts.map(p => (
                            <View key={p.id} style={tw`mr-3 w-28 bg-gray-50 h-32 rounded-lg items-center justify-center border border-gray-100`}>
                                <Image source={{ uri: p.image }} style={tw`w-12 h-12 mb-2`} />
                                <Typography variant="caption" numberOfLines={1}>{p.name}</Typography>
                            </View>
                        ))}
                    </ScrollView>
                </View>

            </ScrollView>

            {/* Sticky Bottom Bar if Qty > 0 */}
            {qty > 0 && (
                <View style={tw`absolute bottom-0 w-full bg-white p-4 border-t border-gray-100 shadow-xl`}>
                    <Button
                        label={`View Cart • £${(qty * product.price).toFixed(2)}`}
                        onPress={() => router.push('/cart')}
                    />
                </View>
            )}
        </View>
    );
};
