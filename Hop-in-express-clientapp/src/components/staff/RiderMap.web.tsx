import React from 'react';
import { View } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';

export const RiderMap = () => {
    return (
        <View style={tw`h-48 bg-zinc-800 rounded-xl justify-center items-center border border-zinc-700`}>
            <Typography variant="body" color="#A1A1AA">Map View interactive on Mobile App</Typography>
        </View>
    );
};
