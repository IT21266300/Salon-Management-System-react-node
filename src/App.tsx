import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Administration from './pages/Administration';
import Appointments from './pages/Appointments';
import Customers from './pages/Customers';
import Workstations from './pages/Workstations';
import Suppliers from './pages/Suppliers';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
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
        <Route path="/workstations" element={<Workstations />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Layout>
  );
}

export default App;