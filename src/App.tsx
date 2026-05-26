import { useState, useEffect } from 'react';
import { ClassItem, JournalCycle } from './types';
import DashboardView from './components/DashboardView';
import ClassesView from './components/ClassesView';
import JournalView from './components/JournalView';
import { BookOpen, Award } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'classes' | 'journal'>('dashboard');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [journals, setJournals] = useState<JournalCycle[]>([]);

  // Hydrate persistence from localStorage on startup
  useEffect(() => {
    try {
      const storedClasses = localStorage.getItem('ListeClasses');
      if (storedClasses) {
        setClasses(JSON.parse(storedClasses));
      }
    } catch (e) {
      console.error("Error reading Classes from local storage", e);
    }

    try {
      const storedJournals = localStorage.getItem('CahiersJournaux');
      if (storedJournals) {
        setJournals(JSON.parse(storedJournals));
      }
    } catch (e) {
      console.error("Error reading Journals from local storage", e);
    }
  }, []);

  // Sync utilities back to localStorage
  const handleUpdateClasses = (nextClasses: ClassItem[]) => {
    setClasses(nextClasses);
    localStorage.setItem('ListeClasses', JSON.stringify(nextClasses));
  };

  const handleUpdateJournals = (nextJournals: JournalCycle[]) => {
    setJournals(nextJournals);
    localStorage.setItem('CahiersJournaux', JSON.stringify(nextJournals));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-150 selection:text-indigo-900">
      
      {/* Universal Header Bar */}
      <header className="bg-slate-900 text-white w-full py-8 px-4 text-center shadow-md relative overflow-hidden shrink-0">
        {/* Subtle decorative vector background */}
        <div className="absolute inset-0 bg-radial-[circle_at_top_right] from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="max-w-2xl mx-auto space-y-2 relative z-10">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            TICE EPS - PFF
          </h1>
          <p className="text-sm font-semibold text-slate-300 tracking-wider uppercase">
            Gestion Numérique de l'Évaluation
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest text-[#55efc4] backdrop-blur-xs select-none">
            <span className="w-2 h-2 rounded-full bg-[#55efc4] animate-pulse" />
            EPS DIGITAL ECOSYSTEM
          </div>
        </div>
      </header>

      {/* Primary Dynamic Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        {view === 'dashboard' && (
          <DashboardView
            onNavigate={(nextView) => setView(nextView)}
            classesCount={classes.length}
            journalsCount={journals.length}
          />
        )}

        {view === 'classes' && (
          <ClassesView
            onBack={() => setView('dashboard')}
            classes={classes}
            onUpdateClasses={handleUpdateClasses}
          />
        )}

        {view === 'journal' && (
          <JournalView
            onBack={() => setView('dashboard')}
            classes={classes}
            journals={journals}
            onUpdateJournals={handleUpdateJournals}
          />
        )}
      </main>

      {/* Footer Details */}
      <footer className="w-full text-center py-5 border-t border-slate-200/60 bg-white shrink-0">
        <p className="text-xs font-semibold text-slate-400">
          © 2026 - Projet de Fin de Formation EPS • Solution Numérique Mobile
        </p>
      </footer>

    </div>
  );
}
