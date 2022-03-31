'use strict';

import { getTZDate, addDate, addDateRange } from '../lib/dateUtils.js';
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
  }

  strip(tokens, strips, stripChar);
}
