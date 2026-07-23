import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { LoaderOne } from '../../components/ui/loader';
import { Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token') || '';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }
    
    setStatus('loading');
    setMessage('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setStatus('success');
      setMessage('Password has been reset successfully. You can now login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Failed to reset password');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0F] p-4 text-center">
        <div>
          <h1 className="text-2xl text-white mb-2">Invalid Link</h1>
          <p className="text-slate-400 mb-6">The password reset link is missing or invalid.</p>
          <Link to="/forgot-password" className="text-[#C9A94B] hover:underline">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D0F] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C9A94B]/10 via-[#0D0D0F]/0 to-transparent pointer-events-none" />
      
      <GlassCard className="w-full max-w-md relative z-10 bg-[#111111]/80 backdrop-blur-xl border border-white/5 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-white mb-2">Reset Password</h1>
          <p className="text-sm text-slate-400">
            Please enter your new password below.
          </p>
        </div>

        {status === 'error' && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {message}
          </div>
        )}
        
        {status === 'success' && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full py-4 rounded-xl font-medium text-black bg-gradient-to-r from-[#C9A94B] to-[#E8C96B] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center mt-2"
          >
            {status === 'loading' ? <LoaderOne /> : 'Set New Password'}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
