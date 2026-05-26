import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { UserPlus, Save, X, Info } from 'lucide-react';
import StudentExtraInfoModal from './StudentExtraInfoModal';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  initialStudents: Student[];
  onSave: (students: Student[]) => void;
}

export default function StudentModal({
  isOpen,
  onClose,
  className,
  initialStudents,
  onSave,
}: StudentModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [importText, setImportText] = useState('');
  const [activeDossierStudentIdx, setActiveDossierStudentIdx] = useState<number | null>(null);

  // Sync state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      // Deep clone to prevent direct mutability before save
      setStudents(JSON.parse(JSON.stringify(initialStudents)));
      setImportText('');
      setActiveDossierStudentIdx(null);
    }
  }, [isOpen, initialStudents]);

  if (!isOpen) return null;

  const handleNameChange = (index: number, value: string) => {
    const next = [...students];
    next[index].name = value;
    setStudents(next);
  };

  const handleGenderChange = (index: number, value: 'M' | 'F') => {
    const next = [...students];
    next[index].gender = value;
    setStudents(next);
  };

  const handleProcessImport = () => {
    if (!importText.trim()) {
      alert("Collez des noms d'abord.");
      return;
    }

    const lines = importText.split('\n').map((l) => l.trim()).filter(Boolean);
    const updatedStudents = [...students];

    lines.forEach((name, i) => {
      if (updatedStudents[i]) {
        updatedStudents[i].name = name;
      } else {
        updatedStudents.push({
          id: updatedStudents.length + 1,
          name: name,
          gender: 'M',
        });
      }
    });

    setStudents(updatedStudents);
    setImportText('');
    alert(`${lines.length} noms ont été chargés.`);
  };

  const handleSave = () => {
    onSave(students);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-xl overflow-hidden border border-gray-100">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-sky-600" />
            Édition : <span className="text-sky-700">{className}</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200/50 text-gray-500 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Group Import Box */}
          <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-4.5 space-y-3">
            <label className="block text-sm font-semibold text-sky-950">
              Importation groupée :
              <span className="block text-xs font-normal text-sky-800 mt-0.5">
                Collez les noms (un par ligne) pour mettre à jour ou ajouter des élèves
              </span>
            </label>
            <textarea
              rows={3}
              className="w-full bg-white border border-sky-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 placeholder:text-gray-400 font-sans"
              placeholder="Mounir&#10;Safaa&#10;Yassine..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <button
              onClick={handleProcessImport}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              Appliquer l'import
            </button>
          </div>

          {/* Individual Students List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              Liste des élèves ({students.length})
            </h3>
            
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {students.map((student, idx) => (
                <div 
                  key={student.id || idx} 
                  className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100/70 border border-gray-100 rounded-xl transition-all"
                >
                  <span className="w-7 text-center font-bold text-gray-400 text-sm">
                    {idx + 1}
                  </span>
                  
                  {/* Name Input */}
                  <input
                    type="text"
                    value={student.name}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    placeholder={`Nom de l'élève ${idx + 1}...`}
                  />

                  {/* Gender Selector */}
                  <div className="relative">
                    <select
                      value={student.gender}
                      onChange={(e) => handleGenderChange(idx, e.target.value as 'M' | 'F')}
                      className="bg-white border border-gray-200 rounded-lg pl-2 pr-6 py-1.5 text-sm font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer appearance-none min-w-[55px]"
                    >
                      <option value="M">M</option>
                      <option value="F">F</option>
                    </select>
                    {/* Tiny custom arrow down indicator */}
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">
                      ▼
                    </div>
                  </div>

                  {/* File/Dossier Button */}
                  <button
                    onClick={() => setActiveDossierStudentIdx(idx)}
                    className="flex items-center justify-center gap-1 bg-gray-150 hover:bg-gray-200 text-gray-800 font-medium text-xs px-2.5 py-2 rounded-lg cursor-pointer transition-colors"
                    title="Dossier de l'élève"
                  >
                    <Info className="w-3.5 h-3.5 text-sky-600" />
                    <span className="hidden sm:inline">Dossier</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex flex-row items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 transition-colors rounded-xl text-sm font-medium text-gray-800 cursor-pointer"
          >
            Annuler
          </button>
          
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 transition-colors rounded-xl text-sm font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
        </div>

      </div>

      {/* Internal Dossier Modal to edit individual extra info in the draft slate */}
      {activeDossierStudentIdx !== null && (
        <StudentExtraInfoModal
          isOpen={activeDossierStudentIdx !== null}
          onClose={() => setActiveDossierStudentIdx(null)}
          studentName={students[activeDossierStudentIdx]?.name || ''}
          initialExtraData={students[activeDossierStudentIdx]}
          onSave={(updatedStudent) => {
            const next = [...students];
            next[activeDossierStudentIdx] = {
              ...next[activeDossierStudentIdx],
              ...updatedStudent,
            };
            setStudents(next);
            setActiveDossierStudentIdx(null);
            alert("Dossier élève mis à jour !");
          }}
        />
      )}
    </div>
  );
}
