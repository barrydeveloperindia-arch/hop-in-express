import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, Image, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../src/lib/tw';
import { NavigationDock } from '../src/components/organisms/NavigationDock';
import { Typography } from '../src/components/atoms/Typography';
import { ChevronRight } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';
import { useRouter } from 'expo-router';

const CATEGORIES = [
    { name: 'Vegetables', query: 'Veg', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=600&q=90' },
    { name: 'Fruits', query: 'Fruit', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=90' },
    { name: 'Dairy & Bread', query: 'Milk', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=90' },
    { name: 'World Foods', query: 'Rice', image: 'https://images.unsplash.com/photo-1627328715728-7bcc1b5db87d?auto=format&fit=crop&w=600&q=90' }, // Indian Curry
    { name: 'Munchies', query: 'Snacks', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=90' },
    { name: 'Cold Drinks', query: 'Drinks', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=90' },
    { name: 'Frozen', query: 'Frozen', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=90' },
    { name: 'Tea & Coffee', query: 'Coffee', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=90' },
    { name: 'Sweet Tooth', query: 'Confectionery', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=90' }, // Chocolate
    { name: 'Cleaning', query: 'Household', image: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=600&q=90' },
    { name: 'Personal Care', query: 'Soap', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=90' }, // Soap
    { name: 'Baby Care', query: 'Baby', image: 'https://images.pexels.com/photos/459976/pexels-photo-459976.jpeg?auto=compress&cs=tinysrgb&w=600' }, // Baby Hands
];

export default function CategoriesScreen() {
    const router = useRouter();
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
    const [hoveredAisle, setHoveredAisle] = React.useState<number | null>(null);

    const goToCategory = (cat: string) => {
        router.push(`/search?q=${encodeURIComponent(cat)}`);
    };

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
                        <Pressable
                            key={i}
                            style={tw`w-[31%] mb-4 items-center`}
                            onPress={() => goToCategory(cat.query || cat.name)}
                            onHoverIn={() => setHoveredIndex(i)}
                            onHoverOut={() => setHoveredIndex(null)}
                        >
                            <View style={[
                                tw`w-full aspect-square rounded-2xl overflow-hidden mb-2 border bg-white`,
                                hoveredIndex === i
                                    ? tw`border-indigo-500 shadow-lg scale-[1.02]` // Subtle scale + Highlight
                                    : tw`border-gray-200 shadow-sm`
                            ]}>
                                <Image source={{ uri: cat.image }} style={tw`w-full h-full`} resizeMode="cover" />
                                {/* Optional: Add a subtle overlay on hover to make text pop? No, image is cover. */}
                                {hoveredIndex === i && (
                                    <View style={tw`absolute inset-0 bg-indigo-500/10 z-10`} />
                                )}
                            </View>
                            <Typography
                                variant="tiny"
                                style={[
                                    tw`text-center font-bold leading-4 h-8 transition-colors`,
                                    hoveredIndex === i ? tw`text-indigo-600` : tw`text-gray-800`
                                ]}
                            >
                                {cat.name}
                            </Typography>
                        </Pressable>
                    ))}
                </View>

                {/* Sub-Category List */}
                <View style={tw`mt-6`}>
                    <Typography variant="h3" style={tw`mb-4 ml-2`}>Curated Aisles</Typography>
                    {[
                        { name: 'Summer Essentials', icon: '☀️', query: 'drinks' },
                        { name: 'Midnight Cravings', icon: '🌙', query: 'snacks' },
                        { name: 'Best of British', icon: '🇬🇧', query: 'tea' },
                        { name: 'Asian Pantry', icon: '🥡', query: 'rice' }
                    ].map((aisle, i) => (
                        <TouchableOpacity
                            key={i}
                            style={tw`flex-row items-center justify-between bg-gray-50 p-4 rounded-xl mb-3 border border-gray-100`}
                            onPress={() => goToCategory(aisle.query)}
                        >
                            <View style={tw`flex-row items-center gap-4`}>
                                <View style={tw`w-10 h-10 rounded-lg bg-white items-center justify-center border border-gray-100`}>
                                    <Text style={tw`text-xl`}>{aisle.icon}</Text>
                                </View>
                                <Typography variant="body" bold>{aisle.name}</Typography>
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
