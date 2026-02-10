
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { Lock, User as UserIcon, ShieldCheck, ChevronLeft, ArrowRight, Zap } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (storageService.getAuth()) {
      navigate('/AdminKDO/dashboard');
    }
  }, [navigate]);

  const LOGO_URL = "https://api.mundopiloto.com.ar/archivos/2/IMAGENES/ASOCIACIONES/logo_asociacion_2025-06-11T201534737Z.jpg";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const admins = storageService.getAdminUsers();
    const match = admins.find(u => u.username === username.toLowerCase() && u.password === password);

    if (match) {
      storageService.setAuth({ id: match.id, username: match.username, role: match.role, name: match.name, permissions: match.permissions });
      storageService.addLog('LOGIN', `Acceso autorizado: ${match.username}`);
      navigate('/AdminKDO/dashboard');
    } else {
      setError('Credenciales inválidas. Verifique sus permisos KDO.');
      storageService.addLog('AUTH_ERROR', `Fallo de autenticación: ${username}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 relative overflow-hidden">
      {/* Decoración ambiental */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      {/* Botón de Retorno al Portal Público */}
      <Link 
        to="/" 
        className="absolute top-10 left-10 text-zinc-500 hover:text-blue-500 flex items-center gap-3 font-black uppercase text-[10px] tracking-widest transition-all group z-20"
      >
        <div className="bg-zinc-900 p-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
          <ChevronLeft size={18} />
        </div>
        Portal Público KDO
      </Link>

      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-700 relative z-10">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500"></div>
            <img 
              src={LOGO_URL} 
              alt="KDO" 
              className="w-28 h-28 rounded-full border-2 border-blue-600 shadow-2xl relative z-10 bg-white object-contain p-2"
            />
          </div>
          <div className="bg-blue-600 inline-block px-6 py-2 rounded-2xl italic font-black text-white text-3xl oswald tracking-tighter mb-4 shadow-[0_15px_45px_rgba(37,99,235,0.25)]">
            ACCESO <span className="text-white bg-black/40 px-2 rounded-md ml-1">STAFF</span>
          </div>
          <h2 className="text-xs font-black text-white uppercase tracking-[0.4em] oswald italic opacity-40">Área de Gestión KDO</h2>
        </div>

        <div className="glass-panel p-10 rounded-[3rem] relative overflow-hidden border-t border-white/10">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-600/50 to-transparent"></div>
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] ml-2">Usuario Federado</label>
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text" autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-800 rounded-2xl py-5 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-blue-600 transition-all uppercase text-xs tracking-widest placeholder:text-zinc-800"
                  placeholder="ID USUARIO"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] ml-2">Clave de Seguridad</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-800 rounded-2xl py-5 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-blue-600 transition-all text-xs tracking-widest placeholder:text-zinc-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                <ShieldCheck className="text-red-500 shrink-0" size={18} />
                <p className="text-red-500 text-[10px] font-black uppercase leading-tight italic">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-white text-white hover:text-black font-black uppercase py-6 rounded-2xl transition-all transform active:scale-95 shadow-2xl oswald tracking-widest text-2xl italic flex items-center justify-center gap-4 group"
            >
              Iniciar Gestión
              <Zap size={22} className="group-hover:animate-pulse transition-transform" />
            </button>
          </form>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-6">
           <div className="h-px bg-zinc-900 flex-grow"></div>
           <p className="text-zinc-800 text-[8px] font-black uppercase tracking-[0.5em] whitespace-nowrap">KDO SECURITY SYSTEM</p>
           <div className="h-px bg-zinc-900 flex-grow"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
