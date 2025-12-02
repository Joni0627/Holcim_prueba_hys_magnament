
import React, { useState, useEffect } from 'react';
import { Certification, Course, UserTrainingProgress, User } from '../types';
import { QrCode, Shield, Calendar, UserCheck, ArrowLeft, Loader2, ShieldAlert, Copy, Info, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../services/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

// Helper to extract real image URL from Google Redirects
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

const Badge = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile, loading: authLoading, user } = useAuth();
  
  // Logic to determine which user we are viewing
  const paramUid = searchParams.get('uid');
  const targetUserId = paramUid || userProfile?.id;
  const isPublicView = !!paramUid;
  const isSelf = userProfile && userProfile.id === targetUserId;

  const [mode, setMode] = useState<'view' | 'scan'>('view');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState('');
  
  // Data State
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // Calculate Robust QR URL
  useEffect(() => {
    if (targetUserId) {
        const currentHref = window.location.href;
        const baseUrl = currentHref.split('#')[0];
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const fullUrl = `${cleanBaseUrl}/#/badge?uid=${targetUserId}`;
        setQrUrl(fullUrl);
    }
  }, [targetUserId]);

  // Attempt Anonymous Login if Public View and Not Logged In
  useEffect(() => {
    const tryAnonymousAuth = async () => {
        // Only try if we are in public view, auth finished loading, and NO user is present
        if (isPublicView && !authLoading && !user) {
            try {
                // This allows reading DB without creating a full account
                await signInAnonymously(auth);
            } catch (e: any) {
                console.warn("Anonymous auth failed", e);
                // If this fails, it's likely disabled in Firebase Console
                if (e.code === 'auth/admin-restricted-operation' || e.code === 'auth/operation-not-allowed') {
                    setError("CONFIGURACIÓN REQUERIDA: Habilite 'Anonymous Auth' en Firebase Console para permitir acceso público.");
                    setIsLoading(false);
                }
            }
        }
    };
    tryAnonymousAuth();
  }, [isPublicView, user, authLoading]);

  // Redirect if visiting base /badge route without login (no UID param)
  useEffect(() => {
    if (!authLoading && !targetUserId && (!user || !user.isAnonymous)) {
        navigate('/login');
    }
  }, [authLoading, targetUserId, navigate, user]);

  // Fetch Data for the Badge
  useEffect(() => {
    const fetchBadgeData = async () => {
      // 1. Validations before fetching
      if (!targetUserId) {
          setIsLoading(false);
          return;
      }

      // CRITICAL: If public view, WAIT until we have a user (anonymous or real)
      // Otherwise Firestore rules will block the request immediately.
      if (isPublicView && !user) {
          // Still waiting for anonymous login...
          return;
      }
      
      // If internal view, wait for auth loading
      if (!isPublicView && authLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        // 2. Fetch User Profile
        if (isSelf && userProfile && !paramUid) {
            setTargetUser(userProfile);
        } else {
            const userRef = doc(db, 'users', targetUserId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setTargetUser({ id: userSnap.id, ...userSnap.data() } as User);
            } else {
                setError("El ID de operario especificado no se encuentra en el sistema.");
                setIsLoading(false);
                return;
            }
        }

        // 3. Fetch Progress and Courses
        const [progressSnap, coursesSnap] = await Promise.all([
             getDocs(query(collection(db, 'training_progress'), where('userId', '==', targetUserId))),
             getDocs(collection(db, 'courses'))
        ]);

        const progress = progressSnap.docs.map(d => d.data() as UserTrainingProgress);
        const courses = coursesSnap.docs.map(d => ({id: d.id, ...d.data()} as Course));

        // 4. Calculate Certifications
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
      } catch (error: any) {
         console.error("Error loading badge:", error);
         if (error.code === 'permission-denied') {
             setError("PERMISO DENEGADO. La base de datos requiere autenticación.");
         } else if (error.code === 'unavailable') {
             setError("Sin conexión. Verifique su acceso a internet.");
         } else {
             setError("No se pudo cargar la información. Intente nuevamente.");
         }
      } finally {
         setIsLoading(false);
      }
    };

    fetchBadgeData();
  }, [targetUserId, isSelf, userProfile, paramUid, user, authLoading, isPublicView]);

  const QR_DATA_IMG = qrUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}` : '';

  // Process Avatar URL
  const rawAvatarUrl = targetUser?.photoUrl;
  const avatarUrl = getCleanImageSrc(rawAvatarUrl) || `https://ui-avatars.com/api/?name=${targetUser?.firstName || 'U'}+${targetUser?.lastName || 'U'}&background=random`;

  const activeCerts = certifications.filter(c => c.status === 'active').length;
  const totalCerts = certifications.length;
  const compliance = totalCerts > 0 ? Math.round((activeCerts / totalCerts) * 100) : 0;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrUrl);
    alert("Enlace copiado al portapapeles.");
  };

  const handleRetry = () => {
      window.location.reload();
  };

  // --- SCAN MODE (Internal Only) ---
  if (mode === 'scan') {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Escáner de Validación</h2>
        <div className="bg-black rounded-xl overflow-hidden aspect-square relative flex items-center justify-center shadow-lg mx-auto w-full max-w-xs">
            <div className="absolute w-48 h-48 border-2 border-safety-500 rounded-lg z-10 animate-pulse"></div>
            <p className="text-white z-20 font-mono text-xs px-4">Apunte la cámara al código QR...</p>
        </div>
        <button onClick={() => setMode('view')} className="text-slate-500 underline hover:text-slate-800">
          Cancelar Escaneo
        </button>
      </div>
    );
  }

  // --- LOADING STATE ---
  if (isLoading || (isPublicView && !user && !error)) {
      return (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
              <Loader2 className="animate-spin text-brand-600" size={40} />
              <p className="text-slate-400 font-medium text-sm">Verificando credencial...</p>
          </div>
      );
  }

  // --- ERROR STATE ---
  if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-fade-in">
            <div className="bg-red-50 p-6 rounded-full mb-6">
               <ShieldAlert className="text-red-500" size={48} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Consulta No Disponible</h3>
            <p className="text-slate-500 mb-6 max-w-md text-sm leading-relaxed">{error}</p>
            
            <button onClick={handleRetry} className="bg-brand-800 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-brand-900 flex items-center gap-2">
                <RefreshCw size={18} /> Reintentar
            </button>

            {!user && error.includes('CONFIGURACIÓN') && (
                 <div className="mt-8 p-4 bg-slate-50 rounded text-xs text-left max-w-sm text-slate-400">
                    <strong>Nota Técnica:</strong> La base de datos de Firebase rechaza conexiones no autenticadas. Habilite "Anonymous Sign-in" para permitir la vista pública.
                 </div>
            )}
        </div>
      );
  }

  // --- SUCCESS VIEW (BADGE) ---
  return (
    <div className="space-y-6 animate-fade-in pb-10">
       {/* Only show navigation header if NOT in public/guest view */}
       {!isPublicView ? (
           <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="bg-white p-2 rounded-full border border-slate-200 text-slate-500 hover:text-brand-800 hover:border-brand-300 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Mis Habilitaciones</h2>
                <p className="text-slate-500">Credencial digital y estado de certificaciones.</p>
              </div>
           </div>
       ) : (
           <div className="text-center mb-6">
               <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-700 rounded-full mb-3">
                   <ShieldCheck size={24} />
               </div>
               <h2 className="text-2xl font-bold text-slate-800">Estado de Habilitación</h2>
               <p className="text-slate-500 text-sm">Resumen oficial de competencias</p>
           </div>
       )}

    <div className="grid lg:grid-cols-2 gap-8 mt-4 items-start">
      {/* Digital ID Card */}
      <div className="flex flex-col items-center">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative group transition-transform hover:scale-[1.01] duration-300">
          <div className="bg-gradient-to-r from-brand-800 to-brand-700 h-28 relative">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <img 
                src={avatarUrl}
                alt="Profile" 
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white object-cover"
              />
            </div>
          </div>
          <div className="pt-14 pb-8 px-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                {targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : 'Usuario'}
            </h2>
            <p className="text-brand-600 font-bold text-sm tracking-wide mt-1 uppercase">{targetUser?.position || 'Sin puesto'}</p>
            <div className="inline-block bg-slate-100 px-3 py-1 rounded-full mt-2">
                <p className="text-xs text-slate-500 font-mono tracking-wider">ID: {targetUser?.id}</p>
            </div>

            <div className="mt-8 flex justify-center flex-col items-center gap-4">
              {!isPublicView && QR_DATA_IMG && (
                 <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-inner">
                    <img src={QR_DATA_IMG} alt="User QR" className="w-40 h-40 mix-blend-multiply" />
                 </div>
              )}
              
              {!isPublicView && (
                  <div className="w-full text-left bg-slate-50 p-3 rounded-lg border border-slate-200">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Enlace Público</span>
                        <button onClick={handleCopyUrl} className="text-brand-600 hover:text-brand-800 flex items-center gap-1 text-[10px] font-bold">
                            <Copy size={12} /> COPIAR
                        </button>
                     </div>
                     <p className="text-[9px] text-slate-400 font-mono break-all leading-tight bg-white p-1 rounded border border-slate-100 truncate">
                        {qrUrl}
                     </p>
                  </div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center gap-8">
             <div className="text-center">
                <span className={`block text-2xl font-black ${compliance === 100 ? 'text-green-600' : 'text-orange-500'}`}>{compliance}%</span>
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Cumplimiento</span>
             </div>
             <div className="w-px bg-slate-200"></div>
             <div className="text-center">
                <span className="block text-2xl font-black text-brand-800">{activeCerts}</span>
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Habilitaciones</span>
             </div>
          </div>
        </div>
        
        {!isPublicView && isSelf && (
            <button onClick={() => setMode('scan')} className="mt-6 flex items-center gap-2 text-slate-600 hover:text-brand-800 font-medium py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors">
               <UserCheck size={20} /> Escanear otro operario
            </button>
        )}
      </div>

      {/* Certifications List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
          Detalle de Certificaciones
        </h3>

        <div className="space-y-3">
          {certifications.length === 0 && (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <ShieldAlert className="mx-auto text-slate-300 mb-2" size={24} />
                  <p className="text-slate-500 text-sm font-medium">No se encontraron certificaciones.</p>
              </div>
          )}
          {certifications.map((cert) => (
            <div 
              key={cert.id} 
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 shadow-sm ${
                cert.status === 'active' 
                  ? 'bg-white border-green-100' 
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-full ${cert.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                    <CheckCircle size={18} />
                 </div>
                 <div>
                    <h4 className={`font-bold text-sm ${cert.status === 'active' ? 'text-slate-800' : 'text-slate-500'}`}>{cert.name}</h4>
                    <p className="text-xs text-slate-400">Vence: {cert.expiryDate}</p>
                 </div>
              </div>
              <div className="shrink-0">
                {cert.status === 'active' ? (
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded border border-green-100 uppercase">Vigente</span>
                ) : (
                  <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded border border-red-100 uppercase">Vencido</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

// Internal component for public view header icon
const ShieldCheck = ({size}: {size: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);

export default Badge;
