
import React, { useState, useEffect } from 'react';
import { Trophy, Activity, Zap, Shield, FileCheck, Calendar, FileDown, Search, AlertCircle, Clock, ChevronDown, ChevronUp, Sparkles, Loader2, Award, AlertTriangle, XCircle, Timer, MoveDown } from 'lucide-react';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { Pilot, Category, Status, RaceResult, Penalty, PenaltyType } from '../types';
import { generateChampionshipPDF } from '../utils/pdfGenerator';

const Resultados: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('');
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [view, setView] = useState<'ranking' | 'sesiones' | 'penalizaciones'>('ranking');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const loadedCats = storageService.getCategories();
    setCategories(loadedCats);
    if (loadedCats.length > 0) setSelectedCategory(loadedCats[0]);
    setPilots(storageService.getPilots());
    setPenalties(storageService.getPenalties());
    setAiInsight(null);
  }, []);

  const rankingPilots = pilots
    .filter(p => p.category === selectedCategory)
    .sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0));

  const filteredPenalties = penalties.filter(p => selectedCategory === 'Todas' || p.category === selectedCategory);

  const generateAiInsight = async () => {
    if (rankingPilots.length === 0) return;
    setIsAnalyzing(true);
    try {
      const data = rankingPilots.slice(0, 5).map(p => ({ name: p.name, points: p.stats?.points }));
      const insight = await aiService.analyzeStandings(selectedCategory, data);
      setAiInsight(insight);
    } catch (e) {
      setAiInsight("No se pudo conectar con el analista AI de KDO.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    generateChampionshipPDF("Campeonato 2026", selectedCategory, rankingPilots);
  };

  const getPenaltyStyle = (type: PenaltyType) => {
    switch (type) {
        case 'Exclusión': return { bg: 'bg-zinc-950', border: 'border-red-600', text: 'text-red-600', icon: <XCircle size={20} /> };
        case 'Recargo 5s': return { bg: 'bg-zinc-900', border: 'border-yellow-500', text: 'text-yellow-500', icon: <Timer size={20} /> };
        case 'Recargo 10s': return { bg: 'bg-zinc-900', border: 'border-orange-500', text: 'text-orange-500', icon: <Timer size={20} /> };
        case 'Recargo 20s': return { bg: 'bg-zinc-900', border: 'border-orange-600', text: 'text-orange-600', icon: <Timer size={20} /> };
        case 'Recargo Puesto': return { bg: 'bg-zinc-900', border: 'border-blue-500', text: 'text-blue-500', icon: <MoveDown size={20} /> };
        case 'Sanción': return { bg: 'bg-zinc-900', border: 'border-zinc-500', text: 'text-zinc-400', icon: <AlertTriangle size={20} /> };
        default: return { bg: 'bg-zinc-900', border: 'border-white/10', text: 'text-white', icon: <AlertCircle size={20} /> };
    }
  };

  return (
    <div className="bg-black py-12 min-h-screen text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16 border-b border-white/5 pb-12">
           <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
              <div>
                 <div className="flex items-center gap-3 mb-4">
                    <Trophy className="text-blue-500" size={24} />
                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.4em] italic oswald">Official Data Center</span>
                 </div>
                 <h1 className="text-6xl font-black italic oswald uppercase text-white mb-4">Resultados <span className="text-blue-500">Oficiales</span></h1>
                 <div className="flex flex-wrap gap-4 mt-8">
                    <button onClick={() => setView('ranking')} className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${view === 'ranking' ? 'bg-blue-600 text-white shadow-xl' : 'bg-zinc-900 hover:text-white'}`}>Ranking Temporada</button>
                    <button onClick={() => setView('sesiones')} className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${view === 'sesiones' ? 'bg-blue-600 text-white shadow-xl' : 'bg-zinc-900 hover:text-white'}`}>Última Sesión</button>
                    <button onClick={() => setView('penalizaciones')} className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${view === 'penalizaciones' ? 'bg-red-600 text-white shadow-xl' : 'bg-zinc-900 hover:text-white'}`}>Penalizaciones</button>
                 </div>
              </div>

              <div className="flex gap-4 items-center w-full lg:w-auto">
                 <select value={selectedCategory} onChange={(e) => {setSelectedCategory(e.target.value); setAiInsight(null);}} className="bg-zinc-900 border border-white/5 rounded-2xl py-5 px-10 text-[11px] font-black text-white uppercase outline-none focus:border-blue-600 appearance-none cursor-pointer flex-grow lg:flex-none">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
                 <button onClick={handleExport} className="bg-white text-black p-5 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                    <FileDown size={20} />
                 </button>
                 <button onClick={generateAiInsight} disabled={isAnalyzing} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all disabled:opacity-50">
                    {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    IA Insight
                 </button>
              </div>
           </div>
        </header>

        {aiInsight && (
          <div className="mb-12 bg-blue-600/10 border border-blue-500/20 p-8 rounded-[2.5rem] relative animate-in fade-in slide-in-from-top-4">
             <div className="absolute top-0 right-0 p-8 opacity-5"><Sparkles size={100} className="text-blue-500" /></div>
             <p className="text-white text-lg font-medium italic leading-relaxed">"{aiInsight}"</p>
          </div>
        )}

        {view === 'ranking' && (
          <div className="bg-zinc-900/30 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in">
            <table className="w-full text-left">
               <thead className="bg-black text-zinc-600 text-[8px] font-black uppercase border-b border-white/5">
                  <tr>
                    <th className="px-10 py-5 text-center">Pos</th>
                    <th className="px-10 py-5">Piloto</th>
                    <th className="px-10 py-5 text-center">Kart</th>
                    <th className="px-10 py-5 text-center">Wins</th>
                    <th className="px-10 py-5 text-right pr-10">Puntos</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {rankingPilots.map((p, i) => (
                     <tr key={p.id} className="hover:bg-blue-600/[0.03] transition-colors group">
                        <td className="px-10 py-6 text-center font-black oswald text-3xl italic text-blue-500">{i + 1}</td>
                        <td className="px-10 py-6">
                          <p className="text-sm font-black text-white uppercase group-hover:text-blue-500 transition-all">{p.name}</p>
                          <p className="text-[9px] text-zinc-700 font-bold">{p.association}</p>
                        </td>
                        <td className="px-10 py-6 text-center"><span className="bg-black border border-white/10 text-white font-black oswald px-4 py-1.5 rounded-xl text-lg group-hover:border-blue-500 transition-colors">#{p.number}</span></td>
                        <td className="px-10 py-6 text-center text-white font-black oswald">{p.stats.wins}</td>
                        <td className="px-10 py-6 text-right pr-10"><span className="text-4xl font-black text-white oswald italic group-hover:text-blue-500 transition-colors">{(p.stats?.points || 0).toFixed(1)}</span></td>
                     </tr>
                  ))}
               </tbody>
            </table>
          </div>
        )}

        {view === 'sesiones' && (
          <div className="py-20 text-center glass-panel rounded-[3rem]">
             <Activity size={48} className="text-blue-500 mx-auto mb-6 animate-pulse" />
             <h3 className="text-xl font-black oswald text-white uppercase mb-2">Sin Sesiones Recientes</h3>
             <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">Los resultados de la última carrera aparecerán aquí tras la validación del comisariado.</p>
          </div>
        )}

        {view === 'penalizaciones' && (
          <div className="space-y-8 animate-in fade-in">
             <div className="bg-red-600/10 border border-red-500/20 p-10 rounded-[2.5rem] flex items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Shield size={120} className="text-red-500" /></div>
                <div className="bg-red-600 p-4 rounded-2xl shadow-lg"><AlertCircle className="text-white" size={32} /></div>
                <div>
                   <h4 className="text-white font-black uppercase oswald text-3xl italic tracking-tighter">Tablero de Comisariato</h4>
                   <p className="text-red-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Resoluciones Oficiales FRAD 2026</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPenalties.length > 0 ? (
                    filteredPenalties.map(p => {
                        const style = getPenaltyStyle(p.type);
                        return (
                            <div key={p.id} className={`p-8 rounded-[2rem] border-l-4 shadow-2xl relative overflow-hidden ${style.bg} ${style.border} group transition-all hover:scale-[1.02]`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className={`flex items-center gap-2 mb-2 ${style.text}`}>
                                            {style.icon}
                                            <span className="text-[10px] font-black uppercase tracking-widest">{p.type}</span>
                                        </div>
                                        <h3 className="text-2xl font-black oswald uppercase text-white italic">{p.pilotName || 'PILOTO'}</h3>
                                    </div>
                                    <span className="bg-black/40 px-3 py-1 rounded text-[8px] font-black text-zinc-500 uppercase tracking-widest border border-white/5">
                                        KART #{p.number}
                                    </span>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                                    <p className="text-zinc-400 text-xs font-bold uppercase leading-relaxed">{p.reason}</p>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{p.category}</span>
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={10} /> {p.date}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full glass-panel p-20 rounded-[3rem] text-center">
                        <Shield className="text-zinc-800 mx-auto mb-6 opacity-20" size={60} />
                        <p className="text-zinc-600 font-black uppercase text-[10px] tracking-widest">No se registran sanciones vigentes para la categoría {selectedCategory}</p>
                    </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resultados;
