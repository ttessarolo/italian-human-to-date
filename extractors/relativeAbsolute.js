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

import { addDate, addDateRange } from '../lib/dateUtils.js';
import { strip, getDMYIndex, getIndexes } from '../lib/utils.js';

export default function relativeAbsolute({
  tokens,
  today,
  dates,
  ranges,
  stripChar,
  verbose,
  vocabolario: { traFra, fa, giorno, mese, anno },
}) {
  let strips = new Set();
  const [isValid, type, index] = getDMYIndex(tokens, giorno, mese, anno);
  const withinIndex = getIndexes(tokens, traFra);
  const agoIndex = getIndexes(tokens, fa);

  for (let k = 0, length = tokens.length; k < length; k++) {
    const token = tokens[k];

    if (token === stripChar || !/^\d+$/.test(token) || !Number.isSafeInteger(Number(token)) || Number(token) < 1) continue;

    if (isValid) {
      if (withinIndex.length > 0) {
        let applied = false;
        switch (type) {
          case 'd':
            const data = addDays(today, token);
            applied = addDate(data, dates);
            break;
          case 'm':
            const m = addMonths(today, token);
            applied = addDateRange(startOfMonth(m), endOfMonth(m), ranges);
            break;
          case 'y':
            const y = addYears(today, token);
            applied = addDateRange(startOfYear(y), endOfYear(y), ranges);
            break;
        }

        if (applied) strips = new Set([...strips, ...index, k, ...withinIndex]);
      } else if (agoIndex.length > 0) {
        let applied = false;
        switch (type) {
          case 'd':
            const data = subDays(today, token);
            applied = addDate(data, dates);
            break;
          case 'm':
            const m = subMonths(today, token);
            applied = addDateRange(startOfMonth(m), endOfMonth(m), ranges);
            break;
          case 'y':
            const y = subYears(today, token);
            applied = addDateRange(startOfYear(y), endOfYear(y), ranges);
            break;
        }
        if (applied) strips = new Set([...strips, ...index, k, ...agoIndex]);
      }
    }
  }

  strip(tokens, strips, stripChar);
}
