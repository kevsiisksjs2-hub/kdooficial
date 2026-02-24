
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Clock, Zap, Signal, Shield, Flag, ChevronUp, ChevronDown, Minus, Share2, FileDown, Check, ExternalLink, Settings, Wifi, WifiOff, Star, Award, XCircle, Trophy } from 'lucide-react';
import { storageService } from '../services/storageService';
import { TimingRow, TrackFlag, SystemSettings } from '../types';
import { generateLiveTimingPDF } from '../utils/pdfGenerator';

const LiveCenter: React.FC = () => {
  const [trackStatus, setTrackStatus] = useState<TrackFlag>(TrackFlag.VERDE);
  const [timing, setTiming] = useState<TimingRow[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(storageService.getSettings());
  const [sessionTime, setSessionTime] = useState("00:12:30");
  const [copied, setCopied] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'simulated'>('simulated');
  const [showSettings, setShowSettings] = useState(false);
  const [orbitsIpInput, setOrbitsIpInput] = useState(settings.orbitsIp || '');

  // Simulación de eventos en tiempo real para el ticker
  const [eventLog, setEventLog] = useState<{ id: string, text: string, type: 'best' | 'info' | 'flag' }[]>([]);

  const addEvent = (text: string, type: 'best' | 'info' | 'flag' = 'info') => {
    setEventLog(prev => [{ id: Math.random().toString(), text, type }, ...prev].slice(0, 5));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const currentFlag = storageService.getTrackStatus();
      if (currentFlag !== trackStatus) {
        setTrackStatus(currentFlag);
        addEvent(`CAMBIO DE BANDERA: ${currentFlag.toUpperCase()}`, 'flag');
      }
      
      const currentSettings = storageService.getSettings();
      setSettings(currentSettings);

      if (currentSettings.useLocalOrbits && currentSettings.orbitsIp) {
        fetchFromOrbits(currentSettings.orbitsIp);
      } else {
        if (connectionStatus !== 'simulated') {
            setConnectionStatus('simulated');
        }
        runSimulation();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [trackStatus, settings.useLocalOrbits, settings.orbitsIp]); // Dependency updated to react to settings changes

  const fetchFromOrbits = async (ip: string) => {
    try {
      // Direct connection to Orbits JSON feed. 
      // Note: This requires the Orbits server to allow CORS or the browser to ignore CORS for local IPs if not configured.
      // Usually accessing local IPs like 192.168.x.x directly from browser is fine if mixed content isn't an issue (http vs https).
      const response = await fetch(`http://${ip}:50000/orb/passings`, { 
          method: 'GET',
          mode: 'no-cors', // Try no-cors first for opaque response if server doesn't support CORS
          signal: AbortSignal.timeout(1000) 
      });
      
      // Since 'no-cors' returns opaque response, we can't read data. 
      // Ideally, the Orbits software or a local proxy should expose a JSON endpoint.
      // Assuming a standard JSON endpoint exists on the IP for this implementation based on user request.
      // If using a specific Orbits RMonitor to JSON bridge, the path might be /api/runs or similar.
      // For this implementation, we will try a standard fetch assuming the user has a way to expose JSON.
      
      // Re-attempting with standard fetch assuming a compatible endpoint is available at the IP.
      // Common Orbits JSON output or wrappers often expose specific endpoints.
      const jsonResponse = await fetch(`http://${ip}/results.json`, { signal: AbortSignal.timeout(1000) });
      
      if (jsonResponse.ok) {
        const data = await jsonResponse.json();
        // Transform Orbits data structure to TimingRow
        // This mapping depends heavily on the specific JSON format Orbits exports.
        // Using a generic mapping based on common fields.
        const mappedData: TimingRow[] = Array.isArray(data) ? data.map((item: any, idx: number) => ({
          pos: item.Position || idx + 1,
          no: item.No || item.Number || item.KART,
          name: item.Name || item.Driver || item.PILOT,
          laps: parseInt(item.Laps || item.LAPS || '0'),
          lastLap: item.LastLap || item.LAST_LAP || "00.000",
          bestLap: item.BestLap || item.BEST_LAP || "00.000",
          s1: item.S1 || "00.0",
          s2: item.S2 || "00.0",
          s3: item.S3 || "00.0",
          gap: item.Gap || "-",
          interval: item.Interval || "-",
          status: 'TRACK', // Orbits might not provide status per row easily in simple JSON
          isSessionBest: false, // Would need calculation
          isPersonalBest: false, // Would need calculation
          delta: 'steady'
        })) : [];
        
        if (mappedData.length > 0) {
            setTiming(mappedData);
            setConnectionStatus('connected');
        } else {
            // Fallback if data is empty or malformed
             setConnectionStatus('disconnected');
             runSimulation();
        }
      } else {
        setConnectionStatus('disconnected');
        runSimulation();
      }
    } catch (e) {
      setConnectionStatus('disconnected');
      runSimulation();
    }
  };

  const runSimulation = () => {
    setTiming(prev => {
      if (prev.length === 0) {
        return [
          { pos: 1, no: "01", name: "JUAN ACOSTA", laps: 10, lastLap: "47.902", bestLap: "47.902", s1: "12.1", s2: "18.3", s3: "17.5", gap: "-", interval: "-", status: 'TRACK', isSessionBest: true, isPersonalBest: true, isS1Best: true, isS2Best: true, predictive: "47.8", delta: 'down', transponderSignal: 'Good' },
          { pos: 2, no: "12", name: "MARTIN GARCIA", laps: 10, lastLap: "48.210", bestLap: "48.210", s1: "12.3", s2: "18.5", s3: "17.4", gap: "+0.308", interval: "+0.308", status: 'TRACK', isSessionBest: false, isPersonalBest: true, isS3Best: true, predictive: "48.1", delta: 'up', transponderSignal: 'Good' },
          { pos: 3, no: "08", name: "FRANCISCO PEROYE", laps: 9, lastLap: "48.550", bestLap: "48.300", s1: "12.4", s2: "18.6", s3: "17.6", gap: "+0.648", interval: "+0.340", status: 'TRACK', isSessionBest: false, isPersonalBest: false, predictive: "48.5", delta: 'steady', transponderSignal: 'Good' },
        ] as TimingRow[];
      }

      const topTime = 47.9; // Baseline session record for simulation

      return prev.map(row => {
        if (row.status === 'PITS') return row;
        
        const randomFactor = Math.random();
        if (randomFactor > 0.85) {
          const newLap = row.laps + 1;
          const currentBest = parseFloat(row.bestLap);
          const lapTimeVal = currentBest + (Math.random() - 0.45) * 0.4;
          const randomLapTime = lapTimeVal.toFixed(3);
          const isBetter = parseFloat(randomLapTime) < currentBest;
          
          if (isBetter) {
            addEvent(`KART #${row.no} ${row.name.split(' ')[0]} - PB: ${randomLapTime}`, 'best');
          }

          return {
            ...row,
            laps: newLap,
            lastLap: randomLapTime,
            bestLap: isBetter ? randomLapTime : row.bestLap,
            isPersonalBest: isBetter,
            isSessionBest: isBetter && parseFloat(randomLapTime) < topTime,
            delta: (isBetter ? 'down' : 'up') as 'down' | 'up'
          };
        }

        return {
          ...row,
          predictive: (parseFloat(row.bestLap) + (Math.random() - 0.5) * 0.1).toFixed(3),
          s1: (12 + Math.random() * 0.5).toFixed(1)
        };
      }).sort((a, b) => {
        if (a.laps !== b.laps) return b.laps - a.laps;
        const aBest = a.bestLap ? parseFloat(a.bestLap) : 999;
        const bBest = b.bestLap ? parseFloat(b.bestLap) : 999;
        return aBest - bBest;
      }).map((row, i) => ({ ...row, pos: i + 1 })) as TimingRow[];
    });
  };

  const saveOrbitsSettings = () => {
    const newSettings = { ...settings, orbitsIp: orbitsIpInput, useLocalOrbits: true };
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
    setShowSettings(false);
    addEvent(`CONECTANDO A ORBITS: ${orbitsIpInput}`, 'info');
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    generateLiveTimingPDF("REPORTE LIVE - KDO", trackStatus, timing);
  };

  const flagStyles: Record<TrackFlag, { bg: string, text: string, animate: boolean }> = {
    [TrackFlag.VERDE]: { bg: 'bg-emerald-500', text: 'Pista Habilitada', animate: false },
    [TrackFlag.AMARILLA]: { bg: 'bg-yellow-400', text: 'Precaución - Sector Peligroso', animate: true },
    [TrackFlag.ROJA]: { bg: 'bg-red-600', text: 'Sesión Detenida', animate: true },
    [TrackFlag.AZUL]: { bg: 'bg-blue-600', text: 'Ceder Paso a Kart Líder', animate: true },
    [TrackFlag.CUADROS]: { bg: 'bg-white', text: 'Final de Sesión', animate: false },
  };

  const currentFlagStyle = flagStyles[trackStatus] || flagStyles[TrackFlag.VERDE];

  return (
    <div className="bg-black min-h-screen text-zinc-300 font-mono flex flex-col overflow-hidden">
      {/* TOP HEADER */}
      <div className="bg-zinc-900 border-b border-white/10 p-4 flex flex-col md:flex-row items-center justify-between shadow-2xl z-50 gap-4">
         <div className="flex items-center gap-6">
            <div className={`w-12 h-12 rounded-2xl ${currentFlagStyle.bg} ${currentFlagStyle.animate ? 'animate-pulse' : ''} flex items-center justify-center text-black shadow-[0_0_30px_rgba(255,255,255,0.1)]`}>
               {trackStatus === TrackFlag.CUADROS ? <Flag size={24} /> : <Zap size={24} fill="black" />}
            </div>
            <div>
               <h1 className="text-xl font-black text-white uppercase oswald italic tracking-tighter leading-none mb-1">
                 {settings.useLocalOrbits ? 'ORBITS 5 LIVE FEED' : 'KDO SIMULATOR • LIVE CENTER'}
               </h1>
               <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${currentFlagStyle.bg} text-black transition-colors duration-500`}>{trackStatus}</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{currentFlagStyle.text}</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 bg-black px-6 py-2 rounded-2xl border border-white/5 mr-4">
               <div className="text-center">
                  <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {connectionStatus === 'connected' ? <Wifi className="text-emerald-500" size={12} /> : connectionStatus === 'disconnected' ? <WifiOff className="text-red-600" size={12} /> : <Activity className="text-blue-500" size={12} />}
                    <span className="text-[10px] font-black text-white uppercase tabular-nums tracking-tighter oswald">{connectionStatus.toUpperCase()}</span>
                  </div>
               </div>
               <div className="h-8 w-px bg-white/10"></div>
               <div className="text-center">
                  <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Sesión</p>
                  <p className="text-xl font-black text-white tabular-nums tracking-tighter oswald">{sessionTime}</p>
               </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowSettings(true)} className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-xl transition-all border border-white/5 shadow-lg">
                <Settings size={18} />
              </button>
              <button onClick={handleShare} className="bg-zinc-800 hover:bg-yellow-400 hover:text-black p-3 rounded-xl transition-all border border-white/5 flex items-center gap-2 shadow-lg">
                {copied ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />}
                <span className="text-[9px] font-black uppercase hidden sm:block">{copied ? 'Copiado' : 'Compartir'}</span>
              </button>
              <button onClick={handleExportPDF} className="bg-zinc-100 hover:bg-white text-black p-3 rounded-xl transition-all border border-zinc-200 flex items-center gap-2 shadow-lg">
                <FileDown size={18} />
                <span className="text-[9px] font-black uppercase hidden sm:block">PDF</span>
              </button>
            </div>
         </div>
      </div>

      {/* FEED TICKER */}
      <div className="bg-black/50 border-b border-white/5 py-1.5 px-6 h-10 flex items-center gap-6 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0 border-r border-white/10 pr-4 h-full">
           <Activity size={12} className="text-emerald-500" />
           <span className="text-[8px] font-black uppercase text-emerald-500 italic">FEED:</span>
        </div>
        <div className="flex gap-10 overflow-hidden items-center h-full">
          {eventLog.map(event => (
            <span key={event.id} className={`text-[10px] font-black uppercase whitespace-nowrap animate-in slide-in-from-left-4 duration-500 ${
              event.type === 'best' ? 'text-purple-400' : event.type === 'flag' ? 'text-red-500 font-black scale-110' : 'text-zinc-500'
            }`}>
              {event.text}
            </span>
          ))}
        </div>
      </div>

      {/* TIMING TABLE */}
      <div className="flex-grow overflow-auto relative custom-scrollbar">
         <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-40 bg-black/90 backdrop-blur-3xl border-b border-white/10">
               <tr className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                  <th className="px-6 py-5 text-center">Pos</th>
                  <th className="px-4 py-5 text-center">No.</th>
                  <th className="px-6 py-5">Piloto</th>
                  <th className="px-4 py-5 text-center">Vtas</th>
                  <th className="px-6 py-5 text-right">Ult. Vta</th>
                  <th className="px-6 py-5 text-right">Mejor Vta</th>
                  <th className="px-6 py-5 text-center">Sector 1</th>
                  <th className="px-6 py-5 text-right">Gap</th>
                  <th className="px-6 py-5 text-right">Interval</th>
                  <th className="px-6 py-5 text-center">Predictivo</th>
                  <th className="px-6 py-5 text-center">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
               {timing.map((row) => (
                  <tr key={row.no} className={`transition-all duration-700 ease-in-out hover:bg-white/[0.02] group ${row.status === 'PITS' ? 'opacity-40' : ''}`}>
                     <td className="px-6 py-4 text-center">
                        <span className={`oswald italic font-black text-2xl ${row.pos === 1 ? 'text-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'text-zinc-600'}`}>{row.pos}</span>
                     </td>
                     <td className="px-4 py-4 text-center">
                        <span className={`px-3 py-1 rounded-lg border border-white/5 font-black oswald text-base transition-colors duration-500 ${row.isSessionBest ? 'bg-purple-600 text-white border-purple-400' : 'bg-zinc-800 text-white group-hover:bg-blue-600 group-hover:text-white'}`}>#{row.no}</span>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                           <div className="relative">
                              <p className={`text-sm font-black uppercase tracking-tight transition-colors duration-500 ${row.isSessionBest ? 'text-purple-400' : row.isPersonalBest ? 'text-emerald-400' : 'text-white'}`}>{row.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <Signal size={10} className={row.transponderSignal === 'Good' || connectionStatus === 'simulated' ? 'text-emerald-500' : 'text-orange-500'} />
                                 <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Loop Sync</span>
                              </div>
                           </div>
                           <div className="ml-auto">
                              {row.delta === 'up' && <ChevronUp size={16} className="text-red-500 animate-in fade-in" />}
                              {row.delta === 'down' && <ChevronDown size={16} className="text-emerald-500 animate-in fade-in" />}
                              {row.delta === 'steady' && <Minus size={16} className="text-zinc-700" />}
                           </div>
                        </div>
                     </td>
                     <td className="px-4 py-4 text-center font-bold text-zinc-500 text-sm tabular-nums transition-all duration-300">{row.laps}</td>
                     <td className="px-6 py-4 text-right tabular-nums">
                        <span className={`text-xs font-black transition-all duration-500 px-2 py-0.5 rounded ${
                           row.isSessionBest ? 'text-purple-400 font-extrabold' : 
                           row.isPersonalBest ? 'text-emerald-400' : 
                           'text-zinc-300'
                        }`}>{row.lastLap}</span>
                     </td>
                     <td className="px-6 py-4 text-right tabular-nums">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-1000 ${
                           row.isSessionBest 
                           ? 'bg-purple-600/20 text-purple-400 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                           : row.isPersonalBest 
                           ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20' 
                           : 'bg-black/40 border-white/5 text-zinc-500'
                        }`}>
                           {row.isSessionBest ? (
                              <Trophy size={14} className="text-purple-400 animate-pulse" />
                           ) : row.isPersonalBest ? (
                              <Star size={12} fill="currentColor" className="text-emerald-400" />
                           ) : null}
                           <span className={`text-sm font-black tracking-tighter transition-all ${row.isSessionBest ? 'scale-105' : ''}`}>
                              {row.bestLap}
                           </span>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-center tabular-nums">
                        <span className={`text-[10px] font-black italic transition-colors duration-500 ${row.isS1Best ? 'text-purple-400' : 'text-zinc-600'}`}>{row.s1}</span>
                     </td>
                     <td className="px-6 py-4 text-right text-[10px] font-black text-zinc-600 tabular-nums">{row.gap}</td>
                     <td className="px-6 py-4 text-right text-[10px] font-bold text-zinc-700 tabular-nums">{row.interval}</td>
                     <td className="px-6 py-4 text-center tabular-nums">
                        <span className="text-xs font-black text-zinc-500 oswald">{row.predictive || '---'}</span>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border transition-all duration-500 ${
                           row.status === 'PITS' ? 'bg-red-600/10 text-red-500 border-red-600/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                           {row.status}
                        </span>
                     </td>
                  </tr>
               ))}
               {timing.length === 0 && (
                 <tr>
                    <td colSpan={11} className="py-24 text-center">
                       <Zap size={48} className="text-zinc-800 mx-auto mb-4 animate-pulse" />
                       <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Escaneando transponders en pista...</p>
                    </td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>

      {/* FOOTER BAR */}
      <div className="bg-black border-t border-white/5 p-3 px-8 flex justify-between items-center z-50">
         <div className="flex items-center gap-10">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <Trophy size={10} className="text-purple-500" />
                  <span className="text-[8px] font-black uppercase text-zinc-400">Record Sesión (Púrpura)</span>
               </div>
               <div className="flex items-center gap-2">
                  <Star size={10} className="text-emerald-500" fill="currentColor" />
                  <span className="text-[8px] font-black uppercase text-zinc-400">Mejor Personal (Verde)</span>
               </div>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
               <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Mylaps Loop: {connectionStatus === 'connected' ? 'Sync OK' : 'Offline'}</span>
            </div>
         </div>
         <div className="text-[10px] font-black text-blue-500 uppercase oswald italic tracking-tighter">
            CronoSync KDO v8.5.0 • Live Racing Engine
         </div>
      </div>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-md p-10 rounded-[3rem] shadow-2xl relative animate-in zoom-in-95 duration-200">
             <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors">
                <XCircle size={28} />
             </button>
             <h2 className="text-3xl font-black oswald uppercase text-white italic mb-6">Orbits 5 <span className="text-blue-500">Settings</span></h2>
             
             <div className="space-y-6">
                <div>
                   <label className="block text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-3 ml-1">Mylaps Orbits IP (Local Network)</label>
                   <input 
                     type="text" 
                     value={orbitsIpInput} 
                     onChange={(e) => setOrbitsIpInput(e.target.value)}
                     className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-blue-500 transition-all font-mono"
                     placeholder="Ej: 192.168.1.100"
                   />
                </div>
                
                <div className="p-4 bg-blue-600/5 border border-blue-600/10 rounded-2xl">
                   <p className="text-[10px] font-medium text-zinc-400 leading-relaxed italic">
                     El sistema KDO sincroniza automáticamente con el servidor Orbits local para visualización masiva de tiempos.
                   </p>
                </div>

                <div className="flex flex-col gap-3">
                   <button onClick={saveOrbitsSettings} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-xl transition-all flex items-center justify-center gap-3">
                     <Wifi size={18} /> Conectar Live Feed
                   </button>
                   <button onClick={() => {
                        const s = { ...settings, useLocalOrbits: false };
                        storageService.saveSettings(s);
                        setSettings(s);
                        setShowSettings(false);
                        setConnectionStatus('simulated');
                   }} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-5 rounded-2xl font-black uppercase text-xs transition-all flex items-center justify-center gap-3">
                     <Activity size={18} /> Usar Simulación KDO
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveCenter;
