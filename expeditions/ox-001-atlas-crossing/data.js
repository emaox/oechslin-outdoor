/* ==========================================================
   ATLAS CROSSING (OX-001) — dati specifici di questa spedizione.
   Carica PRIMA di ../../dossier.js, che legge queste globali.
========================================================== */

const TAPPE = [
  { step: 1, nome: 'Marrakech',      coords: [31.6225, -7.9898], terreno: 'URBANO / PIANURA',        km: 0,   elevation: 0 },
  { step: 2, nome: 'Telouet',        coords: [31.2888, -7.2396], terreno: 'MONTAGNA — ALTO ATLANTE',  km: 78,  elevation: 1650 },
  { step: 3, nome: 'Aït Benhaddou',  coords: [31.0470, -7.1319], terreno: 'KASBAH — PRE-DESERTICO',   km: 62,  elevation: 450 },
  { step: 4, nome: 'Gole del Dades', coords: [31.4532, -5.9675], terreno: 'CANYON ROCCIOSO',          km: 110, elevation: 1900 },
  { step: 5, nome: 'Gole del Todra', coords: [31.5220, -5.5274], terreno: 'CANYON ROCCIOSO',          km: 85,  elevation: 800 },
  { step: 6, nome: 'Erfoud',         coords: [31.4347, -4.2337], terreno: 'HAMADA — PIETROSO',        km: 135, elevation: 250 },
  { step: 7, nome: 'Merzouga',       coords: [31.0802, -4.0134], terreno: 'ERG — DUNE SABBIOSE',      km: 50,  elevation: 150 }
];

const DEPARTURE_DATE = '2027-04-17T00:00:00';
const EARLY_BIRD_DATE = '2026-12-31T23:59:59';

/* Google Apps Script già collegato al foglio/email di questa spedizione. */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxoZEkMCRIcwM9EY2Zx7eTwalG-gOCZCBEyzVlkiebJiY9jJiBDU_GsWg0OZ1rEXVv1/exec';
const SPEDIZIONE_LABEL = 'Atlas Crossing (OX-001)';
