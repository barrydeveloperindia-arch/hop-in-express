import React, { useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { AlertOctagon, Check, X } from 'lucide-react-native';

interface RestockItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    image: string;
}

interface RestockSwiperProps {
    items: RestockItem[];
    onReorder: (item: RestockItem) => void;
    onIgnore: (item: RestockItem) => void;
}

export const RestockSwiper: React.FC<RestockSwiperProps> = ({ items, onReorder, onIgnore }) => {
    if (!items || items.length === 0) {
        return (
            <View style={tw`h-[200px] justify-center items-center bg-zinc-900/50 rounded-2xl border border-zinc-800 m-4`}>
                <Check size={32} color="#4ADE80" />
                <Typography variant="h3" color="#FFF" style={tw`mt-4`}>All Stock Healthy</Typography>
                <Typography variant="caption" color="#A1A1AA" style={tw`text-center mt-2 px-10`}>
                    No items are running low.
                </Typography>
            </View>
        );
    }

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mt-4 pl-4`}>
            {items.map((card) => (
                <View key={card.id} style={tw`w-64 h-80 rounded-2xl bg-zinc-800 border border-zinc-700 p-6 justify-center items-center shadow-lg relative mr-4`}>
                    {/* Card Header Badge */}
                    <View style={tw`absolute top-4 right-4 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30`}>
                        <Typography variant="tiny" color="#F87171" style={tw`font-bold`}>CRITICAL</Typography>
                    </View>

                    {/* Content */}
                    <View style={tw`w-24 h-24 bg-zinc-900 rounded-full items-center justify-center mb-6 border border-zinc-700 overflow-hidden`}>
                        {!card.image.startsWith('http') ? (
                            <Typography style={tw`text-4xl`}>{card.image}</Typography>
                        ) : (
                            <Image source={{ uri: card.image }} style={tw`w-full h-full`} resizeMode="cover" />
                        )}
                    </View>

                    <Typography variant="h3" color="#FFF" style={tw`text-center mb-2`}>{card.name}</Typography>

                    <View style={tw`flex-row items-center bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-700 mb-6`}>
                        <AlertOctagon size={14} color="#FBBF24" style={tw`mr-2`} />
                        <Typography variant="tiny" color="#FBBF24" style={tw`font-bold`}>
                            Only {card.quantity} {card.unit} left
                        </Typography>
                    </View>

                    {/* Actions */}
                    <View style={tw`w-full flex-row justify-between px-2`}>
                        <TouchableOpacity onPress={() => onIgnore(card)} style={tw`p-2 bg-red-500/10 rounded-full border border-red-500/30`}>
                            <X size={20} color="#F87171" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onReorder(card)} style={tw`p-2 bg-green-500/10 rounded-full border border-green-500/30`}>
                            <Check size={20} color="#4ADE80" />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};
