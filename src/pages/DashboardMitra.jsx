import React, { useEffect, useState } from 'react';
import { 
  Wallet, DoorOpen, Plus, Camera, Loader2, ChevronLeft, 
  X, Key, Clock, Calendar, Check, Image as ImageIcon, Settings2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const DashboardMitra = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null); // State untuk menu kelola per pintu
  
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const { data: prop } = await supabase.from('properties').select('*').eq('owner_id', user.id).single();
      if (prop) {
        setProperty(prop);
        const { data: rm } = await supabase.from('rooms').select('*').eq('property_id', prop.id);
        setRooms(rm || []);
      }
      const { data: wal } = await supabase.from('wallets').select('balance').eq('owner_id', user.id).single();
      if (wal) setWallet(wal);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // --- LOGIKA KELOLA KAMAR ---
  const handleUpdateRoom = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('rooms').update({
        pricing_plan: selectedRoom.pricing_plan,
        ttlock_id: selectedRoom.ttlock_id,
        room_photos: selectedRoom.room_photos
      }).eq('id', selectedRoom.id);

      if (error) throw error;
      toast({ title: "Berhasil!", description: `Pengaturan Pintu ${selectedRoom.room_number} disimpan.` });
      setSelectedRoom(null); // Kembali ke daftar pintu
      fetchData();
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;

  // --- TAMPILAN 1: MENU KELOLA TIAP PINTU (DETAIL) ---
  if (selectedRoom) return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-24">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 px-6 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ChevronLeft size={24} /></button>
          <h1 className="text-lg font-black uppercase italic tracking-tighter">Kelola Pintu {selectedRoom.room_number}</h1>
        </div>
        <Button onClick={handleUpdateRoom} disabled={saving} className="bg-black text-white h-10 px-6 rounded-xl font-black text-[10px] tracking-widest uppercase italic">
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Simpan'}
        </Button>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-8">
        {/* Input TTLock ID */}
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Koneksi IoT Pintu</p>
          <div className="relative">
            <Key className="absolute left-4 top-3.5 text-gray-300" size={18} />
            <Input 
                placeholder="Masukkan TTLock ID (Contoh: 26267984)" 
                className="h-12 pl-12 rounded-xl border-gray-100 bg-gray-50 font-mono"
                value={selectedRoom.ttlock_id || ''}
                onChange={(e) => setSelectedRoom({...selectedRoom, ttlock_id: e.target.value})}
            />
          </div>
        </div>

        {/* Foto Fasilitas */}
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Foto Fasilitas Dalam Kamar</p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {selectedRoom.room_photos?.map((url, i) => (
                    <img key={i} src={url} className="w-24 h-24 rounded-2xl object-cover border border-gray-100" />
                ))}
                <label className="w-24 h-24 shrink-0 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 cursor-pointer hover:border-black transition-all">
                    <Camera size={24} /><span className="text-[8px] font-black uppercase mt-1">Add Photo</span>
                    <input type="file" className="hidden" />
                </label>
            </div>
        </div>
      </div>
    </div>
  );

  // --- TAMPILAN 2: DAFTAR PINTU UTAMA (LIST) ---
  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-24">
      {/* Saldo Dompet */}
      <div className="bg-black text-white p-10 rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 italic">Saldo Dompet Mitra</p>
            <h2 className="text-4xl font-black italic tracking-tighter">Rp {wallet.balance.toLocaleString()}</h2>
          </div>
          <Button className="rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest italic h-12 px-8">Tarik Dana</Button>
        </div>
        <Wallet className="absolute -bottom-10 -right-10 text-white/5" size={200} />
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-4">
        <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2"><DoorOpen size={18} /> Kelola Pintu (Rooms)</h3>
            <Button variant="outline" className="h-10 rounded-xl border-black/10 text-[10px] font-black uppercase italic"><Plus size={16} className="mr-2" /> Tambah Kamar</Button>
        </div>

        {/* List Kamar Berdasarkan Video User */}
        <div className="grid grid-cols-1 gap-4">
          {rooms.map((room) => (
            <button 
                key={room.id} 
                onClick={() => setSelectedRoom(room)} // MASUK KE MENU KELOLA SAAT DIKLIK
                className="bg-white rounded-[32px] p-7 border border-gray-100 shadow-sm hover:border-black transition-all text-left group active:scale-95"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="text-xl font-black italic uppercase tracking-tight leading-none">PINTU {room.room_number}</h5>
                  <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest flex items-center gap-1">
                    <Key size={12} className="text-black" /> TTLock ID: <span className="text-black">{room.ttlock_id || 'Belum Diatur'}</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all">
                    <Settings2 size={20} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardMitra;
