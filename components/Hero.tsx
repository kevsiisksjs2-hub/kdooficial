
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative h-[650px] flex items-center overflow-hidden bg-transparent">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-10 h-[2px] bg-blue-600"></span>
            <h2 className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] oswald italic">KDO - Kart Disciplina Oficial</h2>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic oswald text-white mb-6 uppercase leading-[0.9] tracking-tighter">
            PASIÓN <br />
            <span className="text-blue-600">DISCIPLINADA</span>
          </h1>
          <p className="text-lg text-zinc-300 mb-10 leading-relaxed font-medium max-w-lg">
            La comunidad más grande de karting en tierra de la provincia. 
            Competencia, técnica y camaradería bajo el sello oficial KDO.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link 
              to="/campeonatos" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs flex items-center gap-3 transition-all transform hover:-translate-y-1 shadow-2xl shadow-blue-600/20"
            >
              Ver Campeonatos
              <ChevronRight size={18} />
            </Link>
            <Link 
              to="/campeonatos" 
              className="bg-zinc-900/50 hover:bg-white hover:text-black backdrop-blur-xl text-white border border-white/10 px-10 py-5 rounded-2xl font-black uppercase text-xs flex items-center gap-3 transition-all"
            >
              <CalendarIcon size={18} />
              Calendario 2026
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
    </div>
  );
};

export default Hero;
