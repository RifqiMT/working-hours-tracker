#!/usr/bin/env node
/**
 * One-off: insert statsSummaryModal date-range strings into all manual locale packs.
 * Run from repo root: node scripts/patch-stats-summary-date-locales.js
 */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var jsDir = path.join(ROOT, 'js');

var PACKS = [
  {
    file: 'i18n-af-locale.js',
    anchor: 'langs die tydlyn. By Besonderhede',
    insert:
      ' Gebruik Datum van / Datum tot hier onder om ’n inklusiewe reeks vir alle grafieke vas te pen; laat leeg om die tydlyn uit filters en data af te lei. ',
    dateFromLabel: 'Datum van',
    dateToLabel: 'Datum tot',
    dateRangeHint:
      'Opsioneel: inklusiewe reeks vir elke grafiek. Leeg beteken gefiltreerde data en inskrywingslysreëls (bv. jongste inskrywing of filterjaar).',
    dateClear: 'Vee datums uit',
    viewAnnually: 'Jaarliks',
    fullScreen: 'Volskerm'
  },
  {
    file: 'i18n-ar-locale.js',
    anchor: 'على الخط الزمني. في التفاصيل',
    insert:
      ' استخدم «من تاريخ» / «إلى تاريخ» أدناه لتثبيت نطاق شامل لكل المخططات؛ اترك الحقلين فارغَين لاشتقاق الخط الزمني من المرشحات والبيانات. ',
    dateFromLabel: 'من تاريخ',
    dateToLabel: 'إلى تاريخ',
    dateRangeHint:
      'اختياري: نطاق شامل لكل مخطط. عند ترك الحقلين فارغين تُستخدم البيانات المصفاة وقواعد قائمة الإدخالات (مثل أحدث إدخال أو سنة التصفية).',
    dateClear: 'مسح التواريخ',
    viewAnnually: 'سنويا',
    fullScreen: 'شاشة كاملة'
  },
  {
    file: 'i18n-cs-locale.js',
    anchor: 'na časové ose. V části Podrobnosti',
    insert:
      ' Pomocí polí Datum od / Datum do níže můžete pro všechny grafy stanovit inkluzivní rozsah; prázdná pole znamenají časovou osu podle filtrů a dat. ',
    dateFromLabel: 'Datum od',
    dateToLabel: 'Datum do',
    dateRangeHint:
      'Volitelné: inkluzivní rozsah pro každý graf. Prázdná pole = filtrovaná data a pravidla seznamu záznamů (např. poslední záznam nebo rok filtru).',
    dateClear: 'Vymazat data',
    viewAnnually: 'Ročně',
    fullScreen: 'Celá obrazovka'
  },
  {
    file: 'i18n-da-locale.js',
    anchor: 'langs tidslinjen. Under Detaljer',
    insert:
      ' Brug Dato fra / Dato til nedenfor for at fastlægge et inklusivt interval for alle diagrammer; lad felterne være tomme for at udlede tidslinjen fra filtre og data. ',
    dateFromLabel: 'Dato fra',
    dateToLabel: 'Dato til',
    dateRangeHint:
      'Valgfrit: inklusivt interval for hvert diagram. Tomme felter bruger filtrerede data og regler for postlisten (f.eks. seneste post eller filterår).',
    dateClear: 'Ryd datoer',
    viewAnnually: 'Årlig',
    fullScreen: 'Fuld skærm'
  },
  {
    file: 'i18n-de-locale.js',
    anchor: 'entlang der Zeitachse. Unter Details',
    insert:
      ' Über „Datum von“ / „Datum bis“ unten legen Sie einen inklusiven Bereich für alle Diagramme fest; lassen Sie die Felder leer, um die Zeitachse aus Filtern und Daten abzuleiten. ',
    dateFromLabel: 'Datum von',
    dateToLabel: 'Datum bis',
    dateRangeHint:
      'Optional: inklusiver Bereich für jedes Diagramm. Leer bedeutet gefilterte Daten und Regeln der Eintragsliste (z. B. letzter Eintrag oder Filterjahr).',
    dateClear: 'Daten löschen',
    viewAnnually: 'Jährlich',
    fullScreen: 'Vollbild'
  },
  {
    file: 'i18n-el-locale.js',
    anchor: 'στη χρονική γραμμή. Στην ενότητα Λεπτομέρειες',
    insert:
      ' Χρησιμοποιήστε «Ημερομηνία από» / «Ημερομηνία έως» παρακάτω για να ορίσετε ένα συμπεριληπτικό εύρος για όλα τα διαγράμματα· αφήστε κενά ώστε η χρονική γραμμή να προκύπτει από φίλτρα και δεδομένα. ',
    dateFromLabel: 'Ημερομηνία από',
    dateToLabel: 'Ημερομηνία έως',
    dateRangeHint:
      'Προαιρετικό: συμπεριληπτικό εύρος για κάθε διάγραμμα. Κενά πεδία: φιλτραρισμένα δεδομένα και κανόνες λίστας καταχωρίσεων (π.χ. τελευταία καταχώριση ή έτος φίλτρου).',
    dateClear: 'Εκκαθάριση ημερομηνιών',
    viewAnnually: 'Ετησίως',
    fullScreen: 'Πλήρης οθόνη'
  },
  {
    file: 'i18n-es-locale.js',
    anchor: 'en la línea de tiempo. En Detalles',
    insert:
      ' Use Fecha desde / Fecha hasta abajo para fijar un rango inclusivo en todos los gráficos; déjelos vacíos para obtener la línea de tiempo a partir de filtros y datos. ',
    dateFromLabel: 'Fecha desde',
    dateToLabel: 'Fecha hasta',
    dateRangeHint:
      'Opcional: rango inclusivo para cada gráfico. Vacío: datos filtrados y reglas de la lista de entradas (p. ej. última entrada o año del filtro).',
    dateClear: 'Borrar fechas',
    viewAnnually: 'Anualmente',
    fullScreen: 'Pantalla completa'
  },
  {
    file: 'i18n-fi-locale.js',
    anchor: 'aikajanalle. Tiedoissa',
    insert:
      ' Aseta kaikkien kaavioiden sisältävä väli alla olevilla Päivä alkaen / Päivä asti -kentillä; jätä tyhjäksi, jolloin aikajana johdetaan suodattimista ja tiedoista. ',
    dateFromLabel: 'Päivä alkaen',
    dateToLabel: 'Päivä asti',
    dateRangeHint:
      'Valinnainen: sisältävä väli jokaiselle kaaviolle. Tyhjä: suodatetut tiedot ja merkintölistan säännöt (esim. viimeisin merkintä tai suodatusvuosi).',
    dateClear: 'Tyhjennä päivät',
    viewAnnually: 'Vuosittain',
    fullScreen: 'Koko näyttö'
  },
  {
    file: 'i18n-fr-locale.js',
    anchor: 'sur la ligne du temps. Dans Détails,',
    insert:
      ' Utilisez Date de début / Date de fin ci-dessous pour fixer une plage inclusive pour tous les graphiques ; laissez vide pour déduire la ligne du temps à partir des filtres et des données. ',
    dateFromLabel: 'Date de début',
    dateToLabel: 'Date de fin',
    dateRangeHint:
      'Facultatif : plage inclusive pour chaque graphique. Vide : données filtrées et règles de la liste des entrées (p. ex. dernière entrée ou année du filtre).',
    dateClear: 'Effacer les dates',
    viewAnnually: 'Annuellement',
    fullScreen: 'Plein écran'
  },
  {
    file: 'i18n-hi-locale.js',
    anchor: 'समयरेखा पर समूहित करता है। विवरण में',
    insert:
      ' नीचे «तिथि से» / «तिथि तक» से सभी चार्ट के लिए समावेशी सीमा निर्धारित करें; खाली छोड़ने पर फ़िल्टर और डेटा से समयरेखा बनेगी। ',
    dateFromLabel: 'तिथि से',
    dateToLabel: 'तिथि तक',
    dateRangeHint:
      'वैकल्पिक: प्रत्येक चार्ट के लिए समावेशी सीमा। खाली = फ़िल्टर किया डेटा और प्रविष्टि सूची नियम (जैसे नवीनतम प्रविष्टि या फ़िल्टर वर्ष)।',
    dateClear: 'तिथियाँ साफ़ करें',
    viewAnnually: 'हर साल',
    fullScreen: 'पूर्ण स्क्रीन'
  },
  {
    file: 'i18n-id-locale.js',
    anchor: 'di garis waktu. Di Detail',
    insert:
      ' Gunakan Tanggal mulai / Tanggal sampai di bawah untuk membatasi rentang inklusif semua grafik; kosongkan agar garis waktu mengikuti filter dan data. ',
    dateFromLabel: 'Tanggal mulai',
    dateToLabel: 'Tanggal sampai',
    dateRangeHint:
      'Opsional: rentang inklusif untuk setiap grafik. Kosong berarti memakai data terfilter dan aturan daftar entri (mis. entri terbaru atau tahun filter).',
    dateClear: 'Hapus tanggal',
    viewAnnually: 'Tahunan',
    fullScreen: 'Layar penuh'
  },
  {
    file: 'i18n-it-locale.js',
    anchor: 'sulla linea temporale. In Dettaglio',
    insert:
      ' Usa Data da / Data a sotto per fissare un intervallo inclusivo per tutti i grafici; lascia vuoto per derivare la linea temporale da filtri e dati. ',
    dateFromLabel: 'Data da',
    dateToLabel: 'Data a',
    dateRangeHint:
      'Facoltativo: intervallo inclusivo per ogni grafico. Vuoto: dati filtrati e regole dell’elenco voci (es. ultima voce o anno del filtro).',
    dateClear: 'Cancella date',
    viewAnnually: 'Annualmente',
    fullScreen: 'A schermo intero'
  },
  {
    file: 'i18n-ja-locale.js',
    anchor: 'タイムライン上でまとめます。「詳細」では',
    insert:
      ' 下の「開始日」／「終了日」で全チャートの範囲（両端を含む）を固定できます。空欄にするとフィルターとデータからタイムラインが決まります。',
    dateFromLabel: '開始日',
    dateToLabel: '終了日',
    dateRangeHint:
      '任意：各チャートの包含範囲。空欄時はフィルター済みデータとエントリー一覧のルール（例：最新エントリーやフィルター年）に従います。',
    dateClear: '日付をクリア',
    viewAnnually: '毎年',
    fullScreen: '全画面表示'
  },
  {
    file: 'i18n-ko-locale.js',
    anchor: '시간 축으로 묶습니다. 세부 정보에서는',
    insert:
      ' 아래 시작일 / 종료일로 모든 차트의 포함 범위를 고정할 수 있습니다. 비워 두면 필터와 데이터에서 시간 축을 따릅니다. ',
    dateFromLabel: '시작일',
    dateToLabel: '종료일',
    dateRangeHint:
      '선택: 각 차트의 포함 범위입니다. 비어 있으면 필터된 데이터와 항목 목록 규칙(예: 최신 항목 또는 필터 연도)을 따릅니다.',
    dateClear: '날짜 지우기',
    viewAnnually: '매년',
    fullScreen: '전체 화면'
  },
  {
    file: 'i18n-nl-locale.js',
    anchor: 'op de tijdlijn. Bij Details',
    insert:
      ' Gebruik hieronder Datum van / Datum tot om een inclusief bereik voor alle grafieken vast te zetten; laat leeg om de tijdlijn uit filters en gegevens af te leiden. ',
    dateFromLabel: 'Datum van',
    dateToLabel: 'Datum tot',
    dateRangeHint:
      'Optioneel: inclusief bereik voor elke grafiek. Leeg: gefilterde gegevens en regels van de invoerlijst (bijv. laatste invoer of filterjaar).',
    dateClear: 'Datums wissen',
    viewAnnually: 'Jaarlijks',
    fullScreen: 'Volledig scherm'
  },
  {
    file: 'i18n-no-locale.js',
    anchor: 'langs tidslinjen. Under Detaljer',
    insert:
      ' Bruk Fra dato / Til dato nedenfor for å feste et inklusivt intervall for alle diagrammer; la feltene stå tomme for å utlede tidslinjen fra filtre og data. ',
    dateFromLabel: 'Fra dato',
    dateToLabel: 'Til dato',
    dateRangeHint:
      'Valgfritt: inklusivt intervall for hvert diagram. Tomme felt: filtrerte data og regler for oppføringslisten (f.eks. siste oppføring eller filterår).',
    dateClear: 'Tøm datoer',
    viewAnnually: 'Årlig',
    fullScreen: 'Fullskjerm'
  },
  {
    file: 'i18n-pl-locale.js',
    anchor: 'na osi czasu. W Szczegółach',
    insert:
      ' Użyj poniżej Data od / Data do, aby ustawić inkluzywny zakres dla wszystkich wykresów; pozostaw puste, aby oś czasu wynikała z filtrów i danych. ',
    dateFromLabel: 'Data od',
    dateToLabel: 'Data do',
    dateRangeHint:
      'Opcjonalnie: inkluzywny zakres dla każdego wykresu. Puste: przefiltrowane dane i zasady listy wpisów (np. ostatni wpis lub rok filtra).',
    dateClear: 'Wyczyść daty',
    viewAnnually: 'Rocznie',
    fullScreen: 'Pełny ekran'
  },
  {
    file: 'i18n-pt-br-locale.js',
    anchor: 'na linha do tempo. Em Detalhes,',
    insert:
      ' Use Data inicial / Data final abaixo para fixar um intervalo inclusivo em todos os gráficos; deixe em branco para derivar a linha do tempo dos filtros e dos dados. ',
    dateFromLabel: 'Data inicial',
    dateToLabel: 'Data final',
    dateRangeHint:
      'Opcional: intervalo inclusivo para cada gráfico. Em branco: dados filtrados e regras da lista de entradas (ex.: última entrada ou ano do filtro).',
    dateClear: 'Limpar datas',
    viewAnnually: 'Anual',
    fullScreen: 'Tela cheia'
  },
  {
    file: 'i18n-pt-locale.js',
    anchor: 'na linha temporal. Em Detalhes,',
    insert:
      ' Utilize Data de início / Data de fim abaixo para fixar um intervalo inclusivo em todos os gráficos; deixe em branco para derivar a linha temporal dos filtros e dos dados. ',
    dateFromLabel: 'Data de início',
    dateToLabel: 'Data de fim',
    dateRangeHint:
      'Opcional: intervalo inclusivo para cada gráfico. Em branco: dados filtrados e regras da lista de entradas (ex.: última entrada ou ano do filtro).',
    dateClear: 'Limpar datas',
    viewAnnually: 'Anualmente',
    fullScreen: 'Tela cheia'
  },
  {
    file: 'i18n-ru-locale.js',
    anchor: 'на шкале времени. В разделе «Детали»',
    insert:
      ' Ниже задайте «Дата с» / «Дата по», чтобы зафиксировать включающий диапазон для всех диаграмм; оставьте пустым, чтобы шкала времени выводилась из фильтров и данных. ',
    dateFromLabel: 'Дата с',
    dateToLabel: 'Дата по',
    dateRangeHint:
      'Необязательно: включающий диапазон для каждой диаграммы. Пусто: отфильтрованные данные и правила списка записей (например, последняя запись или год фильтра).',
    dateClear: 'Сбросить даты',
    viewAnnually: 'Ежегодно',
    fullScreen: 'Полноэкранный'
  },
  {
    file: 'i18n-sv-locale.js',
    anchor: 'längs tidslinjen. Under Detaljer',
    insert:
      ' Använd Datum från / Datum till nedan för att låsa ett inklusivt intervall för alla diagram; lämna tomt för att härleda tidslinjen från filter och data. ',
    dateFromLabel: 'Datum från',
    dateToLabel: 'Datum till',
    dateRangeHint:
      'Valfritt: inklusivt intervall för varje diagram. Tomt: filtrerad data och regler för postlistan (t.ex. senaste post eller filterår).',
    dateClear: 'Rensa datum',
    viewAnnually: 'Årligen',
    fullScreen: 'Helskärm'
  },
  {
    file: 'i18n-tr-locale.js',
    anchor: 'zaman çizelgesinde gruplar. Ayrıntılar\u2019da',
    insert:
      ' Aşağıdaki Başlangıç tarihi / Bitiş tarihi ile tüm grafikler için kapsayıcı aralığı sabitleyin; boş bırakırsanız zaman çizelgesi süzgeçlerden ve verilerden türetilir. ',
    dateFromLabel: 'Başlangıç tarihi',
    dateToLabel: 'Bitiş tarihi',
    dateRangeHint:
      'İsteğe bağlı: her grafik için kapsayıcı aralık. Boş: süzülmüş veriler ve kayıt listesi kuralları (ör. son kayıt veya süzgeç yılı).',
    dateClear: 'Tarihleri temizle',
    viewAnnually: 'Yıllık',
    fullScreen: 'Tam ekran'
  },
  {
    file: 'i18n-uk-locale.js',
    anchor: 'на часовій шкалі. У розділі «Деталі»',
    insert:
      ' Нижче задайте «Дата від» / «Дата до», щоб закріпити включний діапазон для всіх діаграм; залиште порожнім, щоб часова шкала виводилася з фільтрів і даних. ',
    dateFromLabel: 'Дата від',
    dateToLabel: 'Дата до',
    dateRangeHint:
      'Необов’язково: включний діапазон для кожної діаграми. Порожньо: відфільтровані дані та правила списку записів (наприклад, останній запис або рік фільтра).',
    dateClear: 'Очистити дати',
    viewAnnually: 'Щорічно',
    fullScreen: 'Повний екран'
  },
  {
    file: 'i18n-zh-locale.js',
    anchor: '沿时间轴对该子集分组。在“明细”中',
    insert: ' 使用下方的开始日期 / 结束日期可为所有图表固定包含端点的区间；留空则按筛选与数据决定时间轴。',
    dateFromLabel: '开始日期',
    dateToLabel: '结束日期',
    dateRangeHint:
      '可选：每个图表的包含端点区间。留空时使用已筛选数据及条目列表规则（例如最新条目或筛选年份）。',
    dateClear: '清除日期',
    viewAnnually: '按年',
    fullScreen: '全屏'
  }
];

