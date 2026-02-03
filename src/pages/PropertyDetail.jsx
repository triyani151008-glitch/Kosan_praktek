import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Calendar, ShieldCheck, MapPin, Loader2, Zap } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // State Pilihan Booking (Poin 2A)
  const [selectedTab, setSelectedTab] = useState('hourly'); // hourly, daily, monthly
  const [selectedDuration, setSelectedDuration] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      const { data } = await supabase.from('properties').select('*').eq('id', id).single();
      if (data) setProperty(data);
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  const handleBooking = async () => {
    if (!selectedDuration) return toast({ variant: "destructive", description: "Pilih durasi sewa." });
    
    setBookingLoading(true);
    try {
      // Logika Transaksi & IoT Akan Disisipkan di Sini (Poin 3B & 3D)
      toast({ title: "Booking Diproses", description: "Menghubungkan ke sistem pembayaran..." });
      // navigate('/payment'); 
    } catch (error) {
      toast({ variant: "destructive", description: error.message });
    } finally { setBookingLoading(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const pricing = property?.pricing_plan || {};

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Gambar Properti */}
      <div className="h-72 w-full bg-gray-100 relative">
        <img src={property?.photo_url} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt={property?.name} />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 bg-white/90 p-2 rounded-full shadow-lg"><ChevronLeft size={20} /></button>
      </div>

      <div className="px-6 mt-8">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-2">{property?.name}</h1>
        <div className="flex items-center gap-2 text-gray-400 mb-6">
            <MapPin size={14} className="text-black" />
            <span className="text-[11px] font-bold uppercase italic">{property?.address}</span>
        </div>

        {/* --- BOOKING ENGINE SELECTION (Poin A) --- */}
        <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100">
            <h3 className="text-xs font-black uppercase italic tracking-widest mb-4 flex items-center gap-2">
                <Zap size={14} fill="black" /> Pilih Durasi Istirahat
            </h3>

            {/* Tab Durasi */}
            <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 mb-6">
                {['hourly', 'daily', 'monthly'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => { setSelectedTab(tab); setSelectedDuration(null); }}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTab === tab ? 'bg-black text-white' : 'text-gray-400'}`}
                    >
                        {tab === 'hourly' ? 'Transit' : tab === 'daily' ? 'Harian' : 'Bulanan'}
                    </button>
                ))}
            </div>

            {/* List Tombol Durasi (Poin A - Pilihan Terbatas) */}
            <div className="grid grid-cols-2 gap-3">
                {pricing[selectedTab] && Object.entries(pricing[selectedTab])
                    .filter(([_, config]) => config.active) // Hanya tampilkan yang ON
                    .map(([unit, config]) => (
                    <button 
                        key={unit}
                        onClick={() => setSelectedDuration({ unit, price: config.price })}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${selectedDuration?.unit === unit ? 'border-black bg-white' : 'border-transparent bg-white/50 text-gray-400'}`}
                    >
                        <span className="block text-[11px] font-black uppercase italic leading-none mb-1">
                            {unit} {selectedTab === 'hourly' ? 'Jam' : selectedTab === 'daily' ? 'Hari' : 'Bulan'}
                        </span>
                        <span className="text-[10px] font-bold">Rp {config.price.toLocaleString()}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Info Pemilik & Keamanan */}
        <div className="mt-8 flex items-center justify-between p-5 bg-black text-white rounded-[24px]">
            <div className="flex items-center gap-3">
                <ShieldCheck size={24} className="text-gray-400" />
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Keamanan IoT</p>
                    <p className="text-xs font-black italic uppercase">Smart Passcode Aktif</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[9px] font-bold uppercase text-gray-400">Total Bayar</p>
                <p className="text-lg font-black italic leading-none">Rp {(selectedDuration?.price || 0).toLocaleString()}</p>
            </div>
        </div>

        <Button 
            onClick={handleBooking}
            disabled={bookingLoading}
            className="w-full bg-black text-white rounded-2xl h-14 font-black text-xs uppercase tracking-[0.2em] mt-6 shadow-xl active:scale-95 transition-all"
          >
            {bookingLoading ? <Loader2 className="animate-spin" /> : 'Pesan Sekarang'}
        </Button>
      </div>
    </div>
  );
};

export default PropertyDetail;
