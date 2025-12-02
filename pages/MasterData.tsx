import React, { useState, useEffect } from 'react';
import { User, Company, Area, Question, Course, TrainingPlan, Evaluation, JobPosition } from '../types';
import { Plus, Search, Edit2, Trash2, Users, Building, MapPin, X, Briefcase, Truck, Wrench, ShieldAlert, FileText, CheckSquare, BookOpen, Layers, ArrowLeft, Loader2, Info, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';

// Helper to extract real image URL from Google Redirects (Same as in Layout and Badge)
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

// --- INITIAL MOCK DATA EXPORTED FOR SEEDING ---
export const INITIAL_JOB_POSITIONS_MOCK = [
  "OPERARIO DE PRODUCCION - AFR",
  "OPERARIO DE PRODUCCION - MOLINERO CRUDO - CEMENTO",
  "OPERARIO DE CARGA DE CARGA A GRANEL",
  "OPERARIO DE PRODUCCION - HORNERO / TORRERO",
  "OPERARIO DE PRODUCCION - MECANICO",
  "OPERARIO DE PRODUCCIÓN - ELECTRICO",
  "OPERARIO DE PRODUCCION - MATERIAS PRIMAS",
  "OPERARIO DE PRODUCCION - EMBOLSADORA EXPEDICION",
  "OPERARIO DE PRODUCCION - EMBOLSADORA AUTOELEVADORISTA",
  "OPERARIO DE MATENIMIENTO - EMBOLSADORA / MORTEROS",
  "OPERARIO DE PRODUCCION - MORTEROS",
  "OPERARIO DE PRODUCCION - MORTEROS / PALERO",
  "OPERARIO DE PRODUCCION - MORTEROS / AUTOELEVADORISTA",
  "OPERARIO DE PRODUCCION - TRITURACION",
  "OPERARIO DE MANTENIMIENTO MECANICO",
  "OPERARIO DE MATENIMIENTO ELECTRICO",
  "OPERARIO DE LUBRICACION",
  "INSPECTOR DE MANTENIMIENTO PREVENTIVO",
  "INSPECTOR DE MANTENIMIENTO PREVENTIVO - ELECTRICO",
  "SUPERVISOR DE MANTENIMIENTO - ELECTRICO",
  "SUPERVISOR DE MANTENIMIENTO",
  "COORDINADOR DE MANTENIMIENTO",
  "SUPERVISOR DE PRODUCCION",
  "COORDINADOR DE PRODUCCION",
  "SUPERVISOR DE CANTERA / TRITURACION",
  "SUPERVISOR DE EMBOLSADORA",
  "SUPERVISOR DE CALIDAD",
  "PERSONAL DE HYS",
  "PERSONAL DE SERVICIO MEDICO",
  "OPERARIO DE ALMACEN",
  "OPERARIO DE LABORATORIO / CALIDAD",
  "GERENTE DE PLANTA",
  "GERENTE DE PROYECTO",
  "COORDINADOR DE PROYECTO",
  "PERSONAL DE DESPACHO",
  "JEFE DE CALIDAD",
  "JEFE DE PRODUCCIÓN",
  "JEFE DE MANTEIMIENTO",
  "JEFE DE CANTERA",
  "PERSONAL ADMINISTRATIVO",
  "INGENIERO DE PROCESO",
  "OPERADOR DE TABLERO DE CONTROL",
  "PERSONAL DE CAPEX"
];

export const INITIAL_EVALUATIONS_MOCK: Evaluation[] = [
  {
    id: '1', name: 'Examen Trabajo en Altura', passingScore: 80,
    questions: [
       { id: 'q1', text: '¿A qué altura se considera trabajo en altura?', options: ['1.5m', '1.8m', '2.0m'], correctIndex: 1 },
       { id: 'q2', text: '¿Qué elemento es fundamental?', options: ['Casco', 'Arnés', 'Ambos'], correctIndex: 2 }
    ]
  },
  {
    id: '2', name: 'Examen Riesgo Eléctrico', passingScore: 70,
    questions: [
       { id: 'q3', text: '¿Qué es un EPP dieléctrico?', options: ['Conductor', 'Aislante', 'Metálico'], correctIndex: 1 }
    ]
  }
];
export const INITIAL_COURSES_MOCK: Course[] = [
  { id: '1', title: 'Trabajo en Altura Nivel 1', description: 'Fundamentos básicos.', contentType: 'VIDEO', contentUrl: '', validityMonths: 12, evaluationId: '1', isOneTime: false, requiresPractical: true },
  { id: '2', title: 'Trabajo en Altura Nivel 2', description: 'Técnicas avanzadas.', contentType: 'VIDEO', contentUrl: '', validityMonths: 12, evaluationId: '1', isOneTime: false, requiresPractical: true }, // Shares Exam 1
  { id: '3', title: 'Seguridad Eléctrica', description: 'Normas y procedimientos.', contentType: 'PDF', contentUrl: '', validityMonths: 24, evaluationId: '2', isOneTime: false, requiresPractical: false }
];
export const INITIAL_PLANS_MOCK: TrainingPlan[] = [
  { id: '1', name: 'Plan Operario General', positionIds: ['OPERARIO DE PRODUCCION - AFR'], courseIds: ['1', '2'] }
];

// Re-export for other components to fallback if needed, though they should eventually fetch from DB
export const INITIAL_EVALUATIONS = INITIAL_EVALUATIONS_MOCK;
export const INITIAL_COURSES = INITIAL_COURSES_MOCK;
export const INITIAL_PLANS = INITIAL_PLANS_MOCK;

const TAB_GROUPS = [
  {
    label: 'Organización',
    tabs: [
      { id: 'users', label: 'Usuarios', icon: <Users size={16}/>, collection: 'users' },
      { id: 'companies', label: 'Empresas', icon: <Building size={16}/>, collection: 'companies' },
      { id: 'areas', label: 'Áreas', icon: <MapPin size={16}/>, collection: 'areas' },
      { id: 'positions', label: 'Puestos', icon: <Briefcase size={16}/>, collection: 'positions' },
    ]
  },
  {
    label: 'Activos',
    tabs: [
      { id: 'vehicles', label: 'Vehículos', icon: <Truck size={16}/>, collection: 'vehicles' },
      { id: 'machines', label: 'Máquinas', icon: <Wrench size={16}/>, collection: 'machines' },
    ]
  },
  {
    label: 'Parametría MDC',
    tabs: [
      { id: 'standards', label: 'Tipos de Estándar', icon: <FileText size={16}/>, collection: 'standards' },
      { id: 'risks', label: 'Riesgos Asociados', icon: <ShieldAlert size={16}/>, collection: 'risks' },
    ]
  },
  {
    label: 'Academia',
    tabs: [
      { id: 'evaluations', label: 'Evaluaciones', icon: <CheckSquare size={16}/>, collection: 'evaluations' },
      { id: 'courses', label: 'Cursos', icon: <BookOpen size={16}/>, collection: 'courses' },
      { id: 'plans', label: 'Planes', icon: <Layers size={16}/>, collection: 'plans' },
    ]
  },
];

type TabType = string;

const MasterData = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Data State
  const [data, setData] = useState<any[]>([]);

  // Lookup Data State
  const [companiesLookup, setCompaniesLookup] = useState<Company[]>([]);
  const [areasLookup, setAreasLookup] = useState<Area[]>([]);
  
  // Academia Lookups
  const [allPositions, setAllPositions] = useState<JobPosition[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allEvaluations, setAllEvaluations] = useState<Evaluation[]>([]);

  const currentGroup = TAB_GROUPS.find(g => g.tabs.some(t => t.id === activeTab)) || TAB_GROUPS[0];
  const currentTabDef = currentGroup.tabs.find(t => t.id === activeTab);
  const collectionName = currentTabDef?.collection || 'users';

  // --- FETCH LOOKUPS (Dependencies) ---
  const fetchLookups = async () => {
    try {
        const compSnap = await getDocs(collection(db, 'companies'));
        setCompaniesLookup(compSnap.docs.map(d => ({id: d.id, ...d.data()} as Company)));
        
        const areaSnap = await getDocs(collection(db, 'areas'));
        setAreasLookup(areaSnap.docs.map(d => ({id: d.id, ...d.data()} as Area)));

        // Academia Lookups
        const posSnap = await getDocs(collection(db, 'positions'));
        setAllPositions(posSnap.docs.map(d => ({id: d.id, ...d.data()} as JobPosition)));

        const courseSnap = await getDocs(collection(db, 'courses'));
        setAllCourses(courseSnap.docs.map(d => ({id: d.id, ...d.data()} as Course)));

        const evalSnap = await getDocs(collection(db, 'evaluations'));
        setAllEvaluations(evalSnap.docs.map(d => ({id: d.id, ...d.data()} as Evaluation)));

    } catch(e) {
        console.error("Error loading lookups", e);
    }
  };

  useEffect(() => {
    fetchLookups();
  }, [activeTab]);

  // --- FETCH DATA FROM FIRESTORE ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(items);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      alert(`Error de conexión: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // --- FORM STATES ---
  const [formData, setFormData] = useState<any>({});
  
  // Question Builder State (For Evaluations)
  const [tempQuestion, setTempQuestion] = useState<Partial<Question>>({ text: '', options: ['', '', ''], correctIndex: 0 });

  const resetForm = () => {
    setFormData({});
    setTempQuestion({ text: '', options: ['', '', ''], correctIndex: 0 });
    setEditingId(null);
    setIsModalOpen(false);
  };

  // --- GENERIC SUBMIT HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Auto Clean Image URL if present in formData
    const finalFormData = { ...formData };
    if (finalFormData.photoUrl) {
        const cleanUrl = getCleanImageSrc(finalFormData.photoUrl);
        if (cleanUrl) finalFormData.photoUrl = cleanUrl;
    }

    try {
      if (editingId) {
        // Update
        const docRef = doc(db, collectionName, editingId);
        await updateDoc(docRef, finalFormData);
      } else {
        // Create
        if (finalFormData.id && activeTab === 'users') {
             await setDoc(doc(db, collectionName, finalFormData.id), finalFormData);
        } else {
             await addDoc(collection(db, collectionName), finalFormData);
        }
      }
      await fetchData();
      resetForm();
    } catch (e: any) {
      console.error(e);
      let errorMsg = `Error al guardar datos: ${e.message}`;
      if (e.message.includes('permission-denied')) {
        errorMsg = "Permisos insuficientes: Verifica las reglas de Firestore en la consola de Firebase.";
      }
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm("¿Eliminar registro?")) return;
      try {
          await deleteDoc(doc(db, collectionName, id));
          setData(prev => prev.filter(i => i.id !== id));
      } catch (e: any) {
          alert(`Error al eliminar: ${e.message}`);
      }
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  // --- HELPER FOR MULTI SELECT ---
  const toggleSelection = (field: string, id: string) => {
    setFormData((prev: any) => {
      const current = prev[field] || [];
      return { ...prev, [field]: current.includes(id) ? current.filter((x:any) => x !== id) : [...current, id] };
    });
  };

  // --- QUESTION MANAGEMENT FOR EVALUATIONS ---
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(tempQuestion.options || [])];
    newOptions[index] = value;
    setTempQuestion({ ...tempQuestion, options: newOptions });
  };

  const addQuestion = () => {
    if (!tempQuestion.text || tempQuestion.options?.some(o => !o)) {
      alert("Complete la pregunta y todas las opciones");
      return;
    }
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: tempQuestion.text,
      options: tempQuestion.options || [],
      correctIndex: tempQuestion.correctIndex || 0
    };
    
    setFormData({ ...formData, questions: [...(formData.questions || []), newQuestion] });
    setTempQuestion({ text: '', options: ['', '', ''], correctIndex: 0 });
  };

  const deleteQuestion = (idx: number) => {
    const updated = [...(formData.questions || [])];
    updated.splice(idx, 1);
    setFormData({ ...formData, questions: updated });
  };

  const handleParentTabClick = (group: typeof TAB_GROUPS[0]) => setActiveTab(group.tabs[0].id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="bg-white p-2 rounded-full border border-slate-200 text-slate-500 hover:text-brand-800 hover:border-brand-300 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-brand-800">Datos Maestros</h2>
            <p className="text-slate-500">Gestión de base de datos ({data.length} registros)</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto no-scrollbar">
        {TAB_GROUPS.map((group, idx) => {
          const isActiveGroup = group.label === currentGroup.label;
          return (
            <button key={idx} onClick={() => handleParentTabClick(group)}
              className={`px-6 py-3 font-bold text-sm uppercase tracking-wide transition-all relative rounded-t-lg shrink-0 ${isActiveGroup ? 'text-brand-800 bg-brand-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
              {group.label}
              {isActiveGroup && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-800"></div>}
            </button>
          );
        })}
      </div>

      <div className="bg-slate-50 p-2 rounded-lg flex flex-wrap gap-2">
         {currentGroup.tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm ${activeTab === tab.id ? 'bg-white text-brand-800 border border-slate-200 ring-1 ring-brand-100' : 'bg-transparent text-slate-600 hover:bg-slate-200 border border-transparent'}`}>
              {tab.icon} {tab.label}
            </button>
         ))}
      </div>

      <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input type="text" placeholder="Buscar..." className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-md text-sm focus:ring-2 focus:ring-brand-500 outline-none w-64 text-slate-900" />
        </div>
        <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-brand-800 hover:bg-brand-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> Nuevo Registro
        </button>
      </div>

      {isLoading ? (
          <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-brand-600" size={40} />
          </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                <tr>
                    <th className="p-4">ID / Nombre</th>
                    <th className="p-4">Detalle</th>
                    <th className="p-4 text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {data.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-slate-400">Sin registros.</td></tr>}
                {data.map(item => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-800">
                            {activeTab === 'users' ? `${item.firstName} ${item.lastName}` : (item.name || item.title || item.plate || item.id)}
                            {activeTab === 'users' && <span className="block text-xs text-slate-400 font-mono">{item.id}</span>}
                        </td>
                        <td className="p-4 text-slate-500">
                            {activeTab === 'users' && item.position}
                            {activeTab === 'plans' && `${item.courseIds?.length || 0} Cursos`}
                            {activeTab === 'courses' && `${item.validityMonths} meses`}
                            {activeTab === 'evaluations' && `${item.questions?.length || 0} Preguntas`}
                        </td>
                        <td className="p-4 text-right space-x-2">
                            <button onClick={() => openEdit(item)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><Edit2 size={16}/></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Editar' : 'Nuevo'} Registro</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            
            <div className="p-6">
               <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* --- USERS FORM --- */}
                  {activeTab === 'users' && (
                     <>
                        <input required placeholder="DNI / Legajo" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.id || ''} onChange={e => setFormData({...formData, id: e.target.value})} disabled={!!editingId} />
                        <input required placeholder="Nombre" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        <input required placeholder="Apellido" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        <input required type="email" placeholder="Email" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.emails?.[0] || ''} onChange={e => setFormData({...formData, emails: [e.target.value]})} />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <select required className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="">Seleccione Rol...</option>
                                <option value="Gerencia">Gerencia</option>
                                <option value="Jefatura">Jefatura</option>
                                <option value="Coordinador">Coordinador</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Operario">Operario</option>
                                <option value="Pasante">Pasante</option>
                            </select>

                            <select required className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.profile || ''} onChange={e => setFormData({...formData, profile: e.target.value})}>
                                <option value="">Seleccione Perfil...</option>
                                <option value="Administrador">Administrador</option>
                                <option value="Usuario">Usuario</option>
                                <option value="Usuario Tercero">Usuario Tercero</option>
                            </select>
                        </div>

                        <select required className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.position || ''} onChange={e => setFormData({...formData, position: e.target.value})}>
                            <option value="">Seleccione Puesto...</option>
                            {allPositions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            {/* Fallback to static list if empty */}
                            {allPositions.length === 0 && INITIAL_JOB_POSITIONS_MOCK.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <select required className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.companyId || ''} onChange={e => setFormData({...formData, companyId: e.target.value})}>
                                <option value="">Seleccione Empresa...</option>
                                {companiesLookup.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select required className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.areaId || ''} onChange={e => setFormData({...formData, areaId: e.target.value})}>
                                <option value="">Seleccione Área...</option>
                                {areasLookup.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        
                        <input 
                           type="url" 
                           placeholder="URL de Foto de Perfil (Opcional)" 
                           className="w-full p-2 border rounded text-slate-900 bg-white" 
                           value={formData.photoUrl || ''} 
                           onChange={e => setFormData({...formData, photoUrl: e.target.value})} 
                        />
                        {formData.photoUrl && formData.photoUrl.includes('google.com/imgres') && (
                            <div className="mt-1 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                                Se ha detectado un enlace de redirección de Google. El sistema intentará extraer la imagen real al guardar.
                            </div>
                        )}

                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800 flex gap-2 items-start mt-2">
                           <Info size={16} className="shrink-0 mt-0.5" />
                           <p>
                             <strong>Importante:</strong> Al guardar, recuerde crear también la cuenta en 
                             <em> Firebase Authentication</em> con el mismo email.
                           </p>
                        </div>
                     </>
                  )}

                  {/* --- GENERIC NAME FIELD --- */}
                  {['companies', 'areas', 'positions', 'standards', 'risks'].includes(activeTab) && (
                      <input required placeholder="Nombre" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                  )}
                  
                  {activeTab === 'vehicles' && (
                     <>
                        <input required placeholder="Patente" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.plate || ''} onChange={e => setFormData({...formData, plate: e.target.value})} />
                        <input required placeholder="Marca" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.brand || ''} onChange={e => setFormData({...formData, brand: e.target.value})} />
                        <input required placeholder="Modelo" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.model || ''} onChange={e => setFormData({...formData, model: e.target.value})} />
                     </>
                  )}

                  {activeTab === 'machines' && (
                     <>
                        <input required placeholder="Nro Serie" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.serialNumber || ''} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
                        <input required placeholder="Marca" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.brand || ''} onChange={e => setFormData({...formData, brand: e.target.value})} />
                        <input required placeholder="Modelo" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.model || ''} onChange={e => setFormData({...formData, model: e.target.value})} />
                     </>
                  )}

                  {/* --- COURSES FORM --- */}
                  {activeTab === 'courses' && (
                     <>
                        <input required placeholder="Título" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
                        <textarea placeholder="Descripción" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                             <select className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.contentType || 'VIDEO'} onChange={e => setFormData({...formData, contentType: e.target.value})}>
                                <option value="VIDEO">Video (YouTube/URL)</option>
                                <option value="PDF">Documento PDF</option>
                             </select>
                             <input placeholder="URL Contenido" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.contentUrl || ''} onChange={e => setFormData({...formData, contentUrl: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <input type="number" placeholder="Vigencia (Meses)" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.validityMonths || ''} onChange={e => setFormData({...formData, validityMonths: Number(e.target.value)})} />
                           <select className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.evaluationId || ''} onChange={e => setFormData({...formData, evaluationId: e.target.value})}>
                                <option value="">Sin Evaluación (Solo Contenido)</option>
                                {allEvaluations.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                           </select>
                        </div>
                        <div className="flex gap-4 p-2 bg-slate-50 rounded border border-slate-100">
                            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                <input type="checkbox" checked={formData.isOneTime || false} onChange={e => setFormData({...formData, isOneTime: e.target.checked})} className="w-4 h-4 text-brand-600 rounded" />
                                Por única vez
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                <input type="checkbox" checked={formData.requiresPractical || false} onChange={e => setFormData({...formData, requiresPractical: e.target.checked})} className="w-4 h-4 text-brand-600 rounded" />
                                Requiere Práctico
                            </label>
                        </div>
                     </>
                  )}

                  {/* --- PLANS FORM --- */}
                  {activeTab === 'plans' && (
                     <>
                        <input required placeholder="Nombre del Plan" className="w-full p-2 border rounded text-slate-900 bg-white font-bold" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                        
                        <div className="border border-slate-200 rounded-lg p-3">
                           <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Puestos Asociados</h4>
                           <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                              {allPositions.length === 0 && <p className="text-xs text-slate-400">No hay puestos cargados.</p>}
                              {allPositions.map(pos => (
                                 <button type="button" key={pos.id} onClick={() => toggleSelection('positionIds', pos.name)}
                                    className={`text-xs px-2 py-1 rounded border transition-colors ${formData.positionIds?.includes(pos.name) ? 'bg-brand-100 text-brand-800 border-brand-300 font-bold' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                                    {pos.name}
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="border border-slate-200 rounded-lg p-3">
                           <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Cursos del Plan</h4>
                           <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                              {allCourses.length === 0 && <p className="text-xs text-slate-400">No hay cursos cargados.</p>}
                              {allCourses.map(course => (
                                 <button type="button" key={course.id} onClick={() => toggleSelection('courseIds', course.id)}
                                    className={`text-xs px-2 py-1 rounded border transition-colors ${formData.courseIds?.includes(course.id) ? 'bg-purple-100 text-purple-800 border-purple-300 font-bold' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                                    {course.title}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </>
                  )}

                  {/* --- EVALUATIONS FORM --- */}
                  {activeTab === 'evaluations' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500">Nombre Examen</label>
                                <input required placeholder="Ej. Examen de Altura" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500">Score Aprobación (%)</label>
                                <input type="number" placeholder="80" className="w-full p-2 border rounded text-slate-900 bg-white" value={formData.passingScore || ''} onChange={e => setFormData({...formData, passingScore: Number(e.target.value)})} />
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><CheckSquare size={16}/> Preguntas ({formData.questions?.length || 0})</h4>
                            
                            {/* Existing Questions List */}
                            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                                {formData.questions?.map((q: Question, idx: number) => (
                                    <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-200 flex justify-between items-center text-sm">
                                        <div>
                                            <span className="font-bold text-slate-700 block">{idx + 1}. {q.text}</span>
                                            <span className="text-xs text-green-600">Respuesta: {q.options[q.correctIndex]}</span>
                                        </div>
                                        <button type="button" onClick={() => deleteQuestion(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>

                            {/* Question Builder */}
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <h5 className="text-xs font-bold text-blue-800 uppercase mb-2">Nueva Pregunta</h5>
                                <input className="w-full p-2 border rounded text-slate-900 bg-white mb-2 text-sm" placeholder="Texto de la pregunta..." value={tempQuestion.text} onChange={e => setTempQuestion({...tempQuestion, text: e.target.value})} />
                                <div className="space-y-1 mb-2">
                                    {[0, 1, 2].map((i) => (
                                        <input key={i} className="w-full p-1.5 border rounded text-slate-700 bg-white text-xs" placeholder={`Opción ${i+1}`} value={tempQuestion.options?.[i] || ''} onChange={e => handleOptionChange(i, e.target.value)} />
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500">Correcta:</span>
                                        <select className="p-1 border rounded text-sm bg-white" value={tempQuestion.correctIndex} onChange={e => setTempQuestion({...tempQuestion, correctIndex: Number(e.target.value)})}>
                                            <option value={0}>Opción 1</option>
                                            <option value={1}>Opción 2</option>
                                            <option value={2}>Opción 3</option>
                                        </select>
                                    </div>
                                    <button type="button" onClick={addQuestion} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700">Agregar</button>
                                </div>
                            </div>
                        </div>
                      </div>
                  )}

                  <button type="submit" className="w-full bg-brand-800 hover:bg-brand-900 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg mt-4">
                      {isLoading ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> Guardar Registro</>}
                  </button>
               </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;