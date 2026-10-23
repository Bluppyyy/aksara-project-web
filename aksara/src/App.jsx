import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, RequireAuth, RequireRole } from './context/AuthContext.jsx';
import { useAuth } from './context/useAuth';

// Setiap halaman dipecah jadi file JS sendiri (code splitting) dan baru diunduh saat dibuka.
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage.jsx'));
const ExplorePage = lazy(() => import('./pages/ExplorePage.jsx'));
const ExploreResultsPage = lazy(() => import('./pages/ExploreResultsPage.jsx'));
const InsightsPage = lazy(() => import('./pages/InsightsPage.jsx'));
const ResourceDetailPage = lazy(() => import('./pages/ResourceDetailPage.jsx'));
const UploadPage = lazy(() => import('./pages/UploadPage.jsx'));
const CollectionPage = lazy(() => import('./pages/CollectionPage.jsx'));
const CommunityPage = lazy(() => import('./pages/CommunityPage.jsx'));
const InsightDetailPage = lazy(() => import('./pages/InsightDetailPage.jsx'));
const InsightWritePage = lazy(() => import('./pages/InsightWritePage.jsx'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminResources = lazy(() => import('./pages/admin/AdminResources.jsx'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports.jsx'));
const AdminReportDetail = lazy(() => import('./pages/admin/AdminReportDetail.jsx'));
const AdminModeration = lazy(() => import('./pages/admin/AdminModeration.jsx'));
const AdminModerationDetail = lazy(() => import('./pages/admin/AdminModerationDetail.jsx'));
const AdminProfile = lazy(() => import('./pages/admin/AdminAccount.jsx').then((m) => ({ default: m.AdminProfile })));
const AdminSettings = lazy(() => import('./pages/admin/AdminAccount.jsx').then((m) => ({ default: m.AdminSettings })));
const AdminLoginPage = lazy(() => import('./pages/auth/AdminLoginPage.jsx'));

/** Tampilan sementara saat file halaman sedang diunduh */
function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="visually-hidden">Memuat halaman…</span>
    </div>
  );
}

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
  return user && user.role !== 'admin' ? <CommunityPage /> : <LandingPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route
              path="/komunitas"
              element={
                <RequireAuth>
                  <CommunityPage />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/daftar" element={<RegisterPage />} />
            <Route path="/eksplorasi" element={<ExplorePage />} />
            <Route
              path="/eksplorasi/hasil"
              element={
                <RequireAuth notice="Masuk dulu untuk mencari dan memfilter resource.">
                  <ExploreResultsPage />
                </RequireAuth>
              }
            />
            <Route path="/wawasan" element={<InsightsPage />} />
            <Route
              path="/wawasan/tulis"
              element={
                <RequireAuth>
                  <InsightWritePage />
                </RequireAuth>
              }
            />
            <Route
              path="/wawasan/:id"
              element={
                <RequireAuth notice="Masuk dulu untuk membaca artikel wawasan.">
                  <InsightDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="/resource/:id"
              element={
                <RequireAuth notice="Masuk dulu untuk membuka detail resource.">
                  <ResourceDetailPage />
                </RequireAuth>
              }
            />
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
