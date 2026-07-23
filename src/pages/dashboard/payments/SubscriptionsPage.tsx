import { api } from '@/lib/api';
import React, { useEffect, useState } from 'react';

import { format } from 'date-fns';
import { Repeat, CheckCircle2, AlertCircle, Zap, Shield, Crown } from 'lucide-react';
import { cn, formatCurrency } from '../../../lib/utils';
import { BentoCard } from '../../../components/ui/BentoCard';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await api.get('/payments/subscriptions');
        if (response.data.success) {
          setSubscriptions(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch subscriptions', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  const plans = [
    { name: 'Basic', price: 2999, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/10', features: ['GST Returns (Up to 50 B2B)', 'Basic ITR Filing', 'Monthly Compliance Check'] },
    { name: 'Growth', price: 7999, icon: Shield, color: 'text-[#C9A94B]', bg: 'bg-[#C9A94B]/10', features: ['Unlimited GST Returns', 'Complex ITR & Audit', 'Dedicated Account Manager', 'Priority Support'], isPopular: true },
    { name: 'Enterprise', price: 19999, icon: Crown, color: 'text-purple-400', bg: 'bg-purple-400/10', features: ['Everything in Growth', 'Custom Financial Advisory', 'Legal Drafting (NDAs, Agreements)', 'EXIM Compliance'] }
  ];

  const handleSubscribeClick = (plan: any) => {
    setSelectedPlan(plan);
    setIsSubscribeModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-medium text-white mb-1">Retainer Plans</h2>
          <p className="text-sm text-slate-400">Choose a plan to automate your compliance seamlessly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan, idx) => (
          <BentoCard 
            key={idx} 
            className={cn(
              "relative overflow-hidden group transition-all duration-300 hover:-translate-y-1",
              plan.isPopular ? "border-[#C9A94B]/40 shadow-[0_0_30px_rgba(201,169,75,0.1)]" : ""
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-[#E8C96B] to-[#C9A94B] text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <div className="flex items-center gap-3 mb-6">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", plan.bg)}>
                <plan.icon className={cn("w-6 h-6", plan.color)} />
              </div>
              <h3 className="text-xl font-medium text-white">{plan.name}</h3>
            </div>
            <div className="mb-6 flex items-end gap-1">
              <span className="text-4xl font-display font-medium text-white">₹{plan.price.toLocaleString()}</span>
              <span className="text-slate-400 mb-1">/mo</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className={cn("w-4 h-4 mt-0.5 shrink-0", plan.color)} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleSubscribeClick(plan)}
              className={cn(
                "w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2",
                plan.isPopular ? "bg-[#C9A94B] text-black hover:bg-[#E8C96B]" : "bg-white/5 text-white hover:bg-white/10"
              )}
            >
              Subscribe Now
            </button>
          </BentoCard>
        ))}
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-medium text-white mb-1">Active Subscriptions</h2>
          <p className="text-sm text-slate-400">Manage your active retainer plans.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : subscriptions.length === 0 ? (
          <p className="text-slate-500">No active subscriptions.</p>
        ) : (
          subscriptions.map(sub => (
            <BentoCard key={sub.id} className="group hover:border-[#C9A94B]/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#C9A94B]/10 flex items-center justify-center">
                    <Repeat className="w-5 h-5 text-[#C9A94B]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{sub.client?.name || 'Unknown Client'}</h3>
                    <p className="text-sm text-[#C9A94B]">{sub.planName}</p>
                  </div>
                </div>
                {sub.status === 'ACTIVE' ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
                    <AlertCircle className="w-3 h-3" />
                    Past Due
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-display font-medium text-white">
                    {formatCurrency(Number(sub.amountPaise) / 100)}
                  </span>
                  <span className="text-slate-500 mb-1">/{sub.billingCycle.toLowerCase()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Started on</span>
                  <span className="text-slate-300">{format(new Date(sub.createdAt), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Next billing</span>
                  <span className="text-white font-medium">{format(new Date(sub.nextBillingDate), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </BentoCard>
          ))
        )}
      </div>

      {isSubscribeModalOpen && selectedPlan && (
        <SubscribeModal 
          plan={selectedPlan}
          onClose={() => setIsSubscribeModalOpen(false)}
          onSuccess={() => {
            setIsSubscribeModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

function SubscribeModal({ plan, onClose, onSuccess }: { plan: any, onClose: () => void, onSuccess: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    billingCycle: 'MONTHLY'
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        clientId: formData.clientId,
        planName: plan.name,
        amount: formData.billingCycle === 'YEARLY' ? plan.price * 10 : plan.price, // 2 months free if yearly
        billingCycle: formData.billingCycle
      };

      await api.post('/payments/subscriptions', payload);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create subscription', error);
      alert(error.response?.data?.error || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const finalPrice = formData.billingCycle === 'YEARLY' ? plan.price * 10 : plan.price;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-xl font-bold">&times;</button>
        <h2 className="text-xl font-display font-medium text-white mb-2">Subscribe to {plan.name}</h2>
        <p className="text-sm text-slate-400 mb-6">Setup a recurring retainer for automated compliance.</p>

        <form onSubmit={handleSubscribe} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Assign to Client</label>
            <select 
              value={formData.clientId}
              onChange={e => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Billing Cycle</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, billingCycle: 'MONTHLY' })}
                className={cn(
                  "py-2 rounded-lg text-sm font-medium transition-colors",
                  formData.billingCycle === 'MONTHLY' ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, billingCycle: 'YEARLY' })}
                className={cn(
                  "py-2 rounded-lg text-sm font-medium transition-colors",
                  formData.billingCycle === 'YEARLY' ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
                )}
              >
                Yearly (Save 17%)
              </button>
            </div>
          </div>

          <div className="bg-[#C9A94B]/10 border border-[#C9A94B]/20 rounded-xl p-4 mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Total to pay today:</span>
              <span className="text-xl font-medium text-white">₹{finalPrice.toLocaleString()}</span>
            </div>
            <p className="text-xs text-[#C9A94B]">You will be redirected to Razorpay securely.</p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#C9A94B] text-black font-medium hover:bg-[#E8C96B] transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}
