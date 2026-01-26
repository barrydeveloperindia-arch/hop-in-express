import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { MapPin, Phone, MessageSquare, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Simulated Map Background (Static for Web/MVP, Real Mapbox in Prod)
const MAP_IMAGE = 'https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-1.3600,50.9650,14,0,0/800x1200@2x?access_token=pk.mock';
// Since we don't have a real token, we use a placeholder or generic map image for the demo
const FALLBACK_MAP = 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif'; // Dynamic looking fallback

export const LiveTrackingTemplate = () => {
    const router = useRouter();
    const [status, setStatus] = useState('PACKING'); // PACKING, ON_WAY, ARRIVED
    const [eta, setEta] = useState(12);

    useEffect(() => {
        // Simulation Timeline
        const t1 = setTimeout(() => { setStatus('ON_WAY'); setEta(9); }, 3000);
        const t2 = setTimeout(() => { setEta(6); }, 6000);
        const t3 = setTimeout(() => { setEta(2); }, 9000);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    return (
        <View style={tw`flex-1 bg-gray-100`}>
            <StatusBar style="dark" />

            {/* Simulated Map View */}
            <View style={tw`flex-1 bg-blue-50 relative overflow-hidden`}>
                {/* We use a static image for web simulation of a map */}
                <Image
                    source={{ uri: 'https://images.pexels.com/photos/3183186/pexels-photo-3183186.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }} // Generic Map/Office Abstract
                    style={tw`w-full h-full opacity-50`}
                    resizeMode="cover"
                />

                {/* Rider Marker (Animated roughly) */}
                <View style={tw`absolute top-[40%] left-[40%] bg-white p-1.5 rounded-full shadow-xl border-2 border-indigo-600`}>
                    <View style={tw`bg-indigo-600 p-2 rounded-full`}>
                        <Clock size={20} color="#FFF" />
                    </View>
                    <View style={tw`absolute -top-10 -left-10 bg-white px-3 py-1 rounded-lg shadow`}>
                        <Typography variant="tiny" style={tw`font-bold`}>Dave • {eta} mins</Typography>
                    </View>
                </View>

                {/* You Marker */}
                <View style={tw`absolute bottom-[40%] right-[30%] items-center`}>
                    <MapPin size={40} color="#EF4444" fill="#FECACA" />
                    <View style={tw`bg-white px-2 py-1 rounded shadow mt-1`}>
                        <Typography variant="tiny" style={tw`font-bold`}>Home</Typography>
                    </View>
                </View>
            </View>

            {/* Bottom Sheet - Status */}
            <View style={tw`bg-white rounded-t-3xl shadow-2xl p-6 pb-10 absolute bottom-0 w-full`}>
                <View style={tw`self-center w-12 h-1 bg-gray-300 rounded-full mb-6`} />

                <View style={tw`flex-row justify-between items-center mb-6`}>
                    <View>
                        <Typography variant="body" color="#9CA3AF" style={tw`mb-1 uppercase tracking-widest text-xs font-bold`}>Arriving in</Typography>
                        <Typography variant="h1" style={tw`text-4xl`}>{eta} <Typography variant="h2" color="#9CA3AF">mins</Typography></Typography>
                    </View>
                    <Image
                        source={{ uri: 'https://images.pexels.com/photos/1036856/pexels-photo-1036856.jpeg?auto=compress&cs=tinysrgb&w=300' }} // Rider/Helmet
                        style={tw`w-14 h-14 rounded-full border-2 border-gray-100 bg-gray-50`}
                    />
                </View>

                {/* Tracking Progress */}
                <View style={tw`flex-row gap-2 mb-8`}>
                    <View style={tw`flex-1 h-1.5 rounded-full bg-green-500`} />
                    <View style={tw`flex-1 h-1.5 rounded-full ${status === 'ON_WAY' ? 'bg-green-500' : 'bg-gray-200'}`} />
                    <View style={tw`flex-1 h-1.5 rounded-full bg-gray-200`} />
                    <View style={tw`flex-1 h-1.5 rounded-full bg-gray-200`} />
                </View>

                <Typography variant="h3" style={tw`mb-1`}>Dave is on the way</Typography>
                <Typography variant="body" color="#666" style={tw`mb-6`}>He's picked up your order from Eastleigh Dark Store.</Typography>

                <View style={tw`flex-row gap-4`}>
                    <TouchableOpacity style={tw`flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center`}>
                        <Phone size={20} color="#000" />
                        <Typography variant="h3" style={tw`ml-2`}>Call</Typography>
                    </TouchableOpacity>
                    <TouchableOpacity style={tw`flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center`}>
                        <MessageSquare size={20} color="#000" />
                        <Typography variant="h3" style={tw`ml-2`}>Chat</Typography>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
