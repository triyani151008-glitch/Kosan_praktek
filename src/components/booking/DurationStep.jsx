import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

const DurationStep = ({ pricingPlan, selectedDuration, onSelect, onPrev }) => {
  
  // Debug log untuk memastikan data sampai ke komponen
  useEffect(() => {
    console.log("DEBUG - Pricing Plan received:", pricingPlan);
  }, [pricingPlan]);

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  /**
   * Mengambil array dari pricingPlan[type].plans
   */
  const getOptions = (type) => {
    // Struktur DB: pricing_plan -> hourly -> plans -> [array]
    const plans = pricingPlan?.[type]?.plans || [];
    
    return plans
      .filter(opt => opt.active === true && opt.price > 0)
      .map(opt => ({
        ...opt,
        value: opt.duration,
        label: type === 'hourly' ? `${opt.duration} Jam` : `${opt.duration} Bulan`,
        type: type === 'hourly' ? 'hour' : 'month'
      }))
      .sort((a, b) => a.value - b.value);
  };

  const hourlyOptions = getOptions('hourly');
  const monthlyOptions = getOptions('monthly');

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Tabs defaultValue="hourly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hourly" className="flex items-center gap-2">
            <Clock size={16} /> Transit / Jam
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <Calendar size={16} /> Bulanan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hourly" className="mt-4">
          {hourlyOptions.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {hourlyOptions.map((opt) => (
                <Button
                  key={`h-${opt.value}`}
                  variant={selectedDuration?.value === opt.value && selectedDuration?.type === 'hour' ? "default" : "outline"}
                  onClick={() => onSelect(opt)}
                  className="h-16 flex justify-between px-6 border-2 transition-all hover:border-black"
                >
                  <span className="font-bold">{opt.label}</span>
                  <span className="font-medium opacity-80">{formatRupiah(opt.price)}</span>
                </Button>
              ))}
            </div>
          ) : (
            <EmptyState message="Mitra belum mengaktifkan tarif per jam untuk unit ini." />
          )}
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          {monthlyOptions.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {monthlyOptions.map((opt) => (
                <Button
                  key={`m-${opt.value}`}
                  variant={selectedDuration?.value === opt.value && selectedDuration?.type === 'month' ? "default" : "outline"}
                  onClick={() => onSelect(opt)}
                  className="h-16 flex justify-between px-6 border-2 transition-all hover:border-black"
                >
                  <span className="font-bold">{opt.label}</span>
                  <span className="font-medium opacity-80">{formatRupiah(opt.price)}</span>
                </Button>
              ))}
            </div>
          ) : (
            <EmptyState message="Layanan bulanan tidak tersedia atau belum diatur oleh mitra." />
          )}
        </TabsContent>
      </Tabs>
      
      <Button variant="ghost" onClick={onPrev} className="w-full text-gray-400 text-xs hover:bg-transparent hover:text-black">
        Kembali ke Pengaturan Jam
      </Button>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 bg-white rounded-2xl border-2 border-dashed border-gray-100 text-center">
    <AlertCircle className="w-10 h-10 text-gray-200 mb-4" />
    <p className="text-sm text-gray-400 font-medium max-w-[200px] leading-relaxed">{message}</p>
  </div>
);

export default DurationStep;
