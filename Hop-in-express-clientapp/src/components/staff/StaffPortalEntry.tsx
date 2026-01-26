import { Typography } from '../atoms/Typography';
import { MapPin, Package, ArrowRight } from 'lucide-react-native';
import { View, TouchableOpacity } from 'react-native';
import tw from '../../lib/tw';
import { useRouter } from 'expo-router';

// Add this to HomeTemplate or Account Screen to allow access to Staff App
export const StaffPortalEntry = () => {
    const router = useRouter();
    return (
        <TouchableOpacity
            onPress={() => router.push('/staff')}
            style={tw`mx-4 mt-8 bg-zinc-800 p-4 rounded-xl border border-zinc-700 flex-row items-center justify-between`}
        >
            <View style={tw`flex-row items-center`}>
                <View style={tw`bg-green-500 p-2 rounded-lg mr-3`}>
                    <Package size={20} color="#FFF" />
                </View>
                <View>
                    <Typography variant="h3" color="#FFF">Staff Portal</Typography>
                    <Typography variant="caption" color="gray">Store #EST-001 • Authorized Only</Typography>
                </View>
            </View>
            <ArrowRight size={20} color="#FFF" />
        </TouchableOpacity>
    );
};
