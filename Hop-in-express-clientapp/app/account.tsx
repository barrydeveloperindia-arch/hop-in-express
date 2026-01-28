import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from '../src/lib/tw';
import { NavigationDock } from '../src/components/organisms/NavigationDock';
import { Typography } from '../src/components/atoms/Typography';
import { Settings, CreditCard, MapPin, Heart, Clock, LogOut, ChevronRight, User as UserIcon, Edit2 } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';
import { StaffPortalEntry } from '../src/components/staff/StaffPortalEntry';
import { AuthService } from '../src/services/auth/AuthService';
import { User } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { UserProfile, UserProfileService } from '../src/services/user/UserProfileService';
import { EditProfileSheet } from '../src/components/organisms/EditProfileSheet';

export default function AccountScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const router = useRouter();

    const fetchProfile = async (currentUser: User | null) => {
        if (currentUser) {
            const p = await UserProfileService.getProfile(currentUser.uid);
            // If no profile exists yet (e.g. first login), create a local placeholder or init one
            setProfile(p || { uid: currentUser.uid, displayName: 'New User', phone: '', role: 'customer' });
        } else {
            setProfile(null);
        }
    };

    useEffect(() => {
        const u = AuthService.getCurrentUser();
        setUser(u);
        fetchProfile(u);

        const unsub = AuthService.subscribe((u) => {
            setUser(u);
            fetchProfile(u);
        });
        return () => unsub();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProfile(user);
        setRefreshing(false);
    };

    const handleLogin = async () => {
        console.log("Attempting anonymous login...");
        try {
            const u = await AuthService.loginAnonymously();
            console.log("Login success! User:", u.uid);
            setUser(u);
            // Initialize basic profile if needed
            await UserProfileService.updateProfile(u.uid, { uid: u.uid, displayName: 'Guest User', role: 'customer' });
            await fetchProfile(u);
            Alert.alert("Welcome!", "You are now logged in anonymously.");
        } catch (e) {
            console.error("Login failed:", e);
            Alert.alert("Login Failed", "Could not sign in.");
        }
    };

    const handleLogout = async () => {
        await AuthService.logout();
        setUser(null);
        setProfile(null);
        router.replace('/');
    };

    const handleUpdateProfile = async (data: Partial<UserProfile>) => {
        if (!user) return;
        await UserProfileService.updateProfile(user.uid, data);
        await fetchProfile(user); // Refresh
    };

    return (
        <View style={tw`flex-1 bg-gray-50`}>
            <StatusBar style="dark" />

            {/* Header Profile Section */}
            <View style={tw`pt-14 px-4 pb-6 bg-white border-b border-gray-100`}>
                <View style={tw`flex-row items-center gap-4`}>
                    <View style={tw`w-16 h-16 rounded-full bg-blue-100 items-center justify-center border border-blue-200`}>
                        {profile?.displayName ? (
                            <Typography variant="h2" style={tw`text-blue-600`}>{profile.displayName.charAt(0).toUpperCase()}</Typography>
                        ) : (
                            <UserIcon size={24} color={COLORS.primary} />
                        )}
                    </View>
                    <View style={tw`flex-1`}>
                        <View style={tw`flex-row items-center justify-between`}>
                            <Typography variant="h2">{profile?.displayName || 'Guest User'}</Typography>
                            {user && (
                                <TouchableOpacity onPress={() => setEditMode(true)} style={tw`p-2 bg-gray-50 rounded-full border border-gray-200`}>
                                    <Edit2 size={16} color={COLORS.primary} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Typography variant="body" color="#666">{profile?.phone || 'Sign in to order'}</Typography>
                    </View>
                </View>

                {/* Membership Card - Light Mode */}
                {user && (
                    <View style={tw`mt-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex-row justify-between items-center`}>
                        <View>
                            <Typography variant="tiny" style={tw`text-indigo-600 font-bold uppercase tracking-widest mb-1`}>Hop-In Gold</Typography>
                            <Typography variant="h3" style={tw`text-indigo-900`}>Free Delivery Active</Typography>
                        </View>
                        <View style={tw`bg-white px-3 py-1 rounded-lg border border-indigo-100 shadow-sm`}>
                            <Typography variant="tiny" style={tw`text-indigo-800 font-bold`}>Saved £12.50</Typography>
                        </View>
                    </View>
                )}
            </View>

            <ScrollView contentContainerStyle={tw`p-4 pb-32`} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <View style={tw`mb-2 ml-1`}><Typography variant="tiny" style={tw`text-gray-500 font-bold uppercase tracking-widest`}>My Account</Typography></View>

                {[
                    { icon: Clock, label: 'Order History', sub: 'Reorder your favourites', link: '/orders' },
                    { icon: MapPin, label: 'Addresses', sub: 'Home, Work, Other' },
                    { icon: Heart, label: 'Saved Items', sub: 'Your wishlist' },
                    { icon: CreditCard, label: 'Payment Methods', sub: 'Cards & UPI' },
                ].map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        style={tw`flex-row items-center bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm`}
                        onPress={() => item.link ? router.push(item.link as any) : null}
                    >
                        <View style={tw`bg-gray-50 p-2 rounded-lg`}>
                            <item.icon size={20} color={COLORS.textMain} />
                        </View>
                        <View style={tw`ml-4 flex-1`}>
                            <Typography variant="h3">{item.label}</Typography>
                            <Typography variant="caption" color={COLORS.textSub}>{item.sub}</Typography>
                        </View>
                        <ChevronRight size={18} color="#CCC" />
                    </TouchableOpacity>
                ))}

                <View style={tw`mt-6 mb-2 ml-1`}><Typography variant="tiny" style={tw`text-gray-500 font-bold uppercase tracking-widest`}>Settings</Typography></View>
                <TouchableOpacity style={tw`flex-row items-center bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm`}>
                    <Settings size={20} color={COLORS.textSub} />
                    <Typography variant="h3" style={tw`ml-4 flex-1`}>App Settings</Typography>
                    <ChevronRight size={18} color="#CCC" />
                </TouchableOpacity>

                {user ? (
                    <TouchableOpacity onPress={handleLogout} style={tw`flex-row items-center justify-center mt-6 p-4 bg-red-50 rounded-xl border border-red-100`}>
                        <LogOut size={20} color="#EF4444" />
                        <Typography variant="h3" style={tw`ml-2 text-red-600`}>Log Out</Typography>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleLogin} style={tw`flex-row items-center justify-center mt-6 p-4 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30`}>
                        <UserIcon size={20} color="#FFF" />
                        <Typography variant="h3" style={tw`ml-2 text-white font-bold`}>Sign In (Anonymous)</Typography>
                    </TouchableOpacity>
                )}

                {/* Internal Tool Link */}
                <StaffPortalEntry />
            </ScrollView>

            <EditProfileSheet
                visible={editMode}
                onClose={() => setEditMode(false)}
                profile={profile}
                onSave={handleUpdateProfile}
            />

            <NavigationDock />
        </View>
    );
}
