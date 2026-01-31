
import React, { useState, useEffect, useCallback } from 'react';
import Home from './components/Home';
import Scanner from './components/Scanner';
import Profile from './components/Profile';
import RecipeDetail from './components/RecipeDetail';
import Navigation from './components/Navigation';
import { ViewType, Recipe } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('HOME');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  // Load saved recipes from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('savedRecipes');
    if (stored) {
      try {
        setSavedRecipes(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load saved recipes", e);
      }
    }
  }, []);

  // Sync to local storage with robust error handling for QuotaExceededError
  useEffect(() => {
    if (savedRecipes.length > 0) {
      try {
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
      } catch (e) {
        console.error("Local storage sync failed (likely quota exceeded due to large base64 images):", e);
        // Note: We don't throw an error to prevent the UI from breaking. 
        // The data persists in memory for the current session.
      }
    }
  }, [savedRecipes]);

  const toggleSaveRecipe = useCallback((recipe: Recipe) => {
    setSavedRecipes(prev => {
      const exists = prev.find(r => r.id === recipe.id || r.title === recipe.title);
      if (exists) {
        return prev.filter(r => r.id !== recipe.id && r.title !== recipe.title);
      } else {
        return [...prev, { ...recipe, isSaved: true }];
      }
    });
  }, []);

  const handleSaveAllFromScanner = useCallback((recipes: Recipe[]) => {
    setSavedRecipes(prev => {
      const prevTitles = new Set(prev.map(p => p.title.toLowerCase()));
      const newOnly = recipes.filter(r => !prevTitles.has(r.title.toLowerCase())).map(r => ({ ...r, isSaved: true }));
      const newState = [...prev, ...newOnly];
      
      // Attempt immediate sync to catch errors early
      try {
        localStorage.setItem('savedRecipes', JSON.stringify(newState));
      } catch (e) {
        console.warn("Could not persist all recipes to LocalStorage (too much image data). They remain in memory for this session.");
      }
      
      return newState;
    });
    
    // Switch view after state update
    requestAnimationFrame(() => {
      setView('FAVORITES');
    });
  }, []);

  const renderContent = () => {
    switch (view) {
      case 'HOME':
        return <Home onSelectRecipe={setSelectedRecipe} />;
      case 'SCAN':
        return <Scanner 
          onRecipesFound={(recipes) => setSelectedRecipe(recipes[0])} 
          onSaveAll={handleSaveAllFromScanner}
        />;
      case 'PROFILE':
        return <Profile />;
      case 'FAVORITES':
        return (
          <div className="p-6 pt-16 pb-32 space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase">Saved 🔖</h2>
                <p className="text-white/40 text-sm font-medium">Your private culinary collection</p>
              </div>
              <span className="text-[10px] bg-[#FF2D55] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-lg shadow-[#FF2D55]/10">{savedRecipes.length} Total</span>
            </div>
            {savedRecipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6 opacity-30">
                <div className="text-7xl">📖</div>
                <div className="space-y-1">
                  <p className="text-xl font-bold">Nothing here yet</p>
                  <p className="text-sm">Scan your fridge to fill up your list!</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {savedRecipes.map(recipe => (
                  <div 
                    key={recipe.id} 
                    className="relative rounded-[40px] overflow-hidden aspect-[4/3] shadow-2xl group cursor-pointer border border-white/5"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <img src={recipe.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8">
                      <span className="text-[10px] bg-[#FF2D55] px-2 py-0.5 rounded-md text-white font-black uppercase tracking-widest mb-2 inline-block">{recipe.category}</span>
                      <h3 className="text-2xl font-black tracking-tight leading-tight">{recipe.title}</h3>
                      <div className="flex gap-4 text-xs font-black mt-2 text-white/60 uppercase tracking-widest">
                         <span className="flex items-center gap-1">🔥 {recipe.calories} kcal</span>
                         <span className="flex items-center gap-1">⚡ {recipe.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return <Home onSelectRecipe={setSelectedRecipe} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col font-sans">
      <main className="flex-1 w-full max-w-[450px] mx-auto bg-black shadow-[0_0_100px_rgba(0,0,0,0.8)] min-h-screen custom-scrollbar relative">
        {renderContent()}

        {selectedRecipe && (
          <RecipeDetail 
            recipe={selectedRecipe} 
            onBack={() => setSelectedRecipe(null)}
            onToggleSave={toggleSaveRecipe}
            isSaved={!!savedRecipes.find(r => r.id === selectedRecipe.id || r.title === selectedRecipe.title)}
          />
        )}
      </main>

      <Navigation currentView={view} setView={(v) => { setView(v); setSelectedRecipe(null); }} />
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        body { background: #050505; }
      `}</style>
    </div>
  );
};

export default App;
