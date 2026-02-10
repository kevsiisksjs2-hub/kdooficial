
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  const LOGO_URL = "https://api.mundopiloto.com.ar/archivos/2/IMAGENES/ASOCIACIONES/logo_asociacion_2025-06-11T201534737Z.jpg";

  return (
    <footer className="bg-black border-t border-zinc-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-3 mb-6">
                <img src={LOGO_URL} alt="KDO" className="w-12 h-12 rounded-full border border-blue-600 bg-white object-contain p-0.5" />
                <div className="bg-blue-600 px-3 py-1.5 rounded italic font-black text-white text-lg oswald tracking-tighter w-fit shadow-lg">
                   KDO <span className="text-white bg-black/40 px-1.5 rounded-sm text-[8px] ml-1">KART DISCIPLINA OFICIAL</span>
                 </div>
             </div>
            <p className="text-zinc-500 leading-relaxed text-sm font-medium">
              El punto de encuentro para todos los pilotos federados. Gestión profesional de carreras en tierra bajo normativa oficial de la asociación.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-6">Institucional</h4>
            <ul className="space-y-4 text-zinc-500 text-xs font-bold uppercase tracking-tight">
              <li><Link to="/historia" className="hover:text-blue-500 transition-colors">Historia KDO</Link></li>
              <li><Link to="/reglamentos" className="hover:text-blue-500 transition-colors">Normativas</Link></li>
              <li><Link to="/" className="hover:text-blue-500 transition-colors">Prensa y Medios</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-6">Accesos</h4>
            <ul className="space-y-4 text-zinc-500 text-xs font-bold uppercase tracking-tight">
              <li><Link to="/circuitos" className="hover:text-blue-500 transition-colors">Circuitos</Link></li>
              <li><Link to="/campeonatos" className="hover:text-blue-500 transition-colors">Torneos</Link></li>
              <li><Link to="/inscripciones" className="hover:text-blue-500 transition-colors">Inscribirse</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-6">Comunidad</h4>
            <div className="flex gap-4">
              <a href="#" className="bg-zinc-900 p-3 rounded-full text-zinc-400 hover:text-white hover:bg-blue-600 transition-all shadow-lg"><Facebook size={18} /></a>
              <a href="#" className="bg-zinc-900 p-3 rounded-full text-zinc-400 hover:text-white hover:bg-blue-600 transition-all shadow-lg"><Twitter size={18} /></a>
              <a href="#" className="bg-zinc-900 p-3 rounded-full text-zinc-400 hover:text-white hover:bg-blue-600 transition-all shadow-lg"><Instagram size={18} /></a>
              <a href="#" className="bg-zinc-900 p-3 rounded-full text-zinc-400 hover:text-white hover:bg-blue-600 transition-all shadow-lg"><Youtube size={18} /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-800 text-[10px] font-black uppercase tracking-widest">© 2026 KDO - KART DISCIPLINA OFICIAL. TODOS LOS DERECHOS RESERVADOS.</p>
          <div className="flex gap-6 text-zinc-800 text-[10px] font-black uppercase tracking-widest">
            <Link to="/" className="hover:text-zinc-400 transition-colors">Términos</Link>
            <Link to="/" className="hover:text-zinc-400 transition-colors">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
