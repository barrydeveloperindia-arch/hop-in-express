import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import tw from '../src/lib/tw';
import { INVENTORY } from '../src/lib/mockInventory';
import { ChevronLeft, Trash2, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function CartScreen() {
    const router = useRouter();

    // Mock Cart Data (Banana x2, Thums Up x6)
    const cartItems = [
        { product: INVENTORY.find(p => p.name.includes('Banana'))!, qty: 2 },
        { product: INVENTORY.find(p => p.name.includes('Thums'))!, qty: 6 },
        { product: INVENTORY.find(p => p.name.includes('Rice'))!, qty: 1 },
    ];

    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.memberPrice * item.qty), 0);
    const standardTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
    const savings = standardTotal - subtotal;

    return (
        <View style={tw`flex-1 bg-black`}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={tw`pt-14 pb-4 px-6 flex-row items-center border-b border-white/10 bg-zinc-900`}>
                <TouchableOpacity onPress={() => router.back()} style={tw`mr-4`}>
                    <ChevronLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={tw`text-white text-lg font-heading`}>Your Bag</Text>
                <View style={tw`flex-1 items-end`}>
                    <Text style={tw`text-zinc-500 text-sm`}>{cartItems.reduce((a, b) => a + b.qty, 0)} items</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={tw`p-6 pb-40`}>
                {/* Savings Banner */}
                <LinearGradient
                    colors={['#4F46E5', '#312E81']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={tw`p-4 rounded-2xl mb-6 flex-row items-center gap-3 border border-indigo-400/30`}
                >
                    <View style={tw`w-10 h-10 rounded-full bg-white/20 items-center justify-center`}>
                        <ShieldCheck size={20} color="#FFF" />
                    </View>
                    <View>
                        <Text style={tw`text-white font-bold text-lg`}>You saved £{savings.toFixed(2)}</Text>
                        <Text style={tw`text-indigo-200 text-xs`}>with Hop-In Membership</Text>
                    </View>
                </LinearGradient>

                {/* Items */}
                {cartItems.map((item, i) => (
                    <View key={i} style={tw`flex-row gap-4 mb-6 bg-zinc-900/50 p-4 rounded-2xl border border-white/5`}>
                        <Image source={{ uri: item.product.image }} style={tw`w-20 h-20 rounded-xl bg-black`} />
                        <View style={tw`flex-1 justify-between`}>
                            <View>
                                <Text style={tw`text-white font-medium text-base leading-tight`}>{item.product.name}</Text>
                                <Text style={tw`text-zinc-500 text-xs mt-1`}>{item.product.size}</Text>
                            </View>
                            <View style={tw`flex-row justify-between items-end`}>
                                <Text style={tw`text-indigo-400 font-bold`}>£{(item.product.memberPrice * item.qty).toFixed(2)}</Text>

                                {/* Qty Control Mockup */}
                                <View style={tw`flex-row items-center bg-black rounded-lg border border-white/10 px-2 py-1 gap-3`}>
                                    <Text style={tw`text-zinc-400`}>-</Text>
                                    <Text style={tw`text-white font-bold`}>{item.qty}</Text>
                                    <Text style={tw`text-white`}>+</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Checkout Dock */}
            <BlurView intensity={50} tint="dark" style={tw`absolute bottom-0 w-full px-6 pt-6 pb-10 border-t border-white/10 bg-black/60`}>
                <View style={tw`flex-row justify-between mb-2`}>
                    <Text style={tw`text-zinc-400`}>Subtotal</Text>
                    <Text style={tw`text-white font-medium`}>£{subtotal.toFixed(2)}</Text>
                </View>
                <View style={tw`flex-row justify-between mb-6`}>
                    <Text style={tw`text-zinc-400`}>Delivery</Text>
                    <Text style={tw`text-green-400`}>Free</Text>
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={tw`w-full h-14 rounded-2xl overflow-hidden relative items-center justify-center shadow-lg shadow-indigo-600/40`}
                >
                    <LinearGradient
                        colors={['#fff', '#e2e8f0']}
                        style={tw`absolute w-full h-full`}
                    />
                    <Text style={tw`text-black font-black uppercase tracking-widest text-sm`}>Checkout</Text>
                </TouchableOpacity>
            </BlurView>
        </View>
    );
}
