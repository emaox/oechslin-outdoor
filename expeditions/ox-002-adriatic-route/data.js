/* ==========================================================
   ADRIATIC ROUTE (OX-002) — dati specifici di questa spedizione.
   Carica PRIMA di ../../dossier.js, che legge queste globali.

   16 tappe reali, ~100 km/giorno in media (da 23 a 128 km — alcune
   più corte apposta nei punti panoramici come Vieste o il Conero,
   un paio più lunghe dove non c'era un paese comodo a metà strada).
   Km calcolati con OSRM (routing stradale reale) tra città vere
   lungo la costa, non stimati a occhio — ma restano una base di
   pianificazione, non un GPX rilevato di persona: l'elevazione è
   indicativa (nessun rilievo altimetrico reale ancora). Vedi trust
   card "Il percorso" per le fonti. DA CONFERMARE con un sopralluogo.
========================================================== */

const TAPPE = [
  { step: 1,  nome: 'Trieste',                    coords: [45.6495, 13.7768], terreno: 'PARTENZA — CARSO TRIESTINO',        km: 0,   elevation: 0   },
  { step: 2,  nome: 'Caorle',                      coords: [45.5998, 12.8797], terreno: 'COSTA VENETA — PIANURA',            km: 128, elevation: 40  },
  { step: 3,  nome: 'Chioggia',                    coords: [45.2181, 12.2825], terreno: 'LAGUNA VENETA — PIANURA',           km: 116, elevation: 20  },
  { step: 4,  nome: 'Comacchio',                   coords: [44.6942, 12.1836], terreno: 'DELTA DEL PO — PIANURA',            km: 68,  elevation: 15  },
  { step: 5,  nome: 'Rimini',                      coords: [44.0678, 12.5695], terreno: 'RIVIERA ROMAGNOLA — PIANURA',       km: 103, elevation: 25  },
  { step: 6,  nome: 'Senigallia',                  coords: [43.7150, 13.2183], terreno: 'COSTA MARCHIGIANA — PIANURA',       km: 75,  elevation: 30  },
  { step: 7,  nome: 'Sirolo — Monte Conero',       coords: [43.5236, 13.6067], terreno: 'PROMONTORIO DEL CONERO',            km: 52,  elevation: 200 },
  { step: 8,  nome: 'San Benedetto del Tronto',    coords: [42.9492, 13.8889], terreno: 'MARCHE SUD — COLLINARE',            km: 77,  elevation: 180 },
  { step: 9,  nome: 'Pescara',                     coords: [42.4643, 14.2142], terreno: 'COSTA ABRUZZESE — PIANURA',         km: 72,  elevation: 40  },
  { step: 10, nome: 'Termoli',                     coords: [41.9998, 14.9954], terreno: 'BIKE TO COAST — VIA VASTO',         km: 113, elevation: 60  },
  { step: 11, nome: 'Peschici',                    coords: [41.9445, 16.0139], terreno: 'PROMONTORIO DEL GARGANO',           km: 111, elevation: 320 },
  { step: 12, nome: 'Manfredonia',                 coords: [41.6297, 15.9124], terreno: 'GARGANO — VIA VIESTE',              km: 77,  elevation: 280 },
  { step: 13, nome: 'Trani',                       coords: [41.2767, 16.4197], terreno: 'PUGLIA NORD — PIANURA',             km: 70,  elevation: 30  },
  { step: 14, nome: 'Bari',                        coords: [41.1171, 16.8719], terreno: 'COSTA BARESE — PIANURA',            km: 52,  elevation: 25  },
  { step: 15, nome: 'Ostuni',                      coords: [40.7304, 17.5794], terreno: 'VALLE D\'ITRIA — VIA POLIGNANO',    km: 87,  elevation: 90  },
  { step: 16, nome: 'Lecce',                       coords: [40.3519, 18.1720], terreno: 'SALENTO — PIANURA',                 km: 77,  elevation: 40  },
  { step: 17, nome: 'Santa Maria di Leuca',        coords: [39.7967, 18.3552], terreno: 'SALENTO — VIA OTRANTO, PUNTA ESTREMA', km: 96, elevation: 60 }
];

/* Proposta di Oechslin Outdoor, non ancora confermata con l'utente
   finale del sito: primavera 2027, prima del caldo estivo lungo la
   Puglia. DA CONFERMARE definitivamente. */
const DEPARTURE_DATE = '2027-05-08T00:00:00';
/* nessuna quota/early-bird definita ancora: nessuna card la mostra,
   ma dossier.js si aspetta comunque questa globale — vedi initCountdown. */
const EARLY_BIRD_DATE = DEPARTURE_DATE;

/* Stesso Google Apps Script di Atlas Crossing (nessuna infrastruttura
   nuova da creare) — il form aggiunge un campo "spedizione" (vedi
   SPEDIZIONE_LABEL) così le candidature restano distinguibili, ma
   perché finiscano davvero in un foglio/tab separato serve aggiornare
   lo script lato Google: non è modificabile da qui. */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxoZEkMCRIcwM9EY2Zx7eTwalG-gOCZCBEyzVlkiebJiY9jJiBDU_GsWg0OZ1rEXVv1/exec';
const SPEDIZIONE_LABEL = 'Adriatic Route (OX-002)';
