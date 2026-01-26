import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { Package, Clock, CheckCircle, MapPin, ChevronRight, Activity, Users, Battery } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Mock Incoming Order
const MOCK_ORDERS = [
    {
        id: 'ord_8829',
        customer: 'Sam Alt',
        items: 4,
        minsAgo: 0,
        status: 'PENDING',
        address: '24 High St, Eastleigh',
        total: 15.45,
        priority: 'HIGH'
    },
    {
        id: 'ord_8830',
        customer: 'Priya P.',
        items: 12,
        minsAgo: 5,
        status: 'PACKING',
        address: '88 Market Rd',
        total: 42.10,
        priority: 'NORMAL'
    }
];

export const StaffDashboardTemplate = () => {
    const router = useRouter();
    const [orders, setOrders] = useState(MOCK_ORDERS);

    const handleAccept = (id: string) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'PACKING' } : o));
        router.push(`/staff/order/${id}`);
    };

    return (
        <View style={tw`flex-1 bg-zinc-950`}>
            <StatusBar style="light" />

            {/* COCKPIT HEADER */}
            <View style={tw`bg-zinc-900 pt-14 pb-6 px-4 border-b border-zinc-800`}>
                <View style={tw`flex-row justify-between items-center mb-6`}>
                    <View>
                        <Typography variant="h2" color="#FFF" style={tw`uppercase tracking-tight`}>Ops Center</Typography>
                        <Typography variant="caption" color="#52525B">Eastleigh Hub • Online</Typography>
                    </View>
                    <View style={tw`w-10 h-10 rounded-full bg-green-500/20 items-center justify-center border border-green-500`}>
                        <Activity size={20} color="#4ADE80" />
                    </View>
                </View>

                {/* KPI DIALS (Digital Representation) */}
                <View style={tw`flex-row gap-3`}>
                    {/* Inventory Health */}
                    <View style={tw`flex-1 bg-zinc-800 p-3 rounded-xl border border-zinc-700`}>
                        <View style={tw`flex-row justify-between mb-2`}>
                            <Typography variant="tiny" color="#9CA3AF" style={tw`uppercase`}>Inv. Health</Typography>
                            <Battery size={14} color="#4ADE80" />
                        </View>
                        <Typography variant="h2" color="#4ADE80">98%</Typography>
                        <Typography variant="tiny" color="#52525B">4 items low</Typography>
                    </View>

                    {/* Active Riders */}
                    <View style={tw`flex-1 bg-zinc-800 p-3 rounded-xl border border-zinc-700`}>
                        <View style={tw`flex-row justify-between mb-2`}>
                            <Typography variant="tiny" color="#9CA3AF" style={tw`uppercase`}>Riders</Typography>
                            <Users size={14} color="#60A5FA" />
                        </View>
                        <Typography variant="h2" color="#60A5FA">3/5</Typography>
                        <Typography variant="tiny" color="#52525B">Active in Zone</Typography>
                    </View>

                    {/* Pace */}
                    <View style={tw`flex-1 bg-zinc-800 p-3 rounded-xl border border-zinc-700`}>
                        <View style={tw`flex-row justify-between mb-2`}>
                            <Typography variant="tiny" color="#9CA3AF" style={tw`uppercase`}>Pack Time</Typography>
                            <Clock size={14} color="#FBBF24" />
                        </View>
                        <Typography variant="h2" color="#FBBF24">1:42</Typography>
                        <Typography variant="tiny" color="#52525B">Target: 2:00</Typography>
                    </View>
                </View>
            </View>

            {/* LIVE TICKER / SCROLLABLE FEED */}
            <ScrollView contentContainerStyle={tw`p-4`}>
                <View style={tw`flex-row justify-between items-end mb-4`}>
                    <Typography variant="h3" color="#A1A1AA" style={tw`uppercase tracking-widest text-xs font-bold`}>Live Queue</Typography>
                    <View style={tw`flex-row items-center gap-1`}>
                        <View style={tw`w-2 h-2 rounded-full bg-red-500 animate-pulse`} />
                        <Typography variant="tiny" color="#EF4444">LIVE</Typography>
                    </View>
                </View>

                {orders.map(order => (
                    <TouchableOpacity
                        key={order.id}
                        onPress={() => router.push(`/staff/order/${order.id}`)}
                        activeOpacity={0.9}
                        style={tw`bg-zinc-900 p-4 rounded-xl mb-3 border-l-4 ${order.status === 'PENDING' ? 'border-red-500' : 'border-blue-500'} shadow-lg`}
                    >
                        <View style={tw`flex-row justify-between items-start mb-4`}>
                            <View>
                                <View style={tw`flex-row items-center gap-2 mb-1`}>
                                    <Typography variant="h3" color="#FFF">#{order.id.split('_')[1]}</Typography>
                                    {order.minsAgo === 0 && (
                                        <View style={tw`bg-red-500/20 px-2 py-0.5 rounded`}>
                                            <Typography variant="tiny" color="#F87171" style={tw`font-bold`}>JUST NOW</Typography>
                                        </View>
                                    )}
                                </View>
                                <Typography variant="body" color="#A1A1AA">{order.customer}</Typography>
                            </View>
                            <Typography variant="h3" color="#FFF">£{order.total.toFixed(2)}</Typography>
                        </View>

                        {/* Action Bar */}
                        <View style={tw`flex-row items-center justify-between pt-3 border-t border-zinc-800`}>
                            <View style={tw`flex-row items-center`}>
                                <Package size={16} color="#A1A1AA" />
                                <Typography variant="caption" style={tw`ml-2 text-zinc-400`}>
                                    <Typography variant="caption" color="#FFF" style={tw`font-bold`}>{order.items}</Typography> items to pack
                                </Typography>
                            </View>

                            {order.status === 'PENDING' ? (
                                <TouchableOpacity
                                    onPress={() => handleAccept(order.id)}
                                    style={tw`bg-white px-5 py-2 rounded-lg`}
                                >
                                    <Typography variant="tiny" color="#000" style={tw`font-black uppercase`}>Pick Order</Typography>
                                </TouchableOpacity>
                            ) : (
                                <View style={tw`flex-row items-center bg-blue-500/10 px-3 py-1.5 rounded-lg`}>
                                    <Typography variant="tiny" style={tw`text-blue-400 font-bold mr-2 uppercase`}>Packing...</Typography>
                                    <Activity size={14} color="#60A5FA" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Low Stock Alert Card (Example) */}
                <View style={tw`mt-6 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl`}>
                    <View style={tw`flex-row items-center gap-3 mb-2`}>
                        <View style={tw`bg-yellow-500/20 p-2 rounded-lg`}>
                            <Package size={20} color="#FBBF24" />
                        </View>
                        <View>
                            <Typography variant="h3" color="#FBBF24">Low Stock Alert</Typography>
                            <Typography variant="caption" color="#A1A1AA">Organic Nano Bananas (2 left)</Typography>
                        </View>
                    </View>
                    <TouchableOpacity style={tw`bg-yellow-500 px-4 py-2 rounded-lg self-start mt-2`}>
                        <Typography variant="tiny" color="#000" style={tw`font-bold`}>SWIPE TO REORDER</Typography>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
};
