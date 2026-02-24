
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Radio, Flag, Zap, Users, AlertCircle, RefreshCw, Megaphone, Lock, FileDown, Upload, Activity, AlertTriangle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { TrackFlag, Pilot, Category, PenaltyType, PublishedSession } from '../types';
import { generateOfficialResultsPDF } from '../utils/pdfGenerator';

const Cronomax: React.FC = () => {
  const navigate = useNavigate();
  const [trackStatus, setTrackStatus] = useState<TrackFlag>(TrackFlag.VERDE);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [lotteryResult, setLotteryResult] = useState<{pilot: string, motor: number}[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [paddockAlert, setPaddockAlert] = useState("Sin avisos pendientes");
  
  // States for Publishing
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('');
  const [categoryPilots, setCategoryPilots] = useState<Pilot[]>([]);
  const [sessionPenalties, setSessionPenalties] = useState<Record<string, {type: PenaltyType, reason: string}>>({});
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const auth = storageService.getAuth();
    if (!auth || (auth.role !== 'Cronomax' && auth.role !== 'SuperAdmin')) {
      navigate('/AdminKDO');
      return;
    }

    setTrackStatus(storageService.getTrackStatus());
    const allPilots = storageService.getPilots();
    setPilots(allPilots.filter(p => p.status === 'Confirmado'));
    setCategories(storageService.getCategories());
    if (storageService.getCategories().length > 0) {
        setSelectedCategory(storageService.getCategories()[0]);
    }
  }, []);

  useEffect(() => {
    // Filter pilots for the selected category for the publishing section
    if (selectedCategory) {
        const filtered = pilots.filter(p => p.category === selectedCategory);
        // Simulate an initial order (random for demo) if not exists
        // In a real app, this would come from the transponder loop
        setCategoryPilots(filtered);
    }
  }, [selectedCategory, pilots]);

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

  const addPenalty = (pilotId: string, type: PenaltyType, reason: string) => {
    setSessionPenalties(prev => ({
        ...prev,
        [pilotId]: { type, reason }
    }));
  };

  const removePenalty = (pilotId: string) => {
    const next = { ...sessionPenalties };
    delete next[pilotId];
    setSessionPenalties(next);
  };

  const handleDownloadPDF = () => {
    const formattedResults = categoryPilots.map((p, i) => ({
        ...p,
        position: i + 1,
        time: "00:48." + Math.floor(Math.random() * 999), // Simulated time
    }));
    generateOfficialResultsPDF(selectedCategory, formattedResults, "RESULTADOS PRELIMINARES", "CRONOMAX SYSTEM");
  };

  const handlePublishToPortal = async () => {
    setIsPublishing(true);
    try {
        // Prepare data structure
        const results = categoryPilots.map((p, i) => ({
            pilotId: p.id,
            pilotName: p.name,
            number: p.number,
            position: i + 1,
            bestLap: "48." + Math.floor(Math.random() * 900 + 100),
            totalTime: "12:05." + Math.floor(Math.random() * 999),
            penalty: sessionPenalties[p.id]
        }));

        // AI Processing simulation
        const summary = await aiService.processRaceDataForPublishing(selectedCategory, results);

        const newSession: PublishedSession = {
            id: Math.random().toString(36).substr(2, 9),
            eventName: "GRAN PREMIO KDO",
            category: selectedCategory,
            date: new Date().toLocaleString(),
            aiSummary: summary,
            results: results
        };

        storageService.savePublishedSession(newSession);
        
        // Also save penalties to the global penalty registry if needed, 
        // but here we attach them to the session result specifically.
        
        alert("¡Resultados publicados exitosamente en el Portal Público con procesamiento IA!");
        setSessionPenalties({});
    } catch (e) {
        alert("Error al publicar resultados.");
    } finally {
        setIsPublishing(false);
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-red-600">
      <div className="max-w-[1600px] mx-auto p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center gap-8">
            <Link to="/AdminKDO/dashboard" className="bg-zinc-900 p-3 rounded-xl hover:bg-blue-600 transition-colors group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="bg-red-600 p-3 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                <Shield size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-black oswald uppercase tracking-tighter leading-none">Cronomax <span className="text-red-600">Pure</span></h1>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Gestión Humana de Circuito • Torre Central</p>
              </div>
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

          {/* Sorteo de Motores y Resultados */}
          <div className="xl:col-span-3 space-y-8">
            
            {/* PUBLICACIÓN DE RESULTADOS & PENALIZACIONES */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={150} className="text-white" /></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                        <div>
                            <h3 className="text-2xl font-black oswald uppercase text-white italic">Centro de Cómputos <span className="text-blue-500">& Publicación</span></h3>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Gestión de Resultados y Sanciones Post-Carrera</p>
                        </div>
                        <div className="flex gap-4">
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-black border border-zinc-700 text-white rounded-xl px-4 py-2 font-black uppercase text-xs outline-none focus:border-blue-600">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden mb-8 max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-950 text-zinc-500 text-[9px] font-black uppercase sticky top-0 z-20">
                                <tr>
                                    <th className="px-6 py-4">Pos</th>
                                    <th className="px-6 py-4">Kart</th>
                                    <th className="px-6 py-4">Piloto</th>
                                    <th className="px-6 py-4 text-center">Estado / Penalización</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {categoryPilots.map((p, index) => (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-black oswald text-lg">{index + 1}</td>
                                        <td className="px-6 py-4 font-bold text-blue-500">#{p.number}</td>
                                        <td className="px-6 py-4 font-bold text-xs uppercase">{p.name}</td>
                                        <td className="px-6 py-4 text-center">
                                            {sessionPenalties[p.id] ? (
                                                <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-600 text-red-500 px-3 py-1 rounded text-[9px] font-black uppercase">
                                                    <AlertTriangle size={10} />
                                                    {sessionPenalties[p.id].type}
                                                </div>
                                            ) : (
                                                <span className="text-zinc-600 text-[9px] font-bold">OK</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {sessionPenalties[p.id] ? (
                                                <button onClick={() => removePenalty(p.id)} className="text-zinc-500 hover:text-white text-[9px] font-black uppercase bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-700">Quitar</button>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => addPenalty(p.id, 'Recargo 5s', 'Maniobra peligrosa')} className="text-orange-500 hover:text-white bg-zinc-900 hover:bg-orange-500 px-2 py-1 rounded text-[8px] font-black uppercase border border-zinc-700">+5s</button>
                                                    <button onClick={() => addPenalty(p.id, 'Recargo Puesto', 'Adelantamiento ilícito')} className="text-blue-500 hover:text-white bg-zinc-900 hover:bg-blue-500 px-2 py-1 rounded text-[8px] font-black uppercase border border-zinc-700">Puesto</button>
                                                    <button onClick={() => addPenalty(p.id, 'Exclusión', 'Técnica')} className="text-red-500 hover:text-white bg-zinc-900 hover:bg-red-600 px-2 py-1 rounded text-[8px] font-black uppercase border border-zinc-700">Excl.</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex gap-4 justify-end">
                        <button onClick={handleDownloadPDF} className="bg-zinc-800 text-white hover:bg-white hover:text-black px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 border border-zinc-700">
                            <FileDown size={16} /> Solo PDF
                        </button>
                        <button onClick={handlePublishToPortal} disabled={isPublishing} className="bg-blue-600 text-white hover:bg-blue-500 px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-blue-600/20 disabled:opacity-50">
                            {isPublishing ? <Activity className="animate-spin" size={16} /> : <Upload size={16} />}
                            {isPublishing ? 'Procesando con IA...' : 'Publicar en Portal (AI Import)'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sorteo de Motores */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                    <div className="bg-red-600 p-2.5 rounded-xl"><RefreshCw className={isSpinning ? 'animate-spin' : ''} size={20} /></div>
                    <h2 className="text-lg font-black oswald uppercase">Sorteo <span className="text-red-600">Motores</span></h2>
                    </div>
                    <button 
                    onClick={runMotorLottery} 
                    disabled={isSpinning}
                    className="bg-white text-black hover:bg-red-600 hover:text-white px-6 py-2 rounded-lg font-black uppercase text-[9px] transition-all"
                    >
                    Sortear
                    </button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {isSpinning ? (
                    Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="h-12 bg-zinc-800/30 rounded-xl border border-dashed border-zinc-700 animate-pulse"></div>
                    ))
                    ) : lotteryResult.length > 0 ? (
                    lotteryResult.map((res, i) => (
                        <div key={i} className="bg-zinc-950 p-3 px-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                        <p className="text-[10px] font-black uppercase text-white">{res.pilot}</p>
                        <p className="text-sm font-black oswald text-red-500">#{res.motor}</p>
                        </div>
                    ))
                    ) : (
                    <div className="text-center text-zinc-600 text-[10px] uppercase font-bold py-10">Esperando Sorteo</div>
                    )}
                </div>
                </div>

                {/* Listado de Precintos Técnicos */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="bg-zinc-950 p-6 border-b border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Lock className="text-red-600" size={18} />
                        <h3 className="text-xs font-black uppercase tracking-[0.3em]">Precintos</h3>
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">{pilots.length} OK</span>
                </div>
                <div className="p-0 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-950 text-zinc-600 text-[8px] font-black uppercase sticky top-0">
                        <tr>
                            <th className="px-6 py-3">Kart</th>
                            <th className="px-6 py-3">Motor</th>
                            <th className="px-6 py-3 text-right">Check</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {pilots.slice(0, 8).map(p => (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-3 font-black oswald text-red-500">#{p.number}</td>
                            <td className="px-6 py-3 text-[9px] font-mono text-zinc-500">KDO-{p.number}-M</td>
                            <td className="px-6 py-3 text-right">
                                <CheckCircle2 size={12} className="text-emerald-500 ml-auto" />
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
    </div>
  );
};

export default Cronomax;
