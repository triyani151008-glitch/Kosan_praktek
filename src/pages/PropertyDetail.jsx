// src/pages/PropertyDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, MapPin, Star, ShieldCheck, 
  Zap, Loader2, Info, LayoutGrid, Image as ImageIcon,
  Wifi, Wind, Tv, CheckCircle2, Droplets, Laptop, Shirt, GlassWater
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';

// Objek untuk memetakan ikon fasilitas
const amenityIcons = {
  "WiFi": <Wifi size={14} />,
  "AC": <Wind size={14} />,
  "Smart TV": <Tv size={14} />,
  "Kamar Mandi Dalam": <CheckCircle2 size={14} />,
  "Water Heater": <Droplets size={14} />,
  "Meja Kerja": <Laptop size={14} />,
  "Lemari Pakaian": <Shirt size={14} />,
  "Dispenser": <GlassWater size={14} />
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);

  useEffect(() => { fetchDetails(); }, [id]);

  const fetchDetails = async () => {
    try {
      const { data: prop } = await supabase.from('properties').select('*').eq('id', id).single();
      if (prop) {
        setProperty(prop);
        const { data: rm } = await supabase.from('rooms').select('*').eq('property_id', id).order('room_number');
        setRooms(rm || []);
      }
    } catch (error) { console.error("Gagal mengambil detail:", error); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-black" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20 font-sans">
      {/* 1. HERO SECTION - Poto Asli */}
      <div className="relative h-[45vh] overflow-hidden">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-8 left-6 z-20 bg-white/40 backdrop-blur-xl p-3 rounded-2xl text-black hover:bg-white transition-all shadow-2xl"
        >
          <ChevronLeft size={24} />
        </button>
        <img 
          src={property?.photo_url || "/placeholder.jpg"} 
          className="w-full h-full object-cover" 
          alt={property?.name} 
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F9F9F9] to-transparent" />
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{property?.name}</h1>
            <div className="bg-black text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase italic tracking-widest flex items-center gap-1">
              <Star size={10} fill="white" /> {property?.rating || '4.8'}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-gray-400 mb-6">
            <MapPin size={14} className="text-black shrink-0" />
            <span className="text-[10px] font-bold uppercase italic tracking-wider line-clamp-1">{property?.address}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-black">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase text-gray-300 tracking-widest italic">Keamanan</p>
                <p className="text-[10px] font-black uppercase italic text-black leading-none">24 Jam</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-black">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase text-gray-300 tracking-widest italic">Akses</p>
                <p className="text-[10px] font-black uppercase italic text-black leading-none">Smart Lock</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. UNIT KAMAR LIST */}
        <div className="mt-10 space-y-6">
          <h2 className="text-xs font-black uppercase italic tracking-[0.2em] text-gray-300 px-2 flex items-center gap-2">
            <LayoutGrid size={16} /> Pilih Unit Kamar
          </h2>

          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Pintu {room.room_number}</h3>
                  
                  {/* --- TAMPILAN FASILITAS UNIT --- */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {room.amenities?.length > 0 ? (
                      room.amenities.map((item) => (
                        <div key={item} className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                          <span className="text-black">{amenityIcons[item] || <CheckCircle2 size={14} />}</span>
                          <span className="text-[8px] font-bold uppercase text-gray-500 italic">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[8px] text-gray-300 italic uppercase">Fasilitas Standar Aktif</p>
                    )}
                  </div>
                </div>
                
                {/* --- PERBAIKAN DI SINI: Navigasi hanya mengirim room.id --- */}
                <Button 
                  onClick={() => navigate(`/booking/${room.id}`)}
                  className="bg-black hover:bg-gray-800 text-white rounded-2xl h-12 px-8 font-black uppercase italic text-[10px] tracking-widest shadow-lg active:scale-95 transition-all shrink-0"
                >
                  Pesan Unit
                </Button>
              </div>

              {/* 4. GALLERY FOTO PER UNIT */}
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                  <ImageIcon size={12} /> Galeri Interior Kamar
                </p>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {room.room_photos?.length > 0 ? (
                    room.room_photos.map((url, i) => (
                      <div key={i} className="relative shrink-0">
                        <img 
                          src={url} 
                          className="w-56 h-56 rounded-[32px] object-cover border border-gray-50 shadow-sm" 
                          alt={`Interior ${room.room_number}`} 
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-12 bg-gray-50 rounded-[40px] flex items-center justify-center border-2 border-dashed border-gray-100">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Belum ada foto</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
