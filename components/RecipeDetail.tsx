
import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { suggestVariations, generateMealImage } from '../services/geminiService';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onToggleSave: (recipe: Recipe) => void;
  isSaved: boolean;
}

const IonIcon = 'ion-icon' as any;

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack, onToggleSave, isSaved }) => {
  const [variations, setVariations] = useState<any[]>([]);
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [currentImage, setCurrentImage] = useState(recipe.image);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    const fetchVariations = async () => {
      setLoadingVariations(true);
      try {
        const result = await suggestVariations(recipe.title);
        setVariations(result);
      } catch (e) { console.error(e); } finally { setLoadingVariations(false); }
    };
    fetchVariations();
  }, [recipe.title]);

  const handleGenerateMagicPhoto = async () => {
    setIsGeneratingImage(true);
    try {
      const newImg = await generateMealImage(recipe.title, recipe.ingredients);
      setCurrentImage(newImg);
    } catch (e) {
      console.error("Image gen failed", e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) newChecked.delete(index);
    else newChecked.add(index);
    setCheckedIngredients(newChecked);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black overflow-y-auto custom-scrollbar pb-32 animate-fade-in">
      {/* Header Image */}
      <div className="relative h-[45vh] w-full group">
        <img 
          src={currentImage} 
          alt={recipe.title} 
          className={`w-full h-full object-cover transition-all duration-700 ${isGeneratingImage ? 'blur-sm scale-105' : 'blur-0 scale-100'}`} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        {/* Loading Overlay */}
        {isGeneratingImage && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-fade-in">
             <div className="w-12 h-12 border-4 border-white/20 border-t-[#FF2D55] rounded-full animate-spin"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Chef is plating... 🍽️</p>
          </div>
        )}

        {/* Back and Bookmark */}
        <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-10">
          <button onClick={onBack} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-xl border border-white/10 active:scale-90 transition-transform shadow-xl"><IonIcon name="chevron-back-outline"></IonIcon></button>
          
          <div className="flex gap-3">
             <button 
                onClick={handleGenerateMagicPhoto} 
                disabled={isGeneratingImage}
                className="px-4 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white/10 active:scale-95 transition-all disabled:opacity-50"
              >
                <span className="text-sm">✨</span> Magic Photo
              </button>
              <button onClick={() => onToggleSave(recipe)} className={`w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center text-xl border border-white/10 active:scale-90 transition-transform ${isSaved ? 'bg-[#FF2D55] text-white border-none' : 'bg-black/40 text-white shadow-xl'}`}><IonIcon name={isSaved ? "bookmark" : "bookmark-outline"}></IonIcon></button>
          </div>
        </div>

        {/* Bottom Title Area */}
        <div className="absolute bottom-6 left-6 right-6">
          <span className="bg-[#FF2D55] text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest mb-3 inline-block shadow-lg">{recipe.category}</span>
          <h1 className="text-3xl font-black leading-tight tracking-tighter">{recipe.title}</h1>
          <div className="flex items-center mt-3 gap-5 text-xs font-black uppercase tracking-widest text-white/50"><span>⚡ {recipe.time}</span> <span className="text-yellow-400">⭐ {recipe.rating.toFixed(1)}</span></div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-12">
        <div className="flex gap-4">
          <button className="flex-1 bg-[#FF2D55] text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"><IonIcon name="play" className="text-lg"></IonIcon> Cook Mode 🧑‍🍳</button>
          <button className="w-20 h-20 bg-neutral-900 rounded-3xl flex items-center justify-center text-2xl border border-white/10 active:bg-neutral-800"><IonIcon name="share-social-outline"></IonIcon></button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatBox icon="🔥" label="Energy" value={`${recipe.calories} kcal`} />
          <StatBox icon="🥩" label="Protein" value={recipe.protein} />
          <StatBox icon="🥯" label="Carbs" value={recipe.carbs} />
          <StatBox icon="🥜" label="Fat" value={recipe.fat} />
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight mb-6 px-2">Ingredients 🧺</h2>
          <div className="space-y-4">
            {recipe.ingredients.map((ing, i) => {
              const isChecked = checkedIngredients.has(i);
              return (
                <div key={i} onClick={() => toggleIngredient(i)} className={`w-full flex items-center gap-5 p-5 rounded-[28px] border transition-all duration-300 cursor-pointer animate-item-pop-in ${isChecked ? 'bg-neutral-900/30 border-white/5 opacity-40' : 'bg-neutral-900/60 border-white/10 shadow-xl'}`} style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isChecked ? 'bg-white/10' : 'bg-[#FF2D55] animate-checkmark-bounce'}`}>
                    <IonIcon name={isChecked ? "checkmark-done" : "checkmark"} className={`text-sm ${isChecked ? 'text-white/40' : 'text-white'}`}></IonIcon>
                  </div>
                  <span className={`text-[15px] font-bold tracking-tight ${isChecked ? 'line-through text-white/20' : 'text-white/90'}`}>{ing}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight mb-6 px-2">Directions 🍳</h2>
          <div className="space-y-8">
            {recipe.directions.map((step, i) => (
              <div key={i} className="flex gap-6 group animate-fade-in" style={{ animationDelay: `${(recipe.ingredients.length + i) * 100}ms` }}>
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF2D55]/10 text-[#FF2D55] font-black flex items-center justify-center border border-[#FF2D55]/20 shadow-lg">{i + 1}</div>
                  {i < recipe.directions.length - 1 && <div className="w-px h-full bg-gradient-to-b from-[#FF2D55]/20 to-transparent mt-2" />}
                </div>
                <div className="bg-neutral-900/40 p-6 rounded-[32px] border border-white/5 flex-1 group-hover:bg-neutral-900/60 transition-colors">
                  <p className="text-white/80 leading-relaxed text-[15px] font-medium">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-[45px] p-8 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-xl flex items-center gap-3 tracking-tighter">✨ AI Variations 🧪</h3>
            {loadingVariations && <div className="animate-spin text-purple-500"><IonIcon name="sync-outline"></IonIcon></div>}
          </div>
          <div className="space-y-5">
            {variations.length > 0 ? variations.map((v, i) => (
              <div key={i} className="bg-black/40 p-5 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all">
                <h4 className="font-black text-[#FF2D55] text-sm uppercase tracking-widest mb-2">{v.variationName}</h4>
                <p className="text-sm text-white/50 font-medium leading-snug">{v.highlight}</p>
              </div>
            )) : <p className="text-sm text-white/20 font-black uppercase tracking-widest text-center py-4">Generating magic... ✨</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, label, value }: { icon: string, label: string, value: any }) => (
  <div className="flex flex-col items-center bg-neutral-900/50 p-4 rounded-3xl border border-white/5 shadow-xl">
    <span className="text-xl mb-1">{icon}</span>
    <span className="font-black text-[10px] tabular-nums text-white text-center leading-tight">{value}</span>
    <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">{label}</span>
  </div>
);

export default RecipeDetail;
