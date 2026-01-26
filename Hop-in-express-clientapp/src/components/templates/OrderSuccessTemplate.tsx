import React, { useEffect, useState } from 'react';
import { View, Image, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Check, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export const OrderSuccessTemplate = () => {
    const router = useRouter();
    const [scale] = useState(new Animated.Value(0));
    const [fade] = useState(new Animated.Value(0));

    useEffect(() => {
        // Hyperspeed Entry Animation
        Animated.parallel([
            Animated.spring(scale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true
            }),
            Animated.timing(fade, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true
            })
        ]).start();

        // Auto-redirect to tracking
        const timer = setTimeout(() => {
            router.push('/tracking/123');
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={tw`flex-1 bg-green-600 items-center justify-center p-6`}>
            <StatusBar style="light" />

            <Animated.View style={[tw`bg-white w-24 h-24 rounded-full items-center justify-center mb-8`, { transform: [{ scale }] }]}>
                <Check size={48} color="#16A34A" strokeWidth={4} />
            </Animated.View>

            <Animated.View style={{ opacity: fade, alignItems: 'center' }}>
                <Typography variant="h1" color="#FFF" style={tw`text-3xl mb-2 text-center`}>Order Placed!</Typography>
                <Typography variant="body" color="#D1FAE5" style={tw`text-center mb-8 text-lg`}>
                    Superfast delivery initiated.{"\n"}Hold tight!
                </Typography>

                <View style={tw`bg-white/20 px-6 py-3 rounded-full flex-row items-center`}>
                    <Typography variant="caption" color="#FFF" style={tw`font-bold tracking-widest uppercase`}>Redirecting to Tracker</Typography>
                    <ArrowRight size={16} color="#FFF" style={tw`ml-2`} />
                </View>
            </Animated.View>
        </View>
    );
};
