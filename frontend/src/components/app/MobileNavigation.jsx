import React from 'react';
import { Home, MessageSquare, Store, Train, Wrench } from 'lucide-react';

const tabs = [
  { view: 'home', label: 'Inicio', icon: Home },
  { view: 'market', label: 'Comercio', icon: Store },
  { view: 'caja-herramientas', label: 'Herramientas', icon: Wrench },
  { view: 'cercanias', label: 'Trenes', icon: Train },
  { view: 'conso', label: 'Conso IA', icon: MessageSquare },
];

export default function MobileNavigation({ currentView, onNavigate }) {
  const activeView = currentView === 'hosteleria' ? 'market' : currentView;
  return (
    <nav className="mobile-navigation lg:hidden" aria-label="Navegación inferior">
      <div className="mobile-navigation__inner">
        {tabs.map(({ view, label, icon: Icon }) => (
          <button key={view} type="button" aria-current={view === activeView ? 'page' : undefined} onClick={() => onNavigate(view)}>
            <Icon size={21} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
