import React, { useEffect, useState } from 'react';
import { 
  Wallet, DoorOpen, Plus, Camera, Loader2, 
  ChevronLeft, Trash2, Check, X,
  Key, Image as ImageIcon, Smartphone, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

const DashboardMitra = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data State
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // 1. Ambil Properti Utama
      const { data: propData } = await supabase.from('properties').select('*').eq('owner_id', user.id).single();
      if (propData) setProperty(propData);

      // 2. Ambil Daftar Kamar (Multi-Pintu)
      const { data: roomsData } = await supabase.from('rooms').select('*').eq('property_id', propData?.id);
      setRooms(roomsData || []);

      // 3. Ambil Saldo Wallet
      const { data: walData } = await supabase.from('wallets').select('balance').eq('owner_id', user.id).single();
      if (walData) setWallet(walData);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // --- LOGIKA UNGGAH FOTO FASILITAS KAMAR ---
  const handleRoomPhotoUpload = async (roomId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSaving(true);
    try {
      const filePath = `room-facilities/${roomId}/${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('property-images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(filePath);
      const newUrl = urlData.publicUrl;

      // Update Array Foto di Database
      const currentRoom = rooms.find(r => r.id === roomId);
      const updatedPhotos = [...(currentRoom.room_photos || []), newUrl];

      await supabase.from('rooms').update({ room_photos: updatedPhotos }).eq('id', roomId);
      
      fetchData(); // Refresh data
      toast({ title: "Foto Berhasil!", description: "Fasilitas kamar telah ditambahkan." });
    } catch (error) { toast({ variant: "destructive", description: "Gagal unggah foto." }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-24">
      {/* HEADER KEUANGAN (Wallet System) */}
      <div className="bg-black text-white p-8 rounded-b-[40px] shadow-2xl">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div onClick={() => navigate('/profile')} className="cursor-pointer">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 italic">Saldo Dompet Aktif</p>
            <h2 className="text-3xl font-black italic tracking-tighter">Rp {wallet.balance.toLocaleString()}</h2>
          </div>
          <Button className="rounded-xl border-white/20 bg-white/10 hover:bg-white hover:text-black text-[9px] font-black uppercase tracking-widest italic h-10 px-6">Payout</Button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-8">
        
        {/* INFO OPERASIONAL LOKASI */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"><Info size={20} /></div>
                <div>
                    <h4 className="text-xs font-black uppercase italic tracking-tight">{property?.name}</h4>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Penjaga: {property?.guard_phone || '-'}</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl"><Settings2 size={20} /></Button>
        </div>

        {/* --- DAFTAR KAMAR (MULTI-PINTU TTLOCK) --- */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2"><DoorOpen size={18} /> Kelola Pintu Kamar</h3>
            <Button variant="outline" className="h-8 rounded-lg text-[9px] font-black uppercase italic border-black/10"><Plus size={14} className="mr-1" /> Tambah Pintu</Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h5 className="text-xl font-black italic uppercase leading-none">Kamar {room.room_number}</h5>
                    <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest flex items-center gap-1">
                      <Key size={10} className="text-black" /> TTLock ID: {room.ttlock_id || 'Not Set'}
                    </p>
                  </div>
                  <div className="bg-gray-50 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest italic border border-gray-100">
                    {room.status}
                  </div>
                </div>

                {/* --- MENU FOTO FASILITAS (Multi-Photo) --- */}
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-3 italic">Galeri Fasilitas Kamar</p>
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                  {room.room_photos?.map((url, i) => (
                    <div key={i} className="relative shrink-0">
                        <img src={url} className="w-24 h-24 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500 border border-gray-100" />
                        <button className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-lg shadow-lg"><X size={10} /></button>
                    </div>
                  ))}
                  
                  {/* Tombol Unggah Baru */}
                  <label className="w-24 h-24 shrink-0 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 hover:border-black hover:text-black transition-all cursor-pointer">
                    {saving ? <Loader2 className="animate-spin" size={16} /> : <><Camera size={20} /><span className="text-[8px] font-black uppercase mt-1">Add Photo</span></>}
                    <input type="file" className="hidden" onChange={(e) => handleRoomPhotoUpload(room.id, e)} disabled={saving} />
                  </label>
                </div>

                {/* TARIF PER KAMAR */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-6 border-t border-gray-50">
                    <div className="text-center">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Transit (Jam)</p>
                        <p className="text-[10px] font-black italic">Aktif</p>
                    </div>
                    <div className="text-center border-x border-gray-50">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Harian</p>
                        <p className="text-[10px] font-black italic">Aktif</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Bulanan</p>
                        <p className="text-[10px] font-black italic">Nonaktif</p>
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
