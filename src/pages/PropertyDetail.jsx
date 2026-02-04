import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, MapPin, Star, Clock, Calendar, 
  ShieldCheck, Zap, Wifi, Wind, Coffee, Loader2 
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  
  // State Pilihan Tamu [Poin A.2]
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('hourly'); // hourly atau monthly
  const [selectedDuration, setSelectedDuration] = useState(null);

  useEffect(() => { fetchPropertyDetails(); }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const { data: prop } = await supabase.from('properties').select('*').eq('id', id).single();
      if (prop) {
        setProperty(prop);
        const { data: rm } = await supabase.from('rooms').select('*').eq('property_id', id);
        setRooms(rm || []);
        if (rm?.length > 0) setSelectedRoom(rm[0]); // Default pilih kamar pertama
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header & Gambar */}
      <div className="relative h-80 overflow-hidden">
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-10 bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-white hover:text-black transition-all shadow-xl">
          <ChevronLeft size={24} />
        </button>
        <img src={property?.photo_url || "/placeholder.jpg"} className="w-full h-full object-cover grayscale" alt={property?.name} />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-gray-100">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2 leading-none">{property?.name}</h1>
          <div className="flex items-center gap-2 text-gray-400 mb-6">
            <MapPin size={16} className="text-black" />
            <span className="text-[11px] font-bold uppercase italic tracking-wider">{property?.address}</span>
          </div>

          {/* --- PILIH KAMAR (MULTI-PINTU) [Poin B] --- */}
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 italic">Pilih Unit Kamar</p>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {rooms.map((room) => (
              <button 
                key={room.id} 
                onClick={() => { setSelectedRoom(room); setSelectedDuration(null); }}
                className={`shrink-0 px-6 py-4 rounded-3xl border-2 transition-all ${selectedRoom?.id === room.id ? 'border-black bg-black text-white' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
              >
                <p className="text-[10px] font-black uppercase italic">Pintu {room.room_number}</p>
              </button>
            ))}
          </div>

          {/* --- PILIH KATEGORI (JAM / BULAN) --- */}
          <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 my-6">
            <button onClick={() => { setSelectedCategory('hourly'); setSelectedDuration(null); }} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'hourly' ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}>Transit (Jam)</button>
            <button onClick={() => { setSelectedCategory('monthly'); setSelectedDuration(null); }} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'monthly' ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}>Bulanan</button>
          </div>

          {/* --- DAFTAR DURASI YANG AKTIF (1-24 Jam / 1-12 Bulan) [Poin A.2 & B] --- */}
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 italic">Pilih Durasi Sewa</p>
          <div className="grid grid-cols-2 gap-3">
            {selectedRoom?.pricing_plan[selectedCategory] && 
             Object.entries(selectedRoom.pricing_plan[selectedCategory])
             .filter(([_, data]) => data.active) // HANYA TAMPILKAN YANG "ON" DI DASHBOARD MITRA
             .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
             .map(([unit, data]) => (
              <button 
                key={unit}
                onClick={() => setSelectedDuration({ unit, price: data.price })}
                className={`p-4 rounded-3xl border transition-all text-left group ${selectedDuration?.unit === unit ? 'bg-black border-black text-white' : 'bg-white border-gray-100'}`}
              >
                <p className={`text-[10px] font-black uppercase italic ${selectedDuration?.unit === unit ? 'text-gray-400' : 'text-gray-300'}`}>{unit} {selectedCategory === 'hourly' ? 'Jam' : 'Bulan'}</p>
                <p className="text-sm font-black italic mt-1">{formatRupiah(data.price)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- FLOATING PAYMENT BAR --- */}
      {selectedDuration && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 z-50 animate-in slide-in-from-bottom duration-500">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Total Pembayaran</p>
              <h2 className="text-2xl font-black italic tracking-tighter leading-none">{formatRupiah(selectedDuration.price)}</h2>
            </div>
            <Button className="bg-black hover:bg-gray-800 text-white rounded-2xl h-14 px-10 text-xs font-black uppercase italic tracking-widest shadow-2xl active:scale-95 transition-all">
              Bayar Sekarang
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
