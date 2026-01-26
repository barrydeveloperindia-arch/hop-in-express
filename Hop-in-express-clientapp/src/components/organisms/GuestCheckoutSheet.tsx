import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X, MapPin } from 'lucide-react-native';

const { height } = Dimensions.get('window');

interface GuestCheckoutSheetProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (details: { name: string; phone: string; address: string; notes: string }) => void;
}

export const GuestCheckoutSheet: React.FC<GuestCheckoutSheetProps> = ({ visible, onClose, onSubmit }) => {
    const [name, setName] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [notes, setNotes] = React.useState('');

    const handleSubmit = () => {
        if (!name || !phone || !address) return;
        onSubmit({ name, phone, address, notes });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={tw`flex-1 bg-black/50 justify-end`}>
                <View style={[tw`bg-white rounded-t-3xl p-5`, { height: height * 0.75 }]}>

                    {/* Header */}
                    <View style={tw`flex-row justify-between items-center mb-6`}>
                        <Typography variant="h2">Delivery Details</Typography>
                        <TouchableOpacity onPress={onClose} style={tw`p-2 bg-gray-100 rounded-full`}>
                            <X size={20} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={tw`pb-10`}>
                        <View style={tw`bg-blue-50 p-4 rounded-xl mb-6 flex-row items-start`}>
                            <MapPin size={20} color="#1E40AF" style={tw`mt-1`} />
                            <View style={tw`ml-3 flex-1`}>
                                <Typography variant="h3" style={tw`text-blue-900`}>Guest Checkout</Typography>
                                <Typography variant="caption" style={tw`text-blue-700 leading-5 mt-1`}>
                                    We'll save these details for this order only. Sign up later to track your history.
                                </Typography>
                            </View>
                        </View>

                        <Typography variant="h3" style={tw`mb-2 text-gray-700 uppercase text-[10px]`}>Contact Info</Typography>
                        <Input
                            placeholder="Full Name"
                            value={name}
                            onChangeText={setName}
                            containerStyle={tw`mb-4`}
                        />
                        <Input
                            placeholder="Mobile Number"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            containerStyle={tw`mb-6`}
                        />

                        <Typography variant="h3" style={tw`mb-2 text-gray-700 uppercase text-[10px]`}>Delivery Address</Typography>
                        <Input
                            placeholder="Full Address (House, Street, Postcode)"
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            numberOfLines={3}
                            containerStyle={tw`mb-4 h-24`}
                        />
                        <Input
                            placeholder="Delivery Instructions (Optional)"
                            value={notes}
                            onChangeText={setNotes}
                            containerStyle={tw`mb-4`}
                        />

                        <View style={tw`mt-4`}>
                            <Button
                                label="Confirm & Pay"
                                onPress={handleSubmit}
                                size="l"
                                disabled={!name || !phone || !address}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
