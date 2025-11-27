
import React, { useState, useEffect } from 'react';
import { 
  Construction, 
  CheckCircle, 
  XCircle, 
  Camera, 
  MapPin, 
  Calendar, 
  User, 
  Ruler, 
  Box, 
  Settings, 
  Plus, 
  List, 
  AlertTriangle,
  ArrowRight, 
  Save, 
  Trash2,
  Info,
  X,
  Edit2
} from 'lucide-react';
import { Scaffold, ScaffoldStatus, ScaffoldType, ChecklistItemTemplate, ChecklistResponse, Company, User as UserType } from '../types';

// --- MOCK DATA FOR DROPDOWNS ---
const MOCK_COMPANIES: Company[] = [
  { id: '1', name: 'Montajes Industriales S.A.' },
  { id: '2', name: 'Andamios del Sur' },
  { id: '3', name: 'Servicios Internos' }
];

const MOCK_USERS: UserType[] = [
  { 
    id: '27334', firstName: 'Juan', lastName: 'Perez', role: 'Supervisor', 
    emails: [], position: 'INSPECTOR', profile: 'Usuario', companyId: '1', areaId: '1' 
  },
  { 
    id: '28991', firstName: 'Maria', lastName: 'Gonzalez', role: 'Supervisor', 
    emails: [], position: 'SUPERVISOR', profile: 'Usuario', companyId: '1', areaId: '1' 
  }
];

const SECTIONS = ['BASE DEL ANDAMIO', 'CUERPO DEL ANDAMIO', 'PLATAFORMA DE TRABAJO'] as const;

// --- INITIAL TEMPLATE ---
const INITIAL_TEMPLATE: ChecklistItemTemplate[] = [
  { 
    id: 'b1', 
    section: 'BASE DEL ANDAMIO', 
    text: '¿El terreno es firme, sólido y nivelado?', 
    description: 'La superficie debe ser plana, sólida y nivelada. Si el andamio se va a armar sobre tierra, arena, grating o alguna otra superficie que pueda llegar a generar inestabilidad se deberá colocar una base de un mínimo de 20 cm x 20 cm.',
    allowPhoto: true 
  },
  { 
    id: 'b2', 
    section: 'BASE DEL ANDAMIO', 
    text: '¿Existen placas base y tornillos niveladores?', 
    description: 'Verificar que todos los parantes apoyen sobre placas base metálicas y que los tornillos niveladores no excedan su recorrido máximo.',
    allowPhoto: true 
  },
  { 
    id: 'c1', 
    section: 'CUERPO DEL ANDAMIO', 
    text: '¿La estructura está plomada?', 
    description: 'El andamio debe estar verticalmente a plomo. Tolerancia máxima recomendada: 1% de la altura.',
    allowPhoto: false 
  },
  { 
    id: 'c2', 
    section: 'CUERPO DEL ANDAMIO', 
    text: '¿Diagonales y horizontales completas?', 
    description: 'Todas las modulaciones deben contar con sus respectivas horizontales y diagonales para garantizar la rigidez estructural.',
    allowPhoto: true 
  },
  { 
    id: 'p1', 
    section: 'PLATAFORMA DE TRABAJO', 
    text: '¿Plataformas completas y aseguradas?', 
    description: 'No deben existir huecos en la plataforma. Los tablones o plataformas metálicas deben estar asegurados contra desplazamientos por viento.',
    allowPhoto: true 
  },
  { 
    id: 'p2', 
    section: 'PLATAFORMA DE TRABAJO', 
    text: '¿Cuenta con barandas y rodapiés?', 
    description: 'Baranda superior (1m), baranda intermedia (0.5m) y rodapié (mín 10cm) en todo el perímetro de trabajo.',
    allowPhoto: true 
  },
];

