import { baremesAthle } from './data';

export function calculateAthleNote(
  perf: number,
  level: string,
  apsName: string,
  gender: string
): number {
  if (!perf || isNaN(perf)) return 0;
  const bareme = baremesAthle[level];
  if (!bareme) return 0;

  let colIdx = -1;
  const isM = gender && gender.toUpperCase() === 'M';

  if (apsName === 'Course de durée') colIdx = isM ? 1 : 7;
  else if (apsName === 'Lancer de poids') colIdx = isM ? 2 : 8;
  else if (apsName === 'Course de vitesse') colIdx = isM ? 3 : 9;
  else if (apsName === 'Triple Saut') colIdx = isM ? 4 : 10;
  else if (apsName === 'Saut en longueur') colIdx = isM ? 5 : 11;
  else if (apsName === 'Saut en hauteur') colIdx = isM ? 6 : 12;

  if (colIdx === -1) return 0;

  const isTimeBased = apsName.includes('vitesse') || apsName.includes('durée');

  for (let i = 0; i < bareme.length; i++) {
    const row = bareme[i];
    const scoreRef = row[colIdx];
    const nextRow = bareme[i + 1];

    if (isTimeBased) {
      if (perf <= scoreRef) return row[0];
      if (nextRow && perf < nextRow[colIdx]) return row[0];
      if (!nextRow && perf > scoreRef) return row[0];
    } else {
      if (perf >= scoreRef) return row[0];
      if (nextRow && perf > nextRow[colIdx]) return row[0];
      if (!nextRow && perf < scoreRef) return row[0];
    }
  }
  return 0;
}

export function calculateAge(dateStr: string): number | null {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const year = parseInt(parts[2]);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  const today = new Date(2026, 4, 25); // Anchor date: May 25, 2026
  const birthDate = new Date(year, month, day);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export interface Sibling {
  role: 'E' | 'G' | 'F';
  dateStr: string;
  age: number;
}

export function parseSiblingTimeline(birthdatesStr: string | undefined): Sibling[] | string {
  if (!birthdatesStr || !birthdatesStr.trim()) {
    return "Aucune date de naissance renseignée.";
  }

  const lines = birthdatesStr.split('\n');
  const list: Sibling[] = [];

  lines.forEach((line) => {
    const match = line.trim().match(/^(E|G|F)\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})$/i);
    if (match) {
      const role = match[1].toUpperCase() as 'E' | 'G' | 'F';
      const dateStr = match[2];
      const age = calculateAge(dateStr);
      if (age !== null) {
        list.push({ role, dateStr, age });
      }
    }
  });

  if (list.length === 0) {
    return "Format incorrect. Exemple : E: 12/04/2014";
  }

  // Sort from youngest to oldest (ascending order of age)
  list.sort((a, b) => a.age - b.age);
  return list;
}
