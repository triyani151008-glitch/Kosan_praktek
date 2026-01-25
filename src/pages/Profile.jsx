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
        
        {/* --- 1. AREA TAMPILAN KONTEN (ATAS) --- */}
        <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm min-h-[400px] mb-6">
          <AnimatePresence mode="wait">
            
            {/* TAB NOTIFIKASI */}
            {activeTab === 'notifikasi' && (
              <motion.div key="notif" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h3 className="text-xl font-black italic border-l-4 border-black pl-4 uppercase tracking-tighter">Kotak Masuk</h3>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex gap-4 items-center">
                  <div className="p-3 bg-black text-white rounded-2xl"><Info size={24} /></div>
                  <div>
                    <p className="font-bold text-sm">Pembaruan Sistem</p>
                    <p className="text-xs text-gray-500">Fitur KYC kini sudah tersedia di menu Profil.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB PROFIL & KYC */}
            {activeTab === 'profil' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-[32px] overflow-hidden bg-black flex items-center justify-center shadow-2xl">
                      {uploadingImage ? <Loader2 className="animate-spin text-white" /> : profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-white text-4xl font-black italic">{initial}</span>}
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:bg-black hover:text-white transition-all">
                      <Camera size={16} /><input type="file" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Profil & Identitas</h3>
                    <p className="text-xs text-gray-400 font-bold mt-1 uppercase">{profile.email}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nama Lengkap</Label>
                    <Input value={`${profile.first_name} ${profile.last_name}`} readOnly className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
                  </div>
                  <div className="p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all">
                    <Upload className="text-gray-300 mb-2" size={24} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Ketuk Untuk Upload KTP</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB KEAMANAN */}
            {activeTab === 'keamanan' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h3 className="text-xl font-black italic border-l-4 border-black pl-4 uppercase tracking-tighter">Keamanan</h3>
                <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-50 rounded-xl"><Lock className="text-black" size={20} /></div>
                    <span className="font-bold text-sm">Ganti Password</span>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px]">UBAH</Button>
                </div>
              </motion.div>
            )}

            {/* TAB BANTUAN */}
            {activeTab === 'bantuan' && (
              <motion.div key="help" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h3 className="text-xl font-black italic border-l-4 border-black pl-4 uppercase tracking-tighter">Bantuan</h3>
                <div className="grid grid-cols-1 gap-4 text-left">
                  <button className="p-6 bg-black text-white rounded-3xl flex items-center justify-between shadow-xl">
                    <div>
                      <MessageSquare className="mb-2" size={24} />
                      <p className="font-black italic uppercase tracking-tighter">Layanan Chat CS</p>
                    </div>
                    <ChevronRight className="text-gray-500" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* --- 2. KARTU MENU NAVIGASI (BAWAH) --- */}
        <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm">
          <div className="mb-6 px-2">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase underline decoration-4 underline-offset-8 decoration-gray-100">Pengaturan</h2>
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
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-5 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-4">
                  <LogOut size={20} />
                  <span className="text-sm uppercase tracking-tighter italic">Keluar dari Akun</span>
                </div>
                <ChevronRight size={18} className="text-red-100" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center mt-10 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Kosan V4.0 &bull; 2026</p>

      </div>
    </div>
  );
};

export default Profile;
