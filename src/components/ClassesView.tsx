import React, { useState } from 'react';
import { ClassItem, Student } from '../types';
import { ArrowLeft, Plus, Edit2, Users, FileText, Trash2, Check, X } from 'lucide-react';
import StudentModal from './StudentModal';

interface ClassesViewProps {
  onBack: () => void;
  classes: ClassItem[];
  onUpdateClasses: (nextClasses: ClassItem[]) => void;
}

export default function ClassesView({
  onBack,
  classes,
  onUpdateClasses,
}: ClassesViewProps) {
  // Add state for new class form
  const [newClassName, setNewClassName] = useState('');
  const [newStudentCount, setNewStudentCount] = useState('');

  // Modals controllers
  const [editingClassIdx, setEditingClassIdx] = useState<number | null>(null);

  // States for renaming a class directly in-app
  const [renamingIdx, setRenamingIdx] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newClassName.trim();
    const count = parseInt(newStudentCount, 10);

    if (!name) {
      alert("Veuillez donner un nom à la classe.");
      return;
    }
    if (isNaN(count) || count < 1) {
      alert("Le nombre d'élèves doit être au moins de 1 élève.");
      return;
    }

    const defaultStudents: Student[] = [];
    for (let i = 1; i <= count; i++) {
      defaultStudents.push({
        id: i,
        name: `Élève ${i}`,
        gender: 'M',
      });
    }

    const nextClasses = [...classes, { name, students: defaultStudents }];
    onUpdateClasses(nextClasses);

    // Reset fields
    setNewClassName('');
    setNewStudentCount('');
  };

  const handleDeleteClass = (index: number) => {
    if (confirm("Supprimer cette classe ?")) {
      const nextClasses = [...classes];
      nextClasses.splice(index, 1);
      onUpdateClasses(nextClasses);
    }
  };

  const handleStartRename = (index: number, currentName: string) => {
    setRenamingIdx(index);
    setRenameValue(currentName);
  };

  const handleSaveRename = (index: number) => {
    if (!renameValue.trim()) {
      alert("Le nom de la classe ne peut pas être vide.");
      return;
    }
    const nextClasses = [...classes];
    nextClasses[index].name = renameValue.trim();
    onUpdateClasses(nextClasses);
    setRenamingIdx(null);
  };

  const handleCancelRename = () => {
    setRenamingIdx(null);
  };

  // Student Group Modal Save handler
  const handleSaveStudents = (updatedStudents: Student[]) => {
    if (editingClassIdx === null) return;
    const nextClasses = [...classes];
    nextClasses[editingClassIdx].students = updatedStudents;
    onUpdateClasses(nextClasses);
    setEditingClassIdx(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-4 space-y-6 font-sans">
      
      {/* Back Link */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-bold text-sky-600 hover:text-sky-700 active:scale-95 transition-all cursor-pointer select-none"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au Tableau de Bord
      </button>

      {/* Ajouter classe Form card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Plus className="w-5 h-5 text-sky-600" />
          Ajouter une Nouvelle Classe
        </h2>

        <form onSubmit={handleCreateClass} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Nom de la classe (ex: 1APIC-1)
              </label>
              <input
                type="text"
                placeholder="Entrez le nom..."
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200 hover:border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-950 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Nombre d'élèves
              </label>
              <input
                type="number"
                min="1"
                placeholder="Ex: 36"
                value={newStudentCount}
                onChange={(e) => setNewStudentCount(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200 hover:border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-950 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-md shadow-sky-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Créer la Liste
          </button>
        </form>
      </div>

      {/* Mes classes card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          Mes Classes
        </h2>

        {classes.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
            Aucune classe créée pour le moment.
          </p>
        ) : (
          <div className="space-y-3.5">
            {/* Desktop Table Header (Visible only on sm screens and up) */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <div className="col-span-4">Classe</div>
              <div className="col-span-3">Élèves</div>
              <div className="col-span-5 text-right">Actions</div>
            </div>

            {/* Class Cards list */}
            <div className="space-y-3">
              {classes.map((cls, index) => (
                <div 
                  key={index}
                  className="bg-white border hover:border-gray-250 border-gray-150 rounded-2xl p-4 sm:p-3 sm:px-4 sm:grid sm:grid-cols-12 sm:items-center sm:gap-4 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden"
                >
                  {/* Title / Class Item Name */}
                  <div className="col-span-4 flex items-center gap-2 mb-2 sm:mb-0">
                    {renamingIdx === index ? (
                      <div className="flex items-center gap-1 w-full">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="flex-1 max-w-[130px] font-bold text-sm text-gray-950 border border-sky-400 focus:ring-2 focus:ring-sky-500 rounded-lg px-2 py-1 bg-white outline-hidden"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(index);
                            if (e.key === 'Escape') handleCancelRename();
                          }}
                        />
                        <button
                          onClick={() => handleSaveRename(index)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-extrabold text-gray-955 truncate leading-none py-1 block">
                          {cls.name}
                        </span>
                        <button
                          onClick={() => handleStartRename(index, cls.name)}
                          className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
                          title="Modifier le nom de la classe"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Pupil count info */}
                  <div className="col-span-3 text-sm font-semibold text-gray-500 mb-3 sm:mb-0 flex items-center gap-1">
                    <span className="inline-block sm:hidden text-xs font-bold uppercase tracking-wider text-gray-400">Effectif: </span>
                    <span className="text-indigo-600 bg-indigo-50/50 rounded-md px-1.5 py-0.5 text-xs font-extrabold">
                      {cls.students.length} élèves
                    </span>
                  </div>

                  {/* Class Level Actions Button Group */}
                  <div className="col-span-5 flex flex-row items-center justify-end gap-2 border-t border-gray-100 pt-3 sm:pt-0 sm:border-0">
                    <button
                      onClick={() => setEditingClassIdx(index)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Modifier Noms
                    </button>

                    <button
                      onClick={() => handleDeleteClass(index)}
                      className="p-2 hover:bg-red-50 text-red-500 hover:text-red-700 border border-gray-150 hover:border-red-150 rounded-xl transition-colors cursor-pointer shrink-0"
                      title="Supprimer la classe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Primary students editing Modal */}
      {editingClassIdx !== null && (
        <StudentModal
          isOpen={editingClassIdx !== null}
          onClose={() => setEditingClassIdx(null)}
          className={classes[editingClassIdx]?.name || ''}
          initialStudents={classes[editingClassIdx]?.students || []}
          onSave={handleSaveStudents}
        />
      )}

    </div>
  );
}
