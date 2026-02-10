
import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';

const newsItems = [
  {
    title: "Gran Final de Temporada en el Kartódromo de Buenos Aires",
    excerpt: "Este fin de semana se definen los campeones de las categorías Master y Supermaster.",
    date: "25 Nov 2024",
    author: "kdoadmin",
    image: "https://images.unsplash.com/photo-1547631618-f29792042761?w=800&auto=format"
  },
  {
    title: "Nuevos Reglamentos Técnicos para el 2025",
    excerpt: "La FRAD 3 anunció cambios significativos para la categoría KDO Power.",
    date: "20 Nov 2024",
    author: "Admin Solo Karting",
    image: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800&auto=format"
  },
  {
    title: "Entrevistas en Pista: La revelación del año",
    excerpt: "Hablamos con los pilotos de la categoría Menores tras su excelente desempeño.",
    date: "15 Nov 2024",
    author: "Solo Karting Prensa",
    image: "https://images.unsplash.com/photo-1511994298241-608e28f14f66?w=800&auto=format"
  }
];

const Noticias: React.FC = () => {
  return (
    <div className="bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-black italic oswald uppercase text-white mb-4">Noticias</h1>
          <p className="text-zinc-400">Toda la actualidad del karting nacional e internacional.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((n, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group">
              <div className="h-48 overflow-hidden">
                <img src={n.image} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase mb-4">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {n.date}</span>
                  <span className="flex items-center gap-1"><User size={14} /> {n.author}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 uppercase tracking-tight">{n.title}</h3>
                <p className="text-zinc-400 text-sm mb-6 line-clamp-3 leading-relaxed">{n.excerpt}</p>
                <button className="flex items-center gap-2 text-red-500 font-bold uppercase text-xs hover:translate-x-2 transition-transform">
                  Leer más <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Noticias;
