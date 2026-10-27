/* ==========================================================
   OECHSLIN OUTDOOR — dati spedizioni, condivisi tra la home
   (globo, carosello Experiences) e l'archivio completo
   (expeditions/index.html). Caricato PRIMA di script.js.

   `featured: true` = compare tra le 3 in evidenza in home.
   L'archivio (expeditions/index.html) mostra sempre tutte
   le spedizioni, indipendentemente da `featured`.

   Convenzione cartelle: ogni spedizione vive in
   expeditions/ox-XXX-nome-spedizione/ (es. expeditions/ox-004-nome/):
   codice E nome insieme, non uno dei due da solo — vale anche per
   le prossime spedizioni.
========================================================== */

const EXPEDITIONS = [
  {
    code: 'OX-000',
    title: "Lago d'Orta",
    isOrigin: true,
    description: "Il territorio di nascita del progetto.",
    lat: 45.82, lon: 8.40
  },
  {
    code: 'OX-001',
    title: 'Atlas Crossing',
    subtitle: 'Marocco · Bikepacking Expedition',
    description: "Attraversamento in sette tappe dall'Alto Atlante alle dune del Sahara, tra piste di montagna, gole e altipiani desertici.",
    lat: 31.63, lon: -7.99,
    photo: 'expeditions/ox-001-atlas-crossing/img/hero.jpg',
    href: 'expeditions/ox-001-atlas-crossing/index.html',
    featured: true,
    stats: { km: 598, elevation: 5150, stages: 7, ecosystems: 3, difficulty: 4 },
    route: [
      { code: '01', place: 'Marrakech', km: 0, elevation: 0, desc: "Briefing e messa a punto dei mezzi nella Medina, prima del via." },
      { code: '02', place: 'Telouet', km: 78, elevation: 1650, desc: "Prima ascesa verso l'Alto Atlante: piste dure, pendenze costanti, quota che sale in fretta." },
      { code: '03', place: 'Aït Benhaddou', km: 62, elevation: 450, desc: "Discesa lungo il canyon della Valle dell'Ounila, tra rocce rosse e villaggi fortificati di fango." },
      { code: '04', place: 'Gole del Dades', km: 110, elevation: 1900, desc: "La tappa più dura: i tornanti in quota sulle pareti della gola." },
      { code: '05', place: 'Gole del Todra', km: 85, elevation: 800, desc: "Traversata tecnica su fondo sconnesso, chiusa dentro le pareti verticali del Todra." },
      { code: '06', place: 'Erfoud', km: 135, elevation: 250, desc: "Trasferimento lungo e veloce: le montagne lasciano spazio ai primi falsipiani desertici." },
      { code: '07', place: 'Merzouga', km: 50, elevation: 150, desc: "Le piste sabbiose portano alle dune dell'Erg Chebbi, alle porte del Sahara." }
    ]
  },
  {
    code: 'OX-002',
    title: 'Adriatic Route',
    subtitle: 'Italia · Bikepacking',
    description: "Da Trieste a Santa Maria di Leuca lungo la Ciclovia Adriatica: l'intera costa italiana, sette regioni, in bici.",
    lat: 43.6, lon: 13.5,
    photo: 'expeditions/ox-002-adriatic-route/img/hero_bici.jpg',
    href: 'expeditions/ox-002-adriatic-route/index.html',
    featured: true,
    stats: { km: 1374, elevation: 1455, stages: 16, regions: 7, difficulty: 3 }
  },
  {
    code: 'OX-003',
    title: 'Monte Bianco Traverse',
    subtitle: 'Alpi · Alpine Trail',
    description: "Il Tour du Mont Blanc: un anello di 170 km attorno al massiccio, tra Francia, Italia e Svizzera.",
    lat: 45.83, lon: 6.86,
    photo: 'expeditions/ox-003-monte-bianco-traverse/img/montebianco.jpg',
    href: 'expeditions/ox-003-monte-bianco-traverse/index.html',
    featured: true,
    stats: { km: 170, elevation: 10140, stages: 11, regions: 3, difficulty: 4 }
  },
  {
    code: 'OX-004',
    title: 'Markha Valley Trek',
    subtitle: 'Ladakh, India · Alta Quota',
    description: "Nello Hemis National Park, tra villaggi buddhisti e due passi oltre i 4.900 m, fino al Kongmaru La a 5.200 m.",
    lat: 33.90, lon: 77.40,
    photo: 'expeditions/ox-004-markha-valley/img/ladakh.jpg',
    href: 'expeditions/ox-004-markha-valley/index.html',
    // non featured: le 3 in evidenza in home sono già occupate da
    // OX-001/002/003 — questa resta nell'archivio finché non si
    // decide di farla entrare al posto di un'altra.
    stats: { km: 70, elevation: 3330, stages: 8, regions: 1, difficulty: 5 }
  }
];
