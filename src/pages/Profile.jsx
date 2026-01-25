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
    first_name: '', last_name: '', phone: '', email: '', password: ''
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
            avatar_url: data.avatar_url || '',
            password: '' // Kosongkan untuk keamanan
          });
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    getProfile();
  }, [user]);

  // Fungsi Update khusus di Menu Keamanan
  const handleUpdateSecurity = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // 1. Update Tabel Profiles (Nama & Phone)
      const { error: dbError } = await supabase.from('profiles').upsert({
        id: user.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        updated_at: new Date(),
      });
      if (dbError) throw dbError;

      // 2. Update Auth (Email & Password jika diisi)
      const updateData = { email: profile.email };
      if (profile.password) updateData.password = profile.password;
      
      const { error: authError } = await supabase.auth.updateUser(updateData);
      if (authError) throw authError;

      toast({ title: "Berhasil", description: "Data keamanan telah diperbarui." });
    } catch (error) {
      toast({ variant: "destructive", description: error.message });
    } finally { setUpdating(false); }
  };

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
        
        {/* --- 1. HEADER UTAMA (FOTO & NAMA TETAP DI LUAR) --- */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <div className="w-28 h-28 rounded-[38px] overflow-hidden bg-black flex items-center justify-center shadow-2xl border-4 border-white">
              {uploadingImage ? <Loader2 className="animate-spin text-white" /> : profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-white text-4xl font-black italic">{initial}</span>}
            </div>
            <label className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-2xl shadow-lg border border-gray-100 cursor-pointer hover:bg-black hover:text-white transition-all">
              <Camera size={18} /><input type="file" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div className="text-center mt-5">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">{profile.first_name} {profile.last_name}</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 italic">{profile.email}</p>
          </div>
        </div>

        {/* --- 2. AREA TAMPILAN ISI (ATAS) --- */}
        <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm min-h-[350px] mb-6">
          <AnimatePresence mode="wait">
            
            {/* NOTIFIKASI */}
            {activeTab === 'notifikasi' && (
              <motion.div key="notif" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 text-center py-10">
                <Bell className="mx-auto text-gray-200" size={48} />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Belum Ada Notifikasi Masuk</p>
              </motion.div>
            )}

            {/* PROFIL & KYC (Hanya Verifikasi & Mitra) */}
            {activeTab === 'profil' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <h3 className="text-lg font-black italic uppercase border-b-2 border-black pb-2 inline-block">Verifikasi & Mitra</h3>
                <div className="p-10 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-all">
                  <Upload className="text-gray-300 mb-2" size={32} />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Unggah KTP Sesuai Identitas</span>
                </div>
                <div className="p-6 bg-black text-white rounded-3xl flex flex-col gap-4">
                   <p className="font-bold text-sm italic">Ingin jadi Partner kami?</p>
                   <Button className="bg-white text-black hover:bg-gray-200 font-black rounded-xl w-full h-12 text-[10px] tracking-widest">DAFTAR MITRA PROPERTI</Button>
                </div>
              </motion.div>
            )}

            {/* KEAMANAN (SEMUA FORM EDIT DI SINI) */}
            {activeTab === 'keamanan' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h3 className="text-lg font-black italic uppercase border-b-2 border-black pb-2 inline-block">Pengaturan Keamanan</h3>
                
                <form onSubmit={handleUpdateSecurity} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-gray-400">Nama Depan</Label>
                      <Input value={profile.first_name} onChange={(e) => setProfile({...profile, first_name: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-gray-400">Nama Belakang</Label>
                      <Input value={profile.last_name} onChange={(e) => setProfile({...profile, last_name: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-gray-400">Nomer Ponsel</Label>
                    <Input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                  </div>

                  <div className="space-y-1 pt-2 border-t border-gray-50">
                    <Label className="text-[10px] font-black uppercase text-gray-400">Email Utama</Label>
                    <Input value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-gray-400">Ganti Password</Label>
                    <Input type="password" placeholder="Isi untuk ganti password" value={profile.password} onChange={(e) => setProfile({...profile, password: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                  </div>

                  <Button type="submit" disabled={updating} className="w-full bg-black text-white hover:bg-gray-800 font-black rounded-xl h-14 mt-4 shadow-xl">
                    {updating ? <Loader2 className="animate-spin mr-2" /> : 'SIMPAN SEMUA PERUBAHAN'}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* BANTUAN */}
            {activeTab === 'bantuan' && (
              <motion.div key="help" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h3 className="text-lg font-black italic uppercase border-b-2 border-black pb-2 inline-block">Bantuan</h3>
                <div className="p-8 bg-gray-50 rounded-[32px] text-center space-y-4">
                  <MessageSquare className="mx-auto text-black" size={32} />
                  <p className="font-black text-sm italic uppercase">Butuh Bantuan Cepat?</p>
                  <Button variant="outline" className="w-full rounded-2xl border-black font-black text-[10px] tracking-widest uppercase">Chat Admin WhatsApp</Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* --- 3. KARTU MENU NAVIGASI (BAWAH) --- */}
        <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm">
          <div className="mb-6 px-2"><h2 className="text-2xl font-black italic tracking-tighter uppercase underline decoration-4 underline-offset-8 decoration-gray-50">Pengaturan</h2></div>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
              { id: 'profil', label: 'Profil & KYC', icon: User },
              { id: 'keamanan', label: 'Keamanan', icon: ShieldCheck },
              { id: 'bantuan', label: 'Bantuan', icon: HelpCircle },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between p-5 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-black text-white shadow-xl scale-[1.02]' : 'text-gray-400 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-4"><item.icon size={20} /><span className="text-sm uppercase tracking-tighter italic">{item.label}</span></div>
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
