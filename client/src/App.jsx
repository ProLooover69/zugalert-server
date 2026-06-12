import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Layout from './components/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const ConnectionsPage = lazy(() => import('./pages/ConnectionsPage'));
const AlertPage = lazy(() => import('./pages/AlertPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const DisruptionPage = lazy(() => import('./pages/DisruptionPage'));
const StationPage = lazy(() => import('./pages/StationPage'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/connections" element={<ConnectionsPage />} />
              <Route path="/alert" element={<AlertPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/disruption/:id" element={<DisruptionPage />} />
              <Route path="/station/:id" element={<StationPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
      <SpeedInsights />
      <Analytics />
    </ErrorBoundary>
  );
}

export default App;