'use strict';

import natural from 'natural';

import extractors from './extractors/index.js';
import adjust from './lib/adjust.js';
import { getTZDate } from './lib/dateUtils.js';
import { italianDateTerms, extractorSequence } from './defaults.js';

export default function extractDates(
  data,
  {
    now,
    timeZone,
    sequence,
    vocabulary = defaults,
    textProcessor = {
      stemmer: 'PorterStemmerIt',
      stopwords: true,
      duplicate: false,
      diacritics: true,
      punctuation: true,
      lowercase: true,
      trim: true,
      tokenize: true,
    },
    stripChar = '≈',
    verbose = false,
  } = {
    vocabulary: italianDateTerms,
    stripChar: '≈',
    verbose: false,
    textProcessor: {
      stemmer: 'PorterStemmerIt',
      stopwords: true,
      duplicate: false,
      diacritics: true,
      punctuation: true,
      lowercase: true,
      trim: true,
      tokenize: true,
    },
  }
) {
  const tokens = adjust(data, textProcessor);
  const today = getTZDate(now, timeZone);
  const dates = new Map();
  const ranges = new Map();

  const vocabolario = {
    prossimo: vocabulary.next.map((k) => natural[textProcessor.stemmer].stem(k)),
    scorso: vocabulary.previous.map((k) => natural[textProcessor.stemmer].stem(k)),
    ieri: vocabulary.yesterday.map((k) => natural[textProcessor.stemmer].stem(k)),
    oggi: vocabulary.today.map((k) => natural[textProcessor.stemmer].stem(k)),
    domani: vocabulary.tomorrow.map((k) => natural[textProcessor.stemmer].stem(k)),
    settimana: vocabulary.week.map((k) => natural[textProcessor.stemmer].stem(k)),
    mese: vocabulary.month.map((k) => natural[textProcessor.stemmer].stem(k)),
    mesi: vocabulary.months.map((k) => natural[textProcessor.stemmer].stem(k)),
    giorniSettimana: vocabulary.weekDays.map((k) => natural[textProcessor.stemmer].stem(k)),
    anno: vocabulary.year.map((k) => natural[textProcessor.stemmer].stem(k)),
  };

  (sequence ?? extractorSequence).forEach((seq) =>
    extractors[seq]({ tokens, today, dates, ranges, stripChar, vocabolario, verbose })
  );

  const date = [...dates.values()].sort();

  if (verbose) console.log(date.map((d) => d.toString()));

  return {
    dates: date,
    ranges: [...ranges.values()],
    tokens,
  };
}
