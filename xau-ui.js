(() => {
  'use strict';
  const decoder = window.XauDecoder;
  const $ = id => document.getElementById(id);
  const price = n => Number.isFinite(n) ? Number(n).toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : '—';
  let importActive = false, lastFetchAt = 0, feedFailed = false;
  const setText = (id, value) => { $(id).textContent = String(value); };
  function feedHealth(message,state='offline'){const e=$('xauFeedHealth');if(e){e.textContent=message;e.dataset.state=state;}}

  function renderOperationalGuide(result, source) {
    const helper = window.XauGuidance;
    const area = $('xauOperationalGuide');
    if (!helper || !area) return;
    const sourceType = /CSV locale/i.test(source) ? 'csv' : 'feed';
    const plan = helper.advise(result, { source: sourceType });
    const m=result.metrics||{};
    window.KiberXauContext={state:plan.state,mode:sourceType==='csv'?'csv':result.ready?'feed':'unverified',
      timeframe:result.interval,timestamp:result.time,source,price:m.price,ema20:m.ema20,ema50:m.ema50,
      rsi14:m.rsi14,atr14:m.atr14,entry:plan.entry,stop:plan.stop,target:plan.target};
    area.dataset.state = plan.state;
    setText('xauGuideStatus', plan.title);
    setText('xauGuideSummary', plan.summary);
    setText('xauGuideEntry', helper.format(plan.entry) + (plan.entry === null ? '' : ' USD/oz'));
    setText('xauGuideStop', helper.format(plan.stop) + (plan.stop === null ? '' : ' USD/oz'));
    setText('xauGuideTarget', helper.format(plan.target) + (plan.target === null ? '' : ' USD/oz'));
    setText('xauGuideReason', plan.reason);
    setText('xauGuideWhen', plan.when);
    setText('xauGuideInvalidation', plan.invalid);
    setText('xauGuideDisclosure', plan.disclosure);
    setText('xauGuideMode', plan.mode === 'simulation'
      ? 'Esempio su storico CSV: non è un segnale sul mercato attuale.'
      : plan.state === 'WAIT'
        ? 'Nessuna operazione proposta. Il feed separato deve essere verificato.'
        : 'Setup condizionato, basato sull’ultima candela chiusa (' + (result.time || 'data da verificare') + '). Non è un ordine. Verifica spread, news e quotazione del broker.');
  }

  function render(result, source, feedContext = null) {
    renderOperationalGuide(result, source);
    $('signal').className = 'signal ' + (result.signal === 'BUY' ? 'buy' : result.signal === 'SELL' ? 'sell' : 'wait');
    setText('signal', result.label);
    setText('source', source + ' · ' + result.samples + ' candele · ' + result.interval);
    setText('timestamp', 'Inizio ultima candela completata (UTC): ' + (result.time || '—'));
    const m = result.metrics;
    setText('price', price(m.price));
    setText('ema', m.ema20 == null ? '—' : price(m.ema20) + ' / ' + price(m.ema50));
    setText('rsi', m.rsi14 == null ? '—' : price(m.rsi14));
    setText('atr', m.atr14 == null ? '—' : price(m.atr14) + ' (' + price(m.atrPct) + '%)');
    setText('support', price(m.support20));
    setText('resistance', price(m.resistance20));
    const list = $('reasons');
    list.replaceChildren();
    (result.reasons.length ? result.reasons : ['In attesa dei dati']).forEach(reason => {
      const item = document.createElement('li');
      item.textContent = reason;
      list.append(item);
    });
    // Validazione finale sovrapposta ai setup tecnici esistenti.
    // Anche se gli indicatori coincidono, l'assenza di dati live/costi/test
    // indipendenti prevale: mai proporre BUY/SELL come decisione eseguibile.
    try {
      const advanced = window.KiberXauAdvanced;
      const audit = advanced && advanced.evaluate(result, source, Date.now(), feedContext || {});
      if (audit) {
        advanced.render(audit);
        $('signal').className = 'signal wait';
        setText('signal', 'ATTESA · verifica avanzata');
        setText('xauGuideStatus', 'ATTESA');
        setText('xauGuideSummary', audit.reason);
        setText('xauGuideEntry', '—');
        setText('xauGuideStop', '—');
        setText('xauGuideTarget', '—');
        setText('xauGuideReason', audit.reason);
        setText('xauGuideWhen', 'Controllare feed, più timeframe, news, costi broker e test indipendenti prima di valutare un ingresso.');
        setText('xauGuideInvalidation', 'Nessuna operazione aperta o proposta.');
        setText('xauGuideMode', 'Validatore avanzato attivo. Il precedente setup tecnico non è un ordine.');
        setText('xauGuideDisclosure', 'Ipotesi tecniche non eseguibili senza tutte le verifiche critiche. Nessun dato MT5 collegato automaticamente.');
        $('xauOperationalGuide').dataset.state = 'WAIT';
        window.KiberXauContext = {
          ...(window.KiberXauContext || {}), state: 'WAIT',
          mode: 'advanced-unverified', entry: null, stop: null, target: null,
          advanced: {decision:'WAIT', reason:audit.reason, source:audit.source, timestamp:audit.timestamp}
        };
      }
    } catch (_) {
      $('signal').className = 'signal wait';
      setText('signal', 'ATTESA · errore validatore');
      setText('xauGuideStatus', 'ATTESA');
      setText('xauGuideSummary', 'Impossibile validare il setup in sicurezza.');
      window.KiberXauContext = { state:'WAIT', mode:'validator-error' };
    }
    // Update the separate price-action lab without changing the advanced safety gate.
    try { window.KiberXauMethodsUI?.render(result, feedContext, source); }
    catch (_) { /* The main Decoder remains independent if an optional lab breaks. */ }
  }
  function waiting(reason, source = 'Nessun feed affidabile') {
    render({ signal: 'WAIT', label: 'ATTESA', samples: 0, interval: $('interval').value,
      metrics: {}, time: null, reasons: [reason] }, source);
  }
  async function loadFeed() {
    importActive = false;lastFetchAt=Date.now();
    $('refresh').disabled = true;feedHealth('Feed XAU/USD · verifica connessione…');
    waiting('Verifica della disponibilità del feed…', 'Decoder XAU/USD');
    try {
      const response = await fetch('/api/xau?interval=' + encodeURIComponent($('interval').value),
        { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Dati XAU/USD non disponibili');
      if (!Array.isArray(body.candles) || body.symbol !== 'XAU/USD' || !body.quality?.ok) throw new Error('Serie OHLC o controllo quotazioni non valido');
      const result=decoder.analyze(body.candles, $('interval').value);
      feedFailed=false;
      const lag=result.time?Math.max(0,Math.round((Date.now()-Date.parse(result.time))/60000)):null;
      const q=body.quality.tick||{};
      const bid=price(q.bid),ask=price(q.ask),seconds=q.ageSeconds;
      const feedLine='Feed esterno '+String(body.source||'XAU')+' · Bid '+bid+' / Ask '+ask+
        ' · tick '+seconds+' s · OHLC '+lag+' min dall’inizio candela · non è il tuo conto MT5';
      feedHealth(result.ready?feedLine:'Dati ricevuti ma non validati · '+(result.reasons||[]).join(' · '),result.ready?'ohlc':'offline');
      render(result, body.source + ' · feed esterno',body);
      setText('csvMessage', 'Feed biquote esterno · candele completate per gli indicatori. TradingView e il conto MT5 Android sono separati.');
    } catch (error) {
      feedFailed=true;feedHealth('Feed non disponibile · '+String(error.message||'errore sorgente')+' · nessun segnale operativo');
      waiting(error.message, 'Feed automatico non operativo');
      setText('csvMessage', 'Per lo storico puoi usare un CSV con candele OHLC valide. Nessun segnale senza dati.');
    } finally { $('refresh').disabled = false; }
  }
  function parseCsv(text) {
    // Importazione locale, non scraping da TradingView.
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length > 2200) throw new Error('CSV troppo grande (massimo 2.000 candele)');
    if (lines.length < 2) throw new Error('CSV senza righe');
    const separator = lines[0].includes(';') ? ';' : ',';
    const cols = lines.shift().replace(/^\uFEFF/, '').toLowerCase().split(separator).map(s => s.trim());
    const index = key => cols.indexOf(key);
    const timeIndex = cols.findIndex(s => ['time', 'datetime', 'date', 'timestamp'].includes(s));
    if (timeIndex < 0 || ['open', 'high', 'low', 'close'].some(s => index(s) < 0))
      throw new Error('Intestazioni richieste: time,open,high,low,close');
    const records = lines.map(line => {
      const cells = line.split(separator).map(s => s.trim().replace(/^"|"$/g, ''));
      let t = cells[timeIndex];
      if (/^\d{4}-\d\d-\d\d \d\d:\d\d/.test(t)) t = t.replace(' ', 'T') + 'Z';
      else if (/^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d)?$/.test(t)) t += 'Z';
      const number = key => Number(cells[index(key)]);
      return { time: t, open: number('open'), high: number('high'), low: number('low'), close: number('close') };
    });
    return decoder.cleanCandles(records);
  }
  $('refresh').addEventListener('click', loadFeed);
  $('interval').addEventListener('change', () => {
    if (importActive) setText('csvMessage', 'Periodo modificato: reimporta un CSV corrispondente oppure usa il feed.');
    loadFeed();
  });
  $('csvFile').addEventListener('change', async event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.size > 400000) { waiting('File troppo grande'); return; }
    try {
      const candles = parseCsv(await file.text());
      if (candles.length < 60) throw new Error('Meno di 60 candele valide: ' + candles.length);
      importActive = true;
      feedHealth('STORICO CSV · dati locali, non in tempo reale', 'offline');
      render(decoder.analyze(candles, $('interval').value), 'CSV locale (non collegato al mercato live)');
      setText('csvMessage', 'Storico letto localmente: ' + candles.length + ' candele. Non salvato e non inviato al server.');
    } catch (error) {
      waiting(error.message, 'CSV non valido');
      setText('csvMessage', 'Controlla il formato CSV e la data UTC.');
    }
  });
  // Polling solo mentre il Decoder è aperto. Rispetta le quote del provider in caso di errore.
  setInterval(()=>{if(document.hidden||importActive||$('refresh').disabled)return;
    const interval=feedFailed?120000:60000;
    if(Date.now()-lastFetchAt>=interval)void loadFeed();
  },30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!importActive&&Date.now()-lastFetchAt>60000)void loadFeed();});
  loadFeed();
})();
