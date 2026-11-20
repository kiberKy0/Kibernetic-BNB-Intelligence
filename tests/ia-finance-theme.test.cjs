'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const css=fs.readFileSync('kiber-ia-finance-theme.css','utf8');
const html=fs.readFileSync('index.html','utf8');
const frame=fs.readFileSync('v20-production.html','utf8');
const home=fs.readFileSync('dashboard-compact.js','utf8');

test('Finance palette and glass UI are applied by a trailing presentation-only stylesheet',()=>{
 assert.match(css,/#060c1c/);
 assert.match(css,/#42dbff/);
 assert.match(css,/#101b44/);
 assert.match(css,/Bricolage Grotesque/);
 assert.match(css,/DM Sans/);
 assert.match(css,/linear-gradient/);
 assert.match(css,/#kiberCompactDashboard/);
 assert.match(css,/\.kiber-panel/);
 assert.match(css,/#v271TokenView/);
 assert.match(css,/\.kbo-panel/);
 assert.match(html,/'bnb-cloud-orb\.css','kiber-ia-finance-theme\.css']/);
 assert.match(html,/V='314-20261120-ia-finance-skin'/);
});

test('Original dashboard navigation, windows, token scan, wallet and chat remain intact',()=>{
 for(const a of ['bnb','new','defi','compare','search','watch','profile','gold']){
  assert.match(home,new RegExp("data-kcd-action=\\\\""+a+"\\\\"|navigate\\('"+a+"'\\)"));
 }
 assert.match(frame,/id="kiberHeaderGold"/);
 assert.match(frame,/id="kiberHeaderWalletBalance"/);
 assert.match(frame,/id="profileBtn"/);
 assert.match(html,/id="walletMini"/);
 assert.match(html,/id="walletBalanceToggle"/);
 assert.match(html,/id="app"/);
 assert.match(html,/id="goldPanel"/);
 assert.match(html,/'kiber-assistant\.js'/);
 assert.match(html,/'bnb-trading-panel\.js'/);
 assert.match(html,/'bnb-cloud-orb\.js'/);
 assert.match(home,/id="kcdTokens"/);
});

test('Skin does not hide, reorder or rewrite controls, financial data, or execution logic',()=>{
 assert.doesNotMatch(css,/\bdisplay\s*:\s*none\b/i);
 assert.doesNotMatch(css,/\b(?:position\s*:\s*fixed|grid-template-columns|order\s*:|visibility\s*:\s*hidden)\b/i);
 assert.doesNotMatch(css,/\b(?:fetch\s*\(|ethereum|MetaMask\.request|window\.location|onClick|addEventListener|api\/)\b/);
 assert.doesNotMatch(css,/url\(['"]?https:\/\/(?!fonts\.googleapis\.com)/i);
 assert.match(css,/presentation-only/i);
});

test('All key state colours and phone layouts are preserved',()=>{
 assert.match(css,/data-tone="up"/);
 assert.match(css,/data-tone="down"/);
 assert.match(css,/Orb visual remains semantic/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/max-width:650px/);
 assert.match(css,/focus-visible/);
});
