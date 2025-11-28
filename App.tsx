import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MOC from './pages/MOC';
import Scaffolds from './pages/Scaffolds';
import Training from './pages/Training';
import Badge from './pages/Badge';
import MasterData from './pages/MasterData';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-brand-800 flex flex-col items-center justify-center animate-fade-out" style={{ animationDelay: '2s' }}>
      <div className="flex items-center gap-4 mb-4 animate-fade-in">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
          <span className="font-bold text-3xl text-brand-800">H&S</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Management</h1>
      </div>
      <div className="w-48 h-1 bg-brand-700 rounded-full overflow-hidden mt-8">
        <div className="h-full bg-white animate-[width_1.5s_ease-out_forwards]" style={{ width: '0%', animationName: 'loadingBar' }}></div>
      </div>
      <style>{`
        @keyframes loadingBar {
          0% { width: 0% }
          100% { width: 100% }
        }
      `}</style>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-800 border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/master-data" element={
            <ProtectedRoute>
              <Layout><MasterData /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/moc" element={
            <ProtectedRoute>
              <Layout><MOC /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/scaffolds" element={
            <ProtectedRoute>
              <Layout><Scaffolds /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/training" element={
            <ProtectedRoute>
              <Layout><Training /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/badge" element={
            <ProtectedRoute>
              <Layout><Badge /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;