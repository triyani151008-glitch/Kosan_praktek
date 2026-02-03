import React, { useEffect, useState } from 'react';
import { 
  Wallet, DoorOpen, Plus, Camera, Loader2, ChevronLeft, 
  X, Key, Clock, Calendar, Check, Settings2, Trash2
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
  const [selectedRoom, setSelectedRoom] = useState(null); // Mode Edit Per Pintu
  const [activeTab, setActiveTab] = useState('hourly'); // 'hourly' atau 'monthly'
  
  const [rooms, setRooms] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });

  // Daftar durasi sesuai permintaan Anda
  const durasiList = {
    hourly: ["1", "2", "3", "4", "5", "6", "12", "24"],
    monthly: ["1", "2", "3", "4", "5", "6", "12"]
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const { data: prop } = await supabase.from('properties').select('id').eq('owner_id', user.id).single();
      if (prop) {
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
    setSaving(true);
    try {
      const filePath = `rooms/${selectedRoom.id}/${Date.now()}`;
      await supabase.storage.from('property-images').upload(filePath, file);
      const { data: url } = supabase.storage.from('property-images').getPublicUrl(filePath);
      
      const updatedPhotos = [...(selectedRoom.room_photos || []), url.publicUrl];
      setSelectedRoom({ ...selectedRoom, room_photos: updatedPhotos });
      toast({ title: "Foto Ditambahkan", description: "Klik Simpan untuk mempermanenkan." });
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setSaving(false); }
  };

  // --- LOGIKA SIMPAN PERUBAHAN KAMAR ---
  const handleUpdateRoom = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('rooms').update({
        pricing_plan: selectedRoom.pricing_plan,
        ttlock_id: selectedRoom.ttlock_id,
        room_photos: selectedRoom.room_photos
      }).eq('id', selectedRoom.id);
      if (error) throw error;
      toast({ title: "Berhasil!", description: "Data pintu dan tarif diperbarui." });
      setSelectedRoom(null);
      fetchData();
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-black w-10 h-10" /></div>;

  // --- VIEW: DETAIL KELOLA PINTU (TARIF & FOTO) ---
  if (selectedRoom) return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24 font-sans">
      <div className="bg-white border-b sticky top-0 z-50 px-6 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ChevronLeft size={24} /></button>
          <h1 className="text-lg font-black uppercase italic tracking-tighter">Edit Pintu {selectedRoom.room_number}</h1>
        </div>
        <Button onClick={handleUpdateRoom} disabled={saving} className="bg-black text-white rounded-xl h-10 px-6 font-black uppercase italic shadow-lg active:scale-95 transition-all">
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Simpan'}
        </Button>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-6">
        {/* INPUT TTLOCK ID */}
        <div className="bg-white rounded-[40px] p-8 border shadow-sm space-y-4">
          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">Koneksi IoT Pintu (Lock ID)</Label>
          <div className="relative">
            <Key className="absolute left-4 top-3.5 text-gray-300" size={18} />
            <Input className="h-12 pl-12 rounded-xl border-gray-100 bg-gray-50 font-mono" value={selectedRoom.ttlock_id || ''} onChange={(e) => setSelectedRoom({...selectedRoom, ttlock_id: e.target.value})} placeholder="Masukkan Lock ID" />
          </div>
        </div>

        {/* --- PENGATURAN TARIF DURASI LENGKAP --- */}
        <div className="bg-white rounded-[40px] p-8 border shadow-sm space-y-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2"><Clock size={18} /> Atur Durasi & Tarif</h3>
            <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
               <button onClick={() => setActiveTab('hourly')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'hourly' ? 'bg-black text-white shadow-md' : 'text-gray-400'}`}>Transit (Jam)</button>
               <button onClick={() => setActiveTab('monthly')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'monthly' ? 'bg-black text-white shadow-md' : 'text-gray-400'}`}>Bulanan</button>
            </div>
          </div>

          <div className="space-y-3">
            {durasiList[activeTab].map((unit) => {
              const currentData = selectedRoom.pricing_plan[activeTab]?.[unit] || { active: false, price: 0 };
              return (
                <div key={unit} className={`flex items-center justify-between p-5 rounded-[24px] border transition-all ${currentData.active ? 'bg-white border-black/10 shadow-sm' : 'bg-gray-50 border-transparent opacity-40 grayscale'}`}>
                  <span className="text-[11px] font-black uppercase italic tracking-tight">{unit} {activeTab === 'hourly' ? 'Jam' : 'Bulan'}</span>
                  <div className="flex items-center gap-2">
                    {currentData.active && (
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-[9px] font-bold text-gray-300">Rp</span>
                        <Input type="number" className="h-10 w-32 pl-8 pr-3 rounded-xl border-gray-100 text-xs font-black text-right" value={currentData.price} onChange={(e) => {
                            const updated = { ...selectedRoom.pricing_plan };
                            if (!updated[activeTab]) updated[activeTab] = {};
                            updated[activeTab][unit] = { ...currentData, price: parseInt(e.target.value) || 0 };
                            setSelectedRoom({...selectedRoom, pricing_plan: updated});
                        }} />
                      </div>
                    )}
                    {/* TOMBOL ON/OFF */}
                    <button onClick={() => {
                        const updated = { ...selectedRoom.pricing_plan };
                        if (!updated[activeTab]) updated[activeTab] = {};
                        updated[activeTab][unit] = { ...currentData, active: !currentData.active };
                        setSelectedRoom({...selectedRoom, pricing_plan: updated});
                    }} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentData.active ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                      {currentData.active ? <X size={18} /> : <Check size={18} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- GALERI FOTO FASILITAS --- */}
        <div className="bg-white rounded-[40px] p-8 border shadow-sm space-y-4">
          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">Galeri Fasilitas Kamar Ini</Label>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {selectedRoom.room_photos?.map((url, i) => (
              <div key={i} className="relative shrink-0">
                <img src={url} className="w-24 h-24 rounded-2xl object-cover border grayscale hover:grayscale-0 transition-all duration-500" alt="Fasilitas" />
                <button onClick={() => setSelectedRoom({...selectedRoom, room_photos: selectedRoom.room_photos.filter((_, idx) => idx !== i)})} className="absolute -top-1 -right-1 bg-black text-white p-1 rounded-lg shadow-xl"><X size={10} /></button>
              </div>
            ))}
            <label className="w-24 h-24 shrink-0 rounded-2xl bg-gray-50 border-2 border-dashed flex flex-col items-center justify-center text-gray-300 hover:border-black cursor-pointer transition-all">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Camera size={24} /><span className="text-[8px] font-black uppercase mt-1">Add</span></>}
                <input type="file" className="hidden" onChange={handlePhotoUpload} disabled={saving} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // --- VIEW UTAMA: DAFTAR PINTU & WALLET ---
  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      {/* Wallet Header */}
      <div className="bg-black text-white p-10 rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex justify-between items-center relative z-10">
          <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 italic">Saldo Aktif</p><h2 className="text-4xl font-black italic tracking-tighter">Rp {wallet.balance.toLocaleString()}</h2></div>
          <Button className="rounded-2xl bg-white text-black h-12 px-8 font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Tarik Dana</Button>
        </div>
        <Wallet className="absolute -bottom-10 -right-10 text-white/5" size={220} />
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-4">
        <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2"><DoorOpen size={18} /> Daftar Pintu (Rooms)</h3>
            <Button variant="outline" className="h-10 rounded-xl border-black/10 text-[10px] font-black uppercase italic hover:bg-black hover:text-white transition-all"><Plus size={16} className="mr-2" /> Tambah Kamar</Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {rooms.map((room) => (
            <button key={room.id} onClick={() => setSelectedRoom(room)} className="bg-white rounded-[32px] p-7 border shadow-sm hover:border-black transition-all text-left group active:scale-95 transition-all">
              <div className="flex justify-between items-center">
                <div><h5 className="text-xl font-black italic uppercase leading-none mb-2">PINTU {room.room_number}</h5><p className="text-[10px] font-bold text-gray-400 mt-2 uppercase flex items-center gap-1"><Key size={12} className="text-black" /> TTLock ID: <span className="text-black">{room.ttlock_id || '-'}</span></p></div>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all"><Settings2 size={20} /></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardMitra;
