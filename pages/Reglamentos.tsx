
import React, { useEffect, useState } from 'react';
import { FileText, Download, BookOpen, Calendar, HardDrive, Sparkles, Activity } from 'lucide-react';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { Regulation, RegulationCategory } from '../types';

const Reglamentos: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [activeFilter, setActiveFilter] = useState<'Todos' | RegulationCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setRegulations(storageService.getRegulations());
  }, []);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await aiService.regulationSearch(searchQuery, regulations);
      setAiResponse(res);
    } catch (e) {
      setAiResponse("Lo siento, hubo un error técnico con el asistente.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownload = (reg: Regulation) => {
    if (!reg.fileData) return;
    const link = document.createElement('a');
    link.href = reg.fileData;
    link.download = `${reg.title.replace(/\s+/g, '_')}_v${reg.version}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filters: ('Todos' | RegulationCategory)[] = ['Todos', 'Técnico', 'Deportivo', 'Calendario', 'Anexo', 'Circular'];
  const filteredRegs = activeFilter === 'Todos' ? regulations : regulations.filter(r => r.category === activeFilter);

  return (
    <div className="bg-black py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <header className="mb-20">
          <div className="bg-blue-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <BookOpen size={48} className="text-white" />
          </div>
          <h1 className="text-7xl font-black italic oswald uppercase text-white mb-4 tracking-tighter">Normativa <span className="text-blue-500">KDO</span></h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-0.5em">Repositorio Oficial de Reglamentos y Anexos</p>
        </header>

        {/* AI ASISTENTE */}
        <div className="max-w-4xl mx-auto mb-16 glass-panel rounded-[3rem] p-10 border border-blue-600/20 text-left relative overflow-hidden">
           <div className="flex items-center gap-4 mb-8">
              <Sparkles className="text-blue-500" size={24} />
              <h3 className="text-xl font-black oswald uppercase text-white italic">Asistente Técnico IA</h3>
           </div>
           <form onSubmit={handleAiSearch} className="relative mb-8">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="¿Duda técnica? Pregunta aquí..." className="w-full bg-black/60 border border-white/5 rounded-2xl py-6 pl-8 pr-32 text-white font-medium focus:border-blue-600 outline-none transition-all" />
              <button disabled={isSearching} className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] shadow-xl">
                {isSearching ? <Activity size={18} className="animate-spin" /> : 'Consultar'}
              </button>
           </form>
           {aiResponse && (
             <div className="p-8 bg-black/80 rounded-3xl border border-blue-600/30 animate-in fade-in zoom-in-95">
                <p className="text-white text-sm italic">"{aiResponse}"</p>
             </div>
           )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`px-8 py-4 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all border ${activeFilter === f ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-blue-500/50'}`}>
              {f}
            </button>
          ))}
        </div>

        {filteredRegs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {filteredRegs.map((reg) => (
              <div key={reg.id} className="bg-zinc-900/30 border border-zinc-800 rounded-[3rem] p-10 flex flex-col justify-between hover:border-blue-600 transition-all group h-full shadow-2xl">
                <div>
                  <div className="flex items-center justify-between mb-6">
                     <span className="bg-blue-600/10 text-blue-500 text-[8px] font-black uppercase px-3 py-1 rounded-lg border border-blue-600/20">{reg.category}</span>
                     <span className="text-[10px] font-black text-zinc-600 oswald italic">v{reg.version}</span>
                  </div>
                  <h3 className="text-2xl font-black oswald uppercase text-white mb-4 leading-none group-hover:text-blue-500 transition-colors">{reg.title}</h3>
                  <p className="text-zinc-600 text-[10px] font-bold uppercase leading-relaxed mb-10">{reg.description}</p>
                </div>
                <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                   <div className="space-y-1">
                      <p className="text-[8px] font-black text-zinc-500 uppercase flex items-center gap-2"><Calendar size={10} /> {reg.date}</p>
                      <p className="text-[8px] font-black text-zinc-500 uppercase flex items-center gap-2"><HardDrive size={10} /> {reg.fileSize}</p>
                   </div>
                   <button onClick={() => handleDownload(reg)} className="bg-white text-black px-6 py-4 rounded-2xl font-black uppercase text-[9px] hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
                     PDF <Download size={14} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center text-zinc-600 font-black uppercase text-[10px] tracking-widest italic">No hay normativas publicadas en esta categoría</div>
        )}
      </div>
    </div>
  );
};

export default Reglamentos;
