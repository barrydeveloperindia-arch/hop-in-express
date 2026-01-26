import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Image, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../src/lib/tw';
// Live Inventory Hook
import { useInventory } from '../src/hooks/useInventory';
import { Search as SearchIcon, X, ArrowRight } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Typography } from '../src/components/atoms/Typography';
import { Input } from '../src/components/atoms/Input';
import { COLORS } from '../src/lib/theme';

// Vernacular Mapping Mock
const SYNONYMS: Record<string, string> = {
    'bhindi': 'Okra',
    'atta': 'Flour',
    'namkeen': 'Snacks',
    'thums': 'Thums Up',
    'rubicon': 'Beverages'
};

export default function SearchScreen() {
    const params = useLocalSearchParams(); // <--- Get params
    const initialQuery = Array.isArray(params.q) ? params.q[0] : (params.q || '');

    const [query, setQuery] = useState(initialQuery);
    const router = useRouter();
    const { inventory, loading } = useInventory();

    useEffect(() => {
        if (params.q) {
            setQuery(Array.isArray(params.q) ? params.q[0] : params.q);
        }
    }, [params.q]);

    // Smart Search Logic
    const normalizedQuery = query.toLowerCase().trim();
    // Check for synonym or strict match
    const effectiveQuery = SYNONYMS[normalizedQuery] ? SYNONYMS[normalizedQuery].toLowerCase() : normalizedQuery;

    const results = inventory.filter(p =>
        p.name.toLowerCase().includes(effectiveQuery) ||
        p.brand.toLowerCase().includes(effectiveQuery) ||
        p.category.toLowerCase().includes(effectiveQuery)
    );

    return (
        <View style={tw`flex-1 bg-white`}>
            <StatusBar style="dark" />

            {/* Search Header */}
            <View style={tw`pt-14 pb-4 px-4 flex-row gap-3 items-center bg-white border-b border-gray-100`}>
                <View style={tw`flex-1 h-12 bg-gray-100 rounded-xl flex-row items-center px-4 border border-transparent`}>
                    <SearchIcon size={20} color={COLORS.textMuted} />
                    <TextInput
                        placeholder="Search for 'Bhindi', 'Atta'..."
                        placeholderTextColor={COLORS.textMuted}
                        style={tw`flex-1 ml-3 text-black text-base`}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <X size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={() => router.back()}>
                    <Typography variant="body" style={tw`font-medium text-black`}>Cancel</Typography>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={tw`p-4`}>
                {query.length === 0 ? (
                    // Empty State / Suggestions
                    <View>
                        {/* Quick Tags */}
                        <View style={tw`mb-8`}>
                            <Typography variant="h3" style={tw`mb-3 text-gray-800`}>Popular Searches</Typography>
                            <View style={tw`flex-row flex-wrap gap-2`}>
                                {['Milk', 'Bread', 'Eggs', 'Coke', 'Chips', 'Rice', 'Paneer', 'Chocolate'].map(tag => (
                                    <TouchableOpacity
                                        key={tag}
                                        onPress={() => setQuery(tag)}
                                        style={tw`bg-gray-50 px-4 py-2 rounded-full border border-gray-200`}
                                    >
                                        <Typography variant="body" color={COLORS.textInvert}>{tag}</Typography>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Visual Categories Shortlist */}
                        <Typography variant="h3" style={tw`mb-3 text-gray-800`}>Browse Aisles</Typography>
                        <View style={tw`flex-row flex-wrap justify-between`}>
                            {[
                                { name: 'Fresh Veg', query: 'Veg', emoji: '🥦' },
                                { name: 'Fruits', query: 'Fruit', emoji: '🍎' },
                                { name: 'Drinks', query: 'Drinks', emoji: '🥤' },
                                { name: 'Snacks', query: 'Snacks', emoji: '🍟' },
                                { name: 'Sweet Tooth', query: 'Confectionery', emoji: '🍫' },
                                { name: 'Essential', query: 'Milk', emoji: '🥛' },
                            ].map((cat, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={tw`w-[31%] mb-3 bg-gray-50 rounded-xl p-3 items-center border border-gray-100`}
                                    onPress={() => setQuery(cat.query)}
                                >
                                    <Text style={tw`text-2xl mb-1`}>{cat.emoji}</Text>
                                    <Typography variant="tiny" style={tw`text-center font-medium`}>{cat.name}</Typography>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    // Results
                    <View>
                        <Typography variant="body" style={tw`mb-4 text-gray-800`}>
                            Found {results.length} results
                            {SYNONYMS[normalizedQuery] && <Typography variant="caption" style={tw`text-indigo-600 italic`}> (mapped from "{query}")</Typography>}
                        </Typography>

                        {results.map(product => (
                            <TouchableOpacity
                                key={product.id}
                                onPress={() => router.push(`/product/${product.id}`)}
                                style={tw`flex-row items-center bg-white p-2 rounded-xl mb-3 border border-gray-100 shadow-sm`}
                            >
                                <View style={tw`w-16 h-16 rounded-lg bg-gray-50 items-center justify-center border border-gray-100`}>
                                    <Image source={{ uri: product.image }} style={tw`w-12 h-12`} resizeMode="contain" />
                                </View>
                                <View style={tw`flex-1 ml-4`}>
                                    <Typography variant="h3">{product.name}</Typography>
                                    <View style={tw`flex-row items-center gap-2 mt-1`}>
                                        <Typography variant="price">£{(product.memberPrice ?? product.price).toFixed(2)}</Typography>
                                        <Typography variant="tiny" style={tw`text-gray-400 line-through`}>£{product.price.toFixed(2)}</Typography>
                                    </View>
                                </View>
                                <View style={tw`w-8 h-8 rounded-full bg-gray-50 items-center justify-center`}>
                                    <ArrowRight size={16} color={COLORS.primary} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
