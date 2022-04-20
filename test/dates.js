'use strict';
import test from 'ava';
import { readFileSync } from 'fs';
import DateExtractor from '../index.js';

const data = JSON.parse(readFileSync('./test_data/test.json'));
const now = '2022-04-19T22:00:00.000Z';
const DE = new DateExtractor({ now });

for (const prova of data) {
  test(prova.origin, async (t) => {
    const result = await DE.extract(prova.origin);
    t.deepEqual(JSON.parse(JSON.stringify(result)), prova);
  });
}
