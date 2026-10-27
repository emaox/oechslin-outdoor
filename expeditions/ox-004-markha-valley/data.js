/* ==========================================================
   MARKHA VALLEY TREK (OX-004) — dati specifici di questa spedizione.
   Carica PRIMA di ../../dossier.js, che legge queste globali.

   8 tappe reali di trekking (via Ganda La → Markha Valley →
   Kongmaru La), il percorso più documentato e battuto del Ladakh —
   dentro lo Hemis National Park. Km e quote vengono da più fonti di
   trekking operator concordanti; il dislivello (D+) per tappa è
   stimato dalla differenza di quota tra un campo e il successivo
   (stessa logica già usata per Adriatic Route e Monte Bianco), non
   un GPX rilevato di persona: DA CONFERMARE con un sopralluogo reale.

   Coordinate verificate via OpenStreetMap/Nominatim per ogni tappa,
   campo base del Ganda La incluso (trovato come località mappata a
   sé, la stima interpolata di partenza era comunque a ~200 m da
   quella reale). La tappa 5 è stata rinominata da "Thachungtse"
   (nessun dato verificabile) a Hankar, il villaggio verificato più
   vicino sullo stesso tratto — stessa posizione reale sul percorso,
   km/dislivello invariati.

   Percorso disegnato in linea retta tra le tappe, non instradato via
   OSRM stradale (vedi USE_ROAD_ROUTING sotto): un sentiero di
   montagna non segue le strade, farlo passare per la rete stradale
   più vicina produce un tracciato senza senso (verificato: un tratto
   di 9 km reali diventava un giro di 84 km su strada).

   NB: a differenza delle altre spedizioni, qui l'altitudine assoluta
   è il vero fattore di rischio (fino a 5.200 m), non solo il
   dislivello — vedi trust card "Livello richiesto" nel dossier.
========================================================== */

const TAPPE = [
  { step: 1, nome: 'Rumbak',                coords: [34.0545, 77.4316], terreno: 'INGRESSO HEMIS NATIONAL PARK',      km: 9,  elevation: 500 },
  { step: 2, nome: 'Ganda La Base Camp',     coords: [34.0467, 77.3876], terreno: 'CAMPO BASE — VERSO IL PASSO',       km: 9,  elevation: 500 },
  { step: 3, nome: 'Skiu',                   coords: [33.9837, 77.2565], terreno: 'GANDA LA (4.900 M) — DISCESA VALLE', km: 11, elevation: 400 },
  { step: 4, nome: 'Markha',                 coords: [33.8732, 77.4516], terreno: 'VILLAGGIO — VALLE DEL MARKHA',      km: 11, elevation: 500 },
  { step: 5, nome: 'Hankar',                 coords: [33.8316, 77.5058], terreno: 'RISALITA VALLE ALPINA',             km: 8,  elevation: 300 },
  { step: 6, nome: 'Nimaling',               coords: [33.7865, 77.5941], terreno: 'ALPEGGIO D\'ALTA QUOTA — 4.700 M',  km: 6,  elevation: 600 },
  { step: 7, nome: 'Shangsumdo',             coords: [33.8535, 77.7076], terreno: 'KONGMARU LA (5.200 M) — DISCESA',   km: 13, elevation: 500 },
  { step: 8, nome: 'Leh',                    coords: [34.1719, 77.5867], terreno: 'RIENTRO A LEH',                     km: 3,  elevation: 30  }
];

/* niente instradamento stradale via OSRM (vedi nota sopra): il
   percorso viene disegnato in linea retta reale tra le tappe. */
const USE_ROAD_ROUTING = false;

/* Proposta di Oechslin Outdoor: metà luglio, piena stagione secca
   (il Ladakh è nell'ombra pluviometrica dell'Himalaya: il monsone
   indiano non lo raggiunge, quindi luglio/agosto — bassa stagione
   altrove in Himalaya — è qui il periodo più stabile). Strade e
   passi sicuramente aperti. DA CONFERMARE definitivamente. */
const DEPARTURE_DATE = '2027-07-17T00:00:00';
/* nessuna quota/early-bird definita ancora: nessuna card la mostra,
   ma dossier.js si aspetta comunque questa globale — vedi initCountdown. */
const EARLY_BIRD_DATE = DEPARTURE_DATE;

/* Stesso Google Apps Script delle altre spedizioni (nessuna
   infrastruttura nuova da creare) — vedi SPEDIZIONE_LABEL: perché le
   candidature finiscano davvero in un foglio/tab separato serve
   aggiornare lo script lato Google, non modificabile da qui. */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxoZEkMCRIcwM9EY2Zx7eTwalG-gOCZCBEyzVlkiebJiY9jJiBDU_GsWg0OZ1rEXVv1/exec';
const SPEDIZIONE_LABEL = 'Markha Valley Trek (OX-004)';
