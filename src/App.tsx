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
import { MasterLogin } from './pages/MasterLogin';
import { MasterLayout } from './components/MasterLayout';
import { MasterDashboard } from './pages/MasterDashboard';
import { MasterLandlords } from './pages/MasterLandlords';
import { AdminMediaManager } from './pages/AdminMediaManager';
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
          
          <Route path="/system-core" element={<MasterLogin />} />
          
          <Route path="/system-core" element={<MasterLayout />}>
            <Route path="dashboard" element={<MasterDashboard />} />
            <Route path="hero" element={<AdminMediaManager />} />
            <Route path="landlords" element={<MasterLandlords />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
