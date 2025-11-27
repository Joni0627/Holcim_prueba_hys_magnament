import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Lun', inspection: 4, incidents: 0 },
  { name: 'Mar', inspection: 3, incidents: 1 },
  { name: 'Mie', inspection: 6, incidents: 0 },
  { name: 'Jue', inspection: 8, incidents: 0 },
  { name: 'Vie', inspection: 5, incidents: 0 },
];

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-800">Panel de Control</h2>
          <p className="text-slate-500">Resumen de actividad diaria de planta</p>
        </div>
        <button className="bg-brand-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-900 transition-colors">
          + Nueva Tarea Rápida
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="MOCs Activos" 
          value="12" 
          icon={<FileText size={24} className="text-blue-600" />} 
          color="bg-blue-50" 
        />
        <StatCard 
          title="Insp. Andamios" 
          value="8" 
          icon={<CheckCircle size={24} className="text-safety-600" />} 
          color="bg-safety-50" 
        />
        <StatCard 
          title="Capacitaciones Pend." 
          value="3" 
          icon={<Clock size={24} className="text-warning-600" />} 
          color="bg-warning-50" 
        />
        <StatCard 
          title="Incidentes (Mes)" 
          value="0" 
          icon={<AlertTriangle size={24} className="text-red-600" />} 
          color="bg-red-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Inspecciones vs Incidentes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="inspection" fill="#22c55e" radius={[4, 4, 0, 0]} name="Inspecciones" />
                <Bar dataKey="incidents" fill="#ef4444" radius={[4, 4, 0, 0]} name="Incidentes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Tareas Críticas Hoy</h3>
          <div className="space-y-4">
            {[
              { title: 'Reparación Tubería A4', time: '09:00 AM', tag: 'Altura' },
              { title: 'Ingreso Espacio Confinado', time: '11:30 AM', tag: 'Esp. Conf.' },
              { title: 'Izaje Tanque TK-101', time: '02:00 PM', tag: 'Izaje' },
            ].map((task, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors">
                <div className="w-2 h-2 mt-2 rounded-full bg-safety-500"></div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">{task.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{task.time}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">{task.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;