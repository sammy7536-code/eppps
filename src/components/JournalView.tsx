import React, { useState, useEffect } from 'react';
import { ClassItem, JournalCycle, Student } from '../types';
import { calculateAthleNote, parseSiblingTimeline } from '../utils';
import { apsDetails } from '../data';
import { ArrowLeft, BookOpen, Clock, Plus, Trash2, Eye, Calendar, Award, User, Settings, Info, AlertTriangle } from 'lucide-react';
import StudentDetailViewModal from './StudentDetailViewModal';

interface JournalViewProps {
  onBack: () => void;
  classes: ClassItem[];
  journals: JournalCycle[];
  onUpdateJournals: (nextJournals: JournalCycle[]) => void;
}

export default function JournalView({
  onBack,
  classes,
  journals,
  onUpdateJournals,
}: JournalViewProps) {
  // Navigation inside journals
  const [activeCycleIdx, setActiveCycleIdx] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterClass, setFilterClass] = useState('all');

  // Form states for creating a new cycle
  const [selectedClassIdx, setSelectedClassIdx] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'1AC' | '2AC' | '3AC'>('1AC');
  const [selectedApsCat, setSelectedApsCat] = useState<'collectif' | 'athle' | 'gym' | ''>('');
  const [selectedApsName, setSelectedApsName] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Selected student for detail popup modal inside active cycle
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Active list sorted as requested in old code:
  // Sort from most recent to oldest (dateStart descending, then creations descending)
  const getSortedJournals = () => {
    const items = journals.map((j, originalIdx) => ({ ...j, originalIdx }));
    let filtered = items;
    if (filterClass !== 'all') {
      filtered = items.filter((item) => item.className === filterClass);
    }

    filtered.sort((a, b) => {
      if (a.dateStart && b.dateStart) {
        return new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime() > 0 ? 1 : -1;
      }
      if (a.dateStart) return -1;
      if (b.dateStart) return 1;
      return b.originalIdx - a.originalIdx;
    });

    return filtered;
  };

  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClassIdx === '' || !selectedApsName || !dateStart || !dateEnd) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const classIdx = parseInt(selectedClassIdx, 10);
    const targetClass = classes[classIdx];
    if (!targetClass) return;

    const newCycle: JournalCycle = {
      className: targetClass.name,
      level: selectedLevel,
      apsCat: selectedApsCat as 'collectif' | 'athle' | 'gym',
      apsName: selectedApsName,
      dateStart,
      dateEnd,
      // clone copy of current students from targeted class
      students: JSON.parse(JSON.stringify(targetClass.students)),
      scores: {},
    };

    const nextJournals = [...journals, newCycle];
    onUpdateJournals(nextJournals);

    // Reset setup form
    setSelectedClassIdx('');
    setSelectedApsCat('');
    setSelectedApsName('');
    setDateStart('');
    setDateEnd('');
    setIsCreating(false);
  };

  const handleDeleteJournal = (originalIdx: number) => {
    if (confirm("Supprimer ce cahier ?")) {
      const nextJournals = [...journals];
      nextJournals.splice(originalIdx, 1);
      onUpdateJournals(nextJournals);
    }
  };

  // Sync / update students from class if updated in class panel (as in old prompt)
  const handleOpenCycle = (idx: number) => {
    const nextJournals = [...journals];
    const targetCycle = nextJournals[idx];
    
    // Find matching base class to keep student rosters aligned
    const baseClass = classes.find((c) => c.name === targetCycle.className);
    if (baseClass) {
      targetCycle.students = JSON.parse(JSON.stringify(baseClass.students));
      nextJournals[idx] = targetCycle;
      onUpdateJournals(nextJournals);
    }
    setActiveCycleIdx(idx);
  };

  const handleExitCycle = () => {
    setActiveCycleIdx(null);
  };

  // Status scoring system
  const statusStates = ["✓", "A", "R", "M", "M*", "ST", "NP", "EX"];
  const getStatusBadgeStyle = (status: string) => {
    if (status === "✓" || status === "-") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "A") return "bg-red-55 border-red-200 text-red-65"; // absence
    if (status === "R") return "bg-amber-100 border-amber-200 text-amber-700"; // retard
    if (status === "M") return "bg-sky-100 border-sky-200 text-sky-700"; // malade
    if (status === "M*") return "bg-teal-50 border-teal-200 text-teal-85"; // certifie
    if (status === "ST") return "bg-purple-100 border-purple-200 text-purple-700"; // stage
    if (status === "NP") return "bg-slate-100 border-slate-200 text-slate-700"; // non-participe
    if (status === "EX") return "bg-rose-100 border-rose-200 text-rose-700"; // exclu
    return "";
  };

  const cycleStatus = (sIdx: number, session: string) => {
    if (activeCycleIdx === null) return;
    const nextJournals = [...journals];
    const target = nextJournals[activeCycleIdx];
    const key = `${sIdx}_${session}`;
    const curVal = target.scores[key] || "✓";

    const nextVal = statusStates[(statusStates.indexOf(curVal) + 1) % statusStates.length];
    target.scores[key] = nextVal;
    
    nextJournals[activeCycleIdx] = target;
    onUpdateJournals(nextJournals);
  };

  const toggleSessionCancel = (session: string) => {
    if (activeCycleIdx === null) return;
    const nextJournals = [...journals];
    const target = nextJournals[activeCycleIdx];
    const key = `canceled_${session}`;
    target.scores[key] = !target.scores[key];
    
    nextJournals[activeCycleIdx] = target;
    onUpdateJournals(nextJournals);
  };

  const handleUpdateScoreInput = (sIdx: number, type: string, value: string, maxVal: number) => {
    if (activeCycleIdx === null) return;
    const nextJournals = [...journals];
    const target = nextJournals[activeCycleIdx];
    const key = `${sIdx}_${type}`;

    if (value === '') {
      target.scores[key] = '';
    } else {
      let numericVal = parseFloat(value);
      if (isNaN(numericVal)) return;
      if (numericVal < 0) numericVal = 0;
      if (numericVal > maxVal) numericVal = maxVal;
      target.scores[key] = numericVal.toString();
    }

    nextJournals[activeCycleIdx] = target;
    onUpdateJournals(nextJournals);
  };

  const handleUpdatePerformanceInput = (sIdx: number, value: string, level: string, apsName: string, gender: string) => {
    if (activeCycleIdx === null) return;
    const nextJournals = [...journals];
    const target = nextJournals[activeCycleIdx];

    target.scores[`${sIdx}_perf`] = value;

    const numericPerf = parseFloat(value);
    const calculatedProdVal = calculateAthleNote(numericPerf, level, apsName, gender);
    target.scores[`${sIdx}_n1`] = calculatedProdVal.toString();

    nextJournals[activeCycleIdx] = target;
    onUpdateJournals(nextJournals);
  };

  // --- Render Sections ---

  // ACTIVE JOURNAL SPREADSHEET CARD
  if (activeCycleIdx !== null) {
    const cycle = journals[activeCycleIdx];
    
    // Limits
    let label1 = "Note 1", label2 = "Note 2";
    let max1 = 6, max2 = 8, maxConc = 3;
    let maxComp = cycle.level === "1AC" ? 3 : cycle.level === "2AC" ? 4 : 5;

    if (cycle.apsCat === "collectif") {
      label1 = "Indiv.";
      label2 = "Coll.";
    } else if (cycle.apsCat === "athle") {
      label1 = "Prod.";
      label2 = "Proc.";
    }

    if (cycle.level === "2AC") max2 = 7;
    if (cycle.level === "3AC") max2 = 6;

    const sessions = ["TO", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "TB"];

    return (
      <div className="w-full max-w-6xl mx-auto py-4 px-4 space-y-5 font-sans">
        
        {/* Cycle Title Bar */}
        <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              <BookOpen className="w-3.5 h-3.5" />
              CYCLE ACTIF • Level {cycle.level}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-2 flex items-center gap-2 flex-wrap">
              {cycle.apsName}
              <span className="text-sm font-semibold text-gray-400 bg-gray-100 rounded-lg px-2 py-0.5 font-sans shrink-0">
                Classe: {cycle.className}
              </span>
            </h1>
            <p className="text-xs font-semibold text-gray-500 mt-1.5 flex items-center gap-1">
              📅 Période du {cycle.dateStart.split('-').reverse().join('/')} au {cycle.dateEnd.split('-').reverse().join('/')}
            </p>
          </div>

          <button
            onClick={handleExitCycle}
            className="w-full md:w-auto px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 bg-sky-950"
          >
            <ArrowLeft className="w-4 h-4 text-sky-400" />
            Fermer le cycle
          </button>
        </div>

        {/* Swipe Table Instructions (Seen on smaller mobile viewport widths) */}
        <div className="block lg:hidden bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-900 font-semibold text-center leading-relaxed">
          💡 Swipez de gauche à droite sur le tableau pour voir toutes les séances et de grilles de notation.
          <br />Appuyez sur un <strong className="text-indigo-700">Nom</strong> pour ouvrir la fiche de l'élève, et cliquez sur les en-têtes <strong className="text-indigo-750 font-mono">TO-TB</strong> pour annuler une séance.
        </div>

        {/* Master Ratings Matrix Frame */}
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden flex flex-col">
          
          <div className="overflow-x-auto w-full select-none">
            <table className="min-w-full divide-y divide-gray-150 text-xs border-collapse font-sans">
              
              <thead className="bg-gray-50/80">
                <tr className="divide-x divide-gray-150/70">
                  {/* Sticky left table name placeholder */}
                  <th scope="col" className="sticky left-0 bg-gray-100 font-extrabold text-[#374151] px-3.5 py-4 text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-30 min-w-[125px] max-w-[145px]">
                    Élève
                  </th>
                  
                  {/* Attendance sessions header */}
                  {sessions.map((sess) => {
                    const isCanceled = !!cycle.scores[`canceled_${sess}`];
                    return (
                      <th 
                        key={sess}
                        scope="col"
                        onClick={() => toggleSessionCancel(sess)}
                        className={`text-center font-bold px-2 py-3 cursor-pointer select-none transition-all outline-hidden shrink-0 whitespace-nowrap min-w-[50px]
                          ${isCanceled 
                            ? 'bg-amber-100 text-amber-805 hover:bg-amber-150 line-through' 
                            : 'text-gray-500 hover:bg-gray-200/55'
                          }
                        `}
                        title="Taper pour annuler cette séance"
                      >
                        {sess}
                      </th>
                    );
                  })}

                  {/* Rating Scales columns */}
                  <th scope="col" className="text-center font-extrabold text-gray-500 px-3 py-3 whitespace-nowrap min-w-[70px]">
                    Conc. (/{maxConc})
                  </th>

                  {cycle.apsCat === "athle" && (
                    <>
                      <th scope="col" className="text-center font-extrabold text-amber-800 bg-amber-50/30 px-3 py-3 whitespace-nowrap min-w-[80px]">
                        Perf.
                      </th>
                      <th scope="col" className="text-center font-extrabold text-gray-500 bg-gray-100/40 px-3 py-3 whitespace-nowrap min-w-[70px]">
                        {label1} (/{max1})
                      </th>
                      <th scope="col" className="text-center font-extrabold text-gray-500 px-3 py-3 whitespace-nowrap min-w-[70px]">
                        {label2} (/{max2})
                      </th>
                    </>
                  )}

                  {cycle.apsCat === "gym" && (
                    <th scope="col" className="text-center font-extrabold text-gray-500 px-3 py-3 whitespace-nowrap min-w-[85px]">
                      Gym (/{max1 + max2})
                    </th>
                  )}

                  {cycle.apsCat !== "athle" && cycle.apsCat !== "gym" && (
                    <>
                      <th scope="col" className="text-center font-extrabold text-gray-500 px-3 py-3 whitespace-nowrap min-w-[70px]">
                        {label1} (/{max1})
                      </th>
                      <th scope="col" className="text-center font-extrabold text-gray-500 px-3 py-3 whitespace-nowrap min-w-[70px]">
                        {label2} (/{max2})
                      </th>
                    </>
                  )}

                  <th scope="col" className="text-center font-extrabold text-gray-500 px-3 py-3 whitespace-nowrap min-w-[70px]">
                    Comp. (/{maxComp})
                  </th>

                  <th scope="col" className="text-center font-black text-emerald-800 bg-emerald-50 px-3.5 py-3 whitespace-nowrap min-w-[70px]">
                    Total
                  </th>
                </tr>
              </thead>

              {/* Rows List */}
              <tbody className="divide-y divide-gray-150 bg-white">
                {cycle.students.map((student, sIdx) => {
                  const isDisp = !!student.isDispense;

                  // Accumulate numeric scores for total rendering
                  const conc = parseFloat(cycle.scores[`${sIdx}_conc`]) || 0;
                  const n1 = parseFloat(cycle.scores[`${sIdx}_n1`]) || 0;
                  const n2 = parseFloat(cycle.scores[`${sIdx}_n2`]) || 0;
                  const comp = parseFloat(cycle.scores[`${sIdx}_comp`]) || 0;
                  const totalSum = conc + n1 + n2 + comp;

                  return (
                    <tr 
                      key={student.id || sIdx} 
                      className={`divide-x divide-gray-150/70 hover:bg-gray-50/70 transition-colors
                        ${isDisp ? 'bg-gray-50/40' : ''}
                      `}
                    >
                      {/* Interactive Student Name sticky */}
                      <td 
                        onClick={() => setViewingStudent(student)}
                        className="sticky left-0 bg-white hover:bg-indigo-50/50 text-indigo-600 hover:text-indigo-800 text-left font-bold px-3 py-3.5 hover:underline decoration-indigo-400 select-none cursor-pointer shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-20 truncate max-w-[125px]"
                        title="Taper pour regarder sa fiche"
                      >
                        {student.name}
                      </td>

                      {/* Attendances session ratings */}
                      {sessions.map((sess) => {
                        const isCanceled = !!cycle.scores[`canceled_${sess}`];
                        const key = `${sIdx}_${sess}`;
                        
                        let displayVal = cycle.scores[key] || "✓";
                        if (displayVal === "-") displayVal = "✓";

                        const customStyle = getStatusBadgeStyle(displayVal);

                        return (
                          <td 
                            key={sess} 
                            className={`text-center p-1 font-mono
                              ${isCanceled ? 'bg-amber-50/40' : ''}
                            `}
                          >
                            {isCanceled ? (
                              <span className="text-amber-500 font-extrabold text-[12px] select-none block py-1.5">—</span>
                            ) : isDisp ? (
                              <span className="text-gray-400 font-extrabold text-[12px] select-none block py-1.5">D</span>
                            ) : (
                              <button
                                onClick={() => cycleStatus(sIdx, sess)}
                                className={`w-9 h-9 border rounded-lg text-xs font-black transition-all select-none focus:outline-hidden cursor-pointer active:scale-95 shadow-2xs hover:shadow-xs hover:border-slate-350
                                  ${displayVal === "✓" ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                  ${displayVal !== "✓" ? customStyle : ''}
                                `}
                              >
                                {displayVal}
                              </button>
                            )}
                          </td>
                        );
                      })}

                      {/* Concours numeric cell */}
                      <td className="p-1.5 text-center">
                        <input
                          type="number"
                          step="0.25"
                          disabled={isDisp}
                          value={isDisp ? '0' : (cycle.scores[`${sIdx}_conc`] || '')}
                          placeholder="0-3"
                          onChange={(e) => handleUpdateScoreInput(sIdx, 'conc', e.target.value, maxConc)}
                          className={`w-14 text-center text-xs font-semibold px-1 py-1 px-1.5 py-1 rounded-md border text-gray-900 outline-hidden focus:ring-1 focus:ring-indigo-500 shrink-0
                            ${isDisp ? 'bg-gray-100 text-gray-400 border-gray-150' : 'bg-white border-gray-200'}
                          `}
                        />
                      </td>

                      {/* Cycle specific columns: Athletics vs Gymnastics vs Team category rules */}
                      {cycle.apsCat === "athle" && (
                        <>
                          {/* Performance Field */}
                          <td className="p-1.5 text-center bg-amber-50/10">
                            <input
                              type="number"
                              step="0.01"
                              disabled={isDisp}
                              value={isDisp ? '' : (cycle.scores[`${sIdx}_perf`] || '')}
                              placeholder="0.00"
                              onChange={(e) => handleUpdatePerformanceInput(sIdx, e.target.value, cycle.level, cycle.apsName, student.gender)}
                              className={`w-14 text-center text-xs font-bold px-1.5 py-1 rounded-md border text-amber-950 focus:ring-2 focus:ring-amber-500 outline-hidden shrink-0
                                ${isDisp ? 'bg-gray-100 text-gray-400 border-gray-150' : 'bg-amber-50 border-amber-305'}
                              `}
                            />
                          </td>

                          {/* Computed Read-Only Production Grade N1 */}
                          <td className="p-1.5 text-center bg-gray-50/50">
                            <input
                              type="number"
                              disabled
                              value={isDisp ? '0' : (cycle.scores[`${sIdx}_n1`] || '0')}
                              className="w-14 text-center text-xs font-extrabold px-1.5 py-1 rounded-md border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed outline-hidden"
                            />
                          </td>

                          {/* Process (N2, Technique) Field */}
                          <td className="p-1.5 text-center">
                            <input
                              type="number"
                              step="0.25"
                              disabled={isDisp}
                              value={isDisp ? '0' : (cycle.scores[`${sIdx}_n2`] || '')}
                              placeholder={`0-${max2}`}
                              onChange={(e) => handleUpdateScoreInput(sIdx, 'n2', e.target.value, max2)}
                              className={`w-14 text-center text-xs font-semibold px-1.5 py-1 rounded-md border text-gray-900 focus:ring-1 focus:ring-indigo-500 outline-hidden shrink-0
                                ${isDisp ? 'bg-gray-100 text-gray-400 border-gray-150' : 'bg-white border-gray-200'}
                              `}
                            />
                          </td>
                        </>
                      )}

                      {cycle.apsCat === "gym" && (
                        /* Rating Gymnastics out of max1+max2 saved under Key n1 */
                        <td className="p-1.5 text-center">
                          <input
                            type="number"
                            step="0.25"
                            disabled={isDisp}
                            value={isDisp ? '0' : (cycle.scores[`${sIdx}_n1`] || '')}
                            placeholder={`0-${max1 + max2}`}
                            onChange={(e) => handleUpdateScoreInput(sIdx, 'n1', e.target.value, max1 + max2)}
                            className={`w-16 text-center text-xs font-semibold px-1.5 py-1 rounded-md border text-gray-900 focus:ring-1 focus:ring-indigo-500 outline-hidden shrink-0
                              ${isDisp ? 'bg-gray-100 text-gray-400 border-gray-150' : 'bg-white border-gray-200'}
                            `}
                          />
                        </td>
                      )}

                      {cycle.apsCat !== "athle" && cycle.apsCat !== "gym" && (
                        <>
                          {/* Note 1 - Indiv */}
                          <td className="p-1.5 text-center">
                            <input
                              type="number"
                              step="0.25"
                              disabled={isDisp}
                              value={isDisp ? '0' : (cycle.scores[`${sIdx}_n1`] || '')}
                              placeholder={`0-${max1}`}
                              onChange={(e) => handleUpdateScoreInput(sIdx, 'n1', e.target.value, max1)}
                              className={`w-14 text-center text-xs font-semibold px-1.5 py-1 rounded-md border text-gray-900 focus:ring-1 focus:ring-indigo-500 outline-hidden shrink-0
                                ${isDisp ? 'bg-gray-100 text-gray-400 border-gray-150' : 'bg-white border-gray-200'}
                              `}
                            />
                          </td>

                          {/* Note 2 - Coll */}
                          <td className="p-1.5 text-center">
                            <input
                              type="number"
                              step="0.25"
                              disabled={isDisp}
                              value={isDisp ? '0' : (cycle.scores[`${sIdx}_n2`] || '')}
                              placeholder={`0-${max2}`}
                              onChange={(e) => handleUpdateScoreInput(sIdx, 'n2', e.target.value, max2)}
                              className={`w-14 text-center text-xs font-semibold px-1.5 py-1 rounded-md border text-gray-900 focus:ring-1 focus:ring-indigo-500 outline-hidden shrink-0
                                ${isDisp ? 'bg-gray-100 text-gray-400 border-gray-150' : 'bg-white border-gray-200'}
                              `}
                            />
                          </td>
                        </>
                      )}

                      {/* Competence grade box */}
                      <td className="p-1.5 text-center">
                        <input
                          type="number"
                          step="0.25"
                          disabled={isDisp}
                          value={isDisp ? '0' : (cycle.scores[`${sIdx}_comp`] || '')}
                          placeholder={`0-${maxComp}`}
                          onChange={(e) => handleUpdateScoreInput(sIdx, 'comp', e.target.value, maxComp)}
                          className={`w-14 text-center text-xs font-semibold px-1.5 py-1 rounded-md border text-gray-900 focus:ring-1 focus:ring-indigo-500 outline-hidden shrink-0
                            ${isDisp ? 'bg-gray-100 text-gray-400 border-gray-150' : 'bg-white border-gray-200'}
                          `}
                        />
                      </td>

                      {/* Total final summary cell */}
                      <td className="p-1.5 text-center bg-gray-50">
                        {isDisp ? (
                          <span className="text-[10px] uppercase font-extrabold text-[#9ca3af] bg-[#f3f4f6] px-1.5 py-1 rounded-md inline-block select-none scale-90 whitespace-nowrap">
                            DISP
                          </span>
                        ) : (
                          <span className="text-sm font-black text-emerald-700 font-mono block">
                            {totalSum.toFixed(2)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>

        </div>

        {/* Selected Student Detail Popup Modal inside Active Cycle table */}
        {viewingStudent !== null && (
          <StudentDetailViewModal
            isOpen={viewingStudent !== null}
            onClose={() => setViewingStudent(null)}
            student={viewingStudent}
          />
        )}

      </div>
    );
  }

  // CREATE NEW CYCLE DIALOG CARD
  if (isCreating) {
    return (
      <div className="w-full max-w-2xl mx-auto py-4 px-4 space-y-5 font-sans">
        
        {/* Navigation back */}
        <button
          onClick={() => setIsCreating(false)}
          className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au Cahier Journalier
        </button>

        {/* Setup card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-150 shadow-sm space-y-5">
          <div>
            <span className="text-xs font-extrabold text-indigo-65 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Nouveau Cycle
            </span>
            <h2 className="text-xl font-black text-gray-900 mt-2">
              Créer un nouveau cycle
            </h2>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Veuillez configurer la classe, l'activité physique (APS), et la plage calendaire du cahier d'évaluations.
            </p>
          </div>

          <form onSubmit={handleCreateCycle} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Select target class */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5">
                  Classe cible :
                </label>
                <select
                  value={selectedClassIdx}
                  onChange={(e) => setSelectedClassIdx(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer appearance-none outline-hidden"
                >
                  <option value="">Sélectionner une classe...</option>
                  {classes.map((c, i) => (
                    <option key={i} value={i}>
                      {c.name} ({c.students.length} élèves)
                    </option>
                  ))}
                </select>
              </div>

              {/* Select student grade level */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5">
                  Niveau d'enseign :
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as '1AC' | '2AC' | '3AC')}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer outline-hidden"
                >
                  <option value="1AC">1AC</option>
                  <option value="2AC">2AC</option>
                  <option value="3AC">3AC</option>
                </select>
              </div>

              {/* APS Category selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5">
                  Catégorie APS :
                </label>
                <select
                  value={selectedApsCat}
                  onChange={(e) => {
                    const cat = e.target.value as 'collectif' | 'athle' | 'gym' | '';
                    setSelectedApsCat(cat);
                    setSelectedApsName('');
                  }}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer outline-hidden"
                >
                  <option value="">Sélectionner une catégorie...</option>
                  <option value="collectif">Sport Collectif</option>
                  <option value="athle">Athlétisme</option>
                  <option value="gym">Gymnastique</option>
                </select>
              </div>

              {/* Dynamic APS activity selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5">
                  Activité APS :
                </label>
                <select
                  value={selectedApsName}
                  onChange={(e) => setSelectedApsName(e.target.value)}
                  disabled={!selectedApsCat}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed outline-hidden"
                >
                  <option value="">Sélectionner l'APS...</option>
                  {selectedApsCat &&
                    apsDetails[selectedApsCat].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </div>

              {/* Cycle Date Period range inputs */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                  Dates de validité (Période du AU) :
                </label>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                      Du
                    </span>
                    <input
                      type="date"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-950 hover:border-gray-250 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold outline-hidden"
                    />
                  </div>
                  
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                      Au
                    </span>
                    <input
                      type="date"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-950 hover:border-gray-250 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold outline-hidden"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Action Buttons setup */}
            <div className="pt-4 flex flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="w-1/3 py-3 border border-gray-205 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 active:scale-95 transition-all text-center cursor-pointer select-none"
              >
                Annuler
              </button>
              
              <button
                type="submit"
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Valider et Créer
              </button>
            </div>

          </form>
        </div>

      </div>
    );
  }

  // STANDARD CYCLES LIST VIEW
  const activeSortedCycles = getSortedJournals();

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-4 space-y-5 font-sans">
      
      {/* Return back home hook */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer select-none"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l'Accueil
      </button>

      {/* Mes Cahiers listing Panel */}
      <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Mes Cahiers Journaliers
          </h2>

          <button
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer self-stretch sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Créer un cycle
          </button>
        </div>

        {/* Dynamic Class Filter Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-50 border border-gray-150 rounded-xl p-3.5 select-none">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest shrink-0">
            🔍 Filtrer par classe :
          </label>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-indigo-950 font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer w-full"
          >
            <option value="all">Toutes les classes</option>
            {classes.map((c, i) => (
              <option key={i} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Existing journals loop listing */}
        {activeSortedCycles.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-sm text-gray-400 italic font-medium">Aucun cahier trouvé pour cette sélection.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-150 rounded-2xl overflow-hidden bg-white">
            {activeSortedCycles.map((j) => {
              const dStart = j.dateStart ? j.dateStart.split('-').reverse().join('/') : "....";
              const dEnd = j.dateEnd ? j.dateEnd.split('-').reverse().join('/') : "....";

              return (
                <div 
                  key={j.originalIdx} 
                  className="flex items-center justify-between p-4 bg-white hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="flex flex-col items-start min-w-0 pr-4">
                    <span className="text-sm font-extrabold text-gray-955 truncate block">
                      {j.apsName}
                    </span>
                    <div className="flex items-center flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] font-extrabold uppercase bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 tracking-wider font-sans">
                        {j.className}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase bg-indigo-50/50 text-indigo-700/80 rounded px-1.5 py-0.5 tracking-wider font-sans">
                        Level {j.level}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-0.5 ml-0.5 font-sans">
                        📅 du {dStart} au {dEnd}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenCycle(j.originalIdx)}
                      className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs group-hover:bg-indigo-600 group-hover:text-white"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ouvrir
                    </button>

                    <button
                      onClick={() => handleDeleteJournal(j.originalIdx)}
                      className="p-2 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-150 hover:border-red-150 rounded-xl transition-all cursor-pointer"
                      title="Supprimer le cycle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
