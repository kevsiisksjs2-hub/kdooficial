
import React, { useEffect, useState } from 'react';
import { Trophy, Calendar, MapPin, Search, ChevronRight, Award, Star, ListOrdered, Download, Clock, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Championship, Pilot, Category } from '../types';
import { generateChampionshipPDF } from '../utils/pdfGenerator';

const Campeonatos: React.FC = () => {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('');
  const [activeTab, setActiveTab] = useState<'torneos' | 'posiciones'>('torneos');
  const [expandedChamp, setExpandedChamp] = useState<string | null>(null);

  useEffect(() => {
    const loadedChamps = storageService.getChampionships();
    const loadedPilots = storageService.getPilots();
    const loadedCats = storageService.getCategories();
    
    setChampionships(loadedChamps);
    setPilots(loadedPilots);
    setCategories(loadedCats);
    if (loadedCats.length > 0) setSelectedCategory(loadedCats[0]);
  }, []);

  const standingsPilots = pilots
    .filter(p => p.category === selectedCategory && p.status === 'Confirmado')
    .sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0));

  const handleDownloadStandings = () => {
    if (standingsPilots.length === 0) {
      alert("No hay datos para esta categoría.");
      return;
    }
    generateChampionshipPDF("Torneo Oficial 2026", selectedCategory, standingsPilots);
  };

  return (
    <div className="bg-black py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="mb-16 border-b border-zinc-900 pb-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
               <div className="flex items-center gap-3 mb-2">
                 <Trophy className="text-blue-600" size={20} />
                 <span className="text-[10px] font-black uppercase text-blue-600 tracking-[0.4em] oswald italic">KDO Official Season</span>
               </div>
               <h1 className="text-5xl font-black italic oswald uppercase text-white mb-4 tracking-tighter leading-none">Temporada <span className="text-blue-600">2026</span></h1>
               <div className="flex gap-4">
                  <button onClick={() => setActiveTab('torneos')} className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'torneos' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}>Torneos Activos</button>
                  <button onClick={() => setActiveTab('posiciones')} className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'posiciones' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}>Tabla de Posiciones</button>
               </div>
            </div>
            {activeTab === 'posiciones' && (
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-white text-[11px] font-black uppercase rounded-xl px-6 py-4 outline-none focus:border-blue-600 transition-all flex-grow md:flex-none appearance-none cursor-pointer">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
                 <button onClick={handleDownloadStandings} className="bg-white text-black hover:bg-blue-600 hover:text-white p-4 rounded-xl transition-all shadow-xl"><Download size={20} /></button>
              </div>
            )}
          </div>
        </header>

        {activeTab === 'torneos' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {championships.map((ch) => (
              <div key={ch.id} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl hover:border-blue-600/50 transition-all group relative">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 h-64 md:h-auto overflow-hidden relative">
                    <img src={ch.image} alt={ch.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent hidden md:block"></div>
                  </div>
                  <div className="p-10 flex-grow flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${ch.status === 'En curso' ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-600/10 text-blue-500 border-blue-600/20'}`}>{ch.status}</span>
                    </div>
                    <h3 className="text-4xl font-black oswald uppercase text-white mb-6 group-hover:text-blue-600 transition-colors">{ch.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-8">
                      <div className="flex items-center gap-3"><Calendar size={18} className="text-blue-600" /> {ch.dates}</div>
                      <div className="flex items-center gap-3"><MapPin size={18} className="text-blue-600" /> {ch.tracks}</div>
                    </div>
                    <div className="flex gap-4">
                       <button 
                        onClick={() => setExpandedChamp(expandedChamp === ch.id ? null : ch.id)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all"
                       >
                         <Clock size={16} className="text-blue-600" />
                         {expandedChamp === ch.id ? 'Ocultar Calendario' : 'Ver Calendario Oficial'}
                         {expandedChamp === ch.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                       </button>
                       <button 
                        onClick={() => {setSelectedCategory(categories[0]); setActiveTab('posiciones');}}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all shadow-lg hover:bg-blue-700"
                       >
                         <ListOrdered size={16} /> Ver Standings
                       </button>
                    </div>
                  </div>
                </div>

                {expandedChamp === ch.id && ch.events && (
                  <div className="border-t border-zinc-800 bg-black/40 p-10 animate-in slide-in-from-top-4 duration-300">
                    <h4 className="text-xl font-black oswald uppercase text-white mb-8 italic flex items-center gap-3">
                      <Calendar className="text-blue-600" /> Cronograma de Fechas <span className="text-zinc-600">Season 2026</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {ch.events.map((ev) => (
                        <div key={ev.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group/ev hover:border-blue-600 transition-all">
                           <div className="absolute top-0 right-0 px-3 py-1 bg-black text-[8px] font-black uppercase text-zinc-500 rounded-bl-lg">Fecha {ev.round}</div>
                           <p className="text-white font-black oswald uppercase text-lg leading-tight mb-2 group-hover/ev:text-blue-500 transition-colors">{ev.name}</p>
                           <p className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5 mb-4">
                              <Calendar size={12} className="text-blue-600" /> {ev.date}
                           </p>
                           <p className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1.5 mb-6">
                              <MapPin size={12} className="text-zinc-600" /> {ev.track}
                           </p>
                           <div className="flex items-center justify-between">
                              <span className={`text-[8px] font-black uppercase px-2 py-1 rounded border ${
                                ev.status === 'Finalizada' ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 
                                ev.status === 'Próxima' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse' :
                                'bg-blue-600/5 text-blue-500/40 border-blue-600/10'
                              }`}>
                                {ev.status}
                              </span>
                              {ev.status === 'Finalizada' && <CheckCircle2 size={14} className="text-emerald-500" />}
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'posiciones' && (
          <div className="animate-in fade-in slide-in-from-right-2 duration-500">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="bg-black p-6 px-10 border-b border-zinc-800 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <ListOrdered className="text-blue-600" size={20} />
                    <span className="text-xs font-black uppercase tracking-widest text-white">Standings Oficiales • {selectedCategory}</span>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-black text-zinc-600 text-[8px] font-black uppercase tracking-[0.3em] border-b border-zinc-800">
                       <tr>
                          <th className="px-10 py-5 w-20 text-center">Rank</th>
                          <th className="px-10 py-5 w-24 text-center">Kart</th>
                          <th className="px-10 py-5">Piloto</th>
                          <th className="px-10 py-5 text-center">Wins</th>
                          <th className="px-10 py-5 text-center">Podiums</th>
                          <th className="px-10 py-5 text-right pr-10">Puntos</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                       {standingsPilots.map((p, i) => (
                          <tr key={p.id} className="hover:bg-blue-600/[0.03] transition-colors group">
                             <td className="px-10 py-5 text-center">
                                <span className={`text-2xl font-black oswald italic ${i === 0 ? 'text-blue-600' : i < 3 ? 'text-zinc-200' : 'text-zinc-700'}`}>0{i + 1}</span>
                             </td>
                             <td className="px-10 py-5 text-center">
                                <span className="bg-black border border-zinc-800 text-white font-black oswald px-3 py-1 rounded text-base group-hover:text-blue-600 transition-colors">#{p.number}</span>
                             </td>
                             <td className="px-10 py-5">
                                <p className="text-xs font-black text-white uppercase group-hover:text-blue-600 transition-all">{p.name}</p>
                                <p className="text-[8px] text-zinc-600 uppercase font-black">{p.association}</p>
                             </td>
                             <td className="px-10 py-5 text-center text-xs font-black text-white oswald group-hover:text-blue-600 transition-colors">{p.stats?.wins || 0}</td>
                             <td className="px-10 py-5 text-center text-xs font-black text-zinc-400 oswald">{p.stats?.podiums || 0}</td>
                             <td className="px-10 py-5 text-right pr-10">
                                <span className="text-2xl font-black text-emerald-500 oswald group-hover:text-blue-600 transition-colors">{(p.stats?.points || 0).toFixed(1)}</span>
                             </td>
                          </tr>
                       ))}
                       {standingsPilots.length === 0 && (
                          <tr>
                             <td colSpan={6} className="py-24 text-center">
                                <Award size={48} className="text-zinc-800 mx-auto mb-4 opacity-20" />
                                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Sin datos de competencia para esta categoría</p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] flex items-center gap-6">
                  <div className="bg-black p-4 rounded-2xl text-blue-600"><Star size={24} /></div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Cálculo Pole</p>
                    <p className="text-sm font-black text-white uppercase oswald">+5 Puntos</p>
                  </div>
               </div>
               <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] flex items-center gap-6">
                  <div className="bg-black p-4 rounded-2xl text-emerald-500"><Award size={24} /></div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Cálculo Final</p>
                    <p className="text-sm font-black text-white uppercase oswald">+25 Puntos (P1)</p>
                  </div>
               </div>
               <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] flex items-center gap-6">
                  <div className="bg-black p-4 rounded-2xl text-blue-600"><Trophy size={24} /></div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Cálculo Podio</p>
                    <p className="text-sm font-black text-white uppercase oswald">+15 Puntos (P2/P3)</p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campeonatos;
