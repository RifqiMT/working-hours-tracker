#!/usr/bin/env node
/**
 * Adds statsSummaryEnlargeModal navigation strings to manual locale packs.
 * Run: node scripts/patch-enlarge-nav-i18n.js
 */
'use strict';

var fs = require('fs');
var path = require('path');

var jsDir = path.join(__dirname, '..', 'js');

var EXTRA_AFTER_CHARTS_NAV = {
  af: ',\n      "prevChartShows": "Vorige grafiek: {name}",\n      "nextChartShows": "Volgende grafiek: {name}",\n      "navNoPrevious": "Eerste grafiek",\n      "navNoNext": "Laaste grafiek"',
  ar: ',\n      "prevChartShows": "المخطط السابق: {name}",\n      "nextChartShows": "المخطط التالي: {name}",\n      "navNoPrevious": "أول مخطط",\n      "navNoNext": "آخر مخطط"',
  de: ',\n      "prevChartShows": "Vorheriges Diagramm: {name}",\n      "nextChartShows": "Nächstes Diagramm: {name}",\n      "navNoPrevious": "Erstes Diagramm",\n      "navNoNext": "Letztes Diagramm"',
  el: ',\n      "prevChartShows": "Προηγούμενο διάγραμμα: {name}",\n      "nextChartShows": "Επόμενο διάγραμμα: {name}",\n      "navNoPrevious": "Πρώτο διάγραμμα",\n      "navNoNext": "Τελευταίο διάγραμμα"',
  es: ',\n      "prevChartShows": "Gráfico anterior: {name}",\n      "nextChartShows": "Gráfico siguiente: {name}",\n      "navNoPrevious": "Primer gráfico",\n      "navNoNext": "Último gráfico"',
  fi: ',\n      "prevChartShows": "Edellinen kaavio: {name}",\n      "nextChartShows": "Seuraava kaavio: {name}",\n      "navNoPrevious": "Ensimmäinen kaavio",\n      "navNoNext": "Viimeinen kaavio"',
  fr: ',\n      "prevChartShows": "Graphique précédent : {name}",\n      "nextChartShows": "Graphique suivant : {name}",\n      "navNoPrevious": "Premier graphique",\n      "navNoNext": "Dernier graphique"',
  hi: ',\n      "prevChartShows": "पिछला चार्ट: {name}",\n      "nextChartShows": "अगला चार्ट: {name}",\n      "navNoPrevious": "पहला चार्ट",\n      "navNoNext": "अंतिम चार्ट"',
  id: ',\n      "prevChartShows": "Grafik sebelumnya: {name}",\n      "nextChartShows": "Grafik berikutnya: {name}",\n      "navNoPrevious": "Grafik pertama",\n      "navNoNext": "Grafik terakhir"',
  it: ',\n      "prevChartShows": "Grafico precedente: {name}",\n      "nextChartShows": "Grafico successivo: {name}",\n      "navNoPrevious": "Primo grafico",\n      "navNoNext": "Ultimo grafico"',
  ja: ',\n      "prevChartShows": "前のチャート: {name}",\n      "nextChartShows": "次のチャート: {name}",\n      "navNoPrevious": "最初のチャート",\n      "navNoNext": "最後のチャート"',
  ko: ',\n      "prevChartShows": "이전 차트: {name}",\n      "nextChartShows": "다음 차트: {name}",\n      "navNoPrevious": "첫 번째 차트",\n      "navNoNext": "마지막 차트"',
  nl: ',\n      "prevChartShows": "Vorige grafiek: {name}",\n      "nextChartShows": "Volgende grafiek: {name}",\n      "navNoPrevious": "Eerste grafiek",\n      "navNoNext": "Laatste grafiek"',
  no: ',\n      "prevChartShows": "Forrige diagram: {name}",\n      "nextChartShows": "Neste diagram: {name}",\n      "navNoPrevious": "Første diagram",\n      "navNoNext": "Siste diagram"',
  pl: ',\n      "prevChartShows": "Poprzedni wykres: {name}",\n      "nextChartShows": "Następny wykres: {name}",\n      "navNoPrevious": "Pierwszy wykres",\n      "navNoNext": "Ostatni wykres"',
  pt: ',\n      "prevChartShows": "Gráfico anterior: {name}",\n      "nextChartShows": "Gráfico seguinte: {name}",\n      "navNoPrevious": "Primeiro gráfico",\n      "navNoNext": "Último gráfico"',
  ru: ',\n      "prevChartShows": "Предыдущая диаграмма: {name}",\n      "nextChartShows": "Следующая диаграмма: {name}",\n      "navNoPrevious": "Первая диаграмма",\n      "navNoNext": "Последняя диаграмма"',
  sv: ',\n      "prevChartShows": "Föregående diagram: {name}",\n      "nextChartShows": "Nästa diagram: {name}",\n      "navNoPrevious": "Första diagrammet",\n      "navNoNext": "Sista diagrammet"',
  tr: ',\n      "prevChartShows": "Önceki grafik: {name}",\n      "nextChartShows": "Sonraki grafik: {name}",\n      "navNoPrevious": "İlk grafik",\n      "navNoNext": "Son grafik"',
  uk: ',\n      "prevChartShows": "Попередня діаграма: {name}",\n      "nextChartShows": "Наступна діаграма: {name}",\n      "navNoPrevious": "Перша діаграма",\n      "navNoNext": "Остання діаграма"'
};

