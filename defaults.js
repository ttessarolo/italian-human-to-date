'use strict';

export const italianDateTerms = {
  next: ['prossimo', 'prossima'],
  previous: ['scorso', 'scorsa', 'scorsi'],
  yesterday: ['ieri'],
  today: ['oggi'],
  tomorrow: ['domani'],
  week: ['settimana', 'settimane'],
  month: ['mese', 'mesi'],
  months: [
    'gennaio',
    'febbraio',
    'marzo',
    'aprile',
    'maggio',
    'giugno',
    'luglio',
    'agosto',
    'settembre',
    'ottobre',
    'novembre',
    'dicembre',
  ],
  weekDays: ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'],
  year: ['anno', 'anni'],
};

export const extractorSequence = [
  'absolute',
  'canonical',
  'relativePeriod',
  'relativeWeekDay',
  'relative',
];
