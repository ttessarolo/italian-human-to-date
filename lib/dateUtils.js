'use strict';

import { addDays, subDays, differenceInCalendarDays, isDate } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz/esm';

const formatters = new Map();
const hostTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function validCalendarDate(year, month, day) {
  if (![year, month, day].every(Number.isInteger) || year < 1 || year > 9999 ||
      month < 1 || month > 12 || day < 1 || day > 31) return false;
  const probe = new Date(0);
  probe.setUTCFullYear(year, month - 1, day);
  return probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day;
}

export function civilDate(year, month, day) {
  if (!validCalendarDate(year, month, day)) return undefined;
  // Internal calendar arithmetic uses host-local fields as a wall-clock carrier.
  // Conversion to a real instant happens only at the output boundary.
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function wallToZonedDate(date, timeZone = 'Europe/Rome') {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) return undefined;
  if (timeZone === hostTimeZone) return new Date(date.getTime());
  const pad = (n, size = 2) => String(n).padStart(size, '0');
  const wall = `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
  return zonedTimeToUtc(wall, timeZone);
}

export function addDate(date, dates) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) return false;
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  // Skip add dates with same day and month
  for (const d of dates.values()) {
    const md = d.getDate();
    const m = d.getMonth();

    if (md === day && m === month && d.getFullYear() === year) return true;
  }
  dates.set(date.toString(), date);
  return true;
}

export function addDateRange(start, end, ranges) {
  if (![start, end].every((date) => date instanceof Date && Number.isFinite(date.getTime()))) return false;
  ranges.set(`${start.toString()}≈${end.toString()}`, { start, end });
  return true;
}

export function getTZDate(data, timeZone = 'Europe/Rome', resetHours = true) {
  const wall = getWallDate(data, timeZone);
  return resetHours ? wallToZonedDate(wall, timeZone) :
    data === undefined || data === null ? new Date() : new Date(data);
}

export function getWallDate(data, timeZone = 'Europe/Rome') {
  if (typeof timeZone !== 'string') throw new RangeError('Invalid time zone');
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    try {
      formatter = new Intl.DateTimeFormat('en-US', {
        timeZone, year: 'numeric', month: 'numeric', day: 'numeric',
      });
    } catch {
      throw new RangeError('Invalid time zone');
    }
    if (formatters.size >= 16) formatters.delete(formatters.keys().next().value);
    formatters.set(timeZone, formatter);
  }
  const d = data === undefined || data === null ? new Date() :
    typeof data === 'string' || typeof data === 'number' ? new Date(data) :
    isDate(data) ? new Date(data.getTime()) : new Date(NaN);
  if (!Number.isFinite(d.getTime())) throw new RangeError('Invalid reference date');
  const parts = Object.fromEntries(formatter.formatToParts(d).map(({ type, value }) => [type, value]));
  return civilDate(Number(parts.year), Number(parts.month), Number(parts.day));
}

export function findDay(today, weekDay, day) {
  if (!(today instanceof Date) || !Number.isFinite(today.getTime()) ||
      !Number.isInteger(weekDay) || weekDay < 0 || weekDay > 6 ||
      (day !== undefined && (!Number.isInteger(day) || day < 1 || day > 31))) return {};
  if (day === undefined) {
    const forwardCount = (weekDay - today.getDay() + 6) % 7 + 1;
    const backwardCount = (today.getDay() - weekDay + 6) % 7 + 1;
    return {
      forwardCount, backwardCount,
      forwardDate: addDays(today, forwardCount),
      backwardDate: subDays(today, backwardCount),
    };
  }

  const search = (direction) => {
    // Gregorian weekdays repeat every 400 years. Month traversal avoids
    // scanning every day and is finite even for day 31 near leap centuries.
    for (let offset = 0; offset < 4800; offset++) {
      const first = new Date(today.getTime());
      first.setDate(1);
      first.setFullYear(today.getFullYear(), today.getMonth() + direction * offset, 1);
      first.setHours(0, 0, 0, 0);
      if (!Number.isFinite(first.getTime())) break;
      const candidate = new Date(first.getTime());
      candidate.setDate(day);
      if (candidate.getMonth() !== first.getMonth() || candidate.getDay() !== weekDay) continue;
      const distance = differenceInCalendarDays(candidate, today) * direction;
      if (distance > 0) return { date: candidate, count: distance };
    }
    return {};
  };
  const forward = search(1);
  const backward = search(-1);
  return {
    forwardCount: forward.count,
    backwardCount: backward.count,
    forwardDate: forward.date,
    backwardDate: backward.date,
  };
}

export function findDate({ today, weekDay, day, direction }) {
  if (day !== undefined && (!Number.isInteger(day) || day < 1 || day > 31)) return undefined;
  direction = day ? undefined : direction;

  if (direction === 'none') return today;

  const { forwardCount, backwardCount, forwardDate, backwardDate } = findDay(today, weekDay, day);

  if (direction === 'forward') return forwardDate;
  if (direction === 'backward') return backwardDate;

  if (!forwardDate) return backwardDate;
  if (!backwardDate) return forwardDate;
  return backwardCount < forwardCount ? backwardDate : forwardDate;
}
