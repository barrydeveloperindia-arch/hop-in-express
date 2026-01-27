import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface UserProfile {
    uid: string;
    displayName: string;
    phone: string;
    email?: string;
    avatar?: string;
    role?: 'customer' | 'staff' | 'admin';
    defaultAddress?: string;
}

export class UserProfileService {
    static async getProfile(uid: string): Promise<UserProfile | null> {
        try {
            const userRef = doc(db, 'users', uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                return snap.data() as UserProfile;
            }
            return null;
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
    }

    static async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, data, { merge: true });
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    }
}
