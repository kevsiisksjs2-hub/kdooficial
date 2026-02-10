
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { 
  Pilot, AuditLog, Status, AdminUser, UserRole, Regulation, RegulationCategory, Championship, PressRelease, ChampionshipEvent, Penalty
} from '../types';
import { 
  Users, Settings, History, LogOut, Trash2, Search, Plus, XCircle, 
  IdCard, BookOpen, UserCog, UserPlus, Save, FileText, 
  ShieldCheck, Activity, Terminal, Key, ShieldAlert, CheckCircle, Database, Sparkles,
  Trophy, Newspaper, FileUp, Download, Briefcase, Edit3, UserCheck, Trash, CheckSquare, Square, Calendar, ListChecks, FileDown,
  Cpu, Zap, ChevronRight, LayoutDashboard, Fingerprint, ExternalLink, Loader2, Flag, Upload, User, Shield, Megaphone, PlusCircle, Globe, FileStack, Clock,
  Wifi, Signal, Timer, ChevronLeft, AlertTriangle, AlertCircle, XOctagon, MoveDown
} from 'lucide-react';
import { 
  generatePilotCredential, 
  generateBriefingAttendancePDF, 
  generateOfficialResultsPDF, 
  generateInscriptosSimplePDF,
  generateInscriptosLicenciasPDF,
  generateInscriptosCronologicoPDF,
  generateInscriptosPorCategoriaPDF,
  generateGruposPistaPDF,
  generateLapByLapPDF,
  generateRegisteredPilotsPDF
} from '../utils/pdfGenerator';

