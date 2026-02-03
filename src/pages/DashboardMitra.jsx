import React, { useEffect, useState } from 'react';
import { 
  Clock, Calendar, Camera, Loader2, ChevronLeft, Check, X,
  Wallet, Shield, Smartphone, Key, History, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

const DashboardMitra = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hourly');
  
  const [property, setProperty] = useState(null);
  const [pricing, setPricing] = useState({ hourly: {}, daily: {}, monthly: {} });
  const [operational, setOperational] = useState({ ttlock_id: '', guard_phone: '' });
  const [wallet, setWallet] = useState({ balance: 0 });

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const { data: propData } = await supabase.from('properties').select('*').eq('owner_id', user.id).single();
      if (propData) {
        setProperty(propData);
        setPricing(propData.pricing_plan || pricing);
        setOperational({ ttlock_id: propData.ttlock_id || '', guard_phone: propData.guard_phone || '' });
      }
      const { data: walData } = await supabase.from('wallets').select('balance').eq('owner_id', user.id).single();
      if (walData) setWallet(walData);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const toggleRate = (cat, unit) => {
    setPricing(prev => ({ ...prev, [cat]: { ...prev[cat], [unit]: { ...prev[cat][unit], active: !prev[cat][unit].active } } }));
  };

  const updatePrice = (cat, unit, val) => {
    setPricing(prev => ({ ...prev, [cat]: { ...prev[cat], [unit]: { ...prev[cat][unit], price: parseInt(val) || 0 } } }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('properties').update({
        pricing_plan: pricing,
        ttlock_id: operational.ttlock_id,
        guard_phone: operational.guard_phone
      }).eq('owner_id', user.id);
      if (error) throw error;
      toast({ title: "Tersimpan!", description: "Data tarif & operasional diperbarui." });
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-24">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft size={24} /></button>
          <h1 className="text-sm font-black uppercase italic tracking-tighter">Dashboard Mitra</h1>
        </div>
        <Button onClick={handleSaveChanges} disabled={saving} className="bg-black text-white h-9 px-6 rounded-xl font-black text-[10px] tracking-widest uppercase italic">
          {saving ? <Loader2 className="animate-spin w-3 h-3" /> : 'Simpan'}
        </Button>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-6 space-y-6">
        {/* Wallet System (Poin B) */}
        <div className="bg-black text-white rounded-[32px] p-6 shadow-xl relative overflow-hidden">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Saldo Dompet Aktif</p>
            <h2 className="text-3xl font-black italic tracking-tight mb-4">Rp {wallet.balance.toLocaleString()}</h2>
            <div className="flex gap-2 relative z-10">
                <Button variant="outline" className="h-8 rounded-lg bg-white/10 border-white/20 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black">Request Payout</Button>
                <Button variant="outline" className="h-8 rounded-lg bg-white/10 border-white/20 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black">Riwayat</Button>
            </div>
            <Wallet className="absolute -bottom-4 -right-4 text-white/5" size={140} />
        </div>

        {/* Operational (Poin B - Wajib Input) */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase italic tracking-tight flex items-center gap-2"><Shield size={16} /> Koneksi IoT & Operasional</h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase ml-1">TTLock ID (Wajib)</Label>
                    <Input className="rounded-xl border-gray-100 bg-gray-50 font-mono text-sm" value={operational.ttlock_id} onChange={(e) => setOperational({...operational, ttlock_id: e.target.value})} placeholder="ID Kunci Anda" />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase ml-1">WA Penjaga (Wajib)</Label>
                    <Input className="rounded-xl border-gray-100 bg-gray-50 font-mono text-sm" value={operational.guard_phone} onChange={(e) => setOperational({...operational, guard_phone: e.target.value})} placeholder="62812..." />
                </div>
            </div>
        </div>

        {/* Pricing Matrix (Poin B - ON/OFF Durasi) */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black uppercase italic tracking-tight flex items-center gap-2 mb-6"><Calendar size={16} /> Manajemen Harga & Durasi</h3>
          <div className="flex bg-gray-50 p-1 rounded-xl mb-6">
             {['hourly', 'daily', 'monthly'].map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-black text-white' : 'text-gray-400'}`}>
                    {tab === 'hourly' ? 'Transit' : tab === 'daily' ? 'Harian' : 'Bulanan'}
                 </button>
             ))}
          </div>
          <div className="space-y-3">
            {pricing[activeTab] && Object.keys(pricing[activeTab]).map((unit) => (
              <div key={unit} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${pricing[activeTab][unit].active ? 'bg-white border-black/10 shadow-sm' : 'bg-gray-50 border-transparent opacity-40 grayscale'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pricing[activeTab][unit].active ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {activeTab === 'hourly' ? <Clock size={14} /> : <Calendar size={14} />}
                  </div>
                  <span className="text-[11px] font-black uppercase italic">{unit} {activeTab === 'hourly' ? 'Jam' : activeTab === 'daily' ? 'Hari (24 Jam)' : 'Bulan'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {pricing[activeTab][unit].active && (
                    <Input type="number" className="h-8 w-24 rounded-lg border-gray-200 text-xs font-black text-right" value={pricing[activeTab][unit].price} onChange={(e) => updatePrice(activeTab, unit, e.target.value)} />
                  )}
                  <button onClick={() => toggleRate(activeTab, unit)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${pricing[activeTab][unit].active ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                    {pricing[activeTab][unit].active ? <X size={16} /> : <Check size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMitra;
