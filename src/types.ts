export interface Student {
  id: number;
  name: string;
  gender: 'M' | 'F';
  isDispense?: boolean;
  adresse?: string;
  tel?: string;
  metier?: string;
  sante?: string;
  freres?: number | string;
  birthdates?: string;
}

export interface ClassItem {
  name: string;
  students: Student[];
}

export interface JournalCycle {
  className: string;
  level: '1AC' | '2AC' | '3AC';
  apsCat: 'collectif' | 'athle' | 'gym';
  apsName: string;
  dateStart: string;
  dateEnd: string;
  students: Student[];
  scores: Record<string, any>;
}
