import React from 'react';
import { Student } from '../types';
import { parseSiblingTimeline } from '../utils';
import { X, FileText, Phone, MapPin, Briefcase, Activity, Calendar } from 'lucide-react';

interface StudentDetailViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export default function StudentDetailViewModal({
  isOpen,
  onClose,
  student,
}: StudentDetailViewModalProps) {
  if (!isOpen || !student) return null;

  const parsedTimeline = parseSiblingTimeline(student.birthdates);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col max-h-[90vh] shadow-xl overflow-hidden border border-gray-100 font-sans">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Fiche de : <span className="text-indigo-700 font-extrabold">{student.name}</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200/50 text-gray-500 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {student.isDispense && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                ⚠️ Élève dispensé de pratique à l'année
              </span>
            </div>
          )}

          <div className="space-y-3.5">
            
            {/* Address */}
            <div className="flex items-start gap-3 bg-gray-50/50 border border-gray-100 p-3.5 rounded-xl">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Adresse :</span>
                <span className="text-sm font-semibold text-gray-900">{student.adresse || '—'}</span>
              </div>
            </div>

            {/* Tel */}
            <div className="flex items-start gap-3 bg-gray-50/50 border border-gray-100 p-3.5 rounded-xl">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Tél. Tuteur :</span>
                {student.tel ? (
                  <a href={`tel:${student.tel}`} className="text-sm font-bold text-indigo-600 hover:underline">{student.tel}</a>
                ) : (
                  <span className="text-sm font-semibold text-gray-900">—</span>
                )}
              </div>
            </div>

            {/* Profession */}
            <div className="flex items-start gap-3 bg-gray-50/50 border border-gray-100 p-3.5 rounded-xl">
              <Briefcase className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Métier du tuteur :</span>
                <span className="text-sm font-semibold text-gray-900">{student.metier || '—'}</span>
              </div>
            </div>

            {/* Sibling stats count */}
            <div className="flex items-start gap-3 bg-gray-50/50 border border-gray-100 p-3.5 rounded-xl">
              <div className="w-5 h-5 text-gray-400 mt-0.5 font-bold text-center">👨‍👩‍👦</div>
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre de frères / sœurs :</span>
                <span className="text-sm font-bold text-gray-900">{student.freres || '0'}</span>
              </div>
            </div>

            {/* Health alert */}
            <div className="flex items-start gap-3 bg-gray-50 border border-red-100 p-3.5 rounded-xl">
              <Activity className={`w-5 h-5 mt-0.5 shrink-0 ${student.sante ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
              <div>
                <span className="block text-xs font-bold text-gray-505 uppercase tracking-wider">Problèmes de santé :</span>
                {student.sante ? (
                  <span className="text-sm font-extrabold text-red-600">{student.sante}</span>
                ) : (
                  <span className="text-sm font-normal text-gray-500">Aucun signalé</span>
                )}
              </div>
            </div>

            {/* Sibling Chronology Flow Preview */}
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-2">
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Chronologie de la fratrie (du plus jeune au plus âgé) :
              </span>
              <div className="pt-1 select-none">
                {typeof parsedTimeline === 'string' ? (
                  <p className="text-xs text-gray-400 italic font-medium">{parsedTimeline}</p>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {parsedTimeline.map((item, idx) => {
                      let badgeClass = '';
                      let label = '';
                      if (item.role === 'E') {
                        badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                        label = 'E';
                      } else if (item.role === 'F') {
                        badgeClass = 'bg-pink-50 text-pink-700 border-pink-200';
                        label = 'F';
                      } else if (item.role === 'G') {
                        badgeClass = 'bg-sky-50 text-sky-700 border-sky-200';
                        label = 'G';
                      }

                      return (
                        <React.Fragment key={idx}>
                          <div className={`px-2 py-0.5 text-xs font-bold rounded-full border shadow-2xs flex items-center gap-1 ${badgeClass}`} title={`${label === 'E' ? 'Élève' : label === 'F' ? 'Sœur' : 'Frère'} né le ${item.dateStr}`}>
                            <span>{label === 'E' ? 'Élève (E)' : label === 'F' ? 'Sœur (F)' : 'Frère (G)'}</span>
                            <span className="opacity-80 font-normal">({item.age} ans)</span>
                          </div>
                          {idx < parsedTimeline.length - 1 && (
                            <span className="text-gray-400 font-extrabold text-xs mx-0.5">➔</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-sm shadow-indigo-100"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
