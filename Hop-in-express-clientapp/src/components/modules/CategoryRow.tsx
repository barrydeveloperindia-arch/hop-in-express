import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import tw from '../../lib/tw';

const CATEGORIES = [
    { name: 'Fruits', image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Vegetables', image: 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Bakery', image: 'https://images.pexels.com/photos/209396/pexels-photo-209396.jpeg?auto=compress&cs=tinysrgb&w=300' },
];

export const CategoryRow = () => {
    return (
        <View style={tw`mb-8`}>
            <View style={tw`flex-row justify-between items-center px-6 mb-4`}>
                <Text style={tw`text-white text-lg font-bold`}>Categories</Text>
                <TouchableOpacity><Text style={tw`text-zinc-400 text-sm`}>See all</Text></TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`px-6`} style={tw`overflow-visible`}>
                {CATEGORIES.map((cat, i) => (
                    <View key={i} style={tw`mr-4 w-28`}>
                        <View style={tw`w-28 h-28 rounded-3xl overflow-hidden border border-white/10 mb-2 relative bg-zinc-800`}>
                            <Image source={{ uri: cat.image }} style={tw`absolute w-full h-full opacity-80`} resizeMode="cover" />
                        </View>
                        <Text style={tw`text-zinc-300 text-center text-xs font-medium`}>{cat.name}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};
