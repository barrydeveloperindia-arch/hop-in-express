import React from 'react';
import { View, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X, MapPin, CreditCard, Wallet, Banknote } from 'lucide-react-native';

const { height } = Dimensions.get('window');

interface GuestCheckoutSheetProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (details: { name: string; phone: string; address: string; notes: string; paymentMethod: string }) => void;
    total: number;
    count: number;
}

const PaymentOption = ({ id, label, icon: Icon, selected, onSelect }: any) => (
    <TouchableOpacity
        onPress={() => onSelect(id)}
        style={tw`flex-1 p-3 rounded-xl border ${selected ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'} items-center mr-2`}
    >
        <Icon size={24} color={selected ? '#16A34A' : '#6B7280'} />
        <Typography variant="caption" style={tw`mt-2 font-medium ${selected ? 'text-green-700' : 'text-gray-500'}`}>{label}</Typography>
    </TouchableOpacity>
)

export const GuestCheckoutSheet: React.FC<GuestCheckoutSheetProps> = ({ visible, onClose, onSubmit, total, count }) => {
    const [name, setName] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [notes, setNotes] = React.useState('');
    const [paymentMethod, setPaymentMethod] = React.useState('card');

    const handleSubmit = () => {
        if (!name || !phone || !address) return;
        onSubmit({ name, phone, address, notes, paymentMethod });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={tw`flex-1 bg-black/50 justify-end`}>
                <View style={[tw`bg-white rounded-t-3xl p-5`, { height: height * 0.85 }]}>

                    {/* Header */}
                    <View style={tw`flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4`}>
                        <View>
                            <Typography variant="h2">Checkout</Typography>
                            <Typography variant="caption">£{total?.toFixed(2)} • {count} items</Typography>
                        </View>
                        <TouchableOpacity onPress={onClose} style={tw`p-2 bg-gray-100 rounded-full`}>
                            <X size={20} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={tw`pb-10`} showsVerticalScrollIndicator={false}>

                        {/* Guest Banner */}
                        <View style={tw`bg-blue-50 p-4 rounded-xl mb-6 flex-row items-start border border-blue-100`}>
                            <MapPin size={20} color="#1E40AF" style={tw`mt-1`} />
                            <View style={tw`ml-3 flex-1`}>
                                <Typography variant="h3" style={tw`text-blue-900`}>Guest Checkout</Typography>
                                <Typography variant="caption" style={tw`text-blue-700 leading-5 mt-1`}>
                                    Quick delivery. Sign up later to earn points.
                                </Typography>
                            </View>
                        </View>

                        <Typography variant="h3" style={tw`mb-3 text-gray-700 uppercase text-[10px]`}>Contact Info</Typography>
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

                        <Typography variant="h3" style={tw`mb-3 text-gray-700 uppercase text-[10px]`}>Delivery Address</Typography>
                        <Input
                            placeholder="Full Address (House, Postcode)"
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
                            containerStyle={tw`mb-6`}
                        />

                        <Typography variant="h3" style={tw`mb-3 text-gray-700 uppercase text-[10px]`}>Payment Method</Typography>
                        <View style={tw`flex-row mb-8`}>
                            <PaymentOption
                                id="card"
                                label="Card"
                                icon={CreditCard}
                                selected={paymentMethod === 'card'}
                                onSelect={setPaymentMethod}
                            />
                            <PaymentOption
                                id="gpay"
                                label="Google Pay"
                                icon={Wallet}
                                selected={paymentMethod === 'gpay'}
                                onSelect={setPaymentMethod}
                            />
                            <PaymentOption
                                id="cash"
                                label="Cash"
                                icon={Banknote}
                                selected={paymentMethod === 'cash'}
                                onSelect={setPaymentMethod}
                            />
                        </View>

                        <View style={tw`mt-2`}>
                            <Button
                                label={`Pay £${total?.toFixed(2)}`}
                                onPress={handleSubmit}
                                size="l"
                                disabled={!name || !phone || !address}
                            />
                            <View style={tw`flex-row justify-center mt-3 items-center`}>
                                <Typography variant="tiny" color="#9CA3AF">Secured by Stripe</Typography>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
