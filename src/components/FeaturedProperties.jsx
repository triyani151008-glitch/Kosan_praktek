import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient'; 
import { useNavigate } from 'react-router-dom'; 

const FeaturedProperties = ({ searchQuery }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        let query = supabase.from('properties').select('*').order('created_at', { ascending: false });
        
        if (searchQuery && searchQuery.trim() !== '') {
          query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [searchQuery]);

  // LOGIKA PENCEGAH NaN
  const getMinPrice = (pricing) => {
    if (!pricing) return 0;
    const activePrices = [];
    ['hourly', 'monthly'].forEach(category => {
      if (pricing[category]) {
        Object.values(pricing[category]).forEach(option => {
          if (option.active && option.price > 0) activePrices.push(option.price);
        });
      }
    });
    return activePrices.length > 0 ? Math.min(...activePrices) : 0;
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(number || 0);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-4">
            {searchQuery ? `Hasil: "${searchQuery}"` : "Properti Pilihan"}
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] italic">
            Hunian Modern dengan Akses IoT Smart Lock
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-black w-10 h-10" />
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
                    {/* FOTO ASLI TANPA GRAYSCALE */}
                    <img 
                      src={property.photo_url || "/placeholder.jpg"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
                      alt={property.name} 
                    />
                    <div className="absolute top-5 right-5 bg-black text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic tracking-widest flex items-center gap-1 shadow-lg">
                      <Zap size={10} fill="white" /> Smart Lock
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="font-black italic text-xl text-gray-900 mb-2 uppercase tracking-tight leading-none line-clamp-1">
                      {property.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-gray-400 mb-6">
                      <MapPin size={14} className="text-black shrink-0" />
                      <span className="text-[10px] font-bold uppercase italic tracking-wider line-clamp-1">
                        {property.address}
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
                      <Button className="bg-black hover:bg-gray-800 text-white rounded-2xl h-11 px-6 text-[10px] font-black uppercase italic tracking-widest shadow-lg active:scale-95 transition-all">
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
