 import React, { useEffect, useState } from 'react';
import { 
  User, Phone, Mail, Edit3, Loader2, LogOut, 
  Camera, CheckCircle2, ChevronRight, ShieldCheck, 
  Bell, HelpCircle, Upload, Lock, KeyRound, 
  MessageSquare, Info, Smartphone, Eye, EyeOff,
  ChevronDown, Search
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
  
  // --- FITUR NEGARA BARU ---
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const countries = [
    { name: 'Indonesia', code: '+62', flag: 'id' },
    { name: 'Malaysia', code: '+60', flag: 'my' },
    { name: 'Singapore', code: '+65', flag: 'sg' },
    { name: 'Thailand', code: '+66', flag: 'th' },
    { name: 'Philippines', code: '+63', flag: 'ph' },
  ];
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

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

  // Fungsi lainnya (handleUpdateName, handleRequestOTP, handleAvatarUpload) tetap sama seperti sebelumnya...

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
                      <Input placeholder="...." value={securityData.first_name} className="h-12 rounded-xl border-gray-100 bg-white font-medium" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Nama Belakang</Label>
                      <Input placeholder="...." value={securityData.last_name} className="h-12 rounded-xl border-gray-100 bg-white font-medium" />
                    </div>
                  </div>
                  <Button className="w-full bg-black text-white rounded-xl h-12 font-bold uppercase text-[11px] tracking-widest shadow-lg active:scale-95 transition-all">Update Nama</Button>
                </div>

                {/* 2. SEKSI PONSEL (DENGAN DROPDOWN NEGARA) */}
                <div className="space-y-4 pt-4 border-t border-gray-50 relative">
                  <Label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Nomor Ponsel</Label>
                  <div className="flex gap-2 items-center">
                    
                    {/* Pemilih Kode Negara Interaktif */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowCountryPicker(!showCountryPicker)}
                        className="flex items-center gap-2 px-3 h-12 rounded-xl border border-gray-100 bg-white shadow-sm min-w-[105px] justify-center hover:bg-gray-50 transition-all active:scale-95"
                      >
                        <img src={`https://flagcdn.com/w40/${selectedCountry.flag}.png`} alt={selectedCountry.name} className="w-5 h-3 object-cover rounded-sm" />
                        <span className="text-[13px] font-bold text-black">{selectedCountry.code}</span>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${showCountryPicker ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu Negara */}
                      <AnimatePresence>
                        {showCountryPicker && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 5 }} 
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 w-[200px] bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-2 space-y-1 overflow-hidden"
                          >
                            {countries.map((c) => (
                              <button 
                                key={c.flag} 
                                onClick={() => { setSelectedCountry(c); setShowCountryPicker(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                              >
                                <img src={`https://flagcdn.com/w40/${c.flag}.png`} alt={c.name} className="w-5 h-3 object-cover rounded-sm shadow-sm" />
                                <span className="text-xs font-bold text-gray-500 group-hover:text-black">{c.name} ({c.code})</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Input Nomor */}
                    <div className="relative flex-1">
                      <Input value={securityData.phone} onChange={(e) => setSecurityData({...securityData, phone: e.target.value})} className="h-12 rounded-xl border-gray-100 bg-white font-bold" placeholder="81..." />
                    </div>
                  </div>
                  <Button className="w-full bg-white text-black border border-gray-100 rounded-xl h-11 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">Kirim Kode Verifikasi (OTP)</Button>
                </div>

                {/* 3. SEKSI PASSWORD (TETAP SAMA) */}
                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <Label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Ubah Kata Sandi</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                    <Input type={showOldPass ? "text" : "password"} placeholder="Kata Sandi Lama" className="h-12 pl-12 pr-12 rounded-xl border-gray-100 bg-white font-medium" />
                    <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-4 top-3.5 text-gray-300 hover:text-black">
                      {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Kolom password lainnya... */}
                  <Button className="w-full bg-black text-white rounded-xl h-14 font-black text-[11px] tracking-[0.2em] uppercase mt-4 shadow-xl active:scale-95 transition-all">Ganti Kata Sandi</Button>
                </div>
              </motion.div>
            )}

            {/* TAB PLACEHOLDER... */}

          </AnimatePresence>
        </div>

        {/* --- MENU PENGATURAN (BAWAH) --- */}
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
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
