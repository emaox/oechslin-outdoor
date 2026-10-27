/* ==========================================================
   MONTE BIANCO TRAVERSE (OX-003) — dati specifici di questa spedizione.
   Carica PRIMA di ../../dossier.js, che legge queste globali.

   11 tappe classiche del Tour du Mont Blanc, senso antiorario da
   Les Houches (Francia → Italia → Svizzera → Francia). A differenza
   di Adriatic Route, qui il tracciato è tra i più documentati e
   standardizzati al mondo — km/dislivelli vengono da fonti di
   trekking consolidate, non da una stima grezza, ma restano da
   confermare con un sopralluogo reale prima della partenza.
   Ogni "tappa" qui corrisponde a un vero giorno di cammino (non un
   tratto multi-giorno come nell'Adriatica).

   Coordinate verificate via OpenStreetMap/Nominatim (non più a
   memoria: le prime erano fuori fino a 6 km su tappe di 13-20 km).
   Percorso disegnato in linea retta tra le tappe, non instradato via
   OSRM stradale (vedi USE_ROAD_ROUTING sotto): un sentiero di
   montagna non segue le strade, farlo passare per la rete stradale
   più vicina produce un tracciato senza senso.
========================================================== */

const TAPPE = [
  { step: 1,  nome: 'Refuge de Miage',        coords: [45.8392, 6.7599], terreno: 'FRANCIA — TRÉ-LA-TÊTE',            km: 17,   elevation: 1230 },
  { step: 2,  nome: 'Croix du Bonhomme',      coords: [45.7224, 6.7171], terreno: 'FRANCIA — COL DU BONHOMME',        km: 20,   elevation: 1480 },
  { step: 3,  nome: 'Rifugio Elisabetta',     coords: [45.7670, 6.8374], terreno: 'CONFINE FR/IT — COL DE LA SEIGNE', km: 16,   elevation: 780  },
  { step: 4,  nome: 'Courmayeur',             coords: [45.8317, 6.9462], terreno: 'VAL VENY — ITALIA',                km: 14,   elevation: 500  },
  { step: 5,  nome: 'Rifugio Bonatti',        coords: [45.8469, 7.0336], terreno: 'VAL FERRET ITALIANA',              km: 17,   elevation: 950  },
  { step: 6,  nome: 'La Fouly',               coords: [45.9331, 7.0990], terreno: 'CONFINE IT/CH — GRAND COL FERRET', km: 13,   elevation: 750  },
  { step: 7,  nome: 'Champex-Lac',            coords: [46.0306, 7.1168], terreno: 'VALLESE — SVIZZERA',               km: 16,   elevation: 600  },
  { step: 8,  nome: 'Trient',                 coords: [46.0559, 6.9954], terreno: 'SVIZZERA — FENÊTRE D\'ARPETTE',    km: 19,   elevation: 1400 },
  { step: 9,  nome: 'Tré-le-Champ',           coords: [45.9956, 6.9292], terreno: 'CONFINE CH/FR — COL DE BALME',     km: 15,   elevation: 950  },
  { step: 10, nome: 'La Flégère',             coords: [45.9605, 6.8871], terreno: 'FRANCIA — AIGUILLES ROUGES',       km: 10,   elevation: 1000 },
  { step: 11, nome: 'Les Houches',            coords: [45.8915, 6.7991], terreno: 'RIENTRO — VALLE DI CHAMONIX',      km: 13,   elevation: 500  }
];

/* niente instradamento stradale via OSRM (vedi nota sopra): il
   percorso viene disegnato in linea retta reale tra le tappe. */
const USE_ROAD_ROUTING = false;

/* Proposta di Oechslin Outdoor: prima settimana di settembre, dopo
   il picco di luglio/agosto — colli in quota liberi dalla neve,
   rifugi ancora aperti (chiudono verso metà settembre), meno
   affollamento. DA CONFERMARE definitivamente. */
const DEPARTURE_DATE = '2027-09-04T00:00:00';
/* nessuna quota/early-bird definita ancora: nessuna card la mostra,
   ma dossier.js si aspetta comunque questa globale — vedi initCountdown. */
const EARLY_BIRD_DATE = DEPARTURE_DATE;

/* Stesso Google Apps Script delle altre spedizioni (nessuna
   infrastruttura nuova da creare) — vedi SPEDIZIONE_LABEL: perché le
   candidature finiscano davvero in un foglio/tab separato serve
   aggiornare lo script lato Google, non modificabile da qui. */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxoZEkMCRIcwM9EY2Zx7eTwalG-gOCZCBEyzVlkiebJiY9jJiBDU_GsWg0OZ1rEXVv1/exec';
const SPEDIZIONE_LABEL = 'Monte Bianco Traverse (OX-003)';
