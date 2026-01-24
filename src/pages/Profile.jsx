
import React, { useEffect, useState } from 'react';
import { 
  User, Phone, Mail, Edit3, Loader2, LogOut, 
  Camera, CheckCircle2, ChevronRight, Settings2, 
  MapPin, Calendar, Info, Share2
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
    phone: '',
    email: '',
    avatar_url: ''
  });

  useEffect(() => {
    let isMounted = true;
    const getProfile = async () => {
      try {
        if (!user) return;
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (isMounted) {
          if (data) {
            setProfile({
              first_name: data.first_name || '',
              last_name: data.last_name || '',
              phone: data.phone || user.phone || '', 
              email: data.email || user.email || '',
              avatar_url: data.avatar_url || ''
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
      toast({ variant: "destructive", title: "Gagal Upload", description: "Terjadi kesalahan saat mengunggah foto." });
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
        phone: profile.phone,
        updated_at: new Date(),
      });

      if (error) throw error;
      toast({ title: "Disimpan", description: "Profil berhasil diperbarui." });
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
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <Loader2 className="animate-spin text-black mb-4" size={40} />
        <p className="text-black font-medium animate-pulse">Memuat Profil...</p>
      </div>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim() || "User Baru";
  const initial = fullName[0].toUpperCase();

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* --- BANNER / COVER PHOTO --- */}
      <div className="relative h-48 md:h-80 bg-black overflow-hidden">
         {/* Motif B&W Minimalis sebagai pengganti foto cover */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute bottom-4 right-4">
          <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-black font-bold rounded-lg gap-2 shadow-lg">
            <Camera size={16} /> Edit Sampul
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        {/* --- PROFILE INFO SECTION --- */}
        <div className="relative -mt-12 md:-mt-16 flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-gray-200">
          <div className="relative">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white bg-black overflow-hidden shadow-xl flex items-center justify-center">
              {uploadingImage ? (
                <Loader2 className="animate-spin text-white" size={32} />
              ) : profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-6xl font-bold">{initial}</span>
              )}
            </div>
            <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 bg-gray-200 p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-black hover:text-white transition-all">
              <Camera size={20} />
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left mb-4">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-3xl md:text-4xl font-black text-black">{fullName}</h1>
              <CheckCircle2 className="text-black fill-white" size={24} />
            </div>
            <p className="text-gray-500 font-medium mt-1">Sobat Kosan • Bergabung 2026</p>
          </div>

          <div className="flex gap-2 mb-4">
            <Button className="bg-black text-white hover:bg-gray-800 rounded-lg px-6 font-bold">Tambahkan Cerita</Button>
            <Button variant="secondary" className="bg-gray-200 text-black hover:bg-gray-300 rounded-lg"><Edit3 size={18} /></Button>
          </div>
        </div>

        {/* --- MAIN CONTENT: FB LAYOUT (Left Sidebar & Right Timeline) --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          
          {/* LEFT SIDE: INTRO & INFO */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-black text-black mb-4">Intro</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin size={20} className="text-gray-400" />
                  <p className="text-sm font-medium">Tinggal di **Bandung, Indonesia**</p>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail size={20} className="text-gray-400" />
                  <p className="text-sm font-medium">{profile.email}</p>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone size={20} className="text-gray-400" />
                  <p className="text-sm font-medium">{profile.phone || 'Belum ada nomor'}</p>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar size={20} className="text-gray-400" />
                  <p className="text-sm font-medium">Terakhir update: Jan 2026</p>
                </div>
                <Button variant="secondary" className="w-full bg-gray-100 font-bold mt-2">Edit Detail</Button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: SETTINGS FORM */}
          <div className="md:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <Settings2 size={22} className="text-black" />
                <h3 className="text-xl font-black text-black">Pengaturan Akun</h3>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-gray-400">Nama Depan</Label>
                    <Input 
                      value={profile.first_name} 
                      onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                      className="rounded-lg border-gray-200 focus:border-black focus:ring-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-gray-400">Nama Belakang</Label>
                    <Input 
                      value={profile.last_name} 
                      onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                      className="rounded-lg border-gray-200 focus:border-black focus:ring-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-400">Nomor Telepon</Label>
                  <Input 
                    value={profile.phone} 
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="rounded-lg border-gray-200"
                    placeholder="Contoh: 0812..."
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={updating} 
                  className="w-full bg-black text-white hover:bg-gray-800 font-bold h-12 rounded-lg transition-all"
                >
                  {updating ? <Loader2 className="animate-spin mr-2" /> : 'Simpan Perubahan'}
                </Button>

                <div className="pt-4 border-t border-gray-100 mt-4">
                  <button 
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-4 rounded-lg text-red-600 hover:bg-red-50 transition-all font-bold group"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={20} />
                      <span>Keluar dari Akun</span>
                    </div>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
