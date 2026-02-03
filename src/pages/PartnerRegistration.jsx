import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Home, MapPin, Camera, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const PartnerRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    kosName: '',
    address: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return toast({ variant: "destructive", description: "Format file harus gambar." });
    }
    const localUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(localUrl);
    toast({ title: "Foto Terpilih", description: "Siap diunggah saat pendaftaran dikirim." });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast({ variant: "destructive", description: "Harap pilih foto properti." });

    setLoading(true);
    try {
      // 1. Unggah Foto ke Bucket 'property-images'
      const filePath = `properties/${user.id}/${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, selectedFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      const finalPhotoUrl = urlData.publicUrl;

      // 2. Update Status Mitra di Tabel 'profiles'
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_mitra: true, role: 'mitra' })
        .eq('id', user.id);
      if (profileError) throw profileError;

      // 3. Masukkan Data ke Tabel 'properties' agar muncul di pencarian
      const { error: propertyError } = await supabase
        .from('properties')
        .insert({
          owner_id: user.id,
          name: formData.kosName,
          address: formData.address,
          photo_url: finalPhotoUrl,
          is_active: true
        });
      if (propertyError) throw propertyError;

      toast({ title: "Pendaftaran Berhasil!", description: "Kosan Anda kini aktif di hasil pencarian." });
      navigate('/dashboard-mitra');
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal Mengirim", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-10">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 py-4">
        <div className="container mx-auto max-w-2xl flex items-center gap-4">
          <button onClick={() => navigate('/profile')} className="p-2 hover:bg-gray-50 rounded-xl transition-all active:scale-90">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-black uppercase italic tracking-tighter">Pendaftaran Mitra Pemilik</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black text-white rounded-[20px] flex items-center justify-center mx-auto mb-4 shadow-xl"><Home size={32} /></div>
            <h2 className="text-xl font-black uppercase italic tracking-tight leading-none">Informasi Properti</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 italic">Lengkapi data kos/apartemen Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Nama Kos / Properti</Label>
              <div className="relative">
                <Home className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <Input placeholder="Contoh: Kosan Haurgeulis" className="h-12 pl-12 rounded-xl border-gray-100 bg-white font-medium placeholder:text-gray-200" required value={formData.kosName} onChange={(e) => setFormData({...formData, kosName: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Alamat Lengkap Properti</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <Input placeholder="Haurgeulis, Indramayu, jawa barat." className="h-12 pl-12 rounded-xl border-gray-100 bg-white font-medium placeholder:text-gray-200" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>

            <div className="relative p-1 border-2 border-dashed border-gray-100 rounded-[32px] overflow-hidden bg-gray-50 hover:bg-white transition-all group min-h-[160px] flex items-center justify-center">
              {previewUrl ? (
                <div className="relative w-full h-full p-2 flex flex-col items-center">
                  <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-2xl mb-2 grayscale group-hover:grayscale-0 transition-all" />
                  <div className="flex items-center gap-2 bg-black/5 px-4 py-1.5 rounded-full">
                    <RefreshCw size={12} className="text-gray-500" />
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Ketuk gambar untuk mengganti foto</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 pointer-events-none">
                  <Camera className="text-gray-200 group-hover:text-black mb-2 transition-colors" size={32} />
                  <span className="text-[10px] font-black text-gray-300 group-hover:text-black uppercase tracking-widest italic text-center">Pilih Foto Properti</span>
                </div>
              )}
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} disabled={loading} />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-black text-white rounded-xl h-14 font-black text-[12px] tracking-[0.2em] uppercase mt-4 shadow-xl active:scale-95 transition-all">
              {loading ? <Loader2 className="animate-spin" /> : 'Kirim Pendaftaran'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PartnerRegistration;
