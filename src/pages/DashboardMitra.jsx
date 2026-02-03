import React, { useEffect, useState } from 'react';
import { 
  Wallet, DoorOpen, Plus, Camera, Loader2, ChevronLeft, 
  Trash2, X, Key, Smartphone, Landmark, Banknote 
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
  
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });

  // Modal Control
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showPayout, setShowPayout] = useState(false);

  // Form State
  const [roomForm, setRoomForm] = useState({ number: '', ttlock: '' });
  const [payoutForm, setPayoutForm] = useState({ amount: '', bank: '', accNo: '', name: '' });

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

  // Logika Tambah Kamar (Poin B.2)
  const handleAddRoom = async () => {
    if (!roomForm.number) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('rooms').insert({
        property_id: property.id,
        room_number: roomForm.number,
        ttlock_id: roomForm.ttlock,
        room_photos: []
      });
      if (error) throw error;
      toast({ title: "Kamar Berhasil Ditambah" });
      setShowAddRoom(false);
      fetchData();
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setActionLoading(false); }
  };

  // Logika Tarik Dana (Poin B.Wallet)
  const handlePayout = async () => {
    if (parseInt(payoutForm.amount) > wallet.balance) return toast({ variant: "destructive", description: "Saldo tidak cukup" });
    setActionLoading(true);
    try {
      const { error } = await supabase.from('payout_requests').insert({
        owner_id: user.id,
        amount: payoutForm.amount,
        bank_info: { bank: payoutForm.bank, account: payoutForm.accNo, name: payoutForm.name }
      });
      if (error) throw error;
      toast({ title: "Permintaan Payout Terkirim" });
      setShowPayout(false);
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-24">
      {/* Header Wallet */}
      <div className="bg-black text-white p-10 rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 italic">Saldo Dompet Mitra</p>
            <h2 className="text-4xl font-black italic tracking-tighter">Rp {wallet.balance.toLocaleString()}</h2>
          </div>
          <Button onClick={() => setShowPayout(true)} className="rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest italic h-12 px-8">Tarik Dana</Button>
        </div>
        <Wallet className="absolute -bottom-10 -right-10 text-white/5" size={200} />
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8 space-y-6">
        <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2"><DoorOpen size={18} /> Kelola Pintu (Rooms)</h3>
            <Button onClick={() => setShowAddRoom(true)} variant="outline" className="h-10 rounded-xl border-black/10 text-[10px] font-black uppercase italic"><Plus size={16} className="mr-2" /> Tambah Kamar</Button>
        </div>

        {/* List Kamar Multi-Pintu */}
        <div className="grid grid-cols-1 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
                <h5 className="text-xl font-black italic uppercase">Pintu {room.room_number}</h5>
                <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase flex items-center gap-1"><Key size={10} /> TTLock ID: {room.ttlock_id || '-'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL TAMBAH KAMAR */}
      {showAddRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black uppercase italic tracking-tighter">Unit Kamar Baru</h3>
                <button onClick={() => setShowAddRoom(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
                <Input placeholder="Nomor Pintu (A01)" value={roomForm.number} onChange={(e) => setRoomForm({...roomForm, number: e.target.value})} />
                <Input placeholder="TTLock ID" value={roomForm.ttlock} onChange={(e) => setRoomForm({...roomForm, ttlock: e.target.value})} />
                <Button onClick={handleAddRoom} disabled={actionLoading} className="w-full bg-black text-white h-12 rounded-xl font-black uppercase text-[10px] tracking-widest mt-4">
                    {actionLoading ? <Loader2 className="animate-spin" /> : 'Simpan Pintu'}
                </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TARIK DANA */}
      {showPayout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black uppercase italic tracking-tighter">Penarikan Saldo</h3>
                <button onClick={() => setShowPayout(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
                <Input type="number" placeholder="Jumlah (Rp)" value={payoutForm.amount} onChange={(e) => setPayoutForm({...payoutForm, amount: e.target.value})} />
                <Input placeholder="Nama Bank" value={payoutForm.bank} onChange={(e) => setPayoutForm({...payoutForm, bank: e.target.value})} />
                <Input placeholder="No Rekening" value={payoutForm.accNo} onChange={(e) => setPayoutForm({...payoutForm, accNo: e.target.value})} />
                <Input placeholder="Atas Nama" value={payoutForm.name} onChange={(e) => setPayoutForm({...payoutForm, name: e.target.value})} />
                <Button onClick={handlePayout} disabled={actionLoading} className="w-full bg-black text-white h-12 rounded-xl font-black uppercase text-[10px] tracking-widest mt-4">
                    {actionLoading ? <Loader2 className="animate-spin" /> : 'Kirim Permintaan'}
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMitra;
