import React, { useEffect, useState } from 'react';
import { 
  Home, Clock, Calendar, Camera, Loader2, 
  ChevronLeft, Save, Trash2, Check, X,
  ArrowRight, Image as ImageIcon, Plus,
  Settings // DIUBAH: S-nya kapital
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const DashboardMitra = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeType, setActiveType] = useState('monthly'); 
  
  const [property, setProperty] = useState(null);
  const [pricing, setPricing] = useState({
    hourly: {
      "1": {active: false, price: 0}, "2": {active: false, price: 0},
      "3": {active: false, price: 0}, "4": {active: false, price: 0},
      "5": {active: false, price: 0}, "6": {active: false, price: 0},
      "12": {active: false, price: 0}, "24": {active: false, price: 0}
    },
    monthly: {
      "1": {active: true, price: 0}, "2": {active: false, price: 0},
      "3": {active: false, price: 0}, "4": {active: false, price: 0},
      "5": {active: false, price: 0}, "6": {active: false, price: 0},
      "12": {active: false, price: 0}
    }
  });
  const [newPhoto, setNewPhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle(); // Menggunakan maybeSingle agar tidak error jika data belum ada
      
      if (data) {
        setProperty(data);
        if (data.pricing_options) setPricing(data.pricing_options);
        setPreviewPhoto(data.photo_url);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRate = (type, unit) => {
    setPricing(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [unit]: { ...prev[type][unit], active: !prev[type][unit].active }
      }
    }));
  };

  const updatePriceValue = (type, unit, value) => {
    setPricing(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [unit]: { ...prev[type][unit], price: parseInt(value) || 0 }
      }
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(file);
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      let finalUrl = property?.photo_url || '';

      if (newPhoto) {
        const filePath = `properties/${user.id}/${Date.now()}`;
        const { error: uploadError } = await supabase.storage.from('property-images').upload(filePath, newPhoto);
        if (uploadError) throw uploadError;
        const { data: url } = supabase.storage.from('property-images').getPublicUrl(filePath);
        finalUrl = url.publicUrl;
      }

      const { error } = await supabase
        .from('properties')
        .upsert({
          owner_id: user.id,
          photo_url: finalUrl,
          pricing_options: pricing,
          name: property?.name || 'Kosan Mitra',
          address: property?.address || ''
        }, { onConflict: 'owner_id' });

      if (error) throw error;
      toast({ title: "Berhasil!", description: "Pengaturan tarif dan foto telah diperbarui." });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-black" /></div>;

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-24">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 px-6 py-5">
        <div className="container mx-auto max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/profile')} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ChevronLeft size={24} /></button>
            <h1 className="text-lg font-black uppercase italic tracking-tighter">Edit Properti</h1>
          </div>
          <Button onClick={handleSaveChanges} disabled={saving} className="bg-black text-white h-10 px-6 rounded-xl font-black text-[10px] tracking-widest uppercase">
            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Simpan'}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-8">
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Visual Utama Kosan</p>
          <div className="relative aspect-video rounded-[32px] overflow-hidden bg-gray-50 border-2 border-dashed border-gray-100 group">
            {previewPhoto ? (
              <img src={previewPhoto} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Preview" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-200 italic"><ImageIcon size={48} /></div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-black text-[10px] uppercase tracking-widest italic">
              <Camera className="mr-2" size={20} /> Ganti Foto
              <input type="file" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Pengaturan Tarif</h3>
            <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              <button onClick={() => setActiveType('hourly')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeType === 'hourly' ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}>Per Jam</button>
              <button onClick={() => setActiveType('monthly')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeType === 'monthly' ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}>Per Bulan</button>
            </div>
          </div>

          <div className="space-y-3">
            {Object.keys(pricing[activeType]).map((unit) => (
              <div key={unit} className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${pricing[activeType][unit].active ? 'bg-white border-gray-200 shadow-md translate-x-1' : 'bg-gray-50/50 border-gray-50 opacity-60 grayscale'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${pricing[activeType][unit].active ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {activeType === 'hourly' ? <Clock size={18} /> : <Calendar size={18} />}
                  </div>
                  <div>
                    <span className="block text-sm font-black uppercase italic tracking-tighter leading-none">{unit} {activeType === 'hourly' ? 'Jam' : 'Bulan'}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">{pricing[activeType][unit].active ? 'Status: Aktif' : 'Status: Nonaktif'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {pricing[activeType][unit].active && (
                    <div className="relative w-28">
                      <span className="absolute left-3 top-3.5 text-[10px] font-black text-gray-300">RP</span>
                      <Input type="number" value={pricing[activeType][unit].price} onChange={(e) => updatePriceValue(activeType, unit, e.target.value)} className="h-11 pl-8 rounded-xl border-gray-100 font-black text-xs bg-white text-right" />
                    </div>
                  )}
                  <button onClick={() => toggleRate(activeType, unit)} className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${pricing[activeType][unit].active ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}>
                    {pricing[activeType][unit].active ? <X size={20} /> : <Check size={20} />}
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
