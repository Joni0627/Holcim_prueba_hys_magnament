import React, { useState, useEffect } from 'react';
import { Certification, Course, UserTrainingProgress, User } from '../types';
import { QrCode, Shield, Calendar, UserCheck, ArrowLeft, Loader2, ShieldAlert, Copy, Info, CheckCircle } from 'lucide-react';
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
  // Use param ID if available, otherwise use logged in ID
  const targetUserId = paramUid || userProfile?.id;
  // If param is present, we are viewing someone else (or ourselves via link)
  // If param is NOT present, we are viewing our own badge from the dashboard
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
        // Robust way to get the base URL regardless of environment
        // We use href.split('#')[0] to get the root url without the hash fragment
        const currentHref = window.location.href;
        const baseUrl = currentHref.split('#')[0];
        
        // Remove trailing slash if present to avoid double slashes, then append hash route
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const fullUrl = `${cleanBaseUrl}/#/badge?uid=${targetUserId}`;
        
        setQrUrl(fullUrl);
    }
  }, [targetUserId]);

  // Attempt Anonymous Login if Public View and Not Logged In
  useEffect(() => {
    const tryAnonymousAuth = async () => {
        if (isPublicView && !user && !authLoading) {
            try {
                // This attempts to log in as a guest to satisfy DB rules like "allow read: if request.auth != null"
                await signInAnonymously(auth);
            } catch (e: any) {
                console.warn("Anonymous auth failed", e);
                // We don't block here, we proceed to try fetching. 
                // It might fail later with permission-denied if rules are strict.
            }
        }
    };
    tryAnonymousAuth();
  }, [isPublicView, user, authLoading]);

  // Redirect if no target ID and auth is done loading (guest user visiting /badge without param)
  useEffect(() => {
    // Only redirect if NOT loading, NO target ID, and user is NOT anonymous (anonymous implies they are trying to view public data but URL is wrong)
    if (!authLoading && !targetUserId && (!user || !user.isAnonymous)) {
        navigate('/login');
    }
  }, [authLoading, targetUserId, navigate, user]);

  // Fetch Data for the Badge
  useEffect(() => {
    const fetchBadgeData = async () => {
      // Don't fetch if no target ID
      if (!targetUserId) {
          setIsLoading(false);
          return;
      }
      
      // Don't fetch if auth is strictly loading (unless we have a user already)
      if (authLoading && !user) return;

      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch User Profile
        // Optimize: If viewing self and profile is already loaded in context, use it.
        if (isSelf && userProfile && !paramUid) {
            setTargetUser(userProfile);
        } else {
            const userRef = doc(db, 'users', targetUserId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setTargetUser({ id: userSnap.id, ...userSnap.data() } as User);
            } else {
                setError("El ID de operario especificado no se encuentra en el sistema.");
                return;
            }
        }

        // 2. Fetch Progress and Courses to Compute Certifications
        // Note: This requires Firestore rules to allow read access for the specific user ID or public read
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
      } catch (error: any) {
         console.error("Error loading badge:", error);
         if (error.code === 'permission-denied') {
             setError("PERMISO DENEGADO. La base de datos requiere autenticación. Por favor, habilite el acceso anónimo en Firebase Console o ajuste las reglas de seguridad.");
         } else if (error.code === 'unavailable') {
             setError("Sin conexión. Verifique su acceso a internet.");
         } else {
             setError("Error técnico al cargar la información del operario.");
         }
      } finally {
         setIsLoading(false);
      }
    };

    fetchBadgeData();
  }, [targetUserId, isSelf, userProfile, paramUid, user, authLoading]);

  const QR_DATA_IMG = qrUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}` : '';

  // Process Avatar URL
  const rawAvatarUrl = targetUser?.photoUrl;
  const avatarUrl = getCleanImageSrc(rawAvatarUrl) || `https://ui-avatars.com/api/?name=${targetUser?.firstName || 'U'}+${targetUser?.lastName || 'U'}&background=random`;

  // Calculate compliance stats
  const activeCerts = certifications.filter(c => c.status === 'active').length;
  const totalCerts = certifications.length;
  const compliance = totalCerts > 0 ? Math.round((activeCerts / totalCerts) * 100) : 0;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrUrl);
    alert("Enlace copiado al portapapeles.");
  };

  if (mode === 'scan') {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Escáner de Validación</h2>
        <p className="text-slate-500">Escanee el QR del operario para ver habilitaciones.</p>
        
        <div className="bg-black rounded-xl overflow-hidden aspect-square relative flex items-center justify-center shadow-lg mx-auto w-full max-w-xs">
            <div className="absolute inset-0 bg-slate-900 opacity-80"></div>
            <div className="absolute w-48 h-48 border-2 border-safety-500 rounded-lg z-10 animate-pulse"></div>
            <p className="text-white z-20 font-mono text-xs px-4">Apunte la cámara al código QR...</p>
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

  if (isLoading || authLoading) {
      return (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
              <Loader2 className="animate-spin text-brand-600" size={40} />
              <p className="text-slate-400 font-medium text-sm">Validando credencial digital...</p>
          </div>
      );
  }

  if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-fade-in">
            <div className="bg-red-50 p-6 rounded-full mb-6">
               <ShieldAlert className="text-red-500" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Consulta No Disponible</h3>
            <p className="text-slate-500 mb-8 max-w-sm text-sm">{error}</p>
            
            {!user && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-500 max-w-sm">
                   <p className="mb-2"><strong>Nota para Desarrolladores:</strong></p>
                   <p className="text-xs">Para permitir acceso público, habilite <em>Anonymous Auth</em> en Firebase Authentication o actualice las <em>Firestore Rules</em> para permitir lecturas públicas en 'users', 'training_progress' y 'courses'.</p>
                </div>
            )}
            
            {user && !user.isAnonymous && (
                 <button onClick={() => navigate('/')} className="mt-6 text-brand-600 font-medium hover:underline">
                    Volver al Inicio
                </button>
            )}
        </div>
      );
  }

  return (
    <div className="space-y-6 animate-fade-in">
       {/* Only show navigation header if NOT in public/guest view */}
       {!isPublicView && (
           <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="bg-white p-2 rounded-full border border-slate-200 text-slate-500 hover:text-brand-800 hover:border-brand-300 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    Mis Habilitaciones
                </h2>
                <p className="text-slate-500">
                    Credencial digital y estado de certificaciones.
                </p>
              </div>
           </div>
       )}
       
       {isPublicView && (
           <div className="text-center mb-8">
               <h2 className="text-3xl font-bold text-brand-900 mb-2">Habilitación Operativa</h2>
               <p className="text-slate-500">Resumen de competencias técnicas y seguridad.</p>
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
            {isPublicView && (
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                    <div className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded border border-white/30">
                        VISTA PÚBLICA
                    </div>
                    <div className="text-white/60 text-[10px] font-mono">
                        {new Date().toLocaleDateString()}
                    </div>
                </div>
            )}
          </div>
          <div className="pt-14 pb-8 px-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800">
                {targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : 'Usuario Desconocido'}
            </h2>
            <p className="text-brand-600 font-bold text-sm tracking-wide mt-1 uppercase">{targetUser?.position || 'Sin puesto asignado'}</p>
            <div className="inline-block bg-slate-100 px-3 py-1 rounded-full mt-2">
                <p className="text-xs text-slate-500 font-mono tracking-wider">ID: {targetUser?.id}</p>
            </div>

            <div className="mt-8 flex justify-center flex-col items-center gap-4">
              {/* Only show QR code if viewing own badge, or simplify for public view */}
              <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-inner">
                {QR_DATA_IMG && <img src={QR_DATA_IMG} alt="User QR" className="w-40 h-40 mix-blend-multiply" />}
              </div>
              
              {/* URL Display only for internal user to share */}
              {!isPublicView && (
                  <div className="w-full text-left bg-slate-50 p-3 rounded-lg border border-slate-200">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Enlace de Validación</span>
                        <button onClick={handleCopyUrl} className="text-brand-600 hover:text-brand-800 flex items-center gap-1 text-[10px] font-bold" title="Copiar enlace">
                            <Copy size={12} /> COPIAR
                        </button>
                     </div>
                     <p className="text-[9px] text-slate-400 font-mono break-all leading-tight bg-white p-1 rounded border border-slate-100">
                        {qrUrl}
                     </p>
                     
                     {(qrUrl.includes('usercontent.goog') || qrUrl.includes('webcontainer') || qrUrl.includes('localhost')) && (
                         <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-700">
                             <strong className="block mb-1"><Info size={10} className="inline mr-1"/>Modo Desarrollo</strong>
                             Este QR solo funcionará si la app está publicada (Deploy).
                         </div>
                     )}
                  </div>
              )}
            </div>
            
            {isPublicView && (
                <p className="text-xs text-slate-400 mt-4 italic">
                    Escanee este código para verificar la autenticidad de esta credencial en tiempo real.
                </p>
            )}
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
        
        {/* Only show "I am Supervisor" button if logged in as the user (looking at own badge) */}
        {!isPublicView && isSelf && (
            <button 
            onClick={() => setMode('scan')}
            className="mt-6 flex items-center gap-2 text-slate-600 hover:text-brand-800 font-medium py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors"
            >
            <UserCheck size={20} /> Soy Supervisor (Escanear otro usuario)
            </button>
        )}
      </div>

      {/* Certifications List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
          <Shield className="text-safety-600" /> Detalle de Habilitaciones
        </h3>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {certifications.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <ShieldAlert className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-slate-500 font-medium">No se encontraron certificaciones registradas.</p>
              </div>
          )}
          {certifications.map((cert) => (
            <div 
              key={cert.id} 
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                cert.status === 'active' 
                  ? 'bg-white border-green-200 shadow-sm' 
                  : 'bg-slate-50 border-slate-200 opacity-75 grayscale-[0.5]'
              }`}
            >
              <div className="flex items-start gap-3">
                 <div className={`mt-1 ${cert.status === 'active' ? 'text-green-500' : 'text-slate-400'}`}>
                    <CheckCircle size={20} />
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-800 text-base">{cert.name}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Calendar size={12}/> Emitido: {cert.issuedDate}</span>
                      <span className="flex items-center gap-1"><Calendar size={12}/> Vence: {cert.expiryDate}</span>
                    </div>
                 </div>
              </div>
              <div className="shrink-0 self-start sm:self-center">
                {cert.status === 'active' ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 shadow-sm whitespace-nowrap">
                    VIGENTE
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200 whitespace-nowrap">
                    VENCIDO
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {certifications.some(c => c.status === 'expired') && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex gap-3 animate-fade-in">
            <ShieldAlert className="text-red-500 shrink-0 mt-0.5" />
            <div>
                <h4 className="text-red-800 font-bold mb-1 text-sm">Alerta de Conformidad</h4>
                <p className="text-xs text-red-700 leading-relaxed">
                    El usuario posee certificaciones vencidas o pendientes de reválida. Algunas tareas operativas podrían estar restringidas.
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