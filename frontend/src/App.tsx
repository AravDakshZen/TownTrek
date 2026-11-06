import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { CityProvider } from './context/CityContext';
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
import { OnboardingPage } from './pages/OnboardingPage';
import { UserProfilePage } from './pages/UserProfilePage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-300">
      <ScrollToTop />
      <DatabaseStatusBanner />
      
      {/* Liquid Glass Navbar */}
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
          <Route path="/passes" element={isAuthenticated ? <MyPassesPage /> : <Navigate to="/auth" replace />} />
          <Route path="/profile" element={isAuthenticated ? <UserProfilePage /> : <Navigate to="/auth" replace />} />
          
          {/* Auth & Onboarding Flow: Redirect to Home if already authenticated */}
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/login" element={<Navigate to={isAuthenticated ? "/" : "/auth"} replace />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
          <Route path="/onboarding" element={isAuthenticated ? <Navigate to="/" replace /> : <OnboardingPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Interactive Sticker Slap Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CityProvider>
          <ToastProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </ToastProvider>
        </CityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
