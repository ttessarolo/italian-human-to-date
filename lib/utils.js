'use strict';

function multiRemove(origin, strips) {
  strips = Array.isArray(strips) ? new Set(strips) : strips;

  const ret = [];
  for (let k = 0, length = origin.length; k < length; k++) {
    if (!strips.has(k)) ret.push(origin[k]);
  }

  return ret;
}

export function getIndexes(origin, match) {
  const index = [];
  for (let k = 0, length = origin.length; k < length; k++) {
    const token = origin[k];
    const found = match.findIndex((i) => i === token);
    if (found > -1) index.push(k);
  }

  return index;
}

// All elements in match must be in origin
export function getCoPresenceIndexes(origin, match) {
  let matchCount = 0;
  const index = [];
  for (let k = 0, length = origin.length; k < length; k++) {
    const token = origin[k];
    const found = match.findIndex((i) => i === token);
    if (found > -1) {
      matchCount += 1;
      index.push(k);
    }
  }

  return [matchCount === match.length, index];
}

export function getDMYIndex(tokens, day, month, year) {
  let dayIndex = getIndexes(tokens, day);
  if (dayIndex.length > 0) {
    return [true, 'd', dayIndex];
  }

  let monthIndex = getIndexes(tokens, month);
  if (monthIndex.length > 0) {
    return [true, 'm', monthIndex];
  }

  let yearIndex = getIndexes(tokens, year);
  if (yearIndex.length > 0) {
    return [true, 'y', yearIndex];
  }

  return [false];
}

export function strip(tokens, strips, stripChar) {
  [...strips].forEach((i) => (tokens[i] = stripChar));
}
