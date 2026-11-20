# Bustabit: archivio bot unico dentro la dashboard IA Finance

## Entry point
L'appartato principale del reparto Bustabit e' `/bustabit-lab.html`, chiamato dalla dashboard BNB, e con percorso alternativo `/bustabit-archivio.html` che contiene la stessa pagina. NON e' un generatore di bot e NON ha scanner, news, segnali di puntata o motore LIVE.

## Interfaccia
- Barra superiore con logo Kiber, link verificato al sito ufficiale https://bustabit.com/ e ritorno alla dashboard BNB.
- Pannello archivio navigabile per nome e famiglia (15 file storici originali).
- Selezione di ogni versione con quattro schede: **Codice originale**, **Come funziona**, **Strategie e attacchi**, **Performance e log**.
- Il pannello Codice carica il testo originale come file inerte, verifica byte e hash SHA-256, mostra il testo integrale e consente di copiare integralmente oppure scaricare il nome originale .js.
- Tecnologie e ogni funzione del file sono classificate per nome, con cosa/quando/come/perche'. Spiegazioni non verificate da un trace lo dichiarano.
- Performance e audit sono riferiti rigorosamente alla versione del file: per le versioni senza report quantitativi l'interfaccia scrive "Non disponibili", non prende numeri da altri bot.

## Identita', controllo e responsabilita'
Sono presenti **15 file integrali** in `/bustabit-code-originals/<nome>.js.txt` (serviti come testo inerte).
Ogni elemento ha dimensione e SHA-256 pubblicati nella lista `bustabit-legacy-data.js`.
Il test automatico conferma il checksum SHA-256 di ogni file.
La pagina verifica il checksum **prima di attivare Copia/Scarica**, bloccando file diversi dagli originali.

**I sorgenti originali sono ora leggibili pubblicamente** da chiunque visiti il sito o il repository. Questo e' necessario per rendere il codice immediatamente disponibile senza upload, login o server privato. Non contiene chiavi private/API nei controlli statici eseguiti, ma non puo' essere considerato un archivio riservato. Eventuali nuovi bot non vanno pubblicati senza verifica che il proprietario ne accetti l'accessibilita' pubblica.

Una verifica dell'identita' dei file, della sintassi o un backtest non costituisce certificazione ufficiale di Bustabit o prova di puntate reali. I report nominati LIVE sono distinti da accettazione, esito e saldo verificati dal server. Il gioco mantiene un vantaggio del banco. Nessuna funzione piazza puntate, legge wallet, usa credenziali o avvia bot.

## Prove e limiti
- Kiber Strike 1.3.1: 30×1.000 simulazioni, 3.384 ingressi, -138,48 bit e bug di frequenza Recovery (report originale).
- Kiber Strike 1.4: sorgente integro, test LIVE/risultati della versione non certificati.
- Negative Breaker 1.3: sorgente integro; risultati attribuibili non disponibili con prove sufficienti.
- Trident 1.1: 41 ingressi +51,55 bit in un test, 64 ingressi -68,10 bit nel successivo, 105 ingressi netti -16,55 bit, replay/CSV senza hash server.
- Cyber Striker 3.0: logs94 +108,01 bit per 6.212 coppie simulated BET/esito; logs95 -567,34 bit per 6.493 coppie. Mancano hash/game ID completi e prova del server.
- Kiber Striker V3.0: 15.000 sessioni SHADOW, 128.166 ingressi virtuali e 5/7 strategie con ingressi; non sono scommesse LIVE verificate.

## Aggiunta versioni in futuro
1. Recuperare il file originale .js e verificare che non contenga credenziali o dati personali.
2. Decidere esplicitamente se pubblicarlo in questo sito accessibile a tutti.
3. Salvarne bytes immutati sotto `bustabit-code-originals/` con estensione aggiuntiva .txt.
4. Aggiornare manifest (filename, dimensione, SHA256, tecnologia) e analisi.
5. Associare report solo all'esatta versione. Non sovrascrivere originali precedenti.
6. Eseguire test riproducibili, poi verificare CI e stato effettivo del deploy Vercel. Un merge non significa che il sito sia aggiornato se Vercel e' in rate-limit.
