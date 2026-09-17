import test from 'node:test';
import assert from 'node:assert/strict';
import { MACHINE_CATALOG, validateBet, cardValue } from '../shared/rules.js';
import { mulberry32 } from '../shared/rng.js';
import { resolveInstant, startProgressive, progressiveAction, progressivePublic } from '../server/machines.js';

const instant=['roulette','plinko','slots','craps','fortune_wheel','duck_race','pachinko','money_wheel','penguin_cross','keno','poker','baccarat'];
const progressive=['crash','hilo','dragon_tower','minesweeper'];
const choices={roulette:'red',craps:'pass',duck_race:'1',penguin_cross:'3',keno:'medium',baccarat:'banker'};

test('catalog contains exactly 17 unique machine ids',()=>{
  const ids=Object.keys(MACHINE_CATALOG);
  assert.equal(ids.length,17);
  assert.equal(new Set(ids).size,17);
  for(const [id,m] of Object.entries(MACHINE_CATALOG)){
    assert.ok(m.label.length>2,id);
    assert.ok(Array.isArray(m.pos)&&m.pos.length===2,id);
    assert.ok(m.minBet>0&&m.maxBet>=m.minBet,id);
  }
});

test('bet validation blocks invalid amounts and unknown machines',()=>{
  assert.equal(validateBet(1000,'roulette',50).ok,true);
  assert.equal(validateBet(20,'roulette',50).reason,'INSUFFICIENT_FUNDS');
  assert.equal(validateBet(1000,'roulette',0).reason,'BET_TOO_LOW');
  assert.equal(validateBet(1000,'unknown',50).reason,'UNKNOWN_MACHINE');
});

test('instant resolvers stay finite across seeded regression sweep',()=>{
  for(const machine of instant){
    for(let seed=1;seed<=250;seed++){
      const r=resolveInstant(machine,mulberry32(seed),100,choices[machine]);
      assert.ok(r,`${machine}:${seed}`);
      assert.ok(Number.isFinite(r.duration)&&r.duration>=0,`${machine}:duration`);
      assert.ok(Number.isFinite(r.payout)&&r.payout>=0,`${machine}:payout`);
      assert.ok(r.result&&typeof r.result==='object',`${machine}:result`);
    }
  }
});

test('all progressive machines expose safe public state and actions',()=>{
  for(const [i,machine] of progressive.entries()){
    const s=startProgressive(machine,mulberry32(100+i),100);
    assert.ok(s&&s.machine===machine,machine);
    assert.ok(progressivePublic(s),machine);
    if(machine==='crash'){
      const r=progressiveAction(s,'cashout');
      assert.equal(r.done,true);
      assert.ok(r.payout>=100);
    }else if(machine==='hilo'){
      const r=progressiveAction(s,'cashout');
      assert.equal(r.done,true);
      assert.equal(r.payout,100);
    }else if(machine==='dragon_tower'){
      const r=progressiveAction(s,'cashout');
      assert.equal(r.done,true);
      assert.equal(r.payout,100);
    }else{
      const r=progressiveAction(s,'cashout');
      assert.equal(r.done,true);
      assert.equal(r.payout,100);
    }
  }
});

test('blackjack ace valuation is stable',()=>{
  assert.equal(cardValue([{rank:'A'},{rank:'K'}]),21);
  assert.equal(cardValue([{rank:'A'},{rank:'A'},{rank:'9'}]),21);
  assert.equal(cardValue([{rank:'A'},{rank:'9'},{rank:'9'}]),19);
});
