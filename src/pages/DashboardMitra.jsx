import React, { useEffect, useState } from 'react';
import { 
  Wallet, DoorOpen, Plus, Camera, Loader2, ChevronLeft, 
  X, Key, Clock, Calendar, Check, Image as ImageIcon, Trash2, Smartphone, Settings2
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
  const [selectedRoom, setSelectedRoom] = useState(null); // Mode edit pintu
  
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });

  // Modal Control
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showPayout, setShowPayout] = useState(false);

  // Form States
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

  // --- LOGIKA TARIK DANA ---
  const handlePayout = async () => {
    if (parseInt(payoutForm.amount) > wallet.balance) return toast({ variant: "destructive", description: "Saldo tidak cukup." });
    setActionLoading(true);
    try {
      await supabase.from('payout_requests').insert({
        owner_id: user.id, amount: payoutForm.amount,
        bank_details: { bank: payoutForm.bank, account: payoutForm.accNo, name: payoutForm.name }
      });
      toast({ title: "Berhasil", description: "Permintaan tarik dana dikirim ke admin." });
      setShowPayout(false);
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setActionLoading(false); }
  };

  // --- LOGIKA TAMBAH KAMAR ---
  const handleAddRoom = async () => {
    if (!roomForm.number) return;
    setActionLoading(true);
    try {
      await supabase.from('rooms').insert({
        property_id: property.id, room_number: roomForm.number, ttlock_id: roomForm.ttlock
      });
      toast({ title: "Berhasil", description: "Pintu baru ditambahkan." });
      setShowAddRoom(false);
      fetchData();
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setActionLoading(false); }
  };

  // --- LOGIKA UPDATE DETAIL KAMAR (FOTO & TARIF) ---
  const handleUpdateRoomDetail = async () => {
    setActionLoading(true);
    try {
      await supabase.from('rooms').update({
        ttlock_id: selectedRoom.ttlock_id,
        pricing_plan: selectedRoom.pricing_plan,
        room_photos: selectedRoom.room_photos
      }).eq('id', selectedRoom.id);
      toast({ title: "Berhasil!", description: "Pengaturan pintu disimpan." });
      setSelectedRoom(null);
      fetchData();
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;

  // --- VIEW: DETAIL KELOLA PINTU (DENGAN PRICING MATRIX) ---
  if (selectedRoom) return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-24">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 px-6 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-gray-50 rounded-xl"><ChevronLeft size={24} /></button>
          <h1 className="text-lg font-black uppercase italic tracking-tighter leading-none">Kelola Pintu {selectedRoom.room_number}</h1>
        </div>
        <Button onClick={handleUpdateRoomDetail} disabled={actionLoading} className="bg-black text-white h-10 px-6 rounded-xl font-black text-[10px] tracking-widest uppercase italic">
          {actionLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Simpan'}
        </Button>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-6">
        {/* TTLock ID */}
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-4">
          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">Koneksi IoT Pintu</Label>
          <div className="relative">
            <Key className="absolute left-4 top-3.5 text-gray-300" size={18} />
            <Input className="h-12 pl-12 rounded-xl border-gray-100 bg-gray-50 font-mono" value={selectedRoom.ttlock_id || ''} onChange={(e) => setSelectedRoom({...selectedRoom, ttlock_id: e.target.value})} placeholder="Lock ID dari TTLock App" />
          </div>
        </div>

        {/* Pricing Matrix Per Kamar */}
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2"><Clock size={18} /> Atur Tarif Kamar Ini</h3>
          {['hourly', 'daily', 'monthly'].map(cat => (
            <div key={cat} className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">{cat === 'hourly' ? 'Transit' : cat === 'daily' ? 'Harian' : 'Bulanan'}</p>
              {Object.keys(selectedRoom.pricing_plan[cat]).map(unit => (
                <div key={unit} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[11px] font-black uppercase italic">{unit} {cat === 'hourly' ? 'Jam' : cat === 'daily' ? 'Hari' : 'Bulan'}</span>
                  <div className="flex items-center gap-2">
                    <Input type="number" className="h-8 w-24 text-right rounded-lg text-xs font-black" value={selectedRoom.pricing_plan[cat][unit].price} onChange={(e) => {
                      const updated = { ...selectedRoom.pricing_plan };
                      updated[cat][unit].price = parseInt(e.target.value) || 0;
                      updated[cat][unit].active = true;
                      setSelectedRoom({...selectedRoom, pricing_plan: updated});
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- VIEW: DAFTAR PINTU UTAMA ---
  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-24">
      {/* Wallet Header */}
      <div className="bg-black text-white p-10 rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 italic">Total Saldo Dompet</p>
            <h2 className="text-4xl font-black italic tracking-tighter leading-none">Rp {wallet.balance.toLocaleString()}</h2>
          </div>
          <Button onClick={() => setShowPayout(true)} className="rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest h-12 px-8">Tarik Dana</Button>
        </div>
        <Wallet className="absolute -bottom-10 -right-10 text-white/5" size={220} />
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-6">
        <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2"><DoorOpen size={18} /> Daftar Pintu (Rooms)</h3>
            <Button onClick={() => setShowAddRoom(true)} variant="outline" className="h-10 rounded-xl border-black/10 text-[10px] font-black uppercase italic"><Plus size={16} className="mr-2" /> Tambah Pintu</Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {rooms.map((room) => (
            <button key={room.id} onClick={() => setSelectedRoom(room)} className="bg-white rounded-[32px] p-7 border border-gray-100 shadow-sm hover:border-black transition-all text-left group">
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="text-xl font-black italic uppercase leading-none mb-2">PINTU {room.room_number}</h5>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Key size={12} className="text-black" /> TTLock ID: <span className="text-black">{room.ttlock_id || '-'}</span></p>
                </div>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all"><Settings2 size={20} /></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MODAL TARIK DANA */}
      {showPayout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black uppercase italic tracking-tighter">Penarikan Dana</h3>
                <button onClick={() => setShowPayout(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
                <Input type="number" placeholder="Jumlah (Rp)" value={payoutForm.amount} onChange={(e) => setPayoutForm({...payoutForm, amount: e.target.value})} />
                <Input placeholder="Nama Bank" value={payoutForm.bank} onChange={(e) => setPayoutForm({...payoutForm, bank: e.target.value})} />
                <Input placeholder="No Rekening" value={payoutForm.accNo} onChange={(e) => setPayoutForm({...payoutForm, accNo: e.target.value})} />
                <Input placeholder="Atas Nama" value={payoutForm.name} onChange={(e) => setPayoutForm({...payoutForm, name: e.target.value})} />
                <Button onClick={handlePayout} disabled={actionLoading} className="w-full bg-black text-white h-14 rounded-2xl font-black uppercase text-xs tracking-widest mt-4">Kirim Permintaan</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH PINTU */}
      {showAddRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none">Tambah Pintu Baru</h3>
                <button onClick={() => setShowAddRoom(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
                <Input placeholder="Nomor Pintu (Contoh: A01)" value={roomForm.number} onChange={(e) => setRoomForm({...roomForm, number: e.target.value})} />
                <Input placeholder="TTLock ID" value={roomForm.ttlock} onChange={(e) => setRoomForm({...roomForm, ttlock: e.target.value})} />
                <Button onClick={handleAddRoom} disabled={actionLoading} className="w-full bg-black text-white h-14 rounded-2xl font-black uppercase text-xs tracking-widest mt-4">Simpan Kamar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMitra;
