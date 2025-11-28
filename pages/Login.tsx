import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Error al iniciar sesión. Verifique sus credenciales.');
      if (err.code === 'auth/invalid-credential') {
         setError('Email o contraseña incorrectos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
        setError('Por favor, ingrese su email en el campo de arriba para restablecer la contraseña.');
        return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
        await sendPasswordResetEmail(auth, email);
        setSuccess(`Se ha enviado un correo de recuperación a ${email}. Revise su bandeja de entrada.`);
    } catch (err: any) {
        console.error(err);
        setError('Error al enviar correo de recuperación: ' + err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-brand-800 p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
             <ShieldCheck size={32} className="text-brand-800" />
          </div>
          <h1 className="text-2xl font-bold text-white">H&S Management</h1>
          <p className="text-brand-100 mt-2">Acceso Seguro</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm font-medium border border-green-100">
              {success}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email Corporativo</label>
            <input 
              type="email" 
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 bg-white"
              placeholder="usuario@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 bg-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-800 hover:bg-brand-900 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Ingresar'}
          </button>
          
          <div className="text-center mt-4">
            <button 
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                className="text-xs text-brand-600 hover:text-brand-800 underline font-medium"
            >
                ¿Olvidó su contraseña? Solicitar blanqueo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;