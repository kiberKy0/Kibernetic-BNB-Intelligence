# Bustabit · Biblioteca tecnica dei bot (aggiornamento 21/11/2026)

## Scopo
Il reparto aperto tramite la dashboard **IA Finance → Bustabit** è un archivio descrittivo. Il percorso principale `/bustabit-lab.html` e l'alias `/bustabit-archivio.html` mostrano la stessa pagina.

## Contenuti attivi
- 15 versioni storiche raggruppate in 5 famiglie: Kiber Strike, Negative Breaker, Trident, Cyber Striker 3.0 e Kiber Striker V3.0, comprese le revisioni.
- Selezione per nome, ricerca per tecnologia, nome del file originale a scopo identificativo.
- Prima scheda: **cosa fa / quando interviene / come funziona / perché è stato creato**, con i moduli principali visibili.
- Seconda scheda: strategie, tecnologie e modalità di attacco associate esattamente alla versione, con funzione nominata e descrizione, e inventario JavaScript navigabile per nome.
- Terza scheda: performance e log **attribuiti soltanto alla versione specifica**, separando espressamente test/replay/SHADOW da puntate LIVE accertate. Nessun risultato viene trasferito da versioni vicine.
- Quarta scheda: dicitura **«Codice in elaborazione»**. Non mostra codice, non consente copia/download, non importa sorgenti e non apre connessioni al gioco.
- Link ufficiale a https://bustabit.com/ nella barra superiore. Nessuna news, scanner o funzione di betting nel reparto.

## Policy di pubblicazione del codice
L'utente ha chiesto il 21/11/2026 di rimandare l'inserimento dei sorgenti. I 15 file prima pubblicati sotto `bustabit-code-originals/` **vengono eliminati dall'albero corrente del repository** e il frontend non li carica. Il catalogo descrittivo conserva nomi, SHA, dimensioni e nomi di funzioni, ma **non i corpi del JavaScript**. Gli originali conservati nella Libreria/ZIP non devono essere riscritti o confusi con nuove versioni.

**Nota importante:** eliminare file nel commit corrente non cancella la loro presenza nei commit Git pubblicati in precedenza. Per revocare una precedente esposizione pubblica occorrerebbe una diversa procedura di riscrittura della storia Git e valutare eventuali cloni/fork, separata da questa modifica.

## Integrità tecnica e risultati
I test delle schede controllano conteggi, versionamento, nomi di funzioni, provenienza dei risultati, assenza del percorso pubblico dei 15 sorgenti e assenza di funzioni di import/copia/esecuzione. Non attestano un vantaggio predittivo di strategie Bustabit. Le versioni senza log quantitativi attribuibili restano «Non disponibile».

## Pubblicazione online
Il merge GitHub non implica aggiornamento Vercel. Controllare lo stato di deploy e l'effettiva pagina online prima di dichiarare che il cambiamento sia visibile.
