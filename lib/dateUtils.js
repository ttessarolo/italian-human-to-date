'use strict';

import { addDays, subDays, isDate } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz/esm';

export function addDate(date, dates) {
  const day = date.getDate();
  const month = date.getMonth();

  // Skip add dates with same day and month
  for (const d of dates.values()) {
    const md = d.getDate();
    const m = d.getMonth();

    if (md === day && m === month) return;
  }
  dates.set(date.toString(), date);
}

export function addDateRange(start, end, ranges) {
  ranges.set(`${start.toString()}≈${start.toString()}`, { start, end });
}

export function getTZDate(data, timeZone = 'Europe/Rome', resetHours = true) {
  const d = (() => {
    if (!data) return new Date();
    return typeof data === 'string' ? new Date(data) : isDate(data) ? data : new Date();
  })();

  if (resetHours) d.setHours(0, 0, 0, 0, 0);

  return utcToZonedTime(d, timeZone);
}

export function findDay(today, weekDay, day) {
  let forwardCount = 0;
  let forwardDate;
  let backwardCount = 0;
  let backwardDate;
  let go = true;
  let next = today;

  const checkDay = (d) => (day ? d.getDate() === day : true);

  // Find Forward
  while (go) {
    ++forwardCount;
    next = addDays(next, 1);

    if (checkDay(next) && next.getDay() === weekDay) {
      go = false;
      forwardDate = next;
    }
  }

  go = true;
  next = today;

  // Find Backward
  while (go) {
    ++backwardCount;
    next = subDays(next, 1);

    if (checkDay(next) && next.getDay() === weekDay) {
      go = false;
      backwardDate = next;
    }
  }

  return { forwardCount, backwardCount, forwardDate, backwardDate };
}

export function findDate({ today, weekDay, day, direction }) {
  direction = day ? undefined : direction;

  if (direction === 'none') return today;

  const { forwardCount, backwardCount, forwardDate, backwardDate } = findDay(today, weekDay, day);

  if (direction === 'forward') return forwardDate;
  if (direction === 'backward') return backwardDate;

  return backwardCount < forwardCount ? backwardDate : forwardDate;
}
