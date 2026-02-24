
import React, { useEffect, useState, useRef } from 'react';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { Category, Status, Pilot } from '../types';
import { 
  FileCheck, UserPlus, X, CheckCircle2, Search, Zap, ChevronRight, 
  ShieldCheck, AlertCircle, Camera, Loader2, Sparkles, UserSearch, User, ArrowRight, RefreshCw
} from 'lucide-react';

const Inscripciones: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [foundInRanking, setFoundInRanking] = useState(false);
  
  // Estado para autocompletado
  const [allKnownPilots, setAllKnownPilots] = useState<Pilot[]>([]); // Todos los pilotos unicos
  const [categoryPilots, setCategoryPilots] = useState<Pilot[]>([]); // Pilotos de la categoria actual (para validar numeros)
  const [nameSuggestions, setNameSuggestions] = useState<Pilot[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    number: '',
    ranking: '99',
    medicalLicense: '',
    sportsLicense: '',
    transponderId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCategories(storageService.getCategories());
  }, []);

  // Cargar pilotos para búsqueda inteligente
  useEffect(() => {
    const all = storageService.getPilots();
    
    // Crear lista de pilotos únicos por nombre para sugerencias globales
    const uniquePilots = Array.from(new Map(all.map(item => [item.name, item])).values());
    setAllKnownPilots(uniquePilots);

    if (selectedCategory) {
      const filtered = all.filter(p => p.category === selectedCategory);
      setCategoryPilots(filtered);
    }
  }, [selectedCategory, showForm]); // Recargar al abrir formulario

  // Lógica de autocompletado (Global)
  const populatePilotData = (pilot: Pilot) => {
    setFormData(prev => ({
      ...prev,
      name: pilot.name,
      // Si el piloto ya existe en ESTA categoría, usamos sus datos exactos.
      // Si viene de OTRA categoría, mantenemos licencias/transponder pero sugerimos revisar el número.
      number: pilot.category === selectedCategory ? pilot.number : prev.number || pilot.number, 
      ranking: pilot.category === selectedCategory ? (pilot.ranking || 99).toString() : '99',
      medicalLicense: pilot.medicalLicense || '',
      sportsLicense: pilot.sportsLicense || '',
      transponderId: pilot.transponderId || ''
    }));
    
    setFoundInRanking(true);
    setNameSuggestions([]);
    setErrors({});
  };

  // Manejo de input de Nombre con sugerencias GLOBALES
  const handleNameInput = (val: string) => {
    setFormData(prev => ({ ...prev, name: val }));
    setFoundInRanking(false);
    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));

    if (val.length > 2) {
      // Buscar en TODOS los pilotos conocidos, no solo en la categoría actual
      const matches = allKnownPilots.filter(p => p.name.includes(val.toUpperCase()));
      setNameSuggestions(matches.slice(0, 5)); // Limitar a 5 sugerencias
    } else {
      setNameSuggestions([]);
    }
  };

  // Manejo de input de Número (Búsqueda en Categoría Actual)
  const handleNumberLookup = (number: string) => {
    setFormData(prev => ({ ...prev, number }));
    if (errors.number) setErrors(prev => ({ ...prev, number: '' }));
    if (!number) return;

    // Buscamos si este número YA existe en la categoría seleccionada
    const match = categoryPilots.find(p => p.number === number);

    if (match) {
      populatePilotData(match);
    } 
  };

  const startCamera = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("No se pudo acceder a la cámara.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
    }
    setIsScanning(false);
  };

  const captureAndScan = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    
    const base64 = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
    setIsAnalyzing(true);
    
    try {
      const data = await aiService.extractLicenseData(base64, 'image/jpeg');
      if (data) {
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          medicalLicense: data.medicalLicense || prev.medicalLicense,
          sportsLicense: data.sportsLicense || prev.sportsLicense,
          number: data.number || prev.number
        }));
        setErrors({});
      }
      stopCamera();
    } catch (error) {
      alert("Error analizando la imagen. Intente de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate Name
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    } else if (formData.name.length < 3) {
      newErrors.name = "El nombre es demasiado corto.";
    }

    // Validate Number (Numeric check)
    if (!formData.number.trim()) {
      newErrors.number = "El dorsal es obligatorio.";
    } else if (!/^\d+$/.test(formData.number.trim())) {
      newErrors.number = "El dorsal debe ser numérico.";
    }
    
    // Validate Ranking (Numeric check)
    if (!formData.ranking) {
      newErrors.ranking = "Ranking requerido.";
    } else if (isNaN(Number(formData.ranking))) {
      newErrors.ranking = "El ranking debe ser un número.";
    }

    // Validación Licencia Médica Única y Formato
    if (!formData.medicalLicense.trim()) {
        newErrors.medicalLicense = "Licencia Médica requerida.";
    } else {
        // Formato básico (ej: alfanumérico, al menos 4 caracteres)
        if (formData.medicalLicense.trim().length < 3) {
           newErrors.medicalLicense = "Formato de licencia inválido.";
        } else {
          const licenseToCheck = formData.medicalLicense.trim().toUpperCase();
          const currentName = formData.name.trim().toUpperCase();
          
          // Buscar si la licencia existe en la base de datos completa
          const allPilots = storageService.getPilots();
          const existingPilotWithLicense = allPilots.find(p => p.medicalLicense && p.medicalLicense.toUpperCase() === licenseToCheck);

          if (existingPilotWithLicense) {
              // Si la licencia existe, el nombre DEBE coincidir
              if (existingPilotWithLicense.name.toUpperCase() !== currentName) {
                  newErrors.medicalLicense = `Licencia registrada a: ${existingPilotWithLicense.name}`;
              }
          }
        }
    }

    // Validate Sports License
    if (!formData.sportsLicense.trim()) {
      newErrors.sportsLicense = "Licencia Deportiva requerida.";
    } else if (formData.sportsLicense.trim().length < 3) {
      newErrors.sportsLicense = "Formato de licencia inválido.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const currentPilots = storageService.getPilots();
    
    // Verificar si ya existe en ESTA categoría
    const existingIdx = currentPilots.findIndex(p => p.number === formData.number && p.category === selectedCategory);
    
    if (existingIdx !== -1) {
      // Re-inscripción (Actualizar estado)
      const updated = [...currentPilots];
      updated[existingIdx] = {
        ...updated[existingIdx],
        status: Status.PENDIENTE,
        medicalLicense: formData.medicalLicense || updated[existingIdx].medicalLicense,
        sportsLicense: formData.sportsLicense || updated[existingIdx].sportsLicense,
        transponderId: formData.transponderId || updated[existingIdx].transponderId,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      storageService.savePilots(updated);
    } else {
      // Nuevo registro (o piloto existente en nueva categoría)
      const newPilot: Pilot = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name.toUpperCase().trim(),
        number: formData.number.trim(),
        category: selectedCategory,
        status: Status.PENDIENTE,
        ranking: parseInt(formData.ranking) || 99,
        medicalLicense: formData.medicalLicense || 'PENDIENTE',
        sportsLicense: formData.sportsLicense || 'PENDIENTE',
        transponderId: formData.transponderId || `TX-${formData.number}`,
        lastUpdated: new Date().toISOString().split('T')[0],
        createdAt: Date.now(),
        conductPoints: 10,
        stats: { wins: 0, podiums: 0, poles: 0 }
      };
      storageService.savePilots([...currentPilots, newPilot]);
    }

    setSubmitted(true);
    // NOTA: Ya no cerramos automáticamente, esperamos acción del usuario (Finalizar o Agregar Categoría)
  };

  const handleAddAnotherCategory = () => {
    setSubmitted(false);
    setStep(1); // Volver a selección de categoría
    setSelectedCategory(''); // Limpiar categoría para obligar a elegir
    // MANTENEMOS formData con los datos personales, pero reseteamos el ranking por defecto para la nueva categoría
    setFormData(prev => ({
      ...prev,
      ranking: '99' 
    }));
    setFoundInRanking(true); // Asumimos que es conocido porque acaba de inscribirse
    setErrors({});
  };

  const handleClose = () => {
    setShowForm(false);
    setSubmitted(false);
    setStep(1);
    setFoundInRanking(false);
    setErrors({});
    setFormData({ name: '', number: '', ranking: '99', medicalLicense: '', sportsLicense: '', transponderId: '' });
  };

  return (
    <div className="bg-black py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-blue-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <FileCheck size={40} className="text-white" />
        </div>
        <h1 className="text-6xl font-black oswald uppercase text-white mb-6">Inscripciones <span className="text-blue-500">Smart</span></h1>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-0.5em mb-12">Portal Automatizado para Pilotos Rankeados y Nuevos</p>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs shadow-2xl hover:scale-105 transition-all">Abrir Portal de Registro</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-y-auto">
          <div className="bg-zinc-900 w-full max-w-lg rounded-[3rem] border border-zinc-800 p-10 relative animate-in zoom-in-95 duration-300">
            <button onClick={() => { stopCamera(); handleClose(); }} className="absolute top-10 right-10 text-zinc-500 hover:text-white transition-colors"><X size={28} /></button>
            
            {!submitted ? (
              <>
                <h2 className="text-3xl font-black oswald uppercase text-white mb-8">{step === 1 ? 'Seleccione Categoría' : 'Datos de Inscripción'}</h2>
                {step === 1 ? (
                   <div className="space-y-3">
                      {categories.map(c => (
                        <button key={c} onClick={() => { setSelectedCategory(c); setStep(2); }} className="w-full bg-black border border-zinc-800 hover:border-blue-600 text-white font-bold py-5 px-6 rounded-2xl flex justify-between items-center group transition-all">
                          <span className="group-hover:text-blue-500 transition-colors">{c}</span> <ChevronRight size={18} />
                        </button>
                      ))}
                   </div>
                ) : (
                   <form onSubmit={handleDirectSubmit} className="space-y-6">
                      <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 mb-6">
                        <div className="flex items-center gap-3">
                           <Zap size={16} className="text-blue-500" />
                           <span className="text-white text-[10px] font-black uppercase tracking-widest">{selectedCategory}</span>
                        </div>
                        <button type="button" onClick={() => setStep(1)} className="text-[8px] font-black text-zinc-500 hover:text-white uppercase">Cambiar</button>
                      </div>

                      {foundInRanking && (
                        <div className="bg-blue-600/10 border border-blue-600/30 p-4 rounded-2xl flex items-center gap-3 mb-4 animate-in fade-in">
                           <CheckCircle2 size={20} className="text-blue-500" />
                           <div>
                              <p className="text-[10px] font-black uppercase text-blue-500">Datos Recuperados</p>
                              <p className="text-[9px] font-medium text-zinc-400">Información cargada de historial o inscripción previa.</p>
                           </div>
                        </div>
                      )}

                      <div className="space-y-5">
                        
                        {/* NOMBRE CON SUGERENCIAS */}
                        <div className="relative">
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block ml-2">Piloto (Nombre y Apellido)</label>
                          <div className="relative">
                             <input 
                               value={formData.name} 
                               onChange={e => handleNameInput(e.target.value.toUpperCase())} 
                               className={`w-full bg-black border rounded-2xl px-6 py-4 text-white font-bold uppercase outline-none transition-all ${errors.name ? 'border-red-600 focus:border-red-600' : 'border-zinc-800 focus:border-blue-600'}`} 
                               placeholder="Ingrese su nombre..." 
                               autoComplete="off"
                             />
                             {errors.name && <p className="text-red-500 text-[9px] font-bold uppercase mt-1 ml-2 flex items-center gap-1"><AlertCircle size={10} /> {errors.name}</p>}
                             {nameSuggestions.length > 0 && (
                               <div className="absolute top-full left-0 w-full bg-zinc-900 border border-zinc-700 rounded-xl mt-2 z-50 overflow-hidden shadow-2xl max-h-48 overflow-y-auto">
                                  {nameSuggestions.map((s, idx) => (
                                    <div 
                                      key={`${s.id}-${idx}`} 
                                      onClick={() => populatePilotData(s)}
                                      className="p-3 hover:bg-blue-600 hover:text-white cursor-pointer flex items-center justify-between text-xs font-bold uppercase text-zinc-300 transition-colors border-b border-zinc-800 last:border-0"
                                    >
                                       <span className="flex items-center gap-2">
                                          <Sparkles size={10} className="text-blue-500" />
                                          <span className="font-bold">{s.name}</span>
                                       </span>
                                       <div className="flex items-center gap-2">
                                          <span className="text-[8px] text-zinc-500 bg-black/40 px-2 py-1 rounded">{s.category}</span>
                                          <span className="text-[9px] bg-blue-600/20 text-blue-500 px-2 py-1 rounded font-black">#{s.number}</span>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                             )}
                          </div>
                        </div>

                        {/* NUMERO DE KART */}
                        <div className="relative">
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block ml-2">Número de Kart</label>
                          <input 
                            type="text"
                            value={formData.number} 
                            onChange={e => handleNumberLookup(e.target.value.replace(/\D/g, ''))} 
                            className={`w-full bg-black border rounded-2xl px-6 py-5 text-white font-black oswald text-3xl outline-none transition-all ${errors.number ? 'border-red-600 focus:border-red-600' : 'border-zinc-800 focus:border-blue-600'}`}
                            placeholder="00" 
                          />
                          {errors.number && <p className="text-red-500 text-[9px] font-bold uppercase mt-1 ml-2 flex items-center gap-1"><AlertCircle size={10} /> {errors.number}</p>}
                        </div>

                        {/* RANKING */}
                        <div className="relative">
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block ml-2">Ranking Actual</label>
                          <input 
                            type="number"
                            value={formData.ranking}
                            onChange={e => {
                                setFormData({...formData, ranking: e.target.value});
                                if (errors.ranking) setErrors(prev => ({...prev, ranking: ''}));
                            }}
                            className={`w-full bg-black border rounded-2xl px-6 py-4 text-white font-bold uppercase outline-none transition-all ${errors.ranking ? 'border-red-600 focus:border-red-600' : 'border-zinc-800 focus:border-blue-600'}`}
                            placeholder="99"
                          />
                          {errors.ranking && <p className="text-red-500 text-[9px] font-bold uppercase mt-1 ml-2 flex items-center gap-1"><AlertCircle size={10} /> {errors.ranking}</p>}
                        </div>

                        {/* DATOS ADICIONALES (Se autocompletan) */}
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block ml-2">Licencia Médica</label>
                              <input 
                                type="text"
                                value={formData.medicalLicense}
                                onChange={e => {
                                  setFormData({...formData, medicalLicense: e.target.value});
                                  if (errors.medicalLicense) setErrors(prev => ({...prev, medicalLicense: ''}));
                                }}
                                className={`w-full bg-black border rounded-2xl px-4 py-3 text-white font-bold uppercase outline-none text-xs ${errors.medicalLicense ? 'border-red-600 focus:border-red-600' : 'border-zinc-800 focus:border-blue-600'}`}
                                placeholder="Nº Licencia"
                              />
                              {errors.medicalLicense && <p className="text-red-500 text-[9px] font-bold uppercase mt-1 ml-2 flex items-center gap-1"><AlertCircle size={10} /> {errors.medicalLicense}</p>}
                           </div>
                           <div>
                              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block ml-2">Licencia Deportiva</label>
                              <input 
                                type="text"
                                value={formData.sportsLicense}
                                onChange={e => {
                                  setFormData({...formData, sportsLicense: e.target.value});
                                  if (errors.sportsLicense) setErrors(prev => ({...prev, sportsLicense: ''}));
                                }}
                                className={`w-full bg-black border rounded-2xl px-4 py-3 text-white font-bold uppercase outline-none text-xs ${errors.sportsLicense ? 'border-red-600 focus:border-red-600' : 'border-zinc-800 focus:border-blue-600'}`}
                                placeholder="Nº Licencia"
                              />
                              {errors.sportsLicense && <p className="text-red-500 text-[9px] font-bold uppercase mt-1 ml-2 flex items-center gap-1"><AlertCircle size={10} /> {errors.sportsLicense}</p>}
                           </div>
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-blue-600 hover:bg-white text-white hover:text-black py-6 rounded-[2rem] font-black uppercase shadow-2xl mt-4 transition-all transform active:scale-95 oswald italic text-xl">
                        {foundInRanking ? 'Confirmar Inscripción' : 'Registrar Nuevo Piloto'}
                      </button>
                   </form>
                )}
              </>
            ) : (
              <div className="py-10 text-center animate-in zoom-in-95 duration-500">
                <div className="bg-emerald-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <h2 className="text-4xl font-black oswald text-white mb-4 uppercase italic">¡Inscripción Exitosa!</h2>
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 mb-8 inline-block">
                  <p className="text-white font-bold uppercase text-sm">{selectedCategory}</p>
                  <p className="text-emerald-500 font-black oswald text-2xl italic">#{formData.number}</p>
                </div>
                
                <div className="space-y-3">
                   <button onClick={handleClose} className="w-full bg-zinc-800 hover:bg-white text-white hover:text-black py-5 rounded-2xl font-black uppercase text-xs transition-all">
                      Finalizar y Salir
                   </button>
                   <button onClick={handleAddAnotherCategory} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-xl transition-all flex items-center justify-center gap-2">
                      <RefreshCw size={16} /> Inscribir en Otra Categoría
                   </button>
                   <p className="text-[9px] text-zinc-500 font-bold mt-2 uppercase">Mantiene los datos personales para la siguiente carga</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inscripciones;
