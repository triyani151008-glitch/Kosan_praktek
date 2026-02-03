import React, { useEffect, useState } from 'react';
import { 
  Home, Clock, Calendar, Camera, Loader2, 
  ChevronLeft, Save, Check, X,
  Image as ImageIcon, Wallet, Shield, Smartphone, Key
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
  const [activeTab, setActiveTab] = useState('hourly'); // hourly, daily, monthly
  
  // Data State
  const [property, setProperty] = useState(null);
  const [pricing, setPricing] = useState({ hourly: {}, daily: {}, monthly: {} });
  const [operational, setOperational] = useState({ ttlock_id: '', guard_phone: '' });
  const [wallet, setWallet] = useState({ balance: 0 });
  
  const [newPhoto, setNewPhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // 1. Ambil Data Properti
      const { data: propData, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      
      if (propData) {
        setProperty(propData);
        // Fallback jika JSON kosong
        setPricing(propData.pricing_plan || {
            hourly: { "1":{active:false, price:0}, "2":{active:false, price:0}, "3":{active:false, price:0}, "4":{active:false, price:0}, "5":{active:false, price:0}, "6":{active:false, price:0}, "12":{active:false, price:0} },
            daily: { "1":{active:true, price:0} },
            monthly: { "1":{active:false, price:0} }
        });
        setOperational({
            ttlock_id: propData.ttlock_id || '',
            guard_phone: propData.guard_phone || ''
        });
        setPreviewPhoto(propData.photo_url);
      }

      // 2. Ambil Data Wallet
      const { data: walletData } = await supabase
        .from('wallets')
        .select('balance')
        .eq('owner_id', user.id)
        .single();
        
      if (walletData) setWallet(walletData);

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA PRICING MATRIX ---
  const toggleRate = (category, unit) => {
    setPricing(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [unit]: { ...prev[category][unit], active: !prev[category][unit].active }
      }
    }));
  };

  const updatePriceValue = (category, unit, value) => {
    setPricing(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [unit]: { ...prev[category][unit], price: parseInt(value) || 0 }
      }
    }));
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  // --- LOGIKA SIMPAN ---
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      let finalUrl = property?.photo_url;

      // Upload Foto Jika Ada
      if (newPhoto) {
        const filePath = `properties/${user.id}/${Date.now()}`;
        await supabase.storage.from('property-images').upload(filePath, newPhoto);
        const { data: url } = supabase.storage.from('property-images').getPublicUrl(filePath);
        finalUrl = url.publicUrl;
      }

      // Update Database
      const { error } = await supabase
        .from('properties')
        .update({
          photo_url: finalUrl,
          pricing_plan: pricing,
          ttlock_id: operational.ttlock_id,
          guard_phone: operational.guard_phone
        })
        .eq('owner_id', user.id);

      if (error) throw error;
      toast({ title: "Tersimpan!", description: "Data operasional & harga diperbarui." });
    } catch (error) {
      toast({ variant: "destructive", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(file);
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-24">
      {/* Header Sticky */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft size={24} /></button>
          <div>
            <h1 className="text-sm font-black uppercase italic tracking-tighter">Dashboard Mitra</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{property?.name || 'Properti Baru'}</p>
          </div>
        </div>
        <Button onClick={handleSaveChanges} disabled={saving} className="bg-black text-white h-9 px-4 rounded-xl font-black text-[10px] tracking-widest uppercase">
          {saving ? <Loader2 className="animate-spin w-3 h-3" /> : 'Simpan'}
        </Button>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-6 space-y-6">
        
        {/* 1. WALLET SYSTEM (BASIC) */}
        <div className="bg-black text-white rounded-[32px] p-6 shadow-xl shadow-gray-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet size={120} /></div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Saldo Dompet Aktif</p>
            <h2 className="text-3xl font-black italic tracking-tight mb-4">{formatRupiah(wallet.balance)}</h2>
            <div className="flex gap-2">
                <Button variant="outline" className="h-8 rounded-lg bg-white/10 border-white/20 text-white text-[10px] hover:bg-white hover:text-black">Request Payout</Button>
                <Button variant="outline" className="h-8 rounded-lg bg-white/10 border-white/20 text-white text-[10px] hover:bg-white hover:text-black">Riwayat</Button>
            </div>
        </div>

        {/* 2. OPERASIONAL & IOT */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Shield size={18} className="text-black" />
                <h3 className="text-sm font-black uppercase italic tracking-tight">Koneksi IoT & Keamanan</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">TTLock Gateway ID</Label>
                    <div className="relative">
                        <Key className="absolute left-3 top-3 text-gray-300" size={16} />
                        <Input 
                            placeholder="Contoh: 123456" 
                            className="pl-9 rounded-xl border-gray-100 bg-gray-50 font-mono text-sm"
                            value={operational.ttlock_id}
                            onChange={(e) => setOperational({...operational, ttlock_id: e.target.value})}
                        />
                    </div>
                    <p className="text-[9px] text-gray-400 italic">ID Kunci dari aplikasi TTLock untuk generate passcode.</p>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Nomor WA Penjaga (Notifikasi)</Label>
                    <div className="relative">
                        <Smartphone className="absolute left-3 top-3 text-gray-300" size={16} />
                        <Input 
                            placeholder="Contoh: 0812..." 
                            className="pl-9 rounded-xl border-gray-100 bg-gray-50 font-mono text-sm"
                            value={operational.guard_phone}
                            onChange={(e) => setOperational({...operational, guard_phone: e.target.value})}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* 3. MANAJEMEN HARGA (PRICING MATRIX) */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <Calendar size={18} className="text-black" />
                <h3 className="text-sm font-black uppercase italic tracking-tight">Atur Tarif & Durasi</h3>
            </div>
          </div>

          {/* TABS */}
          <div className="flex bg-gray-50 p-1 rounded-xl mb-6">
             {['hourly', 'daily', 'monthly'].map(tab => (
                 <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                    {tab === 'hourly' ? 'Transit' : tab === 'daily' ? 'Harian' : 'Bulanan'}
                 </button>
             ))}
          </div>

          {/* LIST TARIF */}
          <div className="space-y-3">
            {pricing && pricing[activeTab] && Object.keys(pricing[activeTab]).map((unit) => (
              <div key={unit} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${pricing[activeTab][unit].active ? 'bg-white border-black/10 shadow-sm' : 'bg-gray-50 border-transparent opacity-60'}`}>
                
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pricing[activeTab][unit].active ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {activeTab === 'hourly' ? <Clock size={14} /> : <Calendar size={14} />}
                  </div>
                  <div>
                    <span className="block text-xs font-black uppercase italic tracking-tight">
                        {unit} {activeTab === 'hourly' ? 'Jam' : activeTab === 'daily' ? 'Hari' : 'Bulan'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {pricing[activeTab][unit].active && (
                    <div className="relative w-24">
                        <span className="absolute left-2 top-2.5 text-[9px] font-bold text-gray-400">Rp</span>
                        <Input 
                            type="number" 
                            className="h-8 pl-6 pr-2 rounded-lg border-gray-200 text-xs font-bold text-right"
                            value={pricing[activeTab][unit].price}
                            onChange={(e) => updatePriceValue(activeTab, unit, e.target.value)}
                        />
                    </div>
                  )}
                  <button 
                    onClick={() => toggleRate(activeTab, unit)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${pricing[activeTab][unit].active ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}
                  >
                    {pricing[activeTab][unit].active ? <X size={16} /> : <Check size={16} />}
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* 4. VISUAL */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={18} className="text-black" />
                <h3 className="text-sm font-black uppercase italic tracking-tight">Foto Properti</h3>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-50 group border border-gray-100">
                {previewPhoto ? <img src={previewPhoto} className="w-full h-full object-cover" /> : null}
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="text-white mb-2" />
                    <span className="text-[9px] text-white font-bold uppercase tracking-widest">Ganti Foto</span>
                    <input type="file" className="hidden" onChange={handlePhotoChange} />
                </label>
            </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardMitra;
