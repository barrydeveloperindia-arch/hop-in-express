import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Check, ArrowLeft, Bike, AlertCircle } from 'lucide-react-native';
import { COLORS } from '../../lib/theme';
import { useRouter } from 'expo-router';

// Mock Items for Order
const ORDER_ITEMS = [
    { id: '1', name: 'Organic Nano Banana', qty: 2, bin: 'A-12', image: 'https://cdn-icons-png.flaticon.com/512/2909/2909761.png', picked: false },
    { id: '2', name: 'Thums Up (300ml)', qty: 6, bin: 'B-04', image: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png', picked: false },
    { id: '3', name: 'Tilda Basmati Rice (5kg)', qty: 1, bin: 'C-01', image: 'https://cdn-icons-png.flaticon.com/512/766/766023.png', picked: false },
    { id: '4', name: 'Frozen Paratha Pack', qty: 1, bin: 'F-09', image: 'https://cdn-icons-png.flaticon.com/512/931/931628.png', picked: false },
];

export const PickingSessionTemplate = ({ orderId }: { orderId: string }) => {
    const router = useRouter();
    const [items, setItems] = useState(ORDER_ITEMS);
    const [scanned, setScanned] = useState<string[]>([]);

    const totalItems = items.length;
    const pickedItems = items.filter(i => i.picked).length;
    const progress = pickedItems / totalItems;

    const togglePick = (id: string) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, picked: !i.picked } : i));
    };

    const handleDispatch = () => {
        Alert.alert("🎉 Order Dispatched!", "Rider assigned: Dave (3 mins away).", [
            { text: "Next Order", onPress: () => router.push('/staff') }
        ]);
    };

    return (
        <View style={tw`flex-1 bg-white`}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={tw`pt-14 pb-4 px-4 bg-white border-b border-gray-100 flex-row justify-between items-center`}>
                <TouchableOpacity onPress={() => router.back()} style={tw`bg-gray-100 p-2 rounded-full`}>
                    <ArrowLeft size={20} color="#000" />
                </TouchableOpacity>
                <View style={tw`items-end`}>
                    <Typography variant="h3">Order #{orderId?.split('_')[1] || '000'}</Typography>
                    <Typography variant="caption" color="red" style={tw`font-bold`}>DUE IN 8 MINS</Typography>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={tw`h-1 bg-gray-100 w-full`}>
                <View style={[tw`h-full bg-green-500`, { width: `${progress * 100}%` }]} />
            </View>
            <View style={tw`bg-green-50 p-2 items-center`}>
                <Typography variant="tiny" style={tw`text-green-800 font-bold`}>{pickedItems} of {totalItems} items picked</Typography>
            </View>

            {/* Picking List */}
            <ScrollView contentContainerStyle={tw`p-4 pb-32`}>
                {items.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => togglePick(item.id)}
                        activeOpacity={0.8}
                        style={tw`flex-row items-center p-4 rounded-xl mb-3 border ${item.picked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 shadow-sm'}`}
                    >
                        {/* Checkbox Visual */}
                        <View style={tw`w-8 h-8 rounded-full border-2 items-center justify-center mr-4 ${item.picked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                            {item.picked && <Check size={16} color="#FFF" />}
                        </View>

                        <Image source={{ uri: item.image }} style={tw`w-12 h-12 mr-4 ${item.picked ? 'opacity-50' : ''}`} resizeMode="contain" />

                        <View style={tw`flex-1`}>
                            <View style={tw`flex-row justify-between`}>
                                <Typography variant="h3" style={item.picked ? tw`text-gray-400 line-through` : tw`text-black`}>{item.name}</Typography>
                                <Typography variant="h3" style={tw`font-bold`}>x{item.qty}</Typography>
                            </View>
                            <Typography variant="caption" style={tw`font-bold text-blue-600 mt-1`}>BIN: {item.bin}</Typography>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Dispatch Footer */}
            <View style={tw`absolute bottom-0 w-full bg-white p-4 border-t border-gray-100 shadow-xl`}>
                {progress === 1 ? (
                    <TouchableOpacity
                        onPress={handleDispatch}
                        style={tw`bg-green-600 h-14 rounded-xl flex-row items-center justify-center shadow-lg shadow-green-500/30`}
                    >
                        <Bike size={24} color="#FFF" style={tw`mr-2`} />
                        <Typography variant="h3" color="#FFF">DISPATCH RIDER</Typography>
                    </TouchableOpacity>
                ) : (
                    <View style={tw`flex-row items-center justify-center h-14 bg-gray-100 rounded-xl`}>
                        <AlertCircle size={20} color="#9CA3AF" style={tw`mr-2`} />
                        <Typography variant="body" color="#9CA3AF">Scan/Pick all items to dispatch</Typography>
                    </View>
                )}
            </View>
        </View>
    );
};
