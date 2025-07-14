import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import type { AppDispatch } from './store';
import { useEffect } from 'react';
import { validateTokenAndLoadUser } from './store/authSlice';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Administration from './pages/Administration';
import Appointments from './pages/Appointments';
import Customers from './pages/Customers';
import Services from './pages/Services';
import Workstations from './pages/Workstations';
import Suppliers from './pages/Suppliers';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Profile from './pages/Profile';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loading from './components/common/Loading';


function App() {
  const dispatch: AppDispatch = useDispatch();
  const { isAuthenticated, loading, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Only validate token if one exists in localStorage
    if (token) {
      dispatch(validateTokenAndLoadUser());
    }
  }, [dispatch, token]);

  // Show loading spinner while validating token
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px' 
      }}>
        <Loading variant="page" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <NotificationProvider>
        {/* Show login page if not authenticated */}
        {!isAuthenticated ? (
          <Login />
        ) : (
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route 
                path="/administration" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Administration />
                  </ProtectedRoute>
                } 
              />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/services" element={<Services />} />
              <Route path="/workstations" element={<Workstations />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        )}
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
