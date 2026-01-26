import { getAuth, signInAnonymously, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '../../lib/firebase';

const auth = getAuth(app);

export class AuthService {
    static getCurrentUser(): User | null {
        return auth.currentUser;
    }

    static async loginAnonymously(): Promise<User> {
        const result = await signInAnonymously(auth);
        return result.user;
    }

    static async logout(): Promise<void> {
        await signOut(auth);
    }

    static subscribe(callback: (user: User | null) => void) {
        return onAuthStateChanged(auth, callback);
    }
}
