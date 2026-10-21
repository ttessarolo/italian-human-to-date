'use strict';

import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  subYears,
  addDays,
  addYears,
  addMonths,
} from 'date-fns';

import { addDateRange } from '../lib/dateUtils.js';
import { getDMYIndex, getIndexes, strip } from '../lib/utils.js';

export default function relativeRange({
  tokens,
  today,
  ranges,
  stripChar,
  verbose,
  vocabolario: { prossimo, ultimo, giorno, mese, anno },
}) {
  let strips = new Set();
  const [isValid, type, index] = getDMYIndex(tokens, giorno, mese, anno);
  const prossimoIndex = getIndexes(tokens, prossimo);
  const ultimoIndex = getIndexes(tokens, ultimo);

  for (let k = 0, length = tokens.length; k < length; k++) {
    const token = tokens[k];

    if (token === stripChar || !/^\d+$/.test(token) || !Number.isSafeInteger(Number(token)) || Number(token) < 1) continue;

    if (isValid) {
      if (prossimoIndex.length > 0) {
        let applied = false;
        switch (type) {
          case 'd':
            const dEnd = addDays(today, token);
            applied = addDateRange(today, dEnd, ranges);
            break;
          case 'm':
            const mEnd = addMonths(today, token);
            applied = addDateRange(today, endOfMonth(mEnd), ranges);
            break;
          case 'y':
            const yEnd = addYears(today, token);
            applied = addDateRange(today, endOfYear(yEnd), ranges);
            break;
        }

        if (applied) strips = new Set([...strips, ...index, k, ...prossimoIndex]);
      } else if (ultimoIndex.length > 0) {
        let applied = false;
        switch (type) {
          case 'd':
            const dStart = subDays(today, token);
            applied = addDateRange(dStart, today, ranges);
            break;
          case 'm':
            const mStart = subMonths(today, token);
            applied = addDateRange(startOfMonth(mStart), today, ranges);
            break;
          case 'y':
            const yStart = subYears(today, token);
            applied = addDateRange(startOfYear(yStart), today, ranges);
            break;
        }

        if (applied) strips = new Set([...strips, ...index, k, ...ultimoIndex]);
      }
    }
  }

  strip(tokens, strips, stripChar);
}
