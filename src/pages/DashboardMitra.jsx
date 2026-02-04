import React, { useEffect, useState } from 'react';
import { 
  Wallet, DoorOpen, Plus, Camera, Loader2, ChevronLeft, 
  X, Key, Clock, Calendar, Check, Settings2, ShieldCheck
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
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeTab, setActiveTab] = useState('hourly');
  
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });

  // 1. DAFTAR PILIHAN FASILITAS
  const amenitiesOptions = [
    "WiFi", "AC", "Smart TV", "Kamar Mandi Dalam", 
    "Water Heater", "Meja Kerja", "Lemari Pakaian", "Dispenser"
  ];

  const durasiList = {
    hourly: ["1", "2", "3", "4", "5", "6", "12", "24"],
    monthly: ["1", "2", "3", "4", "5", "6", "12"]
  };

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

  // 2. LOGIKA TOGGLE FASILITAS (Tambah/Hapus dari array)
  const handleToggleAmenity = (amenity) => {
    const current = selectedRoom.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter(item => item !== amenity)
      : [...current, amenity];
    setSelectedRoom({ ...selectedRoom, amenities: updated });
  };

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
      toast({ title: "Foto Berhasil Diunggah" });
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setSaving(false); }
  };

  const handleUpdateRoom = async () => {
    setSaving(true);
    try {
      // Pastikan kolom 'amenities' ikut ter-update di database
      await supabase.from('rooms').update({
        pricing_plan: selectedRoom.pricing_plan,
        ttlock_id: selectedRoom.ttlock_id,
        room_photos: selectedRoom.room_photos,
        amenities: selectedRoom.amenities 
      }).eq('id', selectedRoom.id);
      toast({ title: "Berhasil Diperbarui!" });
      setSelectedRoom(null);
      fetchData();
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-black" /></div>;

  if (selectedRoom) return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24 font-sans">
      <div className="bg-white border-b sticky top-0 z-50 px-6 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><ChevronLeft size={24} /></button>
          <h1 className="text-lg font-black uppercase italic tracking-tighter leading-none">Edit Pintu {selectedRoom.room_number}</h1>
        </div>
        <Button onClick={handleUpdateRoom} disabled={saving} className="bg-black text-white rounded-xl h-10 px-6 font-black uppercase italic shadow-lg active:scale-95 transition-all">
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Simpan'}
        </Button>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-6">
        {/* --- FITUR FASILITAS KAMAR (BARU) --- */}
        <div className="bg-white rounded-[40px] p-8 border shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={18} />
            <h3 className="text-sm font-black uppercase italic tracking-widest">Fasilitas Kamar</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {amenitiesOptions.map((item) => {
              const isSelected = selectedRoom.amenities?.includes(item);
              return (
                <button 
                  key={item}
                  onClick={() => handleToggleAmenity(item)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isSelected ? 'border-black bg-black text-white shadow-md' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                >
                  <span className="text-[9px] font-black uppercase italic">{item}</span>
                  {isSelected ? <Check size={14} strokeWidth={4} /> : <Plus size={14} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- PENGATURAN TARIF (TETAP SAMA) --- */}
        <div className="bg-white rounded-[40px] p-8 border shadow-sm space-y-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2"><Clock size={18} /> Atur Durasi & Tarif</h3>
            <div className="flex bg-gray-50 p-1.5 rounded-2xl border">
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

        {/* --- GALERI FOTO (TETAP WARNA ASLI) --- */}
        <div className="bg-white rounded-[40px] p-8 border shadow-sm space-y-4">
          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">Galeri Foto Kamar</Label>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {selectedRoom.room_photos?.map((url, i) => (
              <div key={i} className="relative shrink-0">
                <img src={url} className="w-24 h-24 rounded-2xl object-cover border shadow-sm" alt="Fasilitas" />
                <button onClick={() => setSelectedRoom({...selectedRoom, room_photos: selectedRoom.room_photos.filter((_, idx) => idx !== i)})} className="absolute -top-1 -right-1 bg-black text-white p-1 rounded-lg shadow-xl"><X size={10} /></button>
              </div>
            ))}
            <label className="w-24 h-24 shrink-0 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 hover:border-black cursor-pointer transition-all">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Camera size={24} /><span className="text-[8px] font-black uppercase mt-1">Add</span></>}
                <input type="file" className="hidden" onChange={handlePhotoUpload} disabled={saving} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      {/* Wallet Header */}
      <div className="bg-black text-white p-10 rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex justify-between items-center relative z-10">
          <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 italic">Saldo Aktif</p><h2 className="text-4xl font-black italic tracking-tighter leading-none">Rp {wallet.balance.toLocaleString()}</h2></div>
          <Button className="rounded-2xl bg-white text-black h-12 px-8 font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Tarik Dana</Button>
        </div>
        <Wallet className="absolute -bottom-10 -right-10 text-white/5" size={220} />
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {rooms.map((room) => (
            <button key={room.id} onClick={() => setSelectedRoom(room)} className="bg-white rounded-[32px] p-7 border shadow-sm hover:border-black transition-all text-left group active:scale-95 transition-all">
              <div className="flex justify-between items-center">
                <div><h5 className="text-xl font-black italic uppercase mb-2">PINTU {room.room_number}</h5><p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Key size={12} className="text-black" /> TTLock ID: <span className="text-black">{room.ttlock_id || '-'}</span></p></div>
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
