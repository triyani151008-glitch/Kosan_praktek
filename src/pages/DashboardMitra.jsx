import React, { useEffect, useState } from 'react';
import { 
  Wallet, DoorOpen, Plus, Camera, Loader2, ChevronLeft, 
  X, Key, Clock, Settings2, Trash2, Image as ImageIcon 
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
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [roomForm, setRoomForm] = useState({ number: '', ttlock: '' });
  const [payoutForm, setPayoutForm] = useState({ amount: '', bank: '', accNo: '', name: '' });

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const { data: prop } = await supabase.from('properties').select('*').eq('owner_id', user.id).single();
      if (prop) {
        setProperty(prop);
        const { data: rm } = await supabase.from('rooms').select('*').eq('property_id', prop.id).order('room_number');
        setRooms(rm || []);
      }
      const { data: wal } = await supabase.from('wallets').select('balance').eq('owner_id', user.id).single();
      if (wal) setWallet(wal);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // --- LOGIKA UNGGAH FOTO FASILITAS ---
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setActionLoading(true);
    try {
      const filePath = `rooms/${selectedRoom.id}/${Date.now()}`;
      await supabase.storage.from('property-images').upload(filePath, file);
      const { data: url } = supabase.storage.from('property-images').getPublicUrl(filePath);
      
      const updatedPhotos = [...(selectedRoom.room_photos || []), url.publicUrl];
      setSelectedRoom({ ...selectedRoom, room_photos: updatedPhotos });
      toast({ title: "Foto Terlampir", description: "Klik Simpan untuk memperbarui." });
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setActionLoading(false); }
  };

  const handleUpdateRoom = async () => {
    setActionLoading(true);
    try {
      await supabase.from('rooms').update({
        ttlock_id: selectedRoom.ttlock_id,
        pricing_plan: selectedRoom.pricing_plan,
        room_photos: selectedRoom.room_photos
      }).eq('id', selectedRoom.id);
      toast({ title: "Berhasil!", description: "Data pintu disimpan." });
      setSelectedRoom(null);
      fetchData();
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (selectedRoom) return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <div className="bg-white border-b sticky top-0 z-50 px-6 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-gray-50 rounded-xl"><ChevronLeft size={24} /></button>
          <h1 className="text-lg font-black uppercase italic tracking-tighter">Kelola Pintu {selectedRoom.room_number}</h1>
        </div>
        <Button onClick={handleUpdateRoom} disabled={actionLoading} className="bg-black text-white rounded-xl h-10 px-6 font-black uppercase italic">
          {actionLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Simpan'}
        </Button>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-6">
        {/* Galeri Foto */}
        <div className="bg-white rounded-[40px] p-8 border shadow-sm space-y-4">
          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">Fasilitas Kamar</Label>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {selectedRoom.room_photos?.map((url, i) => (
              <div key={i} className="relative shrink-0">
                <img src={url} className="w-24 h-24 rounded-2xl object-cover border grayscale hover:grayscale-0 transition-all" />
                <button onClick={() => setSelectedRoom({...selectedRoom, room_photos: selectedRoom.room_photos.filter((_, idx) => idx !== i)})} className="absolute -top-1 -right-1 bg-black text-white p-1 rounded-lg"><X size={10} /></button>
              </div>
            ))}
            <label className="w-24 h-24 shrink-0 rounded-2xl bg-gray-50 border-2 border-dashed flex flex-col items-center justify-center text-gray-300 hover:border-black cursor-pointer transition-all">
              {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <><Camera size={24} /><span className="text-[8px] font-black uppercase mt-1">Tambah</span></>}
              <input type="file" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>
        
        {/* Pricing Matrix per Kamar tetap sama seperti kode sebelumnya */}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <div className="bg-black text-white p-10 rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex justify-between items-center relative z-10">
          <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">Total Saldo</p><h2 className="text-4xl font-black italic">Rp {wallet.balance.toLocaleString()}</h2></div>
          <Button onClick={() => setShowPayout(true)} className="rounded-2xl bg-white text-black h-12 px-8 font-black uppercase text-[10px] tracking-widest">Tarik Dana</Button>
        </div>
        <Wallet className="absolute -bottom-10 -right-10 text-white/5" size={220} />
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-6">
        <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2"><DoorOpen size={18} /> Daftar Kamar</h3>
            <Button onClick={() => setShowAddRoom(true)} variant="outline" className="h-10 rounded-xl border-black/10 text-[10px] font-black uppercase italic"><Plus size={16} className="mr-2" /> Tambah Pintu</Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {rooms.map((room) => (
            <button key={room.id} onClick={() => setSelectedRoom(room)} className="bg-white rounded-[32px] p-7 border shadow-sm hover:border-black transition-all text-left group">
              <div className="flex justify-between items-center">
                <div><h5 className="text-xl font-black italic uppercase leading-none">PINTU {room.room_number}</h5><p className="text-[10px] font-bold text-gray-400 mt-2 uppercase flex items-center gap-1"><Key size={12} className="text-black" /> TTLock ID: {room.ttlock_id || '-'}</p></div>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all"><Settings2 size={20} /></div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Modal Payout & Add Room tetap sama seperti kode sebelumnya */}
    </div>
  );
};

export default DashboardMitra;
