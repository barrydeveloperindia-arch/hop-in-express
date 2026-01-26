import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { HomeTemplate } from '../src/components/templates/HomeTemplate';
import { useInventory } from '../src/hooks/useInventory';
import tw from '../src/lib/tw';

export default function App() {
    const { inventory, loading } = useInventory();

    if (loading) {
        return (
            <View style={tw`flex-1 items-center justify-center bg-white`}>
                <ActivityIndicator size="large" color="#0C831F" />
            </View>
        );
    }

    return (
        <HomeTemplate inventory={inventory} />
    );
}
