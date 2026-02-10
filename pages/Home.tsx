
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { 
  Trophy, Zap, MapPin, Users, Sparkles, Star, ChevronRight, MessageCircle, Flag, Info, Heart
} from 'lucide-react';

const Home: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [aiNews, setAiNews] = useState("Sincronizando con KDO SMART...");
  const [pilots, setPilots] = useState(storageService.getPilots());

  useEffect(() => {
    setCategories(storageService.getCategories());
    const fetchNews = async () => {
      try {
        const news = await aiService.generateNewsDigest();
        setAiNews(news || "KDO SYSTEM ONLINE");
      } catch (error) {
        console.error("News sync failed:", error);
        setAiNews("KDO SYSTEM v10.0 ACTIVE");
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="bg-black">
      <Hero />

      {/* INSTITUTIONAL TICKER */}
      <div className="bg-blue-600 py-3 border-y border-blue-700 overflow-hidden relative shadow-[0_0_40px_rgba(37,99,235,0.3)]">
        <div className="whitespace-nowrap animate-marquee flex gap-12 items-center">
          {[1,2,3].map(i => (
            <span key={i} className="text-[10px] font-black uppercase text-white tracking-[0.3em] flex items-center gap-4">
              <Sparkles size={12} fill="white" /> {aiNews}
              <Zap size={12} fill="white" /> KDO SYSTEM v10.0 ACTIVE
            </span>
          ))}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-20">
          
          {/* FAN ZONE - VOTING */}
          <div className="lg:col-span-2 glass-panel rounded-[3rem] p-10 border border-blue-600/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Heart size={180} className="text-blue-600" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                 <Star className="text-blue-500 animate-pulse" size={24} />
                 <h2 className="text-3xl font-black oswald uppercase text-white italic tracking-tighter">Fan Zone <span className="text-blue-600">KDO</span></h2>
              </div>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-10 leading-relaxed">Vota por el piloto de la fecha y participa por pases exclusivos a Paddock.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pilots.slice(0, 2).map(p => (
                  <div key={p.id} className="bg-black/60 border border-white/5 p-6 rounded-3xl flex items-center justify-between hover:border-blue-600 transition-all cursor-pointer group/item" onClick={() => { storageService.castVote(p.id); alert('Voto registrado!'); }}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center font-black oswald text-2xl italic text-white shadow-xl">#{p.number}</div>
                      <div>
                        <p className="text-white font-black uppercase text-sm">{p.name}</p>
                        <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">{p.category}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-zinc-900 rounded-xl text-zinc-700 group-hover/item:text-blue-500 group-hover/item:bg-blue-600/10 transition-all"><Heart size={18} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* INSTITUTIONAL STATS */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[3rem] p-10 flex flex-col justify-between">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <Users className="text-blue-500" size={20} />
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Padrón Federado</span>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <span className="text-[9px] font-black uppercase text-zinc-600">Pilotos Activos</span>
                     <span className="text-3xl font-black text-white oswald italic">{pilots.length}</span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-600 w-[85%]"></div>
                  </div>
               </div>
            </div>
            <div className="mt-10 pt-10 border-t border-white/5 space-y-4">
               <div className="flex items-center gap-4">
                  <Flag className="text-blue-500" size={16} />
                  <span className="text-[9px] font-black uppercase text-white tracking-widest">Siguiente: Chivilcoy Masters</span>
               </div>
               <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest leading-loose">Técnica habilitada desde 08:00 AM • Firma de planilla obligatoria.</p>
            </div>
          </div>
        </div>

        {/* QUICK ACCESS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Hall of Fame', icon: Trophy, path: '/historia', color: 'text-blue-500' },
            { label: 'Paddock Map', icon: MapPin, path: '/circuitos', color: 'text-white' },
            { label: 'Briefing Assis.', icon: MessageCircle, path: '/reglamentos', color: 'text-blue-400' },
            { label: 'Institucional', icon: Info, path: '/resultados', color: 'text-zinc-500' }
          ].map(item => (
            <Link key={item.label} to={item.path} className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center group hover:bg-white/[0.02] transition-all border-white/5">
              <div className={`mb-4 p-4 rounded-2xl bg-black border border-white/5 group-hover:scale-110 transition-transform ${item.color}`}>
                <item.icon size={28} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORY EXPLORER */}
      <section className="bg-zinc-950 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="text-5xl font-black italic oswald uppercase text-white tracking-tighter">Escalafón <span className="text-blue-600">KDO</span></h2>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">La pirámide del karting en tierra bonaerense</p>
              </div>
              <Link to="/pilotos" className="bg-zinc-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border border-white/5">Explorar Padrón Completo</Link>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.slice(0, 4).map(cat => (
                <div key={cat} className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl relative group overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5"><Users size={60} /></div>
                   <h4 className="text-white font-black uppercase oswald italic text-lg tracking-tight mb-4">{cat}</h4>
                   <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-6 leading-relaxed">Categoría de alto rendimiento técnico bajo normativa FRAD.</p>
                   <Link to={`/pilotos?category=${cat}`} className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">Ver Pilotos <ChevronRight size={14} /></Link>
                </div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
