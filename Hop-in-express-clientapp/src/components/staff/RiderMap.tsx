import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { Typography } from '../atoms/Typography';
import tw from '../../lib/tw';
import { User, ShieldCheck } from 'lucide-react-native';

const MOCK_RIDERS = [
    { id: 'rider_1', name: 'Sanjay', lat: 50.968, lng: -1.362, status: 'DELIVERING' }, // Near Eastleigh
    { id: 'rider_2', name: 'Ravi', lat: 50.965, lng: -1.355, status: 'IDLE' },
    { id: 'rider_3', name: 'John', lat: 50.961, lng: -1.365, status: 'RETURNING' },
];

const INITIAL_REGION = {
    latitude: 50.965,
    longitude: -1.360,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
};

export const RiderMap = () => {
    // On web, MapView might not work without extra configuration, so we show a placeholder or handle it.
    // However, react-native-web-maps is not installed.
    if (Platform.OS === 'web') {
        return (
            <View style={tw`h-48 bg-zinc-800 rounded-xl justify-center items-center border border-zinc-700`}>
                <Typography variant="body" color="#A1A1AA">Map View interactive on Mobile App</Typography>
            </View>
        );
    }

    return (
        <View style={tw`h-64 rounded-xl overflow-hidden border border-zinc-700 mt-6 relative`}>
            <MapView
                style={StyleSheet.absoluteFillObject}
                initialRegion={INITIAL_REGION}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                customMapStyle={DARK_MAP_STYLE}
            >
                {/* Store Location */}
                <Marker
                    coordinate={{ latitude: 50.965, longitude: -1.360 }}
                    title="Hop-In Express Hub"
                    description="Eastleigh HQ"
                >
                    <View style={tw`bg-green-500 p-1.5 rounded-full border-2 border-white`}>
                        <ShieldCheck size={16} color="white" />
                    </View>
                </Marker>

                {/* Riders */}
                {MOCK_RIDERS.map(rider => (
                    <Marker
                        key={rider.id}
                        coordinate={{ latitude: rider.lat, longitude: rider.lng }}
                        title={rider.name}
                        description={rider.status}
                    >
                        <View style={tw`items-center`}>
                            <View style={[
                                tw`p-1 rounded-full border border-white shadow-sm`,
                                rider.status === 'IDLE' ? tw`bg-blue-500` : tw`bg-orange-500`
                            ]}>
                                <User size={12} color="white" />
                            </View>
                            <View style={tw`bg-black/70 px-1 py-0.5 rounded mt-0.5`}>
                                <Typography variant="tiny" style={{ fontSize: 8, color: 'white' }}>{rider.name}</Typography>
                            </View>
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* Overlay UI */}
            <View style={tw`absolute top-3 left-3 bg-black/60 px-2 py-1 rounded border border-white/10`}>
                <Typography variant="tiny" color="#FFF">LIVE FLEET VIEW</Typography>
            </View>
        </View>
    );
};

// Minimal Dark Mode Style for Google Maps
const DARK_MAP_STYLE = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#212121" }]
    },
    {
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#212121" }]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#181818" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#1b1b1b" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#2c2c2c" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#8a8a8a" }]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [{ "color": "#373737" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{ "color": "#3c3c3c" }]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [{ "color": "#4e4e4e" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#000000" }]
    }
];
