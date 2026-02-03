import React, { useEffect, useState } from 'react';
import { 
  Wallet, DoorOpen, Plus, Camera, Loader2, ChevronLeft, 
  X, Key, Clock, Calendar, Check, Settings2
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
  const [selectedRoom, setSelectedRoom] = useState(null); // Mode Edit Per Pintu
  const [activeTab, setActiveTab] = useState('hourly'); // transit, harian, bulanan
  
  const [rooms, setRooms] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });

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

  // Simpan Perubahan Per Pintu (Poin B: TTLock & Pricing)
  const handleUpdateRoom = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('rooms').update({
        pricing_plan: selectedRoom.pricing_plan,
        ttlock_id: selectedRoom.ttlock_id,
        room_photos: selectedRoom.room_photos
      }).eq('id', selectedRoom.id);
      if (error) throw error;
      toast({ title: "Berhasil!", description: "Data pintu disimpan." });
      setSelectedRoom(null);
      fetchData();
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;

  // VIEW DETAIL: EDIT PINTU & TARIF (1-24 JAM)
  if (selectedRoom) return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <div className="bg-white border-b sticky top-0 z-50 px-6 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><ChevronLeft size={24} /></button>
          <h1 className="text-lg font-black uppercase italic tracking-tighter">Edit Pintu {selectedRoom.room_number}</h1>
        </div>
        <Button onClick={handleUpdateRoom} disabled={actionLoading} className="bg-black text-white rounded-xl h-10 px-6 font-black uppercase italic shadow-lg active:scale-95 transition-all">
          {actionLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Simpan'}
        </Button>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-6">
        {/* INPUT TTLOCK ID */}
        <div className="bg-white rounded-[40px] p-8 border shadow-sm space-y-4">
          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">Koneksi IoT Pintu (Lock ID)</Label>
          <div className="relative">
            <Key className="absolute left-4 top-3.5 text-gray-300" size={18} />
            <Input className="h-12 pl-12 rounded-xl border-gray-100 bg-gray-50 font-mono" value={selectedRoom.ttlock_id || ''} onChange={(e) => setSelectedRoom({...selectedRoom, ttlock_id: e.target.value})} placeholder="Lock ID dari TTLock App" />
          </div>
        </div>

        {/* PRICING MATRIX (1 JAM - 24 JAM) */}
        <div className="bg-white rounded-[40px] p-8 border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2"><Clock size={18} /> Atur Tarif</h3>
            <div className="flex bg-gray-50 p-1.5 rounded-2xl border">
               {['hourly', 'daily', 'monthly'].map(tab => (
                   <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-black text-white shadow-md' : 'text-gray-400'}`}>
                      {tab === 'hourly' ? 'Transit' : tab === 'daily' ? 'Harian' : 'Bulanan'}
                   </button>
               ))}
            </div>
          </div>

          <div className="space-y-3">
            {selectedRoom.pricing_plan[activeTab] && Object.keys(selectedRoom.pricing_plan[activeTab]).map((unit) => (
              <div key={unit} className={`flex items-center justify-between p-5 rounded-[24px] border transition-all ${selectedRoom.pricing_plan[activeTab][unit].active ? 'bg-white border-black/10 shadow-sm' : 'bg-gray-50 border-transparent opacity-40 grayscale'}`}>
                <span className="text-[11px] font-black uppercase italic">
                    {unit} {activeTab === 'hourly' ? 'Jam' : activeTab === 'daily' ? 'Jam (1 Hari)' : 'Bulan'}
                </span>
                <div className="flex items-center gap-2">
                  {selectedRoom.pricing_plan[activeTab][unit].active && (
                    <Input type="number" className="h-10 w-32 text-right rounded-xl font-black focus:ring-black" value={selectedRoom.pricing_plan[activeTab][unit].price} onChange={(e) => {
                      const updated = { ...selectedRoom.pricing_plan };
                      updated[activeTab][unit].price = parseInt(e.target.value) || 0;
                      setSelectedRoom({...selectedRoom, pricing_plan: updated});
                    }} />
                  )}
                  <button onClick={() => {
                      const updated = { ...selectedRoom.pricing_plan };
                      updated[activeTab][unit].active = !updated[activeTab][unit].active;
                      setSelectedRoom({...selectedRoom, pricing_plan: updated});
                  }} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedRoom.pricing_plan[activeTab][unit].active ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                    {selectedRoom.pricing_plan[activeTab][unit].active ? <X size={18} /> : <Check size={18} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // VIEW UTAMA: DAFTAR PINTU & WALLET
  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      {/* Wallet Card */}
      <div className="bg-black text-white p-10 rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex justify-between items-center relative z-10">
          <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">Saldo Aktif</p><h2 className="text-4xl font-black italic tracking-tighter">Rp {wallet.balance.toLocaleString()}</h2></div>
          <Button className="rounded-2xl bg-white text-black h-12 px-8 font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Tarik Dana</Button>
        </div>
        <Wallet className="absolute -bottom-10 -right-10 text-white/5" size={220} />
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-4">
        <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2"><DoorOpen size={18} /> Daftar Pintu</h3>
            <Button variant="outline" className="h-10 rounded-xl border-black/10 text-[10px] font-black uppercase italic"><Plus size={16} className="mr-2" /> Tambah Pintu</Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {rooms.map((room) => (
            <button key={room.id} onClick={() => setSelectedRoom(room)} className="bg-white rounded-[32px] p-7 border shadow-sm hover:border-black transition-all text-left active:scale-95 group">
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
