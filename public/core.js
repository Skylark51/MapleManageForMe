export const SYMBOL_DB = [
  ['아케인','소멸의 여로',200,20,40,80],
  ['아케인','츄츄 아일랜드',210,20,40,100],
  ['아케인','레헬른',220,20,40,120],
  ['아케인','아르카나',225,20,40,140],
  ['아케인','모라스',230,20,40,160],
  ['아케인','에스페라',235,20,40,180],
  ['그란디스','세르니움',260,11,30,132],
  ['그란디스','호텔 아르크스',265,11,15,150],
  ['그란디스','오디움',270,11,15,168],
  ['그란디스','도원경',275,11,15,186],
  ['그란디스','아르테리아',280,11,15,204],
  ['그란디스','카르시온',285,11,15,222],
  ['그란디스','탈라하트',290,11,15,398],
  ['그란디스','기어드락',295,11,15,488]
].map(([type,region,unlock,maxLevel,daily,costBase10]) => ({type,region,unlock,maxLevel,daily,costBase10}));

export const DAILY_EXP = [
  [200,732132258],[210,2141658246],[220,3189098250],[225,3305187639],[230,4398266165],[235,4530843954],
  [240,8397548775],[245,9057690000],[250,10225741680],[260,16455682080],[265,19372782409],[270,23246151120],
  [275,32127015480],[280,38593455264],[285,45635222880],[290,89730912960],[295,105641078400]
];

export const MP_DB = [
  [200,'소멸의 여로',359915080],[210,'츄츄 아일랜드',1285078680],[220,'레헬른',3217660990],[225,'아르카나',4707573370],
  [230,'모라스',5993511040],[235,'에스페라',6919667370],[240,'셀라스',8712814920],[245,'문브릿지',11716616500],
  [250,'고통의 미궁',14058901000],[255,'리멘',15552557400],[260,'세르니움',37474604460],[265,'호텔 아르크스',44435446300],
  [270,'오디움',52818835200],[275,'도원경',76639838000],[280,'아르테리아',107204032000],[285,'카르시온',156017856000],
  [290,'탈라하트',218575316000]
].map(([level,region,exp]) => ({level,region,exp}));

export const EXP_TABLE = {
  200:2207026470,201:2471869646,202:2768494003,203:3100713283,204:3472798876,205:3889534741,206:4356278909,207:4879032378,208:5464516263,209:6120258214,
  210:7344309856,211:8152183940,212:9048924173,213:10044305832,214:11149179473,215:13379015367,216:14583126750,217:15895608157,218:17326212891,219:18885572051,
  220:22662686461,221:24249074513,222:25946509728,223:27762765408,224:29706158986,225:35647390783,226:38142708137,227:40812697706,228:43669586545,229:46726457603,
  230:56071749123,231:57753901596,232:59486518643,233:61271114202,234:63109247628,235:75731097153,236:78003030067,237:80343120969,238:82753414598,239:85236017035,
  240:102283220442,241:105351717055,242:108512268566,243:111767636622,244:115120665720,245:138144798864,246:142289142829,247:146557817113,248:150954551626,249:155483188174,
  250:186579825808,251:192177220582,252:197942537199,253:203880813314,254:209997237713,255:216297154844,256:222786069489,257:229469651573,258:236353741120,259:243444353353,
  260:1731919984062,261:1749239183902,262:1766731575741,263:1784398891498,264:1802242880412,265:2342915744535,266:2366344901980,267:2390008350999,268:2413908434508,269:2438047518853,
  270:5412465491853,271:5466590146771,272:5521256048238,273:5576468608720,274:5632233294807,275:11377111255510,276:12514822381061,277:13766304619167,278:15142935081083,279:16657228589191,
  280:33647601750165,281:37012361925181,282:40713598117699,283:44784957929468,284:49263453722414,285:99512176519276,286:109463394171203,287:120409733588323,288:132450706947155,289:145695777641870,
  290:294305470836577,291:323736017920234,292:356109619712257,293:391720581683482,294:430892639851830,295:870403132500696,296:957443445750765,297:1053187790325840,298:1158506569358420,299:1737759854037630
};

export const BOSS_DB = [
  ['카오스 자쿰',8080000],['카오스 블러디퀸',8140000],['카오스 반반',8150000],['카오스 피에르',8170000],['하드 매그너스',8560000],['카오스 벨룸',9280000],
  ['카오스 파풀라투스',13100000],['노멀 스우',16700000],['노멀 데미안',17500000],['노멀 가디언 엔젤 슬라임',25500000],['이지 루시드',29800000],['이지 윌',32300000],
  ['노멀 루시드',35600000],['노멀 윌',41100000],['노멀 더스크',44000000],['노멀 듄켈',47500000],['하드 데미안',48900000],['하드 스우',51500000],
  ['하드 루시드',62900000],['카오스 더스크',69800000],['노멀 진 힐라',71200000],['카오스 가디언 엔젤 슬라임',75100000],['하드 윌',77100000],['하드 듄켈',94400000],
  ['하드 진 힐라',106000000],['노멀 선택받은 세렌',239000000],['이지 감시자 칼로스',280000000],['이지 최초의 대적자',308000000],['이지 카링',377000000],['노멀 감시자 칼로스',505000000]
].map(([name,price], progressionIndex) => ({name,price,progressionIndex}));

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

export function getBossSelection(capName) {
  const capIndex = BOSS_DB.findIndex((boss) => boss.name === capName);
  if (capIndex < 0) return [];
  return BOSS_DB
    .slice(0, capIndex + 1)
    .sort((a, b) => b.price - a.price)
    .slice(0, 12);
}

export function bossTotal(character) {
  return getBossSelection(character?.bossCap).reduce((sum, boss) => sum + boss.price, 0);
}

