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
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeTab, setActiveTab] = useState('hourly'); // hourly (Jam) atau monthly (Bulan)
  
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });

  // Modal States
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [roomForm, setRoomForm] = useState({ number: '', ttlock: '' });
  const [payoutForm, setPayoutForm] = useState({ amount: '', bank: '', accNo: '', name: '' });

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

  // --- LOGIKA UPLOAD FOTO ---
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
      toast({ title: "Foto Ditambahkan" });
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setSaving(false); }
  };

  // --- SIMPAN PERUBAHAN KAMAR ---
  const handleUpdateRoom = async () => {
    setSaving(true);
    try {
      await supabase.from('rooms').update({
        pricing_plan: selectedRoom.pricing_plan,
        ttlock_id: selectedRoom.ttlock_id,
        room_photos: selectedRoom.room_photos
      }).eq('id', selectedRoom.id);
      toast({ title: "Berhasil Diperbarui!" });
      setSelectedRoom(null);
      fetchData();
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setSaving(false); }
  };

  // --- LOGIKA TAMBAH KAMAR ---
  const handleAddRoom = async () => {
    if (!roomForm.number) return;
    setSaving(true);
    try {
      await supabase.from('rooms').insert({
        property_id: property.id, room_number: roomForm.number, ttlock_id: roomForm.ttlock
      });
      setShowAddRoom(false);
      fetchData();
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  // --- VIEW: EDIT KAMAR (TARIF & FOTO) ---
  if (selectedRoom) return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <div className="bg-white border-b sticky top-0 z-50 px-6 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft size={24} /></button>
          <h1 className="text-lg font-black uppercase italic tracking-tighter">Edit Pintu {selectedRoom.room_number}</h1>
        </div>
        <Button onClick={handleUpdateRoom} disabled={saving} className="bg-black text-white rounded-xl h-10 px-6 font-black uppercase italic">
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Simpan'}
        </Button>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-6">
        {/* INPUT TTLOCK */}
        <div className="bg-white rounded-[40px] p-8 border shadow-sm">
          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-4 block">TTLock ID Pintu</Label>
          <Input className="h-12 rounded-xl border-gray-100 bg-gray-50 font-mono" value={selectedRoom.ttlock_id || ''} onChange={(e) => setSelectedRoom({...selectedRoom, ttlock_id: e.target.value})} placeholder="Masukkan ID" />
        </div>

        {/* PRICING MATRIX */}
        <div className="bg-white rounded-[40px] p-8 border shadow-sm space-y-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2"><Clock size={18} /> Atur Durasi & Tarif</h3>
            <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
               {['hourly', 'monthly'].map(tab => (
                   <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-black text-white shadow-md' : 'text-gray-400'}`}>
                      {tab === 'hourly' ? 'Transit (Jam)' : 'Bulanan'}
                   </button>
               ))}
            </div>
          </div>

          <div className="space-y-3">
            {durasiList[activeTab].map((unit) => {
              const currentData = selectedRoom.pricing_plan[activeTab]?.[unit] || { active: false, price: 0 };
              return (
                <div key={unit} className={`flex items-center justify-between p-5 rounded-[24px] border transition-all ${currentData.active ? 'bg-white border-black/10 shadow-sm' : 'bg-gray-50 border-transparent opacity-40 grayscale'}`}>
                  <span className="text-[11px] font-black uppercase italic">{unit} {activeTab === 'hourly' ? 'Jam' : 'Bulan'}</span>
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

        {/* UPLOAD FOTO */}
        <div className="bg-white rounded-[40px] p-8 border shadow-sm">
          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-4 block">Foto Fasilitas Per Kamar</Label>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {selectedRoom.room_photos?.map((url, i) => (
              <div key={i} className="relative shrink-0">
                <img src={url} className="w-24 h-24 rounded-2xl object-cover border" alt="Room" />
                <button onClick={() => setSelectedRoom({...selectedRoom, room_photos: selectedRoom.room_photos.filter((_, idx) => idx !== i)})} className="absolute -top-1 -right-1 bg-black text-white p-1 rounded-lg"><X size={10} /></button>
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

  // --- VIEW UTAMA (LIST PINTU) ---
  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <div className="bg-black text-white p-10 rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex justify-between items-center relative z-10">
          <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">Saldo Dompet</p><h2 className="text-4xl font-black italic">Rp {wallet.balance.toLocaleString()}</h2></div>
          <Button onClick={() => setShowPayout(true)} className="rounded-2xl bg-white text-black h-12 px-8 font-black uppercase text-[10px] tracking-widest">Tarik Dana</Button>
        </div>
        <Wallet className="absolute -bottom-10 -right-10 text-white/5" size={220} />
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-4">
        <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2"><DoorOpen size={18} /> Kelola Kamar</h3>
            <Button onClick={() => setShowAddRoom(true)} variant="outline" className="h-10 rounded-xl border-black/10 text-[10px] font-black uppercase italic"><Plus size={16} className="mr-2" /> Tambah Pintu</Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {rooms.map((room) => (
            <button key={room.id} onClick={() => setSelectedRoom(room)} className="bg-white rounded-[32px] p-7 border shadow-sm hover:border-black transition-all text-left active:scale-95 group">
              <div className="flex justify-between items-center">
                <div><h5 className="text-xl font-black italic uppercase leading-none mb-2">PINTU {room.room_number}</h5><p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Key size={12} className="text-black" /> TTLock ID: <span className="text-black">{room.ttlock_id || '-'}</span></p></div>
                <Settings2 size={20} className="text-gray-200 group-hover:text-black" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal Add Room */}
      {showAddRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black uppercase italic">Tambah Unit Kamar</h3>
                <button onClick={() => setShowAddRoom(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
                <Input placeholder="Nomor Pintu (A01)" value={roomForm.number} onChange={(e) => setRoomForm({...roomForm, number: e.target.value})} />
                <Input placeholder="TTLock ID (Opsional)" value={roomForm.ttlock} onChange={(e) => setRoomForm({...roomForm, ttlock: e.target.value})} />
                <Button onClick={handleAddRoom} disabled={saving} className="w-full bg-black text-white h-14 rounded-2xl font-black uppercase text-xs tracking-widest mt-4">Simpan Kamar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMitra;
