'use strict';
import natural from 'natural';
import removeStopwords from './stopwords.js';
import { italianDateTerms } from '../defaults.js';

export function removeDuplicateCharacters(string) {
  return string.replace(/(.)\1+/g, '$1');
}

export function removePunctuation(string, replaceChar = '') {
  // Keep dots only inside complete numeric dates; ordinary punctuation and
  // decimal dots retain the previous text-normalization behavior.
  const dateDots = new Set();
  for (const match of string.matchAll(/\b\d{1,2}\.\d{1,2}\.\d{4}\b/g)) {
    for (let i = 0; i < match[0].length; i++) {
      if (match[0][i] === '.') dateDots.add(match.index + i);
    }
  }
  return string.replace(/[^A-Za-zÀ-ú0-9\s\-/\\]+/g, (segment, start) => {
    let result = '';
    let pending = false;
    for (let i = 0; i < segment.length; i++) {
      if (dateDots.has(start + i)) {
        if (pending) result += replaceChar;
        result += segment[i];
        pending = false;
      } else {
        pending = true;
      }
    }
    return pending ? result + replaceChar : result;
  });
}

export function removeDiacritics(string) {
  return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function stemWords(string = '', stemmer = 'PorterStemmerIt') {
  return string
    .split(' ')
    .map((k) => (stemmer ? natural[stemmer].stem(k) : k))
    .join(' ');
}

export function trimWords(string = '') {
  return string
    .split(' ')
    .map((k) => k.trim())
    .join(' ');
}

export function stringToNumber(
  string = '',
  numbers = stemWords(italianDateTerms.numbers.join(' ')).split(' ')
) {
  return string
    .split(' ')
    .map((k) => {
      const index = numbers.findIndex((j) => j === k);
      if (index > -1) return index + 1;
      return k;
    })
    .join(' ');
}

export default function adjust(
  k,
  { stemmer, stopwords, duplicate, diacritics, punctuation, lowercase, trim, tokenize, numeri }
) {
  if (trim) k = k.trim();
  if (punctuation) k = removePunctuation(k, ' ');
  if (lowercase) k = k.toLowerCase();
  if (duplicate) k = removeDuplicateCharacters(k);
  if (diacritics) k = removeDiacritics(k);
  if (stopwords) k = removeStopwords(k);
  if (stemmer) k = stemWords(k, stemmer);
  if (numeri) k = stringToNumber(k, numeri);

  return tokenize ? k.split(' ') : k;
}