type AdminTab = 'padrón' | 'eventos' | 'resultados' | 'normativas' | 'noticias' | 'historia' | 'staff' | 'auditoría' | 'ajustes' | 'monitor' | 'campeonatos';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('padrón');
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [news, setNews] = useState<PressRelease[]>([]);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [settings, setSettings] = useState(storageService.getSettings());
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Search/Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('Todas');
  const [resCatFilter, setResCatFilter] = useState('KDO Power');
  const [selectedSession, setSelectedSession] = useState('Clasificación');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Event Control State
  const [selectedChampionshipId, setSelectedChampionshipId] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [manageEventsMode, setManageEventsMode] = useState(false);
  const [eventForm, setEventForm] = useState<Partial<ChampionshipEvent>>({ name: '', track: '', status: 'Programada' });

  // Results Tab State
  const [resultsSubTab, setResultsSubTab] = useState<'export' | 'penalties'>('export');

  // Modals State
  const [showRegModal, setShowRegModal] = useState(false);
  const [editingReg, setEditingReg] = useState<Partial<Regulation>>({ title: '', category: 'Técnico', version: '1.0' });
  const [regFile, setRegFile] = useState<string | null>(null);
  
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsForm, setNewsForm] = useState<Partial<PressRelease>>({ title: '', content: '', category: 'Oficial' });

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState<Partial<AdminUser>>({ username: '', name: '', role: 'Comisario Deportivo', password: '' });

  const [showHistModal, setShowHistModal] = useState(false);
  const [histForm, setHistForm] = useState<Partial<Championship>>({ name: '', year: 2026, champions: [] });
  const [newWinner, setNewWinner] = useState({ category: '', pilot: '', kart: '' });

  const [showImportRankingModal, setShowImportRankingModal] = useState(false);
  const [rawRankingText, setRawRankingText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const [auditAnalysis, setAuditAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Monitor Live State
  const [monitorAntennas, setMonitorAntennas] = useState({ s1: false, s2: false, finish: false });

  useEffect(() => {
    const auth = storageService.getAuth();
    if (!auth) { navigate('/AdminKDO'); return; }
    setCurrentUser(auth);
    refreshData();
  }, [navigate]);

  // Monitor Simulation Effect
  useEffect(() => {
    if (activeTab === 'monitor') {
        const interval = setInterval(() => {
            setMonitorAntennas({
                s1: Math.random() > 0.3,
                s2: Math.random() > 0.3,
                finish: Math.random() > 0.1
            });
        }, 800);
        return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, catFilter]);

  const refreshData = () => {
    const loadedPilots = storageService.getPilots();
    const loadedChamps = storageService.getChampionships();
    setPilots(loadedPilots);
    setLogs(storageService.getAuditLogs());
    setAdminUsers(storageService.getAdminUsers());
    setRegulations(storageService.getRegulations());
    setChampionships(loadedChamps);
    setNews(storageService.getPressReleases());
    setPenalties(storageService.getPenalties());
    setSettings(storageService.getSettings());

    if (loadedChamps.length > 0 && !selectedChampionshipId) {
      setSelectedChampionshipId(loadedChamps[0].id);
      if (loadedChamps[0].events && loadedChamps[0].events.length > 0) {
        setSelectedEventId(loadedChamps[0].events[0].id);
      }
    }
  };

  const handleLogout = () => { storageService.setAuth(null); navigate('/'); };

  // --- PDF REPORT TRIGGERS ---
  const getActivePilotsForReports = () => pilots.filter(p => p.status === Status.CONFIRMADO || p.status === Status.PENDIENTE);

  const handleDownloadSimple = () => generateInscriptosSimplePDF(getActivePilotsForReports());
  const handleDownloadLicencias = () => generateInscriptosLicenciasPDF(getActivePilotsForReports());
  const handleDownloadCronologico = () => generateInscriptosCronologicoPDF(getActivePilotsForReports());
  const handleDownloadCategorias = () => generateInscriptosPorCategoriaPDF(getActivePilotsForReports(), storageService.getCategories());
  const handleDownloadGrupos = () => generateGruposPistaPDF(getActivePilotsForReports(), storageService.getCategories());

  const handleDownloadLapByLap = () => {
      const categoryPilots = pilots.filter(p => p.category === resCatFilter).sort((a,b) => (a.stats.points || 0) - (b.stats.points || 0));
      if (categoryPilots.length === 0) {
          alert("No hay pilotos en esta categoría.");
          return;
      }
      generateLapByLapPDF(resCatFilter, categoryPilots, currentEvent?.name || "Evento KDO");
      storageService.addLog('RESULTADOS', `Descargado Vuelta a Vuelta: ${resCatFilter}`);
  };

  const handleDownloadFilteredList = () => {
    const filtered = pilots.filter(p => (catFilter === 'Todas' || p.category === catFilter));
    if (filtered.length === 0) {
      alert("No hay pilotos para generar el reporte con los filtros actuales.");
      return;
    }
    generateRegisteredPilotsPDF(filtered, catFilter);
    storageService.addLog('PADRON', `Descargado listado de pilotos: ${catFilter}`);
  };

  // --- EVENT MANAGEMENT ---
  const saveEvent = () => {
    if (!eventForm.name || !eventForm.track || !selectedChampionshipId) {
        alert("Nombre y Circuito son obligatorios");
        return;
    }
    const champIndex = championships.findIndex(c => c.id === selectedChampionshipId);
    if (champIndex === -1) return;

    const champ = championships[champIndex];
    const events = champ.events || [];
    
    const newEvent: ChampionshipEvent = {
        id: eventForm.id || Math.random().toString(36).substr(2, 9),
        round: Number(eventForm.round) || events.length + 1,
        name: eventForm.name,
        date: eventForm.date || new Date().toLocaleDateString(),
        track: eventForm.track,
        status: eventForm.status as any,
        briefingSigned: eventForm.briefingSigned || [],
        technicalScrutiny: eventForm.technicalScrutiny || {}
    };

    let updatedEvents = events;
    if (eventForm.id) {
        updatedEvents = events.map(e => e.id === eventForm.id ? newEvent : e);
    } else {
        updatedEvents = [...events, newEvent];
    }

    const updatedChamps = [...championships];
    updatedChamps[champIndex] = { ...champ, events: updatedEvents };
    
    storageService.saveChampionships(updatedChamps);
    setChampionships(updatedChamps);
    setShowEventModal(false);
    setEventForm({ name: '', track: '', status: 'Programada' });
    storageService.addLog('EVENTO', `${eventForm.id ? 'Editado' : 'Creado'} evento: ${newEvent.name}`);
  };

  const deleteEvent = (eventId: string) => {
      if (!confirm("¿Eliminar este evento?")) return;
      const champIndex = championships.findIndex(c => c.id === selectedChampionshipId);
      if (champIndex === -1) return;
      
      const champ = championships[champIndex];
      const updatedEvents = (champ.events || []).filter(e => e.id !== eventId);
      const updatedChamps = [...championships];
      updatedChamps[champIndex] = { ...champ, events: updatedEvents };
      
      storageService.saveChampionships(updatedChamps);
      setChampionships(updatedChamps);
      storageService.addLog('EVENTO', `Eliminado evento ID: ${eventId}`);
  };

  // --- IMPORT RANKING LOGIC ---
  const handleImportRanking = async () => {
    if (!rawRankingText.trim()) return;
    setIsImporting(true);
    try {
      const parsedPilots = await aiService.parseRankingData(rawRankingText);
      if (parsedPilots && parsedPilots.length > 0) {
        const currentPilots = [...pilots];
        parsedPilots.forEach((p: any) => {
          const idx = currentPilots.findIndex(cp => cp.number === p.number && cp.category === p.category);
          if (idx !== -1) {
            currentPilots[idx] = {
              ...currentPilots[idx],
              stats: { ...currentPilots[idx].stats, points: parseFloat(p.points) || 0 },
              lastUpdated: new Date().toISOString().split('T')[0]
            };
          } else {
            const newPilot: Pilot = {
              id: Math.random().toString(36).substr(2, 9),
              name: p.name.toUpperCase(),
              number: p.number,
              category: p.category,
              status: Status.CONFIRMADO,
              ranking: 99,
              medicalLicense: 'P_IMPORT',
              sportsLicense: 'P_IMPORT',
              transponderId: `TX-${p.number}`,
              conductPoints: 10,
              stats: { wins: 0, podiums: 0, poles: 0, points: parseFloat(p.points) || 0 },
              lastUpdated: new Date().toISOString().split('T')[0],
              createdAt: Date.now()
            };
            currentPilots.push(newPilot);
          }
        });
        storageService.savePilots(currentPilots);
        storageService.addLog('IMPORT', `Importados ${parsedPilots.length} registros de ranking.`);
        setPilots(currentPilots);
        setShowImportRankingModal(false);
        setRawRankingText('');
        alert(`Se han importado/actualizado ${parsedPilots.length} pilotos.`);
      }
    } catch (err) {
      alert("Error al procesar los datos con IA.");
    } finally {
      setIsImporting(false);
    }
  };

  // --- REGLAMENTOS PDF LOGIC ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRegFile(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveReg = () => {
    if (!editingReg.title || !regFile) {
        alert("Título y Archivo PDF son obligatorios");
        return;
    }
    const newReg: Regulation = {
      id: editingReg.id || Date.now().toString(),
      title: editingReg.title || '',
      description: editingReg.description || '',
      category: editingReg.category as RegulationCategory,
      version: editingReg.version || '1.0',
      date: new Date().toLocaleDateString(),
      fileSize: `${(regFile.length / 1024 / 1024).toFixed(2)} MB`,
      fileData: regFile,
      isDraft: false
    };
    const updated = editingReg.id 
      ? regulations.map(r => r.id === editingReg.id ? newReg : r)
      : [newReg, ...regulations];
    
    storageService.saveRegulations(updated);
    storageService.addLog('REGLAMENTO', `${editingReg.id ? 'Editado' : 'Publicado'}: ${newReg.title}`);
    setShowRegModal(false);
    setRegFile(null);
    setEditingReg({ title: '', category: 'Técnico', version: '1.0' });
    refreshData();
  };

  const deleteReg = (id: string) => {
    if (confirm("¿Seguro que desea eliminar este reglamento?")) {
        const updated = regulations.filter(r => r.id !== id);
        storageService.saveRegulations(updated);
        storageService.addLog('REGLAMENTO', `Eliminado ID: ${id}`);
        refreshData();
    }
  };

  // --- PRESS RELEASE LOGIC ---
  const saveNews = () => {
    if (!newsForm.title || !newsForm.content) {
      alert("Título y Contenido son requeridos.");
      return;
    }
    const newEntry: PressRelease = {
      id: newsForm.id || Date.now().toString(),
      title: newsForm.title,
      content: newsForm.content,
      category: newsForm.category as any,
      date: new Date().toLocaleDateString(),
      author: currentUser?.name || 'Admin KDO'
    };
    const updated = newsForm.id 
      ? news.map(n => n.id === newsForm.id ? newEntry : n)
      : [newEntry, ...news];
    
    storageService.savePressReleases(updated);
    storageService.addLog('PRENSA', `${newsForm.id ? 'Editado' : 'Publicado'}: ${newEntry.title}`);
    setShowNewsModal(false);
    setNewsForm({ title: '', content: '', category: 'Oficial' });
    refreshData();
  };

  const deleteNews = (id: string) => {
    if (confirm("¿Eliminar este comunicado de prensa?")) {
      const updated = news.filter(n => n.id !== id);
      storageService.savePressReleases(updated);
      storageService.addLog('PRENSA', `Eliminado ID: ${id}`);
      refreshData();
    }
  };

  // --- STAFF LOGIC ---
  const saveStaff = () => {
    if (!staffForm.username || (!staffForm.id && !staffForm.password)) {
      alert("Usuario y Password son requeridos.");
      return;
    }
    const newUser: AdminUser = {
      id: staffForm.id || Date.now().toString(),
      username: staffForm.username.toLowerCase(),
      password: staffForm.password,
      name: staffForm.name || '',
      role: staffForm.role as UserRole,
      permissions: ['READ', 'WRITE']
    };
    const updated = staffForm.id 
      ? adminUsers.map(u => u.id === staffForm.id ? newUser : u)
      : [...adminUsers, newUser];
      
    storageService.saveAdminUsers(updated);
    storageService.addLog('STAFF', `${staffForm.id ? 'Editado' : 'Nuevo oficial'}: ${newUser.name}`);
    setShowStaffModal(false);
    setStaffForm({ username: '', name: '', role: 'Comisario Deportivo', password: '' });
    refreshData();
  };

  const deleteStaff = (id: string) => {
    if (id === 'admin-1') { alert("No se puede eliminar al SuperAdmin del sistema."); return; }
    if (confirm("¿Remover a este oficial del cuerpo técnico?")) {
      const updated = adminUsers.filter(u => u.id !== id);
      storageService.saveAdminUsers(updated);
      storageService.addLog('STAFF', `Oficial removido ID: ${id}`);
      refreshData();
    }
  };

  // --- HISTORY LOGIC ---
  const saveHistory = () => {
    if (!histForm.name || !histForm.year) {
      alert("Nombre y Año son requeridos.");
      return;
    }
    const legacy: Championship = {
      id: histForm.id || Date.now().toString(),
      name: histForm.name,
      year: Number(histForm.year),
      status: 'Finalizada',
      dates: `Temporada ${histForm.year}`,
      tracks: histForm.tracks || 'Varios',
      image: histForm.image || 'https://images.unsplash.com/photo-1547631618-f29792042761?w=800',
      champions: histForm.champions || []
    };
    const updated = histForm.id 
      ? championships.map(c => c.id === histForm.id ? legacy : c)
      : [legacy, ...championships];
      
    storageService.saveChampionships(updated);
    storageService.addLog('HISTORIA', `${histForm.id ? 'Editado' : 'Añadido'} Legado: ${legacy.name}`);
    setShowHistModal(false);
    setHistForm({ name: '', year: 2026, champions: [] });
    refreshData();
  };

  const addChampionToForm = () => {
    if (!newWinner.category || !newWinner.pilot) return;
    setHistForm({
      ...histForm,
      champions: [...(histForm.champions || []), { ...newWinner }]
    });
    setNewWinner({ category: '', pilot: '', kart: '' });
  };

  // --- SETTINGS LOGIC ---
  const handleUpdateSettings = (updates: Partial<typeof settings>) => {
    const newSettings = { ...settings, ...updates };
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
    storageService.addLog('AJUSTES', 'Configuración de sistema actualizada');
  };

  // --- EVENT CONTROL LOGIC ---
  const currentChampionship = championships.find(c => c.id === selectedChampionshipId);
  const currentEvent = currentChampionship?.events?.find(e => e.id === selectedEventId);

  const downloadBriefingPDF = () => {
    const eventPilots = getActivePilotsForReports(); 
    generateBriefingAttendancePDF(eventPilots);
    storageService.addLog('EVENTO', `Descargada planilla de briefing: ${currentEvent?.name}`);
  };

  // --- RESULTS PDF EXPORT ---
  const exportOfficialResults = () => {
    const categoryPilots = pilots
      .filter(p => p.category === resCatFilter)
      .sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0))
      .map((p, i) => ({
        number: p.number,
        name: p.name,
        diff: i === 0 ? 'LIDER' : `+${((pilots.filter(px => px.category === resCatFilter).sort((a,b) => (b.stats?.points||0) - (a.stats?.points||0))[0].stats?.points || 0) - (p.stats?.points || 0)).toFixed(1)}`,
        bestLap: "47." + Math.floor(Math.random()*900+100)
      }));
    
    if (categoryPilots.length === 0) {
      alert("No hay pilotos en esta categoría para exportar.");
      return;
    }
    
    const eventName = currentEvent ? `${currentEvent.name} - ${currentEvent.track}` : "EVENTO OFICIAL KDO";
    generateOfficialResultsPDF(resCatFilter, categoryPilots, selectedSession, eventName);
    storageService.addLog('ADMIN', `Exportada Clasificación Oficial: ${resCatFilter} - ${selectedSession}`);
  };

  // --- PILOT MANAGEMENT ---
  const deletePilot = (id: string) => {
    if (confirm('¿Seguro que desea eliminar permanentemente a este piloto?')) {
      const updated = pilots.filter(p => p.id !== id);
      storageService.savePilots(updated);
      storageService.addLog('ADMIN', `Piloto eliminado permanentemente ID: ${id}`);
      refreshData();
    }
  };

  const handleEditPilot = (p: Pilot) => {
    navigate(`/AdminKDO/nuevo-piloto?edit=${p.id}`);
  };

  const resetForNewRace = () => {
    if (confirm('Esta acción marcará a todos los pilotos como PENDIENTES para la nueva fecha. ¿Continuar?')) {
      const updated = pilots.map(p => ({ ...p, status: Status.PENDIENTE }));
      storageService.savePilots(updated);
      storageService.addLog('EVENTO', 'Reinicio masivo de inscripciones para nueva fecha');
      refreshData();
    }
  };

  // --- AI ANALYSIS ---
  const analyzeAudit = async () => {
    setIsAnalyzing(true);
    const analysis = await aiService.analyzeAuditLogs(logs);
    setAuditAnalysis(analysis);
    setIsAnalyzing(false);
  };

  // --- PAGINATION LOGIC ---
  const filteredPilots = pilots.filter(p => (catFilter === 'Todas' || p.category === catFilter) && (p.name.includes(searchTerm.toUpperCase()) || p.number.includes(searchTerm)));
  const totalPages = Math.ceil(filteredPilots.length / itemsPerPage);
  const paginatedPilots = filteredPilots.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const displayPilots = pilots.filter(p => p.status === Status.CONFIRMADO || p.status === Status.PENDIENTE);
  const categoriesList = ['Todas', ...storageService.getCategories()];
  const officialCats = storageService.getCategories();
  const sessions = ['Entrenamiento 1', 'Entrenamiento 2', 'Clasificación', 'Serie 1', 'Serie 2', 'Final'];

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-400 font-sans overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* SIDEBAR */}
      <aside className="w-80 admin-sidebar-glass flex flex-col shrink-0 z-50">
        <div className="p-10 border-b border-white/5">
           <div className="flex items-center gap-4 mb-8">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                 <ShieldCheck size={28} className="text-white" />
              </div>
              <div>
                 <h2 className="text-2xl font-black oswald uppercase text-white italic tracking-tighter leading-none">COMMAND</h2>
                 <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1">Institutional Control</p>
              </div>
           </div>
           
           <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">System Health</span>
              </div>
              <Cpu size={14} className="text-zinc-700" />
           </div>
        </div>
        
        <nav className="flex-grow p-6 space-y-1 overflow-y-auto custom-scrollbar">
          {[
            { id: 'padrón', icon: Users, label: 'Padrón Federado' },
            { id: 'eventos', icon: CheckCircle, label: 'Control de Evento' },
            { id: 'resultados', icon: ListChecks, label: 'Resultados Oficiales' },
            { id: 'noticias', icon: Newspaper, label: 'Prensa KDO' },
            { id: 'historia', icon: Trophy, label: 'Hall of Fame' },
            { id: 'staff', icon: UserCog, label: 'Cuerpo Técnico' },
            { id: 'auditoría', icon: Terminal, label: 'Auditoría Logs' },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as AdminTab)} 
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-2xl scale-[1.02]' : 'hover:bg-white/5 text-zinc-600 hover:text-zinc-300'}`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-zinc-700'} /> 
              {tab.label}
              {activeTab === tab.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          ))}

          {/* SECCIÓN ADMINISTRACIÓN */}
          <div className="pt-6 mt-6 border-t border-white/5 px-6">
            <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4">ADMINISTRACIÓN</h4>
            <div className="space-y-1">
                {[
                    { id: 'campeonatos', icon: Trophy, label: 'Campeonatos' },
                    { id: 'normativas', icon: FileText, label: 'Reglamentos' },
                    { id: 'monitor', icon: Activity, label: 'Monitor Live' },
                    { id: 'ajustes', icon: Settings, label: 'Ajustes' },
                ].map(tab => (
                    <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id as AdminTab)} 
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-zinc-800 text-white shadow-lg' : 'hover:bg-white/5 text-zinc-500 hover:text-zinc-300'}`}
                    >
                    <tab.icon size={16} className={activeTab === tab.id ? 'text-blue-500' : 'text-zinc-700'} /> 
                    {tab.label}
                    </button>
                ))}
            </div>
          </div>
        </nav>

        <div className="p-8 border-t border-white/5">
          <div className="mb-6 px-4">
             <div className="flex items-center gap-3 mb-1">
                <Fingerprint size={12} className="text-blue-500" />
                <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Identified As:</span>
             </div>
             <p className="text-[10px] font-black text-white uppercase truncate">{currentUser?.name}</p>
          </div>
          <button onClick={handleLogout} className="w-full py-5 bg-zinc-900 text-red-500 font-black uppercase text-[10px] rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 group">
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Finalizar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA DE TRABAJO */}
      <main className="flex-grow flex flex-col overflow-hidden">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-black/40 backdrop-blur-3xl shrink-0 z-40">
           <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">Sector administrativo</span>
                <h2 className="text-4xl font-black oswald uppercase text-white italic tracking-tighter leading-none">{activeTab}</h2>
              </div>
           </div>
           
           <div className="flex items-center gap-8">
              <div className="flex gap-4">
                 <div className="bg-zinc-900 px-5 py-2 rounded-xl border border-white/5 text-center">
                    <p className="text-[8px] font-black text-zinc-500 uppercase leading-none mb-1">Event Date</p>
                    <p className="text-[10px] font-black text-white uppercase oswald italic">May 2026</p>
                 </div>
                 <div className="bg-zinc-900 px-5 py-2 rounded-xl border border-white/5 text-center">
                    <p className="text-[8px] font-black text-zinc-500 uppercase leading-none mb-1">Active Pilots</p>
                    <p className="text-[10px] font-black text-emerald-500 uppercase oswald italic">{pilots.length}</p>
                 </div>
              </div>
              <div className="h-10 w-px bg-white/5"></div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="text-right">
                  <p className="text-[10px] font-black text-white uppercase leading-none group-hover:text-blue-500 transition-colors">{currentUser?.name}</p>
                  <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{currentUser?.role}</p>
                </div>
                <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-blue-500 font-black oswald text-xl shadow-xl">
                   {currentUser?.name[0]}
                </div>
              </div>
           </div>
        </header>

        <div className="flex-grow overflow-auto p-12 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.03)_0%,_transparent_50%)]">
          
          {/* TAB: PADRÓN FEDERADO */}
          {activeTab === 'padrón' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
               {/* Centro de Reportes PDF */}
               <div className="glass-panel p-8 rounded-[3rem] border-blue-600/20 bg-blue-600/5">
                  <h3 className="text-xs font-black uppercase text-blue-500 tracking-[0.3em] mb-6 flex items-center gap-3">
                    <FileStack size={18} /> Centro de Reportes Oficiales
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                     <button onClick={handleDownloadSimple} className="bg-zinc-900 hover:bg-blue-600 text-white p-5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 transition-all group">
                        <FileText size={24} className="text-blue-500 group-hover:text-white" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-center">Listado Simple</span>
                     </button>
                     <button onClick={handleDownloadLicencias} className="bg-zinc-900 hover:bg-blue-600 text-white p-5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 transition-all group">
                        <IdCard size={24} className="text-blue-500 group-hover:text-white" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-center">Registro Licencias</span>
                     </button>
                     <button onClick={handleDownloadCronologico} className="bg-zinc-900 hover:bg-blue-600 text-white p-5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 transition-all group">
                        <Clock size={24} className="text-blue-500 group-hover:text-white" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-center">Orden Inscripción</span>
                     </button>
                     <button onClick={handleDownloadCategorias} className="bg-zinc-900 hover:bg-blue-600 text-white p-5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 transition-all group">
                        <LayoutDashboard size={24} className="text-blue-500 group-hover:text-white" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-center">Por Categoría</span>
                     </button>
                     <button onClick={handleDownloadGrupos} className="bg-zinc-900 hover:bg-blue-600 text-white p-5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 transition-all group">
                        <Zap size={24} className="text-blue-500 group-hover:text-white" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-center">Grupos de Pista</span>
                     </button>
                  </div>
               </div>

               {/* Buscador y Tabla de Pilotos */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-5 glass-panel p-5 rounded-[1.5rem] flex items-center gap-6 group focus-within:border-blue-600/50 transition-all">
                    <Search className="text-zinc-700 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="BUSCAR NOMBRE/DORSAL..." 
                      className="w-full bg-transparent border-none text-white font-black text-[10px] uppercase outline-none placeholder:text-zinc-800" 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-full h-full bg-zinc-900 border border-white/5 rounded-[1.5rem] px-5 text-[9px] font-black uppercase text-white outline-none cursor-pointer">
                      {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="lg:col-span-4 flex gap-3">
                    <button onClick={() => navigate('/AdminKDO/nuevo-piloto')} className="flex-grow bg-blue-600 text-white px-6 rounded-[1.5rem] font-black uppercase text-[9px] flex items-center justify-center gap-3 shadow-2xl hover:bg-white hover:text-black transition-all">
                      <UserPlus size={16} /> Alta Piloto
                    </button>
                    <button onClick={() => setShowImportRankingModal(true)} className="flex-grow bg-zinc-900 border border-white/10 text-white px-6 rounded-[1.5rem] font-black uppercase text-[9px] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all">
                      <Upload size={16} /> Importar Ranking
                    </button>
                  </div>
               </div>
               
               {/* Botón de Reporte PDF Filtrado */}
               <div className="flex justify-end">
                  <button onClick={handleDownloadFilteredList} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-black uppercase text-[9px] flex items-center gap-2 transition-all">
                     <FileDown size={14} /> PDF Listado Actual
                  </button>
               </div>

               {/* Tabla Pilotos */}
               <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-black/40 text-[8px] font-black uppercase text-zinc-700 border-b border-white/5">
                         <tr>
                           <th className="px-8 py-5">Piloto / Dorsal</th>
                           <th className="px-8 py-5">Categoría</th>
                           <th className="px-8 py-5 text-center">Estado</th>
                           <th className="px-8 py-5 text-center">Conducta</th>
                           <th className="px-8 py-5">Puntos Ranking</th>
                           <th className="px-8 py-5 text-right pr-8">Acciones</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                         {paginatedPilots.map(p => (
                           <tr key={p.id} className="hover:bg-blue-600/[0.02] transition-colors group">
                              <td className="px-8 py-6 flex items-center gap-6">
                                 <div className="w-12 h-12 bg-zinc-950 border border-white/5 rounded-2xl flex items-center justify-center font-black oswald text-xl text-blue-500 italic shadow-xl">#{p.number}</div>
                                 <div>
                                    <p className="text-white font-black text-xs uppercase group-hover:text-blue-500 transition-colors">{p.name}</p>
                                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Lic: {p.medicalLicense}</p>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="text-[9px] font-black text-zinc-400 uppercase">{p.category}</span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${p.status === Status.CONFIRMADO ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                    {p.status}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <span className={`text-xl font-black oswald italic ${p.conductPoints > 7 ? 'text-emerald-500' : 'text-red-500'}`}>{p.conductPoints}/10</span>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="text-xl font-black oswald text-blue-500 italic">{(p.stats?.points || 0).toFixed(1)}</span>
                              </td>
                              <td className="px-8 py-6 text-right pr-8">
                                 <div className="flex justify-end gap-3">
                                    <button title="Credencial" onClick={() => generatePilotCredential(p)} className="p-3 bg-zinc-950 rounded-xl text-zinc-600 hover:text-blue-500 border border-white/5 hover:border-blue-600/30 transition-all shadow-xl"><IdCard size={14}/></button>
                                    <button title="Editar" onClick={() => handleEditPilot(p)} className="p-3 bg-zinc-950 rounded-xl text-zinc-600 hover:text-white border border-white/5 hover:border-white/30 transition-all shadow-xl"><Edit3 size={14}/></button>
                                    <button title="Eliminar" onClick={() => deletePilot(p.id)} className="p-3 bg-red-600/5 rounded-xl text-red-600/50 border border-red-600/10 hover:bg-red-600 hover:text-white transition-all shadow-xl"><Trash2 size={14}/></button>
                                 </div>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* PAGINATION CONTROLS */}
                  {totalPages > 1 && (
                    <div className="p-4 border-t border-white/5 flex justify-between items-center bg-black/20">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="bg-zinc-900 border border-white/5 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                            <ChevronLeft size={12} /> Anterior
                        </button>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="bg-zinc-900 border border-white/5 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                            Siguiente <ChevronRight size={12} />
                        </button>
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* TAB: RESULTADOS OFICIALES */}
          {activeTab === 'resultados' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               
               {/* SUB-TAB TOGGLE */}
               <div className="flex justify-center mb-4">
                  <div className="bg-zinc-900 border border-white/5 p-1.5 rounded-2xl inline-flex gap-2 shadow-xl">
                     <button 
                        onClick={() => setResultsSubTab('export')}
                        className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${resultsSubTab === 'export' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                     >
                        <FileDown size={14} /> Generador de Resultados
                     </button>
                     <button 
                        onClick={() => setResultsSubTab('penalties')}
                        className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${resultsSubTab === 'penalties' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                     >
                        <AlertTriangle size={14} /> Gestión de Penalizaciones
                     </button>
                  </div>
               </div>

               {/* VIEW: RESULT EXPORT */}
               {resultsSubTab === 'export' && (
                  <>
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-3 glass-panel p-6 rounded-[2rem] flex flex-col gap-2">
                           <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Flag size={10} /> Evento</label>
                           <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="bg-transparent border-none text-white font-black oswald text-base uppercase outline-none cursor-pointer">
                              {currentChampionship?.events?.map(e => <option key={e.id} value={e.id} className="bg-zinc-900">{e.name}</option>)}
                           </select>
                        </div>
                        
                        <div className="lg:col-span-3 glass-panel p-6 rounded-[2rem] flex flex-col gap-2">
                           <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Activity size={10} /> Sesión</label>
                           <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)} className="bg-transparent border-none text-white font-black oswald text-base uppercase outline-none cursor-pointer">
                              {sessions.map(s => <option key={s} value={s} className="bg-zinc-900">{s}</option>)}
                           </select>
                        </div>

                        <div className="lg:col-span-3 glass-panel p-6 rounded-[2rem] flex flex-col gap-2">
                           <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2"><ListChecks size={10} /> Categoría</label>
                           <select value={resCatFilter} onChange={e => setResCatFilter(e.target.value)} className="bg-transparent border-none text-white font-black oswald text-base uppercase outline-none cursor-pointer">
                              {officialCats.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                           </select>
                        </div>

                        <div className="lg:col-span-3 flex flex-col gap-3">
                           <button onClick={exportOfficialResults} className="w-full bg-blue-600 text-white py-4 rounded-[1.5rem] font-black uppercase text-[9px] flex items-center justify-center gap-3 shadow-xl hover:bg-white hover:text-blue-600 transition-all transform active:scale-95 group">
                              Exportar Clasificación <FileDown size={16} className="group-hover:translate-y-1 transition-transform" />
                           </button>
                           <button onClick={handleDownloadLapByLap} className="w-full bg-zinc-900 border border-white/10 text-white py-4 rounded-[1.5rem] font-black uppercase text-[9px] flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all">
                              PDF Vuelta a Vuelta <Timer size={16} />
                           </button>
                        </div>
                     </div>
                  </>
               )}

               {/* VIEW: PENALTIES TABLE */}
               {resultsSubTab === 'penalties' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                     <div className="flex justify-between items-center bg-zinc-900 border border-red-500/20 p-6 rounded-[2rem]">
                        <div className="flex items-center gap-4">
                           <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-600/20"><AlertCircle className="text-white" size={24} /></div>
                           <div>
                              <h3 className="text-xl font-black oswald uppercase text-white italic">Registro de Sanciones</h3>
                              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Base de datos de comisariato deportivo</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Filtrar por Categoría:</span>
                           <select value={resCatFilter} onChange={e => setResCatFilter(e.target.value)} className="bg-black border border-white/10 rounded-xl px-4 py-2 text-white text-[10px] font-black uppercase outline-none focus:border-red-600 cursor-pointer">
                              <option value="Todas">Todas las Categorías</option>
                              {officialCats.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                     </div>

                     <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                        <table className="w-full text-left">
                           <thead className="bg-black/40 text-[8px] font-black uppercase text-zinc-700 border-b border-white/5">
                              <tr>
                                 <th className="px-8 py-5">Piloto</th>
                                 <th className="px-8 py-5 text-center">Kart</th>
                                 <th className="px-8 py-5">Categoría</th>
                                 <th className="px-8 py-5">Tipo Sanción</th>
                                 <th className="px-8 py-5">Motivo</th>
                                 <th className="px-8 py-5 text-right pr-8">Fecha</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/[0.03]">
                              {penalties.filter(p => resCatFilter === 'Todas' || p.category === resCatFilter).map(p => (
                                 <tr key={p.id} className="hover:bg-red-600/[0.03] transition-colors group">
                                    <td className="px-8 py-6">
                                       <span className="text-white font-black text-xs uppercase">{p.pilotName || 'DESCONOCIDO'}</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                       <span className="bg-black border border-white/10 text-white font-black oswald px-3 py-1 rounded text-sm group-hover:border-red-500/50 transition-colors">#{p.number}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                       <span className="text-[9px] font-black text-zinc-500 uppercase">{p.category}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                       <div className="flex items-center gap-2">
                                          {p.type === 'Exclusión' ? <XOctagon size={14} className="text-red-600" /> : 
                                           p.type.includes('Recargo') ? <Timer size={14} className="text-orange-500" /> :
                                           p.type === 'Recargo Puesto' ? <MoveDown size={14} className="text-blue-500" /> :
                                           <AlertTriangle size={14} className="text-yellow-500" />}
                                          <span className={`text-[9px] font-black uppercase tracking-wider ${
                                             p.type === 'Exclusión' ? 'text-red-600' : 
                                             p.type.includes('Recargo') ? 'text-orange-500' : 
                                             'text-zinc-300'
                                          }`}>{p.type}</span>
                                       </div>
                                    </td>
                                    <td className="px-8 py-6">
                                       <span className="text-[9px] font-bold text-zinc-400 uppercase leading-tight line-clamp-1">{p.reason}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right pr-8 tabular-nums text-[9px] font-bold text-zinc-600">
                                       {p.date}
                                    </td>
                                 </tr>
                              ))}
                              {penalties.filter(p => resCatFilter === 'Todas' || p.category === resCatFilter).length === 0 && (
                                 <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                       <Shield size={32} className="text-zinc-800 mx-auto mb-4" />
                                       <p className="text-zinc-700 font-black uppercase text-[9px] tracking-widest">No hay sanciones registradas para este filtro</p>
                                    </td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               )}
            </div>
          )}

          {/* TAB: CONTROL DE EVENTO */}
          {activeTab === 'eventos' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* ... selectors ... */}
                  <div className="lg:col-span-4 glass-panel p-8 rounded-[2.5rem] flex flex-col gap-3 group">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 group-hover:text-blue-500 transition-colors">Campeonato Activo</label>
                    <select value={selectedChampionshipId} onChange={e => {setSelectedChampionshipId(e.target.value); setSelectedEventId('');}} className="bg-transparent border-none text-white font-black oswald text-2xl uppercase outline-none cursor-pointer">
                      {championships.map(c => <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>)}
                    </select>
                  </div>
                  <div className="lg:col-span-4 glass-panel p-8 rounded-[2.5rem] flex flex-col gap-3 group">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 group-hover:text-blue-500 transition-colors">Fecha / Evento</label>
                    <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="bg-transparent border-none text-white font-black oswald text-2xl uppercase outline-none cursor-pointer">
                      {currentChampionship?.events?.map(e => <option key={e.id} value={e.id} className="bg-zinc-900">ROUND {e.round}: {e.name}</option>)}
                    </select>
                  </div>
                  <div className="lg:col-span-4 flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button onClick={downloadBriefingPDF} className="flex-grow bg-blue-600 text-white rounded-[1.5rem] py-4 font-black uppercase text-[9px] flex items-center justify-center gap-2 shadow-2xl hover:bg-white hover:text-blue-600 transition-all transform active:scale-95">
                        Planilla Briefing <Download size={14} />
                        </button>
                        <button onClick={resetForNewRace} className="flex-grow bg-zinc-950 border border-white/5 text-red-500 rounded-[1.5rem] py-4 font-black uppercase text-[9px] flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all transform active:scale-95">
                        Nueva Carrera <History size={14} />
                        </button>
                    </div>
                    <button onClick={() => setManageEventsMode(!manageEventsMode)} className="w-full bg-zinc-800 text-zinc-300 hover:text-white rounded-[1.5rem] py-3 font-black uppercase text-[9px] flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all">
                       <Calendar size={14} /> {manageEventsMode ? 'Ocultar Gestión Calendario' : 'Gestionar Calendario'}
                    </button>
                  </div>
               </div>
               
               {manageEventsMode && (
                 <div className="animate-in slide-in-from-top-4 duration-300 bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem]">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-black oswald uppercase text-white italic">Agenda de Temporada</h4>
                        <button onClick={() => { setEventForm({ name: '', track: '', status: 'Programada' }); setShowEventModal(true); }} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                           + Nuevo Evento
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {currentChampionship?.events?.map(ev => (
                            <div key={ev.id} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                                <div>
                                    <p className="text-white font-black uppercase text-sm">Round {ev.round}: {ev.name}</p>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase">{ev.date} - {ev.track}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[8px] px-2 py-1 rounded font-black uppercase ${ev.status === 'Finalizada' ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{ev.status}</span>
                                    <button onClick={() => deleteEvent(ev.id)} className="text-red-500 hover:text-white p-2"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* TAB: NORMATIVAS */}
          {activeTab === 'normativas' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="flex justify-between items-end border-b border-white/5 pb-10">
                  <div>
                    <h3 className="text-4xl font-black oswald uppercase text-white italic tracking-tighter">Documentación Oficial</h3>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2">Gestión de archivos PDF y anexos reglamentarios</p>
                  </div>
                  <button onClick={() => { setEditingReg({ title: '', category: 'Técnico', version: '1.0' }); setRegFile(null); setShowRegModal(true); }} className="bg-blue-600 text-white px-10 py-5 rounded-[2.5rem] font-black uppercase text-[10px] flex items-center gap-3 shadow-2xl hover:bg-white hover:text-blue-600 transition-all group">
                    Subir Documento <FileUp size={20} className="group-hover:-translate-y-1 transition-transform" />
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regulations.map(reg => (
                    <div key={reg.id} className="bg-zinc-900 border border-white/5 p-10 rounded-[3.5rem] relative group hover:border-blue-600 transition-all flex flex-col justify-between h-full shadow-2xl">
                       <div className="relative z-10">
                          <div className="flex justify-between items-center mb-8">
                             <span className="bg-blue-600/10 text-blue-500 text-[9px] font-black uppercase px-4 py-1.5 rounded-xl border border-blue-600/20">{reg.category}</span>
                             <span className="text-[11px] font-black text-zinc-600 oswald italic">v{reg.version}</span>
                          </div>
                          <h4 className="text-2xl font-black text-white oswald uppercase italic mb-4 leading-tight group-hover:text-blue-500 transition-colors">{reg.title}</h4>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight line-clamp-2">{reg.description || 'Sin descripción detallada disponible.'}</p>
                       </div>
                       <div className="pt-8 mt-10 border-t border-white/5 flex justify-between items-center relative z-10">
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-zinc-400 uppercase">{reg.date}</span>
                             <span className="text-[8px] font-bold text-zinc-700 uppercase">{reg.fileSize}</span>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => deleteReg(reg.id)} className="p-4 bg-zinc-950 rounded-2xl text-zinc-600 hover:text-red-500 transition-all border border-white/5 hover:border-red-600/30 shadow-xl"><Trash2 size={16}/></button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
          
          {/* TAB: NOTICIAS */}
          {activeTab === 'noticias' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-3xl font-black oswald uppercase text-white italic">Comunicados de Prensa</h3>
                   <button onClick={() => { setNewsForm({ title: '', content: '', category: 'Oficial' }); setShowNewsModal(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                      + Nueva Noticia
                   </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                   {news.map(n => (
                      <div key={n.id} className="bg-zinc-900 border border-white/5 p-6 rounded-3xl flex justify-between items-start group hover:border-blue-600 transition-all">
                         <div>
                            <div className="flex items-center gap-3 mb-2">
                               <span className="text-[8px] font-black bg-blue-600/10 text-blue-500 px-2 py-1 rounded uppercase">{n.category}</span>
                               <span className="text-[9px] font-bold text-zinc-500 uppercase">{n.date}</span>
                            </div>
                            <h4 className="text-xl font-black text-white uppercase oswald italic mb-2">{n.title}</h4>
                            <p className="text-[10px] text-zinc-400 line-clamp-2 max-w-2xl">{n.content}</p>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => { setNewsForm(n); setShowNewsModal(true); }} className="p-3 bg-zinc-950 text-zinc-500 hover:text-white rounded-xl"><Edit3 size={16}/></button>
                            <button onClick={() => deleteNews(n.id)} className="p-3 bg-zinc-950 text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition-all"><Trash2 size={16}/></button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* TAB: HISTORIA */}
          {activeTab === 'historia' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-3xl font-black oswald uppercase text-white italic">Hall of Fame Legacy</h3>
                   <button onClick={() => { setHistForm({ name: '', year: 2026, champions: [] }); setShowHistModal(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                      + Agregar Campeonato
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {championships.map(c => (
                      <div key={c.id} className="bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-6 opacity-5"><Trophy size={100} /></div>
                         <h4 className="text-2xl font-black oswald uppercase text-white italic mb-2">{c.name}</h4>
                         <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">{c.year} • {c.champions?.length || 0} Campeones</p>
                         <div className="space-y-2">
                            {c.champions?.slice(0, 3).map((w, i) => (
                               <div key={i} className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-400 border-b border-white/5 pb-1">
                                  <span>{w.category}</span>
                                  <span className="text-white">{w.pilot}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* TAB: STAFF */}
          {activeTab === 'staff' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-3xl font-black oswald uppercase text-white italic">Cuerpo de Oficiales</h3>
                   <button onClick={() => { setStaffForm({ username: '', name: '', role: 'Comisario Deportivo', password: '' }); setShowStaffModal(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                      + Nuevo Oficial
                   </button>
                </div>
                <div className="bg-zinc-900 border border-white/5 rounded-[2rem] overflow-hidden">
                   <table className="w-full text-left">
                      <thead className="bg-black text-[9px] font-black uppercase text-zinc-500">
                         <tr>
                            <th className="px-8 py-4">Nombre</th>
                            <th className="px-8 py-4">Rol / Cargo</th>
                            <th className="px-8 py-4">ID Sistema</th>
                            <th className="px-8 py-4 text-right">Acciones</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {adminUsers.map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                               <td className="px-8 py-4 text-white font-bold uppercase text-xs">{u.name}</td>
                               <td className="px-8 py-4 text-blue-500 font-black uppercase text-[10px]">{u.role}</td>
                               <td className="px-8 py-4 text-zinc-500 font-mono text-[10px]">{u.username}</td>
                               <td className="px-8 py-4 text-right">
                                  <button onClick={() => deleteStaff(u.id)} className="text-red-500 hover:text-white p-2"><Trash2 size={14}/></button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* TAB: AUDITORÍA */}
          {activeTab === 'auditoría' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-center">
                   <h3 className="text-3xl font-black oswald uppercase text-white italic">System Logs</h3>
                   <button onClick={analyzeAudit} disabled={isAnalyzing} className="bg-zinc-800 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2">
                      {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Análisis IA
                   </button>
                </div>
                
                {auditAnalysis && (
                   <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl mb-6">
                      <p className="text-blue-300 text-sm italic">"{auditAnalysis}"</p>
                   </div>
                )}

                <div className="bg-black font-mono text-[10px] p-6 rounded-2xl border border-white/10 h-[500px] overflow-y-auto custom-scrollbar">
                   {logs.map(log => (
                      <div key={log.id} className="mb-2 border-b border-white/5 pb-2 last:border-0">
                         <span className="text-zinc-500 mr-4">[{new Date(log.timestamp).toLocaleString()}]</span>
                         <span className="text-blue-500 font-bold mr-4">{log.admin}</span>
                         <span className="text-yellow-500 font-bold mr-4">{log.action}</span>
                         <span className="text-zinc-300">{log.details}</span>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* TAB: AJUSTES */}
          {activeTab === 'ajustes' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h3 className="text-3xl font-black oswald uppercase text-white italic mb-8">Configuración del Sistema</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem]">
                      <h4 className="text-lg font-black uppercase text-white mb-6">General</h4>
                      <div className="space-y-6">
                         <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Ticker de Noticias (Marquesina)</label>
                            <input 
                              type="text" 
                              value={settings.paddockTicker} 
                              onChange={e => handleUpdateSettings({paddockTicker: e.target.value})} 
                              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white text-xs font-bold focus:border-blue-600 outline-none"
                            />
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Modo Mantenimiento</span>
                            <button 
                              onClick={() => handleUpdateSettings({maintenanceMode: !settings.maintenanceMode})}
                              className={`w-12 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-600' : 'bg-zinc-700'} relative`}
                            >
                               <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                            </button>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Inscripciones Abiertas</span>
                            <button 
                              onClick={() => handleUpdateSettings({registrationsOpen: !settings.registrationsOpen})}
                              className={`w-12 h-6 rounded-full transition-colors ${settings.registrationsOpen ? 'bg-blue-600' : 'bg-zinc-700'} relative`}
                            >
                               <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.registrationsOpen ? 'left-7' : 'left-1'}`}></div>
                            </button>
                         </div>
                      </div>
                   </div>
                   
                   <div className="bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem]">
                      <h4 className="text-lg font-black uppercase text-white mb-6">Integraciones</h4>
                      <div>
                         <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">IP Servidor Orbits (Local)</label>
                         <input 
                           type="text" 
                           value={settings.orbitsIp || ''} 
                           onChange={e => handleUpdateSettings({orbitsIp: e.target.value})} 
                           className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white text-xs font-bold focus:border-blue-600 outline-none font-mono"
                           placeholder="192.168.1.X"
                         />
                      </div>
                   </div>
                </div>
             </div>
          )}
          
          {/* TAB: MONITOR */}
          {activeTab === 'monitor' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="glass-panel p-10 rounded-[3rem] border border-white/5 bg-black/40 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-5"><Activity size={200} className="text-emerald-500" /></div>
                      <h3 className="text-3xl font-black oswald uppercase text-white italic tracking-tighter mb-10 flex items-center gap-4">
                          <Wifi className="text-emerald-500 animate-pulse" /> Monitor de Telemetría
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-8 mb-12">
                          {['S1 ANTENNA', 'S2 ANTENNA', 'FINISH LINE'].map((label, i) => {
                              const isActive = i === 0 ? monitorAntennas.s1 : i === 1 ? monitorAntennas.s2 : monitorAntennas.finish;
                              return (
                                <div key={label} className={`p-8 rounded-[2rem] border transition-all duration-300 ${isActive ? 'bg-emerald-600/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-zinc-900 border-zinc-800 opacity-50'}`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <Signal size={32} className={isActive ? 'text-emerald-500' : 'text-zinc-600'} />
                                        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`}></div>
                                    </div>
                                    <h4 className="text-xl font-black oswald uppercase text-white italic">{label}</h4>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Status: {isActive ? 'DETECTING' : 'IDLE'}</p>
                                </div>
                              );
                          })}
                      </div>
                  </div>
              </div>
          )}

          {/* TAB: CAMPEONATOS */}
          {activeTab === 'campeonatos' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <div className="flex justify-between items-end border-b border-white/5 pb-10">
                    <div>
                      <h3 className="text-4xl font-black oswald uppercase text-white italic tracking-tighter">Gestión de Torneos</h3>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2">Creación y edición de temporadas</p>
                    </div>
                    <button onClick={() => { setHistForm({ name: '', year: 2026, champions: [] }); setShowHistModal(true); }} className="bg-blue-600 text-white px-10 py-5 rounded-[2.5rem] font-black uppercase text-[10px] flex items-center gap-3 shadow-2xl hover:bg-white hover:text-blue-600 transition-all group">
                      Nuevo Campeonato <Trophy size={20} className="group-hover:-translate-y-1 transition-transform" />
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {championships.map(c => (
                       <div key={c.id} className="bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem] relative group hover:border-blue-600 transition-all">
                          <h4 className="text-2xl font-black oswald uppercase text-white italic mb-2">{c.name}</h4>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Temporada {c.year}</p>
                          <div className="text-[10px] text-zinc-400 font-bold uppercase space-y-1">
                             <p>Eventos: {c.events?.length || 0}</p>
                             <p>Circuitos: {c.tracks}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
          )}

        </div>
      </main>

      {/* EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-[400] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6">
           <div className="bg-zinc-900 border border-white/10 w-full max-w-xl p-14 rounded-[4rem] shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setShowEventModal(false)} className="absolute top-10 right-10 text-zinc-500 hover:text-white bg-zinc-950 p-2 rounded-full transition-all"><XCircle size={32} /></button>
              <div className="flex items-center gap-5 mb-10">
                 <div className="bg-blue-600 p-4 rounded-3xl"><Calendar size={28} className="text-white" /></div>
                 <h2 className="text-4xl font-black oswald uppercase text-white italic tracking-tighter">Gestor <span className="text-blue-500">Eventos</span></h2>
              </div>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2 mb-2 block">Nombre Evento</label>
                        <input type="text" value={eventForm.name} onChange={e => setEventForm({...eventForm, name: e.target.value})} className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-white font-black uppercase outline-none focus:border-blue-600" placeholder="EJ: GP APERTURA" />
                     </div>
                     <div>
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2 mb-2 block">Ronda #</label>
                        <input type="number" value={eventForm.round} onChange={e => setEventForm({...eventForm, round: Number(e.target.value)})} className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-white font-black uppercase outline-none focus:border-blue-600" />
                     </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2 mb-2 block">Fecha</label>
                       <input type="text" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-white font-black uppercase outline-none focus:border-blue-600" placeholder="DD/MM/AAAA" />
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2 mb-2 block">Estado</label>
                       <select value={eventForm.status} onChange={e => setEventForm({...eventForm, status: e.target.value as any})} className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-white font-black uppercase outline-none focus:border-blue-600 cursor-pointer">
                          {['Programada', 'En curso', 'Finalizada', 'Suspendida', 'Próxima'].map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2 mb-2 block">Circuito</label>
                    <input type="text" value={eventForm.track} onChange={e => setEventForm({...eventForm, track: e.target.value})} className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-white font-black uppercase outline-none focus:border-blue-600" placeholder="EJ: KARTÓDROMO CHIVILCOY" />
                 </div>
                 <button onClick={saveEvent} className="w-full bg-blue-600 hover:bg-white text-white hover:text-black font-black uppercase py-6 rounded-3xl shadow-2xl transition-all oswald italic text-lg">Guardar Evento</button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL IMPORTAR RANKING */}
      {showImportRankingModal && (
        <div className="fixed inset-0 z-[400] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6">
           <div className="bg-zinc-900 border border-white/10 w-full max-w-2xl p-10 rounded-[3rem] shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setShowImportRankingModal(false)} className="absolute top-10 right-10 text-zinc-500 hover:text-white transition-colors">
                <XCircle size={28} />
              </button>
              <div className="flex items-center gap-5 mb-8">
                 <div className="bg-blue-600 p-4 rounded-3xl"><Sparkles size={24} className="text-white" /></div>
                 <h3 className="text-3xl font-black oswald uppercase text-white italic tracking-tighter leading-none">Importación <span className="text-blue-500">Smart Ranking</span></h3>
              </div>
              <div className="space-y-6">
                 <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest">Pegue el texto extraído del reporte oficial o datos CSV para que la IA los procese.</p>
                 <textarea 
                   value={rawRankingText}
                   onChange={e => setRawRankingText(e.target.value)}
                   className="w-full h-64 bg-black border border-white/5 rounded-2xl p-6 text-zinc-300 font-mono text-xs outline-none focus:border-blue-600 resize-none"
                   placeholder="EJ: 1, Juan Acosta, KDO Power, 145.5 pts..."
                 />
                 <button 
                   onClick={handleImportRanking}
                   disabled={isImporting || !rawRankingText.trim()}
                   className="w-full bg-blue-600 hover:bg-white text-white hover:text-black font-black uppercase py-6 rounded-2xl text-xs tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                 >
                   {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                   {isImporting ? 'PROCESANDO CON IA...' : 'SINCRONIZAR BASE DE DATOS'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL NEWS */}
      {showNewsModal && (
         <div className="fixed inset-0 z-[400] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6">
            <div className="bg-zinc-900 border border-white/10 w-full max-w-xl p-14 rounded-[4rem] shadow-2xl relative animate-in zoom-in-95">
               <button onClick={() => setShowNewsModal(false)} className="absolute top-10 right-10 text-zinc-500 hover:text-white transition-colors"><XCircle size={28} /></button>
               <h2 className="text-3xl font-black oswald uppercase text-white italic mb-6">Editor de Prensa</h2>
               <div className="space-y-4">
                  <input type="text" placeholder="Título" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} className="w-full bg-black p-4 rounded-xl text-white border border-white/10" />
                  <textarea placeholder="Contenido" value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} className="w-full bg-black p-4 rounded-xl text-white border border-white/10 h-32 resize-none" />
                  <select value={newsForm.category} onChange={e => setNewsForm({...newsForm, category: e.target.value as any})} className="w-full bg-black p-4 rounded-xl text-white border border-white/10 cursor-pointer">
                     <option value="Oficial">Oficial</option>
                     <option value="Prensa">Prensa</option>
                     <option value="Urgente">Urgente</option>
                  </select>
                  <button onClick={saveNews} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold uppercase hover:bg-white hover:text-black transition-all">Publicar</button>
               </div>
            </div>
         </div>
      )}

      {/* MODAL STAFF */}
      {showStaffModal && (
         <div className="fixed inset-0 z-[400] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6">
            <div className="bg-zinc-900 border border-white/10 w-full max-w-xl p-14 rounded-[4rem] shadow-2xl relative animate-in zoom-in-95">
               <button onClick={() => setShowStaffModal(false)} className="absolute top-10 right-10 text-zinc-500 hover:text-white transition-colors"><XCircle size={28} /></button>
               <h2 className="text-3xl font-black oswald uppercase text-white italic mb-6">Oficial Deportivo</h2>
               <div className="space-y-4">
                  <input type="text" placeholder="Nombre Completo" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} className="w-full bg-black p-4 rounded-xl text-white border border-white/10" />
                  <input type="text" placeholder="Usuario (ID)" value={staffForm.username} onChange={e => setStaffForm({...staffForm, username: e.target.value})} className="w-full bg-black p-4 rounded-xl text-white border border-white/10" />
                  <input type="password" placeholder="Contraseña" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} className="w-full bg-black p-4 rounded-xl text-white border border-white/10" />
                  <select value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value as any})} className="w-full bg-black p-4 rounded-xl text-white border border-white/10 cursor-pointer">
                     {['SuperAdmin', 'Comisario Deportivo', 'Escrutador Técnico', 'Secretario', 'Prensa'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button onClick={saveStaff} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold uppercase hover:bg-white hover:text-black transition-all">Guardar Credenciales</button>
               </div>
            </div>
         </div>
      )}

      {/* MODAL HISTORY */}
      {showHistModal && (
         <div className="fixed inset-0 z-[400] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6">
            <div className="bg-zinc-900 border border-white/10 w-full max-w-xl p-14 rounded-[4rem] shadow-2xl relative animate-in zoom-in-95">
               <button onClick={() => setShowHistModal(false)} className="absolute top-10 right-10 text-zinc-500 hover:text-white transition-colors"><XCircle size={28} /></button>
               <h2 className="text-3xl font-black oswald uppercase text-white italic mb-6">Nuevo Campeonato Histórico</h2>
               <div className="space-y-4">
                  <input type="text" placeholder="Nombre del Torneo" value={histForm.name} onChange={e => setHistForm({...histForm, name: e.target.value})} className="w-full bg-black p-4 rounded-xl text-white border border-white/10" />
                  <input type="number" placeholder="Año" value={histForm.year} onChange={e => setHistForm({...histForm, year: Number(e.target.value)})} className="w-full bg-black p-4 rounded-xl text-white border border-white/10" />
                  <div className="border-t border-white/10 pt-4">
                     <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Agregar Campeón</p>
                     <div className="flex gap-2 mb-2">
                        <input type="text" placeholder="Categoría" value={newWinner.category} onChange={e => setNewWinner({...newWinner, category: e.target.value})} className="bg-black p-2 rounded-lg text-white border border-white/10 text-xs flex-grow" />
                        <input type="text" placeholder="Piloto" value={newWinner.pilot} onChange={e => setNewWinner({...newWinner, pilot: e.target.value})} className="bg-black p-2 rounded-lg text-white border border-white/10 text-xs flex-grow" />
                        <button onClick={addChampionToForm} className="bg-zinc-800 text-white p-2 rounded-lg text-xs hover:bg-blue-600 transition-all"><Plus size={16}/></button>
                     </div>
                     <div className="space-y-1">
                        {histForm.champions?.map((c, i) => (
                           <div key={i} className="text-xs text-zinc-400 bg-black/40 px-3 py-1 rounded flex justify-between">
                              <span>{c.category}</span>
                              <span className="text-white font-bold">{c.pilot}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  <button onClick={saveHistory} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold uppercase hover:bg-white hover:text-black transition-all">Registrar Legado</button>
               </div>
            </div>
         </div>
      )}

      {/* MODAL REGULATIONS */}
      {showRegModal && (
        <div className="fixed inset-0 z-[400] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6">
           <div className="bg-zinc-900 border border-white/10 w-full max-w-xl p-14 rounded-[4rem] shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setShowRegModal(false)} className="absolute top-10 right-10 text-zinc-500 hover:text-white transition-colors"><XCircle size={28} /></button>
              <h2 className="text-3xl font-black oswald uppercase text-white italic mb-6">Nuevo Reglamento</h2>
              <div className="space-y-4">
                  <input type="text" placeholder="Título" value={editingReg.title} onChange={e => setEditingReg({...editingReg, title: e.target.value})} className="w-full bg-black p-4 rounded-xl text-white border border-white/10" />
                  <select value={editingReg.category} onChange={e => setEditingReg({...editingReg, category: e.target.value as any})} className="w-full bg-black p-4 rounded-xl text-white border border-white/10 cursor-pointer">
                      {['Técnico', 'Deportivo', 'Calendario', 'Anexo', 'Circular'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="file" onChange={handleFileUpload} className="text-white text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                  <button onClick={saveReg} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold uppercase hover:bg-white hover:text-black transition-all">Guardar</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
