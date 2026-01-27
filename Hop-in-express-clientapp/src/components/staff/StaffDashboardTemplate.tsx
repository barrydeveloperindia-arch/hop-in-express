import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, Animated, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { Package, Clock, CheckCircle, MapPin, ChevronRight, Activity, Users, Battery } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { RestockSwiper } from './RestockSwiper';
import { RiderMap } from './RiderMap';
import { useInventory } from '../../hooks/useInventory';
import { CircularProgress } from '../atoms/CircularProgress';
import { Ticker } from '../molecules/Ticker';

// Firestore & Order Service Import
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, OrderItem } from '../../services/orders/OrderService'; // Ensure this path is correct

export const StaffDashboardTemplate = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Subscribe to Live Orders from Firestore
    useEffect(() => {
        const ordersRef = collection(db, 'shops', 'hop-in-express-', 'orders');

        // SIMPLIFIED QUERY: Removing orderBy to bypass Index requirements during dev
        // We will sort client-side
        const q = query(
            ordersRef,
            where('status', 'in', ['pending', 'preparing', 'packing'])
        );

        console.log("Listening for orders...");

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("Snapshot received:", snapshot.size, "docs");
            const liveOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Order));

            // Client-side sort
            // Handle timestamps that might be serverTimestamp (null locally) or Firestore Timestamp
            liveOrders.sort((a, b) => {
                const ta = a.createdAt?.seconds || Date.now() / 1000;
                const tb = b.createdAt?.seconds || Date.now() / 1000;
                return tb - ta; // Descending
            });

            setOrders(liveOrders);
            setLoadingOrders(false);
        }, (error) => {
            console.error("StaffDashboard Sync Error:", error);
            Alert.alert("Sync Error", "Could not fetch orders. Check console for Index URL.");
            setLoadingOrders(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAccept = (id: string) => {
        // Optimistic update locally not strictly needed if Firestore is fast, 
        // but for now we rely on the realtime listener update.
        // We navigate immediately to the Picking Screen.
        router.push(`/staff/order/${id}`);
    };

    const { inventory, loading } = useInventory();

    if (loading) {
        return (
            <View style={tw`flex-1 bg-zinc-950 items-center justify-center`}>
                <ActivityIndicator size="large" color="#4ADE80" />
                <Typography variant="body" color="#52525B" style={tw`mt-4`}>Loading Cockpit...</Typography>
            </View>
        );
    }

    // Filter for low stock items (e.g., < 5 units)
    // and map to RestockItem interface
    const lowStockItems = inventory
        .filter(item => item.stock < 5)
        .map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.stock,
            unit: item.size || 'units',
            image: item.image
        }));

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
                    <View style={tw`flex-1 bg-zinc-800 p-3 rounded-xl border border-zinc-700 items-center justify-between`}>
                        <View style={tw`w-full flex-row justify-between mb-1`}>
                            <Typography variant="tiny" color="#9CA3AF" style={tw`uppercase`}>Inv. Health</Typography>
                            <Battery size={14} color="#4ADE80" />
                        </View>
                        <View style={tw`my-1`}>
                            <CircularProgress
                                size={50}
                                strokeWidth={4}
                                progress={Math.round((inventory.filter(i => i.stock >= 5).length / (inventory.length || 1)) * 100)}
                                color="#4ADE80"
                                trackColor="#27272A" // zinc-800 dark
                            />
                        </View>
                        <Typography variant="tiny" color="#52525B">{lowStockItems.length} items low</Typography>
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

                {/* RIDER MAP (Phase 2 Impl) */}
                <RiderMap />

                {/* LIVE TICKER */}
                <View style={tw`my-4`}>
                    <Ticker />
                </View>

                <View style={tw`flex-row justify-between items-end mb-4`}>
                    <Typography variant="h3" color="#A1A1AA" style={tw`uppercase tracking-widest text-xs font-bold`}>Live Queue</Typography>
                    <View style={tw`flex-row items-center gap-1`}>
                        <View style={tw`w-2 h-2 rounded-full bg-red-500 animate-pulse`} />
                        <Typography variant="tiny" color="#EF4444">LIVE</Typography>
                    </View>
                </View>

                {orders.map(order => {
                    // Calculate time ago
                    const createdAt = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : new Date();
                    const now = new Date();
                    const diffMs = now.getTime() - createdAt.getTime();
                    const minsAgo = Math.floor(diffMs / 60000);
                    const isReviewNeeded = minsAgo > 10;

                    const statusColor = (order.status === 'pending' || order.status === 'confirmed') ? 'border-red-500' : 'border-blue-500';

                    return (
                        <TouchableOpacity
                            key={order.id}
                            onPress={() => router.push(`/staff/order/${order.id}`)}
                            activeOpacity={0.9}
                            style={tw`bg-zinc-900 p-4 rounded-xl mb-3 border-l-4 ${statusColor} shadow-lg`}
                        >
                            <View style={tw`flex-row justify-between items-start mb-4`}>
                                <View>
                                    <View style={tw`flex-row items-center gap-2 mb-1`}>
                                        <Typography variant="h3" color="#FFF">#{order.id?.slice(-4) || '....'}</Typography>
                                        {minsAgo < 5 && (
                                            <View style={tw`bg-red-500/20 px-2 py-0.5 rounded`}>
                                                <Typography variant="tiny" color="#F87171" style={tw`font-bold`}>JUST NOW</Typography>
                                            </View>
                                        )}
                                        {isReviewNeeded && (
                                            <View style={tw`bg-yellow-500/20 px-2 py-0.5 rounded`}>
                                                <Typography variant="tiny" color="#FBBF24" style={tw`font-bold`}>{minsAgo}m AGO</Typography>
                                            </View>
                                        )}
                                    </View>
                                    <Typography variant="body" color="#A1A1AA">{order.customer?.name || 'Guest'}</Typography>
                                </View>
                                <Typography variant="h3" color="#FFF">£{order.total?.toFixed(2) || '0.00'}</Typography>
                            </View>

                            {/* Action Bar */}
                            <View style={tw`flex-row items-center justify-between pt-3 border-t border-zinc-800`}>
                                <View style={tw`flex-row items-center`}>
                                    <Package size={16} color="#A1A1AA" />
                                    <Typography variant="caption" style={tw`ml-2 text-zinc-400`}>
                                        <Typography variant="caption" color="#FFF" style={tw`font-bold`}>{order.items?.length || 0}</Typography> items to pack
                                    </Typography>
                                </View>

                                {(order.status === 'pending' || order.status === 'confirmed') ? (
                                    <TouchableOpacity
                                        onPress={() => handleAccept(order.id || '')}
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
                    );
                })}

                {/* RESTOCK SWIPER (Phase 1 Impl) */}
                <View style={tw`mt-6 mb-12`}>
                    <Typography variant="h3" color="#A1A1AA" style={tw`uppercase tracking-widest text-xs font-bold mb-4`}>
                        Urgent Reorder ({lowStockItems.length})
                    </Typography>
                    <RestockSwiper
                        items={lowStockItems}
                        onReorder={(item) => Alert.alert('Reordered', `Reordered stock for ${item.name}`)}
                        onIgnore={(item) => console.log('Ignored:', item.name)}
                    />
                </View>

            </ScrollView>
        </View>
    );
};
