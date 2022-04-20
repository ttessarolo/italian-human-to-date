'use strict';

import { subDays, addDays } from 'date-fns';
import { addDate } from '../lib/dateUtils.js';
import { strip, getIndexes, getCoPresenceIndexes } from '../lib/utils.js';

export default function relativeStep({
  tokens,
  today,
  dates,
  stripChar,
  verbose,
  vocabolario: { ieri, domani, dopo, prima, dopoDomani, altroIeri },
}) {
  let strips = new Set();

  // **************************
  // Day After Tomorrow
  // **************************
  let datIndex = getIndexes(tokens, dopoDomani);
  let dat = addDays(today, 2);

  if (datIndex.length > 0) {
    addDate(dat, dates);
    strips = new Set([...strips, ...datIndex]);
  } else {
    const [isDat, datIndex] = getCoPresenceIndexes(tokens, [...dopo, ...domani]);
    if (isDat) {
      addDate(dat, dates);
      strips = new Set([...strips, ...datIndex]);
    }
  }

  // **************************
  // Day Before Yesterday
  // **************************
  let dbyIndex = getIndexes(tokens, altroIeri);
  let dby = subDays(today, 2);

  if (dbyIndex.length > 0) {
    addDate(dby, dates);
    strips = new Set([...strips, ...dbyIndex]);
  } else {
    const [isDby, dbyIndex] = getCoPresenceIndexes(tokens, [...prima, ...ieri]);
    if (isDby) {
      addDate(dby, dates);
      strips = new Set([...strips, ...dbyIndex]);
    }
  }

  strip(tokens, strips, stripChar);
}
