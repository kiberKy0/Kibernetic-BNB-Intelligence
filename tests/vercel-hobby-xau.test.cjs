'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const config = require('../vercel.json');
const apiFiles = fs.readdirSync(path.join(root, 'api')).filter(name => name.endsWith('.js'));
test('Vercel Hobby limit: no more than 12 serverless function entrypoints', () => {
  assert.equal(apiFiles.length, 12, 'There must be exactly 12 serverless functions.');
});
test('XAU/USD public endpoint is rewritten to the shared proxy', () => {
  const rewrite = config.rewrites.find(x => x.source === '/api/xau');
  assert.deepEqual(rewrite, {source: '/api/xau', destination: '/api/coingecko?type=xau'});
  assert.equal(fs.existsSync(path.join(root, 'api/xau.js')), false);
  assert.equal(fs.existsSync(path.join(root, 'server/xau-handler.cjs')), true);
});
function response() {
  const res = {headers:{},code:200,body:null,
    setHeader(key, value) { this.headers[key]=value; return this; },
    status(code) { this.code=code; return this; },
    json(body) { this.body=body; return this; }
  };
  return res;
}
test('shared proxy keeps unverified gold feed blocked and distinct from BNB', async () => {
  const engine=require('../server/xau-biquote.cjs');
  const previous=engine.getSnapshot;
  const xauFile=require.resolve('../server/xau-handler.cjs');
  engine.getSnapshot=async()=>({
    quality:{ok:false,reason:'feed XAU/USD non verificato'},
    source:'test offline',
    timestamp:'2026-11-18T20:00:00.000Z'
  });
  delete require.cache[xauFile];
  try{
    const handler=require('../api/coingecko.js');
    const res=response();
    await handler({method:'GET',query:{type:'xau',interval:'15min'}},res);
    assert.equal(res.code,503);
    assert.equal(res.body.code,'FEED_BLOCKED');
    assert.match(res.body.error,/XAU\/USD/);
  }finally{
    engine.getSnapshot=previous;
    delete require.cache[xauFile];
  }
});
test('shared proxy BNB health endpoint remains operational', async () => {
  const handler=require('../api/coingecko.js');
  const res=response();
  await handler({method:'GET',query:{type:'health'}},res);
  assert.equal(res.code,200);
  assert.equal(res.body.ok,true);
  assert.equal(res.body.service,'Kiber Market Proxy');
});
