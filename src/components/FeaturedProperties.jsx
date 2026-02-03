import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Wifi, Coffee, Wind, Tv, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient'; 
import { useNavigate } from 'react-router-dom'; 

const amenityIcons = {
  'WiFi': Wifi, 'AC': Wind, 'TV': Tv, 'Dapur': Coffee,
  'Parkir': MapPin, 'Laundry': Coffee, 'Security': MapPin, 'Gym': Coffee
};

const FeaturedProperties = ({ onBookNow, searchQuery }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });

        // LOGIKA PENCARIAN: Menggunakan 'address' sesuai schema terbaru
        if (searchQuery && searchQuery.trim() !== '') {
          query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error("Gagal mengambil data properti:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchQuery]);

  // FUNGSI SOLUSI RpNaN: Mencari harga terendah yang aktif
  const getMinPrice = (pricing) => {
    if (!pricing) return 0;
    const activePrices = [];
    
    // Periksa kategori Transit (Hourly), Harian (Daily), dan Bulanan (Monthly)
    ['hourly', 'daily', 'monthly'].forEach(category => {
      if (pricing[category]) {
        Object.values(pricing[category]).forEach(option => {
          if (option.active && option.price > 0) {
            activePrices.push(option.price);
          }
        });
      }
    });

    return activePrices.length > 0 ? Math.min(...activePrices) : 0;
  };

  const handleBookNow = (e, property) => {
    e.stopPropagation(); 
    onBookNow({
      location: property.address,
      propertyName: property.name,
      checkInDate: new Date().toISOString().split('T')[0]
    });
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number || 0);
  };

  return (
    <section id="properties" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none mb-4">
            {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : "Properti Pilihan"}
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
            Hunian modern dengan sistem IoT Smart Lock
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-black w-10 h-10" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm font-bold uppercase italic tracking-widest">
              Kosan tidak ditemukan untuk <span className="text-black">"{searchQuery}"</span>.
            </p>
            <Button variant="outline" className="mt-6 rounded-xl" onClick={() => window.location.reload()}>Lihat Semua</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {properties.map((property, index) => {
              const lowestPrice = getMinPrice(property.pricing_plan);
              
              return (
                <motion.div
                  key={property.id}
                  onClick={() => navigate(`/property/${property.id}`)}
                  className="bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all cursor-pointer border border-gray-100 flex flex-col h-full group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="relative h-64 overflow-hidden">
                    {/* Menggunakan photo_url sesuai database */}
                    <img 
                      alt={property.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105" 
                      src={property.photo_url || "https://images.unsplash.com/photo-1595872018818-97555653a011"} 
                    />
                    <div className="absolute top-5 right-5 bg-black text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic tracking-widest flex items-center gap-1">
                      <Zap size={10} fill="white" /> Smart Lock
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="font-black italic text-xl text-gray-900 mb-2 uppercase tracking-tight leading-none line-clamp-1">
                      {property.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-gray-400 mb-6">
                      <MapPin size={14} className="text-black shrink-0" />
                      <span className="text-[11px] font-bold uppercase italic tracking-wider line-clamp-1">
                        {property.address}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center gap-1">
                        <Star className="text-black fill-black" size={14} />
                        <span className="font-black italic text-sm">{property.rating || 4.8}</span>
                      </div>
                      <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">
                        ({property.reviews || 0} ulasan)
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                      <div>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Mulai dari</p>
                        <p className="text-2xl font-black italic text-black leading-none">
                          {formatRupiah(lowestPrice)}
                          <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">/opsi</span>
                        </p>
                      </div>
                      <Button 
                        onClick={(e) => handleBookNow(e, property)} 
                        className="bg-black hover:bg-gray-800 text-white rounded-2xl h-11 px-6 text-[10px] font-black uppercase italic tracking-widest shadow-lg active:scale-95 transition-all"
                      >
                        Pesan
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
