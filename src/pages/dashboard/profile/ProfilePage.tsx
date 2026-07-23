import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import Lanyard from '../../../components/ui/Lanyard';
import { BentoCard } from '../../../components/ui/BentoCard';
import { Save, User, Mail, Phone, Briefcase } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, token } = useAuth();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  useEffect(() => {
    if (!user) return;

    // Generate dynamic ID card texture
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

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(user.name || 'User', 256, 470);

      ctx.fillStyle = '#C9A94B';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(user.organization?.name || 'Om Associates', 256, 540);

      ctx.fillStyle = '#aaa';
      ctx.font = '24px sans-serif';
      ctx.fillText(user.jobTitle ? user.jobTitle.toUpperCase() : 'AUTHORIZED PERSONNEL', 256, 600);

      ctx.fillStyle = '#555';
      ctx.font = '20px monospace';
      ctx.fillText(`SEC-ID: ${user.id?.substring(0, 8).toUpperCase()}`, 256, 700);

      setFrontImage(canvas.toDataURL('image/png'));
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex-1 w-full flex flex-col lg:flex-row overflow-hidden bg-[#0D0D0F]">
      
      {/* Left Side: 3D ID Card */}
      <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-full flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="absolute top-8 left-8 z-10 pointer-events-none">
          <h1 className="text-4xl font-display font-bold text-white mb-2">My Badge</h1>
          <p className="text-slate-400">Drag to interact with your secure pass.</p>
        </div>
        
        <div className="absolute inset-0">
          <Lanyard 
            position={[0, 0, 16]} 
            gravity={[0, -40, 0]} 
            frontImage={frontImage} 
            imageFit="cover"
          />
        </div>
      </div>

      {/* Right Side: Profile Details Scroller */}
      <div className="flex-1 w-full lg:w-1/2 h-[50vh] lg:h-full overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-display font-medium text-white mb-1">Profile Details</h2>
              <p className="text-slate-400">Manage your personal information and contact details.</p>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSave}>
            <BentoCard className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C9A94B]" /> Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
                    required
                  />
                ) : (
                  <p className="text-white bg-white/5 border border-white/5 rounded-xl px-4 py-3">{user.name}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C9A94B]" /> Email Address
                </label>
                <p className="text-slate-400 bg-black/40 border border-white/5 rounded-xl px-4 py-3 cursor-not-allowed">
                  {user.email}
                </p>
                {isEditing && <span className="text-xs text-slate-500 ml-1">Email cannot be changed directly.</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C9A94B]" /> Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
                  />
                ) : (
                  <p className="text-white bg-white/5 border border-white/5 rounded-xl px-4 py-3">
                    {user.phone || <span className="text-slate-500 italic">Not provided</span>}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#C9A94B]" /> Job Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                    placeholder="e.g. CEO, Financial Director"
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
                  />
                ) : (
                  <p className="text-white bg-white/5 border border-white/5 rounded-xl px-4 py-3">
                    {user.jobTitle || <span className="text-slate-500 italic">Not provided</span>}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="pt-4 flex items-center justify-end gap-4 border-t border-white/5 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user.name,
                        phone: user.phone || '',
                        jobTitle: user.jobTitle || '',
                      });
                    }}
                    className="px-6 py-2.5 text-slate-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#C9A94B] text-black font-medium rounded-xl hover:bg-[#E8C96B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? 'Saving...' : (
                      <>
                        <Save className="w-4 h-4" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </BentoCard>
          </form>

          <BentoCard>
            <h3 className="text-lg font-medium text-white mb-4">Organization Profile</h3>
            <div className="p-4 rounded-xl border border-white/5 bg-black/40">
              <p className="text-sm text-slate-400 mb-1">Connected Enterprise</p>
              <p className="text-white font-medium">{user.organization?.name || 'Om Associates'}</p>
              <p className="text-xs text-slate-500 mt-2">To edit organization details, please visit the Business Profile page.</p>
            </div>
          </BentoCard>

        </div>
      </div>
    </div>
  );
}
