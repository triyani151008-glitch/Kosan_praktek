 import React, { useEffect, useState } from 'react';
import { 
  User, Phone, Mail, Edit3, Loader2, LogOut, 
  Camera, CheckCircle2, ChevronRight, ShieldCheck, 
  Bell, HelpCircle, Upload, Lock, KeyRound, 
  MessageSquare, Info, Smartphone, Eye, EyeOff,
  ChevronDown
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
  
  const [securityData, setSecurityData] = useState({
    first_name: '', last_name: '', phone: '',
    oldPassword: '', newPassword: '', confirmPassword: '',
    otpCode: '', avatar_url: ''
  });
  
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
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
            avatar_url: data.avatar_url || ''
          }));
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    getProfile();
  }, [user]);

  const handleUpdateName = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase.from('profiles').update({
        first_name: securityData.first_name,
        last_name: securityData.last_name,
      }).eq('id', user.id);
      if (error) throw error;
      toast({ title: "Berhasil", description: "Nama diperbarui." });
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setUpdating(false); }
  };

  const handleRequestOTP = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ phone: securityData.phone });
      if (error) throw error;
      setOtpSent(true);
      toast({ title: "OTP Dikirim", description: "Cek SMS Anda." });
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

  const handleLogout = async () => { await signOut(); navigate('/'); };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;

  const initial = securityData.first_name && securityData.first_name.length > 0 ? securityData.first_name[0].toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-24 pt-10">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[32px] overflow-hidden bg-black flex items-center justify-center shadow-2xl border-4 border-white transition-transform duration-500 group-hover:scale-105">
              {uploadingImage ? <Loader2 className="animate-spin text-white" /> : securityData.avatar_url ? <img src={securityData.avatar_url} className="w-full h-full object-cover" /> : <span className="text-white text-3xl font-black italic">{initial}</span>}
            </div>
            <label className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:bg-black hover:text-white transition-all"><Camera size={16} /><input type="file" className="hidden" onChange={handleAvatarUpload} /></label>
          </div>
          <div className="text-center mt-4">
            <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">{securityData.first_name} {securityData.last_name}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{user?.email}</p>
          </div>
        </div>

        {/* --- AREA KONTEN (ATAS) --- */}
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm min-h-[450px] mb-6">
          <AnimatePresence mode="wait">
            
            {activeTab === 'keamanan' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <h3 className="text-lg font-black uppercase tracking-tighter border-b border-gray-100 pb-4">Pengaturan Keamanan</h3>
                
                {/* 1. SEKSI NAMA */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Nama Depan</Label>
                      <Input placeholder="...." value={securityData.first_name} onChange={(e) => setSecurityData({...securityData, first_name: e.target.value})} className="h-12 rounded-xl border-gray-100 bg-white font-medium" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Nama Belakang</Label>
                      <Input placeholder="...." value={securityData.last_name} onChange={(e) => setSecurityData({...securityData, last_name: e.target.value})} className="h-12 rounded-xl border-gray-100 bg-white font-medium" />
                    </div>
                  </div>
                  <Button onClick={handleUpdateName} disabled={updating} className="w-full bg-black text-white rounded-xl h-12 font-bold uppercase text-[11px] tracking-widest shadow-lg active:scale-95 transition-all">Update Nama</Button>
                </div>

                {/* 2. SEKSI PONSEL (GAYA AUTHMODAL) */}
                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <Label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Nomor Ponsel</Label>
                  <div className="flex gap-2 items-center">
                    {/* Pemilih Kode Negara & Bendera */}
                    <div className="flex items-center gap-2 px-3 h-12 rounded-xl border border-gray-100 bg-white shadow-sm min-w-[100px] justify-center">
                      <img src="https://flagcdn.com/w40/id.png" alt="ID" className="w-5 h-3 object-cover rounded-sm" />
                      <span className="text-[13px] font-bold text-black">+62</span>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                    {/* Input Nomor */}
                    <div className="relative flex-1">
                      <Input value={securityData.phone} onChange={(e) => setSecurityData({...securityData, phone: e.target.value})} className="h-12 rounded-xl border-gray-100 bg-white font-bold" placeholder="81..." />
                    </div>
                  </div>
                  <Button onClick={handleRequestOTP} disabled={updating} className="w-full bg-white text-black border border-gray-100 rounded-xl h-11 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">Kirim Kode Verifikasi (OTP)</Button>
                </div>

                {/* 3. SEKSI PASSWORD */}
                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <Label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Ubah Kata Sandi</Label>
                  
                  {/* Password Lama */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                    <Input type={showOldPass ? "text" : "password"} placeholder="Kata Sandi Lama" value={securityData.oldPassword} onChange={(e) => setSecurityData({...securityData, oldPassword: e.target.value})} className="h-12 pl-12 pr-12 rounded-xl border-gray-100 bg-white font-medium" />
                    <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-4 top-3.5 text-gray-300 hover:text-black">
                      {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Baru */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                    <Input type={showNewPass ? "text" : "password"} placeholder="Kata Sandi Baru" value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} className="h-12 pl-12 pr-12 rounded-xl border-gray-100 bg-white font-medium" />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-3.5 text-gray-300 hover:text-black">
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Konfirmasi Password */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                    <Input type={showConfirmPass ? "text" : "password"} placeholder="Konfirmasi Kata Sandi Baru" value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} className="h-12 pl-12 pr-12 rounded-xl border-gray-100 bg-white font-medium" />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-3.5 text-gray-300 hover:text-black">
                      {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <Button className="w-full bg-black text-white rounded-xl h-14 font-black text-[11px] tracking-[0.2em] uppercase mt-4 shadow-xl shadow-gray-100 active:scale-95 transition-all">Ganti Kata Sandi</Button>
                </div>
              </motion.div>
            )}

            {/* TAB LAINNYA */}
            {activeTab === 'profil' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tighter border-b border-gray-100 pb-4">Profil & Identitas</h3>
                <div className="p-12 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center bg-gray-50 hover:bg-white transition-colors cursor-pointer group">
                  <Upload className="text-gray-300 group-hover:text-black mb-2 transition-colors" size={32} />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic group-hover:text-black">Unggah KTP Sesuai Data</span>
                </div>
                <Button className="w-full bg-black text-white rounded-xl h-12 font-bold uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Daftar Jadi Mitra</Button>
              </motion.div>
            )}

            {activeTab === 'notifikasi' && <div className="flex flex-col items-center justify-center py-24 text-gray-300 font-black uppercase italic tracking-widest text-[11px] gap-2 opacity-30"><Bell size={32} /> No Notifications</div>}
            {activeTab === 'bantuan' && <div className="flex flex-col items-center justify-center py-24 text-gray-300 font-black uppercase italic tracking-widest text-[11px] gap-2 opacity-30"><HelpCircle size={32} /> Help Center</div>}

          </AnimatePresence>
        </div>

        {/* --- MENU PENGATURAN --- */}
        <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black italic uppercase mb-6 px-2 tracking-tighter underline decoration-4 underline-offset-8 decoration-gray-50">Pengaturan</h2>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
              { id: 'profil', label: 'Profil & KYC', icon: User },
              { id: 'keamanan', label: 'Keamanan', icon: ShieldCheck },
              { id: 'bantuan', label: 'Bantuan', icon: HelpCircle },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between p-5 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-black text-white shadow-xl translate-x-1' : 'text-gray-400 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-4"><item.icon size={19} /><span className="text-sm uppercase italic tracking-tighter">{item.label}</span></div>
                <ChevronRight size={18} className={activeTab === item.id ? 'text-white' : 'text-gray-200'} />
              </button>
            ))}
            <div className="pt-4 mt-2 border-t border-gray-50">
              <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 text-red-500 font-bold hover:bg-red-50 rounded-2xl active:scale-95 transition-all">
                <div className="flex items-center gap-4"><LogOut size={20} /><span className="text-sm uppercase italic font-black">Logout Akun</span></div>
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
