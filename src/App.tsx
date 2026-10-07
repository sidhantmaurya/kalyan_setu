/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar, Footer } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { FounderPage } from './pages/FounderPage';
import { PeoplePage } from './pages/PeoplePage';
import { ProgressPage } from './pages/ProgressPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage, AdminLoginPage, AuthCallbackPage, WelcomeLoginModal } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPanel } from './pages/AdminPanel';
import { PrivacyPage, TermsPage } from './pages/LegalPages';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <WelcomeLoginModal />
        <div className="min-h-screen flex flex-col bg-[#F5EFE0] text-[#3D3520]">
          <Navbar />
          <main id="main-content" className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/founder" element={<FounderPage />} />
              <Route path="/people" element={<PeoplePage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/messages" element={<AdminPanel />} />
              <Route path="/admin/users" element={<AdminPanel />} />
              <Route path="/admin/subscribers" element={<AdminPanel />} />
              <Route path="/admin/logs" element={<AdminPanel />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
