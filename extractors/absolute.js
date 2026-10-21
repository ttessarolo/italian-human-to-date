'use strict';

import { civilDate, validCalendarDate, addDate } from '../lib/dateUtils.js';
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
      let day = 1;
      let year = today.getFullYear() - (monthsIndex > today.getMonth() ? 1 : 0);

      // Find day
      const dayToken = tokens[k - 1];
      const hasDay = typeof dayToken === 'string' && /^-?\d+$/.test(dayToken);
      if (hasDay) {
        day = Number(dayToken);
      }

      // Find year
      const yearToken = tokens[k + 1];
      const hasYear = typeof yearToken === 'string' && /^\d{4}$/.test(yearToken);
      if (hasYear) {
        year = Number(yearToken);
      }

      // An explicit impossible date must remain text, including its month.
      if (!validCalendarDate(year, monthsIndex + 1, day)) continue;
      const date = civilDate(year, monthsIndex + 1, day);

      addDate(date, dates);
      strips.add(k);
      if (hasDay) strips.add(k - 1);
      if (hasYear) strips.add(k + 1);

      if (verbose) {
        console.log('************ ABSOLUTE ***************');
        console.log(date.toString());
      }
    }
  }

  strip(tokens, strips, stripChar);
}
