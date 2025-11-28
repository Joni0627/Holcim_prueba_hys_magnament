import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Construction, 
  GraduationCap, 
  QrCode, 
  ArrowRight,
  ShieldAlert,
  Clock,
  AlertCircle
} from 'lucide-react';
import { INITIAL_PLANS, INITIAL_COURSES } from './MasterData';
import { UserTrainingProgress } from '../types';
import { useAuth } from '../context/AuthContext';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  colorClass: string;
  iconColorClass: string;
  badges?: { label: string | number, color: string, icon?: React.ElementType }[];
}

const appModules = [
  {
    id: 'moc',
    title: 'Manejo del Cambio',
    description: 'Gestión de riesgos y aprobación de cambios operativos.',
    icon: FileText,
    path: '/moc',
    colorClass: 'hover:border-blue-500 hover:shadow-blue-100',
    iconColorClass: 'bg-blue-100 text-blue-700',
    roles: ['All']
  },
  {
    id: 'scaffolds',
    title: 'Inspección de Andamios',
    description: 'Checklist de seguridad y habilitación de estructuras.',
    icon: Construction,
    path: '/scaffolds',
    colorClass: 'hover:border-orange-500 hover:shadow-orange-100',
    iconColorClass: 'bg-orange-100 text-orange-700',
    roles: ['All']
  },
  {
    id: 'training',
    title: 'Formación',
    description: 'Mis capacitaciones, exámenes y material de estudio.',
    icon: GraduationCap,
    path: '/training',
    colorClass: 'hover:border-purple-500 hover:shadow-purple-100',
    iconColorClass: 'bg-purple-100 text-purple-700',
    roles: ['All']
  },
  {
    id: 'badge',
    title: 'Mis Habilitaciones',
    description: 'Credencial digital QR y estado de certificaciones.',
    icon: QrCode,
    path: '/badge',
    colorClass: 'hover:border-emerald-500 hover:shadow-emerald-100',
    iconColorClass: 'bg-emerald-100 text-emerald-700',
    roles: ['All']
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();

  // Fallback if profile is not loaded yet
  const displayName = userProfile?.firstName || 'Usuario';
  
  // Use real data from profile for logic, fallback to mock if needed for specific logic not yet connected
  const CURRENT_USER_POSITION = userProfile?.position || "OPERARIO DE PRODUCCION - AFR";
  
  // Mock Progress for Dashboard (In a real app this would come from an API/Context)
  const MOCK_PROGRESS_DASHBOARD: UserTrainingProgress[] = [
    { userId: '27334', courseId: '1', status: 'PENDING', materialViewed: false }
  ];

  // Calculate stats for Training Badge
  const trainingStats = useMemo(() => {
    const myPlan = INITIAL_PLANS.find(p => p.positionIds.includes(CURRENT_USER_POSITION));
    if (!myPlan) return { pending: 0, expiring: 0 };

    const myCourses = INITIAL_COURSES.filter(c => myPlan.courseIds.includes(c.id));
    
    let pending = 0;
    let expiring = 0; // Mock expiring logic

    myCourses.forEach(course => {
      const progress = MOCK_PROGRESS_DASHBOARD.find(p => p.courseId === course.id);
      if (!progress || progress.status !== 'COMPLETED') {
        pending++;
      }
      // Simulate an expiring course for demo
      if (course.id === '3') expiring = 1; 
    });

    return { pending, expiring };
  }, [CURRENT_USER_POSITION]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-brand-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Hola, {displayName}</h1>
          <p className="text-brand-100 text-lg max-w-2xl">
            Bienvenido a <span className="font-semibold text-white">H&S Management</span>. 
            Seleccione un módulo para comenzar sus tareas de seguridad.
          </p>
        </div>
        {/* Background Pattern Decoration */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
           <ShieldAlert size={400} className="transform translate-x-12 -translate-y-12" />
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-8 bg-brand-800 rounded-full"></span>
            Módulos Disponibles
          </div>
          {userProfile && (
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">
               Rol: {userProfile.role}
            </span>
          )}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appModules.map((module) => (
            <button
              key={module.id}
              onClick={() => navigate(module.path)}
              className={`
                group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm 
                text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg
                flex flex-col h-full relative
                ${module.colorClass}
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-xl ${module.iconColorClass} transition-colors`}>
                  <module.icon size={32} strokeWidth={1.5} />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                  <ArrowRight size={24} />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-brand-800 transition-colors">
                {module.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                {module.description}
              </p>

              {/* Dynamic Badges for Training */}
              {module.id === 'training' && (
                <div className="flex gap-2 mt-auto">
                   {trainingStats.pending > 0 && (
                     <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1">
                       <AlertCircle size={12}/> {trainingStats.pending} Pendientes
                     </span>
                   )}
                   {trainingStats.expiring > 0 && (
                     <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex items-center gap-1">
                       <Clock size={12}/> {trainingStats.expiring} Por vencer
                     </span>
                   )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats Summary (Optional footer) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 mt-8">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm">Sistema Operativo</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-sm">Sincronización: Al día</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
           <span className="text-sm">Versión 1.0.9</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;