
import React from 'react';
import { ViewType } from '../types';

interface NavigationProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

// Fix: Use a local constant with any casting to avoid polluting the global JSX namespace
// which was shadowing standard HTML elements like div, button, etc.
const IonIcon = 'ion-icon' as any;

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'HOME' as ViewType, icon: 'home', iconOutline: 'home-outline' },
    { id: 'SCAN' as ViewType, icon: 'camera', iconOutline: 'camera-outline' },
    { id: 'FAVORITES' as ViewType, icon: 'bookmark', iconOutline: 'bookmark-outline' },
    { id: 'PROFILE' as ViewType, icon: 'person', iconOutline: 'person-outline' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-[32px] py-4 px-8 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50">
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center justify-center transition-all duration-300 transform ${
              isActive ? 'scale-110 text-[#FF2D55]' : 'text-white/40 hover:text-white/80'
            }`}
          >
            <IonIcon 
              name={isActive ? item.icon : item.iconOutline} 
              style={{ fontSize: '28px' }}
            ></IonIcon>
          </button>
        );
      })}
    </div>
  );
};

export default Navigation;
