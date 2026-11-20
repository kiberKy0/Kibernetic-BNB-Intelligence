# Kiber Bustabit: schede tecnologiche e performance per versione (20/11/2026)

## Obiettivo e limite delle prove
Ogni codice storico ha una scheda leggibile, che distingue la singola versione dalla famiglia. Il dossier mostra nome originale, impronta SHA-256, numero di funzioni dichiarate nel sorgente, tecnologie presenti, modalità e spiegazioni COSA / QUANDO / COME / PERCHÉ. Il codice originale resta privato e viene letto solo in modalità locale, con controllo hash: non è allegato al repository pubblico, non è eseguito dalla pagina e non dispone di trading reale.

Sono censite **15 revisioni storiche** e restano consultabili altre **6 versioni recenti**, per **21 codici catalogati**. I nomi delle funzioni per le 15 versioni sono stati estratti dai sorgenti recuperati; le spiegazioni delle funzioni non ancora coperte da audit sono segnalate come descrizioni basate sul nome e non dimostrazioni di chiamata runtime. I test di sintassi non sono test di esecuzione LIVE.

## Performance utilizzabili solo per la versione esatta

| Versione | Rapporto | Giocate simulate/documentate | Vittorie | P/L virtuale | ROI | Provenienza |
|---|---|---:|---:|---:|---:|---|
| Kiber Strike **V1.3.1 LIVE FIX** | 30×1.000 round sintetici | 3.384 | 1.819 | -138,48 bit | -1,23% | KIBER_STRIKE_30x1000_REPORT.md |
| Trident **V1.1** | Test precedente | 41 | 27 | +51,55 bit | +21,94% | Rapporto_finale_KIBER_TRIDENT_V1_1.pdf |
| Trident **V1.1** | Secondo test 1.000 game | 64 | 31 | -68,10 bit | -15,23% | stesso report |
| Trident **V1.1** | Totale entrambi i test | 105 | 58 | -16,55 bit | -2,43% | stesso report (evitare doppio conteggio) |
| Cyber Striker **3.0** | Logs94 | 6.212 | 3.515 | +108,01 bit | +0,52% | KIBER_RAPPORTO_LOGS94_v1.0.md |
| Cyber Striker **3.0** | Logs95 | 6.493 | 2.854 | -567,34 bit | -5,38% | KIBER_RAPPORTO_LOGS95_v1.1.md |
| Kiber Striker **V3.0** | 15.000 sessioni SHADOW | 128.166 | 112.930 | non fornito | non fornito | KIBER_V30_15000_SESSIONI_RAPPORTO_COMPLETO.md |
| Kiber Striker **V3.0** | 27.000 round SHADOW singolo processo | 5.652 | non aggregato | non riportato | non riportato | KIBER_V30_SESSIONE_UNICA_27000_RAPPORTO.md |

I report V3.0 non provano capacità predittiva o implementazione LIVE. Le sessioni isolate con 5/7 famiglie che puntano non sono pari a 7/7. Il Kiber Strike 1.3.1 documenta un limite di frequenza dichiarato 33/100 ma osservato 35/100 a causa del ramo Recovery.

**Divieto di trasferire risultati tra versioni:** i dati V1.3.1 non sono una prova per V1.4; i dati Trident V1.1 non sono una prova per V1; i log Cyber 3.0 non provano il funzionamento di Kiber Striker V3.0. Per i bot senza risultati quantitativi attribuibili, la pagina dichiara «Non disponibile».

## Motore esplicativo
Il componente è **una guida documentale interattiva**, non una connessione a un LLM. Tutte le funzioni dello storico recuperate dai 15 sorgenti sono inventariate per nome; le spiegazioni sono classificate in:
- contesto storico e fasi;
- selezione della strategia;
- definizione di cashout, stake e Recovery;
- limiti di rischio;
- memoria/feedback, compresi KSI, ML Brain, AutoMemory, Governor, Ensemble, Drift per la V3.0.

I moduli sono mostrati soltanto se la funzione citata esiste nella versione. Le funzioni senza mappatura specifica sono presentate come parte dell'inventario e richiedono verifica sul trace prima di descrivere tempi di invocazione esatti.

## Certificazione
Il SHA-256 certifica l'identità rispetto al file sorgente recuperato, non l'esecuzione LIVE; la sintassi certifica solo la parsabilità JS; replay/test sintetico non sono wager server. Per certificare una scommessa effettiva, servono game ID, timestamp, wager/settlement, variazione saldo e riferimento account/server coerenti. Nessuna versione è al momento certificata LIVE dai documenti disponibili.

## Distribuzione
L'archivio pubblico è `bustabit-archivio.html`, con `bustabit-tech-ui.js`, `bustabit-tech-data.js`, `bustabit-tech-functions-primary.js` e `bustabit-tech-functions-variants.js`. Il deposito di file originali resta locale IndexedDB. Il deploy su Vercel è indipendente dal merge GitHub e va verificato separatamente.
