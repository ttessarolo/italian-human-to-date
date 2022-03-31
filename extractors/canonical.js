'use strict';

import { addDate } from '../lib/dateUtils.js';
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

    const dateExp =
      /(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/gi;

    if (dateExp.test(token)) {
      const [d, m, y] = token.replaceAll('/', '-').split('-');
      const date = new Date(y, m - 1, d);
      strips.add(k);
      addDate(date, dates);
    }
  }

  strip(tokens, strips, stripChar);
}
