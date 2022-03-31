'use strict';

import { subDays, addDays } from 'date-fns';

import { addDate } from '../lib/dateUtils.js';
import { strip } from '../lib/utils.js';

export default function extractAbsoluteDate({
  tokens,
  today,
  dates,
  stripChar,
  verbose,
  vocabolario: { ieri, oggi, domani },
}) {
  let strips = new Set();

  for (let k = 0, length = tokens.length; k < length; k++) {
    const token = tokens[k];

    if (token === stripChar) continue;

    if (ieri.includes(token)) {
      strips.add(k);
      addDate(subDays(today, 1), dates);

      if (verbose) {
        console.log('************ RELATIVE ***************');
        console.log(subDays(today, 1).toString());
      }
    }
    if (oggi.includes(token)) {
      strips.add(k);
      addDate(today, dates);

      if (verbose) {
        console.log('************ RELATIVE ***************');
        console.log(today.toString());
      }
    }
    if (domani.includes(token)) {
      strips.add(k);
      addDate(addDays(today, 1), dates);

      if (verbose) {
        console.log('************ RELATIVE ***************');
        console.log(addDays(today, 1).toString());
      }
    }
  }

  strip(tokens, strips, stripChar);
}
