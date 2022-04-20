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
  let strips;

  for (let k = 0, length = tokens.length; k < length; k++) {
    const token = tokens[k];

    if (token === stripChar || isNaN(token)) continue;

    const [isValid, type, index] = getDMYIndex(tokens, giorno, mese, anno);

    if (isValid) {
      strips = new Set(index);

      const withinIndex = getIndexes(tokens, traFra);
      const agoIndex = getIndexes(tokens, fa);
      if (withinIndex.length > 0) {
        switch (type) {
          case 'd':
            const data = addDays(today, token);
            addDate(data, dates);
            break;
          case 'm':
            const m = addMonths(today, token);
            addDateRange(startOfMonth(m), endOfMonth(m), ranges);
            break;
          case 'y':
            const y = addYears(today, token);
            addDateRange(startOfYear(y), endOfYear(y), ranges);
            break;
        }

        strips = new Set([...strips, k, withinIndex]);
      } else if (agoIndex.length > 0) {
        switch (type) {
          case 'd':
            const data = subDays(today, token);
            addDate(data, dates);
            break;
          case 'm':
            const m = subMonths(today, token);
            addDateRange(startOfMonth(m), endOfMonth(m), ranges);
            break;
          case 'y':
            const y = subYears(today, token);
            addDateRange(startOfYear(y), endOfYear(y), ranges);
            break;
        }
        strips = new Set([...strips, k, agoIndex]);
      }
    }
  }

  strip(tokens, strips ?? new Set(), stripChar);
}
