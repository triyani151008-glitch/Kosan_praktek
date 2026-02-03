import React, { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PopularCities from '@/components/PopularCities';
import FeaturedProperties from '@/components/FeaturedProperties';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import BookingFlow from '@/components/BookingFlow';
import BottomNav from '@/components/BottomNav';
import AuthModal from '@/components/AuthModal';

const Home = () => {
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [initialSearchData, setInitialSearchData] = useState(null);
  
  // State untuk menangkap kata kunci dari Hero
  const [searchQuery, setSearchQuery] = useState('');

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState('login');

  const handleStartBooking = (searchData) => {
    setInitialSearchData(searchData);
    setShowBookingFlow(true);
  };

  const handleCloseBooking = () => {
    setShowBookingFlow(false);
    setInitialSearchData(null);
  };

  const openAuthModal = (view = 'login') => {
    setAuthInitialView(view);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <Header onLoginClick={() => openAuthModal('login')} onSignupClick={() => openAuthModal('signup')} />
      
      {/* Hero mengirimkan query ke state searchQuery */}
      <Hero onSearch={(query) => setSearchQuery(query)} />
      
      <PopularCities />
      
      {/* FeaturedProperties melakukan filter berdasarkan searchQuery */}
      <FeaturedProperties 
        searchQuery={searchQuery} 
        onBookNow={handleStartBooking} 
      />
      
      <Testimonials />
      <Footer />
      <BottomNav onAccountClick={() => openAuthModal('login')} />
      
      {showBookingFlow && (
        <BookingFlow initialData={initialSearchData} onClose={handleCloseBooking} />
      )}
      
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialView={authInitialView} />
    </div>
  );
};

export default Home;
