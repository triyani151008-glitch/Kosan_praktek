import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DateStep = ({ data, onUpdate, onNext, onPrev }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2 mb-6">
          <CalendarIcon size={18} /> Pilih Tanggal Masuk
        </h3>
        
        <Input 
          type="date" 
          min={new Date().toISOString().split('T')[0]}
          className="h-16 rounded-[24px] border-gray-100 bg-gray-50 px-6 font-black italic text-sm focus:ring-black"
          value={data.checkInDate}
          onChange={(e) => onUpdate({ checkInDate: e.target.value })}
        />
        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-4 ml-2 italic">
          * Akses pintu hanya aktif pada tanggal yang Anda pilih.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={onPrev} variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase italic text-[10px] tracking-widest">Kembali</Button>
        <Button 
          onClick={onNext} 
          disabled={!data.checkInDate}
          className="flex-[2] bg-black text-white h-14 rounded-2xl font-black uppercase italic text-[10px] tracking-widest shadow-xl"
        >
          Lanjut ke Jam
        </Button>
      </div>
    </div>
  );
};

export default DateStep;
