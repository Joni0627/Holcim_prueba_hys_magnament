
import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  LogOut,
  Bell,
  Database,
  Loader2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children?: React.ReactNode;
}

// Helper to extract real image URL from Google Redirects
const getCleanImageSrc = (url?: string | null) => {
  if (!url) return undefined;
  if (url.includes('google.com/imgres')) {
    try {
      const match = url.match(/[?&]imgurl=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch (e) {
      console.warn("Failed to clean image URL", e);
    }
  }
  return url;
};

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  const navItems = [
    { label: 'Inicio', icon: <LayoutDashboard size={20} />, path: '/' },
    { label: 'Datos Maestros', icon: <Database size={20} />, path: '/master-data' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    if (!user) {
        navigate('/login');
        return;
    }
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-800" size={40} />
      </div>
    );
  }

  // --- GUEST / PUBLIC LAYOUT (Resumen HTML) ---
  if (!user || user.isAnonymous) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
        <header className="bg-white border-b border-slate-200 py-3 px-4 shadow-sm flex justify-center items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-brand-800 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">H&S</div>
             <div className="leading-none">
               <h1 className="font-bold text-slate-800 text-sm tracking-tight">H&S MANAGEMENT</h1>
               <p className="text-[10px] text-slate-500 uppercase tracking-wide">Portal de Verificación</p>
             </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-xl mx-auto w-full">
            {children}
          </div>
        </main>

        <footer className="p-6 text-center text-slate-400 text-[10px] border-t border-slate-200 bg-slate-50">
          <p className="font-medium mb-1">© {new Date().getFullYear()} H&S Management System</p>
          <p>Documento digital generado automáticamente.</p>
          <button onClick={() => navigate('/login')} className="mt-3 text-brand-600 hover:underline font-bold">
            Acceso Personal Interno
          </button>
        </footer>
      </div>
    );
  }

  // --- AUTHENTICATED APP LAYOUT ---
  const displayName = userProfile 
    ? `${userProfile.firstName} ${userProfile.lastName}` 
    : (user ? user.email?.split('@')[0] : 'Usuario');
    
  const displayRole = userProfile 
    ? (userProfile.position || userProfile.role)
    : (user ? user.email : 'Acceso Privado');

  const rawAvatarUrl = userProfile?.photoUrl || user?.photoURL;
  const avatarUrl = getCleanImageSrc(rawAvatarUrl) || `https://ui-avatars.com/api/?name=${displayName || 'User'}&background=random`;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-brand-800 text-white transition-all duration-300 ease-in-out overflow-hidden
        lg:relative
        ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 lg:w-0 lg:translate-x-0'}
      `}>
        <div className="w-64 h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-brand-700 min-h-[64px]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                <span className="font-bold text-brand-800">H&S</span>
              </div>
              <span className="font-bold text-xl tracking-tight whitespace-nowrap">Management</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-300 hover:text-white lg:hidden">
              <X size={24} />
            </button>
            <button onClick={() => setSidebarOpen(false)} className="hidden lg:block text-slate-300 hover:text-white">
               <X size={24} />
            </button>
          </div>

          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors whitespace-nowrap ${
                  location.pathname === item.path 
                    ? 'bg-brand-700 text-white shadow-lg border-l-4 border-white' 
                    : 'text-slate-300 hover:bg-brand-700/50 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-brand-700 bg-brand-900 shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={avatarUrl}
                alt="User" 
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border-2 border-slate-400 shrink-0 object-cover bg-slate-100"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate" title={displayRole || ''}>{displayRole}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm w-full whitespace-nowrap"
            >
              <LogOut size={16} /> 
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden w-full">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 hover:text-slate-900"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-brand-800 lg:hidden">H&S Management</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto pb-20">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
