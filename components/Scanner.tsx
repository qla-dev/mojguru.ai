
import React, { useState, useRef, useEffect } from 'react';
import { identifyIngredientsFromImage, generateThreeRecipeSuggestions, generateMealImage } from '../services/geminiService';
import { Recipe, MealPreferences } from '../types';

interface ScannerProps {
  onRecipesFound: (recipes: Recipe[]) => void;
  onSaveAll: (recipes: Recipe[]) => void;
}

type ScanStep = 'idle' | 'identifying' | 'detected' | 'preferences' | 'generating' | 'results';

const IonIcon = 'ion-icon' as any;

const LOADING_PHRASES = [
  "Chef Gemini is sharpening the knives... 🔪",
  "Analyzing textures and flavors... 👅",
  "Whipping up something special... 🥣",
  "Plating the perfect gourmet meal... ✨",
  "Generating realistic meal previews... 🖼️",
  "Finalizing nutritional balance... ⚖️"
];

const LOADING_ICONS = ['👩‍🍳', '🍳', '🍲', '🥗', '🔪', '🍕', '🍤', '🥐', '🍰'];

const Scanner: React.FC<ScannerProps> = ({ onRecipesFound, onSaveAll }) => {
  const [image, setImage] = useState<string | null>(null);
  const [step, setStep] = useState<ScanStep>('idle');
  const [statusIdx, setStatusIdx] = useState(0);
  const [iconIdx, setIconIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [visibleIngredients, setVisibleIngredients] = useState<string[]>([]);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  
  const [prefs, setPrefs] = useState<MealPreferences>({
    mealType: 'Lunch',
    diet: 'Everything',
    difficulty: 'Simple',
    calorieRange: '400-700'
  });

  const [calVal, setCalVal] = useState(1); // 0: <400, 1: 400-700, 2: 700+

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (['identifying', 'generating', 'detected'].includes(step)) {
      interval = setInterval(() => {
        setStatusIdx(prev => (prev + 1) % LOADING_PHRASES.length);
        setIconIdx(prev => (prev + 1) % LOADING_ICONS.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    let interval: any;
    if (step === 'identifying' || step === 'generating') {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => (prev < 95 ? prev + Math.random() * 4 : prev));
      }, 150);
    } else if (step === 'results' || step === 'detected') {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (step === 'detected' && detectedIngredients.length > 0) {
      setVisibleIngredients([]);
      let index = 0;
      const interval = setInterval(() => {
        if (index < detectedIngredients.length) {
          setVisibleIngredients(prev => [...prev, detectedIngredients[index]]);
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => setStep('preferences'), 2500);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [step, detectedIngredients]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [visibleIngredients]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setImage(base64);
        startScan(base64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const startScan = async (base64Clean: string) => {
    setGeneratedRecipes([]);
    setDetectedIngredients([]);
    setVisibleIngredients([]);
    setStep('identifying');
    try {
      const ingredients = await identifyIngredientsFromImage(base64Clean);
      if (ingredients.length === 0) throw new Error("No items");
      setDetectedIngredients(ingredients);
      setStep('detected');
    } catch (e) {
      resetScanner();
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    setStep('generating');
    
    const calorieRanges = ['< 400', '400-700', '700 +'];
    const finalPrefs = { ...prefs, calorieRange: calorieRanges[calVal] };

    try {
      const aiRecipes = await generateThreeRecipeSuggestions(detectedIngredients, finalPrefs);
      
      const recipesWithPhotos = await Promise.all(aiRecipes.map(async (r: any) => {
        let mealPhoto = image; // fallback
        try {
          mealPhoto = await generateMealImage(r.title, r.ingredients);
        } catch (err) {
          console.error("Meal image generation failed for", r.title, err);
        }
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          title: r.title,
          image: mealPhoto,
          time: Math.random() > 0.5 ? '20min' : '45min',
          calories: r.calories,
          fat: r.fat,
          carbs: r.carbs,
          protein: r.protein,
          rating: 4.5 + Math.random() * 0.5,
          reviews: Math.floor(Math.random() * 100),
          ingredients: r.ingredients,
          directions: r.directions,
          category: r.category || 'AI Select',
          isSaved: false
        };
      }));

      setGeneratedRecipes(recipesWithPhotos);
      setStep('results');
    } catch (e) {
      console.error("Generation failed", e);
      resetScanner();
    }
  };

  const resetScanner = () => {
    setStep('idle');
    setImage(null);
    setDetectedIngredients([]);
    setVisibleIngredients([]);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="relative h-screen bg-black flex flex-col text-white overflow-hidden">
      <div className="bg-white text-black p-3 flex justify-between items-center text-[12px] sticky top-0 z-[100]">
        <p className="pl-2 font-medium">We have updated our <span className="text-blue-600">Terms of Service</span></p>
        <button className="bg-white border border-gray-300 rounded-lg px-4 py-1.5 font-bold" onClick={resetScanner}>Dismiss</button>
      </div>

      <div className="flex-1 flex flex-col bg-black overflow-hidden relative">
        {step === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-fade-in space-y-12">
             <div className="relative">
               <div className="absolute inset-0 bg-[#FF2D55]/20 blur-3xl animate-pulse rounded-full"></div>
               <div className="relative w-48 h-48 rounded-full bg-neutral-900 flex items-center justify-center text-7xl shadow-2xl border border-white/5">👨‍🍳</div>
             </div>
             <div className="space-y-4">
                <h2 className="text-4xl font-black tracking-tighter">Chef's Eye 👁️</h2>
                <p className="text-white/40 text-sm max-w-[260px]">Snap or upload your ingredients to get AI-powered recipes.</p>
             </div>
             <div className="w-full max-w-xs pt-4">
               <button 
                 onClick={() => fileInputRef.current?.click()} 
                 className="w-full py-6 bg-[#FF2D55] rounded-[30px] font-black text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
               >
                 <IonIcon name="add-circle-outline" style={{fontSize: '24px'}}></IonIcon>
                 Add Photo
               </button>
             </div>
             <input 
               type="file" 
               accept="image/*" 
               ref={fileInputRef} 
               className="hidden" 
               onChange={handleFileChange} 
             />
          </div>
        )}

        {(step === 'identifying' || step === 'detected' || step === 'generating') && (
          <div className="flex-1 flex flex-col items-center animate-fade-in overflow-hidden">
            <div className="w-full pt-16 pb-8 flex flex-col items-center flex-shrink-0 z-20">
              <div className="relative w-60 h-60 flex items-center justify-center">
                 <div className="absolute inset-0 bg-[#FF2D55]/10 blur-[80px] animate-pulse rounded-full"></div>
                 <svg className="absolute w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-white/5" />
                   <circle cx="50" cy="50" r="46" stroke="#FF2D55" strokeWidth="5" fill="transparent" strokeDasharray="289" strokeDashoffset={289 - (289 * progress / 100)} className="transition-all duration-700 ease-out" strokeLinecap="round" />
                 </svg>
                 <div className="relative flex flex-col items-center text-center">
                   <span className="text-6xl">{LOADING_ICONS[iconIdx]}</span>
                   <span className="text-xl font-black text-[#FF2D55] mt-2 tabular-nums">{Math.round(progress)}%</span>
                 </div>
              </div>
              <div className="mt-10 text-center px-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF2D55] mb-2">Analysis Active ⚡</h3>
                <p className="text-sm font-medium text-white/60 italic animate-slide-up h-6">{LOADING_PHRASES[statusIdx]}</p>
              </div>
            </div>

            <div ref={scrollRef} className="w-full flex-1 overflow-y-auto px-8 pb-32 space-y-4 custom-scrollbar">
              {visibleIngredients.map((ing, i) => (
                <div key={i} className="w-full flex items-center gap-5 bg-neutral-900/50 backdrop-blur-md border border-white/5 p-5 rounded-[28px] animate-item-pop-in shadow-xl">
                  <div className="w-8 h-8 rounded-full bg-[#FF2D55] flex items-center justify-center flex-shrink-0 animate-checkmark-bounce">
                    <IonIcon name="checkmark-sharp" className="text-white text-sm"></IonIcon>
                  </div>
                  <span className="text-[15px] font-bold tracking-tight text-white/90">{ing}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'preferences' && (
          <div className="flex-1 overflow-y-auto px-8 pt-16 pb-32 space-y-12 animate-fade-in custom-scrollbar">
            <div className="text-center space-y-3">
              <h3 className="text-4xl font-black tracking-tighter uppercase">Menu Setup 🥣</h3>
              <p className="text-white/30 text-sm font-medium">Fine-tune your personal chef.</p>
            </div>
            
            <div className="space-y-10">
              <PrefSection 
                label="Meal Type 🍱" 
                options={['Lunch 🍱', 'Dinner 🌙', 'Breakfast 🍳', 'Cake 🍰', 'Snack 🍿']} 
                value={prefs.mealType} 
                onChange={(v) => setPrefs({...prefs, mealType: v.split(' ')[0]})} 
              />
              
              <PrefSection 
                label="Preference 🥗" 
                options={['Everything 🌎', 'Healthy 🥗', 'Keto 🥩', 'Vegan 🌿']} 
                value={prefs.diet} 
                onChange={(v) => setPrefs({...prefs, diet: v.split(' ')[0]})} 
              />
              
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Calorie Target 🔥</p>
                  <span className="text-[11px] font-black text-[#FF2D55] uppercase tracking-widest">
                    {['< 400', '400-700', '700 +'][calVal]} kcal
                  </span>
                </div>
                <div className="px-4 relative py-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="2" 
                    step="1" 
                    value={calVal} 
                    onChange={(e) => setCalVal(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-[#FF2D55] border border-white/5"
                  />
                  <div className="flex justify-between mt-4 px-1">
                    <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Low 🔥</span>
                    <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Medium 🔥🔥</span>
                    <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Bulk 🔥🔥🔥</span>
                  </div>
                </div>
              </div>

              <PrefSection 
                label="Effort ⚡" 
                options={['Quick ⚡', 'Expert 👨‍🍳']} 
                value={prefs.difficulty} 
                onChange={(v) => setPrefs({...prefs, difficulty: v.split(' ')[0]})} 
              />
            </div>

            <div className="pt-6 space-y-4">
               <button onClick={handleGenerate} className="w-full py-6 bg-[#FF2D55] rounded-[30px] font-black text-xl shadow-2xl active:scale-95 transition-all">Generate My Recipes ✨</button>
               <button onClick={resetScanner} className="w-full py-4 text-white/20 text-[10px] font-black uppercase tracking-widest">Restart Session 🔄</button>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="flex-1 overflow-y-auto p-6 pt-16 pb-32 space-y-8 animate-fade-in custom-scrollbar">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-3xl font-black tracking-tighter">Results 🍱</h3>
              <button 
                onClick={() => onSaveAll(generatedRecipes)} 
                className="bg-[#FF2D55] px-6 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-xl"
              >
                Save All ✅
              </button>
            </div>
            <div className="space-y-6">
              {generatedRecipes.map((r, i) => (
                <div key={r.id} className="bg-neutral-900/60 border border-white/5 rounded-[40px] p-6 flex items-center gap-6 cursor-pointer hover:bg-neutral-800 transition-all group animate-fade-in" onClick={() => onRecipesFound([r])} style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 shadow-2xl">
                    <img src={r.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[#FF2D55] text-[9px] font-black uppercase tracking-[0.2em]">{r.category}</span>
                    <h4 className="text-lg font-black truncate text-white/90 mb-2">{r.title}</h4>
                    <div className="flex gap-4 text-[10px] font-black text-white/30 uppercase"><span>🔥 {r.calories}</span> <span>⚡ {r.time}</span></div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={resetScanner} className="w-full py-10 text-white/10 font-black text-[11px] uppercase tracking-[0.3em]">← New Scan 📸</button>
          </div>
        )}
      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #FF2D55;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(255, 45, 85, 0.4);
          border: 4px solid #000;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes itemPopIn { from { opacity: 0; transform: translateX(-15px) scale(0.95); } to { opacity: 1; transform: translateX(0) scale(1); } }
        .animate-item-pop-in { animation: itemPopIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

const PrefSection = ({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (v: string) => void }) => (
  <div className="space-y-4">
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">{label}</p>
    <div className="grid grid-cols-2 gap-3">
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} className={`py-4 px-2 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all border ${value === opt.split(' ')[0] ? 'bg-[#FF2D55] border-transparent shadow-xl' : 'bg-neutral-900 border-white/5 text-white/30'}`}>{opt}</button>
      ))}
    </div>
  </div>
);

export default Scanner;
