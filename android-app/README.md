# Kibernetic BNB Intelligence: app Android V1

Primo prototipo installabile Android che apre il prodotto web esistente:
https://kibernetic-bnb-intelligence.vercel.app/

Non modifica il sito in produzione, non duplica le analisi, e NON contiene
credenziali, token API o chiavi Gemini. Le chiavi devono restare sul backend Vercel.

## Cosa offre
- Scanner BNB e analisi web esistenti, grafici, watchlist, settori, chat Kiber
- Pulsanti Android Home, Aggiorna e Condividi
- Schermata offline e pulsante Riprova
- HTTPS obbligatorio e navigazione esterna nel browser
- Target Android 16 (API 36); Java 17; minSdk 26

## Come ottenere un APK di test
Aprire la cartella android-app con Android Studio e compilare un APK di debug
con Gradle 8.13, Android Gradle Plugin 8.13.2, JDK 17 e SDK Android 36.
In alternativa, aprire su GitHub Actions il workflow Android preview APK e
scaricare l'artefatto Kibernetic-BNB-Android-test dopo un build riuscito.

## Prima di Google Play
1. Verificare fisicamente le schermate Android, i periodi dei grafici,
   la ricerca, l'apertura delle schede token, Gemini, le fonti dati e gli errori.
2. Sostituire l'icona vettoriale di anteprima con il logo ufficiale Kiber.
3. Creare politica privacy pubblica e dichiarazioni Data Safety e
   Funzionalità finanziarie coerenti con il funzionamento effettivo.
4. Verificare disponibilità del package com.kibernetic.bnbintelligence PRIMA
   della registrazione definitiva su Google Play.
5. Compilare AAB firmato con chiave privata custodita fuori da GitHub.
6. Preparare screenshot, testi e scheda Play Store. Verificare eventuali
   requisiti per test chiusi del proprio account sviluppatore.
7. Le stime dell'Oracolo sono scenari sperimentali, non garanzie. Questa
   versione non esegue trading né pagamenti. Per l'eventuale PRO da
   3,50 euro al mese servirà implementare pagamenti conformi a Play Billing.

Stato: codice sorgente di un prototipo. Non ancora verificato su dispositivo,
non firmato per la distribuzione e non pubblicato su Google Play.
