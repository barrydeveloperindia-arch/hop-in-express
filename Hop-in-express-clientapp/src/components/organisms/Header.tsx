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
        <View style={tw`bg-white pt-14 pb-3 px-4 shadow-sm z-10 border-b border-gray-100`}>
            {/* Top Row: Location & Profile */}
            <View style={tw`flex-row justify-between items-start mb-4`}>
                <View>
                    <View style={tw`flex-row items-center`}>
                        <Typography variant="h2" style={tw`text-xl font-black mr-1`}>Eastleigh</Typography>
                        <ChevronDown size={16} color="#000" />
                    </View>
                    <View style={tw`flex-row items-center mt-1`}>
                        <Typography variant="body" style={tw`text-xs text-gray-800 font-bold bg-gray-100 px-2 py-0.5 rounded-md overflow-hidden mr-1`}>
                            ⏱ 10 MINS
                        </Typography>
                        <Typography variant="body" style={tw`text-xs text-gray-500`}>to Home</Typography>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/account')}
                    style={tw`bg-gray-100 p-2 rounded-full`}
                >
                    <User size={20} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push('/search')}
                style={tw`relative`}
            >
                <View style={tw`pointer-events-none`}>
                    <Input
                        placeholder='Search "milk", "bread"...'
                        icon={<Search size={20} color={COLORS.textMuted} />}
                        style={tw`bg-gray-50 border border-gray-200`}
                        editable={false} // Important: prevent keyboard, just navigate
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
};
