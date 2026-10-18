import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import ExploreResultsPage from './pages/ExploreResultsPage.jsx';
import WawasanPage from './pages/WawasanPage.jsx';
import ResourceDetailPage from './pages/ResourceDetailPage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import CollectionPage from './pages/CollectionPage.jsx';
import KomunitasPage from './pages/KomunitasPage.jsx';
import WawasanDetailPage from './pages/WawasanDetailPage.jsx';
import UnggahWawasanPage from './pages/UnggahWawasanPage.jsx';
import { AuthProvider, RequireAuth, RequireRole, useAuth } from './context/AuthContext.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminResources from './pages/admin/AdminResources.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminReportDetail from './pages/admin/AdminReportDetail.jsx';
import AdminModeration from './pages/admin/AdminModeration.jsx';
import AdminModerationDetail from './pages/admin/AdminModerationDetail.jsx';
import { AdminProfile, AdminSettings } from './pages/admin/AdminAccount.jsx';
import AdminLoginPage from './pages/auth/AdminLoginPage.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Beranda: tamu melihat Landing Page, mahasiswa yang sudah login melihat Aktivitas Komunitas (sesuai Figma) */
function HomeRoute() {
  const user = useAuth();
  return user && user.role !== 'admin' ? <KomunitasPage /> : <LandingPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route
            path="/komunitas"
            element={
              <RequireAuth>
                <KomunitasPage />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/daftar" element={<RegisterPage />} />
          <Route path="/eksplorasi" element={<ExplorePage />} />
          <Route path="/eksplorasi/hasil" element={<ExploreResultsPage />} />
          <Route path="/wawasan" element={<WawasanPage />} />
          <Route
            path="/wawasan/tulis"
            element={
              <RequireAuth>
                <UnggahWawasanPage />
              </RequireAuth>
            }
          />
          <Route path="/wawasan/:id" element={<WawasanDetailPage />} />
          <Route path="/resource/:id" element={<ResourceDetailPage />} />
          <Route
            path="/unggah"
            element={
              <RequireAuth>
                <UploadPage />
              </RequireAuth>
            }
          />
          <Route
            path="/koleksi"
            element={
              <RequireAuth>
                <CollectionPage />
              </RequireAuth>
            }
          />
          {/* ---------- Area admin: satu web, beda rute ---------- */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <RequireRole role="admin" loginPath="/admin/login">
                <AdminLayout />
              </RequireRole>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="resource" element={<AdminResources />} />
            <Route path="laporan" element={<AdminReports />} />
            <Route path="laporan/:id" element={<AdminReportDetail />} />
            <Route path="moderasi" element={<AdminModeration />} />
            <Route path="moderasi/:id" element={<AdminModerationDetail />} />
            <Route path="profil" element={<AdminProfile />} />
            <Route path="pengaturan" element={<AdminSettings />} />
            <Route path="*" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<LandingPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
