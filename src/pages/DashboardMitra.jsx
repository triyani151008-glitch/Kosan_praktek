import React, { useEffect, useState } from 'react';
import { 
  Home, Users, Wallet, settings, 
  PlusCircle, ChevronLeft, Loader2, 
  MapPin, Bed, ArrowUpRight, TrendingUp,
  Image as ImageIcon, MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';

const DashboardMitra = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        if (!user) return;
        // Mengambil data mitra dari tabel profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, property_photo_url, is_mitra')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProperty(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyData();
  }, [user]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-black" /></div>;

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-20">
      
      {/* --- HEADER NAVIGASI --- */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 py-4">
        <div className="container mx-auto max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/profile')} className="p-2 hover:bg-gray-50 rounded-xl transition-all active:scale-90">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-black uppercase italic tracking-tighter">Dashboard Pemilik</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-black italic text-xs shadow-lg">
            {property?.first_name?.[0].toUpperCase() || 'M'}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-6">
        
        {/* --- RINGKASAN PROPERTI --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm overflow-hidden relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nama Properti Anda</p>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{property?.first_name || 'Kosan Anda'}</h2>
            </div>
            <button className="p-2 text-gray-300 hover:text-black"><MoreVertical size={20} /></button>
          </div>

          {/* Menampilkan Foto Properti yang diunggah */}
          <div className="w-full h-48 rounded-[32px] overflow-hidden bg-gray-100 mb-6 group relative">
            {property?.property_photo_url ? (
              <img src={property.property_photo_url} alt="Properti" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 italic">
                <ImageIcon size={40} strokeWidth={1} />
                <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">Belum Ada Foto</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Kamar</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-black italic">0</span>
                <Bed size={16} className="text-gray-300 mb-1" />
              </div>
            </div>
            <div className="p-4 bg-black text-white rounded-3xl shadow-xl shadow-gray-200">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Penghuni Aktif</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-black italic">0</span>
                <Users size={16} className="text-gray-500 mb-1" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- MENU MANAJEMEN --- */}
        <div className="grid grid-cols-1 gap-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4 mb-1 italic">Kelola Bisnis</h3>
          
          <button className="w-full flex items-center justify-between p-6 bg-white rounded-[28px] border border-gray-100 hover:border-black transition-all group active:scale-95 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <PlusCircle size={20} />
              </div>
              <div className="text-left">
                <span className="block text-sm font-black uppercase italic tracking-tighter leading-none">Tambah Kamar Baru</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Input Unit Properti Anda</span>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-gray-200 group-hover:text-black" />
          </button>

          <button className="w-full flex items-center justify-between p-6 bg-white rounded-[28px] border border-gray-100 hover:border-black transition-all group active:scale-95 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <Wallet size={20} />
              </div>
              <div className="text-left">
                <span className="block text-sm font-black uppercase italic tracking-tighter leading-none">Laporan Keuangan</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Pantau Pendapatan Bulanan</span>
              </div>
            </div>
            <TrendingUp size={18} className="text-gray-200 group-hover:text-black" />
          </button>
        </div>

        {/* --- TICKET/PESANAN TERBARU (PLACEHOLDER) --- */}
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm text-center py-20 opacity-50">
           <Home size={32} className="mx-auto text-gray-100 mb-4" />
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Belum Ada Pesanan Kamar Masuk</p>
        </div>

      </div>
    </div>
  );
};

export default DashboardMitra;
