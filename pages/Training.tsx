import React, { useState } from 'react';
import { PlayCircle, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { TrainingModule } from '../types';

const MOCK_TRAININGS: TrainingModule[] = [
  { id: '1', title: 'Trabajo en Altura - Nivel 1', description: 'Fundamentos de seguridad para trabajos sobre 1.8m', duration: '45 min', status: 'completed', dueDate: '2023-12-01' },
  { id: '2', title: 'Espacios Confinados', description: 'Procedimientos de entrada y rescate básico', duration: '60 min', status: 'pending', dueDate: '2023-11-15' },
  { id: '3', title: 'Bloqueo y Etiquetado (LOTO)', description: 'Control de energías peligrosas', duration: '30 min', status: 'failed', dueDate: '2023-10-30' },
];

const Quiz = ({ onFinish }: { onFinish: (passed: boolean) => void }) => {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  const questions = [
    { q: "¿Cuál es la altura mínima para considerar trabajo en altura?", options: ["1.5 metros", "1.8 metros", "2.0 metros"], correct: 1 },
    { q: "¿Qué debe revisarse antes de usar un arnés?", options: ["El color", "Costuras y hebillas", "La marca"], correct: 1 },
  ];

  const handleAnswer = (idx: number) => {
    const isCorrect = idx === questions[step].correct;
    if (isCorrect) setScore(s => s + 1);
    
    if (step < questions.length - 1) {
      setStep(s => s + 1);
    } else {
      // Finish
      const finalScore = isCorrect ? score + 1 : score;
      onFinish(finalScore === questions.length);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 max-w-lg mx-auto">
      <h3 className="text-xl font-bold mb-4">Evaluación de Conocimientos</h3>
      <div className="mb-4 text-sm text-slate-500">Pregunta {step + 1} de {questions.length}</div>
      <p className="text-lg font-medium mb-6">{questions[step].q}</p>
      <div className="space-y-3">
        {questions[step].options.map((opt, i) => (
          <button 
            key={i}
            onClick={() => handleAnswer(i)}
            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-safety-50 hover:border-safety-300 transition-colors"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

const Training = () => {
  const [activeModule, setActiveModule] = useState<TrainingModule | null>(null);
  const [viewMode, setViewMode] = useState<'details' | 'quiz' | null>(null);

  const startTraining = (t: TrainingModule) => {
    setActiveModule(t);
    setViewMode('details');
  };

  const finishQuiz = (passed: boolean) => {
    alert(passed ? "¡Aprobado! Certificado generado." : "Reprobado. Debe repasar el material.");
    setActiveModule(null);
    setViewMode(null);
  };

  if (activeModule && viewMode === 'details') {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={() => { setActiveModule(null); setViewMode(null); }} className="text-slate-500 hover:text-slate-900 mb-4">
          ← Volver a mis cursos
        </button>
        <div className="bg-black aspect-video rounded-xl flex items-center justify-center mb-6 shadow-xl">
           <PlayCircle size={64} className="text-white opacity-80" />
        </div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{activeModule.title}</h2>
          <button 
            onClick={() => setViewMode('quiz')}
            className="bg-safety-600 hover:bg-safety-700 text-white px-6 py-2 rounded-lg font-bold"
          >
            Realizar Evaluación
          </button>
        </div>
        <div className="prose max-w-none text-slate-600">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <h3 className="font-bold text-slate-800 mt-4">Material de Lectura</h3>
          <div className="flex items-center gap-2 text-blue-600 cursor-pointer mt-2">
            <FileText size={20} />
            <span>Manual_Procedimiento_v2.pdf</span>
          </div>
        </div>
      </div>
    );
  }

  if (activeModule && viewMode === 'quiz') {
    return (
      <div className="py-12">
        <Quiz onFinish={finishQuiz} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-2xl font-bold text-slate-800">Mis Capacitaciones</h2>
          <p className="text-slate-500">Plan de carrera y cumplimiento normativo.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_TRAININGS.map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg ${t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {t.status === 'completed' ? <CheckCircle size={20} /> : <PlayCircle size={20} />}
                </div>
                <span className="text-xs font-semibold text-slate-400 border px-2 py-1 rounded">{t.duration}</span>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-800">{t.title}</h3>
              <p className="text-slate-500 text-sm flex-1">{t.description}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={12} /> Vence: {t.dueDate}
                </span>
                {t.status !== 'completed' && (
                  <button 
                    onClick={() => startTraining(t)}
                    className="text-sm font-bold text-safety-600 hover:text-safety-700 hover:underline"
                  >
                    {t.status === 'failed' ? 'Reintentar' : 'Iniciar'}
                  </button>
                )}
                {t.status === 'completed' && (
                  <span className="text-sm font-bold text-green-600">Completado</span>
                )}
              </div>
            </div>
          ))}
        </div>
    </div>
  );
};

export default Training;