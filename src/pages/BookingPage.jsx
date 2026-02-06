import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

import StepIndicator from '@/components/booking/StepIndicator';
import LocationStep from '@/components/booking/LocationStep';
import DateStep from '@/components/booking/DateStep';
import TimeStep from '@/components/booking/TimeStep';
import DurationStep from '@/components/booking/DurationStep';
import SummaryStep from '@/components/booking/SummaryStep';

const BookingPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [propertyData, setPropertyData] = useState(null);
  
  const [bookingData, setBookingData] = useState({
    propertyId: '', roomId: id, location: '', checkInDate: '', startTime: '', duration: null, totalPrice: 0
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (!id) throw new Error("ID Kamar tidak ditemukan");
        
        const { data: rm, error: rmError } = await supabase.from('rooms').select('*').eq('id', id).single();
        if (rmError || !rm) throw new Error("Data kamar tidak ditemukan");
        
        // Debug untuk melihat data mentah dari DB
        console.log("RAW ROOM DATA FROM DB:", rm);
        setRoomData(rm);

        const { data: prop, error: propError } = await supabase.from('properties').select('*').eq('id', rm.property_id).single();
        if (propError || !prop) throw new Error("Data properti tidak ditemukan");
        
        setPropertyData(prop);
        setBookingData(prev => ({ ...prev, propertyId: prop.id, location: prop.address }));
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: err.message, variant: "destructive" });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, navigate, toast]);

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);
  const updateData = (newData) => setBookingData(prev => ({ ...prev, ...newData }));

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <LocationStep data={bookingData} onNext={nextStep} property={propertyData} />;
      case 2: return <DateStep data={bookingData} onUpdate={updateData} onNext={nextStep} onPrev={prevStep} />;
      case 3: return <TimeStep data={bookingData} onUpdate={updateData} onNext={nextStep} onPrev={prevStep} />;
      case 4: 
        return (
          <DurationStep 
            pricingPlan={roomData?.pricing_plan} // Mengirim kolom pricing_plan
            selectedDuration={bookingData.duration}
            onSelect={(val) => {
              updateData({ duration: val, totalPrice: val.price });
              nextStep();
            }}
            onPrev={prevStep} 
          />
        );
      case 5: return <SummaryStep data={bookingData} room={roomData} property={propertyData} onPrev={prevStep} />;
      default: return null;
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-black" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-10 font-sans">
      <div className="bg-white border-b sticky top-0 z-50 px-6 py-5 flex items-center gap-4 shadow-sm">
        <button onClick={() => currentStep === 1 ? navigate(-1) : prevStep()} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-sm font-black uppercase italic tracking-tighter leading-none">Booking Process</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
             Pintu {roomData?.room_number || '-'}
          </p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 mt-8">
        <StepIndicator currentStep={currentStep} totalSteps={5} />
        <div className="mt-8">{renderStep()}</div>
      </div>
    </div>
  );
};

export default BookingPage;
