/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Listings } from './pages/Listings';
import { ListingDetails } from './pages/ListingDetails';
import { LandlordDashboard } from './pages/LandlordDashboard';
import { AuthProvider } from './components/AuthProvider';
import { AdminLayout } from './components/AdminLayout';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminMediaManager } from './pages/AdminMediaManager';
import { AdminPlaceholder } from './pages/AdminPlaceholder';
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
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="listings" element={<Listings />} />
            <Route path="listings/:id" element={<ListingDetails />} />
            <Route path="dashboard" element={<LandlordDashboard />} />
          </Route>
          
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="media" element={<AdminMediaManager />} />
            <Route path="listings" element={<AdminPlaceholder title="Listings CMS" />} />
            <Route path="users" element={<AdminPlaceholder title="User Management" />} />
            <Route path="content" element={<AdminPlaceholder title="Site Content" />} />
            <Route path="settings" element={<AdminPlaceholder title="Platform Settings" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
