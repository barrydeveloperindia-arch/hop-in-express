import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, Search, ShoppingBag, User, LayoutGrid } from 'lucide-react-native';
import tw from '../../lib/tw';
import { useRouter, usePathname } from 'expo-router';

export const FloatingTabDock = () => {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    return (
        <View style={tw`absolute bottom-8 w-full items-center z-50`}>
            <BlurView
                intensity={60}
                tint="dark"
                style={tw`flex-row items-center justify-between px-6 py-4 rounded-full overflow-hidden border border-white/10 w-[90%] bg-black/60 shadow-2xl shadow-black`}
            >
                <TouchableOpacity onPress={() => router.push('/')} style={tw`items-center justify-center opacity-${isActive('/') ? '100' : '50'}`}>
                    <Home size={22} color="#fff" />
                    <Text style={tw`text-[9px] text-white mt-1 font-medium`}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/categories')} style={tw`items-center justify-center opacity-${isActive('/categories') ? '100' : '50'}`}>
                    <LayoutGrid size={22} color="#fff" />
                    <Text style={tw`text-[9px] text-white mt-1 font-medium`}>Aisles</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/search')} style={tw`items-center justify-center opacity-${isActive('/search') ? '100' : '50'}`}>
                    <Search size={22} color="#fff" />
                    <Text style={tw`text-[9px] text-white mt-1 font-medium`}>Search</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/cart')} style={tw`items-center justify-center opacity-${isActive('/cart') ? '100' : '50'}`}>
                    <View>
                        <ShoppingBag size={22} color="#fff" />
                        {/* Badge */}
                        <View style={tw`absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border border-black`} />
                    </View>
                    <Text style={tw`text-[9px] text-white mt-1 font-medium`}>Bag</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/account')} style={tw`items-center justify-center opacity-${isActive('/account') ? '100' : '50'}`}>
                    <User size={22} color="#fff" />
                    <Text style={tw`text-[9px] text-white mt-1 font-medium`}>You</Text>
                </TouchableOpacity>
            </BlurView>
        </View>
    );
};
