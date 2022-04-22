# ITALIAN-HUMAN-TO-DATE

![NPM](https://img.shields.io/npm/v/italian-human-to-date/latest)
![NPM](https://img.shields.io/npm/dw/italian-human-to-date)
![NPM](https://img.shields.io/npm/l/italian-human-to-date)

Convert Italian language strings to Javascript dates.

- Includes a wide range of possible sentences
- Returns a range of dates if the original text contains a time period (e.g. the last month)
- Can receive a readable stream as input and writable stream for output

## Table of Content

<!-- TOC -->

- [Installation](#installation)
- [Basic Example](#basic-example)
- [Multiple Example](#multiple-example)
- [Constructor](#constructor)
  - [Params Object](#params-object)
- [Extract Method](#extract-method)
  - [Events](#events)

<!-- /TOC -->

## Installation

<a id="markdown-installation" name="installation"></a>

```
npm install italian-human-to-date
```

## Basic Example

<a id="markdown-basic-example" name="basic-example"></a>

```javascript
import DateExtractor from 'italian-human-to-date';

const DE = new DateExtractor();
const response = await DE.extract('oggi');
console.log(response);

// PRINT
// {
//   origin: 'oggi',
//   dates: [ 2022-04-19T22:00:00.000Z ],
//   ranges: [],
//   adjustedTokes: [ 'oggi' ],
//   residualTokens: [],
//   usedTokens: [ 'oggi' ]
// }
```

## Multiple Example

<a id="markdown-multiple-example" name="multiple-example"></a>

```javascript
import DateExtractor from 'italian-human-to-date';

const DE = new DateExtractor();

const test = [
  'oggi',
  'ieri',
  'domani',
  'evento di sabato 26 marzo 2021',
  'appuntamento 29 marzo',
  'domenica giorno 27 ieri',
  'nato il 20-11-1973',
  'mese scorso',
  'ultimo mese',
  'mese prossimo',
  'anno scorso',
  'anno prossimo',
  'ultima settimana',
  'settimana scorsa',
  'settimana prossima',
  'dopodomani',
  'dopo domani',
  'altroieri',
  'avantieri',
  'altro ieri',
  'tredici giorni fa',
  'tra un giorno',
  'sei mesi fa',
  'fra dieci giorni',
  '10 anni fa',
  'ultimi tre giorni',
  'prossimi 3 giorni',
  'ultimi due anni',
  'prossimi sei mesi',
];

DE.on('data', (data) => {
  console.log(data);
  console.log(' ');
});

test.forEach((data) => DE.extract(data));

// PRINT
// {
//   origin: 'evento di sabato 26 marzo 2021',
//   dates: [ 2021-03-25T23:00:00.000Z, 2022-04-15T22:00:00.000Z ],
//   ranges: [],
//   adjustedTokes: [ 'event', 'sab', '26', 'marz', '2021' ],
//   residualTokens: [ 'event' ],
//   usedTokens: [ 'sab', '26', 'marz', '2021' ]
// }
// ...
// {
//   origin: 'prossimi sei mesi',
//   dates: [],
//   ranges: [
//     { start: 2022-04-19T22:00:00.000Z, end: 2022-10-31T22:59:59.999Z }
//   ],
//   adjustedTokes: [ 'prossim', '6', 'mes' ],
//   residualTokens: [],
//   usedTokens: [ 'prossim', '6', 'mes' ]
// }
// ...
```

## Constructor

<a id="markdown-constructor" name="constructor"></a>

The Extractor generally works without any need for customization; however, it is possible to customize a number of parameters.

```javascript
new DateExtractor([{ params }]);
```

### Params Object

<a id="markdown-params-object" name="params-object"></a>

<table>
<tr>
<th>Param</th><th>Description</th><th>Default</th>
</tr>
<tbody>
<tr>
    <td style="vertical-align:top"><b>now</b></td>
    <td style="vertical-align:top">The reference date</td>
    <td style="vertical-align:top"><b>Date.now()</b></td>
</tr>
<tr>
    <td style="vertical-align:top"><b>timeZone</b></td>
    <td style="vertical-align:top">Time Zone to use</td>
    <td style="vertical-align:top"><b>'Europe/Rome'</b></td>
</tr>
<tr>
    <td style="vertical-align:top"><b>sequence</b></td>
    <td style="vertical-align:top">The extractor sub-modules sequence</td>
    <td style="vertical-align:top"><b>[
  'absolute',
  'canonical',
  'relativeStep',
  'relativeRange',
  'relativeAbsolute',
  'relativePeriod',
  'relativeWeekDay',
  'relative',
]</b></td>
</tr>
<tr>
    <td style="vertical-align:top"><b>vocabulary</b></td>
    <td style="vertical-align:top">The vocabulary of Italian terms to use to extract dates</td>
    <td style="vertical-align:top"><b>Default Vocabulary</b></td>
</tr>
<tr>
    <td style="vertical-align:top"><b>textProcessor</b></td>
    <td style="vertical-align:top">The text preprocessing sequence</td>
    <td style="vertical-align:top"><b>{
      stemmer: 'PorterStemmerIt',
      stopwords: true,
      duplicate: false,
      diacritics: true,
      punctuation: true,
      lowercase: true,
      trim: true,
      tokenize: true
    }</b></td>
</tr>
<tr>
    <td style="vertical-align:top"><b>verbose</b></td>
    <td style="vertical-align:top">To let Extractor print out every processing step</td>
    <td style="vertical-align:top"><b>false</b></td>
</tr>
</tbody>
</table>

## Extract Method

<a id="markdown-extract-method" name="extract-method"></a>

The asynchronous Extract method can take as input: a string, an array of strings, a readable stream.

```javascript
await DE.extract(data, [{ params }]);
```

And it can be configured with the following parameters:

<table>
<tr>
<th>Param</th><th>Description</th><th>Default</th>
</tr>
<tbody>
<tr>
    <td style="vertical-align:top"><b>now</b></td>
    <td style="vertical-align:top">The reference date [override constructor time zone]</td>
    <td style="vertical-align:top"><b>Date.now()</b></td>
</tr>
<tr>
    <td style="vertical-align:top"><b>timeZone</b></td>
    <td style="vertical-align:top">Time Zone to use [override constructor time zone]</td>
    <td style="vertical-align:top"><b>'Europe/Rome'</b></td>
</tr>
<tr>
    <td style="vertical-align:top"><b>cb</b></td>
    <td style="vertical-align:top">A callback to invoke on every data extraction</td>
    <td style="vertical-align:top"><b></b></b></td>
</tr>
<tr>
    <td style="vertical-align:top"><b>outStream</b></td>
    <td style="vertical-align:top">A writable stream to write data to on every extraction</td>
    <td style="vertical-align:top"><b></b></td>
</tr>
</tbody>
</table>

### Events

<a id="markdown-events" name="events"></a>

L'Extractor emette un evento con label "data" ad ogni estrazione di dato

```javascript
DE.on('data', (data) => {
  console.log(data);
  console.log(' ');
});
```
