import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import tw from '../src/lib/tw'; // Adjust import if needed, assuming direct export
import { INVENTORY } from '../src/lib/mockInventory';
import { Search as SearchIcon, X, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Vernacular Mapping Mock
const SYNONYMS: Record<string, string> = {
    'bhindi': 'Okra',
    'atta': 'Flour',
    'namkeen': 'Snacks',
    'thums': 'Thums Up',
    'rubicon': 'Beverages'
};

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    // Smart Search Logic
    const normalizedQuery = query.toLowerCase().trim();
    // Check for synonym or strict match
    const effectiveQuery = SYNONYMS[normalizedQuery] ? SYNONYMS[normalizedQuery].toLowerCase() : normalizedQuery;

    const results = INVENTORY.filter(p =>
        p.name.toLowerCase().includes(effectiveQuery) ||
        p.brand.toLowerCase().includes(effectiveQuery) ||
        p.category.toLowerCase().includes(effectiveQuery)
    );

    return (
        <View style={tw`flex-1 bg-black`}>
            <StatusBar style="light" />

            {/* Search Header */}
            <View style={tw`pt-14 pb-4 px-6 flex-row gap-3 items-center bg-zinc-900 border-b border-white/10`}>
                <View style={tw`flex-1 h-12 bg-black rounded-2xl flex-row items-center px-4 border border-white/10`}>
                    <SearchIcon size={20} color="#6B7280" />
                    <TextInput
                        placeholder="Search for 'Bhindi', 'Atta'..."
                        placeholderTextColor="#6B7280"
                        style={tw`flex-1 ml-3 text-white text-base`}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <X size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={tw`text-white text-sm font-medium`}>Cancel</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={tw`p-6`}>
                {query.length === 0 ? (
                    // Empty State / Suggestions
                    <View>
                        <Text style={tw`text-zinc-500 uppercase tracking-widest text-xs font-bold mb-4`}>Quick Actions</Text>
                        <View style={tw`flex-row flex-wrap gap-2`}>
                            {['Bhindi', 'Thums Up', 'Atta', 'Haldirams'].map(tag => (
                                <TouchableOpacity key={tag} onPress={() => setQuery(tag)} style={tw`bg-zinc-800 px-4 py-2 rounded-full border border-white/5`}>
                                    <Text style={tw`text-zinc-300 text-sm`}>{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    // Results
                    <View>
                        <Text style={tw`text-white mb-4`}>
                            Found {results.length} results
                            {SYNONYMS[normalizedQuery] && <Text style={tw`text-indigo-400 italic`}> (mapped from "{query}")</Text>}
                        </Text>

                        {results.map(product => (
                            <TouchableOpacity
                                key={product.id}
                                onPress={() => router.push(`/product/${product.id}`)}
                                style={tw`flex-row items-center bg-zinc-900 p-3 rounded-2xl mb-3 border border-white/5`}
                            >
                                <Image source={{ uri: product.image }} style={tw`w-16 h-16 rounded-xl bg-black`} />
                                <View style={tw`flex-1 ml-4`}>
                                    <Text style={tw`text-white font-medium`}>{product.name}</Text>
                                    <View style={tw`flex-row items-center gap-2 mt-1`}>
                                        <Text style={tw`text-indigo-400 font-bold`}>£{product.memberPrice.toFixed(2)}</Text>
                                        <Text style={tw`text-zinc-600 line-through text-xs`}>£{product.price.toFixed(2)}</Text>
                                    </View>
                                </View>
                                <View style={tw`w-8 h-8 rounded-full bg-indigo-600/20 items-center justify-center`}>
                                    <ArrowRight size={16} color="#6366F1" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
