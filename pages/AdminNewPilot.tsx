
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { Pilot, Category, Status } from '../types';
import { 
  ChevronLeft, 
  Save, 
  UserPlus, 
  AlertCircle, 
  Hash,
  ShieldCheck,
  IdCard,
  Radio,
  Edit3
} from 'lucide-react';

const AdminNewPilot: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    number: '',
    category: '',
    medicalLicense: '',
    sportsLicense: '',
    transponderId: '',
    ranking: '99',
    status: Status.CONFIRMADO
  });

  useEffect(() => {
    const auth = storageService.getAuth();
    if (!auth) {
      navigate('/AdminKDO');
      return;
    }
    const cats = storageService.getCategories();
    setCategories(cats);

    // Lógica para modo edición
    const params = new URLSearchParams(location.search);
    const id = params.get('edit');
    if (id) {
      const p = storageService.getPilots().find(x => x.id === id);
      if (p) {
        setEditId(id);
        setFormData({
          name: p.name,
          number: p.number,
          category: p.category,
          medicalLicense: p.medicalLicense,
          sportsLicense: p.sportsLicense,
          transponderId: p.transponderId,
          ranking: p.ranking.toString(),
          status: p.status
        });
      }
    } else if (cats.length > 0) {
      setFormData(prev => ({ ...prev, category: cats[0] }));
    }
  }, [navigate, location.search]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const currentPilots = storageService.getPilots();

    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    
    if (!formData.number) {
      newErrors.number = "El dorsal es obligatorio";
    } else {
      // VALIDACIÓN DE UNICIDAD (Dorsal único por categoría)
      const numberExists = currentPilots.some(p => 
        p.number === formData.number.trim() && 
        p.category === formData.category && // Chequear misma categoría
        p.id !== editId
      );
      
      if (numberExists) {
        newErrors.number = `El número ${formData.number} ya existe en ${formData.category}`;
      }
    }

    if (!formData.medicalLicense.trim()) {
        newErrors.medicalLicense = "Licencia médica requerida";
    } else {
        // VALIDACIÓN DE UNICIDAD (Licencia Médica Única en todo el padrón)
        const medicalExists = currentPilots.some(p => 
            p.medicalLicense === formData.medicalLicense.trim() &&
            p.id !== editId
        );
        if (medicalExists) {
            newErrors.medicalLicense = "Esta licencia ya pertenece a otro piloto";
        }
    }

    if (!formData.sportsLicense.trim()) newErrors.sportsLicense = "Licencia deportiva requerida";
    if (!formData.transponderId.trim()) newErrors.transponderId = "Transponder requerido";
    if (!formData.category) newErrors.category = "Seleccione una categoría";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const currentPilots = storageService.getPilots();
    
    if (editId) {
      const updated = currentPilots.map(p => p.id === editId ? {
        ...p,
        name: formData.name.toUpperCase().trim(),
        number: formData.number.trim(),
        category: formData.category,
        medicalLicense: formData.medicalLicense.trim(),
        sportsLicense: formData.sportsLicense.trim(),
        transponderId: formData.transponderId.trim().toUpperCase(),
        ranking: parseInt(formData.ranking) || 99,
        status: formData.status as Status,
        lastUpdated: new Date().toISOString().split('T')[0]
      } : p);
      storageService.savePilots(updated);
      storageService.addLog('ADMIN', `Piloto editado: ${formData.name}`);
    } else {
      const newPilot: Pilot = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name.toUpperCase().trim(),
        number: formData.number.trim(),
        category: formData.category,
        medicalLicense: formData.medicalLicense.trim(),
        sportsLicense: formData.sportsLicense.trim(),
        transponderId: formData.transponderId.trim().toUpperCase(),
        ranking: parseInt(formData.ranking) || 99,
        status: formData.status as Status,
        lastUpdated: new Date().toISOString().split('T')[0],
        createdAt: Date.now(),
        conductPoints: 10,
        stats: { wins: 0, podiums: 0, poles: 0 }
      };
      storageService.savePilots([newPilot, ...currentPilots]);
      storageService.addLog('ADMIN', `Nuevo piloto registrado: ${newPilot.name}`);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/AdminKDO/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 pb-20 font-sans">
      <div className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate('/AdminKDO/dashboard')}
            className="flex items-center gap-2 text-zinc-500 hover:text-blue-500 transition-colors font-black uppercase text-[10px] tracking-widest"
          >
            <ChevronLeft size={18} /> Volver al Dashboard
          </button>
          <div className="bg-blue-600 px-3 py-1 rounded italic font-black text-white text-sm oswald">
            KDO ADMIN
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 mt-12">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-600/20">
              {editId ? <Edit3 className="text-white" size={32} /> : <UserPlus className="text-white" size={32} />}
            </div>
            <div>
              <h1 className="text-4xl font-black oswald uppercase text-white italic tracking-tighter">
                {editId ? 'Editar Piloto Federado' : 'Nuevo Registro de Piloto'}
              </h1>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Gestión de Base de Datos KDO</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-sm font-black uppercase text-blue-500 tracking-[0.2em] mb-8 flex items-center gap-2">
              <IdCard size={18} /> Identidad y Categoría
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nombre Completo del Piloto</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className={`w-full bg-black border rounded-xl px-6 py-4 text-white font-bold uppercase outline-none transition-all ${errors.name ? 'border-red-600 bg-red-600/5' : 'border-zinc-800 focus:border-blue-600'}`}
                  placeholder="Ej: JUAN MANUEL FANGIO"
                />
                {errors.name && <p className="text-[9px] text-red-500 font-black uppercase flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Categoría Federada</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className={`w-full bg-black border rounded-xl px-6 py-4 text-white font-bold uppercase outline-none cursor-pointer appearance-none ${errors.category ? 'border-red-600' : 'border-zinc-800 focus:border-blue-600'}`}
                >
                  <option value="">Seleccione Categoría</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-[9px] text-red-500 font-black uppercase flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.category}</p>}
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-sm font-black uppercase text-blue-500 tracking-[0.2em] mb-8 flex items-center gap-2">
              <Hash size={18} /> Datos Técnicos y Dorsal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Número de Kart</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-black oswald text-xl">#</span>
                  <input 
                    type="text" 
                    value={formData.number}
                    onChange={e => setFormData({...formData, number: e.target.value.replace(/\D/g, '')})}
                    className={`w-full bg-black border rounded-xl pl-10 pr-6 py-4 text-white font-black oswald text-2xl outline-none transition-all ${errors.number ? 'border-red-600 bg-red-600/5' : 'border-zinc-800 focus:border-blue-600'}`}
                    placeholder="00"
                  />
                </div>
                {errors.number && <p className="text-[9px] text-red-500 font-black uppercase flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.number}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">ID Transponder</label>
                <div className="relative">
                  <Radio size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
                  <input 
                    type="text" 
                    value={formData.transponderId}
                    onChange={e => setFormData({...formData, transponderId: e.target.value})}
                    className={`w-full bg-black border rounded-xl pl-12 pr-6 py-4 text-white font-mono text-sm outline-none transition-all ${errors.transponderId ? 'border-red-600' : 'border-zinc-800 focus:border-blue-600'}`}
                    placeholder="HEX ID (Mylaps)"
                  />
                </div>
                {errors.transponderId && <p className="text-[9px] text-red-500 font-black uppercase flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.transponderId}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Ranking Inicial</label>
                <input 
                  type="number" 
                  value={formData.ranking}
                  onChange={e => setFormData({...formData, ranking: e.target.value})}
                  className={`w-full bg-black border rounded-xl px-6 py-4 text-white font-black oswald text-xl outline-none transition-all ${errors.ranking ? 'border-red-600' : 'border-zinc-800 focus:border-blue-600'}`}
                />
                {errors.ranking && <p className="text-[9px] text-red-500 font-black uppercase flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.ranking}</p>}
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-sm font-black uppercase text-blue-500 tracking-[0.2em] mb-8 flex items-center gap-2">
              <ShieldCheck size={18} /> Licencias y Fiscalización
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Licencia Médica N°</label>
                <input 
                  type="text" 
                  value={formData.medicalLicense}
                  onChange={e => setFormData({...formData, medicalLicense: e.target.value})}
                  className={`w-full bg-black border rounded-xl px-6 py-4 text-white font-bold outline-none transition-all ${errors.medicalLicense ? 'border-red-600' : 'border-zinc-800 focus:border-blue-600'}`}
                  placeholder="000000"
                />
                {errors.medicalLicense && <p className="text-[9px] text-red-500 font-black uppercase flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.medicalLicense}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Licencia Deportiva N°</label>
                <input 
                  type="text" 
                  value={formData.sportsLicense}
                  onChange={e => setFormData({...formData, sportsLicense: e.target.value})}
                  className={`w-full bg-black border rounded-xl px-6 py-4 text-white font-bold outline-none transition-all ${errors.sportsLicense ? 'border-red-600' : 'border-zinc-800 focus:border-blue-600'}`}
                  placeholder="000000"
                />
                {errors.sportsLicense && <p className="text-[9px] text-red-500 font-black uppercase flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.sportsLicense}</p>}
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 mt-12">
            <button 
              type="button" 
              onClick={() => navigate('/AdminKDO/dashboard')}
              className="px-10 py-5 rounded-2xl font-black uppercase text-xs text-zinc-500 hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs shadow-2xl shadow-blue-600/30 transition-all flex items-center gap-3 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Procesando...</>
              ) : (
                <><Save size={18} /> {editId ? 'Guardar Cambios' : 'Guardar Piloto en KDO'}</>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminNewPilot;
