
import React, { useState, useMemo, useEffect } from 'react';
import { PlayCircle, FileText, CheckCircle, Clock, AlertCircle, Award, Video, Lock, ClipboardCheck, UserCheck, ArrowLeft, Layers, Loader2 } from 'lucide-react';
import { Course, Evaluation, UserTrainingProgress, QuizAttempt, TrainingPlan } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';

const Quiz = ({ evaluation, onFinish }: { evaluation: Evaluation, onFinish: (passed: boolean, score: number, wrongIds: string[]) => void }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    if (step < evaluation.questions.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      // Calculate Score
      const wrongIds: string[] = [];
      let correctCount = 0;
      
      newAnswers.forEach((ans, idx) => {
        if (ans === evaluation.questions[idx].correctIndex) {
          correctCount++;
        } else {
          wrongIds.push(evaluation.questions[idx].id);
        }
      });

      const finalScore = (correctCount / evaluation.questions.length) * 100;
      const passed = finalScore >= evaluation.passingScore;
      onFinish(passed, finalScore, wrongIds);
    }
  };

  const q = evaluation.questions[step];

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
         <h3 className="text-2xl font-bold text-brand-800">{evaluation.name}</h3>
         <span className="text-sm font-bold text-slate-400">Pregunta {step + 1} de {evaluation.questions.length}</span>
      </div>
      
      <div className="w-full bg-slate-100 h-2 rounded-full mb-8">
         <div className="bg-brand-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((step)/evaluation.questions.length)*100}%` }}></div>
      </div>

      <p className="text-lg font-medium mb-8 text-slate-800">{q.text}</p>
      
      <div className="space-y-4">
        {q.options.map((opt, i) => (
          <button 
            key={i}
            onClick={() => handleAnswer(i)}
            className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-brand-500 hover:bg-brand-50 transition-all font-medium text-slate-700"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

interface CourseGroup {
  key: string;
  evaluation?: Evaluation;
  courses: Course[];
  isCompleted: boolean;
  isPendingPractical: boolean;
  canTakeExam: boolean;
}

const Training = () => {
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-training' | 'hs-validation'>('my-training');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [viewMode, setViewMode] = useState<'details' | 'quiz' | null>(null);
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);
  const [myProgress, setMyProgress] = useState<UserTrainingProgress[]>([]);

  // Dynamic Data State
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  const currentUserPosition = userProfile?.position || '';
  const currentUserId = userProfile?.id || user?.uid;

  // Fetch Configuration Data from Firestore
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [plansSnap, coursesSnap, evalsSnap] = await Promise.all([
          getDocs(collection(db, 'plans')),
          getDocs(collection(db, 'courses')),
          getDocs(collection(db, 'evaluations'))
        ]);

        setPlans(plansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrainingPlan)));
        setCourses(coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
        setEvaluations(evalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evaluation)));
      } catch (error) {
        console.error("Error fetching training config:", error);
      }
    };
    fetchConfig();
  }, []);

  // Fetch User Progress from Firestore
  useEffect(() => {
    const fetchProgress = async () => {
      if (!currentUserId) return;
      setIsLoadingData(true);
      try {
        // Fetch personal progress
        const q = query(collection(db, 'training_progress'), where('userId', '==', currentUserId));
        const snap = await getDocs(q);
        const progressData = snap.docs.map(d => d.data() as UserTrainingProgress);
        setMyProgress(progressData);
        
        // If H&S, fetch all pending practicals (could be optimized)
        if (activeTab === 'hs-validation') {
            // In a real app with many users, this query should be more specific
             const qAll = query(collection(db, 'training_progress'), where('status', '==', 'PENDING_PRACTICAL'));
             // We reuse myProgress state for simplicity in this view or fetch separately? 
             // To keep it simple, we will fetch pending practicals in a separate effect or combine if needed.
             // For now, let's keep myProgress strictly for "My Training" tab.
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchProgress();
  }, [currentUserId, activeTab]);

  // Helper to save progress to Firestore
  const saveProgress = async (progressItem: UserTrainingProgress) => {
    if (!progressItem.userId || !progressItem.courseId) return;
    try {
        // Use a composite ID for easy updates
        const docId = `${progressItem.userId}_${progressItem.courseId}`;
        await setDoc(doc(db, 'training_progress', docId), progressItem);
        
        // Update local state
        setMyProgress(prev => {
            const idx = prev.findIndex(p => p.courseId === progressItem.courseId);
            if (idx >= 0) {
                const newArr = [...prev];
                newArr[idx] = progressItem;
                return newArr;
            }
            return [...prev, progressItem];
        });
    } catch (e) {
        console.error("Error saving progress", e);
        alert("Error al guardar el progreso. Verifique su conexión.");
    }
  };

  // Logic to determine if user can see HS Validation tab
  const isHSPersonnel = 
      userProfile?.role === 'Supervisor' || 
      userProfile?.role === 'Jefatura' || 
      userProfile?.role === 'Coordinador' || 
      userProfile?.position?.includes('HYS');

  // 1. Find User's Plan based on Position
  const myPlan = useMemo(() => {
    return plans.find(p => p.positionIds.includes(currentUserPosition));
  }, [plans, currentUserPosition]);
  
  // 2. Get Courses from that Plan
  const myCourses = useMemo(() => {
    return myPlan ? courses.filter(c => myPlan.courseIds.includes(c.id)) : [];
  }, [myPlan, courses]);

  // 3. Group Courses by Evaluation ID
  const groupedCourses: CourseGroup[] = useMemo(() => {
    const groups: Record<string, Course[]> = {};
    
    myCourses.forEach(c => {
      const key = c.evaluationId || `no-eval-${c.id}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });

    return Object.keys(groups).map(key => {
      const groupCourses = groups[key];
      const evaluation = evaluations.find(e => e.id === groupCourses[0].evaluationId);
      
      const allCompleted = groupCourses.every(c => {
        const p = myProgress.find(mp => mp.courseId === c.id);
        return p?.status === 'COMPLETED';
      });

      const hasPendingPractical = groupCourses.some(c => {
        const p = myProgress.find(mp => mp.courseId === c.id);
        return p?.status === 'PENDING_PRACTICAL';
      });

      const allMaterialsViewed = groupCourses.every(c => {
        const p = myProgress.find(mp => mp.courseId === c.id);
        return p?.materialViewed === true;
      });

      return {
        key,
        evaluation,
        courses: groupCourses,
        isCompleted: allCompleted,
        isPendingPractical: hasPendingPractical,
        canTakeExam: allMaterialsViewed && !allCompleted && !hasPendingPractical && !!evaluation
      };
    });
  }, [myCourses, myProgress, evaluations]);

  // --- ACTIONS ---

  const handleVideoComplete = async () => {
    if (!activeCourse || !currentUserId) return;
    
    const existing = myProgress.find(p => p.courseId === activeCourse.id);
    const newItem: UserTrainingProgress = existing 
        ? { ...existing, materialViewed: true } 
        : { userId: currentUserId, courseId: activeCourse.id, status: 'PENDING', materialViewed: true, attempts: [] };
    
    await saveProgress(newItem);
    alert("Material completado. Se ha registrado su progreso.");
    setActiveCourse(null);
    setViewMode(null);
  };

  const handleFinishQuiz = async (passed: boolean, score: number, wrongIds: string[]) => {
    if (!activeGroupKey || !currentUserId) return;

    const group = groupedCourses.find(g => g.key === activeGroupKey);
    if (!group) return;
    
    const attempt: QuizAttempt = {
      date: new Date().toISOString(),
      score,
      passed,
      wrongQuestionIds: wrongIds
    };

    if (!passed) {
        // Record failed attempt for all courses in group
        for (const course of group.courses) {
             const existing = myProgress.find(p => p.courseId === course.id);
             const newItem: UserTrainingProgress = existing 
                ? { ...existing, attempts: [...(existing.attempts || []), attempt] }
                : { userId: currentUserId, courseId: course.id, status: 'PENDING', materialViewed: true, attempts: [attempt] };
             await saveProgress(newItem);
        }

        alert(`Reprobado (${score.toFixed(0)}%). Debe reintentar. Se ha registrado el intento fallido.`);
        return;
    }

    alert(`¡Teórico Aprobado con ${score.toFixed(0)}%!`);
    
    const completionDate = new Date().toISOString(); // ISO for sorting

    // Update status for all courses
    for (const course of group.courses) {
        const existing = myProgress.find(p => p.courseId === course.id);
        const status: 'PENDING_PRACTICAL' | 'COMPLETED' = course.requiresPractical ? 'PENDING_PRACTICAL' : 'COMPLETED';
        
        const newItem: UserTrainingProgress = existing 
            ? { 
                ...existing, 
                status, 
                score, 
                completionDate: status === 'COMPLETED' ? completionDate : undefined,
                attempts: [...(existing.attempts || []), attempt] 
              }
            : {
                userId: currentUserId,
                courseId: course.id,
                status,
                score,
                completionDate: status === 'COMPLETED' ? completionDate : undefined,
                materialViewed: true,
                attempts: [attempt]
            };
        await saveProgress(newItem);
    }

    setActiveGroupKey(null);
    setViewMode(null);
  };

  // State for HS validation list (fetched separately)
  const [pendingPracticals, setPendingPracticals] = useState<UserTrainingProgress[]>([]);
  
  useEffect(() => {
     const loadPending = async () => {
         if (activeTab === 'hs-validation' && isHSPersonnel) {
            const q = query(collection(db, 'training_progress'), where('status', '==', 'PENDING_PRACTICAL'));
            const snap = await getDocs(q);
            setPendingPracticals(snap.docs.map(d => d.data() as UserTrainingProgress));
         }
     };
     loadPending();
  }, [activeTab, isHSPersonnel]);

  const handleValidatePractical = async (item: UserTrainingProgress) => {
    if (!currentUserId) return;
    if (confirm("¿Confirma que el operario ha aprobado la instancia práctica?")) {
        const updatedItem: UserTrainingProgress = {
            ...item,
            status: 'COMPLETED',
            completionDate: new Date().toISOString(),
            practicalValidatedBy: currentUserId,
            practicalValidatedAt: new Date().toISOString()
        };
        // Save to DB
        const docId = `${item.userId}_${item.courseId}`;
        await setDoc(doc(db, 'training_progress', docId), updatedItem);
        
        // Remove from local pending list
        setPendingPracticals(prev => prev.filter(p => !(p.userId === item.userId && p.courseId === item.courseId)));
        alert("Validación registrada correctamente.");
    }
  };

  const startCourseMaterial = (c: Course) => {
    setActiveCourse(c);
    setViewMode('details');
  };

  const startGroupExam = (groupKey: string) => {
    setActiveGroupKey(groupKey);
    setViewMode('quiz');
  };

  // --- RENDERERS ---

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-brand-600" size={40} />
          <p className="text-slate-500 font-medium">Sincronizando Plan de Capacitación...</p>
        </div>
      </div>
    );
  }

  if (activeCourse && viewMode === 'details') {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <button onClick={() => { setActiveCourse(null); setViewMode(null); }} className="text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-2 font-medium">
          <ArrowLeft size={20} /> Volver a mis capacitaciones
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Video Placeholder */}
            <div className="bg-black aspect-video flex items-center justify-center relative group">
                <PlayCircle size={80} className="text-white opacity-90" />
                <p className="absolute bottom-4 text-white text-sm font-medium opacity-70">Simulación de Reproductor de Video</p>
            </div>
            
            <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">{activeCourse.title}</h2>
                        <p className="text-slate-500">{activeCourse.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><Clock size={18}/> Duración Estimada</h4>
                        <p className="text-slate-600">45 Minutos</p>
                    </div>
                    {activeCourse.contentUrl && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 col-span-2">
                           <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><FileText size={18}/> Material Externo</h4>
                           <a href={activeCourse.contentUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm break-all">{activeCourse.contentUrl}</a>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end">
                   <button 
                     onClick={handleVideoComplete}
                     className="bg-brand-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-brand-900 flex items-center gap-2"
                   >
                     <CheckCircle size={20} /> Finalizar Material / Marcar como Visto
                   </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'quiz' && activeGroupKey) {
    const group = groupedCourses.find(g => g.key === activeGroupKey);
    if (!group || !group.evaluation) return <div>Error: Evaluación no encontrada</div>;

    return (
      <div className="py-12 animate-fade-in">
        <button onClick={() => { setActiveGroupKey(null); setViewMode(null); }} className="text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-2 font-medium mx-auto max-w-2xl block">
          <ArrowLeft size={20} /> Cancelar Examen
        </button>
        <Quiz evaluation={group.evaluation} onFinish={handleFinishQuiz} />
      </div>
    );
  }

  // --- MAIN USER VIEW ---
  return (
    <div className="space-y-8">
       {/* Module Header with Back Button */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="bg-white p-2 rounded-full border border-slate-200 text-slate-500 hover:text-brand-800 hover:border-brand-300 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {activeTab === 'my-training' ? 'Mis Capacitaciones' : 'Validación Práctica H&S'}
              </h2>
              {activeTab === 'my-training' && (
                <p className="text-slate-500">Plan: <span className="font-semibold text-brand-700">{myPlan?.name || 'Sin plan asignado'}</span></p>
              )}
               {activeTab === 'hs-validation' && (
                   <p className="text-slate-500">Gestión de habilitaciones pendientes de práctico.</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
              <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                 <button 
                   onClick={() => setActiveTab('my-training')}
                   className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'my-training' ? 'bg-brand-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                 >
                    Mis Cursos
                 </button>
                 {isHSPersonnel && (
                    <button 
                    onClick={() => setActiveTab('hs-validation')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'hs-validation' ? 'bg-brand-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Gestión Práctica
                    </button>
                 )}
              </div>
          </div>
        </div>

        {activeTab === 'hs-validation' ? (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 font-bold text-slate-800 border-b border-slate-200">
                      <tr>
                          <th className="p-4">Operario ID</th>
                          <th className="p-4">Capacitación</th>
                          <th className="p-4">Examen Teórico</th>
                          <th className="p-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPracticals.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">No hay validaciones prácticas pendientes.</td></tr>
                      )}
                      {pendingPracticals.map((item, idx) => {
                          const course = courses.find(c => c.id === item.courseId);
                          return (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-4 font-bold text-slate-800">{item.userId}</td>
                                <td className="p-4">{course?.title || item.courseId}</td>
                                <td className="p-4 text-green-600 font-bold">Aprobado ({item.score}%)</td>
                                <td className="p-4 text-right">
                                  <button 
                                    onClick={() => handleValidatePractical(item)}
                                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm flex items-center gap-1 ml-auto"
                                  >
                                      <UserCheck size={14} /> Validar Práctica
                                  </button>
                                </td>
                            </tr>
                          );
                      })}
                    </tbody>
                </table>
            </div>
          </div>
        ) : (
          <>
            {!myPlan && (
                <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                    <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 text-lg">No tiene un plan de capacitación asignado a su puesto actual.</p>
                </div>
            )}

            <div className="grid gap-6">
              {groupedCourses.map((group) => (
                <div key={group.key} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${group.isCompleted ? 'border-green-200' : group.isPendingPractical ? 'border-orange-200' : 'border-slate-200'}`}>
                  
                  {/* Group Header */}
                  <div className={`p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${group.isCompleted ? 'bg-green-50/50 border-green-100' : group.isPendingPractical ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl shrink-0 ${group.isCompleted ? 'bg-green-100 text-green-700' : group.isPendingPractical ? 'bg-orange-100 text-orange-700' : 'bg-brand-100 text-brand-700'}`}>
                          {group.isCompleted ? <Award size={28} /> : group.isPendingPractical ? <ClipboardCheck size={28}/> : <Layers size={28} />}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">
                              {group.evaluation ? `Módulo: ${group.evaluation.name}` : `Módulo: ${group.courses[0].title}`}
                          </h3>
                          <p className="text-sm text-slate-500">
                              {group.courses.length} {group.courses.length === 1 ? 'Capacitación' : 'Capacitaciones agrupadas'}
                          </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        {group.isCompleted ? (
                          <span className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-bold border border-green-200 flex items-center gap-2">
                            <CheckCircle size={16}/> APROBADO
                          </span>
                        ) : group.isPendingPractical ? (
                          <span className="bg-orange-100 text-orange-800 px-4 py-1.5 rounded-full text-sm font-bold border border-orange-200 flex items-center gap-2">
                            <Clock size={16}/> PENDIENTE PRÁCTICA
                          </span>
                        ) : (
                          <div className="text-right">
                              <button 
                                disabled={!group.canTakeExam}
                                onClick={() => startGroupExam(group.key)}
                                className={`
                                    px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-all
                                    ${group.canTakeExam 
                                      ? 'bg-brand-800 text-white hover:bg-brand-900 hover:shadow-md' 
                                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                                `}
                              >
                                {group.canTakeExam ? <FileText size={18}/> : <Lock size={18}/>}
                                {group.canTakeExam ? 'Rendir Examen Unificado' : 'Complete el material para rendir'}
                              </button>
                              {!group.canTakeExam && !group.isCompleted && (
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                    Vea todos los videos para habilitar el examen
                                </p>
                              )}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Courses List inside Group */}
                  <div className="divide-y divide-slate-100">
                    {group.courses.map(course => {
                        const progress = myProgress.find(p => p.courseId === course.id);
                        const isViewed = progress?.materialViewed === true;
                        
                        // Logic for One-Time Lock
                        const isLocked = course.isOneTime && progress?.status === 'COMPLETED';

                        return (
                          <div key={course.id} className={`p-4 transition-colors flex items-center justify-between group ${isLocked ? 'bg-slate-50 opacity-70' : 'hover:bg-slate-50'}`}>
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isViewed || isLocked ? 'bg-green-100 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-400'}`}>
                                    {(isViewed || isLocked) ? <CheckCircle size={20} /> : <Video size={20} />}
                                </div>
                                <div>
                                    <h4 className={`font-bold ${isLocked ? 'text-slate-500' : 'text-slate-700'}`}>{course.title}</h4>
                                    <p className="text-xs text-slate-500">{course.description}</p>
                                    <div className="flex gap-2 mt-1">
                                        {course.isOneTime && <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded">Unica Vez</span>}
                                        {course.requiresPractical && <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded">Práctico Req.</span>}
                                    </div>
                                </div>
                              </div>
                              
                              {isLocked ? (
                                <span className="text-xs font-bold text-slate-400 border border-slate-200 px-3 py-1 rounded bg-slate-100 select-none cursor-not-allowed">
                                   Finalizado (Única vez)
                                </span>
                              ) : (
                                <button 
                                  onClick={() => startCourseMaterial(course)}
                                  className={`text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${
                                      isViewed 
                                        ? 'bg-white text-slate-500 border-slate-200 hover:border-slate-300' 
                                        : 'bg-white text-brand-700 border-brand-200 hover:bg-brand-50'
                                  }`}
                                >
                                  {isViewed ? 'Volver a ver' : 'Ver Material'}
                                </button>
                              )}
                          </div>
                        );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
    </div>
  );
};

export default Training;
