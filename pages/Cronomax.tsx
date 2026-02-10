
import React, { useState, useEffect } from 'react';
import { Shield, Radio, Flag, Zap, Users, AlertCircle, RefreshCw, Megaphone, Lock } from 'lucide-react';
import { storageService } from '../services/storageService';
import { TrackFlag, Pilot } from '../types';

const Cronomax: React.FC = () => {
  const [trackStatus, setTrackStatus] = useState<TrackFlag>(TrackFlag.VERDE);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [lotteryResult, setLotteryResult] = useState<{pilot: string, motor: number}[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [paddockAlert, setPaddockAlert] = useState("Sin avisos pendientes");

  useEffect(() => {
    setTrackStatus(storageService.getTrackStatus());
    setPilots(storageService.getPilots().filter(p => p.status === 'Confirmado'));
  }, []);

  const changeFlag = (flag: TrackFlag) => {
    setTrackStatus(flag);
    storageService.saveTrackStatus(flag);
  };

  const runMotorLottery = () => {
    setIsSpinning(true);
    setLotteryResult([]);
    setTimeout(() => {
      const activePilots = pilots.slice(0, 10);
      const shuffledMotors = Array.from({length: activePilots.length}, (_, i) => i + 101).sort(() => Math.random() - 0.5);
      const results = activePilots.map((p, i) => ({ pilot: p.name, motor: shuffledMotors[i] }));
      setLotteryResult(results);
      setIsSpinning(false);
    }, 2000);
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-red-600">
      <div className="max-w-[1600px] mx-auto p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-3 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.4)]">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black oswald uppercase tracking-tighter leading-none">Cronomax <span className="text-red-600">Pure</span></h1>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Gestión Humana de Circuito • Torre Central</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
              <Megaphone size={20} className="text-red-500" />
              <div className="text-left">
                <p className="text-[8px] font-black text-zinc-500 uppercase leading-none mb-1">Aviso de Paddock</p>
                <input 
                  type="text" 
                  value={paddockAlert} 
                  onChange={(e) => setPaddockAlert(e.target.value)} 
                  className="bg-transparent text-[10px] font-bold uppercase outline-none text-white border-b border-zinc-800 focus:border-red-600"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Banderas */}
          <div className="xl:col-span-1 space-y-8">
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl">
              <h3 className="text-xs font-black uppercase text-zinc-500 tracking-[0.2em] mb-8 flex items-center gap-2">
                <Flag size={14} /> Señalización de Pista
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: TrackFlag.VERDE, color: 'bg-emerald-600', label: 'BANDERAS VERDES' },
                  { id: TrackFlag.AMARILLA, color: 'bg-yellow-500', label: 'PRECAUCIÓN' },
                  { id: TrackFlag.ROJA, color: 'bg-red-600', label: 'CARRERA DETENIDA' },
                  { id: TrackFlag.AZUL, color: 'bg-blue-600', label: 'CEDER PASO' },
                  { id: TrackFlag.CUADROS, color: 'bg-white', label: 'FIN DE CARRERA' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => changeFlag(f.id)}
                    className={`p-6 rounded-2xl flex items-center justify-between border-2 transition-all ${
                      trackStatus === f.id 
                      ? `${f.id === TrackFlag.CUADROS ? 'border-zinc-100' : `border-${f.color.split('-')[1]}-600`} bg-zinc-800` 
                      : 'border-transparent bg-zinc-900/50 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg ${f.color} shadow-lg ${f.id === TrackFlag.CUADROS ? 'text-black flex items-center justify-center font-bold' : ''}`}>
                        {f.id === TrackFlag.CUADROS && '#'}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{f.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sorteo de Motores */}
          <div className="xl:col-span-3 space-y-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                   <div className="bg-red-600 p-3 rounded-2xl"><RefreshCw className={isSpinning ? 'animate-spin' : ''} /></div>
                   <h2 className="text-2xl font-black oswald uppercase">Sorteo de Motores <span className="text-red-600">Sellados</span></h2>
                </div>
                <button 
                  onClick={runMotorLottery} 
                  disabled={isSpinning}
                  className="bg-white text-black hover:bg-red-600 hover:text-white px-8 py-3 rounded-xl font-black uppercase text-xs transition-all flex items-center gap-2"
                >
                  Iniciar Sorteo Público
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isSpinning ? (
                  Array.from({length: 6}).map((_, i) => (
                    <div key={i} className="h-20 bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-700 animate-pulse"></div>
                  ))
                ) : lotteryResult.length > 0 ? (
                  lotteryResult.map((res, i) => (
                    <div key={i} className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex justify-between items-center group hover:border-red-600 transition-all">
                       <div>
                          <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">Piloto</p>
                          <p className="text-xs font-black uppercase text-white">{res.pilot}</p>
                       </div>
                       <div className="bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-700 group-hover:bg-red-600 transition-colors">
                          <p className="text-[8px] font-black text-zinc-400 group-hover:text-white uppercase leading-none mb-1">Motor</p>
                          <p className="text-lg font-black oswald text-red-500 group-hover:text-white leading-none">#{res.motor}</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-3xl">
                    Realice el sorteo al finalizar el briefing de pilotos.
                  </div>
                )}
              </div>
            </div>

            {/* Listado de Precintos Técnicos */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
               <div className="bg-zinc-950 p-6 px-10 border-b border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Lock className="text-red-600" size={18} />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Registro de Precintos Técnicos</h3>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">{pilots.length} Verificados</span>
               </div>
               <div className="p-0">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-950 text-zinc-600 text-[8px] font-black uppercase tracking-widest border-b border-zinc-900">
                        <th className="px-10 py-4">Dorsal</th>
                        <th className="px-10 py-4">Piloto</th>
                        <th className="px-10 py-4">Precinto Motor</th>
                        <th className="px-10 py-4">Precinto Chasis</th>
                        <th className="px-10 py-4 text-right">Técnica</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pilots.map(p => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-10 py-5 font-black oswald text-red-500">#{p.number}</td>
                          <td className="px-10 py-5 text-xs font-bold uppercase">{p.name}</td>
                          <td className="px-10 py-5 text-[10px] font-mono text-zinc-500">KDO-26-{p.number}-M</td>
                          <td className="px-10 py-5 text-[10px] font-mono text-zinc-500">KDO-26-{p.number}-C</td>
                          <td className="px-10 py-5 text-right">
                             <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[8px] font-black uppercase">Aprobado</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cronomax;
