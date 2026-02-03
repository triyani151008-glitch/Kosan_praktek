import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient'; 
import { useNavigate } from 'react-router-dom'; 

const FeaturedProperties = ({ onBookNow, searchQuery }) => {
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
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchProperties();
  }, [searchQuery]);

  // SOLUSI RpNaN: Mencari harga terendah yang aktif
  const getMinPrice = (pricing) => {
    if (!pricing) return 0;
    const prices = [];
    ['hourly', 'daily', 'monthly'].forEach(cat => {
      if (pricing[cat]) {
        Object.values(pricing[cat]).forEach(opt => {
          if (opt.active && opt.price > 0) prices.push(opt.price);
        });
      }
    });
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {loading ? <Loader2 className="animate-spin mx-auto w-10 h-10" /> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {properties.map((property) => (
              <motion.div key={property.id} onClick={() => navigate(`/property/${property.id}`)} className="bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 flex flex-col h-full group">
                <div className="relative h-64 overflow-hidden">
                  <img src={property.photo_url || "/placeholder.jpg"} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105" alt={property.name} />
                  <div className="absolute top-5 right-5 bg-black text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic flex items-center gap-1"><Zap size={10} /> Smart Lock</div>
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="font-black italic text-xl text-gray-900 mb-2 uppercase tracking-tight">{property.name}</h3>
                  <div className="flex items-center gap-2 text-gray-400 mb-6"><MapPin size={14} className="text-black" /><span className="text-[11px] font-bold uppercase italic tracking-wider line-clamp-1">{property.address}</span></div>

                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                    <div>
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Mulai dari</p>
                      <p className="text-2xl font-black italic text-black leading-none">
                        {formatRupiah(getMinPrice(property.pricing_plan))}
                        <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">/opsi</span>
                      </p>
                    </div>
                    <Button className="bg-black hover:bg-gray-800 text-white rounded-2xl h-11 px-6 text-[10px] font-black uppercase italic shadow-lg active:scale-95 transition-all">Pesan</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
