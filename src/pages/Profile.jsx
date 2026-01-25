import React, { useEffect, useState } from 'react';
import { 
  User, Phone, Mail, Edit3, Loader2, LogOut, 
  Camera, CheckCircle2, ChevronRight, ShieldCheck, 
  Bell, HelpCircle, Upload, Lock, KeyRound, 
  MessageSquare, Info, Smartphone, Eye, EyeOff, ShieldAlert
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
  
  // State Keamanan
  const [securityData, setSecurityData] = useState({
    first_name: '', last_name: '', phone: '', email: '',
    oldPassword: '', newPassword: '', confirmPassword: '',
    otpCode: '', avatar_url: ''
  });
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        if (!user) return;
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setSecurityData(prev => ({
            ...prev,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || user.phone || '', 
            email: data.email || user.email || '',
            avatar_url: data.avatar_url || ''
          }));
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    getProfile();
  }, [user]);

  // Logika Update (Nama, OTP, Password) tetap sama seperti sebelumnya
  const handleUpdateName = async () => { /* ... logika update nama ... */ };
  const handleRequestOTP = async (type) => { /* ... logika request OTP ... */ };
  const handleVerifyOTP = async (type) => { /* ... logika verifikasi OTP ... */ };
  const handleChangePassword = async (e) => { e.preventDefault(); /* ... logika password ... */ };

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
      setSecurityData((prev) => ({ ...prev, avatar_url: publicUrl }));
      toast({ title: "Berhasil", description: "Foto profil diperbarui." });
    } catch (error) { toast({ variant: "destructive", description: "Gagal upload." }); }
    finally { setUploadingImage(false); }
  };

  const handleLogout = async () => { await signOut(); navigate('/'); };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;

  const initial = securityData.first_name && securityData.first_name.length > 0 ? securityData.first_name[0].toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black pb-24 pt-10 font-sans">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* --- HEADER PROFIL --- */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-[32px] overflow-hidden bg-black flex items-center justify-center shadow-2xl border-4 border-white transition-transform hover:scale-105 duration-500">
              {uploadingImage ? <Loader2 className="animate-spin text-white" /> : securityData.avatar_url ? <img src={securityData.avatar_url} className="w-full h-full object-cover" /> : <span className="text-white text-3xl font-black italic">{initial}</span>}
            </div>
            <label className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:bg-black hover:text-white transition-all"><Camera size={16} /><input type="file" className="hidden" onChange={handleAvatarUpload} /></label>
          </div>
          <div className="text-center mt-4">
            <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">{securityData.first_name} {securityData.last_name}</h2>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1 italic">{securityData.email}</p>
          </div>
        </div>

        {/* --- AREA TAMPILAN KONTEN (ATAS) --- */}
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm min-h-[400px] mb-6">
          <AnimatePresence mode="wait">
            
            {activeTab === 'keamanan' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <h3 className="text-lg font-black italic uppercase border-b-2 border-black pb-2 inline-block tracking-tighter mb-4">Pengaturan Keamanan</h3>
                
                {/* 1. IDENTITAS (Style AuthModal) */}
                <div className="space-y-4">
                  <p className="text-[11px] font-bold uppercase text-gray-500 tracking-widest ml-1">Nama Profil</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                      <Input placeholder="Nama Depan" value={securityData.first_name} onChange={(e) => setSecurityData({...securityData, first_name: e.target.value})} className="h-12 pl-12 rounded-xl border-gray-200 bg-white font-medium focus:border-black focus:ring-0" />
                    </div>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                      <Input placeholder="Nama Belakang" value={securityData.last_name} onChange={(e) => setSecurityData({...securityData, last_name: e.target.value})} className="h-12 pl-12 rounded-xl border-gray-200 bg-white font-medium focus:border-black focus:ring-0" />
                    </div>
                  </div>
                  <Button onClick={handleUpdateName} className="w-full bg-black text-white rounded-xl h-11 font-bold text-xs uppercase tracking-widest shadow-lg">Update Identitas</Button>
                </div>

                {/* 2. KONTAK (Style AuthModal) */}
                <div className="space-y-4 pt-6 border-t border-gray-50">
                  <p className="text-[11px] font-bold uppercase text-gray-500 tracking-widest ml-1">Email & Ponsel (OTP)</p>
                  <div className="space-y-4">
                    {/* Input Email */}
                    <div className="space-y-2">
                      <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                          <Input value={securityData.email} onChange={(e) => setSecurityData({...securityData, email: e.target.value})} className="h-12 pl-12 rounded-xl border-gray-200 bg-white font-medium" />
                        </div>
                        <Button variant="outline" className="h-12 rounded-xl px-4 border-gray-200 font-bold text-[10px]" onClick={() => handleRequestOTP('email')}>KIRIM OTP</Button>
                      </div>
                    </div>
                    {/* Input Ponsel */}
                    <div className="space-y-2">
                      <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                          <Smartphone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                          <Input value={securityData.phone} onChange={(e) => setSecurityData({...securityData, phone: e.target.value})} className="h-12 pl-12 rounded-xl border-gray-200 bg-white font-medium" />
                        </div>
                        <Button variant="outline" className="h-12 rounded-xl px-4 border-gray-200 font-bold text-[10px]" onClick={() => handleRequestOTP('phone')}>KIRIM OTP</Button>
                      </div>
                    </div>
                    {/* Input Verifikasi OTP (Hanya muncul jika OTP terkirim) */}
                    {otpSent && (
                      <div className="flex gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <Input placeholder="Masukan Kode OTP" value={securityData.otpCode} onChange={(e) => setSecurityData({...securityData, otpCode: e.target.value})} className="h-11 rounded-xl bg-white border-gray-200 text-center font-black tracking-[0.4em]" />
                        <Button onClick={() => handleVerifyOTP('email')} className="bg-black text-white rounded-xl px-6 h-11 font-bold text-[10px]">VERIFIKASI</Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. PASSWORD (Style AuthModal) */}
                <div className="space-y-4 pt-6 border-t border-gray-50">
                  <p className="text-[11px] font-bold uppercase text-red-500 tracking-widest ml-1">Ubah Kata Sandi</p>
                  
                  {/* Password Lama */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <Input type={showOldPassword ? "text" : "password"} placeholder="Password Lama" value={securityData.oldPassword} onChange={(e) => setSecurityData({...securityData, oldPassword: e.target.value})} className="h-12 pl-12 pr-12 rounded-xl border-gray-200 bg-white font-medium" />
                    <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-4 top-3.5 text-gray-400">
                      {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Baru */}
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <Input type={showNewPassword ? "text" : "password"} placeholder="Password Baru" value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} className="h-12 pl-12 pr-12 rounded-xl border-gray-200 bg-white font-medium" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-3.5 text-gray-400">
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Konfirmasi Password */}
                  <div className="relative">
                    <ShieldAlert className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <Input type={showConfirmPassword ? "text" : "password"} placeholder="Ulangi Password Baru" value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} className="h-12 pl-12 pr-12 rounded-xl border-gray-200 bg-white font-medium" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-3.5 text-gray-400">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <Button className="w-full bg-red-600 text-white rounded-xl h-12 font-bold text-xs uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-50">Ganti Password Sekarang</Button>
                </div>
              </motion.div>
            )}

            {/* Tab Lainnya (Placeholder) */}
            {activeTab === 'profil' && <div className="text-center py-20 text-gray-400 italic">Halaman Verifikasi & Mitra</div>}
            {activeTab === 'notifikasi' && <div className="text-center py-20 text-gray-400 italic">Halaman Kotak Masuk</div>}
            {activeTab === 'bantuan' && <div className="text-center py-20 text-gray-400 italic">Pusat Bantuan Layanan</div>}

          </AnimatePresence>
        </div>

        {/* --- MENU PENGATURAN (BAWAH) --- */}
        <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm">
          <div className="mb-6 px-2"><h2 className="text-2xl font-black italic uppercase tracking-tighter underline decoration-4 underline-offset-8 decoration-gray-50">Pengaturan</h2></div>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
              { id: 'profil', label: 'Profil & KYC', icon: User },
              { id: 'keamanan', label: 'Keamanan', icon: ShieldCheck },
              { id: 'bantuan', label: 'Bantuan', icon: HelpCircle },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between p-5 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-4"><item.icon size={20} /><span className="text-sm uppercase italic">{item.label}</span></div>
                <ChevronRight size={18} className={activeTab === item.id ? 'text-white' : 'text-gray-200'} />
              </button>
            ))}
            <div className="pt-4 mt-2 border-t border-gray-50">
              <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 text-red-500 font-bold hover:bg-red-50 rounded-2xl">
                <div className="flex items-center gap-4"><LogOut size={20} /><span className="text-sm uppercase italic font-black">Keluar dari Akun</span></div>
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
