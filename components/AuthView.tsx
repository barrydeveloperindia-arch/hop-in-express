
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { EngLabsLogo } from '../App';
import { FluxButton } from './ui/FluxButton';
import { NeonInput } from './ui/NeonInput';
import { GlassCard } from './ui/GlassCard';
import { AlertCircle } from 'lucide-react';

const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('demo@hopinexpress.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        // window.alert(`Auth Success: ${cred.user.uid}`);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;

        // AUTO-CREATE STAFF RECORD
        // This ensures the new user appears in the Staff List immediately
        const { addStaffMember } = await import('../lib/firestore');
        const shopId = import.meta.env.VITE_USER_ID || 'hop-in-express'; // Use main Shop ID

        const newStaff = {
          id: user.uid, // Use Auth UID as Staff ID for direct mapping
          name: email.split('@')[0].toUpperCase(),
          role: 'Cashier' as any, // Safe Default
          pin: '0000', // Default PIN, they should change it
          photo: '',
          email: email,
          loginBarcode: `STAFF-${Math.floor(Math.random() * 10000)}`,
          status: 'Active' as const,
          joinedDate: new Date().toISOString().split('T')[0],
          contractType: 'Full-time' as const,
          niNumber: 'PENDING',
          taxCode: '1257L',
          rightToWork: true,
          emergencyContact: '',
          monthlyRate: 0, hourlyRate: 11.44, dailyRate: 0, advance: 0, holidayEntitlement: 28, accruedHoliday: 0
        };

        await addStaffMember(shopId, newStaff);
        // window.alert("Operator Registered & Added to Staff List");
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-void flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-surface-void to-surface-void pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[128px] rounded-full pointer-events-none animate-pulse-slow"></div>

      <div className="w-full max-w-md relative z-10 space-y-8">
        <div className="text-center space-y-6">
          <div className="inline-flex p-8 rounded-full bg-surface-elevated/50 border border-white/5 backdrop-blur-xl mb-4 shadow-2xl shadow-black/50">
            <EngLabsLogo light size="lg" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Command OS</h2>
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">Secure Terminal Protocol Enabled</p>
          </div>
        </div>

        <GlassCard className="p-8 md:p-10 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 text-xs font-bold uppercase tracking-wide">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <NeonInput
                label="Fleet Identity"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander@hopinexpress.com"
                autoComplete="email"
              />
              <NeonInput
                label="Access Key"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <FluxButton
              type="submit"
              loading={loading}
              className="w-full py-4 text-xs font-black tracking-[0.2em] uppercase"
            >
              {isLogin ? 'Authenticate Terminal' : 'Register Operator'}
            </FluxButton>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-ink-muted text-[10px] font-bold uppercase tracking-widest hover:text-indigo-400 transition-colors"
            >
              {isLogin ? "Request New Operator Access" : "Already Registered? Login"}
            </button>
          </form>
        </GlassCard>

        <p className="text-center text-ink-muted text-[10px] font-medium">
          v2.0.0 &bull; Licensed to Hop In Express &bull; <span className="text-ink-muted">EngLabs Inc.</span>
        </p>
      </div>
    </div>
  );
};

export default AuthView;
