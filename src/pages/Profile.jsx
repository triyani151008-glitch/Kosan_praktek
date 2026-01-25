 import React, { useEffect, useState } from 'react';
import { 
  User, Phone, Mail, Edit3, Loader2, LogOut, 
  Camera, CheckCircle2, ChevronRight, ShieldCheck, 
  Bell, HelpCircle, Upload, Lock, KeyRound, 
  MessageSquare, Info 
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

  // Efek untuk otomatis scroll ke atas saat ganti menu
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

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

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-black" /></div>;

  const initial = profile.first_name ? profile.first_name[0].toUpperCase() : 'U';

  const menuItems = [
    { id: 'notifikasi', label: 'Notif', icon: Bell },
    { id: 'profil', label: 'Profil', icon: User },
    { id: 'keamanan', label: 'Aman', icon: ShieldCheck },
    { id: 'bantuan', label: 'Bantuan', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-black pb-20 pt-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* --- NAVIGATION (Sticky di atas pada Mobile, Sidebar di Desktop) --- */}
          <div className="lg:col-span-3 sticky top-20 z-10">
            <div className="bg-white rounded-3xl p-4 lg:p-6 border border-gray-100 shadow-sm">
              <div className="hidden lg:block mb-8 px-2 font-black text-2xl tracking-tighter italic border-b border-gray-50 pb-4">
                KOSAN.
              </div>
              
              {/* Flex-row di mobile agar tidak memakan tempat ke bawah */}
              <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 no-scrollbar">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all text-sm ${
                      activeTab === item.id ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon size={18} /> 
                    <span>{item.label}</span>
                  </button>
                ))}
                
                <button onClick={handleLogout} className="lg:mt-10 flex items-center gap-2 px-5 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all text-sm">
                  <LogOut size={18} /> <span className="hidden lg:inline">Keluar</span>
                </button>
              </nav>
            </div>
          </div>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="lg:col-span-9 bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm min-h-[500px]">
            <AnimatePresence mode="wait">
              
              {/* 1. NOTIFIKASI */}
              {activeTab === 'notifikasi' && (
                <motion.div key="notif" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h3 className="text-xl font-black italic border-l-4 border-black pl-4">Kotak Masuk</h3>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex gap-4 items-center">
                    <div className="p-3 bg-black text-white rounded-full"><Info size={20} /></div>
                    <div>
                      <p className="font-bold text-sm">Status Verifikasi</p>
                      <p className="text-xs text-gray-500">Lengkapi KTP Anda di tab Profil untuk keamanan ekstra.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. PROFIL & KYC */}
              {activeTab === 'profil' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10">
                  <h3 className="text-xl font-black italic border-l-4 border-black pl-4">Data Diri & KYC</h3>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 rounded-[28px] border border-gray-100">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-xl">
                        {uploadingImage ? <Loader2 className="animate-spin text-white" /> : profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-white text-3xl font-bold">{initial}</span>}
                      </div>
                      <label className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-md cursor-pointer hover:bg-black hover:text-white transition-all">
                        <Camera size={14} /><input type="file" className="hidden" onChange={handleAvatarUpload} />
                      </label>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="font-black text-lg">{profile.first_name || 'User'} {profile.last_name}</p>
                      <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">{profile.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Unggah KTP (Standar KYC)</Label>
                    <div className="h-40 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center bg-gray-50/30 hover:bg-gray-50 transition-all group">
                      <Upload className="text-gray-300 mb-2 group-hover:text-black transition-colors" size={32} />
                      <span className="text-xs font-bold text-gray-400">Pilih file foto KTP Anda</span>
                    </div>
                  </div>

                  <div className="p-8 bg-black rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                      <h4 className="font-black text-lg uppercase italic tracking-tighter">Jadilah Mitra Kami</h4>
                      <p className="text-gray-400 text-xs mt-1">Daftarkan properti Anda dan raih penghasilan lebih.</p>
                    </div>
                    <Button className="bg-white text-black hover:bg-gray-200 font-black rounded-xl px-10 h-12 shadow-lg transition-transform active:scale-95">DAFTAR SEKARANG</Button>
                  </div>
                </motion.div>
              )}

              {/* 3. KEAMANAN */}
              {activeTab === 'keamanan' && (
                <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h3 className="text-xl font-black italic border-l-4 border-black pl-4">Keamanan Akun</h3>
                  <div className="p-5 bg-white rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-black transition-all cursor-pointer">
                    <div className="flex items-center gap-4 text-gray-400 group-hover:text-black">
                      <KeyRound size={20} /> <span className="font-bold text-sm">Ganti Kata Sandi</span>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl font-bold">UBAH</Button>
                  </div>
                </motion.div>
              )}

              {/* 4. BANTUAN */}
              {activeTab === 'bantuan' && (
                <motion.div key="help" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h3 className="text-xl font-black italic border-l-4 border-black pl-4">Bantuan</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="p-6 bg-black text-white rounded-3xl text-left shadow-xl hover:scale-[1.02] transition-all">
                      <MessageSquare className="mb-4" size={28} />
                      <p className="font-black text-base italic uppercase">Layanan Chat CS</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-bold tracking-widest leading-relaxed uppercase">Tersedia 24 Jam Non-Stop</p>
                    </button>
                    <button className="p-6 bg-white border border-gray-100 rounded-3xl text-left hover:shadow-lg transition-all">
                      <HelpCircle className="mb-4 text-gray-400" size={28} />
                      <p className="font-black text-base italic uppercase">Pusat Informasi</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-bold tracking-widest leading-relaxed uppercase">Panduan & Pertanyaan Umum</p>
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
