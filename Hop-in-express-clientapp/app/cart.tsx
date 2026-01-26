import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../src/lib/tw';
// @ts-ignore
import { INVENTORY } from '../src/mockInventory';
import { Typography } from '../src/components/atoms/Typography';
import { Button } from '../src/components/atoms/Button';
import { ChevronLeft, MapPin, Clock, FileText, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PricingService } from '../src/services/pricing/PricingService.v1';
import { COLORS } from '../src/lib/theme';

// Temporary Mock Data fallback if INVENTORY missing
const MOCK_ITEMS = [
    {
        id: '1',
        name: 'Organic Nano Banana',
        price: 5.98,
        memberPrice: 5.98,
        image: 'https://cdn-icons-png.flaticon.com/512/2909/2909761.png',
        size: '1 Bunch',
        qty: 2
    },
    {
        id: '2',
        name: 'Thums Up',
        price: 6.00,
        memberPrice: 6.00,
        image: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png',
        size: '300ml Glass',
        qty: 6
    },
];

export default function CartScreen() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState(MOCK_ITEMS);

    // Calculation
    const itemTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const deliveryFee = PricingService.calculateDeliveryFee(itemTotal);
    const handlingFee = 0.99; // Standard
    const grandTotal = itemTotal + deliveryFee + handlingFee;

    return (
        <View style={tw`flex-1 bg-gray-50`}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={tw`bg-white pt-14 pb-4 px-4 flex-row items-center border-b border-gray-100`}>
                <TouchableOpacity onPress={() => router.back()} style={tw`mr-3`}>
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <View>
                    <Typography variant="h2">My Cart</Typography>
                    <Typography variant="body" color="#666">{cartItems.length} items • 12 mins</Typography>
                </View>
            </View>

            <ScrollView contentContainerStyle={tw`pb-40`}>

                {/* 1. Delivery Tip / Location */}
                <View style={tw`bg-white p-4 mb-4`}>
                    <View style={tw`flex-row items-center mb-3`}>
                        <View style={tw`bg-gray-100 p-2 rounded-lg mr-3`}>
                            <MapPin size={20} color={COLORS.primary} />
                        </View>
                        <View>
                            <Typography variant="h3">Delivering to Home</Typography>
                            <Typography variant="body" color="#666">24 High St, Eastleigh</Typography>
                        </View>
                    </View>
                    <View style={tw`flex-row items-center bg-green-50 p-3 rounded-xl border border-green-100`}>
                        <Clock size={16} color={COLORS.success} />
                        <Typography variant="body" style={tw`ml-2 font-medium text-green-800`}>Delivery in 10-12 minutes</Typography>
                    </View>
                </View>

                {/* 2. Items */}
                <View style={tw`bg-white p-4 mb-4`}>
                    {cartItems.map((item, i) => (
                        <View key={i} style={tw`flex-row justify-between items-start mb-6`}>
                            <View style={tw`flex-row flex-1`}>
                                <View style={tw`w-16 h-16 border border-gray-100 rounded-xl items-center justify-center mr-3`}>
                                    <Image source={{ uri: item.image }} style={tw`w-10 h-10`} resizeMode="contain" />
                                </View>
                                <View style={tw`flex-1`}>
                                    <Typography variant="body">{item.name}</Typography>
                                    <Typography variant="caption" style={tw`mb-1`}>{item.size}</Typography>
                                    <Typography variant="price">£{item.price.toFixed(2)}</Typography>
                                </View>
                            </View>

                            {/* Qty Counter */}
                            <View style={tw`bg-green-600 rounded-lg flex-row items-center px-2 py-1 h-8`}>
                                <Typography variant="h3" color="#FFF" style={tw`px-2`}>-</Typography>
                                <Typography variant="h3" color="#FFF">{item.qty}</Typography>
                                <Typography variant="h3" color="#FFF" style={tw`px-2`}>+</Typography>
                            </View>
                        </View>
                    ))}
                </View>

                {/* 3. Bill Details */}
                <View style={tw`bg-white p-4 mb-4`}>
                    <Typography variant="h3" style={tw`mb-4`}>Bill Details</Typography>

                    <View style={tw`flex-row justify-between mb-2`}>
                        <View style={tw`flex-row items-center`}>
                            <FileText size={14} color="#666" style={tw`mr-2`} />
                            <Typography variant="body" color="#666">Item Total</Typography>
                        </View>
                        <Typography variant="body">£{itemTotal.toFixed(2)}</Typography>
                    </View>

                    <View style={tw`flex-row justify-between mb-2`}>
                        <View style={tw`flex-row items-center`}>
                            <MapPin size={14} color="#666" style={tw`mr-2`} />
                            <Typography variant="body" color="#666">Delivery Fee</Typography>
                        </View>
                        <Typography variant="body">£{deliveryFee.toFixed(2)}</Typography>
                    </View>

                    <View style={tw`flex-row justify-between mb-2`}>
                        <View style={tw`flex-row items-center`}>
                            <ShieldCheck size={14} color="#666" style={tw`mr-2`} />
                            <Typography variant="body" color="#666">Handling Charge</Typography>
                        </View>
                        <Typography variant="body">£{handlingFee.toFixed(2)}</Typography>
                    </View>

                    <View style={tw`h-[1px] bg-gray-200 my-3`} />

                    <View style={tw`flex-row justify-between`}>
                        <Typography variant="h2">Grand Total</Typography>
                        <Typography variant="h2">£{grandTotal.toFixed(2)}</Typography>
                    </View>
                </View>

                <View style={tw`p-4 items-center`}>
                    <Typography variant="caption" style={tw`text-center text-gray-400`}>
                        Read our cancellation policy
                    </Typography>
                </View>

            </ScrollView>

            {/* Footer */}
            <View style={tw`absolute bottom-0 w-full bg-white p-4 border-t border-gray-100 shadow-xl`}>
                <View style={tw`mb-3 flex-row items-center bg-gray-50 p-2 rounded`}>
                    <MapPin size={16} color="#000" />
                    <Typography variant="caption" style={tw`ml-2 font-bold`}>Pay using Google Pay</Typography>
                </View>
                <Button label="Place Order" onPress={() => router.push('/checkout/success')} size="l" />
            </View>
        </View>
    );
}
