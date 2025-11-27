import React, { useState } from 'react';
import { User, Company, Area, UserRole, UserProfile, JobPosition, Vehicle, Machine } from '../types';
import { Plus, Search, Edit2, Trash2, Users, Building, MapPin, Save, X, Upload, Briefcase, Truck, Wrench } from 'lucide-react';

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

const MasterData = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'companies' | 'areas' | 'positions' | 'vehicles' | 'machines'>('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Mock Data
  const [companies, setCompanies] = useState<Company[]>([
    { id: '1', name: 'Cementos Del Sur' },
    { id: '2', name: 'Logística Externa S.A.' }
  ]);
  const [areas, setAreas] = useState<Area[]>([
    { id: '1', name: 'Producción' },
    { id: '2', name: 'Mantenimiento' },
    { id: '3', name: 'Calidad' }
  ]);
  const [positions, setPositions] = useState<JobPosition[]>(
    INITIAL_JOB_POSITIONS.map((name, index) => ({ id: index.toString(), name }))
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: '1', plate: 'AB123CD', brand: 'Toyota', model: 'Hilux' },
    { id: '2', plate: 'AD456EF', brand: 'Ford', model: 'Ranger' }
  ]);
  const [machines, setMachines] = useState<Machine[]>([
    { id: '1', serialNumber: 'SN-998877', brand: 'Caterpillar', model: 'Excavadora 320' },
    { id: '2', serialNumber: 'SN-112233', brand: 'Komatsu', model: 'PC200' }
  ]);
  
  const [users, setUsers] = useState<User[]>([
    {
      id: '20304050',
      firstName: 'Carlos',
      lastName: 'Mendez',
      emails: ['carlos.mendez@empresa.com'],
      role: 'Supervisor',
      position: 'SUPERVISOR DE MANTENIMIENTO',
      profile: 'Usuario',
      companyId: '1',
      areaId: '2',
      avatarUrl: 'https://picsum.photos/40/40'
    }
  ]);

  // Form States
  const [userForm, setUserForm] = useState<Partial<User>>({
    id: '', firstName: '', lastName: '', emails: [], role: 'Operario', position: INITIAL_JOB_POSITIONS[0], profile: 'Usuario'
  });
  const [emailInput, setEmailInput] = useState('');
  
  // Generic Name form (Company, Area, Position)
  const [simpleName, setSimpleName] = useState('');

  // Asset Form (Vehicle / Machine)
  const [assetForm, setAssetForm] = useState({
    identifier: '', // Plate or Serial Number
    brand: '',
    model: ''
  });

  const resetForm = () => {
    setUserForm({
      id: '', firstName: '', lastName: '', emails: [], role: 'Operario', position: positions[0]?.name || '', profile: 'Usuario', companyId: '', areaId: '', bossId: ''
    });
    setSimpleName('');
    setEmailInput('');
    setAssetForm({ identifier: '', brand: '', model: '' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmails = emailInput ? [emailInput, ...(userForm.emails || [])] : (userForm.emails || []);
    const newUser = { ...userForm, emails: finalEmails } as User;

    if (editingId) {
      setUsers(users.map(u => u.id === editingId ? { ...u, ...newUser } : u));
    } else {
      if (users.find(u => u.id === newUser.id)) {
        alert('El DNI/Legajo ya existe.');
        return;
      }
      setUsers([...users, newUser]);
    }
    resetForm();
  };

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'vehicles') {
      const newItem: Vehicle = { 
        id: editingId || Date.now().toString(), 
        plate: assetForm.identifier, 
        brand: assetForm.brand, 
        model: assetForm.model 
      };
      if (editingId) {
        setVehicles(vehicles.map(v => v.id === editingId ? newItem : v));
      } else {
        setVehicles([...vehicles, newItem]);
      }
    } else if (activeTab === 'machines') {
      const newItem: Machine = { 
        id: editingId || Date.now().toString(), 
        serialNumber: assetForm.identifier, 
        brand: assetForm.brand, 
        model: assetForm.model 
      };
      if (editingId) {
        setMachines(machines.map(m => m.id === editingId ? newItem : m));
      } else {
        setMachines([...machines, newItem]);
      }
    }
    resetForm();
  };

  const handleSimpleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = { id: editingId || Date.now().toString(), name: simpleName };
    
    if (activeTab === 'companies') {
       if (editingId) setCompanies(companies.map(c => c.id === editingId ? newItem : c));
       else setCompanies([...companies, newItem]);
    } else if (activeTab === 'areas') {
       if (editingId) setAreas(areas.map(a => a.id === editingId ? newItem : a));
       else setAreas([...areas, newItem]);
    } else if (activeTab === 'positions') {
       if (editingId) setPositions(positions.map(p => p.id === editingId ? newItem : p));
       else setPositions([newItem, ...positions]);
    }
    resetForm();
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    if (activeTab === 'users') {
      const u = item as User;
      setUserForm(u);
      setEmailInput(u.emails[0] || '');
    } else if (activeTab === 'vehicles') {
      const v = item as Vehicle;
      setAssetForm({ identifier: v.plate, brand: v.brand, model: v.model });
    } else if (activeTab === 'machines') {
      const m = item as Machine;
      setAssetForm({ identifier: m.serialNumber, brand: m.brand, model: m.model });
    } else {
      setSimpleName(item.name);
    }
    setIsModalOpen(true);
  };

  const deleteItem = (id: string) => {
    if (!confirm('¿Está seguro de eliminar este registro?')) return;
    if (activeTab === 'users') setUsers(users.filter(u => u.id !== id));
    if (activeTab === 'companies') setCompanies(companies.filter(c => c.id !== id));
    if (activeTab === 'areas') setAreas(areas.filter(a => a.id !== id));
    if (activeTab === 'positions') setPositions(positions.filter(p => p.id !== id));
    if (activeTab === 'vehicles') setVehicles(vehicles.filter(v => v.id !== id));
    if (activeTab === 'machines') setMachines(machines.filter(m => m.id !== id));
  };

  const getActiveTabTitle = () => {
    switch(activeTab) {
      case 'users': return 'Usuario';
      case 'companies': return 'Empresa';
      case 'areas': return 'Área';
      case 'positions': return 'Puesto';
      case 'vehicles': return 'Vehículo';
      case 'machines': return 'Máquina';
      default: return 'Registro';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-800">Datos Maestros</h2>
          <p className="text-slate-500">Gestión de usuarios, estructuras y activos.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'users', label: 'Usuarios', icon: <Users size={18}/> },
          { id: 'companies', label: 'Empresas', icon: <Building size={18}/> },
          { id: 'areas', label: 'Áreas', icon: <MapPin size={18}/> },
          { id: 'positions', label: 'Puestos', icon: <Briefcase size={18}/> },
          { id: 'vehicles', label: 'Vehículos', icon: <Truck size={18}/> },
          { id: 'machines', label: 'Máquinas', icon: <Wrench size={18}/> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id ? 'border-brand-800 text-brand-800' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-md text-sm focus:ring-2 focus:ring-brand-500 outline-none w-64"
          />
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-brand-800 hover:bg-brand-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Nuevo {getActiveTabTitle()}
        </button>
      </div>

      {/* Content Lists */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Puesto / Cargo</th>
                  <th className="p-4">Ubicación</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-slate-500">ID: {u.id}</p>
                          <p className="text-xs text-blue-600">{u.emails[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{u.position}</p>
                      <span className="inline-block px-2 py-0.5 rounded text-xs bg-brand-50 text-brand-700 mt-1">{u.role}</span>
                    </td>
                    <td className="p-4">
                      <p>{areas.find(a => a.id === u.areaId)?.name || 'Sin Área'}</p>
                      <p className="text-xs text-slate-400">{companies.find(c => c.id === u.companyId)?.name || 'Sin Empresa'}</p>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEdit(u)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><Edit2 size={16}/></button>
                      <button onClick={() => deleteItem(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(activeTab === 'vehicles' || activeTab === 'machines') && (
           <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">{activeTab === 'vehicles' ? 'Patente' : 'Nro. Serie'}</th>
                  <th className="p-4">Marca</th>
                  <th className="p-4">Modelo</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const list: any[] = activeTab === 'vehicles' ? vehicles : machines;
                  return list.map((item: any) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-mono text-xs text-slate-500">{item.id}</td>
                      <td className="p-4 font-bold text-slate-800">{activeTab === 'vehicles' ? item.plate : item.serialNumber}</td>
                      <td className="p-4">{item.brand}</td>
                      <td className="p-4">{item.model}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => openEdit(item)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><Edit2 size={16}/></button>
                        <button onClick={() => deleteItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
           </table>
        )}

        {(activeTab === 'companies' || activeTab === 'areas' || activeTab === 'positions') && (
          <table className="w-full text-left text-sm text-slate-600">
             <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {/* Dynamically select list based on tab */}
                {(() => {
                  let list: any[] = [];
                  if (activeTab === 'companies') list = companies;
                  else if (activeTab === 'areas') list = areas;
                  else if (activeTab === 'positions') list = positions;
                  
                  return list.map((item: any) => (
                   <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-mono text-xs w-32">{item.id}</td>
                      <td className="p-4 font-bold text-slate-800">{item.name}</td>
                      <td className="p-4 text-right space-x-2 w-32">
                        <button onClick={() => openEdit(item)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><Edit2 size={16}/></button>
                        <button onClick={() => deleteItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
                      </td>
                   </tr>
                  ));
                })()}
              </tbody>
          </table>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? 'Editar Registro' : 'Nuevo Registro'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>

            <div className="p-6">
              {activeTab === 'users' ? (
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">DNI / Legajo *</label>
                      <input 
                        required 
                        disabled={!!editingId}
                        value={userForm.id} 
                        onChange={e => setUserForm({...userForm, id: e.target.value})}
                        className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none disabled:bg-slate-100 bg-white text-slate-800" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Email Principal *</label>
                      <input 
                        required 
                        type="email"
                        value={emailInput} 
                        onChange={e => setEmailInput(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800" 
                        placeholder="usuario@empresa.com"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Para múltiples emails, separe por coma (funcionalidad futura)</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Nombre *</label>
                      <input 
                        required 
                        value={userForm.firstName} 
                        onChange={e => setUserForm({...userForm, firstName: e.target.value})}
                        className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Apellido *</label>
                      <input 
                        required 
                        value={userForm.lastName} 
                        onChange={e => setUserForm({...userForm, lastName: e.target.value})}
                        className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Cargo *</label>
                      <select 
                        required 
                        value={userForm.role} 
                        onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})}
                        className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800"
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Perfil App *</label>
                      <select 
                        required 
                        value={userForm.profile} 
                        onChange={e => setUserForm({...userForm, profile: e.target.value as UserProfile})}
                        className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800"
                      >
                        {PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Puesto (Matriz de Capacitación) *</label>
                    <select 
                      required 
                      value={userForm.position} 
                      onChange={e => setUserForm({...userForm, position: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-sm text-slate-800"
                    >
                      {positions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Empresa *</label>
                      <select 
                        required 
                        value={userForm.companyId} 
                        onChange={e => setUserForm({...userForm, companyId: e.target.value})}
                        className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800"
                      >
                        <option value="">Seleccionar...</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Área *</label>
                      <select 
                        required 
                        value={userForm.areaId} 
                        onChange={e => setUserForm({...userForm, areaId: e.target.value})}
                        className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800"
                      >
                        <option value="">Seleccionar...</option>
                        {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Jefe Directo</label>
                    <select 
                      value={userForm.bossId || ''} 
                      onChange={e => setUserForm({...userForm, bossId: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800"
                    >
                      <option value="">Ninguno</option>
                      {users.filter(u => u.id !== userForm.id).map(u => (
                        <option key={u.id} value={u.id}>{u.firstName} {u.lastName} - {u.role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Foto de Perfil</label>
                    <div className="flex items-center gap-4 p-4 border border-dashed border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                        <Users size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">Click para subir imagen</p>
                        <p className="text-xs text-slate-400">JPG, PNG (Max 2MB)</p>
                      </div>
                      <Upload size={20} className="text-slate-400"/>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                    <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
                    <button type="submit" className="px-6 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-900 font-medium">Guardar Usuario</button>
                  </div>
                </form>
              ) : (activeTab === 'vehicles' || activeTab === 'machines') ? (
                <form onSubmit={handleAssetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      {activeTab === 'vehicles' ? 'Patente *' : 'Número de Serie *'}
                    </label>
                    <input 
                      required 
                      value={assetForm.identifier} 
                      onChange={e => setAssetForm({...assetForm, identifier: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Marca *</label>
                    <input 
                      required 
                      value={assetForm.brand} 
                      onChange={e => setAssetForm({...assetForm, brand: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Modelo *</label>
                    <input 
                      required 
                      value={assetForm.model} 
                      onChange={e => setAssetForm({...assetForm, model: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800" 
                    />
                  </div>
                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                    <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
                    <button type="submit" className="px-6 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-900 font-medium">Guardar {activeTab === 'vehicles' ? 'Vehículo' : 'Máquina'}</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSimpleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nombre del registro *</label>
                    <input 
                      required 
                      value={simpleName} 
                      onChange={e => setSimpleName(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded focus:border-brand-500 outline-none bg-white text-slate-800" 
                      placeholder={`Nombre de ${activeTab === 'companies' ? 'Empresa' : activeTab === 'areas' ? 'Área' : 'Puesto'}`}
                    />
                  </div>
                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                    <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
                    <button type="submit" className="px-6 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-900 font-medium">Guardar</button>
                  </div>
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