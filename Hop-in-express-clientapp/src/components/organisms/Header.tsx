import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { Input } from '../atoms/Input';
import { MapPin, User, ChevronDown, Search } from 'lucide-react-native';
import { COLORS } from '../../lib/theme';
import { LogisticsService } from '../../services/logistics/LogisticsService.v1';
import { useRouter } from 'expo-router';

export const Header = () => {
    const [eta, setEta] = useState<number>(15);
    const router = useRouter();

    useEffect(() => {
        const userLoc = { lat: 50.9650, lng: -1.3600 };
        const time = LogisticsService.calculateDeliveryTime(userLoc);
        setEta(time);
    }, []);

    return (
        <View style={tw`bg-white pt-14 pb-2 px-4 shadow-sm z-10 border-b border-gray-100`}>
            {/* Top Row: Location & Profile */}
            <View style={tw`flex-row justify-between items-center mb-3`}>
                <View>
                    <View style={tw`flex-row items-center`}>
                        <MapPin size={18} color={COLORS.primary} style={tw`mr-1`} />
                        <Typography variant="h2" style={tw`text-lg font-black mr-1`}>Eastleigh</Typography>
                        <ChevronDown size={18} color="#000" />
                    </View>
                    <Typography variant="body" style={tw`text-[11px] text-gray-500 font-medium ml-6`}>10 Minutes to Home</Typography>
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/account')}
                    style={tw`bg-gray-50 p-2.5 rounded-full border border-gray-100`}
                >
                    <User size={20} color="#1F2937" />
                </TouchableOpacity>
            </View>

            {/* Search Bar - Squircle & Soft */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push('/search')}
                style={tw`relative`}
            >
                <View style={tw`pointer-events-none`}>
                    <Input
                        placeholder='Search "milk", "bread"...'
                        icon={<Search size={18} color={COLORS.textMuted} />}
                        containerStyle={tw`bg-gray-50 border-0 rounded-xl h-11 pr-4`} // Use containerStyle for the box
                        style={tw`font-medium text-[15px]`} // Use style for the text input
                        editable={false}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
};
