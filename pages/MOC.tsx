import React, { useState } from 'react';
import { MOCRecord, MOCStatus } from '../types';
import { Plus, Search, Brain, Check, Send, AlertTriangle } from 'lucide-react';
import { analyzeRisks } from '../services/geminiService';

const MOC = () => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [loadingAI, setLoadingAI] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [risks, setRisks] = useState<string[]>([]);
  const [mitigations, setMitigations] = useState<string[]>([]);
  
  // Mock Data
  const [mocs, setMocs] = useState<MOCRecord[]>([
    {
      id: 'MOC-2023-001',
      title: 'Reparación Calle Acceso Norte',
      description: 'Repavimentación de sector dañado por lluvia.',
      location: 'Acceso Norte Planta',
      risks: ['Atropello', 'Proyección de partículas'],
      mitigations: ['Desvío de tráfico', 'Uso de chaleco reflectivo'],
      status: MOCStatus.IN_PROGRESS,
      createdAt: '2023-10-25',
      createdBy: 'Juan Perez'
    },
    {
      id: 'MOC-2023-002',
      title: 'Cambio Válvula Línea Vapor',
      description: 'Reemplazo de válvula de seguridad.',
      location: 'Sala Calderas',
      risks: ['Quemaduras', 'Caída a nivel'],
      mitigations: ['Bloqueo y etiquetado', 'EPP térmico'],
      status: MOCStatus.PENDING_REVIEW,
      createdAt: '2023-10-26',
      createdBy: 'Carlos Mendez'
    }
  ]);

  const handleAIAnalysis = async () => {
    if (!description || !location) {
      alert("Por favor ingrese descripción y ubicación primero.");
      return;
    }
    setLoadingAI(true);
    try {
      const result = await analyzeRisks(description, location);
      setRisks(result.risks);
      setMitigations(result.mitigations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMOC: MOCRecord = {
      id: `MOC-2023-${Date.now().toString().slice(-3)}`,
      title,
      location,
      description,
      risks,
      mitigations,
      status: MOCStatus.PENDING_REVIEW,
      createdAt: new Date().toLocaleDateString(),
      createdBy: 'Usuario Actual'
    };
    setMocs([newMOC, ...mocs]);
    
    // Simulate email broadcast
    alert(`MOC Creado: ${newMOC.id}. Se ha enviado notificación a gerencia y lista de distribución.`);
    
    // Reset form
    setTitle(''); setLocation(''); setDescription(''); setRisks([]); setMitigations([]);
    setView('list');
  };

  const getStatusColor = (status: MOCStatus) => {
    switch (status) {
      case MOCStatus.COMPLETED: return 'bg-green-100 text-green-700 border-green-200';
      case MOCStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 border-blue-200';
      case MOCStatus.PENDING_REVIEW: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (view === 'create') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Nuevo Manejo del Cambio</h2>
          <button onClick={() => setView('list')} className="text-slate-500 hover:text-slate-800">Cancelar</button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título del Cambio</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-safety-500 focus:border-safety-500"
                placeholder="Ej. Reparación Acceso Norte"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
              <input 
                required
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-safety-500 focus:border-safety-500"
                placeholder="Ej. Sector Logística"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción Detallada</label>
            <textarea 
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-safety-500 focus:border-safety-500"
              placeholder="Describa la tarea, el motivo del cambio y el impacto operativo..."
            />
          </div>

          {/* AI Assistance Section */}
          <div className="bg-industrial-800 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Brain className="text-safety-400" />
                <h3 className="font-semibold">Asistente de Riesgos Gemini</h3>
              </div>
              <button 
                type="button"
                onClick={handleAIAnalysis}
                disabled={loadingAI}
                className="bg-safety-600 hover:bg-safety-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                {loadingAI ? 'Analizando...' : 'Analizar Riesgos y Estándares'}
              </button>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Complete la descripción y ubicación, luego presione Analizar para que la IA sugiera riesgos y mitigaciones.
            </p>

            {(risks.length > 0 || mitigations.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700 animate-fadeIn">
                <div className="bg-slate-800/50 p-3 rounded border border-slate-600">
                  <h4 className="font-medium text-red-300 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} /> Riesgos Potenciales
                  </h4>
                  <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                    {risks.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
                <div className="bg-slate-800/50 p-3 rounded border border-slate-600">
                  <h4 className="font-medium text-green-300 mb-2 flex items-center gap-2">
                    <Check size={16} /> Estándares / Mitigación
                  </h4>
                  <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                    {mitigations.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              className="bg-safety-600 hover:bg-safety-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-safety-500/30 flex items-center gap-2"
            >
              <Send size={20} /> Crear y Enviar a Revisión
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manejo del Cambio (MOC)</h2>
          <p className="text-slate-500">Gestione y apruebe cambios operativos de forma segura.</p>
        </div>
        <button 
          onClick={() => setView('create')}
          className="bg-industrial-900 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-industrial-800"
        >
          <Plus size={20} /> Nuevo MOC
        </button>
      </div>

      {/* Filter / Search Bar Mockup */}
      <div className="bg-white p-2 rounded-lg border border-slate-200 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por ID, título o ubicación..." 
            className="w-full pl-10 pr-4 py-2 rounded-md outline-none text-slate-700"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {mocs.map((moc) => (
          <div key={moc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{moc.id}</span>
                <h3 className="text-lg font-bold text-slate-800">{moc.title}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(moc.status)}`}>
                {moc.status}
              </span>
            </div>
            
            <p className="text-slate-600 mb-4 line-clamp-2">{moc.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {moc.risks.slice(0, 3).map((r, i) => (
                <span key={i} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 flex items-center gap-1">
                   <AlertTriangle size={10} /> {r}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500 border-t pt-3 mt-2">
              <span>Ubicación: <strong className="text-slate-700">{moc.location}</strong></span>
              <span>Creado por: {moc.createdBy}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MOC;