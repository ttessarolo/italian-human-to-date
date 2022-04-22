'use strict';

import natural from 'natural';
import Events from 'events';
import extractors from './extractors/index.js';
import adjust, {
  removeDuplicateCharacters,
  removePunctuation,
  removeDiacritics,
  stemWords,
  trimWords,
  stringToNumber,
} from './lib/adjust.js';
import { getTZDate } from './lib/dateUtils.js';
import { italianDateTerms, extractorSequence } from './defaults.js';

export {
  adjust,
  removeDuplicateCharacters,
  removePunctuation,
  removeDiacritics,
  stemWords,
  trimWords,
  stringToNumber,
  italianDateTerms,
  extractorSequence,
};
export default class DateExtractor extends Events {
  constructor({
    now,
    timeZone,
    sequence,
    vocabulary = italianDateTerms,
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
  } = {}) {
    super();

    this.vocabolario = {
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
      dopo: vocabulary.after.map((k) => natural[textProcessor.stemmer].stem(k)),
      prima: vocabulary.before.map((k) => natural[textProcessor.stemmer].stem(k)),
      dopoDomani: vocabulary.afterTomorrow.map((k) => natural[textProcessor.stemmer].stem(k)),
      altroIeri: vocabulary.beforeYesterday.map((k) => natural[textProcessor.stemmer].stem(k)),
      traFra: vocabulary.within.map((k) => natural[textProcessor.stemmer].stem(k)),
      fa: vocabulary.ago.map((k) => natural[textProcessor.stemmer].stem(k)),
      giorno: vocabulary.day.map((k) => natural[textProcessor.stemmer].stem(k)),
      ultimo: vocabulary.last.map((k) => natural[textProcessor.stemmer].stem(k)),
    };

    textProcessor.numeri = vocabulary.numbers.map((k) => natural[textProcessor.stemmer].stem(k));

    this.textProcessor = textProcessor;
    this.now = getTZDate(now, timeZone);
    this.sequence = sequence;
    this.stripChar = stripChar;
    this.verbose = verbose;
  }

  getNow() {
    return this.now;
  }

  getSequence() {
    return this.sequence ?? extractorSequence;
  }

  async extract(ingress, { now, timeZone, cb, outStream } = {}) {
    const results = [];
    const today = now ? getTZDate(now, timeZone) : this.now;
    const isAsync = cb || outStream;
    const [rows, isMultiple] = (() => {
      if (Array.isArray(ingress)) return [ingress, true];
      return [[ingress], false];
    })();

    for await (const data of rows) {
      const dates = new Map();
      const ranges = new Map();
      const tokens = adjust(data, this.textProcessor);
      const adjustedTokes = [...tokens];

      (this.sequence ?? extractorSequence).forEach((seq) =>
        extractors[seq]({
          tokens,
          today,
          dates,
          ranges,
          stripChar: this.stripChar,
          vocabolario: this.vocabolario,
          verbose: this.verbose,
        })
      );

      const date = [...dates.values()].sort();

      if (this.verbose) console.log(date.map((d) => d.toString()));

      const residualTokens = tokens.filter((k) => !(k === this.stripChar));
      const ret = {
        origin: data,
        dates: date,
        ranges: [...ranges.values()],
        adjustedTokes,
        residualTokens,
        usedTokens: adjustedTokes.filter((k) => !residualTokens.includes(k)),
      };

      if (cb) cb(null, ret);
      if (outStream) outStream.write(ret);
      this.emit('data', ret);

      if (!isAsync) results.push(ret);
    }

    return isMultiple ? results : results[0];
  }
}
