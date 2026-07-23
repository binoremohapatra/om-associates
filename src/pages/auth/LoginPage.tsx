import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, Eye, EyeOff, CheckCircle2, TrendingUp, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '@/lib/api';
import { IconBrandGoogle, IconBrandFacebook, IconBrandGithub, IconBrandWindows, IconBrandApple } from '@tabler/icons-react';
import Hyperspeed from '../../components/ui/Hyperspeed';
import GoldDivider from '../../components/ui/GoldDivider';
import { LoaderOne } from '../../components/ui/loader';

const BENEFITS = [
  { icon: CheckCircle2, text: 'GST Filing & Compliance Management' },
  { icon: TrendingUp,   text: 'AI-Powered Tax Advisory' },
  { icon: Shield,       text: 'ISO 27001 Certified Security' },
];

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

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused,  setPassFocused]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.data.accessToken, res.data.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.errorCode === 'NOT_VERIFIED') {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setError(err.response?.data?.error || 'Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (providerId: string) => {
    const provider = providerId.replace('oauth_', '');
    window.location.href = `${api.defaults.baseURL}/auth/${provider}`;
  };

  return (
    <div
      className="min-h-screen flex w-full overflow-hidden"
      style={{ background: '#0D0D0F' }}
    >
      {/* ─── LEFT PANEL ─────────────────────────────────────── */}
      <div className="hidden lg:flex relative w-1/2 flex-col justify-between overflow-hidden" style={{ padding: 'clamp(2rem, 4vw, 3.5rem)' }}>
        {/* Luxury background */}
        <div className="absolute inset-0 z-0">
          <Hyperspeed effectOptions={hyperspeedOptions} />
          <div className="absolute inset-0 bg-[#0D0D0F]/40 pointer-events-none" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center mb-12">
          <Link to="/" className="inline-block hover:scale-105 transition-transform duration-500">
            <img
              src="/logo.png"
              alt="Om Associates"
              style={{
                height: '180px',
                width:  'auto',
                filter: 'drop-shadow(0 0 32px rgba(201,169,75,0.4))',
              }}
            />
          </Link>
        </div>

        <div className="relative z-10 max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6"
          >
            <GoldDivider className="w-16" />

            <div className="mb-2">
              <span className="text-sky-400 font-semibold tracking-wider uppercase text-sm">Welcome back</span>
            </div>

            <h2
              className="font-display text-4xl leading-tight"
              style={{ color: '#F5F5F7' }}
            >
              Your compliance,{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #E8C96B, #C9A94B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                simplified.
              </span>
            </h2>

            <p className="text-lg" style={{ color: '#9898AA' }}>
              Sign in to manage your compliance and access intelligent tax insights.
            </p>

            {/* Benefits list */}
            <div className="flex flex-col gap-3 mt-2">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(201,169,75,0.1)', border: '1px solid rgba(201,169,75,0.2)' }}
                  >
                    <Icon size={13} style={{ color: '#C9A94B' }} />
                  </div>
                  <span className="text-sm" style={{ color: '#9898AA' }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Stars */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#C9A94B">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                ))}
              </div>
              <span className="text-xs" style={{ color: '#68687C' }}>
                Trusted by 5,000+ businesses
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─────────────────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center relative"
        style={{ background: 'linear-gradient(180deg, #0D0D0F 0%, #141418 100%)', padding: 'clamp(1rem, 4vw, 3rem)' }}
      >
        {/* Gold orb */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-20%', right: '-20%',
            width: '60%', height: '60%',
            background: 'radial-gradient(circle, rgba(201,169,75,0.06) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Mobile logo */}
        <div className="absolute top-5 left-0 right-0 flex justify-center lg:hidden">
          <Link to="/">
            <img src="/logo.png" alt="Om Associates" style={{ height: 'clamp(40px, 8vw, 56px)', width: 'auto' }} />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md mt-20 sm:mt-16 lg:mt-0"
        >
          {/* Glass card */}
          <div
            className="rounded-3xl"
            style={{
              background:           'rgba(20,20,24,0.8)',
              border:               '1px solid rgba(201,169,75,0.12)',
              backdropFilter:       'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow:            '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,169,75,0.1)',
              padding: 'clamp(1.25rem, 4vw, 2.5rem)',
            }}
          >
            {/* Card top shimmer */}
            <div
              className="absolute top-0 left-8 right-8 h-px rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,75,0.4), transparent)' }}
            />

            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-2xl mb-2" style={{ color: '#F5F5F7' }}>
                Welcome Back
              </h1>
              <p className="text-sm" style={{ color: '#68687C' }}>
                Sign in to your Om Associates account
              </p>
              <GoldDivider className="mt-4" />
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: emailFocused ? '#C9A94B' : '#68687C', transition: 'color 0.25s' }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                    size={16}
                    style={{ color: emailFocused ? '#C9A94B' : '#3E3E4E' }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm transition-all duration-250"
                    placeholder="you@company.com"
                    style={{
                      background:   'rgba(13,13,15,0.6)',
                      border:       `1px solid ${emailFocused ? 'rgba(201,169,75,0.4)' : 'rgba(201,169,75,0.1)'}`,
                      color:        '#F5F5F7',
                      outline:      'none',
                      boxShadow:    emailFocused ? '0 0 0 3px rgba(201,169,75,0.08)' : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: passFocused ? '#C9A94B' : '#68687C', transition: 'color 0.25s' }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                    size={16}
                    style={{ color: passFocused ? '#C9A94B' : '#3E3E4E' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm transition-all duration-250"
                    placeholder="••••••••••••"
                    style={{
                      background:   'rgba(13,13,15,0.6)',
                      border:       `1px solid ${passFocused ? 'rgba(201,169,75,0.4)' : 'rgba(201,169,75,0.1)'}`,
                      color:        '#F5F5F7',
                      outline:      'none',
                      boxShadow:    passFocused ? '0 0 0 3px rgba(201,169,75,0.08)' : 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                    style={{ color: '#3E3E4E', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#C9A94B'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#3E3E4E'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember & forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded"
                    style={{ accentColor: '#C9A94B' }}
                  />
                  <span className="text-xs" style={{ color: '#68687C' }}>Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium transition-colors duration-200"
                  style={{ color: '#C9A94B' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#E8C96B'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#C9A94B'}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={isLoading ? {} : { scale: 1.01 }}
                whileTap={isLoading ? {} : { scale: 0.98 }}
                className="mt-2 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm transition-all duration-300"
                style={{
                  background:   'linear-gradient(135deg, #C9A94B 0%, #E8C96B 50%, #C9A94B 100%)',
                  backgroundSize: '200% auto',
                  color:        '#0D0D0F',
                  boxShadow:    '0 8px 24px rgba(201,169,75,0.35)',
                  letterSpacing:'0.04em',
                  border:       'none',
                  cursor:       isLoading ? 'not-allowed' : 'pointer',
                  opacity:      isLoading ? 0.8 : 1,
                }}
                onMouseEnter={e => {
                  if (isLoading) return;
                  (e.currentTarget as HTMLElement).style.backgroundPosition = 'right center';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(201,169,75,0.5)';
                }}
                onMouseLeave={e => {
                  if (isLoading) return;
                  (e.currentTarget as HTMLElement).style.backgroundPosition = 'left center';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(201,169,75,0.35)';
                }}
              >
                {isLoading ? (
                  <LoaderOne />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>

            </form>

            {/* Register link */}
            <p className="text-center text-sm mt-6" style={{ color: '#3E3E4E' }}>
              New to Om Associates?{' '}
              <Link
                to="/register"
                className="font-medium transition-colors duration-200"
                style={{ color: '#C9A94B' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#E8C96B'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#C9A94B'}
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* Bottom trust line */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {['🔒 SSL Secured', 'ISO 27001', 'DPIIT Recognised'].map((t, i) => (
              <React.Fragment key={t}>
                {i > 0 && <span style={{ color: '#2E2E3A' }}>·</span>}
                <span className="text-xs" style={{ color: '#3E3E4E' }}>{t}</span>
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