function escJsonStr(s) {
  return JSON.stringify(s).slice(1, -1);
}

PACKS.forEach(function (p) {
  var fp = path.join(jsDir, p.file);
  var text = fs.readFileSync(fp, 'utf8');
  if (text.indexOf('"dateFromLabel"') !== -1) {
    console.log('skip (already patched): ' + p.file);
    return;
  }
  if (text.indexOf(p.anchor) === -1) {
    throw new Error('Anchor not found in ' + p.file + ': ' + p.anchor);
  }
  text = text.split(p.anchor).join(p.anchor + p.insert);

  var blockNeedle =
    '      "viewAnnually": "' + escJsonStr(p.viewAnnually) + '",\n      "fullScreen":';
  if (text.indexOf(blockNeedle) === -1) {
    throw new Error('viewAnnually block not found in ' + p.file);
  }
  var blockRepl =
    '      "viewAnnually": "' +
    escJsonStr(p.viewAnnually) +
    '",\n      "dateFromLabel": "' +
    escJsonStr(p.dateFromLabel) +
    '",\n      "dateToLabel": "' +
    escJsonStr(p.dateToLabel) +
    '",\n      "dateRangeHint": "' +
    escJsonStr(p.dateRangeHint) +
    '",\n      "dateClear": "' +
    escJsonStr(p.dateClear) +
    '",\n      "fullScreen":';
  text = text.split(blockNeedle).join(blockRepl);

  fs.writeFileSync(fp, text, 'utf8');
  console.log('patched: ' + p.file);
});

console.log('done');
