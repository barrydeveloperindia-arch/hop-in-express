import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingCart, ChevronLeft, Share } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import tw from '../../src/lib/tw';
import { INVENTORY } from '../../src/lib/mockInventory';

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Find product or fallback to Banana if not found (for dev safety)
    const product = INVENTORY.find(p => p.id === id) || INVENTORY[INVENTORY.length - 1];

    return (
        <View style={tw`flex-1 bg-midnight-900`}>
            <StatusBar style="light" />

            {/* Header */}
            <BlurView intensity={20} tint="dark" style={tw`absolute top-0 w-full z-50 pt-14 pb-4 px-6 flex-row justify-between items-center`}>
                <TouchableOpacity onPress={() => router.back()} style={tw`w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/10`}>
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={tw`text-white text-lg font-heading`}>Product Detail</Text>
                <TouchableOpacity style={tw`w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/10`}>
                    <Share size={20} color="#fff" />
                </TouchableOpacity>
            </BlurView>

            {/* Full Screen Product Image */}
            <View style={tw`absolute top-0 w-full h-[75%]`}>
                <Image
                    source={{ uri: product.image }}
                    style={tw`w-full h-full`}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.2)', 'transparent', 'rgba(5,5,5,0.8)', '#050505']}
                    style={tw`absolute top-0 w-full h-full`}
                    locations={[0, 0.4, 0.85, 1]}
                />
            </View>

            {/* Bottom Glass Card Area */}
            <View style={tw`absolute bottom-0 w-full h-[40%] justify-end`}>
                <BlurView
                    intensity={80}
                    tint="dark"
                    style={tw`mx-4 mb-8 p-6 rounded-[40px] overflow-hidden border border-white/10 bg-black/40 shadow-2xl shadow-indigo-500/10`}
                >
                    {/* Pull Bar Indicator */}
                    <View style={tw`w-10 h-1 bg-white/30 rounded-full self-center mb-6`} />

                    {/* Tags */}
                    <View style={tw`flex-row gap-2 mb-4`}>
                        {product.tags.map(tag => (
                            <View key={tag} style={tw`px-3 py-1 rounded-full bg-white/10 border border-white/10`}>
                                <Text style={tw`text-white text-[10px] uppercase font-bold tracking-wider`}>{tag}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={tw`text-white text-4xl font-heading mb-2 leading-tight`}>{product.name}</Text>

                    <View style={tw`flex-row items-baseline gap-2 mb-8`}>
                        <Text style={tw`text-zinc-300 text-2xl font-medium`}>£{product.memberPrice.toFixed(2)}</Text>
                        <Text style={tw`text-indigo-400 text-sm font-bold uppercase tracking-wide`}>Member Price</Text>
                        {product.memberPrice < product.price && (
                            <Text style={tw`text-zinc-600 text-sm line-through ml-2`}>£{product.price.toFixed(2)}</Text>
                        )}
                    </View>

                    <TouchableOpacity activeOpacity={0.8} style={tw`w-full h-16 rounded-[24px] items-center justify-center flex-row gap-3 shadow-lg shadow-indigo-500/40 border border-white/10 overflow-hidden relative`}>
                        <LinearGradient
                            colors={['#4F46E5', '#4338CA']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={tw`absolute w-full h-full`}
                        />
                        <Text style={tw`text-white font-bold text-base tracking-wide z-10`}>Add to Basket</Text>
                        <ShoppingCart size={20} color="#FFF" style={tw`z-10`} />
                    </TouchableOpacity>
                </BlurView>
            </View>
        </View>
    );
}
