
import React, { useState } from 'react';
import { User, Company, Area, UserRole, UserProfile, JobPosition, Vehicle, Machine, StandardType, RiskType, Evaluation, Question, Course, TrainingPlan } from '../types';
import { Plus, Search, Edit2, Trash2, Users, Building, MapPin, X, Upload, Briefcase, Truck, Wrench, ShieldAlert, FileText, GraduationCap, BookOpen, Layers, CheckSquare, Link, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INITIAL_JOB_POSITIONS = [
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

const ROLES: UserRole[] = ['Gerencia', 'Jefatura', 'Coordinador', 'Supervisor', 'Operario', 'Pasante'];
const PROFILES: UserProfile[] = ['Administrador', 'Usuario', 'Usuario Tercero'];

type TabType = 'users' | 'companies' | 'areas' | 'positions' | 'vehicles' | 'machines' | 'standards' | 'risks' | 'evaluations' | 'courses' | 'plans';

const TAB_GROUPS = [
  {
    label: 'Organización',
    tabs: [
      { id: 'users', label: 'Usuarios', icon: <Users size={16}/> },
      { id: 'companies', label: 'Empresas', icon: <Building size={16}/> },
      { id: 'areas', label: 'Áreas', icon: <MapPin size={16}/> },
      { id: 'positions', label: 'Puestos', icon: <Briefcase size={16}/> },
    ]
  },
  {
    label: 'Activos',
    tabs: [
      { id: 'vehicles', label: 'Vehículos', icon: <Truck size={16}/> },
      { id: 'machines', label: 'Máquinas', icon: <Wrench size={16}/> },
    ]
  },
  {
    label: 'Parametría MDC',
    tabs: [
      { id: 'standards', label: 'Tipos de Estándar', icon: <FileText size={16}/> },
      { id: 'risks', label: 'Riesgos Asociados', icon: <ShieldAlert size={16}/> },
    ]
  },
  {
    label: 'Academia',
    tabs: [
      { id: 'evaluations', label: 'Evaluaciones', icon: <CheckSquare size={16}/> },
      { id: 'courses', label: 'Cursos', icon: <BookOpen size={16}/> },
      { id: 'plans', label: 'Planes', icon: <Layers size={16}/> },
    ]
  },
];

// --- MOCK DATA FOR LMS ---
export const INITIAL_EVALUATIONS: Evaluation[] = [
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
export const INITIAL_COURSES: Course[] = [
  { id: '1', title: 'Trabajo en Altura Nivel 1', description: 'Fundamentos básicos.', contentType: 'VIDEO', contentUrl: '', validityMonths: 12, evaluationId: '1', isOneTime: false, requiresPractical: true },
  { id: '2', title: 'Trabajo en Altura Nivel 2', description: 'Técnicas avanzadas.', contentType: 'VIDEO', contentUrl: '', validityMonths: 12, evaluationId: '1', isOneTime: false, requiresPractical: true }, // Shares Exam 1
  { id: '3', title: 'Seguridad Eléctrica', description: 'Normas y procedimientos.', contentType: 'PDF', contentUrl: '', validityMonths: 24, evaluationId: '2', isOneTime: false, requiresPractical: false }
];
export const INITIAL_PLANS: TrainingPlan[] = [
  { id: '1', name: 'Plan Operario General', positionIds: ['OPERARIO DE PRODUCCION - AFR'], courseIds: ['1', '2'] }
];

const MasterData = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentGroup = TAB_GROUPS.find(g => g.tabs.some(t => t.id === activeTab)) || TAB_GROUPS[0];

  // --- DATA STATES ---
  const [users, setUsers] = useState<User[]>([{ id: '20304050', firstName: 'Carlos', lastName: 'Mendez', emails: ['carlos@empresa.com'], role: 'Supervisor', position: 'SUPERVISOR DE MANTENIMIENTO', profile: 'Usuario', companyId: '1', areaId: '2' }]);
  const [companies, setCompanies] = useState<Company[]>([{ id: '1', name: 'Cementos Del Sur' }, { id: '2', name: 'Logística Externa' }]);
  const [areas, setAreas] = useState<Area[]>([{ id: '1', name: 'Producción' }, { id: '2', name: 'Mantenimiento' }]);
  const [positions, setPositions] = useState<JobPosition[]>(INITIAL_JOB_POSITIONS.map((name, index) => ({ id: index.toString(), name })));
  const [vehicles, setVehicles] = useState<Vehicle[]>([{ id: '1', plate: 'AB123CD', brand: 'Toyota', model: 'Hilux' }]);
  const [machines, setMachines] = useState<Machine[]>([{ id: '1', serialNumber: 'SN-998877', brand: 'Caterpillar', model: '320' }]);
  const [standards, setStandards] = useState<StandardType[]>([{ id: '1', name: 'Procedimiento Interno' }]);
  const [risks, setRisks] = useState<RiskType[]>([{ id: '1', name: 'Atrapamiento' }]);
  
  // LMS Data States
  const [evaluations, setEvaluations] = useState<Evaluation[]>(INITIAL_EVALUATIONS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [plans, setPlans] = useState<TrainingPlan[]>(INITIAL_PLANS);

  // --- FORM STATES ---
  const [userForm, setUserForm] = useState<Partial<User>>({});
  const [emailInput, setEmailInput] = useState('');
  const [simpleName, setSimpleName] = useState('');
  const [assetForm, setAssetForm] = useState({ identifier: '', brand: '', model: '' });

  // LMS Forms
  const [evaluationForm, setEvaluationForm] = useState<Partial<Evaluation>>({ questions: [] });
  const [courseForm, setCourseForm] = useState<Partial<Course>>({});
  const [planForm, setPlanForm] = useState<Partial<TrainingPlan>>({ positionIds: [], courseIds: [] });
  // Question Builder State
  const [tempQuestion, setTempQuestion] = useState<Partial<Question>>({ options: ['', ''], correctIndex: 0 });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  const resetForm = () => {
    setUserForm({ id: '', firstName: '', lastName: '', emails: [], role: 'Operario', position: positions[0]?.name || '' });
    setSimpleName('');
    setEmailInput('');
    setAssetForm({ identifier: '', brand: '', model: '' });
    setEvaluationForm({ name: '', passingScore: 80, questions: [] });
    setCourseForm({ title: '', description: '', validityMonths: 12, contentType: 'VIDEO', contentUrl: '', isOneTime: false, requiresPractical: false });
    setPlanForm({ name: '', positionIds: [], courseIds: [] });
    setTempQuestion({ text: '', options: ['', ''], correctIndex: 0 });
    setEditingQuestionIndex(null);
    setEditingId(null);
    setIsModalOpen(false);
  };

  // --- SUBMIT HANDLERS ---
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmails = emailInput ? [emailInput, ...(userForm.emails || [])] : (userForm.emails || []);
    const newUser = { ...userForm, emails: finalEmails } as User;
    if (editingId) setUsers(users.map(u => u.id === editingId ? { ...u, ...newUser } : u));
    else setUsers([...users, newUser]);
    resetForm();
  };

  const handleSimpleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = { id: editingId || Date.now().toString(), name: simpleName };
    if (activeTab === 'companies') setCompanies(editingId ? companies.map(x => x.id === editingId ? newItem : x) : [...companies, newItem]);
    else if (activeTab === 'areas') setAreas(editingId ? areas.map(x => x.id === editingId ? newItem : x) : [...areas, newItem]);
    else if (activeTab === 'positions') setPositions(editingId ? positions.map(x => x.id === editingId ? newItem : x) : [newItem, ...positions]);
    else if (activeTab === 'standards') setStandards(editingId ? standards.map(x => x.id === editingId ? newItem : x) : [...standards, newItem]);
    else if (activeTab === 'risks') setRisks(editingId ? risks.map(x => x.id === editingId ? newItem : x) : [...risks, newItem]);
    resetForm();
  };

  const handleLmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingId || Date.now().toString();

    if (activeTab === 'evaluations') {
      const newItem = { ...evaluationForm, id } as Evaluation;
      setEvaluations(editingId ? evaluations.map(x => x.id === editingId ? newItem : x) : [...evaluations, newItem]);
    } else if (activeTab === 'courses') {
      const newItem = { ...courseForm, id } as Course;
      setCourses(editingId ? courses.map(x => x.id === editingId ? newItem : x) : [...courses, newItem]);
    } else if (activeTab === 'plans') {
      const newItem = { ...planForm, id } as TrainingPlan;
      setPlans(editingId ? plans.map(x => x.id === editingId ? newItem : x) : [...plans, newItem]);
    }
    resetForm();
  };

  // --- QUESTION MANAGEMENT ---
  const saveQuestion = () => {
    if (!tempQuestion.text) return;
    const q: Question = { ...tempQuestion as Question, id: tempQuestion.id || Date.now().toString() };
    
    let updatedQuestions = [...(evaluationForm.questions || [])];
    
    if (editingQuestionIndex !== null) {
      // Update existing
      updatedQuestions[editingQuestionIndex] = q;
    } else {
      // Add new
      updatedQuestions.push(q);
    }

    setEvaluationForm({ ...evaluationForm, questions: updatedQuestions });
    setTempQuestion({ text: '', options: ['', ''], correctIndex: 0 });
    setEditingQuestionIndex(null);
  };

  const editQuestion = (idx: number) => {
    const q = evaluationForm.questions![idx];
    setTempQuestion(q);
    setEditingQuestionIndex(idx);
  };

  const deleteQuestion = (idx: number) => {
    const updatedQuestions = evaluationForm.questions!.filter((_, i) => i !== idx);
    setEvaluationForm({ ...evaluationForm, questions: updatedQuestions });
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    if (activeTab === 'evaluations') setEvaluationForm(item);
    else if (activeTab === 'courses') setCourseForm(item);
    else if (activeTab === 'plans') setPlanForm(item);
    else if (activeTab === 'users') { setUserForm(item); setEmailInput(item.emails[0] || ''); }
    else setSimpleName(item.name);
    setIsModalOpen(true);
  };

  const toggleSelection = (field: 'positionIds' | 'courseIds', id: string) => {
    setPlanForm(prev => {
      const current = prev[field] || [];
      return { ...prev, [field]: current.includes(id) ? current.filter(x => x !== id) : [...current, id] };
    });
  };

  const handleParentTabClick = (group: typeof TAB_GROUPS[0]) => setActiveTab(group.tabs[0].id as TabType);
  const getActiveTabTitle = () => TAB_GROUPS.flatMap(g => g.tabs).find(t => t.id === activeTab)?.label || 'Registro';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="bg-white p-2 rounded-full border border-slate-200 text-slate-500 hover:text-brand-800 hover:border-brand-300 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-brand-800">Datos Maestros</h2>
            <p className="text-slate-500">Gestión de usuarios, activos y academia.</p>
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
            <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)}
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
          <Plus size={18} /> Nuevo {getActiveTabTitle()}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Simplified Table Renderer */}
        <table className="w-full text-left text-sm text-slate-600">
           <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Nombre / Título</th>
                <th className="p-4">Detalle</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
           </thead>
           <tbody>
             {(() => {
                let list: any[] = [];
                if (activeTab === 'users') list = users.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, detail: u.position }));
                else if (activeTab === 'companies') list = companies.map(c => ({ ...c, detail: 'Empresa' }));
                else if (activeTab === 'areas') list = areas.map(a => ({ ...a, detail: 'Sector' }));
                else if (activeTab === 'positions') list = positions.map(p => ({ ...p, detail: 'Puesto Laboral' }));
                else if (activeTab === 'evaluations') list = evaluations.map(e => ({ ...e, detail: `${e.questions.length} Preguntas - Pase: ${e.passingScore}%` }));
                else if (activeTab === 'courses') list = courses.map(c => ({ id: c.id, name: c.title, detail: `Vigencia: ${c.validityMonths} meses ${c.isOneTime ? '(Unica Vez)' : ''}` }));
                else if (activeTab === 'plans') list = plans.map(p => ({ ...p, detail: `${p.courseIds.length} Cursos - ${p.positionIds.length} Puestos` }));
                else if (activeTab === 'standards') list = standards.map(s => ({ ...s, detail: 'Estándar MDC' }));
                else if (activeTab === 'risks') list = risks.map(r => ({ ...r, detail: 'Riesgo MDC' }));

                return list.map(item => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                     <td className="p-4 font-bold text-slate-800">{item.name}</td>
                     <td className="p-4 text-slate-500">{item.detail}</td>
                     <td className="p-4 text-right space-x-2">
                        <button onClick={() => openEdit(activeTab === 'users' ? users.find(u => u.id === item.id) : activeTab === 'courses' ? courses.find(c => c.id === item.id) : activeTab === 'plans' ? plans.find(p => p.id === item.id) : activeTab === 'evaluations' ? evaluations.find(e => e.id === item.id) : item)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><Edit2 size={16}/></button>
                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
                     </td>
                  </tr>
                ));
             })()}
           </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Editar' : 'Nuevo'} {getActiveTabTitle()}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            
            <div className="p-6">
               {/* USER FORM */}
               {activeTab === 'users' && (
                 <form onSubmit={handleUserSubmit} className="space-y-4">
                    <input required placeholder="DNI" className="w-full p-2 border rounded text-slate-900 bg-white" value={userForm.id} onChange={e => setUserForm({...userForm, id: e.target.value})} />
                    <input required placeholder="Nombre" className="w-full p-2 border rounded text-slate-900 bg-white" value={userForm.firstName} onChange={e => setUserForm({...userForm, firstName: e.target.value})} />
                    <input required placeholder="Apellido" className="w-full p-2 border rounded text-slate-900 bg-white" value={userForm.lastName} onChange={e => setUserForm({...userForm, lastName: e.target.value})} />
                    <select className="w-full p-2 border rounded text-slate-900 bg-white" value={userForm.position} onChange={e => setUserForm({...userForm, position: e.target.value})}>
                        {positions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                    <button type="submit" className="w-full bg-brand-800 text-white p-2 rounded">Guardar</button>
                 </form>
               )}
               
               {/* EVALUATION FORM */}
               {activeTab === 'evaluations' && (
                 <form onSubmit={handleLmsSubmit} className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold mb-1">Nombre Evaluación</label>
                       <input required className="w-full p-2 border rounded text-slate-900 bg-white" value={evaluationForm.name} onChange={e => setEvaluationForm({...evaluationForm, name: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-xs font-bold mb-1">Puntaje de Aprobación (%)</label>
                       <input type="number" className="w-full p-2 border rounded text-slate-900 bg-white" value={evaluationForm.passingScore} onChange={e => setEvaluationForm({...evaluationForm, passingScore: Number(e.target.value)})} />
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                       <h4 className="font-bold text-sm mb-2">{editingQuestionIndex !== null ? 'Editar Pregunta' : 'Agregar Pregunta'}</h4>
                       <input className="w-full p-2 border rounded mb-2 text-slate-900 bg-white" placeholder="Texto de la pregunta" value={tempQuestion.text} onChange={e => setTempQuestion({...tempQuestion, text: e.target.value})} />
                       <div className="grid grid-cols-2 gap-2 mb-2">
                          <input className="p-2 border rounded text-slate-900 bg-white" placeholder="Opción 1" value={tempQuestion.options?.[0]} onChange={e => setTempQuestion({...tempQuestion, options: [e.target.value, tempQuestion.options?.[1] || '', tempQuestion.options?.[2] || '']})} />
                          <input className="p-2 border rounded text-slate-900 bg-white" placeholder="Opción 2" value={tempQuestion.options?.[1]} onChange={e => setTempQuestion({...tempQuestion, options: [tempQuestion.options?.[0] || '', e.target.value, tempQuestion.options?.[2] || '']})} />
                          <input className="p-2 border rounded text-slate-900 bg-white" placeholder="Opción 3" value={tempQuestion.options?.[2]} onChange={e => setTempQuestion({...tempQuestion, options: [tempQuestion.options?.[0] || '', tempQuestion.options?.[1] || '', e.target.value]})} />
                          <select className="p-2 border rounded text-slate-900 bg-white" value={tempQuestion.correctIndex} onChange={e => setTempQuestion({...tempQuestion, correctIndex: Number(e.target.value)})}>
                             <option value={0}>Correcta: Opción 1</option>
                             <option value={1}>Correcta: Opción 2</option>
                             <option value={2}>Correcta: Opción 3</option>
                          </select>
                       </div>
                       <div className="flex gap-2">
                           <button type="button" onClick={saveQuestion} className="text-xs bg-brand-800 text-white px-3 py-1 rounded hover:bg-brand-900">
                             {editingQuestionIndex !== null ? 'Actualizar' : 'Agregar (+)'}
                           </button>
                           {editingQuestionIndex !== null && (
                               <button type="button" onClick={() => { setEditingQuestionIndex(null); setTempQuestion({ text: '', options: ['', ''], correctIndex: 0 }); }} className="text-xs bg-slate-200 px-3 py-1 rounded hover:bg-slate-300">
                                 Cancelar Edición
                               </button>
                           )}
                       </div>
                    </div>

                    <div className="space-y-2">
                       {evaluationForm.questions?.map((q, idx) => (
                          <div key={idx} className="text-xs bg-white border p-2 rounded flex justify-between items-center group hover:bg-slate-50">
                             <div className="flex-1">
                                <span className="font-semibold">{idx + 1}. {q.text}</span>
                                <span className="block text-green-600 font-bold mt-1">Resp: {q.options[q.correctIndex]}</span>
                             </div>
                             <div className="flex gap-1">
                                <button type="button" onClick={() => editQuestion(idx)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded">
                                   <Edit2 size={14} />
                                </button>
                                <button type="button" onClick={() => deleteQuestion(idx)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                                   <Trash2 size={14} />
                                </button>
                             </div>
                          </div>
                       ))}
                       {(!evaluationForm.questions || evaluationForm.questions.length === 0) && (
                         <p className="text-xs text-slate-400 italic text-center p-2">No hay preguntas cargadas</p>
                       )}
                    </div>

                    <button type="submit" className="w-full bg-brand-800 text-white p-2 rounded">Guardar Evaluación</button>
                 </form>
               )}

               {/* COURSE FORM */}
               {activeTab === 'courses' && (
                 <form onSubmit={handleLmsSubmit} className="space-y-4">
                    <input required placeholder="Título del Curso" className="w-full p-2 border rounded text-slate-900 bg-white" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} />
                    <textarea placeholder="Descripción" className="w-full p-2 border rounded text-slate-900 bg-white" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} />
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">URL de Contenido (Video/PDF)</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Link size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <input placeholder="https://..." className="w-full pl-9 p-2 border rounded text-slate-900 bg-white" value={courseForm.contentUrl} onChange={e => setCourseForm({...courseForm, contentUrl: e.target.value})} />
                            </div>
                            <button type="button" className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 rounded border border-slate-200" onClick={() => alert("Simulación de subida de archivo. En producción esto abriría el explorador.")}>
                                <Upload size={16} />
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Pegue una URL de YouTube/Vimeo o cargue un archivo PDF</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-bold text-slate-500">Vigencia (Meses)</label>
                          <input type="number" className="w-full p-2 border rounded text-slate-900 bg-white" value={courseForm.validityMonths} onChange={e => setCourseForm({...courseForm, validityMonths: Number(e.target.value)})} />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500">Evaluación Asociada</label>
                          <select className="w-full p-2 border rounded text-slate-900 bg-white" value={courseForm.evaluationId} onChange={e => setCourseForm({...courseForm, evaluationId: e.target.value})}>
                             <option value="">Sin evaluación</option>
                             {evaluations.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                       </div>
                    </div>
                    
                    {/* New Flags */}
                    <div className="flex gap-4">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-brand-600" checked={courseForm.isOneTime || false} onChange={e => setCourseForm({...courseForm, isOneTime: e.target.checked})} />
                          <span className="text-sm font-medium text-slate-700">Por única vez</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-brand-600" checked={courseForm.requiresPractical || false} onChange={e => setCourseForm({...courseForm, requiresPractical: e.target.checked})} />
                          <span className="text-sm font-medium text-slate-700">Requiere Examen Práctico</span>
                       </label>
                    </div>

                    <button type="submit" className="w-full bg-brand-800 text-white p-2 rounded">Guardar Curso</button>
                 </form>
               )}

               {/* PLAN FORM */}
               {activeTab === 'plans' && (
                 <form onSubmit={handleLmsSubmit} className="space-y-4">
                    <input required placeholder="Nombre del Plan" className="w-full p-2 border rounded text-slate-900 bg-white" value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} />
                    
                    <div>
                       <label className="block text-xs font-bold mb-2">Puestos Asociados</label>
                       <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border p-2 rounded">
                          {positions.map(p => (
                             <button type="button" key={p.id} onClick={() => toggleSelection('positionIds', p.name)}
                               className={`text-xs px-2 py-1 rounded border ${planForm.positionIds?.includes(p.name) ? 'bg-brand-100 border-brand-500 text-brand-800' : 'bg-slate-50'}`}>
                               {p.name}
                             </button>
                          ))}
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold mb-2">Cursos del Plan</label>
                       <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border p-2 rounded">
                          {courses.map(c => (
                             <button type="button" key={c.id} onClick={() => toggleSelection('courseIds', c.id)}
                               className={`text-xs px-2 py-1 rounded border ${planForm.courseIds?.includes(c.id) ? 'bg-green-100 border-green-500 text-green-800' : 'bg-slate-50'}`}>
                               {c.title}
                             </button>
                          ))}
                       </div>
                    </div>
                    <button type="submit" className="w-full bg-brand-800 text-white p-2 rounded">Guardar Plan</button>
                 </form>
               )}

               {/* GENERIC FORM */}
               {['companies', 'areas', 'positions', 'standards', 'risks'].includes(activeTab) && (
                 <form onSubmit={handleSimpleSubmit} className="space-y-4">
                    <input required placeholder="Nombre" className="w-full p-2 border rounded text-slate-900 bg-white" value={simpleName} onChange={e => setSimpleName(e.target.value)} />
                    <button type="submit" className="w-full bg-brand-800 text-white p-2 rounded">Guardar</button>
                 </form>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
