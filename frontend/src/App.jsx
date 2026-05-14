import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SitesPage from './pages/SitesPage';
import NewSitePage from './pages/NewSitePage';
import SiteDetailsPage from './pages/SiteDetailsPage';
import Tool1Page from './pages/Tool1Page';
import Tool2Page from './pages/Tool2Page';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Protected app routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<SitesPage />} />
              <Route path="/sites/new" element={<NewSitePage />} />
              <Route path="/sites/:id" element={<SiteDetailsPage />} />
              <Route path="/sites/:id/tool/1" element={<Tool1Page />} />
              <Route path="/sites/:id/tool/2" element={<Tool2Page />} />
              <Route path="/dashboard" element={<SitesPage />} />
              <Route path="/assessments" element={<SitesPage />} />
              <Route path="/reports" element={<SitesPage />} />
              <Route path="/actions" element={<SitesPage />} />
              <Route path="/library" element={<SitesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
