import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

const DurationStep = ({ selectedDuration, onSelect, propertyData }) => {
  
  // Helper untuk format Rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Ambil data, filter yang aktif, lalu urutkan dari durasi terkecil -> terbesar
  // Kita asumsikan struktur data tarif di DB memiliki field: { value, label, active, price }
  
  const hourlyOptions = (propertyData?.tariffs?.hourly || [
    { label: '1 Jam', value: 1, active: true, price: 0 }, 
    // ... default fallback (sebaiknya dihandle di parent/fetching agar price ada)
  ])
  .filter(opt => opt.active)
  .sort((a, b) => a.value - b.value);

  const monthlyOptions = (propertyData?.tariffs?.monthly || [])
  .filter(opt => opt.active)
  .sort((a, b) => a.value - b.value);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hourly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hourly"><Clock className="w-4 h-4 mr-2"/> Transit / Jam</TabsTrigger>
          <TabsTrigger value="monthly"><Calendar className="w-4 h-4 mr-2"/> Bulanan</TabsTrigger>
        </TabsList>

        {/* --- KONTEN PER JAM --- */}
        <TabsContent value="hourly" className="mt-4">
          {hourlyOptions.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {hourlyOptions.map((opt) => (
                <Button
                  key={`h-${opt.value}`}
                  // Logic variant: Jika terpilih, solid. Jika tidak, outline.
                  variant={selectedDuration?.value === opt.value && selectedDuration?.type === 'hour' ? "default" : "outline"}
                  onClick={() => onSelect({ ...opt, type: 'hour' })}
                  className="h-auto py-3 flex flex-col items-center justify-center gap-1"
                >
                  <span className="font-semibold text-sm">{opt.label}</span>
                  {/* Tampilkan harga jika ada (lebih besar dari 0) */}
                  {opt.price > 0 && (
                    <span className={`text-xs ${selectedDuration?.value === opt.value && selectedDuration?.type === 'hour' ? 'text-white/90' : 'text-muted-foreground'}`}>
                      {formatRupiah(opt.price)}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          ) : (
            <EmptyState message="Layanan per jam tidak tersedia untuk unit ini." />
          )}
        </TabsContent>

        {/* --- KONTEN PER BULAN --- */}
        <TabsContent value="monthly" className="mt-4">
          {monthlyOptions.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {monthlyOptions.map((opt) => (
                <Button
                  key={`m-${opt.value}`}
                  variant={selectedDuration?.value === opt.value && selectedDuration?.type === 'month' ? "default" : "outline"}
                  onClick={() => onSelect({ ...opt, type: 'month' })}
                  className="h-auto py-3 flex flex-col items-center justify-center gap-1"
                >
                  <span className="font-semibold text-sm">{opt.label}</span>
                  {opt.price > 0 && (
                    <span className={`text-xs ${selectedDuration?.value === opt.value && selectedDuration?.type === 'month' ? 'text-white/90' : 'text-muted-foreground'}`}>
                      {formatRupiah(opt.price)}
                    </span>
                  )}
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

// Komponen kecil untuk tampilan kosong agar rapi
const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
    <p className="text-sm">{message}</p>
  </div>
);

export default DurationStep;
