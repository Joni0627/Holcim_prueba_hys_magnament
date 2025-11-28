
import React, { useState } from 'react';
import { MOCRecord, MOCStatus, User, Area, RiskType, StandardType } from '../types';
import { Plus, Search, Check, Send, AlertTriangle, Calendar, User as UserIcon, MapPin, Upload, FileText, ChevronRight, ArrowLeft, LayoutGrid, List, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  { id: '27334', firstName: 'Juan', lastName: 'Perez', role: 'Supervisor', position: 'SUPERVISOR', profile: 'Usuario', companyId: '1', areaId: '1', emails: [] },
  { id: '99887', firstName: 'Carlos', lastName: 'Mendez', role: 'Gerencia', position: 'GERENTE DE PLANTA', profile: 'Administrador', companyId: '1', areaId: '1', emails: [] },
  { id: '11223', firstName: 'Ana', lastName: 'Lopez', role: 'Coordinador', position: 'COORDINADOR DE MANTENIMIENTO', profile: 'Usuario', companyId: '1', areaId: '2', emails: [] },
];

const MOCK_AREAS: Area[] = [
  { id: '1', name: 'Producción' },
  { id: '2', name: 'Mantenimiento' },
  { id: '3', name: 'Logística' },
  { id: '4', name: 'Calidad' },
];

const MOCK_RISKS: RiskType[] = [
  { id: '1', name: 'Trabajo en Altura' },
  { id: '2', name: 'Espacio Confinado' },
  { id: '3', name: 'Riesgo Eléctrico' },
  { id: '4', name: 'Atrapamiento' },
  { id: '5', name: 'Proyección Partículas' },
  { id: '6', name: 'Tránsito Vehicular' },
];

const MOCK_STANDARDS: StandardType[] = [
  { id: '1', name: 'Procedimiento Operativo Estandar (POE)' },
  { id: '2', name: 'Permiso de Trabajo Seguro (PTS)' },
  { id: '3', name: 'Instructivo Técnico' },
  { id: '4', name: 'Norma ISO 45001' },
];

// Simulamos el usuario logueado actualmente
const CURRENT_USER_ID = '27334'; 

