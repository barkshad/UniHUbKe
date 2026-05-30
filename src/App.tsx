/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { Home } from './pages/public/HomePage';
import { ListingsPage } from './pages/public/ListingsPage';
import { PropertyDetailsPage } from './pages/public/PropertyDetailsPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { LegalPage } from './pages/public/LegalPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { HostelsPage } from './pages/public/HostelsPage';
import { PublicLayout } from './components/layouts/PublicLayout';

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './components/layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminPropertiesPage } from './pages/admin/AdminPropertiesPage';
import { AdminPropertyForm } from './pages/admin/AdminPropertyForm';
import { AdminAgentsPage } from './pages/admin/AdminAgentsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminCMSPage } from './pages/admin/AdminCMSPage';
import { SeederPage } from './pages/admin/SeederPage';
import { ProtectedRoute } from './components/ProtectedRoute';

import { AdminUniversitiesPage } from './pages/admin/AdminUniversitiesPage';
import { AdminUniversityForm } from './pages/admin/AdminUniversityForm';
import { AdminHostelsPage } from './pages/admin/AdminHostelsPage';
import { AdminHostelForm } from './pages/admin/AdminHostelForm';

import { AuthProvider } from './context/AuthContext';
import { getSiteSettings } from './services/firestore';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import Lenis from '@studio-freight/lenis';

export default function App() {
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    // Dynamic Theme Injector
    const loadTheme = async () => {
      try {
        const settings = await getSiteSettings();
        if (settings?.theme) {
          const root = document.documentElement;
          if (settings.theme.primaryColor) root.style.setProperty('--color-brand-500', settings.theme.primaryColor);
          if (settings.theme.backgroundColor) root.style.setProperty('--color-surface-900', settings.theme.backgroundColor);
          if (settings.theme.surfaceColor) root.style.setProperty('--color-surface-800', settings.theme.surfaceColor);
          if (settings.theme.fontFamily) root.style.setProperty('--CMS-font-family', `"${settings.theme.fontFamily}", sans-serif`);
          if (settings.theme.borderRadius) root.style.setProperty('--CMS-border-radius', settings.theme.borderRadius);
        }
      } catch (err) {
        console.error("Failed to load theme", err);
      } finally {
        setThemeLoaded(true);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="listings" element={<ListingsPage />} />
            <Route path="properties/:id" element={<PropertyDetailsPage />} />
            <Route path="hostels" element={<HostelsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy" element={<LegalPage type="privacy" />} />
            <Route path="terms" element={<LegalPage type="terms" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="properties" element={<AdminPropertiesPage />} />
            <Route path="properties/new" element={<AdminPropertyForm />} />
            <Route path="properties/:id" element={<AdminPropertyForm />} />
            <Route path="universities" element={<AdminUniversitiesPage />} />
            <Route path="universities/new" element={<AdminUniversityForm />} />
            <Route path="universities/:id" element={<AdminUniversityForm />} />
            <Route path="hostels" element={<AdminHostelsPage />} />
            <Route path="hostels/new" element={<AdminHostelForm />} />
            <Route path="hostels/:id" element={<AdminHostelForm />} />
            <Route path="agents" element={<AdminAgentsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="cms" element={<AdminCMSPage />} />
            <Route path="seed" element={<SeederPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

