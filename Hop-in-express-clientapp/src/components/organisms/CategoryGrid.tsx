import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';

const CATEGORIES = [
    { name: 'Veg & Fruits', image: 'https://cdn-icons-png.flaticon.com/512/2329/2329903.png', bg: 'bg-green-50' },
    { name: 'Dairy & Bread', image: 'https://cdn-icons-png.flaticon.com/512/5029/5029236.png', bg: 'bg-blue-50' },
    { name: 'Atta & Rice', image: 'https://cdn-icons-png.flaticon.com/512/3014/3014520.png', bg: 'bg-yellow-50' },
    { name: 'Snacks', image: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', bg: 'bg-orange-50' },
    { name: 'Sweet Tooth', image: 'https://cdn-icons-png.flaticon.com/512/2515/2515183.png', bg: 'bg-pink-50' },
    { name: 'Cleaning', image: 'https://cdn-icons-png.flaticon.com/512/962/962913.png', bg: 'bg-cyan-50' },
    { name: 'Paan Corner', image: 'https://cdn-icons-png.flaticon.com/512/4333/4333609.png', bg: 'bg-purple-50' },
    { name: 'Hygiene', image: 'https://cdn-icons-png.flaticon.com/512/2913/2913465.png', bg: 'bg-indigo-50' },
];

export const CategoryGrid = () => {
    return (
        <View style={tw`px-4 mb-6`}>
            <View style={tw`flex-row flex-wrap justify-between`}>
                {CATEGORIES.map((cat, i) => (
                    <TouchableOpacity key={i} activeOpacity={0.7} style={tw`w-[23%] mb-3 items-center`}>
                        <View style={tw`w-full aspect-square ${cat.bg} rounded-2xl items-center justify-center mb-1 border border-gray-100`}>
                            <Image source={{ uri: cat.image }} style={tw`w-10 h-10`} resizeMode="contain" />
                        </View>
                        <Typography variant="tiny" style={tw`text-[10px] text-center font-bold text-gray-700 normal-case leading-3`}>
                            {cat.name.replace(' & ', '\n& ')}
                        </Typography>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
