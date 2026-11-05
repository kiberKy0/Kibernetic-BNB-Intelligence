# Kibernetic BNB Intelligence

Versione 28.4: scanner e analisi dei token dell’ecosistema BNB. Il grafico, i movimenti UP/DOWN, i precedenti storici e gli scenari condizionati sono riuniti nella scheda del token. Kiber locale spiega i dati disponibili; OpenAI è rimandata a un’integrazione successiva.

La pagina principale carica il frontend storico dentro un iframe e applica i moduli successivi. Non è ancora una riscrittura consolidata. Le API Vercel aggregano dati pubblici; Supabase conserva snapshot e rapporti con lavori pianificati.

## Stato verificato

- [Mappa completa e confronto competitivo](docs/mappa-piattaforma-2026-10-12.md)
- [Verifica del catalogo](docs/catalog-audit-2026-10-12.json): 250 ID inventariati, 116 richieste completate, 32 grafici disponibili, 84 errori del fornitore, 134 non verificati dopo il limite di richieste. Nessuna garanzia di funzionamento per ogni moneta.
- [Secondo controllo del catalogo](docs/catalog-audit-evening-2026-10-12.json): 9 grafici disponibili aggiuntivi, 32 esiti precedenti riutilizzati; verifica fermata al nuovo limite del fornitore.
- [Controllo endpoint e periodi BNB](docs/endpoint-audit-evening-2026-10-12.json)
- [Inventario statico dei moduli](docs/runtime-inventory-2026-10-12.json)
- La categoria CoinGecko “BNB Chain Ecosystem” non dimostra la presenza di un contratto BSC.
- Le previsioni sono scenari sperimentali: attendibilità e vantaggio dopo i costi non sono dimostrati.
- I token monitorati nel browser e quelli raccolti dal server non hanno ancora una copertura unica.
- Nessuna compravendita o automazione finanziaria è attivata. OpenAI non è attiva.

## Verifica del codice

```sh
node --test tests/*.test.cjs
```

Lo script `python3 scripts/audit-catalog.py catalog.json` verifica i grafici a 30 giorni di uno snapshot pubblico del catalogo, interrompendo nuove verifiche quando incontra un limite del fornitore. Non avviarlo ripetutamente durante un rate limit.

Sito: https://kibernetic-bnb-intelligence.vercel.app/

## Release V28.4 — 6 novembre 2026

- Catalogo CoinGecko BNB Ecosystem con caricamento manuale delle pagine successive, fino a cinque pagine da 250 (massimo teorico: 1.250 ID). Non significa che tutti i contratti sulla BNB Chain siano presenti o verificati.
- Le nuove pagine sono richieste solo su comando dell'utente, con deduplica per ID e senza cancellare quelle caricate in caso di errore del provider.
- I contratti BSC non sono dedotti dal solo simbolo: l'ID va risolto con fonte che restituisca un indirizzo BSC valido.
- Il catalogo usa un proxy Vercel sullo stesso dominio, riducendo la dipendenza da un endpoint esterno facoltativo.
- I monitorati sono preferiti locali e non equivalgono automaticamente a raccolta cloud H24. Senza accordi/quote aggiuntive la copertura del mercato resta limitata.
- Test automatici: workflow GitHub Verify oracle; distribuzione su Vercel attraverso il ramo main.
