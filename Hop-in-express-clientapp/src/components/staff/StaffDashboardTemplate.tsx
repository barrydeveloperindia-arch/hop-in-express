import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Package, Clock, CheckCircle, MapPin, ChevronRight, RefreshCw } from 'lucide-react-native';
import { COLORS } from '../../lib/theme';
import { useRouter } from 'expo-router';

// Mock Incoming Order
const MOCK_ORDERS = [
    {
        id: 'ord_8829',
        customer: 'Sam Alt',
        items: 4,
        minsAgo: 2,
        status: 'PENDING', // PENDING, PACKING, READY
        address: '24 High St, Eastleigh',
        total: 15.45
    },
    {
        id: 'ord_8830',
        customer: 'Priya P.',
        items: 12,
        minsAgo: 5,
        status: 'PACKING',
        address: '88 Market Rd',
        total: 42.10
    }
];

export const StaffDashboardTemplate = () => {
    const router = useRouter();
    const [orders, setOrders] = useState(MOCK_ORDERS);

    const handleAccept = (id: string) => {
        // Optimistic UI update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'PACKING' } : o));
        router.push(`/staff/order/${id}`);
    };

    return (
        <View style={tw`flex-1 bg-gray-100`}>
            <StatusBar style="dark" />

            {/* Staff Header */}
            <View style={tw`bg-zinc-900 pt-14 pb-6 px-4 shadow`}>
                <View style={tw`flex-row justify-between items-center mb-4`}>
                    <View style={tw`flex-row items-center`}>
                        <View style={tw`bg-green-500 p-2 rounded-lg mr-3`}>
                            <Package size={24} color="#FFF" />
                        </View>
                        <View>
                            <Typography variant="h3" color="#FFF">Eastleigh Dark Store</Typography>
                            <Typography variant="caption" color="#9CA3AF">Store ID: #EST-001</Typography>
                        </View>
                    </View>
                    <View style={tw`bg-green-500/20 px-3 py-1 rounded-full border border-green-500/50`}>
                        <Typography variant="tiny" style={tw`text-green-400 font-bold`}>ONLINE</Typography>
                    </View>
                </View>

                {/* KPI Cards */}
                <View style={tw`flex-row gap-3`}>
                    <View style={tw`flex-1 bg-white/10 p-3 rounded-lg border border-white/5`}>
                        <Typography variant="tiny" color="#9CA3AF" style={tw`uppercase`}>Avg Pick Time</Typography>
                        <Typography variant="h2" color="#FFF">1m 42s</Typography>
                    </View>
                    <View style={tw`flex-1 bg-white/10 p-3 rounded-lg border border-white/5`}>
                        <Typography variant="tiny" color="#9CA3AF" style={tw`uppercase`}>Pending</Typography>
                        <Typography variant="h2" color="#FBBF24">{orders.filter(o => o.status === 'PENDING').length}</Typography>
                    </View>
                </View>
            </View>

            {/* Orders Feed */}
            <ScrollView contentContainerStyle={tw`p-4`}>
                <Typography variant="h3" style={tw`mb-4 text-gray-500 uppercase tracking-widest text-xs font-bold`}>Incoming Orders</Typography>

                {orders.map(order => (
                    <TouchableOpacity
                        key={order.id}
                        onPress={() => router.push(`/staff/order/${order.id}`)}
                        activeOpacity={0.9}
                        style={tw`bg-white p-4 rounded-xl mb-4 shadow-sm border-l-4 ${order.status === 'PENDING' ? 'border-red-500' : 'border-blue-500'}`}
                    >
                        <View style={tw`flex-row justify-between items-start mb-3`}>
                            <View>
                                <Typography variant="h3">#{order.id.split('_')[1]}</Typography>
                                <Typography variant="body" color="#666">{order.customer}</Typography>
                            </View>
                            <View style={tw`flex-row items-center`}>
                                <Clock size={14} color="#666" />
                                <Typography variant="caption" style={tw`ml-1 text-gray-500`}>{order.minsAgo}m ago</Typography>
                            </View>
                        </View>

                        <View style={tw`flex-row items-center justify-between`}>
                            <View style={tw`flex-row items-center bg-gray-50 px-2 py-1 rounded`}>
                                <Package size={14} color="#666" />
                                <Typography variant="caption" style={tw`ml-1 font-bold`}>{order.items} Items</Typography>
                            </View>

                            {order.status === 'PENDING' ? (
                                <TouchableOpacity
                                    onPress={() => handleAccept(order.id)}
                                    style={tw`bg-black px-4 py-2 rounded-lg`}
                                >
                                    <Typography variant="tiny" color="#FFF" style={tw`font-bold`}>START PICKING</Typography>
                                </TouchableOpacity>
                            ) : (
                                <View style={tw`flex-row items-center`}>
                                    <Typography variant="tiny" style={tw`text-blue-600 font-bold mr-2 uppercase`}>Picking...</Typography>
                                    <ChevronRight size={16} color="#2563EB" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};
