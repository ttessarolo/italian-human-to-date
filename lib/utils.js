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

export function strip(tokens, strips, stripChar) {
  [...strips].forEach((i) => (tokens[i] = stripChar));
}
