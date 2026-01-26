import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { useRouter } from 'expo-router';

const sprite = require('../../../assets/images/category_sheet.png');

const CATEGORIES = [
    { name: 'Veg & Fruits', query: 'Veg' },
    { name: 'Dairy & Bread', query: 'Milk' },
    { name: 'Atta & Rice', query: 'Rice' },
    { name: 'Snacks', query: 'Snacks' },
    { name: 'Sweet Tooth', query: 'Confectionery' },
    { name: 'Cleaning', query: 'Household' },
    { name: 'Paan Corner', query: 'Tobacco' }, // Best guess for Paan shop inventory
    { name: 'Hygiene', query: 'Soap' },
];

const SpriteIcon = ({ index }: { index: number }) => {
    // Assumption: The sprite sheet is a 3-column grid
    const col = index % 3;
    const row = Math.floor(index / 3);

    return (
        <View style={tw`w-full h-full overflow-hidden bg-white`}>
            <Image
                source={sprite}
                style={{
                    width: '300%',
                    height: '300%', // Assuming 3 rows roughly for 8 items
                    position: 'absolute',
                    left: `${-col * 100}%`,
                    top: `${-row * 100}%`
                }}
                resizeMode="cover"
            />
        </View>
    );
};

export const CategoryGrid = () => {
    const router = useRouter();

    return (
        <View style={tw`px-4 mb-6`}>
            <View style={tw`flex-row flex-wrap justify-between`}>
                {CATEGORIES.map((cat, i) => (
                    <TouchableOpacity
                        key={i}
                        activeOpacity={0.7}
                        style={tw`w-[23%] mb-3 items-center`}
                        onPress={() => router.push(`/search?q=${encodeURIComponent(cat.query || cat.name)}`)}
                    >
                        <View style={tw`w-full aspect-square rounded-2xl overflow-hidden mb-1 border border-gray-100 shadow-sm`}>
                            <SpriteIcon index={i} />
                        </View>
                        <Typography variant="tiny" style={tw`text-[10px] text-center font-bold text-gray-400 normal-case leading-3 mt-1`}>
                            {cat.name.replace(' & ', '\n& ')}
                        </Typography>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
