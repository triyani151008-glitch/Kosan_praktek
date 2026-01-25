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
    <div className="min-h-screen bg-[#F9F9F9] text-black pb-32 pt-10 flex flex-col items-center">
      <div className="container mx-auto px-4 max-w-2xl flex-1">
        
        {/* --- 1. KONTEN TAMPILAN (DI ATAS) --- */}
        <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm min-h-[500px] mb-8">
          <AnimatePresence mode="wait">
            
            {/* NOTIFIKASI */}
            {activeTab === 'notifikasi' && (
              <motion.div key="notif" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h3 className="text-2xl font-black italic">Kotak Masuk</h3>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex gap-4 items-center">
                  <div className="p-3 bg-black text-white rounded-2xl shadow-lg"><Info size={24} /></div>
                  <div>
                    <p className="font-bold text-base">Verifikasi Akun</p>
                    <p className="text-xs text-gray-500">Mohon lengkapi KYC untuk keamanan data Anda.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PROFIL & KYC */}
            {activeTab === 'profil' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-[36px] overflow-hidden bg-black flex items-center justify-center shadow-2xl">
                      {uploadingImage ? <Loader2 className="animate-spin text-white" /> : profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-white text-4xl font-bold italic">{initial}</span>}
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-2xl shadow-lg border border-gray-100 cursor-pointer hover:bg-black hover:text-white transition-all">
                      <Camera size={18} /><input type="file" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic underline decoration-4 underline-offset-4">Profil & KYC</h3>
                    <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest">{profile.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nama Lengkap</Label>
                    <Input value={`${profile.first_name} ${profile.last_name}`} readOnly className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
                  </div>
                  <div className="space-y-2 pt-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Unggah KTP (KYC)</Label>
                    <div className="h-32 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-100 cursor-pointer transition-all">
                      <Upload className="text-gray-300 mb-2" />
                      <span className="text-xs font-bold text-gray-400 uppercase italic">Ketuk untuk ambil foto</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-black rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                   <p className="font-bold text-sm italic">Mau jadi Mitra Properti?</p>
                   <Button className="bg-white text-black hover:bg-gray-200 font-black rounded-xl px-6 h-10 shadow-lg text-xs">DAFTAR MITRA</Button>
                </div>
              </motion.div>
            )}

            {/* KEAMANAN */}
            {activeTab === 'keamanan' && (
              <motion.div key="security" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h3 className="text-2xl font-black italic">Keamanan Akun</h3>
                <div className="space-y-4">
                  <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <Lock className="text-gray-400" /> <span className="font-bold text-sm">Ganti Password</span>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl font-black">UBAH</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* BANTUAN */}
            {activeTab === 'bantuan' && (
              <motion.div key="help" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h3 className="text-2xl font-black italic">Bantuan</h3>
                <div className="grid grid-cols-1 gap-4">
                  <button className="p-6 bg-black text-white rounded-3xl text-left shadow-xl flex items-center justify-between group transition-all">
                    <div>
                      <MessageSquare className="mb-2" size={24} />
                      <p className="font-black text-base italic uppercase tracking-tighter">Layanan Chat CS</p>
                    </div>
                    <ChevronRight className="text-gray-500" />
                  </button>
                  <button className="p-6 bg-white border border-gray-100 rounded-3xl text-left shadow-sm flex items-center justify-between group transition-all">
                    <div>
                      <HelpCircle className="mb-2 text-gray-400" size={24} />
                      <p className="font-black text-base italic uppercase tracking-tighter text-gray-400">Pusat Informasi</p>
                    </div>
                    <ChevronRight className="text-gray-100" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* --- 2. KARTU MENU NAVIGASI (DI BAWAH) --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/80 backdrop-blur-xl rounded-[32px] p-3 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center gap-1">
          {[
            { id: 'notifikasi', icon: Bell },
            { id: 'profil', icon: User },
            { id: 'keamanan', icon: ShieldCheck },
            { id: 'bantuan', icon: HelpCircle },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-4 rounded-2xl transition-all relative ${
                activeTab === item.id ? 'bg-black text-white scale-110 shadow-lg' : 'text-gray-300 hover:text-black'
              }`}
            >
              <item.icon size={22} />
              {activeTab === item.id && (
                <motion.div layoutId="activeDot" className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
              )}
            </button>
          ))}
          
          <div className="w-[1px] h-8 bg-gray-100 mx-1" /> {/* Pembatas */}
          
          <button 
            onClick={handleLogout}
            className="p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            title="Logout"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
