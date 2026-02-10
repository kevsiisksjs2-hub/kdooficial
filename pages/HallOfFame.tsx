
import React, { useEffect, useState } from 'react';
import { Trophy, Star, Award, Zap, ChevronRight, History, ShieldCheck } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Championship } from '../types';

const HallOfFame = () => {
  const [championships, setChampionships] = useState<Championship[]>([]);

  useEffect(() => {
    setChampionships(storageService.getChampionships());
  }, []);

  return (
    <div className="bg-black py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <header className="mb-24">
          <div className="bg-blue-600/10 w-28 h-28 rounded-[3rem] flex items-center justify-center mx-auto mb-10 border border-blue-600/20 shadow-[0_0_80px_rgba(37,99,235,0.15)]">
            <Star size={56} className="text-blue-500" />
          </div>
          <h1 className="text-8xl font-black italic oswald uppercase text-white mb-6 tracking-tighter">Legado <span className="text-blue-500">KDO</span></h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-0.6em max-w-lg mx-auto">El Panteón de los Grandes del Karting en Tierra</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-left">
          {championships.map((ch) => (
            <div key={ch.id} className="bg-zinc-900 border border-zinc-800 p-12 rounded-[4rem] relative overflow-hidden group hover:border-blue-600 transition-all shadow-2xl">
               <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12"><Trophy size={180} className="text-blue-500" /></div>
               
               <div className="flex items-center gap-4 mb-10">
                  <div className="bg-black border border-white/10 px-6 py-2 rounded-2xl"><span className="text-blue-500 font-black oswald text-xl italic">{ch.year}</span></div>
                  <div className="h-px bg-zinc-800 flex-grow"></div>
               </div>

               <h3 className="text-3xl font-black oswald uppercase text-white mb-10 italic leading-none tracking-tighter group-hover:text-blue-500 transition-colors">{ch.name}</h3>
               
               <div className="space-y-8">
                  {ch.champions?.map((winner, idx) => (
                    <div key={idx} className="flex justify-between items-center py-6 border-b border-white/5 group/champ">
                       <div>
                          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{winner.category}</p>
                          <p className="text-xl font-black oswald text-white uppercase tracking-tight group-hover/champ:text-blue-500 transition-colors">{winner.pilot}</p>
                       </div>
                       <div className="bg-black p-4 rounded-2xl text-blue-500 shadow-xl border border-white/5 group-hover/champ:scale-110 transition-all"><Award size={24} /></div>
                    </div>
                  )) || (
                    <div className="py-20 text-center opacity-30">
                       <Zap className="text-zinc-600 mx-auto mb-6" size={48} />
                       <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">SEASON IN PROGRESS</p>
                    </div>
                  )}
               </div>
               
               <div className="mt-12 flex justify-between items-center pt-8 border-t border-white/5">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="text-zinc-700" size={16} />
                     <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Validado por FRAD</span>
                  </div>
                  <button className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">Ver Yearbook <ChevronRight size={14} /></button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HallOfFame;
