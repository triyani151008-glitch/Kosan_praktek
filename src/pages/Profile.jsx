import React, { useEffect, useState } from 'react';
import { 
  User, Phone, Mail, Edit3, Loader2, LogOut, 
  Camera, CheckCircle2, ChevronRight, ShieldCheck, 
  Bell, HelpCircle, Upload, Lock, KeyRound, 
  MessageSquare, Info, Smartphone, ShieldAlert, Fingerprint
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
  
  // State untuk Keamanan
  const [securityData, setSecurityData] = useState({
    first_name: '', last_name: '', phone: '', email: '',
    oldPassword: '', newPassword: '', confirmPassword: '',
    otpCode: ''
  });
  const [otpSent, setOtpSent] = useState(false); // Cek apakah OTP sudah dikirim

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

  // 1. FUNGSI UPDATE NAMA (Tanpa OTP)
  const handleUpdateName = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase.from('profiles').update({
        first_name: securityData.first_name,
        last_name: securityData.last_name,
      }).eq('id', user.id);
      if (error) throw error;
      toast({ title: "Berhasil", description: "Nama Anda telah diperbarui." });
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setUpdating(false); }
  };

  // 2. FUNGSI MINTA OTP (Email/Ponsel)
  const handleRequestOTP = async (type) => {
    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser(
        type === 'email' ? { email: securityData.email } : { phone: securityData.phone }
      );
      if (error) throw error;
      setOtpSent(true);
      toast({ title: "OTP Dikirim", description: `Silakan cek ${type === 'email' ? 'Email' : 'SMS'} Anda.` });
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setUpdating(false); }
  };

  // 3. FUNGSI VERIFIKASI OTP
  const handleVerifyOTP = async (type) => {
    setUpdating(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: type === 'email' ? securityData.email : undefined,
        phone: type === 'phone' ? securityData.phone : undefined,
        token: securityData.otpCode,
        type: type === 'email' ? 'email_change' : 'phone_change'
      });
      if (error) throw error;
      setOtpSent(false);
      toast({ title: "Verifikasi Berhasil", description: `${type} Anda telah diperbarui.` });
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setUpdating(false); }
  };

  // 4. FUNGSI GANTI PASSWORD (Old, New, Confirm)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      return toast({ variant: "destructive", description: "Konfirmasi password baru tidak cocok!" });
    }
    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: securityData.newPassword });
      if (error) throw error;
      setSecurityData(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
      toast({ title: "Berhasil", description: "Password Anda telah diperbarui." });
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setUpdating(false); }
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
      setSecurityData((prev) => ({ ...prev, avatar_url: publicUrl }));
      toast({ title: "Berhasil", description: "Foto profil diperbarui." });
    } catch (error) { toast({ variant: "destructive", description: "Gagal upload." }); }
    finally { setUploadingImage(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;

  const initial = securityData.first_name ? securityData.first_name[0].toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-black pb-24 pt-10">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* --- HEADER PROFIL (LUAR) --- */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-[32px] overflow-hidden bg-black flex items-center justify-center shadow-2xl border-4 border-white">
              {uploadingImage ? <Loader2 className="animate-spin text-white" /> : securityData.avatar_url ? <img src={securityData.avatar_url} className="w-full h-full object-cover" /> : <span className="text-white text-3xl font-black italic">{initial}</span>}
            </div>
            <label className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:bg-black hover:text-white transition-all"><Camera size={16} /><input type="file" className="hidden" onChange={handleAvatarUpload} /></label>
          </div>
          <div className="text-center mt-4">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">{securityData.first_name} {securityData.last_name}</h2>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1 italic">{securityData.email}</p>
          </div>
        </div>

        {/* --- AREA TAMPILAN DINAMIS --- */}
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm min-h-[400px] mb-6">
          <AnimatePresence mode="wait">
            
            {/* TAB KEAMANAN (FORM EDIT DI SINI) */}
            {activeTab === 'keamanan' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10">
                <div className="flex items-center gap-3 border-b-2 border-black pb-2 mb-6">
                  <ShieldCheck size={24} />
                  <h3 className="text-lg font-black italic uppercase tracking-tighter">Pengaturan Keamanan</h3>
                </div>

                {/* Edit Nama */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Informasi Nama</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Nama Depan" value={securityData.first_name} onChange={(e) => setSecurityData({...securityData, first_name: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                    <Input placeholder="Nama Belakang" value={securityData.last_name} onChange={(e) => setSecurityData({...securityData, last_name: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                  </div>
                  <Button onClick={handleUpdateName} disabled={updating} className="w-full bg-black text-white rounded-xl h-10 font-black text-[10px] tracking-widest uppercase">Update Nama</Button>
                </div>

                {/* Edit Email/Ponsel (OTP) */}
                <div className="space-y-4 pt-6 border-t border-gray-50">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Email & Ponsel (Membutuhkan OTP)</p>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input value={securityData.email} onChange={(e) => setSecurityData({...securityData, email: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold flex-1" />
                      <Button onClick={() => handleRequestOTP('email')} disabled={updating} variant="outline" className="rounded-xl font-bold text-[10px]">OTP</Button>
                    </div>
                    <div className="flex gap-2">
                      <Input value={securityData.phone} onChange={(e) => setSecurityData({...securityData, phone: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold flex-1" />
                      <Button onClick={() => handleRequestOTP('phone')} disabled={updating} variant="outline" className="rounded-xl font-bold text-[10px]">OTP</Button>
                    </div>
                    {otpSent && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 p-3 bg-yellow-50 rounded-xl">
                        <Input placeholder="Masukan Kode OTP" value={securityData.otpCode} onChange={(e) => setSecurityData({...securityData, otpCode: e.target.value})} className="h-10 rounded-lg bg-white border-yellow-200 text-center font-black tracking-[0.5em]" />
                        <Button onClick={() => handleVerifyOTP('email')} className="bg-black text-white rounded-lg px-4 h-10 font-black text-[10px]">VERIFIKASI</Button>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Ganti Password */}
                <form onSubmit={handleChangePassword} className="space-y-4 pt-6 border-t border-gray-50">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic text-red-500">Ubah Password</p>
                  <Input type="password" placeholder="Password Lama" value={securityData.oldPassword} onChange={(e) => setSecurityData({...securityData, oldPassword: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                  <Input type="password" placeholder="Password Baru" value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                  <Input type="password" placeholder="Ulangi Password Baru" value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                  <Button type="submit" disabled={updating} className="w-full bg-red-600 text-white rounded-xl h-12 font-black text-[10px] tracking-widest uppercase hover:bg-red-700">Ganti Password</Button>
                </form>
              </motion.div>
            )}

            {/* TAB LAINNYA (Placeholder) */}
            {activeTab === 'notifikasi' && <div className="text-center py-20 text-gray-300 font-black uppercase italic tracking-widest">Belum Ada Notifikasi</div>}
            {activeTab === 'profil' && <div className="text-center py-20 text-gray-300 font-black uppercase italic tracking-widest underline decoration-dashed">Verifikasi Identitas KYC</div>}
            {activeTab === 'bantuan' && <div className="text-center py-20 text-gray-300 font-black uppercase italic tracking-widest underline decoration-dashed">Pusat Bantuan Kosan</div>}

          </AnimatePresence>
        </div>

        {/* --- MENU PENGATURAN (BAWAH) --- */}
        <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm">
          <div className="mb-6 px-2"><h2 className="text-2xl font-black italic tracking-tighter uppercase underline decoration-4 underline-offset-8 decoration-gray-50 text-black">Pengaturan</h2></div>
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
                <div className="flex items-center gap-4"><LogOut size={20} /><span className="text-sm uppercase tracking-tighter italic font-black">Logout Akun</span></div>
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
