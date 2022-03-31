'use strict';
import natural from 'natural';

import removeStopwords from './stopwords.js';

export function removeDuplicateCharacters(string) {
  return string.replace(/(.)\1+/g, '$1');
}

export function removePunctuation(string, replaceChar = '') {
  return string.replace(/[^[A-zÀ-ú0-9|\s|\-|/|\\]+/g, replaceChar);
}

export function removeDiacritics(string) {
  return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function stemWords(string = '', stemmer) {
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

export default function adjust(
  k,
  { stemmer, stopwords, duplicate, diacritics, punctuation, lowercase, trim, tokenize }
) {
  if (trim) k = k.trim();
  if (punctuation) k = removePunctuation(k, ' ');
  if (lowercase) k = k.toLowerCase();
  if (duplicate) k = removeDuplicateCharacters(k);
  if (diacritics) k = removeDiacritics(k);
  if (stopwords) k = removeStopwords(k);
  if (stemmer) k = stemWords(k, stemmer);

  return tokenize ? k.split(' ') : k;
}
