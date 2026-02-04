import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, MapPin, Star, ShieldCheck, 
  Zap, Loader2, Info, LayoutGrid, Image as ImageIcon 
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);

  useEffect(() => { fetchDetails(); }, [id]);

  const fetchDetails = async () => {
    try {
      // Ambil Data Properti
      const { data: prop } = await supabase.from('properties').select('*').eq('id', id).single();
      if (prop) {
        setProperty(prop);
        // Ambil Daftar Kamar/Pintu
        const { data: rm } = await supabase.from('rooms').select('*').eq('property_id', id).order('room_number');
        setRooms(rm || []);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-black" /></div>;

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20 font-sans">
      {/* 1. HERO SECTION (Main Property Image) */}
      <div className="relative h-[45vh] overflow-hidden">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-8 left-6 z-20 bg-white/20 backdrop-blur-xl p-3 rounded-2xl text-white hover:bg-white hover:text-black transition-all shadow-2xl"
        >
          <ChevronLeft size={24} />
        </button>
        <img 
          src={property?.photo_url || "/placeholder.jpg"} 
          className="w-full h-full object-cover grayscale brightness-75" 
          alt={property?.name} 
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F9F9F9] to-transparent" />
      </div>

      {/* 2. PROPERTY INFO CARD */}
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
              <p className="text-[9px] font-black uppercase italic leading-tight text-gray-400">Security<br/><span className="text-black">24 Hours</span></p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-black">
                <Zap size={20} />
              </div>
              <p className="text-[9px] font-black uppercase italic leading-tight text-gray-400">Access<br/><span className="text-black">Smart Lock</span></p>
            </div>
          </div>
        </div>

        {/* 3. ROOM UNITS LIST (LIST PINTU) */}
        <div className="mt-10 space-y-6">
          <h2 className="text-xs font-black uppercase italic tracking-[0.2em] text-gray-300 px-2 flex items-center gap-2">
            <LayoutGrid size={16} /> Pilih Unit Kamar
          </h2>

          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6 group">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Pintu {room.room_number}</h3>
                  <p className="text-[9px] font-bold text-gray-300 mt-2 uppercase flex items-center gap-1 italic">
                    <Info size={12} className="text-black" /> Fasilitas Lengkap & Nyaman
                  </p>
                </div>
                {/* TOMBOL KE HALAMAN BOOKING SEPERTI REKAM LAYAR */}
                <Button 
                  onClick={() => navigate(`/booking/${property.id}/${room.id}`)}
                  className="bg-black hover:bg-gray-800 text-white rounded-2xl h-12 px-8 font-black uppercase italic text-[10px] tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  Pesan Unit
                </Button>
              </div>

              {/* GALLERY FOTO PER KAMAR */}
              <div className="space-y-3">
                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={12} /> Detail Fasilitas Kamar
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {room.room_photos?.length > 0 ? (
                    room.room_photos.map((url, i) => (
                      <div key={i} className="relative shrink-0">
                        <img 
                          src={url} 
                          className="w-48 h-48 rounded-[32px] object-cover border border-gray-50 hover:scale-105 transition-all duration-500" 
                          alt={`Fasilitas ${room.room_number}`} 
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-10 bg-gray-50 rounded-[32px] flex items-center justify-center border-2 border-dashed border-gray-100">
                      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Belum Ada Foto</p>
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
