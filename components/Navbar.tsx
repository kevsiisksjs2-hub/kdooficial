
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Zap, Radio, WifiOff } from 'lucide-react';
import { storageService } from '../services/storageService';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(storageService.getSettings());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const location = useLocation();

  const LOGO_URL = "https://api.mundopiloto.com.ar/archivos/2/IMAGENES/ASOCIACIONES/logo_asociacion_2025-06-11T201534737Z.jpg";

  useEffect(() => {
    const interval = setInterval(() => {
      setSettings(storageService.getSettings());
    }, 5000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'LIVE', path: '/live', icon: <Radio size={12} className="text-blue-500 animate-pulse" /> },
    { name: 'Resultados', path: '/resultados' },
    { name: 'Inscripciones', path: '/inscripciones' },
    { name: 'Pilotos', path: '/pilotos' },
    { name: 'Reglamentos', path: '/reglamentos' },
  ];

  return (
    <>
      <div className="bg-blue-600 py-2 border-b border-blue-700 overflow-hidden relative z-[60]">
        <div className="whitespace-nowrap animate-marquee flex gap-12 items-center">
          {[1,2,3,4].map(i => (
            <span key={i} className="text-[10px] font-black uppercase text-white tracking-[0.2em] flex items-center gap-4">
              <Zap size={12} fill="white" /> {settings.paddockTicker}
            </span>
          ))}
        </div>
      </div>

      <nav className="bg-black/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <Link to="/" className="flex items-center gap-4 group">
              <img src={LOGO_URL} alt="KDO Logo" className="w-14 h-14 rounded-full border-2 border-blue-600 shadow-lg bg-white object-contain p-1" />
              <div className="bg-blue-600 px-3 py-1.5 rounded-lg italic font-black text-white text-xl oswald tracking-tighter hidden sm:block shadow-lg">
                KDO <span className="text-white bg-black/40 px-1.5 rounded-sm text-[10px] ml-1 uppercase">Oficial</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-4">
              {!isOnline && (
                <div className="flex items-center gap-2 bg-red-600/10 text-red-500 px-3 py-1 rounded-lg border border-red-600/30">
                  <WifiOff size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">OFFLINE MODE</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                      location.pathname === link.path ? 'text-blue-500 bg-blue-500/10' : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="ml-6 pl-6 border-l border-white/5">
                <Link to="/AdminKDO" className="text-zinc-700 hover:text-blue-500 transition-colors"><Shield size={18} /></Link>
              </div>
            </div>

            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-zinc-500"><Menu size={28} /></button>
          </div>
        </div>
        
        {isOpen && (
          <div className="lg:hidden bg-black border-b border-white/5 px-4 py-6 space-y-4">
            {!isOnline && (
                <div className="flex items-center gap-2 bg-red-600/10 text-red-500 px-3 py-1 rounded-lg border border-red-600/30 mb-4 w-fit">
                  <WifiOff size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">OFFLINE MODE</span>
                </div>
            )}
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className={`block text-sm font-black uppercase tracking-widest ${location.pathname === link.path ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}>
                {link.name}
              </Link>
            ))}
            <Link to="/AdminKDO" onClick={() => setIsOpen(false)} className="block text-sm font-black uppercase text-zinc-700">Administración</Link>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
