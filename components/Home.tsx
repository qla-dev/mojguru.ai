
import React from 'react';
import { Recipe } from '../types';
import { MOCK_RECIPES } from '../constants';

interface HomeProps {
  onSelectRecipe: (recipe: Recipe) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectRecipe }) => {
  const featured = MOCK_RECIPES[0];
  const categories = [
    { name: 'Lunch', emoji: '🥗' },
    { name: 'Salads', emoji: '🥬' },
    { name: 'Cocktails', emoji: '🍹' },
    { name: 'Desserts', emoji: '🍰' },
    { name: 'Breakfast', emoji: '🍳' }
  ];

  return (
    <div className="p-6 pb-24 space-y-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center pt-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FF2D55]">
            <img src="https://i.pravatar.cc/100?u=user" alt="avatar" />
          </div>
          <span className="font-bold">Santiago ⌄ 👨‍🍳</span>
        </div>
        <div className="flex gap-4">
          <button className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-lg shadow-lg border border-white/5">🔍</button>
          <button className="flex items-center gap-1 bg-neutral-900 px-3 py-1 rounded-full text-xs font-bold border border-white/10 shadow-lg">
            <span className="text-purple-500">💎</span> 458
          </button>
        </div>
      </div>

      {/* Featured Recipe Card */}
      <div 
        onClick={() => onSelectRecipe(featured)}
        className="relative h-96 w-full rounded-[40px] overflow-hidden group cursor-pointer shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]"
      >
        <img src={featured.image} alt={featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute top-6 left-6 flex items-center gap-2">
           <span className="bg-[#FF2D55] text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg animate-pulse">Featured 💎</span>
        </div>
        <div className="absolute bottom-8 left-8 right-8">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Recipe of the Day 📅</p>
          <h2 className="text-2xl font-black leading-tight mb-3 tracking-tighter">{featured.title} 🥗</h2>
          <div className="flex items-center gap-4 text-sm font-black uppercase tracking-widest">
            <span className="flex items-center gap-1.5">⚡ {featured.time}</span>
            <span className="text-yellow-400 flex items-center gap-1.5">⭐ {featured.rating}</span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-4">
        <button className="flex-1 bg-neutral-900 h-24 rounded-3xl border border-white/10 flex items-center p-4 gap-4 transition-all hover:bg-neutral-800 shadow-xl">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🎲</div>
          <div className="text-left">
            <h3 className="font-black text-sm uppercase tracking-tight">Random recipe 🎲</h3>
            <p className="text-[9px] text-white/30 leading-tight uppercase tracking-widest font-black">Mystery dish incoming!</p>
          </div>
          <div className="ml-auto w-10 h-10 bg-[#FF2D55] rounded-xl flex items-center justify-center text-sm shadow-lg font-black pr-0.5">↗</div>
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xl font-black tracking-tight">Categories 📂</h3>
          <button className="text-[#FF2D55] text-[10px] font-black uppercase tracking-[0.2em]">View all</button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {categories.map((cat, i) => (
            <div key={cat.name} className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl transition-all shadow-xl ${i === 0 ? 'bg-[#FF2D55] shadow-[#FF2D55]/30' : 'bg-neutral-900 border border-white/10'}`}>
                {cat.emoji}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'text-white' : 'text-white/40'}`}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
