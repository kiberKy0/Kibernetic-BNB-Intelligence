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
test('shared proxy routes missing gold feed to clear NO_FEED, not a BNB market error', async () => {
  const old=process.env.TWELVEDATA_API_KEY;
  delete process.env.TWELVEDATA_API_KEY;
  try {
    const handler = require('../api/coingecko.js');
    const res=response();
    await handler({method:'GET',query:{type:'xau',interval:'15min'}},res);
    assert.equal(res.code,503);
    assert.equal(res.body.code,'NO_FEED');
    assert.match(res.body.error,/XAU\/USD/);
  } finally {
    if (old !== undefined) process.env.TWELVEDATA_API_KEY=old;
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
