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
    <div className="min-h-screen bg-[#F9F9F9] text-black pb-12 pt-10">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* --- 1. HEADER UTAMA (FOTO PROFIL & NAMA DI LUAR MENU) --- */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <div className="w-28 h-28 rounded-[38px] overflow-hidden bg-black flex items-center justify-center shadow-2xl border-4 border-white">
              {uploadingImage ? (
                <Loader2 className="animate-spin text-white" />
              ) : profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-4xl font-black italic">{initial}</span>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-2xl shadow-lg border border-gray-100 cursor-pointer hover:bg-black hover:text-white transition-all active:scale-90">
              <Camera size={18} /><input type="file" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          
          {/* NAMA DEPAN & NAMA BELAKANG DI BAWAH FOTO */}
          <div className="text-center mt-5">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">
              {profile.first_name || 'Nama'} {profile.last_name || 'Belakang'}
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 italic">
              {profile.email}
            </p>
          </div>
        </div>

        {/* --- 2. AREA TAMPILAN ISI (TENGAH) --- */}
        <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm min-h-[300px] mb-6">
          <AnimatePresence mode="wait">
            
            {activeTab === 'notifikasi' && (
              <motion.div key="notif" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h3 className="text-lg font-black italic uppercase border-b-2 border-black pb-2 inline-block tracking-tighter">Notifikasi</h3>
                <div className="bg-gray-50 p-6 rounded-3xl flex gap-4 items-center">
                  <Bell className="text-gray-300" />
                  <p className="text-xs font-bold text-gray-500 italic">Belum ada notifikasi baru untuk Anda.</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'profil' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <h3 className="text-lg font-black italic uppercase border-b-2 border-black pb-2 inline-block tracking-tighter">Verifikasi & Mitra</h3>
                <div className="space-y-4">
                  <div className="p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                    <Upload className="text-gray-300 mb-2" size={24} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center">Ketuk untuk Unggah KTP (KYC)</span>
                  </div>
                  <div className="p-6 bg-black text-white rounded-3xl flex flex-col gap-4 shadow-xl">
                     <p className="font-bold text-sm italic tracking-tight text-center">Ingin menyewakan properti Anda?</p>
                     <Button className="bg-white text-black hover:bg-gray-200 font-black rounded-xl w-full h-12 text-[10px] tracking-widest uppercase">Daftar Jadi Mitra</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'keamanan' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h3 className="text-lg font-black italic uppercase border-b-2 border-black pb-2 inline-block tracking-tighter">Keamanan</h3>
                <div className="p-5 bg-white rounded-2xl border border-gray-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4"><Lock className="text-gray-400" size={20} /> <span className="font-bold text-sm italic">Ganti Password Akun</span></div>
                  <ChevronRight size={18} className="text-gray-200" />
                </div>
              </motion.div>
            )}

            {activeTab === 'bantuan' && (
              <motion.div key="help" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h3 className="text-lg font-black italic uppercase border-b-2 border-black pb-2 inline-block tracking-tighter">Pusat Bantuan</h3>
                <div className="p-6 bg-gray-50 rounded-3xl flex flex-col gap-2">
                  <MessageSquare className="text-black" />
                  <p className="font-black text-sm uppercase italic">Hubungi Dukungan</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Tim kami siap membantu kendala teknis Anda 24/7.</p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* --- 3. KARTU MENU NAVIGASI (BAWAH) --- */}
        <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm">
          <div className="mb-6 px-2">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase underline decoration-4 underline-offset-8 decoration-gray-50">Pengaturan</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
              { id: 'profil', label: 'Profil & KYC', icon: User },
              { id: 'keamanan', label: 'Keamanan', icon: ShieldCheck },
              { id: 'bantuan', label: 'Bantuan', icon: HelpCircle },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-5 rounded-2xl font-bold transition-all ${
                  activeTab === item.id ? 'bg-black text-white shadow-xl translate-x-1' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} />
                  <span className="text-sm uppercase tracking-tighter italic">{item.label}</span>
                </div>
                <ChevronRight size={18} className={activeTab === item.id ? 'text-white' : 'text-gray-200'} />
              </button>
            ))}

            <div className="pt-4 mt-2 border-t border-gray-50">
              <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all">
                <div className="flex items-center gap-4"><LogOut size={20} /><span className="text-sm uppercase tracking-tighter italic font-black">Keluar dari Akun</span></div>
                <ChevronRight size={18} className="text-red-100" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
