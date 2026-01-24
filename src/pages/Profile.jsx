import React, { useEffect, useState } from 'react';
import { 
  User, Phone, Mail, Edit3, Loader2, LogOut, 
  Camera, CheckCircle2, ChevronRight, Settings2, 
  ShieldCheck, Bell, CreditCard, Trash2 
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

        if (isMounted && data) {
          setProfile({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || user.phone || '', 
            email: data.email || user.email || '',
            avatar_url: data.avatar_url || ''
          });
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
      toast({ title: "Berhasil", description: "Profil diperbarui." });
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
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black pb-20 pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-gray-300" />
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-black text-white p-1.5 rounded-lg cursor-pointer hover:scale-110 transition-transform">
                <Camera size={16} />
                <input id="avatar-upload" type="file" className="hidden" />
              </label>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">{profile.first_name || 'Pengguna'} {profile.last_name}</h1>
              <p className="text-gray-400 text-sm">{profile.email}</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl border-gray-200 font-semibold" onClick={handleLogout}>
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>

        {/* --- LAYOUT GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* SIDEBAR NAVIGATION (Visual Only) */}
          <div className="hidden md:block space-y-2">
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 text-black font-bold rounded-xl transition-all">
                <User size={18} /> Profil
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-black transition-all">
                <ShieldCheck size={18} /> Keamanan
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-black transition-all">
                <Bell size={18} /> Notifikasi
              </button>
            </nav>
          </div>

          {/* MAIN FORM AREA */}
          <div className="md:col-span-3">
            <section className="space-y-8">
              <div>
                <h3 className="text-lg font-bold mb-1">Informasi Pribadi</h3>
                <p className="text-sm text-gray-400">Kelola informasi publik dan data kontak Anda.</p>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Nama Depan</Label>
                    <Input 
                      value={profile.first_name} 
                      onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                      className="h-12 rounded-xl border-gray-200 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Nama Belakang</Label>
                    <Input 
                      value={profile.last_name} 
                      onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                      className="h-12 rounded-xl border-gray-200 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Nomor Telepon</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <Input 
                      value={profile.phone} 
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="h-12 pl-12 rounded-xl border-gray-200 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={updating}
                    className="bg-black text-white hover:bg-gray-800 h-12 px-8 rounded-xl font-bold transition-all shadow-md"
                  >
                    {updating ? <Loader2 className="animate-spin mr-2" /> : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>

              {/* DANGER SECTION */}
              <div className="pt-10 mt-10 border-t border-gray-100">
                <h3 className="text-lg font-bold text-red-600 mb-1">Zona Bahaya</h3>
                <p className="text-sm text-gray-400 mb-4">Aksi ini tidak dapat dibatalkan setelah dikonfirmasi.</p>
                <Button variant="outline" className="border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl">
                  <Trash2 size={18} className="mr-2" /> Hapus Akun
                </Button>
              </div>
            </section>
          </div>

        </div>

        <footer className="mt-20 pt-8 border-t border-gray-50 text-center">
          <p className="text-gray-300 text-[11px] font-bold tracking-[0.2em] uppercase">
            Kosan App Dashboard • v1.0
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Profile;
