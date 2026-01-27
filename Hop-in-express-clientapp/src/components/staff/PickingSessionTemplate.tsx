import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Check, ArrowLeft, Bike, AlertCircle } from 'lucide-react-native';
import { COLORS } from '../../lib/theme';
import { useRouter } from 'expo-router';

// Mock Items for Order (Ideally fetch from backend)
const ORDER_ITEMS = [
    { id: '1', name: 'Organic Nano Banana', qty: 2, bin: 'A-12', image: 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=300', picked: false },
    { id: '2', name: 'Thums Up (300ml)', qty: 6, bin: 'B-04', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Coca_Cola_can.jpg/640px-Coca_Cola_can.jpg', picked: false }, // Generic Soda
    { id: '3', name: 'Tilda Basmati Rice (5kg)', qty: 1, bin: 'C-01', image: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=300', picked: false },
    { id: '4', name: 'Frozen Paratha Pack', qty: 1, bin: 'F-09', image: 'https://images.pexels.com/photos/12737664/pexels-photo-12737664.jpeg?auto=compress&cs=tinysrgb&w=300', picked: false },
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
        <View style={tw`flex-1 bg-zinc-950`}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={tw`pt-14 pb-4 px-4 bg-zinc-900 border-b border-zinc-800 flex-row justify-between items-center`}>
                <TouchableOpacity onPress={() => router.back()} style={tw`bg-zinc-800 p-2 rounded-full border border-zinc-700`}>
                    <ArrowLeft size={20} color="#FFF" />
                </TouchableOpacity>
                <View style={tw`items-end`}>
                    <Typography variant="h3" color="#FFF">Order #{orderId?.split('_')[1] || '000'}</Typography>
                    <View style={tw`bg-red-500/20 px-2 py-0.5 rounded mt-1 border border-red-500/30`}>
                        <Typography variant="caption" color="#F87171" style={tw`font-bold text-[10px]`}>DUE IN 8 MINS</Typography>
                    </View>
                </View>
            </View>

            {/* Progress Bar (Glow) */}
            <View style={tw`h-1.5 bg-zinc-800 w-full`}>
                <View style={[tw`h-full bg-green-500 shadow-lg shadow-green-500`, { width: `${progress * 100}%` }]} />
            </View>
            <View style={tw`bg-green-500/10 p-2 items-center border-b border-green-500/20`}>
                <Typography variant="tiny" style={tw`text-green-400 font-bold uppercase tracking-widest`}>{pickedItems} of {totalItems} items picked</Typography>
            </View>

            {/* Picking List */}
            <ScrollView contentContainerStyle={tw`p-4 pb-32`}>
                {items.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => togglePick(item.id)}
                        activeOpacity={0.8}
                        style={tw`flex-row items-center p-4 rounded-xl mb-3 border ${item.picked ? 'bg-green-900/20 border-green-500/30' : 'bg-zinc-900 border-zinc-800'}`}
                    >
                        {/* Checkbox Visual */}
                        <View style={tw`w-8 h-8 rounded-full border-2 items-center justify-center mr-4 ${item.picked ? 'bg-green-500 border-green-500' : 'border-zinc-700 bg-zinc-950'}`}>
                            {item.picked && <Check size={16} color="#FFF" />}
                        </View>

                        <View style={tw`w-12 h-12 mr-4 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700`}>
                            <Image source={{ uri: item.image }} style={tw`w-full h-full ${item.picked ? 'opacity-50' : ''}`} resizeMode="cover" />
                        </View>

                        <View style={tw`flex-1`}>
                            <View style={tw`flex-row justify-between mb-1`}>
                                <Typography variant="h3" color={item.picked ? '#4B5563' : '#FFF'} style={item.picked ? tw`line-through` : {}}>{item.name}</Typography>
                                <Typography variant="h3" color={item.picked ? '#4B5563' : '#FFF'} style={tw`font-bold`}>x{item.qty}</Typography>
                            </View>
                            <Typography variant="caption" style={tw`font-bold text-blue-400`}>BIN: {item.bin}</Typography>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Dispatch Footer */}
            <View style={tw`absolute bottom-0 w-full bg-zinc-900 p-4 border-t border-zinc-800`}>
                {progress === 1 ? (
                    <TouchableOpacity
                        onPress={handleDispatch}
                        style={tw`bg-green-600 h-14 rounded-xl flex-row items-center justify-center shadow-lg shadow-green-500/30`}
                    >
                        <Bike size={24} color="#FFF" style={tw`mr-2`} />
                        <Typography variant="h3" color="#FFF">DISPATCH RIDER</Typography>
                    </TouchableOpacity>
                ) : (
                    <View style={tw`flex-row items-center justify-center h-14 bg-zinc-800 rounded-xl border border-zinc-700`}>
                        <AlertCircle size={20} color="#71717A" style={tw`mr-2`} />
                        <Typography variant="body" color="#71717A">Scan/Pick all items to dispatch</Typography>
                    </View>
                )}
            </View>
        </View>
    );
};
