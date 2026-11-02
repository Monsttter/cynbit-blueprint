import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';

const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const DiscoveryPage = lazy(() => import('./pages/DiscoveryPage.jsx'));
const ReportPage = lazy(() => import('./pages/ReportPage.jsx'));

export default function App() {
  return <Suspense fallback={<div className="route-loading" role="status">Loading page…</div>}>
    <Routes><Route element={<AppLayout />}>
      <Route index element={<LandingPage />} />
      <Route path="/discover" element={<DiscoveryPage />} />
      <Route path="/blueprint/:reference" element={<ReportPage />} />
      <Route path="*" element={<LandingPage />} />
    </Route></Routes>
  </Suspense>;
}
