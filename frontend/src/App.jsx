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
import Tool3Page from './pages/Tool3Page';
import Tool4Page from './pages/Tool4Page';
import Tool6Page from './pages/Tool6Page';
import Tool7Page from './pages/Tool7Page';
import Tool8Page from './pages/Tool8Page';
import Tool10Page from './pages/Tool10Page';
import Tool11Page from './pages/Tool11Page';
import Tool12Page from './pages/Tool12Page';
import ComingSoonPage from './pages/ComingSoonPage';
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
              <Route path="/sites" element={<SitesPage />} />
              <Route path="/sites/new" element={<NewSitePage />} />
              <Route path="/sites/:id" element={<SiteDetailsPage />} />
              <Route path="/sites/:id/tool/1" element={<Tool1Page />} />
              <Route path="/sites/:id/tool/2" element={<Tool2Page />} />
              <Route path="/sites/:id/tool/3" element={<Tool3Page />} />
              <Route path="/sites/:id/tool/4" element={<Tool4Page />} />
              <Route path="/sites/:id/tool/6" element={<Tool6Page />} />
              <Route path="/sites/:id/tool/7" element={<Tool7Page />} />
              <Route path="/sites/:id/tool/8" element={<Tool8Page />} />
              <Route path="/sites/:id/tool/10" element={<Tool10Page />} />
              <Route path="/sites/:id/tool/11" element={<Tool11Page />} />
              <Route path="/sites/:id/tool/12" element={<Tool12Page />} />
              <Route path="/dashboard" element={<ComingSoonPage title="Dashboard" />} />
              <Route path="/assessments" element={<ComingSoonPage title="Assessments" />} />
              <Route path="/reports" element={<ComingSoonPage title="Reports" />} />
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
