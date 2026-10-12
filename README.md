# Kibernetic BNB Intelligence

Versione 28.3: scanner e analisi dei token dell’ecosistema BNB. Il grafico, i movimenti UP/DOWN, i precedenti storici e gli scenari condizionati sono riuniti nella scheda del token. Kiber locale spiega i dati disponibili; OpenAI è rimandata a un’integrazione successiva.

La pagina principale carica il frontend storico dentro un iframe e applica i moduli successivi. Non è ancora una riscrittura consolidata. Le API Vercel aggregano dati pubblici; Supabase conserva snapshot e rapporti con lavori pianificati.

## Stato verificato

- [Mappa completa e confronto competitivo](docs/mappa-piattaforma-2026-10-12.md)
- [Verifica del catalogo](docs/catalog-audit-2026-10-12.json): 250 ID inventariati, 116 richieste completate, 32 grafici disponibili, 84 errori del fornitore, 134 non verificati dopo il limite di richieste. Nessuna garanzia di funzionamento per ogni moneta.
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
