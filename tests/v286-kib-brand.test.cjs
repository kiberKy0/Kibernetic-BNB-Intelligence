const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
test('Kiber and scanner are mounted in production boot, with Kiber after scanner',()=>{
 const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(index,/free-scanner-ui\.css/);assert.match(index,/kiber-assistant\.css/);
 assert.match(index,/free-scanner-ui\.js/);assert.match(index,/kiber-assistant\.js/);
 assert(index.indexOf("'free-scanner-ui.js'")<index.indexOf("'kiber-assistant.js'"));
});
test('Kiber is clearly labeled rule-based and does not claim external LLM or wallet access',()=>{
 const q=fs.readFileSync(path.join(root,'kiber-assistant.js'),'utf8');
 assert.match(q,/non sono collegato a un modello linguistico esterno/i);
 assert.match(q,/Nessuna operazione finanziaria viene eseguita/i);
 assert.match(q,/Modalità locale a regole/i);
 assert.doesNotMatch(q,/OPENAI_API_KEY|process\.env|sk-proj/);
});
test('GoPlus checks are read only and unknown results are not declared safe',()=>{
 const api=require('../api/token-search.js');
 const missing=api.securitySummary({});
 assert.equal(missing.risk,'NON VERIFICABILE');
 const suspicious=api.securitySummary({is_honeypot:'1',sell_tax:'0.45'});
 assert.equal(suspicious.risk,'ALTO');
 assert(suspicious.flags.some(x=>x.field==='sell_tax'));
});
test('Free scanner reports limited discovery coverage',()=>{
 const s=fs.readFileSync(path.join(root,'free-scanner-ui.js'),'utf8');
 assert.match(s,/non tutte le monete della rete/);
 assert.match(s,/Punteggi euristici/);
 assert.match(s,/\/api\/discovery-v26\?limit=40/);
});

test('BNB summary has readable labels and no injected bell',()=>{
 const home=fs.readFileSync(path.join(root,'v26-6.js'),'utf8');
 const watch=fs.readFileSync(path.join(root,'v27-7.js'),'utf8');
 assert.match(home,/BNB · Prezzo attuale/);
 assert.match(home,/Ultimi 7 giorni/);
 assert.doesNotMatch(watch,/b\.id='v277BnbBell'/);
});
test('Introduction explains the roadmap and names Kiber consistently',()=>{
 const guide=fs.readFileSync(path.join(root,'access-guide.js'),'utf8');
 assert.match(guide,/Approfondisci con Kiber/);
 assert.match(guide,/Il trading autonomo reale non è attivo/);
 assert.doesNotMatch(guide,/Approfondisci con Kib\./);
});
