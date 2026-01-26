import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../src/lib/tw';
import { Typography } from '../src/components/atoms/Typography';
import { OrderService, Order } from '../src/services/orders/OrderService';
import { COLORS } from '../src/lib/theme';
import { ShoppingBag, Clock, ChevronRight } from 'lucide-react-native';
import { NavigationDock } from '../src/components/organisms/NavigationDock';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OrderHistoryScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userPhone, setUserPhone] = useState<string | null>(null);

    const loadOrders = async () => {
        try {
            // Retrieve the last used phone number
            const phone = await AsyncStorage.getItem('last_user_phone');
            setUserPhone(phone);

            if (phone) {
                const history = await OrderService.getMyOrders(phone);
                setOrders(history);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadOrders();
    };

    return (
        <View style={tw`flex-1 bg-black`}>
            <StatusBar style="light" />

            <View style={tw`pt-14 pb-4 px-4 border-b border-gray-900 bg-black`}>
                <Typography variant="h1" color={COLORS.textMain}>Your Orders</Typography>
                {userPhone ? (
                    <Typography variant="caption" color={COLORS.textSub}>Linked to {userPhone}</Typography>
                ) : (
                    <Typography variant="caption" color={COLORS.textSub}>No guest checkouts found on this device.</Typography>
                )}
            </View>

            <ScrollView
                contentContainerStyle={tw`pb-32 px-4 pt-4`}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            >
                {/* Empty State */}
                {!loading && orders.length === 0 && (
                    <View style={tw`items-center justify-center mt-20`}>
                        <ShoppingBag size={48} color={COLORS.textSub} />
                        <Typography variant="h3" color={COLORS.textSub} style={tw`mt-4 text-center`}>No orders yet</Typography>
                        <Typography variant="body" color={COLORS.textMuted} style={tw`text-center mt-2`}>
                            Start filling your bag with goodies!
                        </Typography>
                    </View>
                )}

                {/* Info Card if phone exists but no orders (maybe index issue or deleted) */}
                {userPhone && orders.length === 0 && !loading && (
                    <View style={tw`bg-gray-900 p-4 rounded-xl mt-6 border border-gray-800`}>
                        <Typography variant="caption" color={COLORS.secondary}>
                            Tip: Orders are linked to your phone number. If you re-install the app, you may need to checkout once to re-link.
                        </Typography>
                    </View>
                )}

                {/* Order List */}
                {orders.map(order => (
                    <View key={order.id} style={tw`bg-gray-900 mb-4 rounded-xl p-4 border border-gray-800`}>

                        {/* Header: Date & Status */}
                        <View style={tw`flex-row justify-between items-start mb-3`}>
                            <View style={tw`flex-row items-center`}>
                                <View style={tw`bg-gray-800 p-1.5 rounded mr-3`}>
                                    <ShoppingBag size={16} color={COLORS.primary} />
                                </View>
                                <View>
                                    <Typography variant="h3" color="white">£{order.total.toFixed(2)}</Typography>
                                    <Typography variant="tiny" color={COLORS.textSub}>
                                        {order.items.length} items • {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}
                                    </Typography>
                                </View>
                            </View>

                            {/* Status Pill */}
                            <View style={[
                                tw`px-2 py-1 rounded border`,
                                order.status === 'completed' ? tw`bg-green-900/50 border-green-800` :
                                    order.status === 'cancelled' ? tw`bg-red-900/50 border-red-800` :
                                        tw`bg-yellow-900/50 border-yellow-800`
                            ]}>
                                <Typography variant="tiny" style={[
                                    tw`font-bold capitalized`,
                                    order.status === 'completed' ? tw`text-green-400` :
                                        order.status === 'cancelled' ? tw`text-red-400` :
                                            tw`text-yellow-400`
                                ]}>
                                    {order.status.toUpperCase()}
                                </Typography>
                            </View>
                        </View>

                        {/* Items Preview */}
                        <View style={tw`border-t border-gray-800 pt-3 mt-1`}>
                            {order.items.slice(0, 2).map((item: any, idx: number) => (
                                <View key={idx} style={tw`flex-row justify-between mb-1`}>
                                    <Typography variant="caption" color={COLORS.textSub}>
                                        {item.qty}x {item.name}
                                    </Typography>
                                    <Typography variant="caption" color={COLORS.textMuted}>
                                        £{item.effectivePrice.toFixed(2)}
                                    </Typography>
                                </View>
                            ))}
                            {order.items.length > 2 && (
                                <Typography variant="tiny" color={COLORS.textMuted} style={tw`mt-1`}>
                                    + {order.items.length - 2} more items...
                                </Typography>
                            )}
                        </View>

                    </View>
                ))}

            </ScrollView>

            <NavigationDock />
        </View>
    );
}
