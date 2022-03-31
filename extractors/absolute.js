'use strict';

import { getTZDate, addDate } from '../lib/dateUtils.js';
import { strip } from '../lib/utils.js';

export default function extractAbsoluteDate({
  tokens,
  today,
  dates,
  stripChar,
  verbose,
  vocabolario: { prossimo, scorso, ieri, oggi, domani, settimana, mese, mesi, giorniSettimana },
}) {
  let strips = new Set();

  for (let k = 0, length = tokens.length; k < length; k++) {
    const token = tokens[k];

    if (token === stripChar) continue;

    const monthsIndex = mesi.findIndex((m) => m === token);
    if (monthsIndex > -1) {
      strips.add(k);
      let day = 1;
      let year = today.getYear() + 1900 - (monthsIndex > today.getMonth() ? 1 : 0);

      // Find day
      const d = Number(tokens[k - 1]);
      if (!isNaN(d)) {
        if (d > 0 && d <= 31) {
          day = d;
          strips.add(k - 1);
        }
      }

      // Find year
      const y = Number(tokens[k + 1]);
      const yNow = String(today.getYear() + 1900);
      if (!isNaN(y)) {
        if (y > 1900 || yNow.includes(y)) {
          year = y;
          strips.add(k + 1);
        }
      }

      const date = getTZDate(`${monthsIndex + 1}/${day}/${year}`);

      addDate(date, dates);

      if (verbose) {
        console.log('************ ABSOLUTE ***************');
        console.log(date.toString());
      }
    }
  }

  strip(tokens, strips, stripChar);
}
