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
import { AuthProvider, RequireAuth } from './context/AuthContext.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/daftar" element={<RegisterPage />} />
          <Route path="/eksplorasi" element={<ExplorePage />} />
          <Route path="/eksplorasi/hasil" element={<ExploreResultsPage />} />
          <Route path="/wawasan" element={<WawasanPage />} />
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
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
