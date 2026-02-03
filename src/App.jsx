import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile'; 
import PropertyDetail from '@/pages/PropertyDetail';
import PartnerRegistration from '@/pages/PartnerRegistration'; 
import DashboardMitra from '@/pages/DashboardMitra'; // IMPORT DASHBOARD MITRA

// --- IMPORT HALAMAN BARU ---
import ForgotPassword from '@/pages/ForgotPassword';
import UpdatePassword from '@/pages/UpdatePassword';
// ---------------------------

import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Helmet>
          <title>Kosan - Temukan Hunian Nyaman & Modern di Indonesia</title>
          <meta name="description" content="Platform pemesanan kos dan apartemen dengan standar kualitas tinggi, aman, dan transparan di seluruh Indonesia." />
        </Helmet>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Rute Pendaftaran Mitra Pemilik */}
          <Route path="/register-mitra" element={<PartnerRegistration />} /> 
          
          {/* Rute Dashboard Khusus Pemilik Kos */}
          <Route path="/dashboard-mitra" element={<DashboardMitra />} />

          {/* Rute Dinamis untuk Detail Properti */}
          <Route path="/property/:id" element={<PropertyDetail />} />

          {/* --- RUTE LUPA PASSWORD --- */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
