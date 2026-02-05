import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

const DurationStep = ({ selectedDuration, onSelect, propertyData }) => {
  
  // Format mata uang sesuai tampilan di video
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Mengambil data tarif sesuai spesifikasi: 1, 2, 3, 4, 5, 6, 12, dan 24 jam
  const hourlyOptions = (propertyData?.tariffs?.hourly || [])
    .filter(opt => opt.active)
    .sort((a, b) => a.value - b.value);

  const monthlyOptions = (propertyData?.tariffs?.monthly || [])
    .filter(opt => opt.active)
    .sort((a, b) => a.value - b.value);

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in duration-500">
      <Tabs defaultValue="hourly" className="w-full">
        {/* Tab List dengan styling clean sesuai video */}
        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 p-1">
          <TabsTrigger value="hourly" className="data-[state=active]:bg-white">
            <Clock className="w-4 h-4 mr-2 text-slate-600"/> 
            <span className="font-medium text-xs md:text-sm uppercase tracking-tight">Transit / Jam</span>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-white">
            <Calendar className="w-4 h-4 mr-2 text-slate-600"/> 
            <span className="font-medium text-xs md:text-sm uppercase tracking-tight">Bulanan</span>
          </TabsTrigger>
        </TabsList>

        {/* Konten Per Jam */}
        <TabsContent value="hourly" className="mt-6">
          {hourlyOptions.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {hourlyOptions.map((opt) => (
                <Button
                  key={`h-${opt.value}`}
                  variant={selectedDuration?.value === opt.value && selectedDuration?.type === 'hour' ? "default" : "outline"}
                  onClick={() => onSelect({ ...opt, type: 'hour' })}
                  className={`h-16 flex items-center justify-between px-6 transition-all border-2 ${
                    selectedDuration?.value === opt.value && selectedDuration?.type === 'hour' 
                    ? 'border-primary ring-1 ring-primary/20' 
                    : 'border-slate-100'
                  }`}
                >
                  <span className="font-bold text-base">{opt.label}</span>
                  <span className={`text-sm font-medium ${
                    selectedDuration?.value === opt.value && selectedDuration?.type === 'hour' 
                    ? 'text-white' 
                    : 'text-slate-500'
                  }`}>
                    {formatRupiah(opt.price)}
                  </span>
                </Button>
              ))}
            </div>
          ) : (
            <EmptyState message="Layanan per jam tidak tersedia untuk unit ini." />
          )}
        </TabsContent>

        {/* Konten Bulanan */}
        <TabsContent value="monthly" className="mt-6">
          {monthlyOptions.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {monthlyOptions.map((opt) => (
                <Button
                  key={`m-${opt.value}`}
                  variant={selectedDuration?.value === opt.value && selectedDuration?.type === 'month' ? "default" : "outline"}
                  onClick={() => onSelect({ ...opt, type: 'month' })}
                  className="h-16 flex items-center justify-between px-6 border-2 border-slate-100"
                >
                  <span className="font-bold text-base">{opt.label}</span>
                  <span className="text-sm font-medium text-slate-500">
                    {formatRupiah(opt.price)}
                  </span>
                </Button>
              ))}
            </div>
          ) : (
            <EmptyState message="Layanan bulanan tidak tersedia untuk unit ini." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Komponen Empty State yang persis dengan menit 00:41 di video
const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
    <div className="bg-white p-3 rounded-full shadow-sm mb-3">
      <AlertCircle className="w-6 h-6 text-slate-400" />
    </div>
    <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-[200px]">
      {message}
    </p>
  </div>
);

export default DurationStep;
