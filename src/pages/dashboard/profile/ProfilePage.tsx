import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import Lanyard from '../../../components/ui/Lanyard';
import { BentoCard } from '../../../components/ui/BentoCard';
import { Save, User, Mail, Phone, Briefcase, Camera, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, token } = useAuth();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    jobTitle: user?.jobTitle || '',
  });

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      jobTitle: user.jobTitle || '',
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setIsSaving(true);
      const res = await axios.put('/api/v1/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        updateUser(res.data.data.user);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingAvatar(true);
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await axios.post('/api/v1/auth/profile/avatar', fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      if (res.data.success) {
        updateUser(res.data.data.user);
      }
    } catch (err) {
      console.error('Failed to upload avatar', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 512, 768);
      grad.addColorStop(0, '#1a1a1a');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 768);

      const headerGrad = ctx.createLinearGradient(0, 0, 512, 0);
      headerGrad.addColorStop(0, '#C9A94B');
      headerGrad.addColorStop(1, '#E8C96B');
      ctx.fillStyle = headerGrad;
      ctx.fillRect(0, 0, 512, 120);

      ctx.fillStyle = '#000';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VIP CLIENT ACCESS', 256, 75);

      function finishCard() {
        if (!ctx) return;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 44px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(user!.name || 'User', 256, 470);
        ctx.fillStyle = '#C9A94B';
        ctx.font = 'bold 30px sans-serif';
        ctx.fillText(user!.organization?.name || 'Om Associates', 256, 540);
        ctx.fillStyle = '#aaa';
        ctx.font = '24px sans-serif';
        ctx.fillText(user!.jobTitle ? user!.jobTitle.toUpperCase() : 'AUTHORIZED PERSONNEL', 256, 600);
        ctx.fillStyle = '#555';
        ctx.font = '20px monospace';
        ctx.fillText(`SEC-ID: ${user!.id?.substring(0, 8).toUpperCase()}`, 256, 700);
        setFrontImage(canvas.toDataURL('image/png'));
      }

      if (user.avatarUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:4000${user.avatarUrl}`;
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(256, 280, 100, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, 156, 180, 200, 200);
          ctx.restore();
          ctx.strokeStyle = '#C9A94B';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(256, 280, 100, 0, Math.PI * 2);
          ctx.stroke();
          finishCard();
        };
        img.onerror = () => {
          ctx.fillStyle = '#333';
          ctx.beginPath();
          ctx.arc(256, 280, 100, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#C9A94B';
          ctx.lineWidth = 6;
          ctx.stroke();
          ctx.fillStyle = '#C9A94B';
          ctx.font = 'bold 80px sans-serif';
          ctx.fillText(user.name?.charAt(0).toUpperCase() || 'U', 256, 310);
          finishCard();
        };
      } else {
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(256, 280, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#C9A94B';
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.fillStyle = '#C9A94B';
        ctx.font = 'bold 80px sans-serif';
        ctx.fillText(user.name?.charAt(0).toUpperCase() || 'U', 256, 310);
        finishCard();
      }
    }
  }, [user]);

  if (!user) return null;

  const avatarSrc = user.avatarUrl
    ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:4000${user.avatarUrl}`)
    : null;

  return (
    <div className="flex-1 w-full overflow-y-auto custom-scrollbar bg-[#0D0D0F]">

      {/* ── Full-Width Badge Section ── */}
      <div className="relative w-full bg-gradient-to-b from-[#111111] to-[#0D0D0F]" style={{ height: '100svh' }}>
        {/* Title overlay */}
        <div className="absolute top-4 md:top-8 left-4 md:left-8 z-10 pointer-events-none">
          <h1 className="text-2xl md:text-4xl font-display font-bold text-white mb-1">My Badge</h1>
          <p className="text-sm text-slate-400">Drag to interact with your secure pass.</p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce pointer-events-none">
          <span className="text-xs text-slate-500">Scroll for details</span>
          <svg className="w-4 h-4 text-[#C9A94B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* 3D Lanyard */}
        <div className="absolute inset-0">
          <Lanyard
            position={[0, 0, 16]}
            gravity={[0, -40, 0]}
            frontImage={frontImage}
            imageFit="cover"
          />
        </div>
      </div>

      {/* ── Profile Details Section (below badge) ── */}
      <div className="w-full bg-[#0D0D0F] pb-28 md:pb-12">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 md:py-10 flex flex-col gap-6">

          {/* Section Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-0.5">Profile Details</h2>
              <p className="text-xs md:text-sm text-slate-400">Manage your personal information.</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium hover:bg-white/10 transition-colors shrink-0"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Avatar Card */}
          <BentoCard className="flex items-center gap-4 md:gap-6">
            <div className="relative shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#C9A94B] to-[#E8C96B] p-[2px]">
                <div className="w-full h-full rounded-full bg-[#111111] flex items-center justify-center overflow-hidden">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-2xl font-bold text-[#E8C96B]">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#C9A94B] flex items-center justify-center border-2 border-[#111] hover:bg-[#E8C96B] transition-colors"
              >
                {isUploadingAvatar ? (
                  <Loader2 size={12} className="animate-spin text-black" />
                ) : (
                  <Camera size={12} className="text-black" />
                )}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium truncate">{user.name}</p>
              <p className="text-sm text-slate-400 truncate">{user.email}</p>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="mt-2 text-xs text-[#C9A94B] hover:text-[#E8C96B] transition-colors"
              >
                {isUploadingAvatar ? 'Uploading...' : 'Change profile photo'}
              </button>
            </div>
          </BentoCard>

          {/* Profile Form */}
          <form onSubmit={handleSave}>
            <BentoCard className="flex flex-col gap-5">
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C9A94B]" /> Full Name
                </label>
                {isEditing ? (
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A94B]/50 transition-colors" required />
                ) : (
                  <p className="text-white bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm">{user.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C9A94B]" /> Email Address
                </label>
                <p className="text-slate-400 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm cursor-not-allowed truncate">{user.email}</p>
                {isEditing && <span className="text-xs text-slate-500 ml-1">Email cannot be changed directly.</span>}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C9A94B]" /> Phone Number
                </label>
                {isEditing ? (
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A94B]/50 transition-colors" />
                ) : (
                  <p className="text-white bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm">
                    {user.phone || <span className="text-slate-500 italic">Not provided</span>}
                  </p>
                )}
              </div>

              {/* Job Title */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#C9A94B]" /> Job Title
                </label>
                {isEditing ? (
                  <input type="text" value={formData.jobTitle} onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                    placeholder="e.g. CEO, Financial Director"
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A94B]/50 transition-colors" />
                ) : (
                  <p className="text-white bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm">
                    {user.jobTitle || <span className="text-slate-500 italic">Not provided</span>}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-white/5 mt-2">
                  <button type="button" onClick={() => { setIsEditing(false); setFormData({ name: user.name, phone: user.phone || '', jobTitle: user.jobTitle || '' }); }}
                    className="px-6 py-2.5 text-slate-300 hover:text-white transition-colors text-sm border border-white/10 rounded-xl hover:bg-white/5">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving}
                    className="px-6 py-2.5 bg-[#C9A94B] text-black font-medium rounded-xl hover:bg-[#E8C96B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                    {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                  </button>
                </div>
              )}
            </BentoCard>
          </form>

          {/* Organization Card */}
          <BentoCard>
            <h3 className="text-base font-medium text-white mb-4">Organization Profile</h3>
            <div className="p-4 rounded-xl border border-white/5 bg-black/40">
              <p className="text-sm text-slate-400 mb-1">Connected Enterprise</p>
              <p className="text-white font-medium">{user.organization?.name || 'Om Associates'}</p>
              <p className="text-xs text-slate-500 mt-2">To edit organization details, please visit the Settings page.</p>
            </div>
          </BentoCard>

        </div>
      </div>
    </div>
  );
}
