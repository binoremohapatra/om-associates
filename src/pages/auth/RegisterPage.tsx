import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, Zap, User, Building, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '@/lib/api';
import { IconBrandGoogle, IconBrandFacebook, IconBrandGithub, IconBrandWindows, IconBrandApple } from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import Hyperspeed from '../../components/ui/Hyperspeed';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import { LoaderOne } from '../../components/ui/loader';

const hyperspeedOptions = {
  "onSpeedUp": () => {},
  "onSlowDown": () => {},
  "distortion":"xyDistortion",
  "length":400,
  "roadWidth":9,
  "islandWidth":2,
  "lanesPerRoad":3,
  "fov":90,
  "fovSpeedUp":150,
  "speedUp":3,
  "carLightsFade":0.4,
  "totalSideLightSticks":50,
  "lightPairsPerRoadWay":30,
  "shoulderLinesWidthPercentage":0.05,
  "brokenLinesWidthPercentage":0.1,
  "brokenLinesLengthPercentage":0.5,
  "lightStickWidth":[0.02,0.05],
  "lightStickHeight":[0.3,0.7],
  "movingAwaySpeed":[20,50],
  "movingCloserSpeed":[-150,-230],
  "carLightsLength":[20,80],
  "carLightsRadius":[0.03,0.08],
  "carWidthPercentage":[0.1,0.5],
  "carShiftX":[-0.5,0.5],
  "carFloorSeparation":[0,0.1],
  "colors":{
    "roadColor":526344,
    "islandColor":657930,
    "background":0,
    "shoulderLines":1250072,
    "brokenLines":1250072,
    "leftCars":[16777215,16777215,16777215],
    "rightCars":[15855310,15131313,14670218],
    "sticks":15855310
  }
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/register', { 
        name: formData.name, 
        email: formData.email, 
        password: formData.password 
      });
      
      const res = await api.post('/auth/login', { email: formData.email, password: formData.password });
      login(res.data.data.accessToken, res.data.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (providerId: string) => {
    const provider = providerId.replace('oauth_', '');
    window.location.href = `${api.defaults.baseURL}/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex w-full bg-navy-950 overflow-hidden">
      {/* Left: Interactive Visuals (Aurora) */}
      <div className="hidden lg:flex relative w-1/2 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Hyperspeed effectOptions={hyperspeedOptions} />
          <div className="absolute inset-0 bg-navy-950/40 pointer-events-none" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center mb-12">
          <Link to="/" className="inline-block hover:scale-105 transition-transform duration-500">
            <img
              src="/logo.png"
              alt="Om Associates"
              style={{
                height: '280px',
                width:  'auto',
                filter: 'drop-shadow(0 0 32px rgba(201,169,75,0.4))',
              }}
            />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.div variants={fadeInUp} className="mb-2">
              <span className="text-[#C9A94B] font-semibold tracking-wider uppercase text-sm">Welcome</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-5xl font-display font-bold text-white mb-4 leading-tight drop-shadow-lg">
              Start streamlining your compliance today.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-300 text-lg drop-shadow-md">
              Create your account in seconds and get access to AI-powered tax tools, automated GST filing, and expert consulting.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Right: Premium Glass Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900 to-navy-950 -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 flex justify-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-glow-sm">
                <Zap size={20} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-white">
                Tax<span className="text-sky-400">OS</span>
              </span>
            </Link>
          </div>

          <GlassCard glowOnHover={false} className="w-full bg-navy-900/50">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Create an Account</h1>
              <p className="text-slate-400 text-sm">Join OMM Associates today</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1 relative group">
                  <label className="text-xs font-medium text-slate-400 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-navy-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1 relative group">
                  <label className="text-xs font-medium text-slate-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={18} />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-navy-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-1 relative group">
                  <label className="text-xs font-medium text-slate-400 ml-1">Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full bg-navy-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>

                <div className="space-y-1 relative group">
                  <label className="text-xs font-medium text-slate-400 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={18} />
                    <input 
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-navy-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button variant="primary" className="w-full mt-6 py-3.5" disabled={isLoading}>
                  {isLoading ? (
                    <LoaderOne />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} />
                    </>
                  )}
                </Button>
                

              </form>

            <div className="mt-8 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">
                Sign In
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
