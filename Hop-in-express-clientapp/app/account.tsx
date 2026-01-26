import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../src/lib/tw';
import { NavigationDock } from '../src/components/organisms/NavigationDock';
import { Typography } from '../src/components/atoms/Typography';
import { Settings, CreditCard, MapPin, Heart, Clock, LogOut, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';

export default function AccountScreen() {
    return (
        <View style={tw`flex-1 bg-gray-50`}>
            <StatusBar style="dark" />

            {/* Header Profile Section */}
            <View style={tw`pt-14 px-4 pb-6 bg-white border-b border-gray-100`}>
                <View style={tw`flex-row items-center gap-4`}>
                    <View style={tw`w-16 h-16 rounded-full bg-blue-100 items-center justify-center border border-blue-200`}>
                        <Typography variant="h2" style={tw`text-blue-600`}>S</Typography>
                    </View>
                    <View>
                        <Typography variant="h2">Sam Alt</Typography>
                        <Typography variant="body" color="#666">+44 7700 900000</Typography>
                    </View>
                </View>

                {/* Membership Card - Light Mode */}
                <View style={tw`mt-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex-row justify-between items-center`}>
                    <View>
                        <Typography variant="tiny" style={tw`text-indigo-600 font-bold uppercase tracking-widest mb-1`}>Hop-In Gold</Typography>
                        <Typography variant="h3" style={tw`text-indigo-900`}>Free Delivery Active</Typography>
                    </View>
                    <View style={tw`bg-white px-3 py-1 rounded-lg border border-indigo-100 shadow-sm`}>
                        <Typography variant="tiny" style={tw`text-indigo-800 font-bold`}>Saved £12.50</Typography>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={tw`p-4 pb-32`}>
                <View style={tw`mb-2 ml-1`}><Typography variant="tiny" style={tw`text-gray-500 font-bold uppercase tracking-widest`}>My Account</Typography></View>

                {[
                    { icon: Clock, label: 'Order History', sub: 'Reorder your favourites' },
                    { icon: MapPin, label: 'Addresses', sub: 'Home, Work, Other' },
                    { icon: Heart, label: 'Saved Items', sub: 'Your wishlist' },
                    { icon: CreditCard, label: 'Payment Methods', sub: 'Cards & UPI' },
                ].map((item, i) => (
                    <TouchableOpacity key={i} style={tw`flex-row items-center bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm`}>
                        <View style={tw`bg-gray-50 p-2 rounded-lg`}>
                            <item.icon size={20} color={COLORS.textMain} />
                        </View>
                        <View style={tw`ml-4 flex-1`}>
                            <Typography variant="h3">{item.label}</Typography>
                            <Typography variant="caption" color={COLORS.textSub}>{item.sub}</Typography>
                        </View>
                        <ChevronRight size={18} color="#CCC" />
                    </TouchableOpacity>
                ))}

                <View style={tw`mt-6 mb-2 ml-1`}><Typography variant="tiny" style={tw`text-gray-500 font-bold uppercase tracking-widest`}>Settings</Typography></View>
                <TouchableOpacity style={tw`flex-row items-center bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm`}>
                    <Settings size={20} color={COLORS.textSub} />
                    <Typography variant="h3" style={tw`ml-4 flex-1`}>App Settings</Typography>
                    <ChevronRight size={18} color="#CCC" />
                </TouchableOpacity>

                <TouchableOpacity style={tw`flex-row items-center justify-center mt-6 p-4 bg-red-50 rounded-xl border border-red-100`}>
                    <LogOut size={20} color="#EF4444" />
                    <Typography variant="h3" style={tw`ml-2 text-red-600`}>Log Out</Typography>
                </TouchableOpacity>
            </ScrollView>

            <NavigationDock />
        </View>
    );
}
