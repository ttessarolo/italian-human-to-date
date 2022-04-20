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

  for (let k = 0, length = tokens.length; k < length; k++) {
    const token = tokens[k];

    if (token === stripChar || isNaN(token)) continue;

    const [isValid, type, index] = getDMYIndex(tokens, giorno, mese, anno);

    if (isValid) {
      const prossimoIndex = getIndexes(tokens, prossimo);
      const ultimoIndex = getIndexes(tokens, ultimo);

      if (prossimoIndex.length > 0) {
        switch (type) {
          case 'd':
            const dEnd = addDays(today, token);
            addDateRange(today, dEnd, ranges);
            break;
          case 'm':
            const mEnd = addMonths(today, token);
            addDateRange(today, endOfMonth(mEnd), ranges);
            break;
          case 'y':
            const yEnd = addYears(today, token);
            addDateRange(today, endOfYear(yEnd), ranges);
            break;
        }

        strips = new Set([...strips, ...index, k, ...prossimoIndex]);
      } else if (ultimoIndex.length > 0) {
        switch (type) {
          case 'd':
            const dStart = subDays(today, token);
            addDateRange(dStart, today, ranges);
            break;
          case 'm':
            const mStart = subMonths(today, token);
            addDateRange(startOfMonth(mStart), today, ranges);
            break;
          case 'y':
            const yStart = subYears(today, token);
            addDateRange(startOfYear(yStart), today, ranges);
            break;
        }

        strips = new Set([...strips, ...index, k, ...ultimoIndex]);
      }
    }
  }

  strip(tokens, strips, stripChar);
}
