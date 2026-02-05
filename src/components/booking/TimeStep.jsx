import React from 'react';
import { Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TimeStep = ({ data, onUpdate, onNext, onPrev }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2 mb-6">
          <Clock size={18} /> Tentukan Jam Masuk
        </h3>
        
        <Input 
          type="time" 
          className="h-16 rounded-[24px] border-gray-100 bg-gray-50 px-6 font-black italic text-sm focus:ring-black"
          value={data.startTime}
          onChange={(e) => onUpdate({ startTime: e.target.value })}
        />

        <div className="mt-8 p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex gap-4">
          <Info className="text-blue-500 shrink-0" size={20} />
          <p className="text-[9px] font-bold text-blue-700 leading-relaxed uppercase italic">
            Waktu ini akan disinkronkan dengan Smart Lock. Pastikan Anda tiba sesuai jadwal.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onPrev} variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase italic text-[10px] tracking-widest">Kembali</Button>
        <Button 
          onClick={onNext} 
          disabled={!data.startTime}
          className="flex-[2] bg-black text-white h-14 rounded-2xl font-black uppercase italic text-[10px] tracking-widest shadow-xl"
        >
          Lanjut ke Durasi
        </Button>
      </div>
    </div>
  );
};

export default TimeStep;
