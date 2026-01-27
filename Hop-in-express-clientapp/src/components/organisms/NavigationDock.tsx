import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import tw from '../../lib/tw';
import { Home, Search, Grid, ShoppingBag, User } from 'lucide-react-native';
import { Typography } from '../atoms/Typography';
import { COLORS } from '../../lib/theme';
import { useRouter, usePathname } from 'expo-router';

export const NavigationDock = () => {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname === path + '/';

    const NavItem = ({ icon: Icon, label, path }: { icon: any, label: string, path: string }) => {
        const active = isActive(path);
        const color = active ? COLORS.secondary : COLORS.textSub; // Gold if active, Gray if not

        return (
            <TouchableOpacity
                onPress={() => router.push(path as any)}
                style={tw`items-center justify-center flex-1 py-2`}
                activeOpacity={0.8}
            >
                <Icon size={24} color={color} strokeWidth={active ? 2.5 : 2} />
                <Typography
                    variant="tiny"
                    style={[
                        tw`mt-1 text-[10px] capitalize`,
                        { color: color, fontWeight: active ? '700' : '500' }
                    ]}
                >
                    {label}
                </Typography>
            </TouchableOpacity>
        );
    };

    return (
        <View style={tw`absolute bottom-0 left-0 right-0 bg-black border-t border-gray-900 flex-row justify-between px-2 pb-5 pt-2 shadow-lg z-50`}>
            <NavItem icon={Home} label="Home" path="/" />
            <NavItem icon={Grid} label="Categories" path="/categories" />
            <NavItem icon={Search} label="Search" path="/search" />
            {/* Bag has a special 'Print' icon feel in Blinkit, usually just Bag */}
            <NavItem icon={ShoppingBag} label="Bag" path="/cart" />
            <NavItem icon={User} label="Account" path="/account" />
        </View>
    );
};
