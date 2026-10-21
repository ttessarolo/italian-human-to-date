import test from 'node:test';
import assert from 'node:assert/strict';
import DateExtractor, { italianDateTerms, stemWords, stringToNumber } from '../index.js';
import { addDate, addDateRange, civilDate, findDay, getTZDate } from '../lib/dateUtils.js';

const clock = '2026-10-21T12:00:00.000Z';
const parser = new DateExtractor({ now: clock, timeZone: 'Europe/Rome' });
const iso = (date) => date.toISOString();

test('invalid numeric weekdays terminate and leave the query available', async () => {
  for (const query of ['lunedì 32', 'lunedì 99', 'martedì -1', 'martedì 0']) {
    const result = await parser.extract(query);
    assert.deepEqual(result.dates, [], query);
    assert.deepEqual(result.ranges, [], query);
    assert.deepEqual(result.residualTokens, result.adjustedTokes, query);
  }
  assert.equal((await parser.extract('oggi')).dates[0].toISOString(), '2026-10-20T22:00:00.000Z');
  assert.deepEqual(findDay(new Date(clock), 1, 99), {});
  const longGap = findDay(new Date(2000, 3, 1), 5, 31);
  assert.deepEqual([longGap.forwardDate.getFullYear(), longGap.forwardDate.getMonth() + 1,
    longGap.forwardDate.getDate()], [2001, 8, 31]);
  const ancient = findDay(civilDate(42, 1, 1), 1, 31);
  assert.deepEqual([ancient.forwardDate.getFullYear(), ancient.forwardDate.getMonth() + 1,
    ancient.forwardDate.getDate()], [42, 3, 31]);
  const overflowing = await parser.extract('tra 999999999999 giorni');
  assert.deepEqual(overflowing.dates, []);
  assert.deepEqual(overflowing.residualTokens, overflowing.adjustedTokes);
});

test('Gregorian calendar rejects impossible dates and accepts leap days', async () => {
  for (const query of ['31 aprile 2026', '29 febbraio 2025', '31-04-2026', '29/02/2025']) {
    const result = await parser.extract(query);
    assert.deepEqual(result.dates, [], query);
    assert.deepEqual(result.residualTokens, result.adjustedTokes, query);
  }
  assert.equal(iso((await parser.extract('29 febbraio 2024')).dates[0]), '2024-02-28T23:00:00.000Z');
  assert.equal(iso((await parser.extract('29/02/2024')).dates[0]), '2024-02-28T23:00:00.000Z');
  assert.equal(iso((await parser.extract('29.02.2024')).dates[0]), '2024-02-28T23:00:00.000Z');
  assert.equal(iso((await parser.extract('31 aprile 2026 oggi')).dates[0]), '2026-10-20T22:00:00.000Z');
});

test('weeks cover Monday through Sunday in both DST seasons', async () => {
  const autumn = await parser.extract(['settimana scorsa', 'settimana prossima']);
  assert.deepEqual(autumn.map((r) => [iso(r.ranges[0].start), iso(r.ranges[0].end)]), [
    ['2026-10-11T22:00:00.000Z', '2026-10-18T21:59:59.999Z'],
    ['2026-10-25T23:00:00.000Z', '2026-11-01T22:59:59.999Z'],
  ]);
  const spring = await parser.extract('settimana prossima', { now: '2026-03-25T12:00:00.000Z' });
  assert.deepEqual([iso(spring.ranges[0].start), iso(spring.ranges[0].end)],
    ['2026-03-29T22:00:00.000Z', '2026-04-05T21:59:59.999Z']);
});

test('reference instants use Rome civil day at DST boundaries and reject invalid input', async () => {
  assert.equal(iso(getTZDate('2026-03-29T00:30:00.000Z')), '2026-03-28T23:00:00.000Z');
  assert.equal(iso(getTZDate('2026-10-25T00:30:00.000Z')), '2026-10-24T22:00:00.000Z');
  assert.equal(iso((await parser.extract('domani', { now: '2026-03-29T00:30:00.000Z' })).dates[0]),
    '2026-03-29T22:00:00.000Z');
  const supplied = new Date(clock);
  getTZDate(supplied);
  new DateExtractor({ now: supplied });
  assert.equal(supplied.toISOString(), clock);
  assert.equal(iso(getTZDate(0)), '1969-12-31T23:00:00.000Z');
  assert.throws(() => new DateExtractor({ now: 'not-a-date' }), /Invalid reference date/);
  assert.throws(() => new DateExtractor({ timeZone: 'Mars\/Olympus' }), /Invalid time zone/);
  await assert.rejects(parser.extract('oggi', { now: 'not-a-date' }), /Invalid reference date/);
  assert.equal(iso((await parser.extract('oggi', {
    now: '2026-10-21T03:00:00.000Z', timeZone: 'America/New_York',
  })).dates[0]), '2026-10-20T04:00:00.000Z');
});

test('date and range identity includes year and end; returned dates are chronological', async () => {
  const dates = new Map();
  addDate(new Date('2025-04-01T00:00:00Z'), dates);
  addDate(new Date('2026-04-01T00:00:00Z'), dates);
  assert.equal(dates.size, 2);
  const ranges = new Map();
  const start = new Date('2026-04-01T00:00:00Z');
  addDateRange(start, new Date('2026-04-02T00:00:00Z'), ranges);
  addDateRange(start, new Date('2026-04-03T00:00:00Z'), ranges);
  assert.equal(ranges.size, 2);
  assert.deepEqual((await parser.extract('oggi ieri domani')).dates.map(iso), [
    '2026-10-19T22:00:00.000Z', '2026-10-20T22:00:00.000Z', '2026-10-21T22:00:00.000Z',
  ]);
});

test('custom vocabulary, sequence, residual tokens, and public number helper remain available', async () => {
  const vocabulary = { ...italianDateTerms, today: ['adesso'] };
  const custom = new DateExtractor({ now: clock, vocabulary, sequence: ['relative'] });
  const positive = await custom.extract('film adesso');
  assert.equal(iso(positive.dates[0]), '2026-10-20T22:00:00.000Z');
  assert.deepEqual(positive.residualTokens, ['film']);
  const negative = await custom.extract('film oggi');
  assert.deepEqual(negative.dates, []);
  assert.deepEqual(negative.residualTokens, negative.adjustedTokes);
  assert.equal(stringToNumber(stemWords('due')), '2');
});
