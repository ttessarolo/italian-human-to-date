'use strict';

import { addDate, civilDate, validCalendarDate } from '../lib/dateUtils.js';
import { strip } from '../lib/utils.js';

export default function canonical({
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

    const match = /^(\d{1,2})([\/\-.])(\d{1,2})\2(\d{4})$/.exec(token);
    if (match) {
      const [, day, , month, year] = match;
      if (!validCalendarDate(Number(year), Number(month), Number(day))) continue;
      const date = civilDate(Number(year), Number(month), Number(day));
      strips.add(k);
      addDate(date, dates);
    }
  }

  strip(tokens, strips, stripChar);
}
