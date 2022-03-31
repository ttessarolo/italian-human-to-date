'use strict';

import { setDate, setMonth, endOfMonth } from 'date-fns';
import { addDateRange } from '../lib/dateUtils.js';
import { strip, getIndexes } from '../lib/utils.js';

export default function relativePeriod({
  tokens,
  today,
  ranges,
  stripChar,
  verbose,
  vocabolario: { prossimo, scorso, settimana, mese, anno },
}) {
  let strips = new Set();

  for (let k = 0, length = tokens.length; k < length; k++) {
    const token = tokens[k];

    if (token === stripChar) continue;

    const scorsoIndex = getIndexes(tokens, scorso);
    const prossimoIndex = getIndexes(tokens, prossimo);

    const weekIndex = settimana.findIndex((w) => w === token);
    const monthIndex = mese.findIndex((w) => w === token);
    const annoIndex = anno.findIndex((w) => w === token);

    if (weekIndex > -1) {
      if (scorsoIndex.length > 0) {
        // Add found tokens to strips
        strips.add(k);
        strips = new Set([...strips, ...scorsoIndex]);
      } else if (prossimoIndex.length > 0) {
        // Add found tokens to strips
        strips.add(k);
        strips = new Set([...strips, ...prossimoIndex]);
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
      }
    }
  }

  strip(tokens, strips, stripChar);
}
