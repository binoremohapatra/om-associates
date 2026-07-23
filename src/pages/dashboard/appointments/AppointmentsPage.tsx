import { api } from '@/lib/api';
import React, { useEffect, useState } from 'react';

import { Calendar as CalendarIcon, Clock, Video, User, X } from 'lucide-react';
import { BentoCard } from '../../../components/ui/BentoCard';
import { format, isFuture } from 'date-fns';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const upcoming = appointments.filter(a => isFuture(new Date(a.scheduledAt)) && a.status === 'SCHEDULED');
  const past = appointments.filter(a => !isFuture(new Date(a.scheduledAt)) || a.status !== 'SCHEDULED');

  const AppointmentCard = ({ apt }: { apt: any }) => {
    const isUpcoming = isFuture(new Date(apt.scheduledAt)) && apt.status === 'SCHEDULED';
    
    return (
      <BentoCard className="group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", 
              isUpcoming ? "bg-[#C9A94B]/10 text-[#C9A94B]" : "bg-white/5 text-slate-400"
            )}>
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-medium">{apt.title}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <User className="w-3.5 h-3.5" />
                <span>{apt.client?.name || 'Unknown Client'}</span>
              </div>
            </div>
          </div>
          <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full border', 
            apt.status === 'SCHEDULED' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
            apt.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
            'bg-red-500/10 text-red-400 border-red-500/20'
          )}>
            {apt.status}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-300 mb-6">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{format(new Date(apt.scheduledAt), 'MMM dd, yyyy - h:mm a')}</span>
          </div>
          <span className="text-slate-600">•</span>
          <span>{apt.durationMinutes} mins</span>
        </div>

        {isUpcoming && apt.meetLink && (
          <a
            href={apt.meetLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#C9A94B] text-black font-medium hover:bg-[#E8C96B] transition-colors"
          >
            <Video className="w-4 h-4" />
            Join Meeting
          </a>
        )}
      </BentoCard>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4 w-full">
        <div className="flex items-center gap-3 md:gap-4 w-full">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#C9A94B]/10 flex items-center justify-center border border-[#C9A94B]/20 shrink-0">
            <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-[#C9A94B]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-medium text-white mb-0.5 md:mb-1">Appointments</h1>
            <p className="text-xs md:text-sm text-slate-500">Manage client meetings and consultations.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-[#C9A94B] text-black text-sm md:text-base font-medium rounded-xl hover:bg-[#E8C96B] transition-colors shrink-0"
        >
          Schedule Meeting
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading appointments...</p>
      ) : (
        <>
          <h2 className="text-lg font-medium text-white mb-4">Upcoming Meetings</h2>
          {upcoming.length === 0 ? (
            <div className="p-6 md:p-8 border border-white/5 rounded-2xl bg-[#111111] text-center text-sm md:text-base text-slate-500 mb-8 md:mb-10">
              No upcoming meetings scheduled.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {upcoming.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
            </div>
          )}

          <h2 className="text-lg font-medium text-white mb-4">Past Meetings</h2>
          {past.length === 0 ? (
            <div className="p-6 md:p-8 border border-white/5 rounded-2xl bg-[#111111] text-center text-sm md:text-base text-slate-500">
              No past meetings found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {past.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
            </div>
          )}
        </>
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ScheduleModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false);
              fetchAppointments();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ScheduleModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    scheduledAt: '',
    durationMinutes: 30
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/clients');
        if (response.data.success) {
          setClients(response.data.data);
          if (response.data.data.length > 0) {
            setFormData(prev => ({ ...prev, clientId: response.data.data[0].id }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch clients', error);
      }
    };
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/appointments', formData);
      onSuccess();
    } catch (error) {
      console.error('Failed to schedule', error);
      alert('Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-display font-medium text-white mb-6">Schedule Meeting</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Meeting Title</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Tax Planning Consultation"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Consultation Type</label>
            <select 
              required
              onChange={e => setFormData({ ...formData, title: `${e.target.value} - ${formData.title.split(' - ')[1] || formData.title || 'Consultation'}` })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            >
              <option value="Tax Planning">Tax Planning</option>
              <option value="GST Compliance">GST Compliance</option>
              <option value="Legal Advisory">Legal Advisory</option>
              <option value="General Consultation">General Consultation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Date & Time</label>
            <input 
              required
              type="datetime-local" 
              value={formData.scheduledAt}
              onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Duration (Minutes)</label>
            <select 
              value={formData.durationMinutes}
              onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#C9A94B] text-black font-medium hover:bg-[#E8C96B] transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Confirm Appointment'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
