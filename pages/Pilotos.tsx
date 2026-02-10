
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { Pilot, Status } from '../types';
import { Search, Trophy, ShieldAlert, Award, X, FileDown, Clock, Sparkles, Activity, Star, Calendar } from 'lucide-react';
import { generatePilotsPDF } from '../utils/pdfGenerator';

const Pilotos: React.FC = () => {
  const location = useLocation();
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPilot, setSelectedPilot] = useState<Pilot | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [aiBio, setAiBio] = useState<string | null>(null);
  const [loadingBio, setLoadingBio] = useState(false);

  useEffect(() => {
    setPilots(storageService.getPilots());
    
    // Leer parámetro de categoría de la URL
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      setCategoryFilter(catParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (selectedPilot) {
      const fetchBio = async () => {
        setAiBio(null);
        setLoadingBio(true);
        try {
          const bio = await aiService.getPilotProfileBio(selectedPilot);
          setAiBio(bio);
        } catch (e) {
          setAiBio("Perfil oficial KDO encriptado o no disponible.");
        } finally {
          setLoadingBio(false);
        }
      };
      fetchBio();
    }
  }, [selectedPilot]);

  const categories = ['Todas', ...storageService.getCategories()];

  const filteredPilots = pilots.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.number.includes(searchTerm);
    const matchCat = categoryFilter === 'Todas' || p.category === categoryFilter;
    return matchSearch && matchCat && p.status !== Status.BAJA;
  });

  return (
    <div className="bg-black py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-20 border-b border-white/5 pb-16">
          <div>
            <h1 className="text-7xl font-black italic oswald uppercase text-white mb-2 tracking-tighter">Padrón <span className="text-blue-600">Oficial</span></h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em]">KDO - Registro de Competidores Season 2026</p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="relative flex-grow sm:w-80">
              <Search className="absolute left-6 top-5 text-zinc-700" size={20} />
              <input 
                type="text" 
                placeholder="BUSCAR POR NOMBRE O DORSAL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 pl-16 pr-6 text-white font-bold focus:border-blue-600 outline-none transition-all uppercase text-xs"
              />
            </div>
            
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl py-5 px-10 text-white font-black uppercase text-xs focus:border-blue-600 outline-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <button onClick={() => generatePilotsPDF(filteredPilots, "PADRÓN OFICIAL KDO 2026")} className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase text-xs hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3">
              <FileDown size={18} /> Exportar Padrón
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredPilots.map((p) => (
            <div 
              key={p.id} 
              onClick={() => setSelectedPilot(p)}
              className="glass-panel p-8 rounded-[3rem] hover:border-blue-600 transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="bg-blue-600 text-white font-black italic oswald text-4xl px-4 py-2 rounded-2xl shadow-xl transform -skew-x-12">
                  #{p.number}
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${p.conductPoints > 7 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  Licencia: {p.conductPoints}/10
                </div>
              </div>

              <h3 className="text-2xl font-black text-white uppercase oswald italic leading-none mb-1 group-hover:text-blue-500 transition-colors">{p.name}</h3>
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-8">{p.category}</p>
              
              <div className="mt-auto grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                 <div className="flex items-center gap-2">
                    <Trophy size={12} className="text-blue-500" />
                    <span className="text-[10px] font-black text-white oswald">{p.stats.wins} <span className="text-zinc-600 text-[8px] font-bold">WINS</span></span>
                 </div>
                 <div className="flex items-center gap-2 justify-end">
                    <Award size={12} className="text-white" />
                    <span className="text-[10px] font-black text-white oswald">{p.stats.podiums} <span className="text-zinc-600 text-[8px] font-bold">PODS</span></span>
                 </div>
              </div>
            </div>
          ))}
          {filteredPilots.length === 0 && (
            <div className="col-span-full py-40 text-center glass-panel rounded-[3rem]">
               <Search size={48} className="text-zinc-800 mx-auto mb-4 opacity-20" />
               <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">No se encontraron pilotos con los filtros aplicados</p>
            </div>
          )}
        </div>

        {selectedPilot && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in">
             <div className="bg-zinc-900 w-full max-w-4xl rounded-[4rem] border border-white/5 p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
                <button onClick={() => setSelectedPilot(null)} className="absolute top-10 right-10 text-zinc-700 hover:text-white bg-black p-3 rounded-full"><X size={24}/></button>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                   <div className="lg:col-span-1 space-y-8">
                      <div className="bg-blue-600 aspect-square rounded-[3rem] flex items-center justify-center text-[120px] font-black italic oswald text-white shadow-2xl transform rotate-3">
                         #{selectedPilot.number}
                      </div>
                      <div className="bg-black/40 border border-white/5 p-8 rounded-3xl text-center">
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Conducta Deportiva</p>
                         <div className="text-5xl font-black oswald italic text-white">{selectedPilot.conductPoints} <span className="text-zinc-700">/ 10</span></div>
                         <p className="text-[8px] text-zinc-600 font-bold uppercase mt-4">Sistema de puntos federados FRAD</p>
                      </div>
                   </div>

                   <div className="lg:col-span-2 space-y-10">
                      <div>
                        <h2 className="text-6xl font-black oswald uppercase text-white mb-2 italic tracking-tighter leading-none">{selectedPilot.name}</h2>
                        <div className="flex gap-3">
                          <span className="bg-zinc-800 text-blue-500 font-black uppercase text-[10px] px-5 py-2 rounded-xl border border-blue-600/20">{selectedPilot.category}</span>
                          <span className="bg-emerald-500 text-black font-black uppercase text-[10px] px-5 py-2 rounded-xl">PILOTO CONFIRMADO</span>
                        </div>
                      </div>

                      <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] relative">
                        <Sparkles size={18} className="text-blue-500 absolute -top-2 -right-2" />
                        <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4">Legacy Profile Bio (AI)</h4>
                        {loadingBio ? (
                          <div className="flex items-center gap-3 text-zinc-500 font-black uppercase text-[10px]"><Activity size={14} className="animate-spin" /> Procesando Historial...</div>
                        ) : (
                          <p className="text-white text-sm font-medium italic leading-relaxed">"{aiBio}"</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase mb-6 flex items-center gap-2"><Star size={12} className="text-blue-500" /> Career Milestones</h4>
                            <div className="space-y-4">
                               <div className="flex justify-between items-center"><span className="text-xs text-zinc-400">Wins Totales</span> <span className="text-lg font-black text-white oswald">{selectedPilot.stats.wins}</span></div>
                               <div className="flex justify-between items-center"><span className="text-xs text-zinc-400">Poles KDO</span> <span className="text-lg font-black text-white oswald">{selectedPilot.stats.poles}</span></div>
                               <div className="flex justify-between items-center"><span className="text-xs text-zinc-400">Points Standing</span> <span className="text-lg font-black text-emerald-500 oswald">{(selectedPilot.stats.points || 0).toFixed(1)}</span></div>
                            </div>
                         </div>
                         <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase mb-6 flex items-center gap-2"><Calendar size={12} className="text-blue-400" /> Data Institucional</h4>
                            <div className="space-y-4">
                               <div className="flex flex-col"><span className="text-[8px] text-zinc-600 font-black uppercase">Médica</span> <span className="text-xs font-bold text-white uppercase">{selectedPilot.medicalLicense}</span></div>
                               <div className="flex flex-col"><span className="text-[8px] text-zinc-600 font-black uppercase">Deportiva</span> <span className="text-xs font-bold text-white uppercase">{selectedPilot.sportsLicense}</span></div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pilotos;
