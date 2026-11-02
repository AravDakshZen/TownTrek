import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DatabaseStatusBanner } from './components/DatabaseStatusBanner';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { EntertainmentPage } from './pages/EntertainmentPage';
import { EventsPage } from './pages/EventsPage';
import { TouristAttractionsPage } from './pages/TouristAttractionsPage';
import { DiningShoppingPage } from './pages/DiningShoppingPage';
import { EmergencyServicesPage } from './pages/EmergencyServicesPage';
import { MyPassesPage } from './pages/MyPassesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // If user is not authenticated, show strictly the Sign In / Register flow without any footer or extra discovery section below
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center">
        <ScrollToTop />
        <DatabaseStatusBanner />
        <main className="flex-1 flex items-center justify-center p-4">
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<LoginPage />} />
          </Routes>
        </main>
      </div>
    );
  }

  // Once signed in, access the full TownTrek app with light theme and compact footer
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <ScrollToTop />
      <DatabaseStatusBanner />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/entertainment" element={<EntertainmentPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/attractions" element={<TouristAttractionsPage />} />
          <Route path="/dining" element={<DiningShoppingPage />} />
          <Route path="/emergency" element={<EmergencyServicesPage />} />
          <Route path="/passes" element={<MyPassesPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};