export function calculateWorldCrystalSummary(characters, worldLimit = 90) {
  const all = (characters || [])
    .flatMap((character) => getBossSelection(character?.bossCap).map((boss) => boss.price))
    .sort((a, b) => b - a);
  const sold = all.slice(0, worldLimit);
  return {
    totalCount: all.length,
    soldCount: sold.length,
    excludedCount: Math.max(0, all.length - worldLimit),
    mesos: sold.reduce((sum, price) => sum + price, 0)
  };
}

export function getMp(level) {
  const numericLevel = Number(level) || 0;
  let result = null;
  for (const row of MP_DB) if (numericLevel >= row.level) result = row;
  return result;
}

export function dailyExpAtLevel(level) {
  const numericLevel = Number(level) || 0;
  return DAILY_EXP
    .filter(([unlock]) => numericLevel >= unlock)
    .reduce((sum, [, exp]) => sum + exp, 0);
}

export function monsterParkWeeklyExp(level, runsPerWeek) {
  const mp = getMp(level);
  const runs = clamp(runsPerWeek, 0, 14);
  if (!mp || runs <= 0) return 0;
  return mp.exp * runs * (15 / 14);
}

export function monsterParkDailyAverage(level, runsPerWeek) {
  return monsterParkWeeklyExp(level, runsPerWeek) / 7;
}

export function calculateLevelEta(level, expRate, target, dailyEnabled, mpRuns) {
  const currentLevel = Number(level);
  const targetLevel = Number(target);
  const currentRate = clamp(expRate, 0, 100);
  if (!currentLevel || !targetLevel) return null;
  if (targetLevel < currentLevel) return null;
  if (targetLevel === currentLevel) return 0;
  if (currentLevel < 200 || targetLevel > 300) return null;

  let days = 0;
  for (let lv = currentLevel; lv < targetLevel; lv += 1) {
    const required = EXP_TABLE[lv];
    if (!required) return null;
    const remaining = required * (lv === currentLevel ? Math.max(0, 1 - currentRate / 100) : 1);
    const daily = (dailyEnabled ? dailyExpAtLevel(lv) : 0) + monsterParkDailyAverage(lv, mpRuns);
    if (daily <= 0) return Infinity;
    days += remaining / daily;
  }
  return days;
}

export function symbolRegionFromName(name = '') {
  const normalized = String(name)
    .replace(/^그랜드\s*어센틱심볼\s*:\s*/,'')
    .replace(/^어센틱심볼\s*:\s*/,'')
    .replace(/^아케인심볼\s*:\s*/,'')
    .trim();
  const aliases = {
    '아르크스': '호텔 아르크스',
    '호텔아르크스': '호텔 아르크스'
  };
  return aliases[normalized] || normalized;
}

export function symbolRequirement(type, level) {
  const lv = Number(level);
  return type === '아케인' ? lv * lv + 11 : 9 * lv * lv + 20 * lv;
}

export function symbolUpgradeCost(db, level) {
  const lv = Number(level);
  const requirement = symbolRequirement(db.type, lv);
  if (db.type === '아케인') {
    const factor10 = db.costBase10 + lv;
    return 10000 * Math.floor(requirement * factor10 / 10);
  }
  const factor10 = db.costBase10 - 6 * lv;
  return 100000 * Math.floor(requirement * factor10 / 10);
}

export function symbolCalc(db, apiSymbol = null) {
  const level = apiSymbol ? Number(apiSymbol.symbol_level || 0) : 1;
  const growth = apiSymbol ? Number(apiSymbol.symbol_growth_count || 0) : 0;
  const unowned = !apiSymbol;
  if (!level) return null;
  if (level >= db.maxLevel) {
    return { level, growth, remainingSymbols: 0, days: 0, mesos: 0, max: true, unowned };
  }

  let totalNeed = 0;
  let mesos = 0;
  for (let lv = level; lv < db.maxLevel; lv += 1) {
    totalNeed += symbolRequirement(db.type, lv);
    mesos += symbolUpgradeCost(db, lv);
  }
  const remainingSymbols = Math.max(0, totalNeed - growth);
  return {
    level,
    growth,
    remainingSymbols,
    days: Math.ceil(remainingSymbols / db.daily),
    mesos,
    max: false,
    unowned
  };
}

export function getSymbolMap(symbols = []) {
  const map = new Map();
  for (const symbol of symbols || []) map.set(symbolRegionFromName(symbol?.symbol_name), symbol);
  return map;
}

export function symbolSummary(level, symbols = [], symbolsAvailable = true) {
  if (!symbolsAvailable) {
    return { available: false, arcaneMesos: null, grandisMesos: null, arcaneDays: null, grandisDays: null };
  }
  const map = getSymbolMap(symbols);
  const result = { available: true, arcaneMesos: 0, grandisMesos: 0, arcaneDays: 0, grandisDays: 0 };
  for (const db of SYMBOL_DB) {
    if (Number(level) < db.unlock) continue;
    const calc = symbolCalc(db, map.get(db.region));
    if (!calc) continue;
    if (db.type === '아케인') {
      result.arcaneMesos += calc.mesos;
      result.arcaneDays = Math.max(result.arcaneDays, calc.days);
    } else {
      result.grandisMesos += calc.mesos;
      result.grandisDays = Math.max(result.grandisDays, calc.days);
    }
  }
  return result;
}

export function seoulDateKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function seoulWeeklyResetKey(now = new Date()) {
  const dateKey = seoulDateKey(now);
  const [year, month, day] = dateKey.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const daysSinceThursday = (utcDate.getUTCDay() - 4 + 7) % 7;
  utcDate.setUTCDate(utcDate.getUTCDate() - daysSinceThursday);
  return utcDate.toISOString().slice(0, 10);
}
