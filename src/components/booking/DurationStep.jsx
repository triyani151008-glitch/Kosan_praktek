import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

const DurationStep = ({ selectedDuration, onSelect, propertyData }) => {
  
  // Fungsi Helper: Format mata uang ke Rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  /**
   * PERBAIKAN LOGIKA:
   * 1. Cek sumber data: Bisa dari 'pricing_plan' (raw DB) atau 'tariffs' (jika sudah di-transform).
   * 2. Mapping data: Ubah 'duration' menjadi 'label' dan 'value' agar sesuai UI.
   */
  
  // Ambil raw data dari kolom pricing_plan (atau tariffs sebagai fallback)
  const rawData = propertyData?.pricing_plan || propertyData?.tariffs || {};

  // Helper untuk memproses opsi (Map & Filter)
  const processOptions = (items, type) => {
    if (!Array.isArray(items)) return [];
    
    return items
      .filter(item => item.active === true && item.price > 0) // Filter yang aktif saja
      .map(item => ({
        ...item,
        // Jika tidak ada 'value', pakai 'duration'
        value: item.value || item.duration, 
        // Jika tidak ada 'label', buat label otomatis
        label: item.label || (type === 'hour' ? `${item.duration} Jam` : `${item.duration} Bulan`)
      }))
      .sort((a, b) => a.value - b.value);
  };

  const hourlyOptions = processOptions(rawData.hourly, 'hour');
  const monthlyOptions = processOptions(rawData.monthly, 'month');

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

        {/* Konten Per Jam */}
        <TabsContent value="hourly" className="mt-4">
          {hourlyOptions.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {hourlyOptions.map((opt) => (
                <Button
                  key={`h-${opt.value}`}
                  variant={selectedDuration?.value === opt.value && selectedDuration?.type === 'hour' ? "default" : "outline"}
                  onClick={() => onSelect({ ...opt, type: 'hour' })} // Kirim data lengkap
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

        {/* Konten Bulanan */}
        <TabsContent value="monthly" className="mt-4">
          {monthlyOptions.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {monthlyOptions.map((opt) => (
                <Button
                  key={`m-${opt.value}`}
                  variant={selectedDuration?.value === opt.value && selectedDuration?.type === 'month' ? "default" : "outline"}
                  onClick={() => onSelect({ ...opt, type: 'month' })}
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
