import React, { useEffect, useState } from 'react';
import { 
  Wallet, DoorOpen, Plus, Camera, Loader2, 
  Settings2, LayoutGrid, List, CheckCircle2, 
  Clock, Calendar, Key, Image as ImageIcon 
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const DashboardMitra = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // State Data
  const [wallet, setWallet] = useState({ balance: 0 });
  const [rooms, setRooms] = useState([]);
  const [property, setProperty] = useState(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // 1. Ambil Properti & Kamar
      const { data: prop } = await supabase.from('properties').select('id, name').eq('owner_id', user.id).single();
      if (prop) {
        setProperty(prop);
        const { data: rm } = await supabase.from('rooms').select('*').eq('property_id', prop.id);
        setRooms(rm || []);
      }
      
      // 2. Ambil Saldo Wallet
      const { data: wal } = await supabase.from('wallets').select('balance').eq('owner_id', user.id).single();
      if (wal) setWallet(wal);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-20">
      {/* --- SECTION 1: KEUANGAN (WALLET) --- */}
      <div className="bg-black p-8 text-white rounded-b-[40px] shadow-2xl">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 italic">Total Saldo Aktif</p>
            <h2 className="text-3xl font-black italic tracking-tighter">Rp {wallet.balance.toLocaleString()}</h2>
          </div>
          <Button variant="outline" className="rounded-xl border-white/20 bg-white/10 hover:bg-white hover:text-black text-[10px] font-black uppercase tracking-widest italic h-10 px-6">Tarik Dana</Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8 space-y-8">
        
        {/* --- SECTION 2: DAFTAR KAMAR & IOT (TTLOCK) --- */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2"><DoorOpen size={18} /> Kelola Pintu (Rooms)</h3>
            <Button className="h-8 rounded-lg bg-gray-100 text-black text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"><Plus size={14} className="mr-1" /> Tambah Kamar</Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm group hover:border-black transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-xl font-black italic uppercase leading-none">Kamar {room.room_number}</h4>
                    <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest flex items-center gap-1">
                      <Key size={10} /> TTLock ID: {room.ttlock_id || 'Belum Terhubung'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest italic ${room.status === 'available' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {room.status}
                  </div>
                </div>

                {/* Foto Fasilitas Kamar */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                  {room.room_photos.length > 0 ? room.room_photos.map((url, i) => (
                    <img key={i} src={url} className="w-20 h-20 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" alt="Fasilitas" />
                  )) : (
                    <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200 border-2 border-dashed border-gray-100"><ImageIcon size={20} /></div>
                  )}
                  <label className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 cursor-pointer hover:bg-black hover:text-white transition-all"><Camera size={20} /><input type="file" className="hidden" /></label>
                </div>

                {/* --- SECTION 3: TARIF PER KAMAR --- */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-6 border-t border-gray-50">
                  <div className="text-center">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Per Jam</p>
                    <p className="text-[10px] font-black italic">Rp {room.pricing_plan.hourly.prices["1"].toLocaleString()}</p>
                  </div>
                  <div className="text-center border-x border-gray-50">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Harian</p>
                    <p className="text-[10px] font-black italic">Rp {room.pricing_plan.daily.price.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bulanan</p>
                    <p className="text-[10px] font-black italic">Rp {room.pricing_plan.monthly.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardMitra;
