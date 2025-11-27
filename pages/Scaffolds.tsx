import React, { useState } from 'react';
import { Construction, CheckCircle, XCircle, Camera } from 'lucide-react';

interface Question {
  id: string;
  text: string;
}

const SCAFFOLD_TYPES = ['Multidireccional', 'Tubular', 'Colgante', 'Móvil'] as const;

const QUESTIONS: Record<string, Question[]> = {
  general: [
    { id: 'q1', text: '¿La base está nivelada y sobre terreno firme?' },
    { id: 'q2', text: '¿Existen placas base y tornillos niveladores en todos los apoyos?' },
    { id: 'q3', text: '¿La estructura está plomada y arriostrada correctamente?' },
    { id: 'q4', text: '¿Las plataformas de trabajo están completas y aseguradas?' },
    { id: 'q5', text: '¿Cuenta con barandas (superior, media) y rodapiés?' },
    { id: 'q6', text: '¿El acceso (escalera) es seguro y está integrado?' },
    { id: 'q7', text: '¿Hay tarjeta de identificación (Verde/Roja) visible?' },
  ]
};

const Scaffolds = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [selectedType, setSelectedType] = useState<string>(SCAFFOLD_TYPES[0]);
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});

  const handleAnswer = (qid: string, val: boolean) => {
    setAnswers(prev => ({ ...prev, [qid]: val }));
  };

  const calculateScore = () => {
    const total = QUESTIONS.general.length;
    const answered = Object.keys(answers).length;
    if (answered < total) return null;
    const passed = Object.values(answers).filter(v => v === true).length;
    return passed === total;
  };

  const isPassed = calculateScore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inspección de Andamios</h2>
          <p className="text-slate-500">Verificación de seguridad antes del uso.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('new')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
            activeTab === 'new' ? 'text-safety-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Nueva Inspección
          {activeTab === 'new' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-safety-600 rounded-t-full"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
            activeTab === 'history' ? 'text-safety-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Historial
          {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-safety-600 rounded-t-full"></span>}
        </button>
      </div>

      {activeTab === 'new' ? (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 p-6 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Andamio</label>
            <div className="flex flex-wrap gap-2">
              {SCAFFOLD_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setAnswers({}); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    selectedType === type 
                      ? 'bg-industrial-800 text-white border-industrial-800 shadow-md' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {QUESTIONS.general.map((q) => (
              <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
                <p className="text-slate-800 font-medium text-sm sm:text-base flex-1">{q.text}</p>
                <div className="flex gap-3 shrink-0">
                  <button 
                    onClick={() => handleAnswer(q.id, true)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${
                      answers[q.id] === true 
                        ? 'bg-green-500 text-white shadow-sm ring-2 ring-green-200' 
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle size={16} /> CUMPLE
                  </button>
                  <button 
                    onClick={() => handleAnswer(q.id, false)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${
                      answers[q.id] === false 
                        ? 'bg-red-500 text-white shadow-sm ring-2 ring-red-200' 
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <XCircle size={16} /> NO CUMPLE
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <label className="flex items-center gap-2 p-4 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors justify-center text-slate-500">
                <Camera size={20} />
                <span className="text-sm font-medium">Adjuntar Foto Evidencia</span>
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <div>
              {isPassed === true && <span className="text-green-600 font-bold flex items-center gap-2"><CheckCircle/> APTO PARA USO</span>}
              {isPassed === false && <span className="text-red-600 font-bold flex items-center gap-2"><XCircle/> NO APTO - CLAUSURAR</span>}
              {isPassed === null && <span className="text-slate-400 text-sm">Responda todas las preguntas</span>}
            </div>
            <button 
              disabled={isPassed === null}
              className="bg-safety-600 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-safety-700 text-white px-6 py-2 rounded-lg font-bold shadow-sm"
            >
              Registrar Inspección
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
          <Construction className="mx-auto mb-4 text-slate-300" size={48} />
          <p>Historial de inspecciones simulado...</p>
        </div>
      )}
    </div>
  );
};

export default Scaffolds;