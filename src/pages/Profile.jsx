import React, { useEffect, useState } from 'react';
import { 
  User, Phone, Mail, Edit3, Loader2, LogOut, 
  Camera, CheckCircle2, ChevronRight, Settings2 
} from 'lucide-react'; 
import { motion } from 'framer-motion';
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
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '', // Diperbaiki: sesuaikan dengan nama kolom database
    email: '',
    avatar_url: ''
  });

  useEffect(() => {
    let isMounted = true;

    const getProfile = async () => {
      try {
        if (!user) return;

        // Ambil data dari tabel profiles yang baru kita buat
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Supabase fetch error:', error);
        }

        if (isMounted) {
          if (data) {
            setProfile({
              first_name: data.first_name || '',
              last_name: data.last_name || '',
              // Prioritas: Data di tabel -> Data di Auth User (backup)
              phone: data.phone || user.phone || '', 
              email: data.email || user.email || '',
              avatar_url: data.avatar_url || ''
            });
          } else {
            // Jika user belum ada di tabel profiles (kasus langka),
            // kita isi pakai data Auth User sementara
            setProfile({
              first_name: '',
              last_name: '',
              phone: user.phone || '',
              email: user.email || '',
              avatar_url: ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getProfile();

    return () => { isMounted = false; };
  }, [user]);

  const handleAvatarUpload = async (event) => {
    try {
      setUploadingImage(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      // Upload ke Storage Bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Dapatkan URL Publik
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // Simpan URL ke database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          avatar_url: publicUrl, 
          updated_at: new Date() 
        });

      if (updateError) throw updateError;

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      toast({ title: "Berhasil", description: "Foto profil telah diperbarui." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gagal Upload", description: "Pastikan bucket 'avatars' sudah dibuat di Supabase." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        // Kita juga update phone/email biar sinkron
        phone: profile.phone,
        updated_at: new Date(),
      });

      if (error) throw error;
      toast({ title: "Disimpan", description: "Profil Anda berhasil diperbarui." });
    } catch (error) {
      toast({ variant: "destructive", description: error.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <Loader2 className="animate-spin text-black mb-4" size={40} />
        <p className="text-gray-400 font-medium animate-pulse">Menyiapkan profil...</p>
      </div>
    );
  }

  const initial = profile.first_name ? profile.first_name[0].toUpperCase() : (profile.email ? profile.email[0].toUpperCase() : 'U');

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-28">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 max-w-2xl"
      >
        
        {/* --- HEADER PROFILE --- */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-black flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              {uploadingImage ? (
                <Loader2 className="animate-spin text-white" size={32} />
              ) : profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-5xl font-bold italic">{initial}</span>
              )}
            </div>
            
            <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-2xl shadow-xl border border-gray-100 cursor-pointer hover:bg-black hover:text-white transition-all active:scale-90">
              <Camera size={20} />
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingImage} />
            </label>
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 mt-6 tracking-tight text-center">
            {profile.first_name} {profile.last_name}
          </h1>
          <div className="mt-2 flex items-center gap-1.5 bg-green-50 text-green-600 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border border-green-100">
            <CheckCircle2 size={12} /> Akun Terverifikasi
          </div>
        </div>

        {/* --- SETTINGS CARD --- */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings2 size={20} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Pengaturan Akun</h3>
            </div>

            <form onSubmit={handleUpdate} className="space-y-7">
              {/* Nama Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Nama Depan</Label>
                  <Input 
                    value={profile.first_name} 
                    onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                    className="h-14 rounded-2xl bg-gray-50/50 border-none focus:ring-2 focus:ring-black transition-all px-5 text-base font-medium"
                    placeholder="Nama Depan"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Nama Belakang</Label>
                  <Input 
                    value={profile.last_name} 
                    onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                    className="h-14 rounded-2xl bg-gray-50/50 border-none focus:ring-2 focus:ring-black transition-all px-5 text-base font-medium"
                    placeholder="Nama Belakang"
                  />
                </div>
              </div>

              {/* Read Only Fields */}
              <div className="space-y-5 pt-2">
                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm"><Mail size={18} className="text-gray-400" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Email</p>
                      <p className="text-sm font-semibold text-gray-600">{profile.email || '-'}</p>
                    </div>
                  </div>
                  <CheckCircle2 size={16} className={profile.email ? "text-green-500" : "text-gray-300"} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm"><Phone size={18} className="text-gray-400" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Telepon</p>
                      <p className="text-sm font-semibold text-gray-600">{profile.phone || '-'}</p>
                    </div>
                  </div>
                  <CheckCircle2 size={16} className={profile.phone ? "text-green-500" : "text-gray-300"} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 space-y-4">
                <Button 
                  type="submit" 
                  disabled={updating} 
                  className="w-full h-14 rounded-2xl bg-black hover:bg-gray-800 text-white font-bold text-base transition-all shadow-lg shadow-gray-200"
                >
                  {updating ? <Loader2 className="animate-spin mr-2" /> : 'Simpan Perubahan'}
                </Button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-4 text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">Danger Zone</span></div>
                </div>

                {/* TOMBOL KELUAR */}
                <button 
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-5 rounded-2xl text-red-500 hover:bg-red-50 transition-all group border border-transparent hover:border-red-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-100/50 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors">
                      <LogOut size={20} />
                    </div>
                    <span className="font-bold text-base">Keluar dari Akun</span>
                  </div>
                  <ChevronRight size={18} className="text-red-200 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-300 text-[11px] font-medium tracking-widest uppercase">
          Proyek KITA v4.0 &bull; 2026
        </p>
      </motion.div>
    </div>
  );
};

export default Profile;
