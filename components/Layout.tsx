
import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  LogOut,
  Bell,
  Database,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { MOCRecord, MOCStatus, TrainingPlan, Course, UserTrainingProgress } from '../types';

interface LayoutProps {
  children?: React.ReactNode;
}

interface NotificationItem {
  id: string;
  type: 'moc' | 'training';
  title: string;
  subtitle: string;
  path: string;
  isUrgent?: boolean;
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
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, userProfile, loading } = useAuth();

  useEffect(() => {
    // On mobile, start closed. On desktop, start open.
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Notifications Logic
  useEffect(() => {
    if (!userProfile) return;

    const fetchNotifications = async () => {
      const newNotifs: NotificationItem[] = [];

      try {
        // 1. Fetch Pending MOC Approvals
        const mocQ = query(
          collection(db, 'mocs'),
          where('approverId', '==', userProfile.id),
          where('status', '==', MOCStatus.PENDING)
        );
        const mocSnap = await getDocs(mocQ);
        mocSnap.forEach(doc => {
          const data = doc.data() as MOCRecord;
          newNotifs.push({
            id: `moc-${doc.id}`,
            type: 'moc',
            title: 'Aprobación Requerida',
            subtitle: `MDC: ${data.title}`,
            path: '/moc',
            isUrgent: true
          });
        });

        // 2. Fetch Expiring/Expired Training
        // Need plans to know what user should have
        const plansSnap = await getDocs(collection(db, 'plans'));
        const plans = plansSnap.docs.map(d => ({id:d.id, ...d.data()} as TrainingPlan));
        const myPlan = plans.find(p => p.positionIds.includes(userProfile.position));

        if (myPlan) {
            const coursesSnap = await getDocs(collection(db, 'courses'));
            const courses = coursesSnap.docs.map(d => ({id:d.id, ...d.data()} as Course));
            const myCourses = courses.filter(c => myPlan.courseIds.includes(c.id));

            const progressSnap = await getDocs(query(collection(db, 'training_progress'), where('userId', '==', userProfile.id)));
            const progress = progressSnap.docs.map(d => d.data() as UserTrainingProgress);

            myCourses.forEach(c => {
                const p = progress.find(pr => pr.courseId === c.id);
                if (p?.status === 'COMPLETED' && p.completionDate) {
                    const expiryDate = new Date(p.completionDate);
                    expiryDate.setMonth(expiryDate.getMonth() + c.validityMonths);
                    const now = new Date();
                    const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (diffDays < 0) {
                        newNotifs.push({
                            id: `exp-${c.id}`,
                            type: 'training',
                            title: 'Capacitación Vencida',
                            subtitle: c.title,
                            path: '/training',
                            isUrgent: true
                        });
                    } else if (diffDays <= 30) {
                        newNotifs.push({
                            id: `warn-${c.id}`,
                            type: 'training',
                            title: 'Vence Pronto',
                            subtitle: `${c.title} (${diffDays} días)`,
                            path: '/training',
                            isUrgent: false
                        });
                    }
                }
            });
        }
      } catch (e) {
        console.error("Error fetching notifications", e);
      }

      setNotifications(newNotifs);
    };

    fetchNotifications();
  }, [userProfile, location.pathname]); // Re-fetch on navigation to keep fresh

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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-brand-800 text-white transition-all duration-300 ease-in-out flex flex-col
        lg:relative
        ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}
      `}>
          {/* Header */}
          <div className={`flex items-center ${sidebarOpen ? 'justify-between px-4' : 'justify-center'} h-16 border-b border-brand-700 shrink-0 transition-all duration-300 overflow-hidden`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 text-brand-800 font-bold">
                H&S
              </div>
              <span className={`font-bold text-xl tracking-tight whitespace-nowrap transition-all duration-300 origin-left ${sidebarOpen ? 'opacity-100 scale-100 ml-0' : 'opacity-0 scale-90 w-0 ml-0 overflow-hidden hidden'}`}>
                Management
              </span>
            </div>
            {/* Mobile Close Button */}
            <button onClick={() => setSidebarOpen(false)} className="text-slate-300 hover:text-white lg:hidden">
              <X size={24} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-2 space-y-1 flex-1 overflow-y-auto overflow-x-hidden py-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                title={!sidebarOpen ? item.label : ''}
                className={`
                  flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 whitespace-nowrap relative group
                  ${location.pathname === item.path 
                    ? 'bg-brand-700 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-brand-700/50 hover:text-white'}
                  ${!sidebarOpen ? 'justify-center' : ''}
                `}
              >
                <span className="shrink-0">{item.icon}</span>
                
                {/* Smooth collapse for text: adjust opacity and width/overflow to prevent abrupt jumps */}
                <span className={`font-medium transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-4 overflow-hidden hidden'}`}>
                  {item.label}
                </span>

                {/* Tooltip for collapsed mode */}
                {!sidebarOpen && (
                  <div className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* Footer User Profile */}
          <div className="p-4 border-t border-brand-700 bg-brand-900 shrink-0 overflow-hidden">
            <div className={`flex items-center gap-3 mb-4 transition-all duration-300 ${!sidebarOpen ? 'justify-center' : ''}`}>
              <img 
                src={avatarUrl}
                alt="User" 
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border-2 border-slate-400 shrink-0 object-cover bg-slate-100"
              />
              <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate" title={displayRole || ''}>{displayRole}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              title={!sidebarOpen ? "Cerrar Sesión" : ""}
              className={`flex items-center gap-2 text-slate-400 hover:text-white text-sm w-full whitespace-nowrap transition-all ${!sidebarOpen ? 'justify-center' : ''}`}
            >
              <LogOut size={20} /> 
              <span className={`transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden hidden'}`}>Cerrar Sesión</span>
            </button>
          </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              {/* Show Menu icon on mobile always. On desktop, show Chevron if open/closed for clarity, or just Menu */}
              <Menu size={24} className="lg:hidden" />
              {sidebarOpen ? <ChevronLeft size={24} className="hidden lg:block" /> : <Menu size={24} className="hidden lg:block" />}
            </button>
            <h1 className="text-lg font-semibold text-brand-800 lg:hidden">H&S Management</h1>
          </div>

          <div className="flex items-center gap-4" ref={notifRef}>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800">Notificaciones</h3>
                    <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">{notifications.length}</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Bell size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No tienes notificaciones pendientes.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {notifications.map((n) => (
                          <button 
                            key={n.id}
                            onClick={() => { navigate(n.path); setShowNotifications(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3"
                          >
                             <div className={`mt-1 shrink-0 p-1.5 rounded-full ${n.type === 'moc' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                {n.type === 'moc' ? <FileText size={14} /> : <AlertTriangle size={14} />}
                             </div>
                             <div>
                                <p className={`text-xs font-bold ${n.isUrgent ? 'text-red-600' : 'text-slate-700'}`}>{n.title}</p>
                                <p className="text-xs text-slate-500 line-clamp-2">{n.subtitle}</p>
                             </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
