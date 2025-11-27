import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Construction, 
  GraduationCap, 
  QrCode, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  colorClass: string;
  iconColorClass: string;
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
  // Mock user role for future implementation
  const currentUserRole = 'Admin'; 

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-brand-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Hola, Carlos</h1>
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
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-brand-800 rounded-full"></span>
          Módulos Disponibles
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appModules.map((module) => (
            <button
              key={module.id}
              onClick={() => navigate(module.path)}
              className={`
                group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm 
                text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg
                flex flex-col h-full
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
              <p className="text-slate-500 text-sm leading-relaxed">
                {module.description}
              </p>
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
           <span className="text-sm">Versión 1.0.3</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;