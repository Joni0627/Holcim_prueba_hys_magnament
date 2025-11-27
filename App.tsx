import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MOC from './pages/MOC';
import Scaffolds from './pages/Scaffolds';
import Training from './pages/Training';
import Badge from './pages/Badge';
import MasterData from './pages/MasterData';

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

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <SplashScreen onComplete={() => setLoading(false)} />}
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/master-data" element={<MasterData />} />
            <Route path="/moc" element={<MOC />} />
            <Route path="/scaffolds" element={<Scaffolds />} />
            <Route path="/training" element={<Training />} />
            <Route path="/badge" element={<Badge />} />
          </Routes>
        </Layout>
      </HashRouter>
    </>
  );
};

export default App;