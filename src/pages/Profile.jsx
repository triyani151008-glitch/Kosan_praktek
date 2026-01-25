 import React, { useEffect, useState } from 'react';
import { 
  User, Phone, Mail, Edit3, Loader2, LogOut, 
  Camera, CheckCircle2, ChevronRight, Settings2, 
  ShieldCheck, Bell, HelpCircle, Upload, Lock, 
  KeyRound, MessageSquare, Info 
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

  // FUNGSI UNGGAH FOTO PROFIL
  const handleAvatarUpload = async (event) => {
    try {
      setUploadingImage(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, avatar_url: publicUrl, updated_at: new Date() });

      if (updateError) throw updateError;

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      toast({ title: "Berhasil", description: "Foto profil telah diperbarui." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gagal", description: "Pastikan bucket 'avatars' sudah ada di Supabase." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => { await signOut(); navigate('/'); };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;

  const initial = profile.first_name ? profile.first_name[0].toUpperCase() : (profile.email ? profile.email[0].toUpperCase() : 'U');

  return (
    <div className="min-h-screen bg-white text-black pb-20 pt-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* --- SIDEBAR MENU --- */}
          <div className="md:col-span-3 space-y-2">
            <div className="mb-8 px-4 font-black text-2xl tracking-tighter italic">KOSAN.</div>
            <nav className="space-y-1">
              {[
                { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
                { id: 'profil', label: 'Profil & KYC', icon: User },
                { id: 'keamanan', label: 'Keamanan', icon: ShieldCheck },
                { id: 'bantuan', label: 'Bantuan', icon: HelpCircle },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    activeTab === item.id ? 'bg-black text-white shadow-lg scale-105' : 'text-gray-400 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <item.icon size={20} /> {item.label}
                </button>
              ))}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 mt-10 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all">
                <LogOut size={20} /> Keluar
              </button>
            </nav>
          </div>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="md:col-span-9 bg-gray-50/50 rounded-[32px] p-6 md:p-10 border border-gray-100">
            <AnimatePresence mode="wait">
              
              {/* 1. NOTIFIKASI */}
              {activeTab === 'notifikasi' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <h3 className="text-xl font-black mb-6">Kotak Masuk</h3>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 items-start">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Info size={20} /></div>
                    <div>
                      <p className="font-bold text-sm">Selamat Datang!</p>
                      <p className="text-xs text-gray-500">Profil Anda berhasil dibuat. Lengkapi KYC untuk mulai bertransaksi.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. PROFIL & KYC */}
              {activeTab === 'profil' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                  <h3 className="text-xl font-black">Data Diri & Identitas</h3>

                  {/* FOTO PROFIL (TAMBAHAN BARU) */}
                  <div className="flex flex-col items-center sm:items-start gap-4 pb-6 border-b border-gray-100">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl border-2 border-white bg-black flex items-center justify-center">
                        {uploadingImage ? (
                          <Loader2 className="animate-spin text-white" size={24} />
                        ) : profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-3xl font-bold">{initial}</span>
                        )}
                      </div>
                      <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:bg-black hover:text-white transition-all">
                        <Camera size={16} />
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingImage} />
                      </label>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-sm font-bold">Foto Profil</p>
                      <p className="text-xs text-gray-400">Gunakan foto wajah yang jelas.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-400 uppercase">Nama Lengkap</Label>
                      <Input value={`${profile.first_name} ${profile.last_name}`} readOnly className="rounded-xl bg-white border-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-400 uppercase">Email</Label>
                      <Input value={profile.email} readOnly className="rounded-xl bg-white border-gray-200" />
                    </div>
                  </div>

                  {/* KYC Section */}
                  <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-200">
                    <h4 className="font-bold mb-2 flex items-center gap-2 uppercase text-xs tracking-widest"><Upload size={16} /> Verifikasi KTP</h4>
                    <div className="h-32 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all">
                      <Camera className="text-gray-300 mb-2" />
                      <span className="text-xs font-bold text-gray-400 italic">Ambil foto KTP asli</span>
                    </div>
                  </div>

                  <div className="bg-black text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="font-bold text-center sm:text-left">Daftarkan Properti Anda & Jadi Mitra Kami</p>
                    <Button className="bg-white text-black hover:bg-gray-200 font-bold px-6 rounded-xl">Daftar Mitra</Button>
                  </div>
                </motion.div>
              )}

              {/* 3. KEAMANAN */}
              {activeTab === 'keamanan' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h3 className="text-xl font-black mb-6">Keamanan</h3>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4"><Lock className="text-gray-400" /> <span className="text-sm font-bold">Ganti Kata Sandi</span></div>
                    <Button variant="outline" size="sm" className="rounded-lg">Ubah</Button>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4"><ShieldCheck className="text-gray-400" /> <span className="text-sm font-bold">2-Factor Authentication</span></div>
                    <Button variant="outline" size="sm" className="rounded-lg">Aktifkan</Button>
                  </div>
                </motion.div>
              )}

              {/* 4. BANTUAN */}
              {activeTab === 'bantuan' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h3 className="text-xl font-black mb-6">Bantuan</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 flex flex-col gap-2">
                      <MessageSquare className="text-gray-300" />
                      <p className="font-bold text-sm">Chat CS</p>
                      <p className="text-xs text-gray-500 italic">Tersedia 24/7</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 flex flex-col gap-2">
                      <HelpCircle className="text-gray-300" />
                      <p className="font-bold text-sm">Pusat FAQ</p>
                      <p className="text-xs text-gray-500 italic">Cari panduan aplikasi</p>
                    </div>
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
