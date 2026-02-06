import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

// Sesuai dengan BookingPage.jsx, kita gunakan nama prop 'pricingPlan'
const DurationStep = ({ selectedDuration, onSelect, pricingPlan }) => {
  
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  /**
   * PERBAIKAN: Masuk ke dalam properti .plans
   * Sesuai struktur di DB: pricing_plan.hourly.plans
   */
  const processOptions = (type) => {
    // Ambil array plans dari objek hourly atau monthly
    const items = pricingPlan?.[type]?.plans || [];
    
    if (!Array.isArray(items)) return [];
    
    return items
      .filter(opt => opt.active === true && opt.price > 0)
      .map(opt => ({
        ...opt,
        value: opt.duration,
        label: type === 'hourly' ? `${opt.duration} Jam` : `${opt.duration} Bulan`,
        type: type === 'hourly' ? 'hour' : 'month'
      }))
      .sort((a, b) => a.value - b.value);
  };

  const hourlyOptions = processOptions('hourly');
  const monthlyOptions = processOptions('monthly');

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="hourly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hourly">
            <Clock className="w-4 h-4 mr-2"/> Transit / Jam
          </TabsTrigger>
          <TabsTrigger value="monthly">
            <Calendar className="w-4 h-4 mr-2"/> Bulanan
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
                  className="h-16 flex justify-between px-6 border-2"
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
                  className="h-16 flex justify-between px-6 border-2"
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
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-center">
    <AlertCircle className="w-8 h-8 text-slate-300 mb-3" />
    <p className="text-sm text-slate-500 font-medium">{message}</p>
  </div>
);

export default DurationStep;
