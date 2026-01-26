import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { Input } from '../atoms/Input';
import { MapPin, User, ChevronDown, Search } from 'lucide-react-native';
import { COLORS } from '../../lib/theme';
import { LogisticsService } from '../../services/logistics/LogisticsService.v1';

export const Header = () => {
    const [eta, setEta] = useState<number>(15); // Default legacy

    useEffect(() => {
        // Simulate User Location in Eastleigh (Near the Dark Store)
        const userLoc = { lat: 50.9650, lng: -1.3600 };
        const time = LogisticsService.calculateDeliveryTime(userLoc);
        setEta(time);
    }, []);

    return (
        <View style={tw`bg - white pt - 14 pb - 3 px - 4 shadow - sm z - 10 border - b border - gray - 100`}>
            {/* Top Row: Location & Profile */}
            <View style={tw`flex - row justify - between items - start mb - 4`}>
                <View>
                    <View style={tw`flex - row items - center`}>
                        <Typography variant="h2" style={tw`text - xl font - black mr - 1`}>Eastleigh</Typography>
                        <ChevronDown size={16} color="#000" />
                    </View>
                    <Typography variant="body" style={tw`text - xs text - gray - 500 font - medium`}>
                        Home • <strong>{eta} MINS</strong> to 24 High St
                    </Typography>
                </View>

                <TouchableOpacity style={tw`bg - gray - 100 p - 2 rounded - full`}>
                    <User size={20} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View>
                <Input
                    placeholder='Search "milk"'
                    icon={<Search size={20} color={COLORS.textMuted} />}
                    style={tw`bg - gray - 50 border border - gray - 200`}
                />
            </View>
        </View>
    );
};
