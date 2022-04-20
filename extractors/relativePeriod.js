'use strict';

import {
  setDate,
  setMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  subDays,
  addDays,
} from 'date-fns';
import { addDateRange } from '../lib/dateUtils.js';
import { strip, getIndexes } from '../lib/utils.js';

export default function relativePeriod({
  tokens,
  today,
  ranges,
  stripChar,
  verbose,
  vocabolario: { prossimo, scorso, ultimo, settimana, mese, anno },
}) {
  const scorsoIndex = getIndexes(tokens, scorso);
  const prossimoIndex = getIndexes(tokens, prossimo);
  const ultimoIndex = getIndexes(tokens, ultimo);

  let strips = new Set();

  for (let k = 0, length = tokens.length; k < length; k++) {
    const token = tokens[k];

    if (token === stripChar) continue;

    const weekIndex = settimana.findIndex((w) => w === token);
    const monthIndex = mese.findIndex((w) => w === token);
    const annoIndex = anno.findIndex((w) => w === token);

    if (annoIndex > -1) {
      if (scorsoIndex.length > 0) {
        let start = subDays(today, 365);
        start = startOfYear(start);

        addDateRange(start, endOfYear(start), ranges);

        // Add found tokens to strips
        strips.add(k);
        strips = new Set([...strips, ...scorsoIndex]);
      } else if (prossimoIndex.length > 0) {
        let start = addDays(today, 365);
        start = startOfYear(start);

        addDateRange(start, endOfYear(start), ranges);

        // Add found tokens to strips
        strips.add(k);
        strips = new Set([...strips, ...prossimoIndex]);
      } else if (ultimoIndex.length > 0) {
        let start = subDays(today, 365);
        addDateRange(start, today, ranges);

        // Add found tokens to strips
        strips.add(k);
        strips = new Set([...strips, ...ultimoIndex]);
      }
    }

    if (weekIndex > -1) {
      if (scorsoIndex.length > 0) {
        let start = startOfWeek(today, { weekStartsOn: 1 });
        start = subDays(start, 6);

        addDateRange(start, endOfWeek(start, { weekStartsOn: 1 }), ranges);

        // Add found tokens to strips
        strips.add(k);
        strips = new Set([...strips, ...scorsoIndex]);
      } else if (prossimoIndex.length > 0) {
        let start = startOfWeek(today, { weekStartsOn: 1 });
        start = addDays(start, 8);

        addDateRange(start, endOfWeek(start, { weekStartsOn: 1 }), ranges);

        // Add found tokens to strips
        strips.add(k);
        strips = new Set([...strips, ...prossimoIndex]);
      } else if (ultimoIndex.length > 0) {
        let start = subDays(today, 8);
        addDateRange(start, today, ranges);

        // Add found tokens to strips
        strips.add(k);
        strips = new Set([...strips, ...ultimoIndex]);
      }
    }

    if (monthIndex > -1) {
      if (scorsoIndex.length > 0) {
        let start = setDate(today, 1);
        start = setMonth(start, start.getMonth() - 1);

        addDateRange(start, endOfMonth(start), ranges);

        // Add found tokens to strips
        strips.add(k);
        strips = new Set([...strips, ...scorsoIndex]);

        if (verbose) {
          console.log('************ MONTH RELATIVE ***************');
          console.log(start.toString(), endOfMonth(start).toString());
        }
      } else if (prossimoIndex.length > 0) {
        let start = setDate(today, 1);
        start = setMonth(start, start.getMonth() + 1);

        addDateRange(start, endOfMonth(start), ranges);

        // Add found tokens to strips
        strips.add(k);
        strips = new Set([...strips, ...prossimoIndex]);

        if (verbose) {
          console.log('************ MONTH RELATIVE ***************');
          console.log(start.toString(), endOfMonth(start).toString());
        }
      } else if (ultimoIndex.length > 0) {
        let start = subDays(today, 31);
        addDateRange(start, today, ranges);

        // Add found tokens to strips
        strips.add(k);
        strips = new Set([...strips, ...ultimoIndex]);
      }
    }
  }

  strip(tokens, strips, stripChar);
}