const Scaffolds = () => {
  const [activeTab, setActiveTab] = useState<'management' | 'config'>('management');
  const [view, setView] = useState<'list' | 'create' | 'inspect'>('list');
  const [scaffolds, setScaffolds] = useState<Scaffold[]>([]);
  const [template, setTemplate] = useState<ChecklistItemTemplate[]>(INITIAL_TEMPLATE);
  
  // Create Form State
  const [formData, setFormData] = useState<Partial<Scaffold>>({
    status: ScaffoldStatus.ARMADO,
    type: 'DE ACCESO',
    assemblyDate: new Date().toISOString().split('T')[0]
  });

  // Config Form State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTemplateItem, setNewTemplateItem] = useState<Partial<ChecklistItemTemplate>>({
    section: 'BASE DEL ANDAMIO',
    text: '',
    description: '',
    allowPhoto: false
  });

  // Inspection Runner State
  const [currentInspectionId, setCurrentInspectionId] = useState<string | null>(null);
  const [inspectionResponses, setInspectionResponses] = useState<Record<string, ChecklistResponse>>({});
  const [finalVerdict, setFinalVerdict] = useState<boolean>(false);

  // --- LOCATION HELPER ---
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
        (error) => {
          alert("Error al obtener ubicación: " + error.message);
        }
      );
    } else {
      alert("Geolocalización no soportada por este navegador.");
    }
  };

  // --- CREATE SCAFFOLD ---
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newScaffold: Scaffold = {
      ...formData as Scaffold,
      id: `AND-${Date.now().toString().slice(-4)}`,
      status: ScaffoldStatus.ARMADO,
    };
    setScaffolds([newScaffold, ...scaffolds]);
    setFormData({ status: ScaffoldStatus.ARMADO, type: 'DE ACCESO', assemblyDate: new Date().toISOString().split('T')[0] });
    setView('list');
  };

  // --- CONFIG: ADD/EDIT ITEM ---
  const handleSaveTemplateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateItem.text || !newTemplateItem.section) return;

    if (editingTemplateId) {
      // Update Existing
      setTemplate(prev => prev.map(item => 
        item.id === editingTemplateId 
          ? { ...item, ...newTemplateItem as ChecklistItemTemplate }
          : item
      ));
    } else {
      // Create New
      const newItem: ChecklistItemTemplate = {
        id: `chk-${Date.now()}`,
        section: newTemplateItem.section as any,
        text: newTemplateItem.text,
        description: newTemplateItem.description,
        allowPhoto: newTemplateItem.allowPhoto || false
      };
      setTemplate([...template, newItem]);
    }

    closeConfigModal();
  };

  const handleEditTemplateItem = (item: ChecklistItemTemplate) => {
    setEditingTemplateId(item.id);
    setNewTemplateItem({
      section: item.section,
      text: item.text,
      description: item.description,
      allowPhoto: item.allowPhoto
    });
    setIsConfigModalOpen(true);
  };

  const handleDeleteTemplateItem = (id: string) => {
    if(confirm('¿Eliminar esta pregunta del checklist?')) {
      setTemplate(template.filter(t => t.id !== id));
    }
  };

  const closeConfigModal = () => {
    setIsConfigModalOpen(false);
    setEditingTemplateId(null);
    setNewTemplateItem({
      section: 'BASE DEL ANDAMIO',
      text: '',
      description: '',
      allowPhoto: false
    });
  };

  // --- INSPECTION LOGIC ---
  const startInspection = (id: string) => {
    setCurrentInspectionId(id);
    setInspectionResponses({});
    setFinalVerdict(false);
    setView('inspect');
  };

  const handleResponse = (qId: string, status: 'OK' | 'NO_CUMPLE' | null) => {
    if (status === null) {
      const newResponses = { ...inspectionResponses };
      delete newResponses[qId];
      setInspectionResponses(newResponses);
      return;
    }
    setInspectionResponses(prev => ({
      ...prev,
      [qId]: { ...prev[qId], questionId: qId, status }
    }));
  };

  const handleObservation = (qId: string, text: string) => {
    setInspectionResponses(prev => ({
      ...prev,
      [qId]: { ...prev[qId], observation: text }
    }));
  };

  const submitInspection = () => {
    if (!currentInspectionId) return;
    
    // Validate all answered
    if (Object.keys(inspectionResponses).length < template.length) {
      alert("Debe responder todas las preguntas del checklist.");
      return;
    }

    const today = new Date();
    const expiry = new Date(today);
    expiry.setDate(today.getDate() + 7);

    setScaffolds(prev => prev.map(s => {
      if (s.id === currentInspectionId) {
        return {
          ...s,
          status: ScaffoldStatus.INSPECCIONADO,
          inspectionDate: today.toISOString().split('T')[0],
          expiryDate: expiry.toISOString().split('T')[0],
          checklistResponses: inspectionResponses,
          isOperational: finalVerdict
        };
      }
      return s;
    }));
    setView('list');
  };

  // --- STATUS WORKFLOW ---
  const changeStatus = (id: string, newStatus: ScaffoldStatus) => {
    if (!confirm(`¿Confirmar cambio de estado a ${newStatus}?`)) return;
    setScaffolds(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  // --- RENDER HELPERS ---
  const getStatusColor = (s: ScaffoldStatus) => {
    switch(s) {
      case ScaffoldStatus.ARMADO: return 'bg-blue-100 text-blue-800 border-blue-200';
      case ScaffoldStatus.INSPECCIONADO: return 'bg-green-100 text-green-800 border-green-200';
      case ScaffoldStatus.A_DESMONTAR: return 'bg-orange-100 text-orange-800 border-orange-200';
      case ScaffoldStatus.DESMONTADO: return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100';
    }
  };

  const renderSlider = (qId: string, currentStatus?: 'OK' | 'NO_CUMPLE') => {
    return (
      <div className="relative w-32 h-10 bg-slate-200 rounded-full flex items-center p-1 shadow-inner select-none cursor-pointer shrink-0">
        {/* Neutral Click Area (Center) */}
        <div onClick={() => handleResponse(qId, null)} className="absolute inset-x-10 inset-y-0 z-10" />
        
        {/* OK Click Area (Left) */}
        <div onClick={() => handleResponse(qId, 'OK')} className="absolute left-0 w-1/2 h-full z-10" />

        {/* Fail Click Area (Right) */}
        <div onClick={() => handleResponse(qId, 'NO_CUMPLE')} className="absolute right-0 w-1/2 h-full z-10" />

        {/* Labels */}
        <span className={`absolute left-3 text-[10px] font-bold z-0 transition-colors ${currentStatus === 'OK' ? 'text-white' : 'text-slate-500'}`}>OK</span>
        <span className={`absolute right-3 text-[10px] font-bold z-0 transition-colors ${currentStatus === 'NO_CUMPLE' ? 'text-white' : 'text-slate-500'}`}>NO</span>

        {/* The Knob */}
        <div className={`
          h-8 w-10 rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center border border-slate-300
          ${currentStatus === 'OK' ? 'translate-x-0 bg-green-500' : 
            currentStatus === 'NO_CUMPLE' ? 'translate-x-[5.5rem] bg-red-500' : 
            'translate-x-[2.75rem] bg-white'}
        `}>
          {currentStatus === 'OK' && <CheckCircle size={16} className="text-white" />}
          {currentStatus === 'NO_CUMPLE' && <XCircle size={16} className="text-white" />}
          {!currentStatus && <div className="w-2 h-2 rounded-full bg-slate-400"></div>}
        </div>
      </div>
    );
  };

  // --- VIEWS ---

  if (view === 'create') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brand-800">Alta de Andamio</h2>
          <button onClick={() => setView('list')} className="text-slate-500 hover:text-slate-800">Cancelar</button>
        </div>

        <form onSubmit={handleCreateSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Solicitante del Andamio</label>
               <input 
                 required 
                 className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                 value={formData.requester || ''} 
                 onChange={e => setFormData({...formData, requester: e.target.value})} 
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Empresa Montaje</label>
               <select 
                 required 
                 className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                 value={formData.assemblyCompanyId || ''} 
                 onChange={e => setFormData({...formData, assemblyCompanyId: e.target.value})}
               >
                 <option value="">Seleccione...</option>
                 {MOCK_COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Inspector (DNI/Legajo)</label>
               <select 
                 required 
                 className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                 value={formData.inspectorId || ''} 
                 onChange={e => setFormData({...formData, inspectorId: e.target.value})}
               >
                 <option value="">Seleccione...</option>
                 {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.id})</option>)}
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Andamista Oficial</label>
               <input 
                 required 
                 className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                 value={formData.officialScaffolder || ''} 
                 onChange={e => setFormData({...formData, officialScaffolder: e.target.value})} 
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Montaje</label>
               <input 
                 required 
                 type="date" 
                 className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                 value={formData.assemblyDate || ''} 
                 onChange={e => setFormData({...formData, assemblyDate: e.target.value})} 
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Andamio</label>
               <div className="flex gap-2">
                 <button type="button" onClick={() => setFormData({...formData, type: 'DE ACCESO'})} className={`flex-1 p-2 rounded border ${formData.type === 'DE ACCESO' ? 'bg-brand-800 text-white' : 'bg-white text-slate-700'}`}>DE ACCESO</button>
                 <button type="button" onClick={() => setFormData({...formData, type: 'TRABAJO'})} className={`flex-1 p-2 rounded border ${formData.type === 'TRABAJO' ? 'bg-brand-800 text-white' : 'bg-white text-slate-700'}`}>TRABAJO</button>
               </div>
            </div>
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-slate-700 mb-1">Descripción Ubicación</label>
               <input 
                 required 
                 className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                 value={formData.locationDescription || ''} 
                 onChange={e => setFormData({...formData, locationDescription: e.target.value})} 
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Metros Cúbicos (m3)</label>
               <input 
                 required 
                 type="number" 
                 className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                 value={formData.cubicMeters || ''} 
                 onChange={e => setFormData({...formData, cubicMeters: Number(e.target.value)})} 
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Altura (mts)</label>
               <input 
                 required 
                 type="number" 
                 className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900" 
                 value={formData.height || ''} 
                 onChange={e => setFormData({...formData, height: Number(e.target.value)})} 
               />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Geolocalización</label>
                <div className="flex gap-2">
                  <input readOnly className="w-full p-2 border rounded bg-slate-100 text-slate-600" value={formData.coordinates ? `${formData.coordinates.lat}, ${formData.coordinates.lng}` : 'Sin datos'} />
                  <button type="button" onClick={handleGetLocation} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 rounded flex items-center gap-2">
                    <MapPin size={18} /> Obtener
                  </button>
                </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end border-t border-slate-100">
            <button type="submit" className="bg-brand-800 hover:bg-brand-900 text-white px-6 py-2 rounded-lg font-bold">Registrar Andamio</button>
          </div>
        </form>
      </div>
    );
  }

  if (view === 'inspect') {
    const scaffold = scaffolds.find(s => s.id === currentInspectionId);
    if (!scaffold) return null;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
           <div>
             <h2 className="text-xl font-bold text-brand-800">Checklist de Inspección</h2>
             <p className="text-sm text-slate-500">Andamio: {scaffold.id} - {scaffold.locationDescription}</p>
           </div>
           <button onClick={() => setView('list')} className="text-slate-500">Cancelar</button>
        </div>

        {SECTIONS.map(section => (
          <div key={section} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
              <h3 className="font-bold text-brand-800">{section}</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {template.filter(t => t.section === section).map(q => {
                const response = inspectionResponses[q.id];
                return (
                  <div key={q.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1 flex-1">
                        <p className="text-slate-700 font-medium">{q.text}</p>
                        {q.description && (
                          <div className="flex gap-2 items-start bg-slate-50 p-2 rounded-md border border-slate-100">
                            <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-500 italic leading-relaxed">{q.description}</p>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 pt-1">
                         {renderSlider(q.id, response?.status)}
                      </div>
                    </div>
                    
                    {/* Conditional Fields for Failure */}
                    {response?.status === 'NO_CUMPLE' && (
                      <div className="ml-4 pl-4 border-l-2 border-red-200 space-y-3 animate-fade-in">
                        <textarea 
                          placeholder="Describa el hallazgo..." 
                          className="w-full p-2 text-sm border border-slate-300 rounded focus:border-red-500 outline-none bg-white text-slate-900"
                          value={response.observation || ''}
                          onChange={(e) => handleObservation(q.id, e.target.value)}
                        />
                        {q.allowPhoto && (
                           <button className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-800 font-medium">
                             <Camera size={16} /> Adjuntar Evidencia Fotográfica
                           </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4">Dictamen Final</h3>
          <div className="flex items-center gap-4 mb-6">
             <span className="text-sm font-medium">¿El andamio está apto para su uso?</span>
             <button 
                onClick={() => setFinalVerdict(true)} 
                className={`px-4 py-2 rounded-lg font-bold border ${finalVerdict ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-400 border-slate-200'}`}
             >
               HABILITADO
             </button>
             <button 
                onClick={() => setFinalVerdict(false)} 
                className={`px-4 py-2 rounded-lg font-bold border ${!finalVerdict ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-400 border-slate-200'}`}
             >
               NO HABILITADO
             </button>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-slate-100">
             <button 
               onClick={submitInspection}
               className="bg-brand-800 hover:bg-brand-900 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2"
             >
               <Save size={20} /> Guardar Inspección
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- TAB: ADMIN CONFIG ---
  if (activeTab === 'config') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Configuración Checklist</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => { closeConfigModal(); setIsConfigModalOpen(true); }}
              className="bg-brand-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-brand-900"
            >
              <Plus size={18} /> Nueva Pregunta
            </button>
            <button onClick={() => setActiveTab('management')} className="text-brand-600 font-medium px-4 py-2 hover:bg-brand-50 rounded-lg">
              Volver
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <table className="w-full text-left text-sm text-slate-600">
             <thead className="bg-slate-50 font-bold text-slate-800 border-b border-slate-200">
               <tr>
                 <th className="p-4 w-1/5">Sección</th>
                 <th className="p-4 w-1/4">Pregunta</th>
                 <th className="p-4 w-1/3">Ayuda / Criterio</th>
                 <th className="p-4 text-center">Foto Oblig.</th>
                 <th className="p-4 text-right">Acción</th>
               </tr>
             </thead>
             <tbody>
               {template.map((t, idx) => (
                 <tr key={t.id} className="border-b border-slate-100">
                   <td className="p-4 font-medium text-brand-800 align-top">{t.section}</td>
                   <td className="p-4 font-medium align-top">{t.text}</td>
                   <td className="p-4 text-xs text-slate-500 italic align-top">{t.description || '-'}</td>
                   <td className="p-4 text-center align-top">{t.allowPhoto ? 'Sí' : 'No'}</td>
                   <td className="p-4 text-right align-top space-x-1">
                     <button onClick={() => handleEditTemplateItem(t)} className="text-brand-600 hover:bg-brand-50 p-2 rounded-full"><Edit2 size={16}/></button>
                     <button onClick={() => handleDeleteTemplateItem(t.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash2 size={16}/></button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
           <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
             <p className="text-slate-400 italic text-sm">Funcionalidad de edición completa habilitada para Admin</p>
           </div>
        </div>

        {/* Modal for New/Edit Question */}
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">
                  {editingTemplateId ? 'Editar Pregunta' : 'Nueva Pregunta'}
                </h3>
                <button onClick={closeConfigModal} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
              </div>
              <form onSubmit={handleSaveTemplateItem} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Sección *</label>
                  <select 
                    required 
                    value={newTemplateItem.section} 
                    onChange={e => setNewTemplateItem({...newTemplateItem, section: e.target.value as any})}
                    className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800"
                  >
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Pregunta *</label>
                  <input 
                    required 
                    value={newTemplateItem.text}
                    onChange={e => setNewTemplateItem({...newTemplateItem, text: e.target.value})}
                    placeholder="Ej. ¿Está la superficie nivelada?"
                    className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Ayuda / Criterio de Aceptación</label>
                  <textarea 
                    rows={3}
                    value={newTemplateItem.description}
                    onChange={e => setNewTemplateItem({...newTemplateItem, description: e.target.value})}
                    placeholder="Describa qué debe observar el inspector para aprobar este ítem..."
                    className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox"
                    id="allowPhoto"
                    checked={newTemplateItem.allowPhoto}
                    onChange={e => setNewTemplateItem({...newTemplateItem, allowPhoto: e.target.checked})}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <label htmlFor="allowPhoto" className="text-sm font-medium text-slate-700">Permitir/Requerir Foto en caso de falla</label>
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
                  <button type="button" onClick={closeConfigModal} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
                  <button type="submit" className="px-6 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-900 font-medium">
                    {editingTemplateId ? 'Actualizar Pregunta' : 'Guardar Pregunta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- TAB: MANAGEMENT (DEFAULT) ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Andamios</h2>
          <p className="text-slate-500">Control de montaje, inspección y desmontaje.</p>
        </div>
        <div className="flex gap-2">
           {/* Admin Toggle Mockup */}
           <button 
             onClick={() => setActiveTab('config')}
             className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-2"
           >
             <Settings size={18} /> Configurar
           </button>
           <button 
             onClick={() => setView('create')}
             className="bg-brand-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-brand-900"
           >
            <Plus size={20} /> Nuevo Andamio
           </button>
        </div>
      </div>

      <div className="grid gap-4">
        {scaffolds.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <Construction className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-500">No hay andamios registrados. Comience creando uno.</p>
          </div>
        )}
        
        {scaffolds.map(s => (
          <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
               <div className="flex items-center gap-3">
                 <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{s.id}</span>
                 <span className={`text-xs font-bold px-2 py-1 rounded border ${getStatusColor(s.status)}`}>{s.status}</span>
                 {s.status === ScaffoldStatus.INSPECCIONADO && (
                   s.isOperational 
                     ? <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle size={12}/> HABILITADO</span>
                     : <span className="text-xs font-bold text-red-600 flex items-center gap-1"><XCircle size={12}/> CLAUSURADO</span>
                 )}
               </div>
               
               <h3 className="font-bold text-slate-800">{s.locationDescription}</h3>
               
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-slate-500 mt-2">
                 <div>
                   <span className="block text-xs text-slate-400">Montaje</span>
                   <span className="flex items-center gap-1"><Calendar size={14}/> {s.assemblyDate}</span>
                 </div>
                 <div>
                   <span className="block text-xs text-slate-400">Vencimiento</span>
                   <span className="flex items-center gap-1 text-brand-600 font-semibold">{s.expiryDate || '--/--/----'}</span>
                 </div>
                 <div>
                   <span className="block text-xs text-slate-400">Dimensiones</span>
                   <span className="flex items-center gap-1"><Box size={14}/> {s.cubicMeters}m³ / <Ruler size={14}/> {s.height}m</span>
                 </div>
                 <div>
                   <span className="block text-xs text-slate-400">Tipo</span>
                   <span>{s.type}</span>
                 </div>
               </div>
               
               {s.coordinates && (
                 <a 
                   href={`https://www.google.com/maps/search/?api=1&query=${s.coordinates.lat},${s.coordinates.lng}`} 
                   target="_blank" 
                   rel="noreferrer"
                   className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                 >
                   <MapPin size={12}/> Ver ubicación en mapa
                 </a>
               )}
            </div>

            <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4 min-w-[200px]">
               {s.status === ScaffoldStatus.ARMADO && (
                 <button 
                   onClick={() => startInspection(s.id)}
                   className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                 >
                   <List size={16}/> Realizar Inspección
                 </button>
               )}
               
               {s.status === ScaffoldStatus.INSPECCIONADO && (
                 <button 
                   onClick={() => changeStatus(s.id, ScaffoldStatus.A_DESMONTAR)}
                   className="w-full border border-orange-300 text-orange-700 hover:bg-orange-50 py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                 >
                   <AlertTriangle size={16}/> Solicitar Desarme
                 </button>
               )}

               {s.status === ScaffoldStatus.A_DESMONTAR && (
                 <button 
                    onClick={() => changeStatus(s.id, ScaffoldStatus.DESMONTADO)}
                    className="w-full bg-slate-800 text-white hover:bg-slate-900 py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                 >
                   <ArrowRight size={16}/> Confirmar Desarme
                 </button>
               )}
               
               <div className="text-xs text-center text-slate-400 mt-1">
                 Solicitante: {s.requester}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scaffolds;
