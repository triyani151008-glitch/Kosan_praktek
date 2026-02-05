import React from 'react';
import { MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LocationStep = ({ property, onNext }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
        <div className="w-16 h-16 bg-black rounded-[24px] flex items-center justify-center text-white mb-6 shadow-xl">
          <MapPin size={32} />
        </div>
        <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-2">Lokasi Unit</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic mb-6">Konfirmasi alamat tujuan pemesanan</p>
        
        <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 mb-6">
          <p className="text-[11px] font-black uppercase italic text-black leading-relaxed">
            {property?.address || "Alamat Properti"}
          </p>
        </div>

        <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-2xl">
          <ShieldCheck size={20} />
          <p className="text-[9px] font-black uppercase italic">Lokasi Terverifikasi Sistem IoT</p>
        </div>
      </div>

      <Button 
        onClick={onNext} 
        className="w-full bg-black text-white h-16 rounded-[24px] font-black uppercase italic text-xs tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        Lanjut ke Tanggal <ArrowRight size={18} />
      </Button>
    </div>
  );
};

export default LocationStep;