const MOC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'board' | 'create' | 'detail' | 'history'>('board');
  
  // State for Form
  const [formData, setFormData] = useState<Partial<MOCRecord>>({
    requesterId: CURRENT_USER_ID,
    status: MOCStatus.PENDING,
    riskIds: [],
    involvedAreaIds: []
  });

  const [requesterSearchId, setRequesterSearchId] = useState(CURRENT_USER_ID);
  const [selectedMoc, setSelectedMoc] = useState<MOCRecord | null>(null);

  // Mock Data List - Added a 'completedAt' field simulation via logic
  const [mocs, setMocs] = useState<MOCRecord[]>([
    {
      id: 'MDC-2023-001',
      title: 'Reparación Calle Acceso Norte',
      requesterId: '27334',
      startDate: '2023-10-25',
      endDate: '2023-10-30',
      responsibleId: '11223',
      approverId: '99887',
      standardTypeId: '2',
      description: 'Repavimentación de sector dañado por lluvia. Se requiere movimiento de suelo.',
      riskIds: ['6', '5'],
      involvedAreaIds: ['3'],
      actionPlan: '1. Señalizar desvío. 2. Ingreso maquinaria. 3. Compactación.',
      status: MOCStatus.EXECUTION,
      createdAt: '2023-10-25',
      locationText: 'Acceso Planta - Portón 2'
    },
    {
      id: 'MDC-2023-002',
      title: 'Cambio de Válvula Línea Gas',
      requesterId: '27334',
      startDate: '2023-09-10',
      endDate: '2023-09-10',
      responsibleId: '11223',
      approverId: '99887',
      standardTypeId: '2',
      description: 'Cambio programado por mantenimiento preventivo.',
      riskIds: ['2', '3'],
      involvedAreaIds: ['2'],
      actionPlan: 'Bloqueo y etiquetado.',
      status: MOCStatus.COMPLETED,
      createdAt: '2023-09-10', // Old date
      locationText: 'Nave Mantenimiento'
    }
  ]);

  // --- HANDLERS ---

  const handleSearchRequester = () => {
    const user = MOCK_USERS.find(u => u.id === requesterSearchId);
    if (user) {
      setFormData(prev => ({ ...prev, requesterId: user.id }));
    } else {
      setFormData(prev => ({ ...prev, requesterId: '' }));
      alert("Usuario no encontrado");
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          alert("Ubicación capturada correctamente.");
        },
        (error) => alert("Error al obtener ubicación: " + error.message)
      );
    } else {
      alert("Geolocalización no soportada.");
    }
  };

  const toggleSelection = (field: 'riskIds' | 'involvedAreaIds', id: string) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const exists = current.includes(id);
      return {
        ...prev,
        [field]: exists ? current.filter(x => x !== id) : [...current, id]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.approverId || !formData.requesterId) {
      alert("Complete los campos obligatorios.");
      return;
    }

    const newMOC: MOCRecord = {
      ...formData as MOCRecord,
      id: `MDC-${new Date().getFullYear()}-${String(mocs.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toLocaleDateString(), // Use simpler date format for mock
      status: MOCStatus.PENDING 
    };
    
    setMocs([newMOC, ...mocs]);
    alert("MDC Creado y enviado a aprobación.");
    setFormData({ requesterId: CURRENT_USER_ID, status: MOCStatus.PENDING, riskIds: [], involvedAreaIds: [] });
    setRequesterSearchId(CURRENT_USER_ID);
    setView('board');
  };

  const updateStatus = (moc: MOCRecord, newStatus: MOCStatus) => {
    const updated = { 
        ...moc, 
        status: newStatus,
        // Mock update date to today if completed
        createdAt: newStatus === MOCStatus.COMPLETED ? new Date().toLocaleDateString() : moc.createdAt 
    };
    setMocs(prev => prev.map(m => m.id === moc.id ? updated : m));
    setSelectedMoc(updated);
    
    if (newStatus === MOCStatus.APPROVED) alert("MDC Aprobado.");
    if (newStatus === MOCStatus.REJECTED) alert("MDC Rechazado.");
    if (newStatus === MOCStatus.EXECUTION) alert("MDC en Ejecución.");
    if (newStatus === MOCStatus.COMPLETED) {
        alert("MDC Finalizado.");
        setView('board'); // Go back to board to see it in Done column
    }
  };

  const getStatusBadge = (status: MOCStatus) => {
    const styles = {
      [MOCStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [MOCStatus.APPROVED]: 'bg-blue-100 text-blue-800 border-blue-200',
      [MOCStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200',
      [MOCStatus.REVIEW]: 'bg-orange-100 text-orange-800 border-orange-200',
      [MOCStatus.EXECUTION]: 'bg-purple-100 text-purple-800 border-purple-200',
      [MOCStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[status]}`}>{status}</span>;
  };

  const getUserName = (id: string) => {
    const u = MOCK_USERS.find(u => u.id === id);
    return u ? `${u.firstName} ${u.lastName}` : id;
  };

  // --- KANBAN LOGIC ---
  const isToday = (dateString: string) => {
    const today = new Date().toLocaleDateString();
    return dateString === today;
  };

  const columns = [
    {
      title: 'Solicitudes / Revisión',
      status: [MOCStatus.PENDING, MOCStatus.REVIEW, MOCStatus.REJECTED],
      color: 'border-yellow-400 bg-yellow-50/50'
    },
    {
      title: 'En Proceso',
      status: [MOCStatus.APPROVED, MOCStatus.EXECUTION],
      color: 'border-blue-400 bg-blue-50/50'
    },
    {
      title: 'Finalizado (Hoy)',
      status: [MOCStatus.COMPLETED],
      color: 'border-green-400 bg-green-50/50',
      filter: (m: MOCRecord) => isToday(m.createdAt) // Only show today's completions
    }
  ];

  // --- VIEWS ---

  if (view === 'create') {
     // ... (Keep existing Create View code identical, just shorten for xml brevity, but I must return full content)
     // To ensure integrity, I will copy the full CREATE view from previous state
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brand-800">Nuevo Manejo del Cambio</h2>
          <button onClick={() => setView('board')} className="text-slate-500 hover:text-slate-800">Cancelar</button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
             <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Título del Manejo de Cambio *</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" 
                  value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ej. Reparación de calle interna..." />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Solicitante (DNI/Legajo) *</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                    value={requesterSearchId} 
                    onChange={e => setRequesterSearchId(e.target.value)} 
                    placeholder="Ingrese ID (Ej. 27334)" 
                  />
                  <button type="button" onClick={handleSearchRequester} className="bg-slate-200 px-3 rounded hover:bg-slate-300 text-slate-700">
                    <Search size={20} />
                  </button>
                </div>
                {formData.requesterId ? (
                   <p className="mt-1 text-sm font-bold text-brand-700 flex items-center gap-1 animate-fade-in">
                     <Check size={14} /> {getUserName(formData.requesterId)}
                   </p>
                ) : (
                   <p className="mt-1 text-xs text-red-500 font-medium">Usuario no encontrado o no validado</p>
                )}
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Fecha Inicio *</label>
                   <input required type="date" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                      value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Fecha Fin *</label>
                   <input required type="date" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                      value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Responsable Tarea *</label>
                <select required className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                  value={formData.responsibleId || ''} onChange={e => setFormData({...formData, responsibleId: e.target.value})}>
                    <option value="">Seleccione...</option>
                    {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Aprobador *</label>
                <select required className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                  value={formData.approverId || ''} onChange={e => setFormData({...formData, approverId: e.target.value})}>
                    <option value="">Seleccione...</option>
                    {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
             </div>
          </div>

          <div className="space-y-4 pb-6 border-b border-slate-100">
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tipo de Estándar *</label>
                <select required className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                  value={formData.standardTypeId || ''} onChange={e => setFormData({...formData, standardTypeId: e.target.value})}>
                    <option value="">Seleccione...</option>
                    {MOCK_STANDARDS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
             </div>
             
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Riesgos Asociados (Selección múltiple)</label>
                <div className="flex flex-wrap gap-2">
                  {MOCK_RISKS.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleSelection('riskIds', r.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                        formData.riskIds?.includes(r.id) 
                          ? 'bg-red-100 text-red-700 border-red-200 ring-2 ring-red-100' 
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Sectores Involucrados (Selección múltiple)</label>
                <div className="flex flex-wrap gap-2">
                  {MOCK_AREAS.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleSelection('involvedAreaIds', a.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                        formData.involvedAreaIds?.includes(a.id) 
                          ? 'bg-brand-100 text-brand-700 border-brand-200 ring-2 ring-brand-100' 
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          <div className="space-y-4 pb-6 border-b border-slate-100">
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Detalle / Análisis de Cambio *</label>
                <textarea required rows={4} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                  value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Describa la tarea y el cambio operativo..." />
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Plan de Acción</label>
                <textarea rows={4} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                  value={formData.actionPlan || ''} onChange={e => setFormData({...formData, actionPlan: e.target.value})} 
                  placeholder="Pasos a seguir para mitigar riesgos..." />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ubicación</label>
                <div className="flex gap-2">
                   <input readOnly className="w-full p-2 border rounded bg-slate-100 text-slate-600 text-sm" 
                     value={formData.coordinates ? `${formData.coordinates.lat}, ${formData.coordinates.lng}` : 'No geolocalizado'} />
                   <button type="button" onClick={handleGetLocation} className="bg-slate-200 px-3 rounded hover:bg-slate-300">
                      <MapPin size={18} />
                   </button>
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Evidencias / Docs</label>
                <div className="flex gap-2">
                   <button type="button" className="flex-1 border border-dashed border-slate-300 p-2 rounded text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2 text-xs">
                      <Upload size={16} /> Subir Imagen
                   </button>
                   <button type="button" className="flex-1 border border-dashed border-slate-300 p-2 rounded text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2 text-xs">
                      <FileText size={16} /> Subir PDF
                   </button>
                </div>
             </div>
          </div>

          <div className="flex justify-end pt-4">
             <button type="submit" className="bg-brand-800 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-brand-900 flex items-center gap-2">
               <Send size={18} /> Crear MDC (Pendiente)
             </button>
          </div>

        </form>
      </div>
    );
  }

  if (view === 'detail' && selectedMoc) {
    const isApprover = CURRENT_USER_ID === selectedMoc.approverId;
    const isRequester = CURRENT_USER_ID === selectedMoc.requesterId;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <div className="flex items-center gap-3 mb-1">
                 <h2 className="text-xl font-bold text-slate-800">{selectedMoc.id}</h2>
                 {getStatusBadge(selectedMoc.status)}
              </div>
              <h1 className="text-2xl font-bold text-brand-800">{selectedMoc.title}</h1>
           </div>
           <button onClick={() => setView('board')} className="text-slate-500 hover:text-brand-800 font-medium">Volver</button>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center justify-end">
           {isApprover && selectedMoc.status === MOCStatus.PENDING && (
             <>
               <button onClick={() => updateStatus(selectedMoc, MOCStatus.REJECTED)} 
                 className="px-4 py-2 bg-white border border-red-300 text-red-700 font-bold rounded hover:bg-red-50">
                 Rechazar
               </button>
               <button onClick={() => updateStatus(selectedMoc, MOCStatus.APPROVED)} 
                 className="px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 shadow-sm">
                 Aprobar Cambio
               </button>
             </>
           )}

           {isRequester && selectedMoc.status === MOCStatus.APPROVED && (
               <button onClick={() => updateStatus(selectedMoc, MOCStatus.EXECUTION)} 
                 className="px-4 py-2 bg-purple-600 text-white font-bold rounded hover:bg-purple-700 shadow-sm">
                 Iniciar Ejecución (Difusión)
               </button>
           )}

           {isRequester && selectedMoc.status === MOCStatus.EXECUTION && (
               <button onClick={() => updateStatus(selectedMoc, MOCStatus.COMPLETED)} 
                 className="px-4 py-2 bg-brand-800 text-white font-bold rounded hover:bg-brand-900 shadow-sm">
                 Finalizar MDC
               </button>
           )}

           {isRequester && selectedMoc.status === MOCStatus.REVIEW && (
               <button onClick={() => alert("Funcionalidad de editar para re-envío pendiente de implementación.")} 
                 className="px-4 py-2 bg-orange-100 text-orange-800 font-bold rounded hover:bg-orange-200">
                 Editar y Re-enviar
               </button>
           )}
        </div>

        {/* Read Only Form View */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Solicitante</h3>
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><UserIcon size={16}/></div>
                     <p className="font-medium text-slate-800">{getUserName(selectedMoc.requesterId)}</p>
                  </div>
               </div>
               <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Fechas</h3>
                  <p className="font-medium text-slate-800 flex items-center gap-2">
                     <Calendar size={16} className="text-slate-400"/> {selectedMoc.startDate} <span className="text-slate-300">|</span> {selectedMoc.endDate}
                  </p>
               </div>
               <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Responsable Tarea</h3>
                  <p className="font-medium text-slate-800">{getUserName(selectedMoc.responsibleId)}</p>
               </div>
               <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Aprobador Asignado</h3>
                  <p className="font-medium text-slate-800">{getUserName(selectedMoc.approverId)}</p>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Detalle del Cambio</h3>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                   {selectedMoc.description}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
               <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Riesgos</h3>
                  <div className="flex flex-wrap gap-2">
                     {selectedMoc.riskIds.map(rid => {
                        const r = MOCK_RISKS.find(x => x.id === rid);
                        return <span key={rid} className="px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded border border-red-100 flex items-center gap-1"><AlertTriangle size={12}/> {r?.name}</span>
                     })}
                  </div>
               </div>
               <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Sectores</h3>
                  <div className="flex flex-wrap gap-2">
                     {selectedMoc.involvedAreaIds.map(aid => {
                        const a = MOCK_AREAS.find(x => x.id === aid);
                        return <span key={aid} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded border border-blue-100">{a?.name}</span>
                     })}
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Plan de Acción</h3>
                <pre className="text-slate-700 font-sans whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">
                   {selectedMoc.actionPlan || 'Sin plan detallado.'}
                </pre>
            </div>
            
            {selectedMoc.coordinates && (
                <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-blue-600">
                   <MapPin size={18} />
                   <a href="#" className="underline font-medium hover:text-blue-800">Ver ubicación georeferenciada en mapa</a>
                </div>
            )}
        </div>
      </div>
    );
  }

  // --- HISTORY VIEW ---
  if (view === 'history') {
    const historyMocs = mocs.filter(m => m.status === MOCStatus.COMPLETED);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
           <button onClick={() => setView('board')} className="bg-white p-2 rounded-full border border-slate-200 text-slate-500 hover:text-brand-800">
             <ArrowLeft size={20} />
           </button>
           <h2 className="text-2xl font-bold text-slate-800">Historial de MDC Finalizados</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
               <tr>
                 <th className="p-4">ID</th>
                 <th className="p-4">Título</th>
                 <th className="p-4">Fecha Cierre</th>
                 <th className="p-4">Responsable</th>
                 <th className="p-4 text-right">Acción</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {historyMocs.length === 0 && (
                 <tr><td colSpan={5} className="p-8 text-center text-slate-400">No hay historial disponible.</td></tr>
               )}
               {historyMocs.map(m => (
                 <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-slate-600">{m.id}</td>
                    <td className="p-4 font-medium text-slate-800">{m.title}</td>
                    <td className="p-4 text-slate-500">{m.createdAt}</td>
                    <td className="p-4 text-slate-500">{getUserName(m.responsibleId)}</td>
                    <td className="p-4 text-right">
                       <button onClick={() => { setSelectedMoc(m); setView('detail'); }} className="text-brand-600 font-bold hover:underline">Ver Detalle</button>
                    </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>
    );
  }

  // --- KANBAN BOARD VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="bg-white p-2 rounded-full border border-slate-200 text-slate-500 hover:text-brand-800 hover:border-brand-300 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-brand-800">Manejo del Cambio (MDC)</h2>
            <p className="text-slate-500">Tablero de gestión de cambios operativos.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2 bg-yellow-50 p-2 rounded border border-yellow-200 text-xs mr-4">
               <span className="font-bold text-yellow-800">Demo Role:</span>
               <span className="text-slate-700">{CURRENT_USER_ID === '27334' ? 'Solicitante' : 'Aprobador'}</span>
           </div>
           
           <button 
             onClick={() => setView('history')}
             className="bg-white text-slate-600 border border-slate-300 px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-50"
           >
             <History size={20} /> Historial
           </button>
           <button 
             onClick={() => setView('create')}
             className="bg-brand-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-brand-900"
           >
             <Plus size={20} /> Nuevo MDC
           </button>
        </div>
      </div>

      {/* KANBAN COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-x-auto pb-4">
         {columns.map((col, idx) => (
           <div key={idx} className="flex flex-col bg-slate-100/50 rounded-xl border border-slate-200 min-h-[500px]">
              {/* Header */}
              <div className={`p-4 border-b-2 bg-white rounded-t-xl ${col.color}`}>
                 <h3 className="font-bold text-slate-700 uppercase text-sm tracking-wide flex justify-between items-center">
                    {col.title}
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs border border-slate-200 shadow-sm">
                       {mocs.filter(m => col.status.includes(m.status) && (!col.filter || col.filter(m))).length}
                    </span>
                 </h3>
              </div>
              
              {/* Cards Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                 {mocs.filter(m => col.status.includes(m.status)).map(moc => {
                    // Apply extra filter if column has one (e.g. only show today's completed)
                    if (col.filter && !col.filter(moc)) return null;

                    return (
                      <div 
                        key={moc.id} 
                        onClick={() => { setSelectedMoc(moc); setView('detail'); }}
                        className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      >
                         <div className="flex justify-between items-start mb-2">
                            <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{moc.id}</span>
                            {getStatusBadge(moc.status)}
                         </div>
                         <h4 className="font-bold text-slate-800 text-sm mb-1 leading-snug group-hover:text-brand-800">{moc.title}</h4>
                         <p className="text-xs text-slate-500 line-clamp-2 mb-3">{moc.description}</p>
                         
                         <div className="flex items-center gap-2 text-[10px] text-slate-400 border-t border-slate-50 pt-2">
                             <span className="flex items-center gap-1"><UserIcon size={10}/> {getUserName(moc.responsibleId).split(' ')[0]}</span>
                             <span className="flex items-center gap-1 ml-auto"><Calendar size={10}/> {moc.createdAt}</span>
                         </div>
                      </div>
                    );
                 })}
                 {/* Empty State for Column */}
                 {mocs.filter(m => col.status.includes(m.status) && (!col.filter || col.filter(m))).length === 0 && (
                    <div className="text-center py-8 text-slate-400 italic text-xs">
                       Sin registros recientes
                    </div>
                 )}
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default MOC;
