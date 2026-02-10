
import React, { useState } from 'react';
import { Ruler, Fuel, Settings2, CloudRain, Sun, Thermometer, Wind, Save, Zap } from 'lucide-react';

const Ingenieria: React.FC = () => {
  const [weight, setWeight] = useState(155);
  const [fuel, setFuel] = useState(5);
  const [laps, setLaps] = useState(15);
  const [targetWeight, setTargetWeight] = useState(165);

  const calculateBallast = () => targetWeight - weight - fuel;
  const calculateFuelTotal = () => laps * 0.45; // 0.45L por vuelta promedio

  return (
    <div className="bg-zinc-950 py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-4">
             <div className="bg-red-600 p-3 rounded-2xl shadow-2xl">
                <Settings2 className="text-white" size={32} />
             </div>
             <div>
                <h1 className="text-5xl font-black italic oswald uppercase text-white tracking-tighter">Ingeniería <span className="text-red-600">de Pista</span></h1>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Setup mecánico y cálculos de rendimiento</p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Calculadoras */}
          <div className="space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] shadow-2xl">
              <h3 className="text-xl font-black oswald uppercase text-white mb-8 flex items-center gap-3">
                <Ruler className="text-red-600" /> Calculadora de Lastre
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">Peso Actual (Kg)</label>
                    <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-6 text-white font-bold focus:border-red-600 outline-none" />
                  </div>
                  <div>
                    <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">Objetivo Reglamentario</label>
                    <input type="number" value={targetWeight} onChange={(e) => setTargetWeight(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-6 text-white font-bold focus:border-red-600 outline-none" />
                  </div>
                </div>
                <div className="p-8 bg-red-600 rounded-[2rem] text-center shadow-xl">
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Lastre Necesario</p>
                  <p className="text-6xl font-black oswald text-white italic">{calculateBallast().toFixed(1)} <span className="text-2xl">KG</span></p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] shadow-2xl">
              <h3 className="text-xl font-black oswald uppercase text-white mb-8 flex items-center gap-3">
                <Fuel className="text-red-600" /> Planificador de Combustible
              </h3>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="flex-grow">
                      <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">Vueltas a Disputar</label>
                      <input type="number" value={laps} onChange={(e) => setLaps(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-6 text-white font-bold focus:border-red-600 outline-none" />
                    </div>
                    <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800 text-center min-w-[150px]">
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Mínimo Sugerido</p>
                      <p className="text-3xl font-black oswald text-red-500">{calculateFuelTotal().toFixed(2)} L</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Setup Sheet */}
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] shadow-2xl">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black oswald uppercase text-white">Setup <span className="text-red-600">Assistant</span></h3>
               <button className="bg-white text-black font-black uppercase text-[10px] px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-xl">
                 <Save size={14} /> Guardar Setup
               </button>
             </div>

             <div className="space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <button className="p-6 bg-zinc-950 rounded-2xl border border-red-600/40 text-red-500 flex flex-col items-center gap-2">
                    <Sun size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Soleado</span>
                  </button>
                  <button className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 text-zinc-600 flex flex-col items-center gap-2 hover:border-zinc-700 transition-all">
                    <CloudRain size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Lluvia</span>
                  </button>
                  <button className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 text-zinc-600 flex flex-col items-center gap-2 hover:border-zinc-700 transition-all">
                    <Wind size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Barro</span>
                  </button>
                </div>

                <div className="bg-black/50 p-8 rounded-[2rem] border border-zinc-800">
                  <div className="flex items-center gap-4 mb-6">
                    <Zap className="text-yellow-500" size={24} />
                    <h4 className="text-xs font-black uppercase text-white tracking-[0.2em]">Sugerencias de la IA KDO</h4>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed italic">
                    "Para suelo seco y compactado en este circuito, sugerimos una relación de transmisión 12/74 y presión de neumáticos 14 PSI delante / 12 PSI detrás para maximizar la tracción en salida de curva 3."
                  </p>
                </div>

                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">Relación (Piñon/Corona)</label>
                        <input type="text" placeholder="12/74" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-6 text-white font-bold" />
                      </div>
                      <div>
                        <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">Presión PSI (L/T)</label>
                        <input type="text" placeholder="14/12" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-6 text-white font-bold" />
                      </div>
                   </div>
                   <div>
                      <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">Observaciones Mecánicas</label>
                      <textarea className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-6 text-white font-medium text-sm h-32 resize-none" placeholder="Ajustes realizados en el eje trasero..."></textarea>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ingenieria;
