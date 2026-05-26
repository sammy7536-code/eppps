import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { parseSiblingTimeline, Sibling } from '../utils';
import { FileText, Save, X, Calendar, Activity, Phone, MapPin, Briefcase, Plus } from 'lucide-react';

interface StudentExtraInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  initialExtraData: Student;
  onSave: (updatedData: Student) => void;
}

export default function StudentExtraInfoModal({
  isOpen,
  onClose,
  studentName,
  initialExtraData,
  onSave,
}: StudentExtraInfoModalProps) {
  const [isDispense, setIsDispense] = useState(false);
  const [adresse, setAdresse] = useState('');
  const [tel, setTel] = useState('');
  const [metier, setMetier] = useState('');
  const [sante, setSante] = useState('');
  const [freres, setFreres] = useState<number | string>(0);
  const [birthdates, setBirthdates] = useState('');

  useEffect(() => {
    if (isOpen && initialExtraData) {
      setIsDispense(!!initialExtraData.isDispense);
      setAdresse(initialExtraData.adresse || '');
      setTel(initialExtraData.tel || '');
      setMetier(initialExtraData.metier || '');
      setSante(initialExtraData.sante || '');
      setFreres(initialExtraData.freres !== undefined ? initialExtraData.freres : 0);
      setBirthdates(initialExtraData.birthdates || '');
    }
  }, [isOpen, initialExtraData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...initialExtraData,
      isDispense,
      adresse,
      tel,
      metier,
      sante,
      freres: Number(freres) || 0,
      birthdates,
    });
  };

  const parsedTimeline = parseSiblingTimeline(birthdates);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[92vh] shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Dossier de : <span className="text-emerald-700 font-extrabold">{studentName}</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200/50 text-gray-500 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 font-sans">
          
          {/* Practice Exemption Checkbox */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/60 shadow-xs">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDispense}
                onChange={(e) => setIsDispense(e.target.checked)}
                className="w-5 h-5 rounded-sm border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-amber-900">
                Élève dispensé à l'année (Pratique)
              </span>
            </label>
            <span className="block text-xs font-normal text-amber-700 mt-1 pl-8">
              Cocher cette case désactive l'évaluation pratique (D) durant toutes les sessions sportives.
            </span>
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> Adresse :
              </label>
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="Ex: Rue de Fès, N°12..."
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> Tél. Tuteur :
              </label>
              <input
                type="text"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder="Ex: 0612345678..."
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-gray-400" /> Métier du père / mère / autre :
              </label>
              <input
                type="text"
                value={metier}
                onChange={(e) => setMetier(e.target.value)}
                placeholder="Ex: Enseignant, Fonctionnaire..."
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-gray-400" /> Problèmes de santé :
              </label>
              <textarea
                value={sante}
                onChange={(e) => setSante(e.target.value)}
                placeholder="Aucun signalé..."
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                  Nb de frères / sœurs :
                </label>
                <input
                  type="number"
                  value={freres}
                  onChange={(e) => setFreres(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Dates de naissance :
              </label>
              <span className="block text-[11px] text-gray-500 mb-1.5 leading-relaxed">
                Entrez les dates formatées pour l'élève (<strong>E</strong>), frères (<strong>G</strong>), sœurs (<strong>F</strong>). Une par ligne.
                <br />Exemple: <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-mono text-[10px]">E: 12/04/2014</code> ou <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-mono text-[10px]">F: 22/11/2012</code>
              </span>
              <textarea
                value={birthdates}
                onChange={(e) => setBirthdates(e.target.value)}
                placeholder="E: 12/04/2014&#10;F: 05/08/2018&#10;G: 22/11/2012"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[70px]"
              />
            </div>
          </div>

          {/* Sibling Chronology Flow Preview */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Chronologie de la fratrie (du plus jeune au plus âgé)
            </h4>
            
            <div className="pt-1.5">
              {typeof parsedTimeline === 'string' ? (
                <p className="text-xs text-gray-400 italic font-medium">{parsedTimeline}</p>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  {parsedTimeline.map((item, idx) => {
                    let badgeClass = '';
                    let label = '';
                    if (item.role === 'E') {
                      badgeClass = 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200';
                      label = 'Élève (E)';
                    } else if (item.role === 'F') {
                      badgeClass = 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200';
                      label = 'Sœur (F)';
                    } else if (item.role === 'G') {
                      badgeClass = 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200';
                      label = 'Frère (G)';
                    }

                    return (
                      <React.Fragment key={idx}>
                        <div className={`px-2.5 py-1 text-xs font-bold rounded-full border shadow-2xs flex items-center gap-1 transition-all ${badgeClass}`}>
                          <span>{label}</span>
                          <span className="opacity-80 font-normal">({item.age} ans)</span>
                        </div>
                        {idx < parsedTimeline.length - 1 && (
                          <span className="text-gray-400 font-extrabold text-sm mx-0.5">➔</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 transition-colors rounded-xl text-sm font-medium text-gray-800 cursor-pointer"
          >
            Annuler
          </button>
          
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-xl text-sm font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Enregistrer le dossier
          </button>
        </div>

      </div>
    </div>
  );
}
