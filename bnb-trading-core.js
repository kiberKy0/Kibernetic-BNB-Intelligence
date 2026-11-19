/* Kiber BNB trading orchestration foundation. No wallet keys; live trading disabled by default. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.KiberBNBTradingCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const CHAIN_ID = 56;
  const PHASES = Object.freeze(['ANALIZZA', 'VERIFICA', 'CALCOLA', 'ESEGUE', 'MONITORA', 'REGISTRA']);
  const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
  const TX_HASH = /^0x[a-fA-F0-9]{64}$/;
  const RAW = /^(0|[1-9][0-9]*)$/;
  const validAddress = value => ADDRESS.test(String(value || ''));
  const validPositiveRaw = value => RAW.test(String(value ?? '')) && BigInt(value) > 0n;
  const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
  const finiteTime = value => {
    const t = typeof value === 'number' ? value : Date.parse(value);
    return Number.isFinite(t) ? t : NaN;
  };
  class Blocked extends Error {
    constructor(message) { super(message); this.name = 'KiberTradingBlocked'; }
  }
  function requireSafe(value, message) { if (!value) throw new Blocked(message); }
  function checkRequest(r) {
    requireSafe(r && r.chainId === CHAIN_ID, 'Solo BNB Smart Chain (chain 56)');
    requireSafe(validAddress(r.wallet), 'Wallet non valido');
    requireSafe(validAddress(r.tokenIn) && validAddress(r.tokenOut) && !same(r.tokenIn, r.tokenOut), 'Coppia token non valida');
    requireSafe(validPositiveRaw(r.amountInRaw), 'Importo on-chain non valido');
    requireSafe(typeof r.strategyId === 'string' && /^[a-zA-Z0-9_-]{3,80}$/.test(r.strategyId), 'Strategia non identificata');
    requireSafe(typeof r.signalId === 'string' && /^[a-zA-Z0-9_:-]{3,140}$/.test(r.signalId), 'Segnale non identificato');
    requireSafe(Number.isInteger(r.slippageBps) && r.slippageBps >= 0 && r.slippageBps <= 200, 'Slippage oltre limite (2%)');
    return r.wallet.toLowerCase()+':'+r.strategyId+':'+r.signalId;
  }
  function createPipeline(adapters = {}, options = {}) {
    const now = typeof options.now === 'function' ? options.now : Date.now;
    const maxMarketAgeMs = options.maxMarketAgeMs ?? 15000;
    const maxQuoteAgeMs = options.maxQuoteAgeMs ?? 10000;
    const routers = (options.allowedRouters || []).filter(validAddress).map(x => x.toLowerCase());
    const mode = options.mode === 'live' ? 'live' : 'paper';
    async function run(request) {
      const phases = [];
      const result = { mode, decision: 'WAIT', chainId: CHAIN_ID, orderKey: null, txHash: null, phases, recorded: false, reason: '', asOf: new Date(now()).toISOString() };
      const mark = (name, status, message) => phases.push({ name, status, message: String(message || '') });
      let phase = 'ANALIZZA';
      try {
        result.orderKey = checkRequest(request);
        requireSafe(typeof adapters.analyze === 'function', 'Fonte di analisi non collegata');
        const signal = await adapters.analyze(request);
        requireSafe(signal && signal.trigger === true && signal.live === true && typeof signal.source === 'string' && signal.source.length > 0, 'Segnale assente o dati non live verificati');
        const signalAt = finiteTime(signal.observedAt);
        requireSafe(Number.isFinite(signalAt) && now() - signalAt >= 0 && now() - signalAt <= maxMarketAgeMs, 'Segnale scaduto o con data non verificata');
        mark('ANALIZZA', 'OK', 'Segnale e data verificati');
        phase = 'VERIFICA';
        requireSafe(typeof adapters.verify === 'function', 'Verifica token e capitale non collegata');
        const risk = await adapters.verify(request, signal);
        requireSafe(risk && risk.approved === true && risk.tokenSecurityChecked === true && risk.liquidityChecked === true && risk.balanceChecked === true && risk.limitsChecked === true, 'Controlli indipendenti non superati');
        mark('VERIFICA', 'OK', 'Rischio, token, liquidità e disponibilità verificati');
        phase = 'CALCOLA';
        requireSafe(typeof adapters.quote === 'function', 'Preventivo PancakeSwap non collegato');
        const quote = await adapters.quote(request, signal, risk);
        requireSafe(quote && quote.chainId === CHAIN_ID && same(quote.tokenIn, request.tokenIn) && same(quote.tokenOut, request.tokenOut) && String(quote.amountInRaw) === String(request.amountInRaw), 'Preventivo non corrispondente alla richiesta');
        requireSafe(validPositiveRaw(quote.amountOutRaw) && validPositiveRaw(quote.minAmountOutRaw) && BigInt(quote.minAmountOutRaw) <= BigInt(quote.amountOutRaw), 'Quantità di uscita non valida');
        requireSafe(BigInt(quote.minAmountOutRaw) >= BigInt(quote.amountOutRaw) * BigInt(10000 - request.slippageBps) / 10000n, 'Protezione slippage insufficiente');
        requireSafe(validAddress(quote.router) && routers.includes(quote.router.toLowerCase()), 'Router non autorizzato');
        const quotedAt = finiteTime(quote.quotedAt);
        requireSafe(Number.isFinite(quotedAt) && now() - quotedAt >= 0 && now() - quotedAt <= maxQuoteAgeMs, 'Preventivo scaduto');
        requireSafe(Number.isInteger(quote.slippageBps) && quote.slippageBps <= request.slippageBps && quote.slippageBps >= 0, 'Slippage diverso dalla strategia');
        mark('CALCOLA', 'OK', 'Preventivo del router validato');
        phase = 'ESEGUE';
        if (mode === 'paper') {
          result.decision = 'PAPER_READY';
          mark('ESEGUE', 'SIMULATO', 'Ordine non inviato alla blockchain');
          mark('MONITORA', 'NON_ATTIVO', 'Nessuna posizione reale aperta');
        } else {
          requireSafe(options.liveEnabled === true, 'Esecuzione reale disabilitata');
          requireSafe(typeof adapters.isAuthorized === 'function' && await adapters.isAuthorized(request, quote) === true, 'Delega di spesa specifica non autorizzata');
          requireSafe(typeof adapters.reserveOrder === 'function' && typeof adapters.record === 'function', 'Registro persistente e protezione duplicati obbligatori');
          requireSafe(typeof adapters.execute === 'function' && typeof adapters.monitor === 'function', 'Esecutore e monitor blockchain mancanti');
          requireSafe(await adapters.reserveOrder(result.orderKey, request, quote) === true, 'Operazione già elaborata o prenotazione fallita');
          const tx = await adapters.execute(request, quote);
          requireSafe(TX_HASH.test(String(tx?.hash || '')), 'Invio ordine senza hash verificabile: controllare blockchain prima di riprovare');
          result.txHash = tx.hash;
          mark('ESEGUE', 'INVIATO', 'Transazione inviata: monitoraggio richiesto');
          phase = 'MONITORA';
          const receipt = await adapters.monitor(tx.hash, CHAIN_ID);
          if (receipt?.chainId === CHAIN_ID && receipt?.confirmed === true && receipt?.success === true && same(receipt.hash, tx.hash)) {
            result.decision = 'CONFIRMED';
            mark('MONITORA', 'CONFERMATO', 'Transazione confermata on-chain');
          } else {
            result.decision = 'PENDING_RECONCILIATION';
            mark('MONITORA', 'DA_VERIFICARE', 'Esito non confermato: non ripetere l’ordine');
          }
        }
      } catch (error) {
        const message = String(error?.message || 'Errore sconosciuto').slice(0, 240);
        result.reason = message;
        result.decision = result.txHash ? 'PENDING_RECONCILIATION' : 'WAIT';
        mark(phase, 'BLOCCATO', message);
      } finally {
        try {
          if (typeof adapters.record === 'function') {
            await adapters.record({ ...result, request: request ? { chainId: request.chainId, wallet: request.wallet, tokenIn: request.tokenIn, tokenOut: request.tokenOut, amountInRaw: request.amountInRaw, strategyId: request.strategyId, signalId: request.signalId } : null });
            result.recorded = true;
            mark('REGISTRA', 'OK', 'Decisione registrata');
          } else mark('REGISTRA', 'NON_ATTIVO', 'Database delle decisioni non collegato');
        } catch (error) {
          mark('REGISTRA', 'ERRORE', String(error?.message || 'Registrazione fallita').slice(0, 180));
        }
      }
      return result;
    }
    return { run, mode, phases: PHASES };
  }
  return { CHAIN_ID, PHASES, createPipeline, checkRequest };
});