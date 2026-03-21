#!/usr/bin/env node
/**
 * One-shot: insert statsSummaryModal i18n keys after downloadImage (before close).
 * Run from repo root: node scripts/patch-stats-summary-modal-i18n.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'js');

const STRINGS = {
  id: { columnTotal: 'Total', columnAverage: 'Rata-rata', fullScreenTooltip: 'Buka grafik dalam layar penuh', downloadImageTooltip: 'Unduh grafik sebagai gambar PNG' },
  af: { columnTotal: 'Totaal', columnAverage: 'Gemiddeld', fullScreenTooltip: 'Bekyk grafiek volskerm', downloadImageTooltip: 'Laai grafiek as PNG af' },
  ar: { columnTotal: 'الإجمالي', columnAverage: 'المتوسط', fullScreenTooltip: 'عرض الرسم البياني ملء الشاشة', downloadImageTooltip: 'تنزيل الرسم البياني كصورة PNG' },
  'pt-BR': { columnTotal: 'Total', columnAverage: 'Média', fullScreenTooltip: 'Ver gráfico em tela cheia', downloadImageTooltip: 'Baixar gráfico como PNG' },
  zh: { columnTotal: '合计', columnAverage: '平均', fullScreenTooltip: '全屏查看图表', downloadImageTooltip: '将图表下载为 PNG 图片' },
  cs: { columnTotal: 'Celkem', columnAverage: 'Průměr', fullScreenTooltip: 'Zobrazit graf na celou obrazovku', downloadImageTooltip: 'Stáhnout graf jako PNG' },
  da: { columnTotal: 'I alt', columnAverage: 'Gennemsnit', fullScreenTooltip: 'Vis diagram i fuld skærm', downloadImageTooltip: 'Download diagram som PNG' },
  nl: { columnTotal: 'Totaal', columnAverage: 'Gemiddelde', fullScreenTooltip: 'Grafiek volledig scherm weergeven', downloadImageTooltip: 'Grafiek downloaden als PNG' },
  fi: { columnTotal: 'Yhteensä', columnAverage: 'Keskiarvo', fullScreenTooltip: 'Näytä kaavio koko näytöllä', downloadImageTooltip: 'Lataa kaavio PNG-kuvana' },
  it: { columnTotal: 'Totale', columnAverage: 'Media', fullScreenTooltip: 'Visualizza il grafico a schermo intero', downloadImageTooltip: 'Scarica il grafico come PNG' },
  de: { columnTotal: 'Gesamt', columnAverage: 'Durchschnitt', fullScreenTooltip: 'Diagramm im Vollbild anzeigen', downloadImageTooltip: 'Diagramm als PNG herunterladen' },
  fr: { columnTotal: 'Total', columnAverage: 'Moyenne', fullScreenTooltip: 'Afficher le graphique en plein écran', downloadImageTooltip: 'Télécharger le graphique au format PNG' },
  el: { columnTotal: 'Σύνολο', columnAverage: 'Μέσος όρος', fullScreenTooltip: 'Προβολή γραφήματος πλήρους οθόνης', downloadImageTooltip: 'Λήψη γραφήματος ως PNG' },
  hi: { columnTotal: 'कुल', columnAverage: 'औसत', fullScreenTooltip: 'चार्ट पूर्ण स्क्रीन में देखें', downloadImageTooltip: 'चार्ट PNG के रूप में डाउनलोड करें' },
  ja: { columnTotal: '合計', columnAverage: '平均', fullScreenTooltip: 'チャートを全画面表示', downloadImageTooltip: 'チャートを PNG でダウンロード' },
  ko: { columnTotal: '합계', columnAverage: '평균', fullScreenTooltip: '차트를 전체 화면으로 보기', downloadImageTooltip: '차트를 PNG로 다운로드' },
  no: { columnTotal: 'Totalt', columnAverage: 'Gjennomsnitt', fullScreenTooltip: 'Vis diagram i fullskjerm', downloadImageTooltip: 'Last ned diagram som PNG' },
  pl: { columnTotal: 'Suma', columnAverage: 'Średnia', fullScreenTooltip: 'Wyświetl wykres na pełnym ekranie', downloadImageTooltip: 'Pobierz wykres jako PNG' },
  pt: { columnTotal: 'Total', columnAverage: 'Média', fullScreenTooltip: 'Ver gráfico em ecrã inteiro', downloadImageTooltip: 'Transferir gráfico como PNG' },
  ru: { columnTotal: 'Итого', columnAverage: 'Среднее', fullScreenTooltip: 'Показать диаграмму на весь экран', downloadImageTooltip: 'Скачать диаграмму как PNG' },
  es: { columnTotal: 'Total', columnAverage: 'Media', fullScreenTooltip: 'Ver gráfico a pantalla completa', downloadImageTooltip: 'Descargar gráfico como PNG' },
  sv: { columnTotal: 'Totalt', columnAverage: 'Genomsnitt', fullScreenTooltip: 'Visa diagram i helskärm', downloadImageTooltip: 'Ladda ner diagram som PNG' },
  tr: { columnTotal: 'Toplam', columnAverage: 'Ortalama', fullScreenTooltip: 'Grafiği tam ekran göster', downloadImageTooltip: 'Grafiği PNG olarak indir' },
  uk: { columnTotal: 'Разом', columnAverage: 'Середнє', fullScreenTooltip: 'Показати діаграму на весь екран', downloadImageTooltip: 'Завантажити діаграму як PNG' }
};

function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function patchFile(filePath, localeKey) {
  let text = fs.readFileSync(filePath, 'utf8');
  const needle = /("downloadImage": "[^"]*",)\s*\n(\s*"close":)/;
  if (!needle.test(text)) {
    console.error('Skip (pattern not found):', filePath);
    return false;
  }
  const s = STRINGS[localeKey];
  if (!s) {
    console.error('No strings for locale', localeKey, filePath);
    return false;
  }
  const insert =
    '$1\n' +
    `      "columnTotal": "${esc(s.columnTotal)}",\n` +
    `      "columnAverage": "${esc(s.columnAverage)}",\n` +
    `      "fullScreenTooltip": "${esc(s.fullScreenTooltip)}",\n` +
    `      "downloadImageTooltip": "${esc(s.downloadImageTooltip)}",\n` +
    '$2';
  const next = text.replace(needle, insert);
  if (next === text) return false;
  fs.writeFileSync(filePath, next, 'utf8');
  return true;
}

const files = [
  ['i18n-id-locale.js', 'id'],
  ['i18n-af-locale.js', 'af'],
  ['i18n-ar-locale.js', 'ar'],
  ['i18n-pt-br-locale.js', 'pt-BR'],
  ['i18n-zh-locale.js', 'zh'],
  ['i18n-cs-locale.js', 'cs'],
  ['i18n-da-locale.js', 'da'],
  ['i18n-nl-locale.js', 'nl'],
  ['i18n-fi-locale.js', 'fi'],
  ['i18n-it-locale.js', 'it'],
  ['i18n-de-locale.js', 'de'],
  ['i18n-fr-locale.js', 'fr'],
  ['i18n-el-locale.js', 'el'],
  ['i18n-hi-locale.js', 'hi'],
  ['i18n-ja-locale.js', 'ja'],
  ['i18n-ko-locale.js', 'ko'],
  ['i18n-no-locale.js', 'no'],
  ['i18n-pl-locale.js', 'pl'],
  ['i18n-pt-locale.js', 'pt'],
  ['i18n-ru-locale.js', 'ru'],
  ['i18n-es-locale.js', 'es'],
  ['i18n-sv-locale.js', 'sv'],
  ['i18n-tr-locale.js', 'tr'],
  ['i18n-uk-locale.js', 'uk']
];

let n = 0;
for (const [name, key] of files) {
  const p = path.join(ROOT, name);
  if (patchFile(p, key)) {
    n++;
    console.log('Patched', name);
  }
}
console.log('Done, patched', n, 'files');
