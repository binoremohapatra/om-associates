import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import { LoaderOne } from '../../components/ui/loader';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = new URLSearchParams(location.search).get('email') || '';
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState(''); // Need password to login after verify

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp: code });
      
      // Auto login if we have password
      if (password) {
        const res = await api.post('/auth/login', { email, password });
        login(res.data.data.accessToken, res.data.data.user);
        navigate('/dashboard');
      } else {
        // Just redirect to login
        navigate('/login?success=email_verified');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/send-otp', { email });
      alert('Verification code resent to your email');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D0F] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C9A94B]/10 via-[#0D0D0F]/0 to-transparent pointer-events-none" />
      
      <GlassCard className="w-full max-w-md relative z-10 bg-[#111111]/80 backdrop-blur-xl border border-white/5 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-white mb-2">Verify your email</h1>
          <p className="text-sm text-slate-400">
            We've sent a code to <span className="text-[#C9A94B]">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Verification Code</label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-center text-xl tracking-[0.5em] focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Confirm Password to Login</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || code.length < 6}
            className="w-full py-4 rounded-xl font-medium text-black bg-gradient-to-r from-[#C9A94B] to-[#E8C96B] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center mt-2"
          >
            {isLoading ? <LoaderOne /> : 'Verify & Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-slate-400">
            Didn't receive the code?{' '}
            <button onClick={handleResend} className="text-[#C9A94B] hover:text-[#E8C96B] font-medium transition-colors">
              Resend
            </button>
          </p>
          <div className="mt-4">
            <Link to="/login" className="text-slate-500 hover:text-white transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
