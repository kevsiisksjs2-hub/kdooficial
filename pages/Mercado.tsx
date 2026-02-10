
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Tag, Search, Plus, Phone, Image as ImageIcon, CheckCircle, X, Zap } from 'lucide-react';
import { storageService } from '../services/storageService';
import { MarketplaceItem } from '../types';

const Mercado: React.FC = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('Todos');
  const [newItem, setNewItem] = useState({
    title: '',
    price: '',
    category: 'Kart Completo' as MarketplaceItem['category'],
    condition: 'Usado' as MarketplaceItem['condition'],
    contact: ''
  });

  useEffect(() => {
    // Fixed storage call to get marketplace items
    const data = storageService.getMarketplace();
    if (data.length === 0) {
      const demoItems: MarketplaceItem[] = [
        { id: 'm1', title: 'Kart Completo Tony Kart 2023', price: '$4.500 USD', category: 'Kart Completo', condition: 'Usado', image: 'https://images.unsplash.com/photo-1547631618-f29792042761?w=400', contact: '+54 11 1234 5678' },
        { id: 'm2', title: 'Motor 150cc KDO Preparado', price: '$850.000 ARS', category: 'Motor', condition: 'Nuevo', image: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=400', contact: '+54 11 8765 4321' }
      ];
      setItems(demoItems);
      // Fixed storage call to save marketplace items
      storageService.saveMarketplace(demoItems);
    } else {
      setItems(data);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: MarketplaceItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...newItem,
      image: 'https://images.unsplash.com/photo-1511994298241-608e28f14f66?w=400',
    };
    const updated = [item, ...items];
    setItems(updated);
    // Fixed storage call to save marketplace items
    storageService.saveMarketplace(updated);
    setShowModal(false);
    setNewItem({title: '', price: '', category: 'Kart Completo', condition: 'Usado', contact: ''});
    alert("Publicación realizada con éxito.");
  };

  const filteredItems = filter === 'Todos' ? items : items.filter(i => i.category === filter);

  return (
    <div className="bg-zinc-950 py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16 border-b border-zinc-900 pb-12">
          <div>
             <div className="flex items-center gap-3 mb-4">
                <ShoppingBag className="text-red-600" size={24} />
                <span className="text-red-600 font-black uppercase text-[10px] tracking-[0.4em] oswald italic">Solo Karting Shop</span>
             </div>
             <h1 className="text-6xl font-black italic oswald uppercase text-white mb-2 tracking-tighter">Mercado <span className="text-red-600">Karting</span></h1>
             <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Plataforma oficial de compra y venta para pilotos</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-white text-black hover:bg-red-600 hover:text-white px-10 py-5 rounded-2xl font-black uppercase text-xs flex items-center gap-3 shadow-2xl transition-all transform hover:-translate-y-1">
            <Plus size={20} /> Publicar Aviso
          </button>
        </header>

        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 custom-scrollbar">
           {['Todos', 'Kart Completo', 'Motor', 'Repuestos', 'Indumentaria'].map(cat => (
             <button 
               key={cat} 
               onClick={() => setFilter(cat)}
               className={`px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest whitespace-nowrap transition-all border ${filter === cat ? 'bg-red-600 text-white border-red-600 shadow-xl shadow-red-600/20' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-700'}`}
             >
               {cat}
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden group hover:border-red-600 transition-all shadow-2xl flex flex-col h-full">
              <div className="h-56 relative overflow-hidden">
                 <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                 <div className="absolute top-6 right-6 bg-black/90 backdrop-blur-xl px-4 py-1.5 rounded-xl text-[9px] font-black uppercase text-red-500 border border-red-600/30 shadow-2xl">{item.condition}</div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                 <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Tag size={12} className="text-red-600" /> {item.category}
                 </p>
                 <h3 className="text-xl font-black text-white uppercase oswald leading-tight mb-6 tracking-tight italic group-hover:text-red-500 transition-colors">{item.title}</h3>
                 <div className="mt-auto">
                    <p className="text-3xl font-black oswald text-emerald-500 mb-8 tabular-nums italic">{item.price}</p>
                    <a href={`https://wa.me/${item.contact.replace(/\s+/g, '')}`} target="_blank" className="w-full bg-zinc-950 border border-zinc-800 hover:bg-emerald-600 hover:border-emerald-500 text-white font-black uppercase py-4 rounded-2xl text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl group/btn">
                      <Phone size={16} className="text-emerald-500 group-hover/btn:text-white transition-colors" /> Contactar
                    </a>
                 </div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-900 rounded-[3rem]">
               <ShoppingBag size={48} className="text-zinc-800 mx-auto mb-4 opacity-20" />
               <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">No hay artículos publicados en esta categoría</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/98 backdrop-blur-2xl">
             <div className="bg-zinc-900 w-full max-w-xl rounded-[3.5rem] border border-zinc-800 p-12 shadow-2xl relative animate-in zoom-in-95 duration-300">
                <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-zinc-500 hover:text-white bg-zinc-950 p-2 rounded-full transition-all">
                   <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-red-600 p-3 rounded-2xl shadow-xl"><Zap className="text-white" size={24} /></div>
                  <h2 className="text-3xl font-black oswald uppercase text-white italic tracking-tighter">Nuevo Anuncio Oficial</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="p-14 border-2 border-dashed border-zinc-800 rounded-[2.5rem] text-center flex flex-col items-center gap-4 hover:border-red-600/50 transition-all cursor-pointer bg-zinc-950/50 group">
                      <ImageIcon size={48} className="text-zinc-800 group-hover:text-red-600 transition-colors" />
                      <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest group-hover:text-white">Subir Imagen del Producto</p>
                   </div>
                   
                   <div className="space-y-4">
                      <div>
                         <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block ml-2">Título del Anuncio</label>
                         <input required type="text" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} placeholder="EJ: MOTOR 150CC KDO POWER" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold uppercase outline-none focus:border-red-600 text-xs transition-all" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block ml-2">Precio / Moneda</label>
                            <input required type="text" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="$0.00" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-red-600 text-xs" />
                         </div>
                         <div>
                            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block ml-2">Categoría</label>
                            <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as MarketplaceItem['category']})} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 text-white font-black uppercase text-[10px] outline-none focus:border-red-600 cursor-pointer">
                               {['Kart Completo', 'Motor', 'Repuestos', 'Indumentaria'].map(c => <option key={c}>{c}</option>)}
                            </select>
                         </div>
                      </div>
                      
                      <div>
                         <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block ml-2">WhatsApp de Contacto</label>
                         <input required type="text" value={newItem.contact} onChange={e => setNewItem({...newItem, contact: e.target.value})} placeholder="+54 9 11 ..." className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-red-600 text-xs" />
                      </div>
                   </div>
                   
                   <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-6 rounded-3xl shadow-2xl shadow-red-600/30 transition-all transform hover:scale-[1.02] active:scale-95 text-xs tracking-[0.2em] oswald italic">
                      Publicar Ahora en Mercado
                   </button>
                </form>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mercado;
