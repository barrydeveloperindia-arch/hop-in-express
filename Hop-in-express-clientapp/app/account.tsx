import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../src/lib/tw';
import { FloatingTabDock } from '../src/components/ui/FloatingTabDock';
import { Settings, CreditCard, MapPin, Heart, Clock, LogOut } from 'lucide-react-native';

export default function AccountScreen() {
    return (
        <View style={tw`flex-1 bg-black`}>
            <StatusBar style="light" />

            <View style={tw`pt-14 px-6 pb-6 bg-zinc-900 border-b border-white/10`}>
                <View style={tw`flex-row items-center gap-4`}>
                    <View style={tw`w-16 h-16 rounded-full bg-indigo-600 items-center justify-center border-2 border-white/20`}>
                        <Text style={tw`text-white text-2xl font-bold`}>S</Text>
                    </View>
                    <View>
                        <Text style={tw`text-white text-xl font-bold`}>Sam Alt</Text>
                        <Text style={tw`text-zinc-400 text-sm`}>+44 7700 900000</Text>
                    </View>
                </View>

                {/* Membership Card */}
                <View style={tw`mt-6 bg-gradient-to-r from-indigo-900 to-purple-900 p-4 rounded-2xl border border-white/10 flex-row justify-between items-center`}>
                    <View>
                        <Text style={tw`text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1`}>Hop-In Gold</Text>
                        <Text style={tw`text-white font-bold`}>Free Delivery Active</Text>
                    </View>
                    <View style={tw`bg-white/10 px-3 py-1 rounded-lg`}>
                        <Text style={tw`text-white text-xs`}>Savings: £12.50</Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={tw`p-6 pb-32`}>
                <View style={tw`mb-2`}><Text style={tw`text-zinc-500 font-bold uppercase text-xs tracking-widest`}>My Account</Text></View>

                {[
                    { icon: Clock, label: 'Order History', sub: 'Reorder your favourites' },
                    { icon: MapPin, label: 'Addresses', sub: 'Home, Work, Other' },
                    { icon: Heart, label: 'Saved Items', sub: 'Your wishlist' },
                    { icon: CreditCard, label: 'Payment Methods', sub: 'Cards & UPI' },
                ].map((item, i) => (
                    <TouchableOpacity key={i} style={tw`flex-row items-center bg-zinc-900/50 p-4 rounded-2xl mb-3 border border-white/5`}>
                        <item.icon size={20} color="#D4AF37" />
                        <View style={tw`ml-4 flex-1`}>
                            <Text style={tw`text-white font-medium`}>{item.label}</Text>
                            <Text style={tw`text-zinc-500 text-xs`}>{item.sub}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={tw`mt-6 mb-2`}><Text style={tw`text-zinc-500 font-bold uppercase text-xs tracking-widest`}>Settings</Text></View>
                <TouchableOpacity style={tw`flex-row items-center bg-zinc-900/50 p-4 rounded-2xl mb-3 border border-white/5`}>
                    <Settings size={20} color="#9CA3AF" />
                    <Text style={tw`ml-4 text-white font-medium flex-1`}>App Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={tw`flex-row items-center justify-center mt-8 p-4`}>
                    <LogOut size={20} color="#EF4444" />
                    <Text style={tw`ml-2 text-red-500 font-bold`}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>

            <FloatingTabDock />
        </View>
    );
}
