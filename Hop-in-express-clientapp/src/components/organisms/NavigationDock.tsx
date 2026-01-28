import React from 'react';
import { View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import tw from '../../lib/tw';
import { Home, Search, Grid, ShoppingBag, User } from 'lucide-react-native';
import { Typography } from '../atoms/Typography';
import { COLORS } from '../../lib/theme';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';

export const NavigationDock = () => {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname === path + '/';

    const NavItem = ({ icon: Icon, label, path }: { icon: any, label: string, path: string }) => {
        const active = isActive(path);
        const color = active ? COLORS.textMain : COLORS.textMuted;

        return (
            <TouchableOpacity
                onPress={() => router.push(path as any)}
                style={tw`items-center justify-center flex-1 py-1`}
                activeOpacity={0.7}
            >
                {/* Active Indicator Dot */}
                {active && (
                    <View style={tw`absolute -top-3 w-8 h-1 bg-black rounded-b-lg`} />
                )}

                <View style={tw`${active ? 'scale-110' : 'scale-100'} transition-transform items-center`}>
                    <Icon size={24} color={color} strokeWidth={active ? 2.5 : 2} />
                    <Typography
                        variant="tiny"
                        style={[
                            tw`mt-1 text-[9px] capitalize`,
                            { color: color, fontWeight: active ? '800' : '500' }
                        ]}
                    >
                        {label}
                    </Typography>
                </View>
            </TouchableOpacity>
        );
    };

    if (Platform.OS === 'android') {
        // Android fallback (or high-end Android blur if aligned)
        // Using a sleek semi-transparent white implementation for compatibility
        return (
            <View style={[
                tw`absolute bottom-0 left-0 right-0 flex-row justify-between px-2 pb-4 pt-3 z-50`,
                { backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }
            ]}>
                <NavItem icon={Home} label="Home" path="/" />
                <NavItem icon={Grid} label="Categories" path="/categories" />
                <NavItem icon={Search} label="Search" path="/search" />
                <NavItem icon={ShoppingBag} label="Bag" path="/cart" />
                <NavItem icon={User} label="Account" path="/account" />
            </View>
        );
    }

    // iOS Premium Blur
    return (
        <BlurView
            intensity={80}
            tint="light"
            style={[
                tw`absolute bottom-0 left-0 right-0 flex-row justify-between px-2 pb-6 pt-3 z-50 border-t border-gray-200/50`,
            ]}
        >
            <NavItem icon={Home} label="Home" path="/" />
            <NavItem icon={Grid} label="Categories" path="/categories" />
            <NavItem icon={Search} label="Search" path="/search" />
            <NavItem icon={ShoppingBag} label="Bag" path="/cart" />
            <NavItem icon={User} label="Account" path="/account" />
        </BlurView>
    );
};
