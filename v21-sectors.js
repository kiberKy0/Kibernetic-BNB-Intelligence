(()=>{
  const SECTORS=[
    {
      title:'Layer 1 & Layer 2',
      text:'Sono le fondamenta del mercato blockchain. I Layer 1 sono reti autonome sulle quali vengono registrate transazioni ed eseguiti smart contract, mentre i Layer 2 lavorano sopra una blockchain principale per aumentarne velocità e capacità e ridurre i costi. La loro importanza dipende soprattutto da quante persone, applicazioni e capitali utilizzano realmente la rete. Una blockchain può avere una tecnologia eccellente ma avere poco valore economico se nessuno la utilizza. Per questo vanno osservati utenti attivi, transazioni, commissioni, liquidità, stablecoin presenti, sviluppatori e applicazioni. Crescono quando riescono ad attirare attività e capitale; soffrono quando diventano costose, lente o vengono superate da reti concorrenti.',
      metrics:'utenti attivi, transazioni, fee, TVL, stablecoin, sviluppatori e attività delle dApp',
      risks:'congestione, costi elevati, problemi tecnici, scarsa adozione e concorrenza tra reti',
      terms:{'layer 1':'Una Layer 1 è una blockchain principale che possiede il proprio sistema di consenso e registra direttamente le transazioni.','layer 2':'Una Layer 2 aumenta capacità e velocità appoggiandosi alla sicurezza o alla finalità di una rete principale.','smart contract':'Uno smart contract è un programma che esegue automaticamente regole e operazioni sulla blockchain.','tvl':'TVL significa Total Value Locked: il valore degli asset depositati nei protocolli di una rete.','fee':'Le fee sono le commissioni pagate per utilizzare la rete.','scalabilità':'La scalabilità indica quanto una rete riesce a gestire più utenti e transazioni senza diventare troppo lenta o costosa.'}
    },
    {
      title:'DeFi',
      text:'La finanza decentralizzata ricrea molti servizi finanziari direttamente sulla blockchain. Permette di scambiare token, prestare capitale, prendere denaro in prestito, generare rendimento e utilizzare strumenti derivati tramite smart contract. Il suo valore nasce soprattutto dalla quantità di capitale realmente utilizzato nei protocolli. TVL, volumi, prestiti, commissioni generate e utenti sono quindi molto più importanti della semplice popolarità del token. Quando aumenta la liquidità e cresce l’attività economica, il settore tende a rafforzarsi; exploit, rendimenti insostenibili o fughe di capitale possono invece danneggiarlo rapidamente. DEX, lending, staking, yield e derivati rientrano tutti in questa grande famiglia.',
      metrics:'TVL, liquidità, volumi DEX, prestiti, ricavi del protocollo, utenti e utilizzo reale',
      risks:'exploit degli smart contract, leva eccessiva, liquidità insufficiente e rendimenti non sostenibili',
      terms:{'dex':'Un DEX è un exchange decentralizzato che consente di scambiare token tramite smart contract.','lending':'Il lending permette di prestare asset e ricevere interessi oppure di prendere capitale in prestito lasciando una garanzia.','staking':'Lo staking blocca o delega asset per contribuire alla sicurezza o al funzionamento di una rete e ricevere ricompense.','yield':'Lo yield è il rendimento generato dal capitale utilizzato in un protocollo.','tvl':'TVL è il valore complessivo degli asset depositati nei protocolli.','leva':'La leva aumenta l’esposizione usando capitale preso in prestito, amplificando sia profitti sia perdite.'}
    },
    {
      title:'Stablecoin',
      text:'Le stablecoin rappresentano una delle infrastrutture monetarie più importanti del mercato crypto perché permettono di utilizzare una valuta digitale con valore relativamente stabile, generalmente collegata al dollaro. Servono per trading, pagamenti, DeFi e trasferimenti di capitale senza dover continuamente tornare alle valute tradizionali. La loro forza dipende dalla fiducia nelle riserve o nel meccanismo che mantiene il prezzo stabile. Una crescita dell’offerta di stablecoin può indicare nuovo capitale disponibile nel mercato, mentre forti riscatti possono indicare capitale che sta uscendo. Bisogna osservare supply, capitalizzazione, riserve, distribuzione sulle blockchain e soprattutto la capacità di mantenere il valore previsto.',
      metrics:'capitalizzazione, supply, riserve, peg, flussi in entrata e uscita e distribuzione tra le blockchain',
      risks:'depeg, problemi delle riserve, rischio dell’emittente e cambiamenti normativi',
      terms:{'peg':'Il peg è il valore di riferimento che una stablecoin cerca di mantenere, per esempio 1 dollaro.','depeg':'Il depeg avviene quando la stablecoin si allontana in modo significativo dal valore che dovrebbe mantenere.','riserve':'Le riserve sono gli asset che sostengono il valore della stablecoin, quando il modello prevede una garanzia.','supply':'La supply è la quantità di token in circolazione o emessa.'}
    },
    {
      title:'RWA',
      text:'I Real World Assets portano sulla blockchain attività che esistono nel mondo reale, come obbligazioni, credito, immobili, oro o strumenti finanziari. Il token diventa quindi una rappresentazione digitale di qualcosa che possiede già un valore economico esterno alla blockchain. Questo settore è particolarmente interessante perché crea un ponte tra finanza tradizionale e tecnologia blockchain. Cresce quando aumentano asset tokenizzati, investitori e istituzioni coinvolte. La sua debolezza è che non può essere completamente indipendente dal mondo reale: custodia, regolamentazione e affidabilità delle società che gestiscono l’asset restano fondamentali.',
      metrics:'valore degli asset tokenizzati, capitali depositati, volumi, emittenti, investitori e utilizzo istituzionale',
      risks:'custodia, affidabilità dell’emittente, liquidità, diritto sul bene reale e regolamentazione',
      terms:{'rwa':'RWA significa Real World Assets: asset del mondo reale rappresentati o gestiti tramite token blockchain.','tokenizzazione':'La tokenizzazione trasforma un diritto o un asset in una rappresentazione digitale trasferibile sulla blockchain.','custodia':'La custodia riguarda chi detiene o controlla realmente l’asset sottostante.','collateral':'Il collateral è la garanzia utilizzata per sostenere un prestito o un’attività finanziaria.'}
    },
    {
      title:'AI & Compute',
      text:'Questo settore combina blockchain, intelligenza artificiale e capacità di calcolo. Alcuni progetti mettono a disposizione GPU, altri creano marketplace di potenza computazionale, altri ancora sviluppano agenti autonomi capaci di svolgere attività. È un settore con grande potenziale ma anche con molto marketing, quindi bisogna distinguere progetti realmente utilizzati da token che aggiungono semplicemente la parola AI alla presentazione. Domanda di calcolo, clienti, ricavi, agenti attivi e utilizzo della rete sono dati molto più importanti dell’hype. Più l’intelligenza artificiale richiederà infrastruttura e automazione, maggiore potrebbe diventare il ruolo di questi network.',
      metrics:'domanda di compute, utilizzo GPU, clienti, ricavi, agenti attivi, job completati e utilizzo della rete',
      risks:'hype senza prodotto, domanda reale debole, costi elevati e tokenomics scollegata dal servizio',
      terms:{'compute':'Compute indica la potenza di calcolo utilizzata per eseguire modelli, applicazioni e processi informatici.','gpu':'Le GPU sono processori molto adatti ai calcoli paralleli richiesti dall’intelligenza artificiale.','ai agent':'Un AI agent è un software capace di analizzare informazioni e svolgere compiti con un certo grado di autonomia.','inference':'L’inference è la fase in cui un modello AI già addestrato viene utilizzato per produrre una risposta o un risultato.','hype':'Hype significa attenzione e aspettative molto forti che possono crescere più velocemente dell’utilizzo reale.'}
    },
    {
      title:'Data & Oracle',
      text:'Le blockchain possono elaborare perfettamente i dati presenti sulla propria rete, ma non conoscono automaticamente ciò che accade nel mondo esterno. Oracle e infrastrutture dati servono proprio a colmare questa distanza, fornendo prezzi, informazioni finanziarie e altri dati agli smart contract. Senza queste tecnologie moltissimi protocolli DeFi, RWA e applicazioni non potrebbero funzionare correttamente. Il valore di questi progetti dipende quindi soprattutto dal numero e dall’importanza delle integrazioni, dalla quantità di dati forniti e dalla loro affidabilità. Un dato sbagliato può provocare perdite enormi, quindi sicurezza e qualità delle fonti sono essenziali.',
      metrics:'integrazioni, protocolli serviti, richieste dati, valore protetto, qualità delle fonti e continuità del servizio',
      risks:'dati errati, manipolazione delle fonti, centralizzazione e dipendenza da pochi provider',
      terms:{'oracle':'Un oracle porta dati esterni dentro la blockchain affinché gli smart contract possano utilizzarli.','data feed':'Un data feed è un flusso aggiornato di informazioni, per esempio il prezzo di un asset.','indicizzazione':'L’indicizzazione organizza i dati blockchain per renderli più facili da cercare e utilizzare.','manipolazione':'La manipolazione dei dati avviene quando informazioni false o distorte influenzano il funzionamento di un protocollo.'}
    },
    {
      title:'DePIN',
      text:'La DePIN utilizza token e blockchain per organizzare infrastrutture fisiche distribuite. Persone e aziende possono mettere a disposizione connessioni internet, GPU, spazio di archiviazione, sensori o altre risorse e ricevere una ricompensa. L’idea diventa realmente interessante quando esiste anche qualcuno disposto a pagare per utilizzare quella infrastruttura. Per questo non basta contare quanti nodi vengono installati: bisogna capire quanta domanda reale esiste. Crescita di clienti, utilizzo della rete e ricavi sono segnali molto più importanti delle sole emissioni di token.',
      metrics:'nodi attivi, risorse disponibili, clienti, utilizzo reale, ricavi, copertura e rapporto tra domanda e offerta',
      risks:'molti fornitori ma pochi clienti, ricompense non sostenibili e infrastruttura poco utilizzata',
      terms:{'depin':'DePIN significa Decentralized Physical Infrastructure Networks: reti che coordinano infrastrutture fisiche tramite blockchain e incentivi.','nodo':'Un nodo è un dispositivo o un sistema che fornisce una risorsa o partecipa al funzionamento della rete.','domanda':'La domanda misura quanto il servizio viene realmente richiesto e pagato dagli utilizzatori.','ricavi':'I ricavi mostrano quanto valore economico il servizio riesce a generare, distinto dalle semplici emissioni di token.'}
    },
    {
      title:'Infrastructure & Interoperability',
      text:'Il mercato crypto è composto da molte blockchain separate e questo settore costruisce i collegamenti necessari per farle comunicare. Bridge, sistemi cross-chain, rollup, tecnologie ZK e infrastrutture modulari permettono a dati e capitali di spostarsi tra reti differenti. Più cresce il numero delle blockchain, maggiore diventa la necessità di interoperabilità. Il problema è che questi sistemi sono complessi e alcuni bridge sono stati bersaglio di attacchi importanti. Bisogna quindi osservare volumi trasferiti, integrazioni, utilizzo e soprattutto sicurezza.',
      metrics:'volume cross-chain, transazioni, reti integrate, protocolli collegati, utenti e storico della sicurezza',
      risks:'exploit dei bridge, complessità tecnica, frammentazione della liquidità e dipendenza da componenti esterni',
      terms:{'interoperabilità':'L’interoperabilità permette a blockchain e applicazioni differenti di scambiarsi dati o valore.','bridge':'Un bridge collega due o più blockchain e permette di trasferire asset o informazioni tra reti.','cross-chain':'Cross-chain descrive attività o protocolli che operano tra blockchain differenti.','rollup':'Un rollup raggruppa molte operazioni e le registra in modo più efficiente su una rete principale.','zk':'ZK significa Zero Knowledge: tecniche crittografiche che permettono di dimostrare qualcosa senza rivelare tutte le informazioni sottostanti.'}
    },
    {
      title:'Privacy & Cybersecurity',
      text:'La blockchain è trasparente per natura, ma utenti e aziende non possono necessariamente rendere pubblica ogni attività. Le tecnologie di privacy cercano di proteggere informazioni e transazioni, mentre la cybersecurity protegge wallet, protocolli e infrastrutture dagli attacchi. Più aumenta il valore custodito sulle blockchain, più cresce l’importanza della sicurezza. Un singolo exploit può distruggere anni di fiducia in poche ore. Adozione, integrazioni e qualità della tecnologia sono quindi fondamentali, insieme al contesto normativo che può influenzare fortemente alcuni strumenti dedicati alla privacy.',
      metrics:'adozione, integrazioni, valore protetto, incidenti di sicurezza, audit, attività della rete e utilizzo reale',
      risks:'exploit, vulnerabilità, centralizzazione della sicurezza e restrizioni su alcuni strumenti di privacy',
      terms:{'privacy':'La privacy cerca di limitare quali informazioni di una transazione o di un utente diventano pubbliche.','cybersecurity':'La cybersecurity comprende tecnologie e pratiche utilizzate per proteggere sistemi, wallet, protocolli e dati.','exploit':'Un exploit sfrutta una vulnerabilità tecnica per ottenere accesso, fondi o comportamenti non previsti.','audit':'Un audit di smart contract è una revisione del codice alla ricerca di vulnerabilità e problemi di sicurezza.'}
    },
    {
      title:'Digital Identity',
      text:'L’identità digitale permette di dimostrare chi siamo, quali caratteristiche possediamo o quale reputazione abbiamo senza dipendere necessariamente da un unico database centrale. Le credenziali blockchain possono essere utilizzate per accesso a servizi, verifiche, reputazione e sistemi finanziari. Il settore diventa particolarmente interessante se riesce a permettere la verifica delle informazioni senza obbligare l’utente a consegnare ogni dato personale. La crescita dipenderà soprattutto dal numero di servizi che adotteranno questi sistemi e dalla capacità di mantenere un equilibrio tra verifica, privacy e controllo dell’utente.',
      metrics:'utenti verificati, credenziali emesse, servizi integrati, utilizzo delle identità e interoperabilità degli standard',
      risks:'centralizzazione, perdita di privacy, gestione delle credenziali e standard incompatibili',
      terms:{'credenziale':'Una credenziale digitale dimostra una caratteristica o un’informazione associata a una persona o entità.','attestazione':'Un’attestazione è una dichiarazione verificabile che conferma un’informazione.','reputazione':'La reputazione digitale raccoglie segnali che descrivono affidabilità, attività o storia di un’identità.','kyc':'KYC significa Know Your Customer: procedure utilizzate per verificare l’identità di un cliente.'}
    },
    {
      title:'Gaming & Metaverse',
      text:'Gaming e blockchain cercano di dare agli utenti una proprietà reale degli oggetti digitali utilizzati nei giochi. Personaggi, terreni, oggetti e valute possono diventare asset trasferibili. Ma un gioco rimane innanzitutto un gioco: se nessuno si diverte a utilizzarlo, il token non può sostituire un prodotto debole. I dati importanti sono quindi giocatori attivi, ritorno degli utenti, tempo trascorso, ricavi e attività del marketplace. I progetti più solidi cercano di utilizzare la blockchain come infrastruttura senza trasformare ogni azione del giocatore in una speculazione finanziaria.',
      metrics:'giocatori attivi, retention, tempo di utilizzo, ricavi, transazioni, marketplace e sostenibilità della token economy',
      risks:'giochi senza utenti, tokenomics fragile, ricompense inflazionistiche e prodotto costruito più per vendere token che per giocare',
      terms:{'gamefi':'GameFi indica giochi che integrano elementi finanziari, token o asset blockchain.','retention':'La retention misura quanti utenti tornano a utilizzare il gioco dopo il primo accesso.','tokenomics':'La tokenomics descrive emissione, distribuzione, utilizzo e incentivi economici di un token.','metaverso':'Il metaverso indica ambienti digitali persistenti in cui utenti e asset possono interagire.','marketplace':'Il marketplace è il mercato in cui gli utenti possono comprare, vendere o scambiare asset digitali.'}
    },
    {
      title:'Meme',
      text:'I meme token rappresentano l’economia dell’attenzione nella sua forma più estrema. Spesso non hanno una tecnologia particolarmente complessa e il loro valore dipende soprattutto da community, cultura internet, liquidità e interesse del mercato. Possono crescere enormemente quando attenzione e capitale arrivano contemporaneamente, ma possono perdere valore altrettanto velocemente quando quella narrativa si esaurisce. Volume, liquidità, numero di holder, concentrazione dei wallet e attività social sono quindi indicatori essenziali. In questo settore il rischio rimane generalmente molto più elevato rispetto a categorie basate su infrastrutture o servizi.',
      metrics:'volume, liquidità, holder, concentrazione dei wallet, velocità dei flussi e attività social',
      risks:'volatilità estrema, manipolazione, concentrazione in pochi wallet, liquidità debole e perdita improvvisa di attenzione',
      terms:{'holder':'Un holder è un indirizzo o un soggetto che possiede il token.','whale':'Una whale è un possessore con una quantità di token abbastanza grande da poter influenzare il mercato.','narrativa':'La narrativa è il tema o la storia che concentra l’attenzione del mercato su un progetto o gruppo di token.','liquidità':'La liquidità indica quanto facilmente un token può essere comprato o venduto senza provocare grandi variazioni di prezzo.'}
    },
    {
      title:'NFT & Social',
      text:'NFT e SocialFi cercano di trasferire proprietà e controllo dei contenuti digitali agli utenti. Un NFT può rappresentare un oggetto, un diritto, un’identità o un contenuto, mentre i protocolli social decentralizzati permettono di costruire relazioni e reputazione che non dipendono completamente da una singola piattaforma. Il settore ha attraversato periodi di forte speculazione, quindi oggi diventa particolarmente importante distinguere utilizzo reale da semplice compravendita. Utenti attivi, creator, volume, transazioni e applicazioni concrete sono i dati che permettono di capire se esiste davvero un ecosistema.',
      metrics:'utenti attivi, creator, volume dei marketplace, transazioni, collezioni utilizzate e attività sociale',
      risks:'speculazione, domanda instabile, scarsa utilità degli asset e dipendenza dalle mode',
      terms:{'nft':'Un NFT è un token non fungibile che può rappresentare un asset digitale unico o un diritto specifico.','socialfi':'SocialFi combina servizi social con proprietà, identità e incentivi basati su blockchain.','creator':'Un creator è chi produce contenuti, opere o esperienze digitali per una community.','proprietà digitale':'La proprietà digitale usa strumenti crittografici e blockchain per attribuire il controllo di un asset a un wallet.'}
    },
    {
      title:'Payments',
      text:'I pagamenti sono uno degli utilizzi più semplici da comprendere della blockchain: trasferire valore da una persona a un’altra senza dipendere necessariamente dall’infrastruttura bancaria tradizionale. Stablecoin e reti veloci stanno rendendo particolarmente interessanti pagamenti internazionali e trasferimenti tra paesi. Perché questo settore cresca realmente servono però commercianti, utenti e integrazioni concrete. Numero di transazioni, volume trasferito, costi e velocità permettono di capire quanto il sistema venga realmente utilizzato e non soltanto promosso.',
      metrics:'numero di pagamenti, volume trasferito, utenti, commercianti, costi, velocità e integrazioni con servizi reali',
      risks:'scarsa adozione commerciale, costi imprevedibili, concorrenza dei sistemi tradizionali e problemi normativi',
      terms:{'merchant':'Merchant significa commerciante o attività che accetta un determinato sistema di pagamento.','remittance':'Le remittance sono trasferimenti di denaro, spesso internazionali, effettuati da una persona verso familiari o altri destinatari.','settlement':'Il settlement è il regolamento finale del pagamento, cioè il momento in cui il trasferimento viene considerato completato.','pagamento cross-border':'Un pagamento cross-border trasferisce valore tra persone o aziende situate in paesi differenti.'}
    },
    {
      title:'DeSci & Emerging Tech',
      text:'Questa categoria raccoglie gli utilizzi più sperimentali della blockchain, compresa la scienza decentralizzata. La tecnologia può essere utilizzata per finanziare ricerca, condividere dati, gestire proprietà intellettuale o coordinare comunità scientifiche. È anche lo spazio dove potrebbero nascere settori che oggi non sono ancora abbastanza grandi da meritare una categoria indipendente. Proprio perché molto giovane, bisogna prestare particolare attenzione a partnership reali, risultati, finanziamenti e utilizzo. Le idee possono essere estremamente interessanti, ma tra un progetto teoricamente brillante e un sistema realmente adottato esiste spesso una distanza considerevole.',
      metrics:'progetti finanziati, partnership, risultati pubblicati, comunità attive, capitale raccolto e utilizzo delle applicazioni',
      risks:'progetti molto sperimentali, tempi lunghi, risultati incerti e distanza tra idea, ricerca e adozione reale',
      terms:{'desci':'DeSci significa Decentralized Science: utilizzo di blockchain e coordinamento decentralizzato per ricerca, finanziamento e condivisione scientifica.','dao':'Una DAO è un’organizzazione coordinata tramite regole, governance e strumenti blockchain.','proprietà intellettuale':'La proprietà intellettuale comprende diritti su invenzioni, ricerca, opere e conoscenza.','finanziamento':'Nel contesto DeSci, il finanziamento può essere coordinato da community, DAO o investitori per sostenere progetti di ricerca.'}
    }
  ];

  let page=0;
  let sectorContext=null;
  let startX=0;
  const $=id=>document.getElementById(id);
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function ensureBook(){
    const sec=$('section-sectors');
    const body=q('#section-sectors .section-body');
    if(!sec||!body)return false;
    const h=q('#section-sectors .section-head h2');
    const p=q('#section-sectors .section-head p');
    if(h)h.textContent='Settori · Guida Kiber';
    if(p)p.textContent='15 capitoli per capire funzione, differenze, utilità, segnali e rischi del mercato crypto.';
    body.innerHTML='<div id="sectorBook" class="sector-book"><div class="sector-book-page"><div class="sector-book-head"><span id="sectorBookIndex">CAPITOLO 1 / 15</span><h3 id="sectorBookTitle"></h3></div><div id="sectorBookText" class="sector-book-text"></div><div class="sector-book-kiber"><div><b>Vuoi approfondire?</b><span>Kiber userà questo capitolo come contesto della conversazione.</span></div><button type="button" class="primary" id="sectorAskKiber">Chiedi a Kiber</button></div></div><div class="sector-book-nav"><button type="button" id="sectorPrev" aria-label="Capitolo precedente">←</button><div id="sectorDots" class="sector-dots"></div><button type="button" id="sectorNext" aria-label="Capitolo successivo">→</button></div><div id="sectorPageLabel" class="sector-page-label">1 / 15</div></div>';
    $('sectorPrev').onclick=()=>changePage(-1);
    $('sectorNext').onclick=()=>changePage(1);
    $('sectorAskKiber').onclick=askKiber;
    const book=$('sectorBook');
    book.addEventListener('touchstart',e=>{startX=e.changedTouches?.[0]?.clientX||0},{passive:true});
    book.addEventListener('touchend',e=>{const end=e.changedTouches?.[0]?.clientX||0,d=end-startX;if(Math.abs(d)>55)changePage(d<0?1:-1)},{passive:true});
    return true;
  }

  function renderBook(){
    if(!$('sectorBook')&&!ensureBook())return;
    const s=SECTORS[page];
    $('sectorBookIndex').textContent=`CAPITOLO ${page+1} / ${SECTORS.length}`;
    $('sectorBookTitle').textContent=s.title;
    $('sectorBookText').textContent=s.text;
    $('sectorPageLabel').textContent=`${page+1} / ${SECTORS.length}`;
    $('sectorPrev').disabled=page===0;
    $('sectorNext').disabled=page===SECTORS.length-1;
    $('sectorDots').innerHTML=SECTORS.map((_,i)=>`<button type="button" class="sector-dot${i===page?' active':''}" data-sector-page="${i}" aria-label="Vai al capitolo ${i+1}"></button>`).join('');
    qa('[data-sector-page]').forEach(b=>b.onclick=()=>{page=Number(b.dataset.sectorPage)||0;renderBook()});
    if($('sectorCountNav'))$('sectorCountNav').textContent='15 capitoli';
  }

  function changePage(dir){
    const next=Math.max(0,Math.min(SECTORS.length-1,page+dir));
    if(next===page)return;
    page=next;
    renderBook();
  }

  function askKiber(){
    sectorContext=SECTORS[page];
    window.KIBER_SECTOR_CONTEXT=sectorContext;
    if(typeof openSection==='function')openSection('kiber');
    const input=$('chatInput');
    if(input){input.placeholder=`Chiedi qualcosa su ${sectorContext.title}…`;input.focus()}
    const chat=$('chatMessages');
    if(chat){
      const prev=chat.querySelector('.sector-context-msg');
      if(prev)prev.remove();
      chat.insertAdjacentHTML('beforeend',`<div class="assistant-msg sector-context-msg"><b>${safe(sectorContext.title)}</b><br>Sto usando questo capitolo come contesto. Chiedimi una parola, un concetto, un rischio, un dato da controllare o qualsiasi approfondimento su questo settore.</div>`);
      chat.scrollTop=chat.scrollHeight;
    }
  }

  function findTerm(s,question){
    const low=question.toLowerCase();
    const entries=Object.entries(s.terms||{}).sort((a,b)=>b[0].length-a[0].length);
    return entries.find(([k])=>low.includes(k.toLowerCase()))||null;
  }

  function sectorAnswer(question){
    const s=window.KIBER_SECTOR_CONTEXT||sectorContext;
    if(!s)return null;
    const low=question.toLowerCase();
    const term=findTerm(s,question);
    if(term)return `${term[1]} Nel settore ${s.title}, questo concetto va letto insieme a ${s.metrics}.`;
    if(/risch|pericol|proble|debole|non va|scende|calo/.test(low))return `Per ${s.title} i rischi principali sono: ${s.risks}. Non basta guardare il prezzo: conviene verificare anche ${s.metrics}.`;
    if(/monitor|guard|dato|metrica|capire|valut/.test(low))return `Per leggere ${s.title} controllerei soprattutto ${s.metrics}. Sono dati utili per distinguere attività reale da semplice attenzione di mercato.`;
    if(/cres|sale|forte|perché va|perche va|positivo/.test(low))return `${s.title} tende a rafforzarsi quando aumenta l’utilizzo reale e migliorano i dati caratteristici del settore. In pratica, osserva ${s.metrics}. Il prezzo da solo non dice se la crescita sia sostenibile.`;
    if(/serve|funzion|cos'è|cosa è|che cos|import|perché esiste|perche esiste/.test(low))return `${s.text} Se vuoi restringere la domanda a una parola specifica, posso spiegartela nel contesto di ${s.title}.`;
    return `Stiamo approfondendo ${s.title}. In questo capitolo i punti centrali sono l’utilizzo reale, i dati che dimostrano attività e i rischi specifici. Per orientarti controlla soprattutto ${s.metrics}. Puoi chiedermi anche il significato di un termine preciso oppure perché un certo dato è importante.`;
  }

  const previousLocal=typeof localKiber==='function'?localKiber:null;
  if(previousLocal){
    localKiber=function(question){
      const answer=sectorAnswer(question);
      if(answer)return answer;
      return previousLocal(question);
    };
  }

  const oldRender=typeof renderSectors==='function'?renderSectors:null;
  renderSectors=function(){renderBook()};

  function boot(){
    renderBook();
    setTimeout(renderBook,500);
    setTimeout(renderBook,1400);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();