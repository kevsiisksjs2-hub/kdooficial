
import React, { useEffect, useState } from 'react';
import { MapPin, Ruler, Zap, Sparkles, CloudRain, Sun, Activity, Phone, Bed, Utensils, ShieldAlert } from 'lucide-react';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { Circuit } from '../types';

const Circuitos: React.FC = () => {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [aiAdvice, setAiAdvice] = useState<Record<string, string>>({});
  const [loadingAdvice, setLoadingAdvice] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCircuits(storageService.getCircuits());
  }, []);

  const fetchAdvice = async (c: Circuit) => {
    setLoadingAdvice(prev => ({ ...prev, [c.id]: true }));
    try {
      const advice = await aiService.analyzeCircuitTips(c.name, c.surfaceStatus || 'Normal');
      setAiAdvice(prev => ({ ...prev, [c.id]: advice || "Información de pista no disponible." }));
    } catch (error) {
      setAiAdvice(prev => ({ ...prev, [c.id]: "Sistema IA temporalmente fuera de línea." }));
    } finally {
      setLoadingAdvice(prev => ({ ...prev, [c.id]: false }));
    }
  };

  return (
    <div className="bg-black py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="mb-24">
          <h1 className="text-8xl font-black italic oswald uppercase text-white mb-6 tracking-tighter leading-none">Mapa <span className="text-yellow-400">Trazados</span></h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.6em]">Escenarios Oficiales de Competición Temporada 2026</p>
        </header>

        <div className="grid grid-cols-1 gap-24">
          {circuits.map((c) => (
            <div key={c.id} className="grid grid-cols-1 lg:grid-cols-12 gap-16 group">
              
              {/* VISUAL & DATA */}
              <div className="lg:col-span-5 space-y-10">
                <div className="aspect-[4/5] overflow-hidden rounded-[4rem] border border-white/5 relative shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  <div className="absolute top-10 left-10 bg-yellow-400 text-black font-black px-6 py-3 rounded-2xl oswald text-xl shadow-2xl transform -rotate-2">
                    {c.length}
                  </div>
                  <div className="absolute bottom-10 left-10 right-10">
                    <h3 className="text-5xl font-black text-white uppercase oswald italic tracking-tighter mb-4">{c.name}</h3>
                    <div className="flex items-center gap-3 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                       <MapPin size={14} className="text-yellow-400" /> {c.location}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5">
                    <Sun className="text-yellow-400 mb-4" size={24} />
                    <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Superficie</p>
                    <p className="text-sm font-black text-white uppercase">{c.surfaceStatus || 'Tierra Compacta'}</p>
                  </div>
                  <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5">
                    <ShieldAlert className="text-red-600 mb-4" size={24} />
                    <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Emergencias</p>
                    <p className="text-sm font-black text-white uppercase">{c.emergencyPhone || '107'}</p>
                  </div>
                </div>
              </div>

              {/* PADDOCK GUIDE & IA */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-12">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] flex items-center gap-3"><Zap size={14} className="text-yellow-400" /> Strategic Analysis</h4>
                  <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] relative">
                    <Sparkles className="absolute top-8 right-8 text-yellow-400/20" size={32} />
                    {aiAdvice[c.id] ? (
                      <p className="text-zinc-300 text-lg font-medium italic leading-relaxed">"{aiAdvice[c.id]}"</p>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10">
                        <button onClick={() => fetchAdvice(c)} disabled={loadingAdvice[c.id]} className="bg-yellow-400 text-black px-10 py-5 rounded-2xl font-black uppercase text-xs shadow-xl transition-all hover:bg-white active:scale-95">
                          {loadingAdvice[c.id] ? <Activity className="animate-spin" /> : 'Sintonizar Pro-Tips IA'}
                        </button>
                        <p className="text-[8px] text-zinc-700 font-bold uppercase mt-6 tracking-widest">Requiere Credenciales KDO Activas</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] flex items-center gap-3"><Bed size={14} className="text-blue-500" /> Paddock Services</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="p-8 bg-zinc-900 border border-white/5 rounded-3xl group/service hover:border-blue-500 transition-all">
                        <div className="flex items-center gap-4 mb-6">
                           <Bed size={20} className="text-blue-500" />
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">Hospedajes Cercanos</span>
                        </div>
                        <p className="text-[10px] text-zinc-600 font-bold leading-relaxed group-hover/service:text-zinc-400 transition-colors">Convenios especiales para equipos KDO en hoteles locales con espacio para camiones.</p>
                     </div>
                     <div className="p-8 bg-zinc-900 border border-white/5 rounded-3xl group/service hover:border-emerald-500 transition-all">
                        <div className="flex items-center gap-4 mb-6">
                           <Utensils size={20} className="text-emerald-500" />
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">Catering Paddock</span>
                        </div>
                        <p className="text-[10px] text-zinc-600 font-bold leading-relaxed group-hover/service:text-zinc-400 transition-colors">Servicio de buffet habilitado desde técnica. Zonas de sombra y agua potable certificada.</p>
                     </div>
                  </div>
                </div>

                <button className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all hover:bg-red-600 hover:text-white flex items-center justify-center gap-4 group-hover:translate-y-[-10px]">
                   <MapPin size={18} /> Obtener Hoja de Ruta GPS
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Circuitos;
