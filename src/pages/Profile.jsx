 import React, { useEffect, useState } from 'react';
import { 
  User, Phone, Mail, Edit3, Loader2, LogOut, 
  Camera, CheckCircle2, ChevronRight, ShieldCheck, 
  Bell, HelpCircle, Upload, Lock, KeyRound, 
  MessageSquare, Info, Smartphone 
} from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profil');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [profile, setProfile] = useState({
    first_name: '', last_name: '', phone: '', email: '', avatar_url: ''
  });

  useEffect(() => {
    const getProfile = async () => {
      try {
        if (!user) return;
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || user.phone || '', 
            email: data.email || user.email || '',
            avatar_url: data.avatar_url || ''
          });
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    getProfile();
  }, [user]);

  const handleAvatarUpload = async (event) => {
    try {
      setUploadingImage(true);
      const file = event.target.files[0];
      if (!file) return;
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;
      await supabase.from('profiles').upsert({ id: user.id, avatar_url: publicUrl, updated_at: new Date() });
      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      toast({ title: "Berhasil", description: "Foto profil diperbarui." });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal mengunggah foto." });
    } finally { setUploadingImage(false); }
  };

  const handleLogout = async () => { await signOut(); navigate('/'); };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;

  const initial = profile.first_name ? profile.first_name[0].toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-black pb-40 pt-10 flex flex-col items-center">
      <div className="container mx-auto px-4 max-w-2xl flex-1">
        
        {/* --- 1. KONTEN TAMPILAN (DI ATAS) --- */}
        <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm min-h-[520px] mb-8">
          <AnimatePresence mode="wait">
            
            {activeTab === 'notifikasi' && (
              <motion.div key="notif" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 text-center sm:text-left">
                <h3 className="text-xl font-black italic border-b-4 border-black inline-block pb-1">Notifikasi</h3>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex gap-4 items-center mt-6">
                  <div className="p-3 bg-black text-white rounded-2xl shadow-lg"><Info size={24} /></div>
                  <div className="text-left">
                    <p className="font-bold text-sm">Pesan Sistem</p>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">Selamat datang di Kosan App! Jangan lupa lengkapi data diri Anda.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'profil' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-black flex items-center justify-center shadow-xl">
                      {uploadingImage ? <Loader2 className="animate-spin text-white" /> : profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-white text-3xl font-bold">{initial}</span>}
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-md border border-gray-100 cursor-pointer hover:bg-black hover:text-white transition-all">
                      <Camera size={16} /><input type="file" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">Profil & Identitas</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nama Lengkap</Label>
                    <Input value={`${profile.first_name} ${profile.last_name}`} readOnly className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                  </div>
                  <div className="space-y-2 pt-4">
                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Verifikasi KTP (KYC)</Label>
                    <div className="h-28 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center bg-gray-50/50">
                      <Upload className="text-gray-300 mb-2" size={20} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase italic">Ketuk untuk Ambil Foto</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-black rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl mt-6">
                   <p className="font-bold text-xs italic tracking-tight">Ingin menyewakan properti?</p>
                   <Button className="bg-white text-black hover:bg-gray-200 font-black rounded-xl px-6 h-10 shadow-lg text-[10px]">DAFTAR MITRA</Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'keamanan' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h3 className="text-xl font-black italic border-b-4 border-black inline-block pb-1">Keamanan</h3>
                <div className="p-5 bg-white rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm mt-6">
                  <div className="flex items-center gap-4 text-gray-400">
                    <KeyRound size={20} /> <span className="font-bold text-sm text-black">Ganti Password</span>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg font-black text-xs">UBAH</Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'bantuan' && (
              <motion.div key="help" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h3 className="text-xl font-black italic border-b-4 border-black inline-block pb-1">Bantuan</h3>
                <div className="grid grid-cols-1 gap-4 mt-6">
                  <button className="p-6 bg-black text-white rounded-3xl text-left shadow-xl flex items-center justify-between">
                    <div>
                      <MessageSquare className="mb-2" size={24} />
                      <p className="font-black text-sm italic uppercase tracking-tighter leading-none">Layanan Chat CS</p>
                    </div>
                    <ChevronRight className="text-gray-500" />
                  </button>
                  <button className="p-6 bg-white border border-gray-100 rounded-3xl text-left shadow-sm flex items-center justify-between">
                    <div>
                      <HelpCircle className="mb-2 text-gray-400" size={24} />
                      <p className="font-black text-sm italic uppercase tracking-tighter text-gray-400">FAQ App</p>
                    </div>
                    <ChevronRight className="text-gray-100" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* --- 2. KARTU MENU NAVIGASI BERGAYA SIDEBAR (DI BAWAH) --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg bg-white rounded-[32px] p-3 border border-gray-200 shadow-[0_25px_60px_rgba(0,0,0,0.15)] overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
            { id: 'profil', label: 'Profil & KYC', icon: User },
            { id: 'keamanan', label: 'Keamanan', icon: ShieldCheck },
            { id: 'bantuan', label: 'Bantuan', icon: HelpCircle },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all text-xs ${
                activeTab === item.id ? 'bg-black text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
          
          <div className="w-[1px] h-8 bg-gray-100 mx-2 shrink-0" /> 
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all text-xs shrink-0"
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
