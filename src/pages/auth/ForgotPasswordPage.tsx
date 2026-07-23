import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { LoaderOne } from '../../components/ui/loader';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(res.data.data.message || 'If that email is registered, a password reset link has been sent.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D0F] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C9A94B]/10 via-[#0D0D0F]/0 to-transparent pointer-events-none" />
      
      <GlassCard className="w-full max-w-md relative z-10 bg-[#111111]/80 backdrop-blur-xl border border-white/5 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-white mb-2">Forgot Password</h1>
          <p className="text-sm text-slate-400">
            Enter your email address to receive a password reset link.
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
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading' || !email}
            className="w-full py-4 rounded-xl font-medium text-black bg-gradient-to-r from-[#C9A94B] to-[#E8C96B] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {status === 'loading' ? <LoaderOne /> : (
              <>
                Send Reset Link
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="text-slate-500 hover:text-white transition-colors">
            Back to Login
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
