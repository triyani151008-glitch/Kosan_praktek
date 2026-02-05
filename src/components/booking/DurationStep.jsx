import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar } from 'lucide-react';

const DurationStep = ({ selectedDuration, onSelect, propertyData }) => {
  // Data ini nantinya berasal dari kolom 'settings' atau 'tariffs' di database Supabase
  // Jika propertyData.tariffs tidak ada, gunakan default (semua aktif)
  const hourlyOptions = propertyData?.tariffs?.hourly || [
    { label: '1 Jam', value: 1, active: true },
    { label: '2 Jam', value: 2, active: true },
    { label: '3 Jam', value: 3, active: true },
    { label: '4 Jam', value: 4, active: true },
    { label: '5 Jam', value: 5, active: true },
    { label: '6 Jam', value: 6, active: true },
    { label: '12 Jam', value: 12, active: true },
    { label: '24 Jam', value: 24, active: true },
  ];

  const monthlyOptions = propertyData?.tariffs?.monthly || [
    { label: '1 Bulan', value: 1, active: true },
    { label: '2 Bulan', value: 2, active: true },
    { label: '3 Bulan', value: 3, active: true },
    { label: '4 Bulan', value: 4, active: true },
    { label: '5 Bulan', value: 5, active: true },
    { label: '6 Bulan', value: 6, active: true },
    { label: '12 Bulan', value: 12, active: true },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hourly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hourly"><Clock className="w-4 h-4 mr-2"/> Per Jam</TabsTrigger>
          <TabsTrigger value="monthly"><Calendar className="w-4 h-4 mr-2"/> Per Bulan</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly" className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            {hourlyOptions.filter(opt => opt.active).map((opt) => (
              <Button
                key={`h-${opt.value}`}
                variant={selectedDuration?.value === opt.value && selectedDuration?.type === 'hour' ? "default" : "outline"}
                onClick={() => onSelect({ ...opt, type: 'hour' })}
                className="h-14"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            {monthlyOptions.filter(opt => opt.active).map((opt) => (
              <Button
                key={`m-${opt.value}`}
                variant={selectedDuration?.value === opt.value && selectedDuration?.type === 'month' ? "default" : "outline"}
                onClick={() => onSelect({ ...opt, type: 'month' })}
                className="h-14"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DurationStep;
