
import React, { useState, useEffect } from 'react';
import { Certification, Course, UserTrainingProgress, User } from '../types';
import { QrCode, Shield, Calendar, UserCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

const Badge = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile } = useAuth();
  
  // Logic to determine which user we are viewing
  const paramUid = searchParams.get('uid');
  const targetUserId = paramUid || userProfile?.id;
  const isSelf = !paramUid || paramUid === userProfile?.id;

  const [mode, setMode] = useState<'view' | 'scan'>('view');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // Fetch Data for the Badge
  useEffect(() => {
    const fetchBadgeData = async () => {
      if (!targetUserId) return;
      setIsLoading(true);
      try {
        // 1. Fetch User Profile
        if (isSelf && userProfile) {
            setTargetUser(userProfile);
        } else {
            const userRef = doc(db, 'users', targetUserId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setTargetUser({ id: userSnap.id, ...userSnap.data() } as User);
            }
        }

        // 2. Fetch Progress and Courses to Compute Certifications
        const [progressSnap, coursesSnap] = await Promise.all([
             getDocs(query(collection(db, 'training_progress'), where('userId', '==', targetUserId))),
             getDocs(collection(db, 'courses'))
        ]);

        const progress = progressSnap.docs.map(d => d.data() as UserTrainingProgress);
        const courses = coursesSnap.docs.map(d => ({id: d.id, ...d.data()} as Course));

        // 3. Map Progress to Certifications
        const certs: Certification[] = [];
        progress.forEach(p => {
             if (p.status === 'COMPLETED' && p.completionDate) {
                 const course = courses.find(c => c.id === p.courseId);
                 if (course) {
                     const issued = new Date(p.completionDate);
                     const expiry = new Date(issued);
                     expiry.setMonth(expiry.getMonth() + course.validityMonths);
                     
                     const isExpired = new Date() > expiry;

                     certs.push({
                         id: course.id,
                         name: course.title,
                         issuedDate: issued.toLocaleDateString(),
                         expiryDate: expiry.toLocaleDateString(),
                         status: isExpired ? 'expired' : 'active'
                     });
                 }
             }
        });

        setCertifications(certs);
      } catch (error) {
         console.error("Error loading badge:", error);
      } finally {
         setIsLoading(false);
      }
    };

    fetchBadgeData();
  }, [targetUserId, isSelf, userProfile]);

  // Generate a QR that links to this page with the user ID
  // In a real deployed app, use window.location.origin
  const qrUrl = `${window.location.origin}${window.location.pathname}#/badge?uid=${targetUserId}`;
  const QR_DATA_IMG = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}`;

  // Calculate compliance stats
  const activeCerts = certifications.filter(c => c.status === 'active').length;
  const totalCerts = certifications.length;
  const compliance = totalCerts > 0 ? Math.round((activeCerts / totalCerts) * 100) : 0;

  if (mode === 'scan') {
    return (
      <div className="max-w-md mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Modo Supervisor</h2>
        <p className="text-slate-500">Escanee el QR del operario para ver habilitaciones.</p>
        
        <div className="bg-black rounded-xl overflow-hidden aspect-square relative flex items-center justify-center shadow-lg">
            {/* Simulation of Camera Feed */}
            <div className="absolute inset-0 bg-slate-900 opacity-80"></div>
            <div className="absolute w-64 h-64 border-2 border-safety-500 rounded-lg z-10 animate-pulse"></div>
            <p className="text-white z-20 font-mono text-sm px-4">Apunte la cámara al código QR de la credencial...</p>
        </div>

        <button 
          onClick={() => setMode('view')}
          className="text-slate-500 underline hover:text-slate-800"
        >
          Cancelar Escaneo
        </button>
      </div>
    );
  }

  if (isLoading) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-brand-600" size={40} />
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="bg-white p-2 rounded-full border border-slate-200 text-slate-500 hover:text-brand-800 hover:border-brand-300 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
                {isSelf ? 'Mis Habilitaciones' : 'Credencial de Operario'}
            </h2>
            <p className="text-slate-500">
                {isSelf ? 'Credencial digital y estado de certificaciones.' : 'Vista de supervisor - resumen de formación.'}
            </p>
          </div>
       </div>

    <div className="grid lg:grid-cols-2 gap-8 mt-4">
      {/* Digital ID Card */}
      <div className="flex flex-col items-center">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative group">
          <div className="bg-brand-800 h-24 relative">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <img 
                src={targetUser?.photoUrl || `https://ui-avatars.com/api/?name=${targetUser?.firstName}+${targetUser?.lastName}&background=random`} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white object-cover"
              />
            </div>
            {!isSelf && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow">
                    MODO VISOR
                </div>
            )}
          </div>
          <div className="pt-14 pb-8 px-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800">
                {targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : 'Usuario Desconocido'}
            </h2>
            <p className="text-slate-500 font-medium">{targetUser?.position || 'Sin puesto asignado'}</p>
            <p className="text-xs text-slate-400 mt-1 font-mono">ID: {targetUser?.id}</p>

            <div className="mt-6 flex justify-center">
              <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-inner">
                <img src={QR_DATA_IMG} alt="User QR" className="w-48 h-48" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
                {isSelf ? 'Presente este código para validación en campo' : 'Código de validación del operario'}
            </p>
          </div>
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center gap-4">
             <div className="text-center">
                <span className={`block text-xl font-bold ${compliance === 100 ? 'text-green-600' : 'text-orange-500'}`}>{compliance}%</span>
                <span className="text-[10px] uppercase text-slate-500 font-bold">Cumplimiento</span>
             </div>
             <div className="w-px bg-slate-200"></div>
             <div className="text-center">
                <span className="block text-xl font-bold text-brand-800">{activeCerts}</span>
                <span className="text-[10px] uppercase text-slate-500 font-bold">Vigentes</span>
             </div>
          </div>
        </div>
        
        {isSelf && (
            <button 
            onClick={() => setMode('scan')}
            className="mt-6 flex items-center gap-2 text-slate-600 hover:text-brand-800 font-medium"
            >
            <UserCheck size={20} /> Soy Supervisor (Escanear otro usuario)
            </button>
        )}
      </div>

      {/* Certifications List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Shield className="text-safety-600" /> Habilitaciones Registradas
        </h3>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {certifications.length === 0 && (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                  No se encontraron certificaciones completadas.
              </div>
          )}
          {certifications.map((cert) => (
            <div 
              key={cert.id} 
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                cert.status === 'active' 
                  ? 'bg-white border-green-200 shadow-sm hover:shadow-md' 
                  : 'bg-slate-50 border-slate-200 opacity-75'
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
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 shadow-sm">
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

        {certifications.some(c => c.status === 'expired') && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex gap-3">
            <Shield className="text-red-500 shrink-0" />
            <div>
                <h4 className="text-red-800 font-bold mb-1">Atención Requerida</h4>
                <p className="text-sm text-red-700">
                    El usuario posee certificaciones vencidas. Se requiere programar recertificación inmediata para habilitar tareas críticas.
                </p>
            </div>
            </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Badge;