var FULL_BLOCK = {
  cs: '      "canvasAriaLabel": "Zvětšený graf",\n      "chartsNavAria": "Přepnout graf bez opuštění celé obrazovky",\n      "prevChart": "Předchozí",\n      "nextChart": "Další",\n      "prevChartShows": "Předchozí graf: {name}",\n      "nextChartShows": "Další graf: {name}",\n      "navNoPrevious": "První graf",\n      "navNoNext": "Poslední graf"',
  da: '      "canvasAriaLabel": "Forstørret diagram",\n      "chartsNavAria": "Skift diagram uden at forlade fuld skærm",\n      "prevChart": "Forrige",\n      "nextChart": "Næste",\n      "prevChartShows": "Forrige diagram: {name}",\n      "nextChartShows": "Næste diagram: {name}",\n      "navNoPrevious": "Første diagram",\n      "navNoNext": "Sidste diagram"',
  'pt-br':
    '      "canvasAriaLabel": "Gráfico ampliado",\n      "chartsNavAria": "Trocar de gráfico sem sair da tela cheia",\n      "prevChart": "Anterior",\n      "nextChart": "Próximo",\n      "prevChartShows": "Gráfico anterior: {name}",\n      "nextChartShows": "Próximo gráfico: {name}",\n      "navNoPrevious": "Primeiro gráfico",\n      "navNoNext": "Último gráfico"',
  zh: '      "canvasAriaLabel": "放大图表",\n      "chartsNavAria": "全屏模式下切换图表",\n      "prevChart": "上一个",\n      "nextChart": "下一个",\n      "prevChartShows": "上一个图表：{name}",\n      "nextChartShows": "下一个图表：{name}",\n      "navNoPrevious": "已是第一个图表",\n      "navNoNext": "已是最后一个图表"'
};

var files = fs.readdirSync(jsDir).filter(function (f) {
  return /^i18n-[a-z-]+-locale\.js$/.test(f);
});

files.forEach(function (f) {
  var fp = path.join(jsDir, f);
  var text = fs.readFileSync(fp, 'utf8');
  if (text.indexOf('"prevChartShows"') !== -1) {
    console.log('skip', f);
    return;
  }
  var lang = f.replace(/^i18n-/, '').replace(/-locale\.js$/, '');
  if (text.indexOf('"chartsNavAria"') !== -1) {
    var insert = EXTRA_AFTER_CHARTS_NAV[lang];
    if (!insert) {
      console.warn('no EXTRA for', lang, f);
      return;
    }
    var needle = /("chartsNavAria":\s*"[^"]*")(\s*\n\s*\})/;
    if (!needle.test(text)) {
      console.warn('chartsNavAria pattern miss', f);
      return;
    }
    text = text.replace(needle, '$1' + insert + '$2');
  } else {
    var block = FULL_BLOCK[lang];
    if (!block) {
      console.warn('no FULL_BLOCK for', lang, f);
      return;
    }
    var re = /("canvasAriaLabel":\s*"[^"]*")\s*\n(\s*\},\s*\n\s*"infographicModal")/;
    if (!re.test(text)) {
      console.warn('canvasAria pattern miss', f);
      return;
    }
    text = text.replace(re, block + '\n    $2');
  }
  fs.writeFileSync(fp, text, 'utf8');
  console.log('patched', f);
});

console.log('done');
