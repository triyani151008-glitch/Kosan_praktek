import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Check } from 'lucide-react';
import { supabase } from '../lib/customSupabaseClient';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { toast } from '../components/ui/use-toast';

const DashboardMitra = ({ roomId, onBack }) => {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hourly'); 
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (error) throw error;
        setSelectedRoom(data);
      } catch (err) {
        toast({ title: "Error", description: "Gagal mengambil data kamar.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    if (roomId) fetchRoomData();
  }, [roomId]);

  // AKTIVASI FITUR: Pastikan status 'active' ikut terupdate saat harga diisi
  const handleUpdatePricing = (dur, value) => {
    const numValue = Number(value);
    const currentPricing = selectedRoom.pricing_plan || { hourly: {}, monthly: {} };
    const tabKey = activeTab === 'hourly' ? 'hourly' : 'monthly';
    
    const updatedTabData = { 
      ...currentPricing[tabKey],
      [dur]: {
        price: numValue,
        active: numValue > 0 // FITUR: Otomatis AKTIF jika harga diisi
      }
    };

    setSelectedRoom({
      ...selectedRoom,
      pricing_plan: { ...currentPricing, [tabKey]: updatedTabData }
    });
  };

  const toggleAmenity = (amenityName) => {
    const currentAmenities = selectedRoom.amenities || [];
    const updated = currentAmenities.includes(amenityName)
      ? currentAmenities.filter(a => a !== amenityName)
      : [...currentAmenities, amenityName];
    setSelectedRoom({ ...selectedRoom, amenities: updated });
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          pricing_plan: selectedRoom.pricing_plan,
          amenities: selectedRoom.amenities,
          updated_at: new Date()
        })
        .eq('id', roomId);

      if (error) throw error;
      toast({ title: "Berhasil", description: "Tarif dan fasilitas telah diperbarui." });
    } catch (err) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Sesuai UI Anda */}
      <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1"><ChevronLeft /></button>
          <h1 className="font-bold text-lg text-gray-800 uppercase">EDIT {selectedRoom?.room_number}</h1>
        </div>
        <button onClick={saveChanges} disabled={isSaving} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          {isSaving ? "Menyimpan..." : <><Save size={16} /> SIMPAN</>}
        </button>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <h2 className="text-sm font-bold text-gray-500 mb-4 tracking-widest uppercase">Fasilitas Kamar</h2>
          <div className="grid grid-cols-2 gap-3">
            {['WIFI', 'AC', 'SMART TV', 'KAMAR MANDI DALAM', 'WATER HEATER', 'MEJA KERJA', 'LEMARI PAKAIAN', 'DISPENSER'].map((item) => (
              <button key={item} onClick={() => toggleAmenity(item)} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selectedRoom.amenities?.includes(item) ? 'border-black bg-gray-50 font-bold' : 'border-gray-100 text-gray-400'}`}>
                <span className="text-xs">{item}</span>
                {selectedRoom.amenities?.includes(item) && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <h2 className="text-sm font-bold text-gray-500 mb-4 tracking-widest uppercase">Atur Durasi & Tarif</h2>
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button onClick={() => setActiveTab('hourly')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'hourly' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>TRANSIT (JAM)</button>
            <button onClick={() => setActiveTab('monthly')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'monthly' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>BULANAN</button>
          </div>
          <div className="space-y-4">
            {(activeTab === 'hourly' ? ['1', '2', '3', '4', '5', '6', '12', '24'] : ['1', '2', '3', '6', '12']).map((dur) => (
              <div key={dur} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl">
                <span className="text-sm font-bold w-16">{dur} {activeTab === 'hourly' ? 'JAM' : 'BLN'}</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rp</span>
                  <input
                    type="number"
                    value={selectedRoom.pricing_plan?.[activeTab]?.[dur]?.price || ''}
                    onChange={(e) => handleUpdatePricing(dur, e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-lg py-2 pl-9 pr-4 text-sm font-bold focus:ring-2 focus:ring-black"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMitra;
