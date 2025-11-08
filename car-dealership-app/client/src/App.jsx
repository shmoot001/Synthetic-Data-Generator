import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CarDetailPage from './pages/CarDetailPage.jsx';
import AdminPortal from './pages/AdminPortal.jsx';
import AdminCarForm from './pages/AdminCarForm.jsx';
import { useAuthStore } from './store/useAuthStore.js';
import MainLayout from './layouts/MainLayout.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

export default function App() {
  const loadUser = useAuthStore((state) => state.load);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <MainLayout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cars/:id" element={<CarDetailPage />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route
          path="/admin/cars/new"
          element={
            <ProtectedRoute>
              <AdminCarForm mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cars/:id"
          element={
            <ProtectedRoute>
              <AdminCarForm mode="edit" />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MainLayout>
  );
}
