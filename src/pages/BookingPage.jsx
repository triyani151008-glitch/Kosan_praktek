import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Import Komponen Stepper
import StepIndicator from '@/components/booking/StepIndicator';
import LocationStep from '@/components/booking/LocationStep';
import DateStep from '@/components/booking/DateStep';
import TimeStep from '@/components/booking/TimeStep';
import DurationStep from '@/components/booking/DurationStep';
import SummaryStep from '@/components/booking/SummaryStep';

const BookingPage = () => {
  // PERBAIKAN 1: Ambil 'id' dari URL (ini adalah room_id)
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { toast } = useToast();

  // 1. STATE MANAGEMENT
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Data Master
  const [roomData, setRoomData] = useState(null);
  const [propertyData, setPropertyData] = useState(null);
  
  // Data Pesanan Terpusat
  const [bookingData, setBookingData] = useState({
    propertyId: '', // Akan diisi setelah fetch
    roomId: id,     // Diisi dari URL
    location: '',
    checkInDate: '',
    startTime: '',
    duration: null, 
    totalPrice: 0
  });

  // PERBAIKAN 2: Fetch Data Berantai (Room -> Property)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (!id) throw new Error("ID Kamar tidak ditemukan");

        // A. Ambil Data Kamar dulu
        const { data: rm, error: rmError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', id)
          .single();
        
        if (rmError || !rm) throw new Error("Data kamar tidak ditemukan");
        setRoomData(rm);

        // B. Ambil Data Properti berdasarkan property_id dari kamar
        const { data: prop, error: propError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', rm.property_id)
          .single();

        if (propError || !prop) throw new Error("Data properti tidak ditemukan");
        setPropertyData(prop);

        // C. Update State Booking Awal
        setBookingData(prev => ({ 
          ...prev, 
          propertyId: prop.id,
          location: prop.address 
        }));

      } catch (err) {
        console.error(err);
        toast({
            title: "Error",
            description: "Gagal memuat data booking. Silakan coba lagi.",
            variant: "destructive"
        });
        navigate(-1); // Kembali jika error
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, navigate, toast]);

  // 2. NAVIGASI STEPPER
  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const updateData = (newData) => {
    setBookingData(prev => ({ ...prev, ...newData }));
  };

  // 3. RENDER LOGIC PER STEP
  const renderStep = () => {
    switch (currentStep) {
      case 1: 
        return <LocationStep data={bookingData} onNext={nextStep} property={propertyData} />;
      case 2: 
        return <DateStep data={bookingData} onUpdate={updateData} onNext={nextStep} onPrev={prevStep} />;
      case 3: 
        return <TimeStep data={bookingData} onUpdate={updateData} onNext={nextStep} onPrev={prevStep} />;
      case 4: 
        // Mengirim pricingPlan dari roomData ke DurationStep
        return <DurationStep 
          data={bookingData} 
          pricingPlan={roomData?.pricing_plan} 
          onUpdate={updateData} 
          onNext={nextStep} 
          onPrev={prevStep} 
        />;
      case 5: 
        return <SummaryStep 
          data={bookingData} 
          room={roomData} 
          property={propertyData} 
          onPrev={prevStep} 
        />;
      default:
        return null;
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-black" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-10 font-sans">
      {/* Header Sticky */}
      <div className="bg-white border-b sticky top-0 z-50 px-6 py-5 flex items-center gap-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-sm font-black uppercase italic tracking-tighter leading-none">Booking Process</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
             {/* Safe access menggunakan optional chaining */}
             Pintu {roomData?.room_number || '-'}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 mt-8">
        {/* Indikator Langkah Visual */}
        <StepIndicator currentStep={currentStep} totalSteps={5} />

        {/* Konten Langkah yang Aktif */}
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
