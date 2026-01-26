import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../src/lib/tw';
import { NavigationDock } from '../src/components/organisms/NavigationDock';
import { Typography } from '../src/components/atoms/Typography';
import { ChevronRight } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';

const CATEGORIES = [
    { name: 'Vegetables', icon: '🥦', color: 'bg-green-50', border: 'border-green-200' },
    { name: 'Fruits', icon: '🍎', color: 'bg-red-50', border: 'border-red-200' },
    { name: 'Dairy & Bread', icon: '🥛', color: 'bg-blue-50', border: 'border-blue-200' },
    { name: 'World Foods', icon: '🍛', color: 'bg-orange-50', border: 'border-orange-200' },
    { name: 'Munchies', icon: '🍟', color: 'bg-yellow-50', border: 'border-yellow-200' },
    { name: 'Cold Drinks', icon: '🥤', color: 'bg-purple-50', border: 'border-purple-200' },
    { name: 'Frozen', icon: '❄️', color: 'bg-sky-50', border: 'border-sky-200' },
    { name: 'Tea & Coffee', icon: '☕', color: 'bg-amber-50', border: 'border-amber-200' },
    { name: 'Sweet Tooth', icon: '🍫', color: 'bg-pink-50', border: 'border-pink-200' },
    { name: 'Cleaning', icon: '🧹', color: 'bg-slate-50', border: 'border-slate-200' },
    { name: 'Personal Care', icon: '🧴', color: 'bg-rose-50', border: 'border-rose-200' },
    { name: 'Baby Care', icon: '👶', color: 'bg-teal-50', border: 'border-teal-200' },
];

export default function CategoriesScreen() {
    return (
        <View style={tw`flex-1 bg-white`}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={tw`pt-14 pb-4 px-4 border-b border-gray-100 bg-white`}>
                <Typography variant="h1">All Categories</Typography>
                <Typography variant="body" color={COLORS.textSub}>Explore 1,200+ items</Typography>
            </View>

            <ScrollView contentContainerStyle={tw`p-4 pb-32`}>
                <View style={tw`flex-row flex-wrap justify-between`}>
                    {CATEGORIES.map((cat, i) => (
                        <TouchableOpacity key={i} style={tw`w-[31%] mb-4 aspect-square ${cat.color} rounded-2xl border ${cat.border} items-center justify-center p-2`}>
                            <Text style={tw`text-4xl mb-2`}>{cat.icon}</Text>
                            <Typography variant="tiny" style={tw`text-center font-bold text-gray-800`}>{cat.name}</Typography>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sub-Category List */}
                <View style={tw`mt-6`}>
                    <Typography variant="h3" style={tw`mb-4 ml-2`}>Curated Aisles</Typography>
                    {['Summer Essentials', 'Midnight Cravings', 'Best of British', 'Asian Pantry'].map((aisle, i) => (
                        <TouchableOpacity key={i} style={tw`flex-row items-center justify-between bg-gray-50 p-4 rounded-xl mb-3 border border-gray-100`}>
                            <View style={tw`flex-row items-center gap-4`}>
                                <View style={tw`w-10 h-10 rounded-lg bg-white items-center justify-center border border-gray-100`}><Text style={tw`text-xl`}>🏷️</Text></View>
                                <Typography variant="body" bold>{aisle}</Typography>
                            </View>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <NavigationDock />
        </View>
    );
}
