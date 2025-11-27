import React, { useState } from 'react';
import { Certification } from '../types';
import { QrCode, Shield, Calendar, UserCheck } from 'lucide-react';

const MOCK_CERTS: Certification[] = [
  { id: '1', name: 'Trabajo en Altura', issuedDate: '2023-01-15', expiryDate: '2024-01-15', status: 'active' },
  { id: '2', name: 'Manejo de Montacargas', issuedDate: '2022-05-10', expiryDate: '2023-05-10', status: 'expired' },
  { id: '3', name: 'Espacios Confinados', issuedDate: '2023-06-20', expiryDate: '2024-06-20', status: 'active' },
];

const Badge = () => {
  const [mode, setMode] = useState<'view' | 'scan'>('view');

  const QR_DATA = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=USER_ID_12345_TOKEN_XYZ";

  if (mode === 'scan') {
    return (
      <div className="max-w-md mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Modo Supervisor</h2>
        <p className="text-slate-500">Escanee el QR del operario para ver habilitaciones.</p>
        
        <div className="bg-black rounded-xl overflow-hidden aspect-square relative flex items-center justify-center">
            {/* Simulation of Camera Feed */}
            <div className="absolute inset-0 bg-slate-900 opacity-50"></div>
            <div className="absolute w-64 h-64 border-2 border-safety-500 rounded-lg z-10 animate-pulse"></div>
            <p className="text-white z-20 font-mono">Buscando código QR...</p>
        </div>

        <button 
          onClick={() => setMode('view')}
          className="text-slate-500 underline"
        >
          Cancelar Escaneo
        </button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Digital ID Card */}
      <div className="flex flex-col items-center">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-industrial-900 h-24 relative">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <img 
                src="https://picsum.photos/120/120" 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-4 border-white shadow-md"
              />
            </div>
          </div>
          <div className="pt-14 pb-8 px-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800">Carlos Mendez</h2>
            <p className="text-slate-500 font-medium">Supervisor de Mantenimiento</p>
            <p className="text-xs text-slate-400 mt-1">ID: EMP-88219</p>

            <div className="mt-6 flex justify-center">
              <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-inner">
                <img src={QR_DATA} alt="User QR" className="w-48 h-48" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Escanee para validar habilitaciones en campo</p>
          </div>
          <div className="bg-safety-50 p-4 border-t border-safety-100 flex justify-center gap-4">
             <div className="text-center">
                <span className="block text-xl font-bold text-safety-700">98%</span>
                <span className="text-[10px] uppercase text-safety-600 font-bold">Cumplimiento</span>
             </div>
             <div className="w-px bg-safety-200"></div>
             <div className="text-center">
                <span className="block text-xl font-bold text-industrial-800">5</span>
                <span className="text-[10px] uppercase text-slate-500 font-bold">Certificaciones</span>
             </div>
          </div>
        </div>
        
        <button 
           onClick={() => setMode('scan')}
           className="mt-6 flex items-center gap-2 text-slate-600 hover:text-industrial-900 font-medium"
        >
          <UserCheck size={20} /> Soy Supervisor (Escanear otro usuario)
        </button>
      </div>

      {/* Certifications List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Shield className="text-safety-600" /> Habilitaciones Vigentes
        </h3>

        <div className="space-y-4">
          {MOCK_CERTS.map((cert) => (
            <div 
              key={cert.id} 
              className={`p-4 rounded-xl border flex items-center justify-between ${
                cert.status === 'active' 
                  ? 'bg-white border-slate-200 shadow-sm' 
                  : 'bg-slate-50 border-slate-200 opacity-70'
              }`}
            >
              <div>
                <h4 className="font-bold text-slate-800">{cert.name}</h4>
                <div className="flex gap-4 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Calendar size={14}/> Emitido: {cert.issuedDate}</span>
                  <span className="flex items-center gap-1"><Calendar size={14}/> Vence: {cert.expiryDate}</span>
                </div>
              </div>
              <div>
                {cert.status === 'active' ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                    VIGENTE
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">
                    VENCIDO
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="text-blue-800 font-bold mb-2">Próximos Vencimientos</h4>
          <p className="text-sm text-blue-700">
            Su habilitación para <strong>Espacios Confinados</strong> vence en 45 días. 
            <button className="underline ml-1 font-semibold">Programar recertificación</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Badge;