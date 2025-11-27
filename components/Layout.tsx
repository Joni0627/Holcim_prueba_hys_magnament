import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  FileText, 
  Construction, 
  GraduationCap, 
  QrCode, 
  LogOut,
  Bell,
  Database
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { label: 'Datos Maestros', icon: <Database size={20} />, path: '/master-data' },
    { label: 'Manejo del Cambio', icon: <FileText size={20} />, path: '/moc' },
    { label: 'Insp. Andamios', icon: <Construction size={20} />, path: '/scaffolds' },
    { label: 'Formación', icon: <GraduationCap size={20} />, path: '/training' },
    { label: 'Mis Habilitaciones', icon: <QrCode size={20} />, path: '/badge' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-brand-800 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-brand-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="font-bold text-brand-800">H&S</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Management</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
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

        <div className="absolute bottom-0 w-full p-4 border-t border-brand-700 bg-brand-900">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="https://picsum.photos/40/40" 
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-slate-400"
            />
            <div>
              <p className="text-sm font-semibold">Carlos Mendez</p>
              <p className="text-xs text-slate-400">Supervisor H&S</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-slate-400 hover:text-white text-sm w-full">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shadow-sm z-10">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-600 hover:text-slate-900"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
             <h1 className="text-lg font-semibold text-brand-800 lg:hidden">H&S Management</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
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