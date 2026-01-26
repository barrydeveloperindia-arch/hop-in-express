import React from 'react';
import { View, Text, Image, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import tw from '../../lib/tw';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

export const FeatureCarousel = () => {
    return (
        <View style={tw`mb-8`}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`px-6`} snapToInterval={CARD_WIDTH + 16} decelerationRate="fast">
                {/* Card 1: Nano Banana */}
                <View style={tw`w-[${CARD_WIDTH}px] h-[380px] mr-4 rounded-[32px] overflow-hidden bg-zinc-900 border border-white/10 relative shadow-2xl shadow-black`}>
                    {/* Background Image / Texture */}
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=1887&auto=format&fit=crop' }}
                        style={tw`absolute w-full h-full opacity-100`}
                        resizeMode="cover"
                    />

                    {/* Dark Gradient Overlay for text readability */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={tw`absolute bottom-0 w-full h-1/2`}
                    />

                    {/* Glass Label Area */}
                    <BlurView intensity={30} tint="dark" style={tw`absolute bottom-4 left-4 right-4 p-4 rounded-2xl overflow-hidden border border-white/10 bg-black/30`}>
                        <Text style={tw`text-white text-xl font-bold mb-1`}>Nano Banana</Text>
                        <Text style={tw`text-zinc-300 text-xs uppercase tracking-widest`}>Limited Edition</Text>
                    </BlurView>
                </View>

                {/* Card 2: Truffle */}
                <View style={tw`w-[${CARD_WIDTH}px] h-[380px] mr-4 rounded-[32px] overflow-hidden bg-zinc-900 border border-white/10 relative`}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1608649887140-523c9ce05096?q=80&w=2670&auto=format&fit=crop' }}
                        style={tw`absolute w-full h-full`}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={tw`absolute bottom-0 w-full h-1/2`}
                    />
                    <BlurView intensity={30} tint="dark" style={tw`absolute bottom-4 left-4 right-4 p-4 rounded-2xl overflow-hidden border border-white/10 bg-black/30`}>
                        <Text style={tw`text-white text-xl font-bold mb-1`}>Alba White Truffle</Text>
                        <Text style={tw`text-zinc-300 text-xs uppercase tracking-widest`}>Rare Find</Text>
                    </BlurView>
                </View>
            </ScrollView>

            {/* Pagination Dots */}
            <View style={tw`flex-row justify-center gap-2 mt-6`}>
                <View style={tw`w-2 h-2 rounded-full bg-white`} />
                <View style={tw`w-2 h-2 rounded-full bg-zinc-700`} />
                <View style={tw`w-2 h-2 rounded-full bg-zinc-700`} />
                <View style={tw`w-2 h-2 rounded-full bg-zinc-700`} />
            </View>
        </View>
    );
};
