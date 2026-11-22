const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/api/activity/activity.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
function runtime(fetch, storage = () => 'customer-token', consent=true) {
  const scope = { require:()=>({analyticsAllowed:()=>typeof consent === "function" ? consent() : consent}), exports: {}, crypto: { randomUUID: () => '2dcbb5c3-019e-430b-aacd-e1db836834ad' }, localStorage: { getItem: storage }, fetch };
  vm.runInNewContext(code, scope);
  return scope.exports;
}
const drain = async () => { for (let i=0;i<5;i++) await new Promise(setImmediate); };
(async () => {
  let deniedCalls=0;
  runtime(async()=>{deniedCalls++;},()=> 'token',false).trackActivity('PRICING_VIEWED','pricing');
  await drain();assert.equal(deniedCalls,0);
  let permission=true,revokeCalls=0;
  runtime(async()=>{revokeCalls++;permission=false;return{status:500};},()=> 'token',()=>permission).trackActivity('PRICING_VIEWED','pricing');
  await drain();assert.equal(revokeCalls,1);
  let reads=0,blockedCalls=0;
  runtime(async()=>{blockedCalls++;return{status:204};},()=>{if(reads++===0)return 'token';throw new Error('storage blocked');}).trackActivity('PRICING_VIEWED','pricing');
  await drain();assert.equal(blockedCalls,0);
  const calls = [];
  const tracker = runtime(async (url, options) => { calls.push({ url, options }); return { status: 204 }; });
  tracker.trackActivity('PRICING_VIEWED', 'pricing'); await drain();
  assert.equal(calls.length, 1); assert.equal(calls[0].url, '/api/activity');
  assert.equal(calls[0].options.keepalive, true);
  assert.equal(calls[0].options.headers.Authorization, 'Bearer customer-token');
  assert.deepEqual(JSON.parse(calls[0].options.body), { eventId: '2dcbb5c3-019e-430b-aacd-e1db836834ad', type: 'PRICING_VIEWED', source: 'pricing' });
  tracker.trackPaymentClick('b1_unlimited', 'exam_result'); await drain();
  assert.equal(JSON.parse(calls[1].options.body).plan, 'b1_unlimited');
  for (const mode of ['500', 'network']) {
    const retry = [];
    const api = runtime(async (_, options) => { retry.push(options.body); if (mode === 'network') throw new Error('offline'); return { status: 500 }; });
    assert.doesNotThrow(() => api.trackPaymentClick('b1', 'settings')); await drain();
    assert.equal(retry.length, 2); assert.equal(retry[0], retry[1]);
  }
  let unauthorized = 0;
  runtime(async () => { unauthorized++; return {status: 403}; }).trackActivity('PRICING_VIEWED', 'pricing');
  await drain(); assert.equal(unauthorized, 1);
  runtime(() => { throw new Error('must not call'); }, () => null).trackActivity('PRICING_VIEWED','pricing');
  assert.doesNotThrow(() => runtime(() => {}, () => { throw new Error('blocked storage'); }).trackActivity('PRICING_VIEWED','pricing'));
  console.log('Activity client checks passed: payload, identity header, keepalive, plan, retry deduplication, failure isolation, missing/blocked storage.');
})().catch(e => { console.error(e); process.exitCode = 1; });
