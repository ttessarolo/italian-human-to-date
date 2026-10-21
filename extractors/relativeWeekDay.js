'use strict';

import { addDate } from '../lib/dateUtils.js';
import { strip, getIndexes } from '../lib/utils.js';
import { findDate } from '../lib/dateUtils.js';

export default function extractAbsoluteDate({
  tokens,
  today,
  dates,
  stripChar,
  verbose,
  vocabolario: { prossimo, scorso, ieri, oggi, domani, settimana, mese, mesi, giorniSettimana },
}) {
  let strips = new Set();
  const scorsoIndex = getIndexes(tokens, scorso);
  const prossimoIndex = getIndexes(tokens, prossimo);

  for (let k = 0, length = tokens.length; k < length; k++) {
    const token = tokens[k];

    if (token === stripChar) continue;

    const dayIndex = giorniSettimana.findIndex((w) => w === token);

    if (dayIndex > -1 && !strips.has(k)) {
      const next = k + 1;
      const nextToken = tokens[next];
      const hasDay = typeof nextToken === 'string' && /^-?\d+$/.test(nextToken);
      const day = hasDay ? Number(nextToken) : undefined;
      if (hasDay && (!Number.isInteger(day) || day < 1 || day > 31)) continue;

      const weekDay = today.getDay();

      // Determine if relative is in past
      const direction = (() => {
        const prima = scorsoIndex.length > 0;
        const dopo = prossimoIndex.length > 0;
        const relative = prima || dopo;

        // is same as today and not previous was indicated
        if (dayIndex === weekDay && !relative) return 'none';

        // not previous was indicated: suppose is in the past
        if (dopo) return 'forward';
        if (prima) return 'backward';

        // Default in the past
        return 'backward';
      })();

      // weekDay with day number specified
      const date = findDate({ today, weekDay: dayIndex, day, direction });
      if (!date) continue;
      addDate(date, dates);
      strips.add(k);
      if (hasDay) strips.add(next);
      strips = new Set([...strips, ...scorsoIndex, ...prossimoIndex]);

      if (verbose) {
        console.log('************ WEEK DAY ***************');
        console.log(date.toString());
      }
    }
  }

  strip(tokens, strips, stripChar);
}
