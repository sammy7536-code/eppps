import React from 'react';
import { Users, BookOpen, ChevronRight, Award } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: 'dashboard' | 'classes' | 'journal') => void;
  classesCount: number;
  journalsCount: number;
}

export default function DashboardView({
  onNavigate,
  classesCount,
  journalsCount,
}: DashboardViewProps) {
  return (
    <div className="w-full flex flex-col justify-center items-center py-6 px-4 space-y-8 font-sans max-w-2xl mx-auto">
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-6 w-full">
        {/* Gestion des Classes Card */}
        <button
          onClick={() => onNavigate('classes')}
          className="group text-left bg-white rounded-2xl p-6 border border-gray-150 shadow-sm hover:shadow-md hover:border-sky-500/80 transition-all flex items-start gap-4 cursor-pointer relative overflow-hidden active:scale-[0.98]"
        >
          {/* Subtle colored accent strip */}
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-sky-500 rounded-l-2xl" />
          
          <div className="p-3.5 bg-sky-50 rounded-xl text-sky-600 transition-colors group-hover:bg-sky-100 group-hover:text-sky-700 shrink-0">
            <Users className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          
          <div className="flex-1 min-w-0 pr-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
              Gestion des Classes
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                {classesCount}
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Créer, modifier et importer vos listes d'élèves en un clic de manière fluide.
            </p>
          </div>
          
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-sky-500 transition-colors">
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </button>

        {/* Cahier Journalier Card */}
        <button
          onClick={() => onNavigate('journal')}
          className="group text-left bg-white rounded-2xl p-6 border border-gray-150 shadow-sm hover:shadow-md hover:border-indigo-500/80 transition-all flex items-start gap-4 cursor-pointer relative overflow-hidden active:scale-[0.98]"
        >
          {/* Subtle colored accent strip */}
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-indigo-500 rounded-l-2xl" />
          
          <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-700 shrink-0">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          
          <div className="flex-1 min-w-0 pr-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
              Cahier Journalier
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {journalsCount}
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Suivi professionnel des séances (TO-TB), gestion des dispensés et notation par APS.
            </p>
          </div>
          
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-indigo-500 transition-colors">
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </button>
      </div>

      {/* Stats Metric Panel */}
      <div className="grid grid-cols-2 gap-4 w-full pt-4">
        <div className="bg-white/60 backdrop-blur-xs rounded-xl border border-gray-150 p-4 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-xs transition-shadow">
          <span className="text-3xl font-extrabold text-sky-600 font-mono tracking-tight">{classesCount}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1.5">Classes créées</span>
        </div>
        
        <div className="bg-white/60 backdrop-blur-xs rounded-xl border border-gray-150 p-4 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-xs transition-shadow">
          <span className="text-3xl font-extrabold text-indigo-600 font-mono tracking-tight">{journalsCount}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1.5">Cycles Actifs</span>
        </div>
      </div>

      {/* Embedded PFF Stamp */}
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium px-4 py-2.5 rounded-full shadow-2xs select-none">
        <Award className="w-4 h-4 text-emerald-500" />
        <span>Projet de Fin de Formation validé • TICE EPS</span>
      </div>

    </div>
  );
}
