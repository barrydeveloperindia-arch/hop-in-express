import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { Input } from '../atoms/Input';
import { MapPin, User, ChevronDown, Search } from 'lucide-react-native';
import { COLORS } from '../../lib/theme';

export const Header = () => {
    return (
        <View style={tw`bg-white pt-14 pb-3 px-4 shadow-sm z-10 border-b border-gray-100`}>
            {/* Top Row: Location & Profile */}
            <View style={tw`flex-row justify-between items-start mb-4`}>
                <View>
                    <View style={tw`flex-row items-center`}>
                        <Typography variant="h2" style={tw`text-xl font-black mr-1`}>Eastleigh</Typography>
                        <ChevronDown size={16} color="#000" />
                    </View>
                    <Typography variant="body" style={tw`text-xs text-gray-500 font-medium`}>
                        Home • 14 Mins to 24 High St
                    </Typography>
                </View>

                <TouchableOpacity style={tw`bg-gray-100 p-2 rounded-full`}>
                    <User size={20} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View>
                <Input
                    placeholder='Search "milk"'
                    icon={<Search size={20} color={COLORS.textMuted} />}
                    style={tw`bg-gray-50 border border-gray-200`}
                />
            </View>
        </View>
    );
};
