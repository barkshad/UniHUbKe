/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/public/HomePage';
import { ListingsPage } from './pages/public/ListingsPage';
import { PropertyDetailsPage } from './pages/public/PropertyDetailsPage';
import { PublicLayout } from './components/layouts/PublicLayout';

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './components/layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminPropertiesPage } from './pages/admin/AdminPropertiesPage';
import { AdminPropertyForm } from './pages/admin/AdminPropertyForm';
import { AdminAgentsPage } from './pages/admin/AdminAgentsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { SeederPage } from './pages/admin/SeederPage';
import { ProtectedRoute } from './components/ProtectedRoute';

import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

export default function App() {
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
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="listings" element={<ListingsPage />} />
            <Route path="properties/:id" element={<PropertyDetailsPage />} />
          </Route>
          
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="properties" element={<AdminPropertiesPage />} />
            <Route path="properties/new" element={<AdminPropertyForm />} />
            <Route path="properties/:id" element={<AdminPropertyForm />} />
            <Route path="agents" element={<AdminAgentsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="seed" element={<SeederPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

