import React, { useEffect, useState } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, Dimensions, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X } from 'lucide-react-native';
import { UserProfile } from '../../services/user/UserProfileService';

const { height } = Dimensions.get('window');

interface EditProfileSheetProps {
    visible: boolean;
    onClose: () => void;
    profile: UserProfile | null;
    onSave: (data: Partial<UserProfile>) => Promise<void>;
}

export const EditProfileSheet: React.FC<EditProfileSheetProps> = ({ visible, onClose, profile, onSave }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (visible && profile) {
            setName(profile.displayName || '');
            setPhone(profile.phone || '');
            setEmail(profile.email || '');
        }
    }, [visible, profile]);

    const handleSave = async () => {
        if (!name || !phone) {
            Alert.alert("Missing Details", "Name and Phone are required.");
            return;
        }

        setSaving(true);
        try {
            await onSave({
                displayName: name,
                phone,
                email
            });
            onClose();
        } catch (error) {
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={tw`flex-1 bg-black/50 justify-end`}
            >
                <View style={[tw`bg-white rounded-t-3xl p-5`, { height: height * 0.6 }]}>

                    {/* Header */}
                    <View style={tw`flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4`}>
                        <Typography variant="h2">Edit Profile</Typography>
                        <TouchableOpacity onPress={onClose} style={tw`p-2 bg-gray-100 rounded-full`}>
                            <X size={20} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={tw`pb-10`}>
                        <Typography variant="caption" style={tw`mb-1 uppercase text-gray-500 font-bold text-[10px]`}>Full Name</Typography>
                        <Input
                            placeholder="Your Name"
                            value={name}
                            onChangeText={setName}
                            containerStyle={tw`mb-4`}
                        />

                        <Typography variant="caption" style={tw`mb-1 uppercase text-gray-500 font-bold text-[10px]`}>Mobile Number</Typography>
                        <Input
                            placeholder="Phone"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            containerStyle={tw`mb-4`}
                        />

                        <Typography variant="caption" style={tw`mb-1 uppercase text-gray-500 font-bold text-[10px]`}>Email Address</Typography>
                        <Input
                            placeholder="Email (Optional)"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            containerStyle={tw`mb-6`}
                        />

                        <Button
                            label={saving ? "Saving..." : "Save Changes"}
                            onPress={handleSave}
                            disabled={saving || !name || !phone}
                            size="l"
                        />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};
