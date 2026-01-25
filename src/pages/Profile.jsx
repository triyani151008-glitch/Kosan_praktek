import React, { useEffect, useState } from 'react';
import { 
  User, Phone, Mail, Edit3, Loader2, LogOut, 
  Camera, CheckCircle2, ChevronRight, Settings2, 
  ShieldCheck, Bell, HelpCircle, Upload, Star,
  Lock, KeyRound, MessageSquare, Info
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
  
  const [activeTab, setActiveTab] = useState('profil'); // Menu aktif
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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

  const handleLogout = async () => { await signOut(); navigate('/'); };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-white text-black pb-20 pt-24">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* --- SIDEBAR MENU --- */}
          <div className="md:col-span-3 space-y-2">
            <div className="mb-8 px-4">
              <h2 className="text-2xl font-black tracking-tighter">PENGATURAN</h2>
            </div>
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
                    activeTab === item.id ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <item.icon size={20} /> {item.label}
                </button>
              ))}
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 mt-10 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all"
              >
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
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 items-start">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Info size={20} /></div>
                      <div>
                        <p className="font-bold text-sm">Selamat Datang!</p>
                        <p className="text-xs text-gray-500">Profil Anda berhasil dibuat. Lengkapi KYC untuk mulai bertransaksi.</p>
                      </div>
                    </div>
                    <p className="text-center text-gray-400 py-10 text-sm italic">Belum ada notifikasi lainnya.</p>
                  </div>
                </motion.div>
              )}

              {/* 2. PROFIL & KYC */}
              {activeTab === 'profil' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-10">
                  {/* Data Diri */}
                  <div>
                    <h3 className="text-xl font-black mb-6">Data Diri</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-400 uppercase">Nama Lengkap</Label>
                        <Input value={`${profile.first_name} ${profile.last_name}`} readOnly className="rounded-xl bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-400 uppercase">Email</Label>
                        <Input value={profile.email} readOnly className="rounded-xl bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* Standard KYC */}
                  <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-200">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Upload size={18} /> Verifikasi Identitas (KYC)
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">Unggah foto KTP asli Anda untuk keamanan akun.</p>
                    <div className="h-32 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all">
                      <Camera className="text-gray-300 mb-2" />
                      <span className="text-xs font-bold text-gray-400">Klik untuk ambil foto KTP</span>
                    </div>
                  </div>

                  {/* Mitra Section */}
                  <div className="bg-black text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-lg">Jadilah Mitra Kosan</h4>
                      <p className="text-gray-400 text-sm">Punya properti? Daftarkan sekarang dan dapatkan penghasilan.</p>
                    </div>
                    <Button className="bg-white text-black hover:bg-gray-200 font-bold px-8 rounded-xl shadow-xl">Daftar Mitra</Button>
                  </div>
                </motion.div>
              )}

              {/* 3. KEAMANAN */}
              {activeTab === 'keamanan' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                  <h3 className="text-xl font-black mb-6">Keamanan Akun</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <KeyRound className="text-gray-400" />
                        <div>
                          <p className="text-sm font-bold">Ganti Kata Sandi</p>
                          <p className="text-xs text-gray-500">Terakhir diganti 3 bulan lalu</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-lg">Ubah</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <Lock className="text-gray-400" />
                        <div>
                          <p className="text-sm font-bold">Autentikasi Dua Faktor</p>
                          <p className="text-xs text-red-400 italic">Belum diaktifkan</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-lg">Aktifkan</Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 4. BANTUAN */}
              {activeTab === 'bantuan' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h3 className="text-xl font-black mb-6">Pusat Bantuan</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all text-left group">
                      <MessageSquare className="mb-3 text-gray-400 group-hover:text-black" />
                      <p className="font-bold text-sm">Hubungi Chat CS</p>
                      <p className="text-xs text-gray-500">Respon cepat dalam 5 menit</p>
                    </button>
                    <button className="p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all text-left group">
                      <HelpCircle className="mb-3 text-gray-400 group-hover:text-black" />
                      <p className="font-bold text-sm">FAQ & Panduan</p>
                      <p className="text-xs text-gray-500">Cari jawaban secara mandiri</p>
                    </button>
                  </div>
                  <div className="pt-6">
                    <h4 className="font-bold text-sm mb-4">Informasi Aplikasi</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-gray-500"><span>Versi Aplikasi</span><span>4.2.0 (Build 2026)</span></div>
                      <div className="flex justify-between text-xs text-gray-500"><span>Syarat & Ketentuan</span><ChevronRight size={14} /></div>
                      <div className="flex justify-between text-xs text-gray-500"><span>Kebijakan Privasi</span><ChevronRight size={14} /></div>
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
