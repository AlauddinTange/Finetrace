import { Routes, Route, Navigate } from 'react-router-dom';
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Alerts       from './pages/Alerts';
import AlertDetail  from './pages/AlertDetail';
import Cases        from './pages/Cases';
import Graph        from './pages/Graph';
import Benchmark    from './pages/Benchmark';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard"    element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/alerts"       element={<RequireAuth><Alerts /></RequireAuth>} />
      <Route path="/alerts/:id"   element={<RequireAuth><AlertDetail /></RequireAuth>} />
      <Route path="/cases"        element={<RequireAuth><Cases /></RequireAuth>} />
      <Route path="/graph"        element={<RequireAuth><Graph /></RequireAuth>} />
      <Route path="/benchmark"    element={<RequireAuth><Benchmark /></RequireAuth>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}