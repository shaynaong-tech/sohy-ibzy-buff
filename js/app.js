
window.bootApp = function(){
const STORE = window.IBZY_STORE;
const STORAGE_VOLATILE = window.IBZY_ACCOUNT.volatile;
"use strict";
/* ---------- storage ---------- */
const LS = {
  get(k,d){ try{ const v=STORE.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } },
  set(k,v){ try{ STORE.setItem(k,JSON.stringify(v)); return true; }
            catch(e){ toast("⚠ Storage full — export your bank as backup"); return false; } }
};
const SEED = window.IBZY_BANK;   // built from the lesson content files

// bank: seeded once, then user-owned in localStorage
let BANK = SEED.map(x=>({...x}));
let SR       = LS.get('rba_leitner', {});     // id -> {box, due(ms), seen}
let REVIEWS  = LS.get('rba_reviews', []);     // {id, ts, grade, conf}
let SET      = LS.get('rba_settings', { inScope:null, theme:'light' });
if(!SET.inScope){ SET.inScope = [...new Set(BANK.map(i=>i.topic))]; }
[...new Set(BANK.map(i=>i.topic))].forEach(t=>{ if(!SET.inScope.includes(t) && !(SET.seenTopics||[]).includes(t)) SET.inScope.push(t); });
SET.seenTopics=[...new Set(BANK.map(i=>i.topic))];
if(SET.drillReadOnly===undefined) SET.drillReadOnly=true;
if(SET.qzUnlockedOnly===undefined) SET.qzUnlockedOnly=true;
if(!SET.drillScope){ SET.drillScope = {mode:'all',topics:[]}; }

document.documentElement.dataset.theme = SET.theme;
document.documentElement.dataset.palette = 'eye';

function saveSR(){ LS.set('rba_leitner', SR); }
function saveReviews(){ LS.set('rba_reviews', REVIEWS); }
function saveSet(){ LS.set('rba_settings', SET); }

/* ---------- Leitner spaced repetition ---------- */
const BOX_DAYS = {1:0, 2:1, 3:3, 4:7, 5:21};
const DAY = 86400000;
const startOfToday = () => { const d=new Date(); d.setHours(0,0,0,0); return d.getTime(); };
function srOf(id){ return SR[id] || {box:1, due:0, seen:false}; }
function isDue(id){ return srOf(id).due <= Date.now(); }
function applyGrade(id, grade){            // 1 Again 2 Hard 3 Good 4 Easy
  const s = srOf(id);
  let box = s.box;
  if(grade===1) box = 1;
  else if(grade===2) box = Math.max(1, box);
  else if(grade===3) box = Math.min(5, box+1);
  else if(grade===4) box = Math.min(5, box+2);
  const due = startOfToday() + BOX_DAYS[box]*DAY + (box===1?0:0);
  SR[id] = { box, due: grade===1 ? Date.now() : due, seen:true }; // "Again" returns this session
  saveSR();
}

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const inScope = i => SET.inScope.includes(i.topic);
const esc = s => (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2200); }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.random()*(i+1)|0; [a[i],a[j]]=[a[j],a[i]]; } return a; }
function shuffleOpts(m){ const idx=m.o.map((_,i)=>i); shuffle(idx);
  return {...m, o:idx.map(i=>m.o[i]), a:idx.indexOf(m.a)}; }
// interleave: avoid two consecutive from the same subtopic where possible
function interleave(items){
  shuffle(items);
  const out=[]; const pool=[...items];
  while(pool.length){
    let idx = pool.findIndex(x => !out.length || x.subtopic !== out[out.length-1].subtopic);
    if(idx<0) idx=0;
    out.push(pool.splice(idx,1)[0]);
  }
  return out;
}

/* ---------- Accounting 101 (teaching sandbox) ---------- */
const ACCT0 = ()=>({cash:0,ar:0,inv:0,ppe:0,accDep:0, ap:0,wagesPay:0,defRev:0,debt:0, stock:0,
  rev:0,cogs:0,wages:0,dep:0,interest:0});
let ACCT = ACCT0();
let ACCT_LOG = [];
let acctLastNote = 'Pick an event on the left to post it. You\u2019ll see its journal entry below and the three statements on the right update. Every entry keeps Assets = Liabilities + Equity in balance.';
let acctPrevLen = -1;

// Each transaction: cf carries only the investing/financing cash bucket (operating cash is derived
// indirectly from net income + working capital). req() guards keep the sandbox coherent.
const ATX = [
 {id:'invest', g:'Financing \u00b7 raise money', label:'Owner invests $100 cash', cf:{b:'F',amt:100},
  je:[['Dr','Cash',100],['Cr','Common stock',100]],
  note:'The owner puts in $100. Cash (an asset) rises and owners\u2019 equity rises. Raising money is not revenue \u2014 no profit is earned.',
  ap:s=>{s.cash+=100; s.stock+=100;}},
 {id:'borrow', g:'Financing \u00b7 raise money', label:'Borrow $50 from a bank', cf:{b:'F',amt:50},
  je:[['Dr','Cash',50],['Cr','Bank loan',50]],
  note:'You borrow $50. Cash rises and a liability (the loan) rises. Borrowing brings in cash but is not income \u2014 you owe it back.',
  ap:s=>{s.cash+=50; s.debt+=50;}},
 {id:'repay', g:'Financing \u00b7 raise money', label:'Repay $20 of loan principal', cf:{b:'F',amt:-20},
  je:[['Dr','Bank loan',20],['Cr','Cash',20]],
  note:'You repay $20 of what you borrowed. The loan falls and cash falls. Repaying principal is NOT an expense \u2014 only interest is. It sits in financing cash flow.',
  req:s=>s.debt>=20, reqMsg:'You don\u2019t have a $20+ loan to repay yet \u2014 borrow first.',
  ap:s=>{s.debt-=20; s.cash-=20;}},
 {id:'interest', g:'Financing \u00b7 raise money', label:'Pay $5 interest on the loan',
  je:[['Dr','Interest expense',5],['Cr','Cash',5]],
  note:'You pay $5 interest \u2014 the cost of borrowing. It is an expense on the income statement and cash falls. (Under US GAAP interest paid sits in operating cash flow.)',
  req:s=>s.cash>=5, reqMsg:'Not enough cash \u2014 raise money first.',
  ap:s=>{s.interest+=5; s.cash-=5;}},

 {id:'equip', g:'Investing \u00b7 long-term assets', label:'Buy equipment for $60 cash', cf:{b:'I',amt:-60},
  je:[['Dr','Equipment (PP&E)',60],['Cr','Cash',60]],
  note:'You swap $60 of cash for a $60 machine. Total assets are unchanged \u2014 buying a long-lived asset is NOT an expense; it shows up in investing cash flow.',
  req:s=>s.cash>=60, reqMsg:'Not enough cash to buy equipment \u2014 raise money first (owner capital or a loan).',
  ap:s=>{s.cash-=60; s.ppe+=60;}},
 {id:'deprec', g:'Investing \u00b7 long-term assets', label:'Record $10 depreciation',
  je:[['Dr','Depreciation expense',10],['Cr','Accumulated depreciation',10]],
  note:'The machine wears out a little. Depreciation spreads its cost over time: a $10 expense lowers profit and the machine\u2019s book value \u2014 but NO cash moves. This is the classic non-cash expense.',
  req:s=>(s.ppe-s.accDep)>=10, reqMsg:'You need equipment on the books before you can depreciate it.',
  ap:s=>{s.dep+=10; s.accDep+=10;}},

 {id:'buyinv_cash', g:'Operating \u00b7 buy', label:'Buy inventory for $40 cash',
  je:[['Dr','Inventory',40],['Cr','Cash',40]],
  note:'You buy $40 of goods to resell. Cash becomes inventory \u2014 both assets. Still no expense: under accrual, the cost becomes an expense (COGS) only when you sell the goods.',
  req:s=>s.cash>=40, reqMsg:'Not enough cash \u2014 raise money first.',
  ap:s=>{s.cash-=40; s.inv+=40;}},
 {id:'buyinv_credit', g:'Operating \u00b7 buy', label:'Buy $40 inventory on credit',
  je:[['Dr','Inventory',40],['Cr','Accounts payable',40]],
  note:'You receive $40 of goods now and promise to pay the supplier later. Inventory rises and a liability (accounts payable) rises. No cash moves yet \u2014 a pure accrual.',
  ap:s=>{s.inv+=40; s.ap+=40;}},
 {id:'paysupplier', g:'Operating \u00b7 buy', label:'Pay a supplier $40 (settle payable)',
  je:[['Dr','Accounts payable',40],['Cr','Cash',40]],
  note:'You pay $40 you owed a supplier. Cash falls and the payable falls. This is NOT an expense \u2014 the cost was already recorded when you received the goods.',
  req:s=>s.ap>=40&&s.cash>=40, reqMsg:'You need a $40+ payable and enough cash to settle it.',
  ap:s=>{s.cash-=40; s.ap-=40;}},

 {id:'sell_cash', g:'Operating \u00b7 sell', label:'Sell goods for $90 cash (cost $35)',
  je:[['Dr','Cash',90],['Cr','Revenue',90],['Dr','Cost of goods sold',35],['Cr','Inventory',35]],
  note:'You sell for $90 cash goods that cost $35. Revenue $90 and COGS $35 hit the income statement (gross profit $55); inventory falls by its cost; cash rises $90.',
  req:s=>s.inv>=35, reqMsg:'You don\u2019t have enough inventory \u2014 buy some first.',
  ap:s=>{s.cash+=90; s.rev+=90; s.cogs+=35; s.inv-=35;}},
 {id:'sell_credit', g:'Operating \u00b7 sell', label:'Sell goods for $80 on credit (cost $30)',
  je:[['Dr','Accounts receivable',80],['Cr','Revenue',80],['Dr','Cost of goods sold',30],['Cr','Inventory',30]],
  note:'THE KEY ACCRUAL LESSON: you earned $80 of revenue and $50 of profit \u2014 but received zero cash. Instead you hold a receivable (a promise to pay). Net income rises; cash does not.',
  req:s=>s.inv>=30, reqMsg:'You don\u2019t have enough inventory \u2014 buy some first.',
  ap:s=>{s.ar+=80; s.rev+=80; s.cogs+=30; s.inv-=30;}},
 {id:'collect', g:'Operating \u00b7 sell', label:'Collect $80 from a customer',
  je:[['Dr','Cash',80],['Cr','Accounts receivable',80]],
  note:'The customer pays the $80 they owed. Cash rises and the receivable falls. This is NOT new revenue \u2014 you booked it on the credit sale; cash is just catching up.',
  req:s=>s.ar>=80, reqMsg:'No one owes you $80 yet \u2014 make a credit sale first.',
  ap:s=>{s.cash+=80; s.ar-=80;}},
 {id:'prepay', g:'Operating \u00b7 sell', label:'Customer prepays $25 for future work',
  je:[['Dr','Cash',25],['Cr','Deferred revenue',25]],
  note:'A customer pays $25 in advance. You have the cash but haven\u2019t delivered \u2014 so it is NOT revenue yet. You owe them the work, so it is a liability (deferred revenue).',
  ap:s=>{s.cash+=25; s.defRev+=25;}},
 {id:'deliver', g:'Operating \u00b7 sell', label:'Deliver $25 of prepaid work',
  je:[['Dr','Deferred revenue',25],['Cr','Revenue',25]],
  note:'You deliver the work that was prepaid. Now you earn the $25: revenue is recorded and the deferred-revenue liability clears. No cash moves \u2014 you already received it.',
  req:s=>s.defRev>=25, reqMsg:'There\u2019s no prepayment to deliver against \u2014 take a prepayment first.',
  ap:s=>{s.defRev-=25; s.rev+=25;}},

 {id:'paywages', g:'Operating \u00b7 pay costs', label:'Pay $20 wages in cash',
  je:[['Dr','Wages expense',20],['Cr','Cash',20]],
  note:'You pay staff $20. Wages expense hits the income statement and cash falls \u2014 here expense and cash move together.',
  req:s=>s.cash>=20, reqMsg:'Not enough cash \u2014 raise money or sell something first.',
  ap:s=>{s.wages+=20; s.cash-=20;}},
 {id:'accruewages', g:'Operating \u00b7 pay costs', label:'Accrue $15 wages owed (unpaid)',
  je:[['Dr','Wages expense',15],['Cr','Wages payable',15]],
  note:'Staff worked but haven\u2019t been paid. Accrual says record the $15 expense now plus a liability (wages payable). Profit falls even though no cash left.',
  ap:s=>{s.wages+=15; s.wagesPay+=15;}},
];

function acctPost(id){ const t=ATX.find(x=>x.id===id); if(!t) return;
  if(t.req && !t.req(ACCT)){ toast(t.reqMsg||'That isn\u2019t possible yet.'); return; }
  t.ap(ACCT); ACCT_LOG.push(id);
  acctLastNote='<b>'+esc(t.label)+'.</b> '+t.note; acctRenderLab(); }
function acctReset(){ ACCT=ACCT0(); ACCT_LOG=[];
  acctLastNote='Cleared. Post a transaction to begin again \u2014 or hit \u201cRun a sample sequence\u201d for a full worked example.'; acctRenderLab(); }
function acctSample(){ ACCT=ACCT0(); ACCT_LOG=[];
  ['invest','borrow','equip','buyinv_cash','buyinv_credit','sell_cash','sell_credit','collect',
   'paywages','accruewages','prepay','deliver','deprec','interest','paysupplier','repay']
    .forEach(id=>{ const t=ATX.find(x=>x.id===id); t.ap(ACCT); ACCT_LOG.push(id); });
  acctLastNote='<b>Ran a full sample sequence.</b> Read the three statements below, then hit Reset and post transactions one at a time to see each effect in isolation. Notice net income and ending cash are different numbers \u2014 that is accrual at work.';
  acctRenderLab(); }

function acctRenderLab(){
  const s=ACCT;
  const gross=s.rev-s.cogs, ebit=gross-s.wages-s.dep, NI=ebit-s.interest;
  const ppeNet=s.ppe-s.accDep, assets=s.cash+s.ar+s.inv+ppeNet;
  const liab=s.ap+s.wagesPay+s.defRev+s.debt, re=NI, equity=s.stock+re, le=liab+equity;
  const dAR=s.ar,dInv=s.inv,dAP=s.ap,dWP=s.wagesPay,dDR=s.defRev;
  const cfo=NI+s.dep+(-dAR)+(-dInv)+dAP+dWP+dDR;
  let cfi=0,cff=0;
  ACCT_LOG.forEach(id=>{ const t=ATX.find(x=>x.id===id);
    if(t&&t.cf){ if(t.cf.b==='I')cfi+=t.cf.amt; else if(t.cf.b==='F')cff+=t.cf.amt; } });
  const net=cfo+cfi+cff;
  const row=(l,v,cls='')=>`<div class="stmt-row"><span>${l}</span><span class="${cls}">${fmt(v)}</span></div>`;
  const sub=(l,v)=>`<div class="stmt-sep"></div><div class="stmt-row"><span><b>${l}</b></span><span><b>${fmt(v)}</b></span></div>`;
  const opt=(c,h)=>c?h:'';

  const IS=`<div class="acct-stmt"><h4>Income statement</h4><div class="sub">Profit earned over the period</div>
    ${row('Revenue',s.rev)}
    ${opt(s.cogs,row('Cost of goods sold',-s.cogs,'neg'))}
    ${sub('Gross profit',gross)}
    ${opt(s.wages,row('Wages',-s.wages,'neg'))}
    ${opt(s.dep,row('Depreciation',-s.dep,'neg'))}
    ${sub('Operating profit (EBIT)',ebit)}
    ${opt(s.interest,row('Interest',-s.interest,'neg'))}
    ${sub('Net income',NI)}</div>`;

  const BS=`<div class="acct-stmt"><h4>Balance sheet</h4><div class="sub">What you own & owe, right now</div>
    <div class="acct-sec">Assets</div>
    ${row('Cash',s.cash)}
    ${opt(s.ar,row('Accounts receivable',s.ar))}
    ${opt(s.inv,row('Inventory',s.inv))}
    ${opt(s.ppe,row('Equipment, net',ppeNet))}
    ${sub('Total assets',assets)}
    <div class="acct-sec">Liabilities</div>
    ${opt(s.ap,row('Accounts payable',s.ap))}
    ${opt(s.wagesPay,row('Wages payable',s.wagesPay))}
    ${opt(s.defRev,row('Deferred revenue',s.defRev))}
    ${opt(s.debt,row('Bank loan',s.debt))}
    ${liab===0?'<div class="stmt-row"><span class="muted">\u2014 none yet \u2014</span><span></span></div>':''}
    ${sub('Total liabilities',liab)}
    <div class="acct-sec">Equity</div>
    ${opt(s.stock,row('Common stock',s.stock))}
    ${row('Retained earnings',re)}
    ${sub('Total equity',equity)}
    <div class="balance ${assets===le?'ok':'bad'}">${assets===le?'\u2713':'\u26a0'} Assets ${fmt(assets)} = Liab + Equity ${fmt(le)}</div></div>`;

  const wc=[[dAR,'\u2212 Increase in receivables',-dAR],[dInv,'\u2212 Increase in inventory',-dInv],
    [dAP,'+ Increase in payables',dAP],[dWP,'+ Increase in wages payable',dWP],
    [dDR,'+ Increase in deferred revenue',dDR]].filter(x=>x[0]!==0).map(x=>row(x[1],x[2])).join('');
  const CFS=`<div class="acct-stmt"><h4>Cash flow statement</h4><div class="sub">Where cash actually moved</div>
    <div class="acct-sec">Operating</div>
    ${row('Net income',NI)}
    ${opt(s.dep,row('+ Depreciation (non-cash)',s.dep))}
    ${wc}
    ${sub('Cash from operations',cfo)}
    <div class="acct-sec">Investing</div>
    ${row('Buying long-term assets',cfi)}
    ${sub('Cash from investing',cfi)}
    <div class="acct-sec">Financing</div>
    ${row('Loans & owner capital, net',cff)}
    ${sub('Cash from financing',cff)}
    ${sub('Net change in cash',net)}
    <div class="balance ${net===s.cash?'ok':'bad'}">${net===s.cash?'\u2713':'\u26a0'} Ending cash ${fmt(net)} = Cash on balance sheet ${fmt(s.cash)}</div></div>`;

  const _sc=$('#acct-stmts'); _sc.innerHTML = IS+BS+CFS;
  if(ACCT_LOG.length!==acctPrevLen){ _sc.classList.remove('flash'); void _sc.offsetWidth; _sc.classList.add('flash'); acctPrevLen=ACCT_LOG.length; }
  $('#acct-note').innerHTML = acctLastNote;

  const cb=$('#acct-cash-callout');
  if(ACCT_LOG.length && (NI!==cfo)){
    cb.innerHTML='<b>Profit \u2260 cash.</b> Net income is '+fmt(NI)+', but operations generated '+fmt(cfo)+
      ' of cash. The gap is timing: accrual records revenue when <i>earned</i> and expenses when <i>incurred</i>, not when cash changes hands. Working capital (receivables, inventory, payables) and non-cash items like depreciation bridge the two.';
    cb.style.display='';
  } else cb.style.display='none';

  const jl=$('#acct-journal');
  if(!ACCT_LOG.length) jl.innerHTML='<span class="muted">No entries yet \u2014 post a transaction to see its double-entry here.</span>';
  else { jl.innerHTML=ACCT_LOG.map((id,i)=>{ const t=ATX.find(x=>x.id===id);
      const lines=t.je.map(e=>`<div class="je-l ${e[0]==='Dr'?'dr':''}"><span>${e[0]==='Cr'?'&nbsp;&nbsp;&nbsp;':''}${e[0]} ${esc(e[1])}</span><span>${fmt(e[2])}</span></div>`).join('');
      return `<div class="je"><div class="je-h">${i+1}. ${esc(t.label)}</div>${lines}</div>`; }).join('');
    jl.scrollTop=jl.scrollHeight; }
}

function renderAcct(){
  const el=$('#view-acct');
  el.innerHTML=`
  <div class="card">
    <span class="pill">Start here \u00b7 no experience needed</span>
    <h2 style="margin:10px 0 6px;font-family:Georgia,serif">Read financial statements from scratch</h2>
    <p class="muted" style="margin:0">Three short ideas, then a sandbox where you post real business transactions and watch the income statement, balance sheet and cash flow statement build themselves \u2014 line by line.</p>

    <h3 style="margin:22px 0 6px">1 \u00b7 The accounting equation</h3>
    <p>Everything balances around one identity. What a business <b>owns</b> equals what it <b>owes</b> plus the <b>owners\u2019 stake</b>.</p>
    <div class="acct-eq">
      <div class="box"><b>Assets</b><small>what you own</small></div><span class="op">=</span>
      <div class="box"><b>Liabilities</b><small>what you owe</small></div><span class="op">+</span>
      <div class="box"><b>Equity</b><small>owners\u2019 stake</small></div>
    </div>
    <p class="muted">Every transaction keeps this in balance. If it ever didn\u2019t, something was recorded wrong.</p>

    <h3 style="margin:22px 0 6px">2 \u00b7 Double-entry</h3>
    <p>Because the equation must stay balanced, <b>every transaction is recorded in at least two places</b>. One side is a <b>debit</b>, the other a <b>credit</b>, and the totals always match.</p>
    <table class="dc-table"><tr>
      <td><b>Increases with a debit</b><br><span class="muted">Assets, Expenses</span></td>
      <td><b>Increases with a credit</b><br><span class="muted">Liabilities, Equity, Revenue</span></td></tr></table>
    <p class="muted">No need to memorise it \u2014 in the sandbox you\u2019ll see both sides of each entry and that total debits = total credits every time.</p>

    <h3 style="margin:22px 0 6px">3 \u00b7 Accrual vs cash</h3>
    <p><b>Cash accounting</b> records money only when it moves. <b>Accrual accounting</b> \u2014 what real statements use \u2014 records <b>revenue when it is earned</b> and <b>expenses when they are incurred</b>, regardless of when cash arrives. That is why a company can be profitable yet short of cash.</p>
    <p class="muted">The clearest case is selling on credit: you earn the profit immediately, but the cash arrives later. Post exactly that below and watch net income rise while cash stays flat.</p>
  </div>

  <div class="card" style="margin-top:18px">
    <div class="row" style="justify-content:space-between;align-items:flex-start">
      <h3 style="margin:0">Build a business \u00b7 sandbox</h3>
      <div class="row"><button class="btn" id="acct-sample">Run a sample sequence</button>
        <button class="btn" id="acct-reset">Reset</button></div>
    </div>
    <p class="muted" style="margin:8px 0 0">Post an event on the left and watch the three statements on the right update. Each event explains what it did and why.</p>
    <div class="acct-note" id="acct-note"></div>
    <div class="acct-work">
      <div class="acct-events" id="acct-menu"></div>
      <div class="acct-stmts" id="acct-stmts"></div>
    </div>
    <div class="acct-note" id="acct-cash-callout" style="display:none;margin-top:14px"></div>
    <label class="fld" style="margin-top:16px">Journal \u2014 the double-entries you\u2019ve posted</label>
    <div class="acct-journal" id="acct-journal"></div>
  </div>

  <div class="card" style="margin-top:18px">
    <h3 style="margin:0 0 4px">How the three statements connect</h3>
    <ul class="muted" style="margin:8px 0 0;padding-left:18px;line-height:1.65">
      <li><b>Income statement</b> shows profit over a period. Its bottom line, <b>net income</b>, flows into <b>retained earnings</b> on the balance sheet.</li>
      <li><b>Balance sheet</b> is a snapshot: Assets = Liabilities + Equity, always.</li>
      <li><b>Cash flow statement</b> starts from net income, then adjusts for non-cash items and working-capital changes to explain the <b>actual cash</b>. Its ending cash equals the cash line on the balance sheet.</li>
    </ul>
  </div>

  <div class="card" style="margin-top:18px">
    <h3 style="margin:0 0 8px">Line-item glossary</h3>
    <p class="muted" style="margin:0 0 6px">Plain-English meaning of the line items you\u2019ll meet most often.</p>
    <details><summary>Income statement</summary><div class="body"><dl class="glo">
      <dt>Revenue (sales / turnover)</dt><dd>The value of goods or services delivered to customers in the period \u2014 earned, not necessarily yet collected in cash.</dd>
      <dt>Cost of goods sold (COGS)</dt><dd>The direct cost of the products sold, matched against the revenue they generated.</dd>
      <dt>Gross profit</dt><dd>Revenue minus COGS \u2014 what\u2019s left to cover everything else.</dd>
      <dt>SG&amp;A / operating expenses</dt><dd>Running-the-business costs (salaries, rent, marketing) that aren\u2019t direct product costs.</dd>
      <dt>Depreciation &amp; amortisation</dt><dd>Spreading the cost of long-lived assets over their useful life. A non-cash expense.</dd>
      <dt>EBIT / operating income</dt><dd>Profit from core operations, before interest and tax.</dd>
      <dt>Interest expense</dt><dd>The cost of borrowing money.</dd>
      <dt>Net income (the \u201cbottom line\u201d)</dt><dd>Profit after all expenses, interest and tax. Flows into retained earnings.</dd>
    </dl></div></details>
    <details><summary>Balance sheet</summary><div class="body"><dl class="glo">
      <dt>Cash &amp; equivalents</dt><dd>Money in the bank and near-cash holdings.</dd>
      <dt>Accounts receivable (AR)</dt><dd>Money customers owe you for sales already made on credit.</dd>
      <dt>Inventory</dt><dd>Goods bought or made but not yet sold. Becomes COGS when sold.</dd>
      <dt>Property, plant &amp; equipment (PP&amp;E), net</dt><dd>Long-lived physical assets, shown after subtracting accumulated depreciation.</dd>
      <dt>Goodwill &amp; intangibles</dt><dd>Value paid above the fair value of identifiable assets in an acquisition, plus non-physical assets like brands.</dd>
      <dt>Accounts payable (AP)</dt><dd>Money you owe suppliers for goods or services already received.</dd>
      <dt>Accrued liabilities</dt><dd>Expenses incurred but not yet paid (e.g. wages owed).</dd>
      <dt>Deferred revenue</dt><dd>Cash collected before you\u2019ve delivered \u2014 an obligation, not yet revenue.</dd>
      <dt>Debt</dt><dd>Borrowed money to be repaid, usually with interest.</dd>
      <dt>Common stock / paid-in capital</dt><dd>Money owners contributed in exchange for their shares.</dd>
      <dt>Retained earnings</dt><dd>Cumulative net income kept in the business rather than paid out as dividends.</dd>
    </dl></div></details>
    <details><summary>Cash flow statement</summary><div class="body"><dl class="glo">
      <dt>Cash from operations (CFO)</dt><dd>Cash generated by the core business. Starts from net income, adds back non-cash items, and adjusts for working-capital changes.</dd>
      <dt>Cash from investing (CFI)</dt><dd>Cash spent on or received from long-term assets \u2014 e.g. buying equipment or businesses.</dd>
      <dt>Cash from financing (CFF)</dt><dd>Cash from owners and lenders \u2014 issuing stock, borrowing, repaying debt, paying dividends.</dd>
      <dt>Working-capital change</dt><dd>The cash effect of receivables, inventory and payables moving. Building inventory or receivables uses cash; stretching payables frees cash.</dd>
      <dt>Free cash flow</dt><dd>A common derived measure: CFO minus capital expenditure \u2014 the cash truly available after maintaining the asset base.</dd>
    </dl></div></details>
  </div>`;

  const groups=[...new Set(ATX.map(t=>t.g))];
  $('#acct-menu').innerHTML=groups.map(g=>`<div class="atx-g">${esc(g)}</div><div class="atx-grid">${
    ATX.filter(t=>t.g===g).map(t=>`<button class="atx" data-id="${t.id}">${esc(t.label)}</button>`).join('')}</div>`).join('');
  $('#acct-menu').querySelectorAll('.atx').forEach(b=>b.onclick=()=>acctPost(b.dataset.id));
  $('#acct-sample').onclick=acctSample;
  $('#acct-reset').onclick=acctReset;
  acctRenderLab();
}

/* ---------- STORIES / behavioral ---------- */
let STORIES = LS.get('rba_stories', {answers:{}, stories:[]});
if(!STORIES.answers) STORIES.answers={};
if(!STORIES.stories) STORIES.stories=[];
function saveStories(){ LS.set('rba_stories', STORIES); }
const wordCount = s => (s&&s.trim()) ? s.trim().split(/\s+/).length : 0;
let _stSaveT=null;
function scheduleSaveStories(){
  const s=$('#st-status'); if(s) s.textContent='Saving\u2026';
  clearTimeout(_stSaveT);
  _stSaveT=setTimeout(()=>{ saveStories(); const s2=$('#st-status');
    if(s2){ s2.textContent='Saved \u2713'; setTimeout(()=>{ const s3=$('#st-status'); if(s3&&s3.textContent==='Saved \u2713') s3.innerHTML='&nbsp;'; },1500); } },400);
}
const PROMPTS=[
 {id:'tellme', q:'Walk me through your resume / tell me about yourself', tip:'A 60\u201390 second narrative: where you started, two or three pivots each with the \u201cwhy\u201d, landing on why you\u2019re here now. Forward-moving, not a list.'},
 {id:'whyfin', q:'Why finance / why this role?', tip:'Connect a genuine spark to concrete steps you took. Specific beats a generic \u201cI like markets\u201d.'},
 {id:'whype', q:'Why private equity (vs banking or other paths)?', tip:'Ownership mindset, operating value-creation, longer horizon, concentrated work. Show you understand the day-to-day.'},
 {id:'whyfirm', q:'Why our firm specifically?', tip:'Strategy, sectors, specific deals, people you\u2019ve spoken to. Two or three firm-specific reasons no one could copy-paste.'},
 {id:'deal', q:'Tell me about a deal or company you find interesting \u2014 would you invest?', tip:'Thesis in one line, then value drivers, key risks, and a clear yes/no with the swing factor. Have one ready to defend.'},
 {id:'strength', q:'Your greatest strength', tip:'One strength, evidence it\u2019s real, and why it matters for this role.'},
 {id:'weakness', q:'Your greatest weakness', tip:'A real one, plus the concrete system you use to manage it. Avoid \u201cI work too hard\u201d.'},
 {id:'lead', q:'A time you led or took initiative', tip:'STAR. Your specific actions and a quantified result.'},
 {id:'fail', q:'A time you failed or made a mistake', tip:'Own it cleanly; focus on the lesson and what you changed afterwards.'},
 {id:'conflict', q:'A time you handled conflict or a difficult teammate', tip:'Show maturity and a path to resolution, not blame.'},
 {id:'team', q:'A time you worked in a team under pressure', tip:'Your role, the stakes, and how you contributed to the outcome.'},
 {id:'accomp', q:'Your greatest accomplishment', tip:'Pick something that signals the exact traits this job needs.'},
 {id:'fiveyr', q:'Where do you see yourself in five years?', tip:'Show commitment to the path without sounding rigid or entitled.'},
 {id:'ask', q:'Questions you\u2019ll ask the interviewer', tip:'Two or three thoughtful, specific questions \u2014 strategy, the team, how they\u2019d describe success in the role.'},
];
const STORY_TAGS=['Leadership','Initiative','Teamwork','Conflict','Failure','Analytical','Deal / Investing'];

function renderStories(){
  const el=$('#view-stories');
  el.innerHTML=`
  <div class="card">
    <span class="pill">Behavioral &amp; fit</span>
    <h2 style="margin:10px 0 6px;font-family:Georgia,serif">Your story bank</h2>
    <p class="muted" style="margin:0">Draft and keep your answers to the common behavioral and fit questions, plus your own STAR stories. Everything saves automatically on this device, and is included when you take a full backup (Settings \u2192 Backup &amp; restore).</p>
    <div id="st-status" class="muted" style="font-size:12px;margin-top:8px">&nbsp;</div>
  </div>

  <div class="card" style="margin-top:18px">
    <h3 style="margin:0 0 4px">Core questions</h3>
    <p class="muted" style="font-size:13px;margin:0 0 6px">Write in your own voice. Tap <i>hint</i> to see what a strong answer covers.</p>
    <div id="st-prompts"></div>
  </div>

  <div class="card" style="margin-top:18px">
    <div class="row" style="justify-content:space-between;align-items:flex-start">
      <div><h3 style="margin:0 0 4px">My STAR stories</h3>
        <p class="muted" style="font-size:13px;margin:0">Reusable stories you can map to many questions \u2014 one good story often answers several prompts.</p></div>
      <button class="btn primary" id="st-add">+ Add story</button>
    </div>
    <div id="st-stories" style="margin-top:12px"></div>
  </div>`;
  renderPrompts(); renderStarStories();
  $('#st-add').onclick=()=>{ STORIES.stories.unshift({id:'s'+Date.now(),title:'',tags:[],s:'',t:'',a:'',r:''}); saveStories(); renderStarStories();
    const f=el.querySelector('.st-story input.st-title'); if(f) f.focus(); };
}
function renderPrompts(){
  const box=$('#st-prompts');
  box.innerHTML=PROMPTS.map(p=>{
    const val=STORIES.answers[p.id]||'';
    return `<div class="st-q">
      <div class="st-qh">${esc(p.q)}</div>
      <details class="st-tip"><summary>hint</summary><div class="muted" style="font-size:12.5px;padding:4px 0 6px">${esc(p.tip)}</div></details>
      <textarea class="st-ans" data-id="${p.id}" placeholder="Your answer\u2026">${esc(val)}</textarea>
      <div class="st-meta muted" data-wc="${p.id}">${wordCount(val)} words</div>
    </div>`;
  }).join('');
  box.querySelectorAll('.st-ans').forEach(ta=>ta.addEventListener('input',()=>{
    STORIES.answers[ta.dataset.id]=ta.value;
    const wc=box.querySelector('[data-wc="'+ta.dataset.id+'"]'); if(wc) wc.textContent=wordCount(ta.value)+' words';
    scheduleSaveStories();
  }));
}
function renderStarStories(){
  const box=$('#st-stories');
  if(!STORIES.stories.length){ box.innerHTML='<p class="muted" style="font-size:13px">No stories yet. Add one and fill in Situation, Task, Action, Result.</p>'; return; }
  box.innerHTML=STORIES.stories.map(st=>`
    <div class="st-story" data-id="${esc(st.id)}">
      <div class="row" style="justify-content:space-between;align-items:center;gap:8px">
        <input class="st-title" data-f="title" placeholder="Story title (e.g. Turned around a stalled project)" value="${esc(st.title||'')}">
        <button class="icon-btn st-del" title="Delete story">\u2715</button>
      </div>
      <div class="st-tags">${STORY_TAGS.map(tag=>`<button class="st-tag${(st.tags||[]).includes(tag)?' on':''}" data-tag="${esc(tag)}">${esc(tag)}</button>`).join('')}</div>
      <label class="fld">Situation</label><textarea class="st-f" data-f="s" placeholder="Context \u2014 where and when">${esc(st.s||'')}</textarea>
      <label class="fld">Task</label><textarea class="st-f" data-f="t" placeholder="What you were responsible for">${esc(st.t||'')}</textarea>
      <label class="fld">Action</label><textarea class="st-f" data-f="a" placeholder="What YOU specifically did">${esc(st.a||'')}</textarea>
      <label class="fld">Result</label><textarea class="st-f" data-f="r" placeholder="Outcome \u2014 quantify it if you can">${esc(st.r||'')}</textarea>
    </div>`).join('');
  box.querySelectorAll('.st-story').forEach(card=>{
    const id=card.dataset.id; const st=STORIES.stories.find(x=>x.id===id); if(!st) return;
    card.querySelector('.st-title').addEventListener('input',e=>{ st.title=e.target.value; scheduleSaveStories(); });
    card.querySelectorAll('textarea.st-f').forEach(ta=>ta.addEventListener('input',()=>{ st[ta.dataset.f]=ta.value; scheduleSaveStories(); }));
    card.querySelectorAll('.st-tag').forEach(b=>b.onclick=()=>{ st.tags=st.tags||[]; const tag=b.dataset.tag;
      const i=st.tags.indexOf(tag); if(i>=0)st.tags.splice(i,1); else st.tags.push(tag); b.classList.toggle('on'); scheduleSaveStories(); });
    card.querySelector('.st-del').onclick=()=>{ if(confirm('Delete this story?')){ STORIES.stories=STORIES.stories.filter(x=>x.id!==id); saveStories(); renderStarStories(); } };
  });
}

/* ---------- full backup / restore ---------- */
function gatherBackup(){
  const data={};
  for(let i=0;i<STORE.length;i++){ const k=STORE.key(i);
    if(k&&(k.indexOf('rba_')===0||k.indexOf('ibzy_')===0)){ const raw=STORE.getItem(k); try{ data[k]=JSON.parse(raw); }catch(e){ data[k]=raw; } } }
  return {app:'IBZY', version:1, exportedAt:new Date().toISOString(), data};
}
function backupJSON(){ return JSON.stringify(gatherBackup(),null,2); }
function downloadBackup(){
  const json=backupJSON();
  try{
    const blob=new Blob([json],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url;
    a.download='ibzy-backup-'+new Date().toISOString().slice(0,10)+'.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500); toast('Backup downloaded');
  }catch(e){ toast('Download blocked \u2014 use \u201cShow backup text\u201d to copy instead'); }
  return json;
}
function restoreBackup(json){
  let payload; try{ payload=JSON.parse(json); }catch(e){ toast('That isn\u2019t valid backup JSON'); return; }
  const data=(payload&&payload.data&&typeof payload.data==='object')?payload.data:payload;
  if(!data||typeof data!=='object'){ toast('No data found in that backup'); return; }
  const keys=Object.keys(data).filter(k=>k.indexOf('rba_')===0||k.indexOf('ibzy_')===0);
  if(!keys.length){ toast('No IBZY data found in that file'); return; }
  if(!confirm('Restore '+keys.length+' item(s)? This replaces the matching progress and saved stories.')) return;
  keys.forEach(k=>{ const v=data[k]; try{ STORE.setItem(k, typeof v==='string'?v:JSON.stringify(v)); }catch(e){} });
  toast('Restored \u2014 saving and reloading\u2026'); window.IBZY_ACCOUNT.flush().finally(()=>setTimeout(()=>location.reload(),300));
}

/* ---------- routing ---------- */
const views = ['acct','learn','browse','drill','quiz','labs','map','stories','dash','settings'];
function show(v){
  views.forEach(x=>{ const sec=$('#view-'+x); if(sec) sec.hidden = x!==v;
    const nb=document.querySelector(`nav button[data-view="${x}"]`); if(nb) nb.setAttribute('aria-selected', x===v); });
  const fn=({drill:renderDrill, quiz:renderQuiz, labs:renderLabs, learn:renderLearn, acct:renderAcct,
    browse:renderBrowse, dash:renderDash, map:renderMap, stories:renderStories, settings:renderSettings})[v];
  if(fn) fn();
}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>show(b.dataset.view));
$('#themeBtn').onclick=()=>{ SET.theme = SET.theme==='light'?'dark':'light';
  document.documentElement.dataset.theme=SET.theme; saveSet(); };

function updateDueBadge(){
  const due = BANK.filter(i=>inScope(i)&&isDue(i.id)&&drillReadOk(i)).length;
  const rd = BANK.filter(i=>READ[i.id]).length;
  $('#sub-due').textContent = rd+'/'+BANK.length+' cards read'+(due>0&&rd?` \u00b7 ${due} to drill`:'');
}

/* ---------- DRILL ---------- */
let queue=[], current=null, picked=null, revealed=false, drillConfigured=true;
function scopeTopics(cfg, all){
  if(!cfg||cfg.mode==='all') return all.slice();
  if(cfg.mode==='single') return (cfg.topics&&cfg.topics[0])?[cfg.topics[0]]:all.slice(0,1);
  if(cfg.mode==='selected'){ const s=(cfg.topics||[]).filter(t=>all.includes(t)); return s.length?s:all.slice(); }
  if(cfg.mode==='random') return (cfg.topics&&cfg.topics.length)?cfg.topics.filter(t=>all.includes(t)):all.slice();
  return all.slice();
}
function scopeLabel(cfg){
  if(!cfg||cfg.mode==='all') return 'All topics';
  if(cfg.mode==='single') return (cfg.topics&&cfg.topics[0])||'\u2014';
  if(cfg.mode==='selected') return 'Selected ('+((cfg.topics||[]).length)+')';
  if(cfg.mode==='random') return ((cfg.topics||[]).length)+' random topics';
  return 'All topics';
}
function drillUniverse(){ return [...new Set(BANK.map(i=>i.topic))]; }
const drillReadOk = i => !SET.drillReadOnly || !!READ[i.id];
function buildQueue(filterFn){
  const ok = new Set(scopeTopics(SET.drillScope, drillUniverse()));
  const base = BANK.filter(i=>ok.has(i.topic)).filter(drillReadOk).filter(filterFn||(()=>true));
  queue = interleave(base.filter(i=>isDue(i.id)));
}
function renderDrill(){
  const el=$('#view-drill');
  const U=drillUniverse();
  if(!drillConfigured){ el.innerHTML=drillSetupHTML(); bindDrillSetup(U); return; }
  if(!queue.length) buildQueue();
  if(!current) current = queue.shift();
  updateDueBadge();
  if(!current){
    const ok=new Set(scopeTopics(SET.drillScope,U));
    const total = BANK.filter(i=>ok.has(i.topic)).filter(drillReadOk).length;
    if(!total && SET.drillReadOnly){
      el.innerHTML=`<div class="card empty"><div style="font-size:40px">\ud83d\udcd6</div><h3>Nothing to drill yet</h3>
        <p class="muted">Drill only uses cards you\u2019ve marked as read, so it never gets ahead of you.<br>Read a lesson in <b>Learn</b> first \u2014 or switch this off in drill setup.</p>
        <div class="row" style="justify-content:center;gap:8px"><button class="btn primary" onclick="show('learn')">Go to Learn</button><button class="btn" id="dr-change3">Drill setup</button></div></div>`;
      $('#dr-change3').onclick=()=>{ drillConfigured=false; renderDrill(); };
      return;
    }
    el.innerHTML = `<div class="card empty">
      <div style="font-size:40px">✓</div>
      <h3>Nothing due in this scope</h3>
      <p class="muted">You've reviewed everything scheduled today for <b>${esc(scopeLabel(SET.drillScope))}</b>.<br>
      ${total} cards in scope.</p>
      <div class="row" style="justify-content:center;gap:8px">
        <button class="btn" onclick="cram()">Cram a random 20 anyway</button>
        <button class="btn" id="dr-change2">Change topics</button>
      </div>
    </div>`;
    $('#dr-change2').onclick=()=>{ drillConfigured=false; renderDrill(); };
    return;
  }
  picked=null; revealed=false;
  const c=current;
  el.innerHTML = `
   <div class="card">
     <div class="row" style="justify-content:space-between;align-items:center">
       <div class="row"><span class="pill">${esc(c.topic)}</span>
         <span class="pill sub">${esc(c.subtopic||'—')}</span></div>
       <div class="row" style="gap:10px;align-items:center"><span class="muted" style="font-size:12px">box ${srOf(c.id).box}/5 · ${queue.length} left</span><button class="icon-btn" id="dr-change" title="${esc(scopeTopics(SET.drillScope,U).join(', '))}">Topics: ${esc(scopeLabel(SET.drillScope))} ▾</button></div>
     </div>
     <div class="prompt">${esc(c.prompt)}</div>
     <p class="muted" style="font-size:12.5px;margin:2px 0 10px">Answer it in your own words first — then reveal.</p>
     <textarea id="att" placeholder="Type your answer (or say it out loud)…"></textarea>
     <div class="muted" style="font-size:12px;margin-top:10px">How confident are you?</div>
     <div class="conf" id="conf">
       ${[1,2,3,4,5].map(n=>`<button data-c="${n}">${n}</button>`).join('')}
       </div>
     <div class="row"><button class="btn primary" id="revealBtn">Reveal answer <span class="kbd">space</span></button></div>
     <div id="post"></div>
   </div>`;
  $('#conf').querySelectorAll('button').forEach(b=>b.onclick=()=>{
    picked=+b.dataset.c; $('#conf').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); });
  $('#revealBtn').onclick=reveal;
  $('#dr-change').onclick=()=>{ drillConfigured=false; renderDrill(); };
  $('#att').focus();
}
function drillSetupHTML(){
  return `<div class="card">
    <h3 style="margin-top:0">Drill setup</h3>
    <p class="muted" style="font-size:13.5px">Choose what to focus on. Drill uses spaced repetition within the topics you pick.</p>
    <label class="fld">Topic scope</label>
    <select id="dr-mode">
      <option value="all">All topics</option>
      <option value="random">Randomly picked topics</option>
      <option value="selected">Selected topics</option>
      <option value="single">A single topic</option>
    </select>
    <div id="dr-sub" style="margin-top:10px"></div>
    <label class="toggle" style="margin-top:12px"><input type="checkbox" id="dr-readonly" ${SET.drillReadOnly?'checked':''}> Only cards I\u2019ve marked as read</label>
    <div id="dr-due" class="muted" style="font-size:12.5px;margin-top:12px"></div>
    <div class="row" style="margin-top:14px">
      <button class="btn primary" id="dr-start">Start drilling</button>
      ${(queue.length||current)?'<button class="btn" id="dr-cancel">Cancel</button>':''}
    </div>
  </div>`;
}
function bindDrillSetup(U){
  const cfg=SET.drillScope||{mode:'all',topics:[]};
  const modeSel=$('#dr-mode'); modeSel.value=cfg.mode;
  const subBox=$('#dr-sub');
  function selectedTopics(){
    const m=modeSel.value;
    if(m==='all') return U.slice();
    if(m==='selected') return [...subBox.querySelectorAll('input:checked')].map(x=>x.value);
    if(m==='single'){ const s=$('#dr-single'); return [s?s.value:U[0]]; }
    return [];
  }
  function preview(){
    const m=modeSel.value;
    if(m==='random'){ $('#dr-due').textContent='A random selection is drawn when you start.'; return; }
    const ts=new Set(selectedTopics());
    if(!ts.size){ $('#dr-due').textContent='Pick at least one topic.'; return; }
    const inset=BANK.filter(i=>ts.has(i.topic)).filter(i=>!$('#dr-readonly').checked||READ[i.id]);
    const due=inset.filter(i=>isDue(i.id)).length;
    $('#dr-due').textContent=due+' due now · '+inset.length+' cards in scope ('+ts.size+' topic'+(ts.size>1?'s':'')+').';
  }
  function renderSub(){
    const m=modeSel.value;
    if(m==='all') subBox.innerHTML='<p class="muted" style="font-size:12.5px;margin:0">Every topic in the deck.</p>';
    else if(m==='random') subBox.innerHTML='<label class="fld">How many topics?</label><input type="number" id="dr-k" min="1" max="'+U.length+'" value="'+Math.min(cfg.k||3,U.length)+'"><p class="muted" style="font-size:12.5px;margin:6px 0 0">We\u2019ll pick that many topics at random when you start.</p>';
    else if(m==='selected') subBox.innerHTML='<div class="checks">'+U.map(t=>'<label><input type="checkbox" value="'+esc(t)+'" '+((cfg.mode==='selected'&&(cfg.topics||[]).includes(t))?'checked':'')+'> '+esc(t)+'</label>').join('')+'</div>';
    else subBox.innerHTML='<label class="fld">Topic</label><select id="dr-single">'+U.map(t=>'<option '+((cfg.mode==='single'&&cfg.topics&&cfg.topics[0]===t)?'selected':'')+'>'+esc(t)+'</option>').join('')+'</select>';
    preview();
  }
  modeSel.onchange=renderSub;
  subBox.addEventListener('change',preview);
  subBox.addEventListener('input',preview);
  renderSub();
  $('#dr-readonly').onchange=()=>{ SET.drillReadOnly=$('#dr-readonly').checked; saveSet(); preview(); };
  $('#dr-start').onclick=()=>{
    const m=modeSel.value; let topics=[], k=null;
    if(m==='single'){ topics=[$('#dr-single').value]; }
    else if(m==='selected'){ topics=selectedTopics(); if(!topics.length){ toast('Pick at least one topic'); return; } }
    else if(m==='random'){ k=Math.max(1,Math.min(+$('#dr-k').value||3,U.length)); topics=shuffle(U.slice()).slice(0,k); }
    SET.drillScope = m==='all'?{mode:'all',topics:[]} : m==='random'?{mode:'random',topics,k} : {mode:m,topics};
    saveSet(); drillConfigured=true; queue=[]; current=null; renderDrill();
    if(m==='random') toast('Drilling: '+topics.join(', '));
  };
  const cancel=$('#dr-cancel'); if(cancel) cancel.onclick=()=>{ drillConfigured=true; renderDrill(); };
}
function reveal(){
  if(revealed) return; revealed=true;
  const c=current;
  $('#revealBtn').disabled=true;
  $('#post').innerHTML = `
    <div class="answer">
      <h4>Model answer</h4>
      <div>${c.answer||'<p class="muted">No answer stored.</p>'}</div>
      <div class="grade">
        <button class="again" data-g="1">Again<small>got it wrong</small></button>
        <button data-g="2">Hard<small>shaky</small></button>
        <button class="good" data-g="3">Good<small>solid</small></button>
        <button class="easy" data-g="4">Easy<small>nailed it</small></button>
      </div>
      <p class="muted" style="font-size:11.5px;margin-top:8px">Grade yourself honestly: <span class="kbd">1</span>–<span class="kbd">4</span></p>
    </div>`;
  $('#post').querySelectorAll('.grade button').forEach(b=>b.onclick=()=>grade(+b.dataset.g));
}
function grade(g){
  const c=current;
  REVIEWS.push({id:c.id, ts:Date.now(), grade:g, conf:picked||0}); saveReviews();
  applyGrade(c.id, g);
  if(g===1) queue.push(c);                 // lapsed card returns later this session
  current = queue.shift() || null;
  renderDrill();
}
function cram(){ const ok=new Set(scopeTopics(SET.drillScope,drillUniverse())); buildQueue();
  if(!queue.length){ queue = interleave(BANK.filter(i=>ok.has(i.topic)).filter(drillReadOk)).slice(0,20);} 
  current=queue.shift(); renderDrill(); }
window.cram=cram;

document.addEventListener('keydown',e=>{
  if($('#view-drill').hidden) return;
  if(e.target.tagName==='TEXTAREA' && e.key!=='Escape') {
    if(e.key===' ' && (e.ctrlKey||e.metaKey)){ e.preventDefault(); reveal(); }
    return;
  }
  if(e.key===' '){ e.preventDefault(); if(!revealed) reveal(); }
  else if(revealed && ['1','2','3','4'].includes(e.key)){ grade(+e.key); }
  else if(!revealed && ['1','2','3','4','5'].includes(e.key)){
    const b=$('#conf')?.querySelector(`[data-c="${e.key}"]`); if(b) b.click(); }
});

window.drillTopic=(t)=>{ SET.drillScope={mode:'single',topics:[t]}; saveSet(); drillConfigured=true;
  buildQueue(i=>i.topic===t);
  if(!queue.length){ queue=interleave(BANK.filter(i=>i.topic===t).filter(drillReadOk)).slice(0,30); }
  current=queue.shift(); show('drill'); };
window.drillSub=(t,s)=>{ if(!SET.inScope.includes(t)){ SET.inScope.push(t); saveSet(); }
  SET.drillScope={mode:'single',topics:[t]}; saveSet(); drillConfigured=true;
  buildQueue(i=>i.topic===t && (!s||i.subtopic===s));
  if(!queue.length){ queue=interleave(BANK.filter(i=>i.topic===t && (!s||i.subtopic===s))).slice(0,30); }
  current=queue.shift(); show('drill'); };

/* ---------- DASHBOARD ---------- */
function renderDash(){
  const el=$('#view-dash');
  const scope=BANK.filter(inScope);
  const due=scope.filter(i=>isDue(i.id)&&drillReadOk(i)).length;
  const mastered=scope.filter(i=>srOf(i.id).box>=4).length;
  const seen=scope.filter(i=>srOf(i.id).seen).length;
  // streak
  const days=[...new Set(REVIEWS.map(r=>{const d=new Date(r.ts);d.setHours(0,0,0,0);return d.getTime();}))].sort((a,b)=>b-a);
  let streak=0, cur=startOfToday();
  for(const d of days){ if(d===cur||d===cur-DAY){ streak++; cur=d-DAY; } else if(d<cur-DAY) break; }
  // calibration: confidence(1-5)->expected; grade>=3 == correct
  const cal=REVIEWS.filter(r=>r.conf>0);
  const expected = cal.length? cal.reduce((a,r)=>a+(r.conf-1)/4,0)/cal.length : 0;
  const actual   = cal.length? cal.filter(r=>r.grade>=3).length/cal.length : 0;
  const gap = (expected-actual)*100;
  // per-topic mastery: Leitner box progress from Drill; box 1 (new/unseen) counts as 0
  const topics=[...new Set(scope.map(i=>i.topic))];
  const mast = topics.map(t=>{ const ti=scope.filter(i=>i.topic===t);
    const avg=ti.reduce((a,i)=>a+(srOf(i.id).box-1),0)/ti.length; return {t, pct:Math.round(avg/4*100)}; })
    .sort((a,b)=>a.pct-b.pct);
  // weakest subtopics by accuracy (min 3 reviews)
  const bySub={};
  REVIEWS.forEach(r=>{ const it=BANK.find(i=>i.id===r.id); if(!it||!inScope(it))return;
    const k=it.topic+' · '+(it.subtopic||'—'); (bySub[k]=bySub[k]||[]).push(r.grade>=3?1:0); });
  const weak=Object.entries(bySub).filter(([,v])=>v.length>=3)
    .map(([k,v])=>({k,acc:Math.round(v.reduce((a,b)=>a+b,0)/v.length*100),n:v.length}))
    .sort((a,b)=>a.acc-b.acc).slice(0,3);

  const allL=LESSONS, cardsN=allL.reduce((x,L)=>x+L.cards.length,0), readN=allL.reduce((x,L)=>x+lessonStat(L).r,0);
  const passedN=allL.filter(L=>lessonStat(L).passed).length, notesN=Object.keys(NOTES).length;
  el.innerHTML = `
    <div class="card">
      <h3 style="margin:0 0 2px">Learning</h3>
      <p class="muted" style="font-size:12.5px;margin:0 0 12px">Cards count once you tick <b>Mark as read</b>; a bubble fills in as you read and turns solid when you pass its quiz.</p>
      <div class="grid3">
        <div class="stat flat"><div class="n">${readN}<small>/${cardsN}</small></div><div class="l">cards read</div><div class="bar"><i style="width:${cardsN?Math.round(readN/cardsN*100):0}%"></i></div></div>
        <div class="stat flat"><div class="n">${passedN}<small>/${allL.length}</small></div><div class="l">lesson quizzes passed</div><div class="bar"><i style="width:${allL.length?Math.round(passedN/allL.length*100):0}%"></i></div></div>
        <div class="stat flat"><div class="n">${notesN}</div><div class="l">cards with notes</div></div>
      </div>
      ${TRACKS.filter(T=>LESSONS.some(L=>L.track===T)).map(T=>`<div style="margin-top:16px"><a href="#" class="dash-track" data-t="${T.id}"><b>${esc(T.title)}</b></a>
        ${T.units.filter(U=>U.lessons&&U.lessons.length).map(U=>`<div class="dash-unit"><span class="muted">${esc(U.title)}</span>${bubbleRow(U,true)}</div>`).join('')}</div>`).join('')}
      <div style="margin-top:14px;font-size:12.5px" class="muted">Primer checks: ${PRIMERS.map(p=>{ const st=primerStatus(p.id); return `<span class="pchip ${st}" title="${esc(p.title)}">${esc(p.title.split(' ')[0].replace(/&$/,''))}${st==='done'?' \u2713':''}</span>`; }).join(' ')}</div>
    </div>
    <h3 style="margin:22px 2px 10px">Drill &amp; quiz</h3>
    <div class="grid2">
      <div class="stat"><div class="n">${due}</div><div class="l">due today</div></div>
      <div class="stat"><div class="n">${streak}🔥</div><div class="l">day streak</div></div>
      <div class="stat"><div class="n">${seen}/${scope.length}</div><div class="l">cards started (in scope)</div></div>
      <div class="stat"><div class="n">${mastered}</div><div class="l">mastered (box 4–5)</div></div>
    </div>

    <div class="card" style="margin-top:16px">
      <h4 style="margin:0 0 6px">Calibration</h4>
      ${cal.length<5 ? `<p class="muted">Grade ~5 cards with a confidence rating to see your calibration.</p>` :
      `<p class="muted" style="font-size:13px">You predicted you'd know <b>${Math.round(expected*100)}%</b>;
        you actually got <b>${Math.round(actual*100)}%</b> right
        — <b style="color:${Math.abs(gap)<8?'var(--good)':'var(--warn)'}">
        ${Math.abs(gap)<8?'well calibrated':(gap>0?'overconfident by '+Math.round(gap)+' pts':'underconfident by '+Math.round(-gap)+' pts')}</b>.</p>
       <div class="bar"><i style="width:${Math.round(actual*100)}%"></i></div>`}
    </div>

    <div class="card" style="margin-top:16px">
      <h4 style="margin:0 0 4px">Mastery by topic</h4>
      <p class="muted" style="font-size:12px;margin:0 0 10px">From flashcard Drill (Leitner box). New cards count as 0% — primers track separately in Learn.</p>
      <div class="mlist">${mast.map(m=>`<div>
        <span class="name">${esc(m.t)}</span>
        <span class="bar"><i style="width:${m.pct}%"></i></span>
        <span class="pct">${m.pct}%</span></div>`).join('')}</div>
    </div>

    <div class="card" style="margin-top:16px">
      <h4 style="margin:0 0 4px">Quiz accuracy heatmap</h4>
      <p class="muted" style="font-size:12px;margin:0 0 10px">Correct % by topic and level, from every quiz attempt. Red cells are where the next hour pays off.</p>
      ${(()=>{ if(!QLOG.length) return '<p class="muted">Take a quiz to populate this.</p>';
        const agg={}; QLOG.forEach(r=>{ const k=r.t+'|'+r.d; (agg[k]=agg[k]||[0,0]); agg[k][1]++; if(r.ok) agg[k][0]++; });
        const cell=(t,d)=>{ const a=agg[t+'|'+d]; if(!a) return '<td class="c hm-x">\u2014</td>';
          const p=Math.round(a[0]/a[1]*100), cls=p>=80?'hm-g':p>=60?'hm-m':'hm-b';
          return `<td class="c ${cls}" title="${a[0]}/${a[1]} correct">${p}%<div class="hm-n">${a[1]} tried</div></td>`; };
        const rows=[...new Set(MCQS.map(mUnit))].map(t=>{
          let ok=0,n=0; ['F','C','A'].forEach(d=>{ const a=agg[t+'|'+d]; if(a){ ok+=a[0]; n+=a[1]; } });
          return {t, n, acc: n? ok/n : 2}; })
          .sort((a,b)=>a.acc-b.acc);
        return '<table class="hm"><tr><th style="text-align:left">Topic</th><th>Foundational</th><th>Core</th><th>Advanced</th></tr>'+
          rows.map(r=>`<tr><td class="tn">${esc(r.t)}</td>${cell(r.t,'F')}${cell(r.t,'C')}${cell(r.t,'A')}</tr>`).join('')+'</table>';
      })()}
    </div>

    <div class="card" style="margin-top:16px">
      <h4 style="margin:0 0 8px">Weakest areas</h4>
      ${weak.length? weak.map(w=>`<div class="row" style="justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line)">
          <span>${esc(w.k)}</span><span class="muted">${w.acc}% over ${w.n}</span></div>`).join('')
        : `<p class="muted">Not enough review history yet — keep drilling.</p>`}
    </div>`;
  el.querySelectorAll('.dash-track').forEach(a=>a.onclick=e=>{ e.preventDefault(); openTrack(a.dataset.t); });
}

/* ---------- SETTINGS ---------- */
function renderSettings(){
  const el=$('#view-settings');
  const acc=window.IBZY_ACCOUNT, u=acc.user;
  const topics=[...new Set(BANK.map(i=>i.topic))];
  el.innerHTML=`<div class="card">
    <h3 style="margin-top:0">Account</h3>
    ${u?`<p style="margin:0 0 4px">Signed in as <b>${esc(u.email)}</b>${u.name?' · '+esc(u.name):''}</p>
      <p class="muted" style="font-size:13px;margin:0 0 12px">Your read ticks, notes, quiz scores, drill history and stories save to your account and sync to any device you sign in on.</p>
      <div class="row"><button class="btn" id="acc-pw">Change password</button><button class="btn" id="acc-out">Sign out</button></div>`
     :`<p style="margin:0 0 4px">You’re using IBZY as a <b>guest</b>.</p>
      <p class="muted" style="font-size:13px;margin:0 0 12px">Progress is saved in this browser only. Create an account to sync it across devices — what you’ve done as a guest on this device is copied into the new account the first time you sign in.</p>
      <div class="row"><button class="btn primary" id="acc-in">Sign in / create account</button></div>`}
  </div>
  <div class="card" style="margin-top:16px">
    <h3 style="margin-top:0">In-scope topics</h3>
    <p class="muted" style="font-size:13px">Checked topics are counted on the Progress tab’s drill stats. Drill has its own topic picker.</p>
    <div class="checks">${topics.map(t=>`<label><input type="checkbox" value="${esc(t)}"
       ${SET.inScope.includes(t)?'checked':''}> ${esc(t)}
       <span class="muted" style="margin-left:auto">${BANK.filter(i=>i.topic===t).length}</span></label>`).join('')}</div>
  </div>
  <div class="card" style="margin-top:16px">
    <h3 style="margin-top:0">Backup &amp; restore</h3>
    <p class="muted" style="font-size:13px">Downloads <b>all</b> your data — read ticks, notes, lesson scores, drill and quiz history, settings and stories — as one file. You can also restore a backup from the old single-file IBZY here.</p>
    <div class="row">
      <button class="btn primary" id="bk-download">⬇ Download full backup</button>
      <button class="btn" id="bk-show">Show backup text</button>
    </div>
    <textarea id="bk-text" readonly hidden style="margin-top:10px;min-height:120px;font-family:var(--font);font-size:11px"></textarea>
    <h4 style="margin:16px 0 6px">Restore</h4>
    <div class="row">
      <button class="btn" id="bk-file-btn">Restore from file</button>
      <input type="file" id="bk-file" accept=".json,application/json" hidden>
    </div>
    <textarea id="bk-paste" placeholder="… or paste backup text here, then tap Restore" style="margin-top:10px;min-height:90px;font-family:var(--font);font-size:11px"></textarea>
    <div class="row"><button class="btn" id="bk-restore-text">Restore from pasted text</button></div>
    <p class="muted" style="font-size:12px;margin-top:10px">Restoring <b>replaces</b> the matching data${u?' in your account':' on this device'}. The file is plain text and includes your notes and story answers — keep it private.</p>
  </div>
  <div class="card" style="margin-top:16px">
    <h3 style="margin-top:0">About</h3>
    <p class="muted" style="font-size:12.5px;margin-top:6px">${esc(licLine())}. Card questions follow the order of the Wall Street Prep <i>Red Book</i> (1st edition); each card shows the page so you can check the original. Answers are study notes written for this app.</p>
  </div>
  <div class="card" style="margin-top:16px">
    <h3 style="margin-top:0">Reset</h3>
    <div class="row">
      <button class="btn" id="resetSR">Reset drill &amp; quiz history</button>
      <button class="btn" id="resetAll" style="border-color:var(--bad);color:var(--bad)">Reset everything</button>
    </div>
    <p class="muted" style="font-size:12.5px;margin-top:10px">“Reset everything” also clears read ticks, notes, lesson scores and settings. Stories are kept.</p>
  </div>`;
  el.querySelectorAll('.checks input').forEach(c=>c.onchange=()=>{
    SET.inScope = [...el.querySelectorAll('.checks input:checked')].map(x=>x.value);
    saveSet(); updateDueBadge(); });
  if(u){ $('#acc-out').onclick=()=>acc.signOut(); $('#acc-pw').onclick=()=>acc.setNewPassword(); }
  else $('#acc-in').onclick=()=>acc.leaveGuest();
  $('#bk-download').onclick=downloadBackup;
  $('#bk-show').onclick=()=>{ const t=$('#bk-text'); t.value=backupJSON(); t.hidden=!t.hidden; if(!t.hidden){ t.focus(); t.select(); } };
  $('#bk-file-btn').onclick=()=>$('#bk-file').click();
  $('#bk-file').onchange=e=>{ const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=()=>restoreBackup(r.result); r.readAsText(f); };
  $('#bk-restore-text').onclick=()=>{ const v=$('#bk-paste').value.trim(); if(!v){ toast('Paste backup text first'); return; } restoreBackup(v); };
  $('#resetSR').onclick=()=>{ if(confirm('Wipe drill scheduling, review history and quiz history?')){
    SR={}; REVIEWS=[]; saveSR(); saveReviews(); ['rba_mcq_log','rba_mcq_sr','rba_quiz'].forEach(k=>STORE.removeItem(k));
    queue=[];current=null; toast('History reset'); setTimeout(()=>location.reload(),600); } };
  $('#resetAll').onclick=()=>{ if(confirm('Erase ALL progress — read ticks, notes, lesson scores, drill and quiz history, primer checks and settings? Stories are kept.')){
    ['rba_items','rba_leitner','rba_reviews','rba_settings','rba_quiz','rba_primer_prog','rba_mcq_log','rba_mcq_sr',
     'ibzy_read','ibzy_notes','ibzy_lessons','ibzy_lq','ibzy_last'].forEach(k=>STORE.removeItem(k));
    window.IBZY_ACCOUNT.flush().finally(()=>location.reload()); } };
}

/* ===================================================================
   QUIZ  — curated multiple-choice bank with scoring + explanations
   =================================================================== */
const MCQS = window.IBZY_MCQS;
const mUnit = m => m.u || m.t;      // quiz "topic" = the Red Book unit

/* ===== MCQ smart review: attempt log + Leitner-style rotation for misses ===== */
const QLOG_KEY='rba_mcq_log', QSR_KEY='rba_mcq_sr';
let QLOG=LS.get(QLOG_KEY,[]);           // [{id,t,d,ok,ts,mode}]
let QSR =LS.get(QSR_KEY,{});            // id -> {box:1..4, due:ms}; box>4 graduates out
const QBOXD=[0,1,3,7];                  // days to next due per box
function qid(m){ let h=5381; const s=m.t+'|'+m.q;
  for(let i=0;i<s.length;i++){ h=((h<<5)+h+s.charCodeAt(i))|0; } return 'q'+(h>>>0).toString(36); }
function logAttempt(m,ok,mode){
  QLOG.push({id:qid(m),t:mUnit(m),d:m.d,ok:ok?1:0,ts:Date.now(),mode});
  if(QLOG.length>3000) QLOG=QLOG.slice(-2500);
  try{ LS.set(QLOG_KEY,QLOG); }catch(e){}
  const id=qid(m), cur=QSR[id];
  if(!ok){ QSR[id]={box:1,due:Date.now()}; }
  else if(cur){ const nb=cur.box+1;
    if(nb>4) delete QSR[id];
    else QSR[id]={box:nb,due:Date.now()+QBOXD[nb-1]*86400000}; }
  try{ LS.set(QSR_KEY,QSR); }catch(e){}
}
function reviewDue(){ const now=Date.now();
  const ids=new Set(Object.keys(QSR).filter(id=>QSR[id].due<=now));
  return ids.size? MCQS.map((m,i)=>({...m,_i:i})).filter(m=>ids.has(qid(m))) : []; }

/* quiz timer */
let qzTick=null;
function stopTick(){ if(qzTick){ clearInterval(qzTick); qzTick=null; } const t=$('#qz-timer'); if(t) t.hidden=true; }

/* keyboard shortcuts: 1–4 answer, Enter next (quiz tab only, not while typing) */
document.addEventListener('keydown',e=>{
  if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const qv=document.getElementById('view-quiz'); if(!qv || qv.hidden || !quizState) return;
  if(e.key>='1' && e.key<='4'){
    const b=qv.querySelector('.qz-opt[data-i="'+(+e.key-1)+'"]');
    if(b && !b.disabled){ b.click(); e.preventDefault(); }
  } else if(e.key==='Enter'){
    const nx=document.getElementById('qz-next');
    if(nx && !nx.hidden){ nextQuiz(); e.preventDefault(); }
  }
});

/* credits */
function licLine(){ return 'IBZY \u00b7 interview-prep study app \u00b7 \u00a9 '+new Date().getFullYear(); }
function renderFooter(){ const f=document.getElementById('app-footer'); if(f) f.textContent=licLine(); }

const PRIMERS = window.IBZY_PRIMERS;
let quizState=null;
function equalizeOpts(sel){
  const opts=[...document.querySelectorAll(sel+' .qz-opt')]; if(!opts.length) return;
  opts.forEach(b=>{ b.style.minHeight=''; });
  requestAnimationFrame(()=>{ let h=0; opts.forEach(b=>{ h=Math.max(h,b.offsetHeight); });
    opts.forEach(b=>{ b.style.minHeight=h+'px'; }); });
}
const QZ_KEY='rba_quiz';
function saveQuiz(){ try{ if(quizState && quizState.idx<quizState.pool.length) LS.set(QZ_KEY, quizState); else LS.set(QZ_KEY, null); }catch(e){} }
function renderQuiz(){
  const el=$('#view-quiz');
  if(!quizState){
    const topics=[...new Set(MCQS.filter(m=>m.l||m.u).map(mUnit))];
    const saved=LS.get(QZ_KEY,null);
    const hasSaved = saved && saved.pool && saved.idx<saved.pool.length;
    const resumeHTML = hasSaved ? `<div class="card" style="border-color:var(--accent)">
        <h3 style="margin-top:0">Resume in-progress quiz</h3>
        <p class="muted" style="font-size:13px">${esc(saved.topic||'All topics')}${saved.levelLabel&&saved.levelLabel!=='All levels'?' \u00b7 '+esc(saved.levelLabel):''} \u00b7 question ${saved.idx+1} of ${saved.pool.length} \u00b7 score ${saved.score}</p>
        <div class="row"><button class="btn primary" id="qz-resume">Resume \u2192</button><button class="btn" id="qz-discard">Discard</button></div>
      </div>` : '';
    const due=reviewDue(); const tracked=Object.keys(QSR).length;
    const reviewHTML=`<div class="card"${due.length?' style="border-color:var(--accent)"':''}>
        <h3 style="margin-top:0">Smart review</h3>
        <p class="muted" style="font-size:13px">Questions you miss come back on a spacing schedule (1, 3, then 7 days). Answer one correctly four times spaced out and it graduates.
        ${tracked?` <b>${tracked}</b> in rotation \u00b7 <b>${due.length}</b> due now.`:' Miss a question in any quiz to start the rotation.'}</p>
        <div class="row"><button class="btn ${due.length?'primary':''}" id="qz-review" ${due.length?'':'disabled'}>Review ${due.length||''} due \u2192</button></div>
      </div>`;
    el.innerHTML=resumeHTML+reviewHTML+`<div class="card" style="margin-top:16px">
      <h3 style="margin-top:0">Multiple-choice quiz</h3>
      <p class="muted" style="font-size:13.5px">${MCQS.length} questions, tagged to the Learn lessons. Pick lessons or whole units; new to a topic? Set the level to <b>Foundational</b>. Options reshuffle on every attempt.</p>
      <label class="fld">Topics</label>
      <select id="qz-mode">
        <option value="lessons">Pick lessons</option>
        <option value="all">All units</option>
        <option value="random">Randomly picked units</option>
        <option value="selected">Selected units</option>
        <option value="single">A single topic</option>
      </select>
      <div id="qz-sub" style="margin-top:8px"></div>
      <label class="toggle" style="margin-top:12px"><input type="checkbox" id="qz-unlocked" ${SET.qzUnlockedOnly?'checked':''}> Only lessons I\u2019ve unlocked (all cards read)</label>
      <label class="fld">Level</label>
      <select id="qz-level"><option value="">All levels</option><option value="F">Foundational \u2014 start here</option><option value="C">Core</option><option value="A">Advanced</option></select>
      <label class="fld">How many?</label>
      <select id="qz-n"><option>10</option><option>20</option><option>50</option><option value="999">All</option></select>
      <label class="fld">Timer per question</label>
      <select id="qz-timer-set"><option value="0">Off</option><option value="30">30 seconds</option><option value="60">60 seconds</option><option value="90">90 seconds</option></select>
      <div class="row" style="margin-top:14px"><button class="btn primary" id="qz-start">Start quiz</button></div>
    </div>`;
    if(hasSaved){
      $('#qz-resume').onclick=()=>{ quizState=saved; renderQuiz(); };
      $('#qz-discard').onclick=()=>{ LS.set(QZ_KEY,null); renderQuiz(); };
    }
    const qzSub=$('#qz-sub'), qzMode=$('#qz-mode');
    function qzRenderSub(){
      const m=qzMode.value;
      if(m==='lessons'){ qzSub.innerHTML=TRACKS.filter(T=>LESSONS.some(L=>L.track===T)).map(T=>T.units.filter(U=>U.lessons&&U.lessons.length).map(U=>
          `<div class="qz-unit"><div class="row" style="justify-content:space-between"><b style="font-size:13px">${esc(T.title)} \u00b7 ${esc(U.title)}</b><a href="#" class="qz-all" style="font-size:12px">select all</a></div>
          <div class="checks">${U.lessons.map(L=>{ const st=lessonStat(L);
            return `<label class="${st.unlocked?'':'locked'}"><input type="checkbox" value="${L.id}"> ${L.n}. ${esc(L.title)}<span class="muted" style="margin-left:auto;font-size:11px">${st.passed?'\u2713':st.unlocked?'':'\ud83d\udd12'}</span></label>`; }).join('')}</div></div>`).join('')).join('');
        qzSub.querySelectorAll('.qz-all').forEach(a=>a.onclick=e=>{ e.preventDefault(); const boxes=a.closest('.qz-unit').querySelectorAll('input'); const on=[...boxes].some(b=>!b.checked); boxes.forEach(b=>b.checked=on); });
      }
      else if(m==='all') qzSub.innerHTML='<p class="muted" style="font-size:12.5px;margin:0">Every unit with quiz questions.</p>';
      else if(m==='random') qzSub.innerHTML='<label class="fld">How many topics?</label><input type="number" id="qz-k" min="1" max="'+topics.length+'" value="3"><p class="muted" style="font-size:12.5px;margin:6px 0 0">A random set is drawn when you start.</p>';
      else if(m==='selected') qzSub.innerHTML='<div class="checks">'+topics.map(t=>'<label><input type="checkbox" value="'+esc(t)+'"> '+esc(t)+'</label>').join('')+'</div>';
      else qzSub.innerHTML='<label class="fld">Unit</label><select id="qz-single">'+topics.map(t=>'<option>'+esc(t)+'</option>').join('')+'</select>';
    }
    qzMode.onchange=qzRenderSub; qzRenderSub();
    $('#qz-timer-set').value=String(SET.qzTimer||0);
    $('#qz-timer-set').onchange=()=>{ SET.qzTimer=+$('#qz-timer-set').value||0; saveSet(); };
    $('#qz-review').onclick=()=>{
      let pool=shuffle(reviewDue()).map(shuffleOpts);
      if(!pool.length){ toast('Nothing due right now'); return; }
      quizState={pool,idx:0,score:0,answered:false,picked:null,log:[],topic:'Smart review',
        level:'',levelLabel:'All levels',n:pool.length,review:true,timer:SET.qzTimer||0};
      saveQuiz(); renderQuiz();
    };
    $('#qz-start').onclick=()=>{
      const m=qzMode.value, n=+$('#qz-n').value, lv=$('#qz-level').value;
      SET.qzTimer=+$('#qz-timer-set').value||0; saveSet();
      const lvLabel={'':'All levels',F:'Foundational',C:'Core',A:'Advanced'}[lv];
      let allow=null, tLabel='All units', lessonSet=null;
      const unlockedOnly=$('#qz-unlocked').checked; SET.qzUnlockedOnly=unlockedOnly; saveSet();
      if(m==='lessons'){ const sel=[...qzSub.querySelectorAll('input:checked')].map(x=>x.value);
        if(!sel.length){ toast('Tick at least one lesson'); return; } lessonSet=new Set(sel); tLabel=sel.length+' lesson'+(sel.length>1?'s':''); }
      if(m==='single'){ const t=$('#qz-single').value; allow=new Set([t]); tLabel=t; }
      else if(m==='selected'){ const sel=[...qzSub.querySelectorAll('input:checked')].map(x=>x.value);
        if(!sel.length){ toast('Pick at least one topic'); return; } allow=new Set(sel); tLabel='Selected ('+sel.length+')'; }
      else if(m==='random'){ const k=Math.max(1,Math.min(+$('#qz-k').value||3,topics.length));
        const pick=shuffle(topics.slice()).slice(0,k); allow=new Set(pick); tLabel=k+' random topics'; }
      const unlockedIds=new Set(LESSONS.filter(L=>lessonStat(L).unlocked).map(L=>L.id));
      let pool=MCQS.map((mm,i)=>({...mm,_i:i})).filter(mm=>(!allow||allow.has(mUnit(mm)))&&(!lessonSet||lessonSet.has(mm.l))&&(!lv||mm.d===lv)
        &&(!unlockedOnly||unlockedIds.has(mm.l)));
      shuffle(pool); pool=pool.slice(0,n).map(shuffleOpts);
      if(!pool.length){ toast(unlockedOnly&&!unlockedIds.size?'Unlock a lesson first (mark all its cards as read), or untick \u201conly lessons I\u2019ve unlocked\u201d':'No questions match that filter'); return; }
      quizState={pool,idx:0,score:0,answered:false,picked:null,log:[],topic:tLabel,level:lv,levelLabel:lvLabel,n,timer:SET.qzTimer||0};
      saveQuiz(); renderQuiz();
      if(m==='random') toast('Quiz topics: '+[...allow].join(', '));
    };
    return;
  }
  const qs=quizState;
  if(qs.idx>=qs.pool.length){
    stopTick();
    LS.set(QZ_KEY,null);
    const dueNow=reviewDue().length;
    const pct=Math.round(qs.score/qs.pool.length*100);
    el.innerHTML=`<div class="card">
      <h3 style="margin-top:0">Score: ${qs.score}/${qs.pool.length} (${pct}%)</h3>
      <div class="bar" style="margin:10px 0 16px"><i style="width:${pct}%"></i></div>
      ${qs.log.filter(l=>!l.correct).length?`<h4>Review your misses</h4>`+qs.log.filter(l=>!l.correct).map(l=>
        `<div style="padding:8px 0;border-bottom:1px solid var(--line)">
          <div style="font-weight:600">${esc(l.q)}</div>
          <div class="muted" style="font-size:13px;margin-top:3px">Correct: ${esc(l.right)}</div>
          <div style="font-size:13px;margin-top:3px">${esc(l.e)}</div></div>`).join('')
        :`<p class="muted">Clean sweep \u2014 no misses.</p>`}
      <p class="muted" style="font-size:12.5px;margin-top:12px">${qs.log.filter(l=>!l.correct).length?'Misses have been added to Smart review and will resurface on a spacing schedule.':''} ${dueNow?`<b>${dueNow}</b> question${dueNow>1?'s':''} due for review now.`:''}</p>
      <div class="row" style="margin-top:16px"><button class="btn primary" onclick="restartQuiz()">New quiz</button></div>
    </div>`;
    return;
  }
  const m=qs.pool[qs.idx];
  stopTick();
  el.innerHTML=`<div class="card">
    <div class="row" style="justify-content:space-between;align-items:center">
      <span class="row" style="gap:6px;align-items:center"><span class="pill">${esc(m.t)}</span><span class="pill lvl-${m.d}">${({F:'Foundational',C:'Core',A:'Advanced'})[m.d]||''}</span>${qs.review?'<span class="pill sub">review</span>':''}</span>
      <span class="row" style="gap:10px;align-items:center"><span id="qz-timer" hidden></span><span class="muted" style="font-size:12px">Q${qs.idx+1} / ${qs.pool.length} \u00b7 score ${qs.score}</span><button class="icon-btn" onclick="saveExitQuiz()">save &amp; exit</button></span>
    </div>
    <div class="prompt" style="font-size:19px">${esc(m.q)}</div>
    <div id="qz-opts">
      ${m.o.map((opt,i)=>`<button class="qz-opt" data-i="${i}">${esc(opt)}</button>`).join('')}
    </div>
    <div id="qz-fb"></div>
    <div class="row" id="qz-next" style="margin-top:14px;justify-content:space-between;align-items:center" hidden>
      <button class="btn primary" onclick="nextQuiz()">Next \u2192</button>
      <span class="muted" style="font-size:11px"><span class="kbd">1</span>\u2013<span class="kbd">4</span> answer \u00b7 <span class="kbd">Enter</span> next</span></div>
  </div>`;
  function finishQ(correct,timedOut){
    stopTick();
    el.querySelectorAll('.qz-opt').forEach((x,i)=>{
      x.disabled=true;
      if(i===m.a) x.classList.add('correct');
      else if(!timedOut && i===qs.picked) x.classList.add('wrong');
    });
    $('#qz-fb').innerHTML=`<div class="answer"><h4>${timedOut?'Time\u2019s up':(correct?'Correct':'Not quite')}</h4><p>${esc(m.e)}</p></div>`;
    logAttempt(m,correct,qs.review?'review':'quiz');
    qs.log.push({q:m.q,correct,right:m.o[m.a],e:m.e});
    saveQuiz();
    $('#qz-next').hidden=false;
  }
  el.querySelectorAll('.qz-opt').forEach(b=>b.onclick=()=>{
    if(qs.answered) return; qs.answered=true; qs.picked=+b.dataset.i;
    const correct=qs.picked===m.a; if(correct) qs.score++;
    finishQ(correct,false);
  });
  if(qs.timer>0 && !qs.answered){
    let left=qs.timer; const tEl=$('#qz-timer'); tEl.hidden=false; tEl.textContent=left+'s';
    qzTick=setInterval(()=>{
      if($('#view-quiz').hidden){ stopTick(); return; }
      left--; if(left<=10) tEl.classList.add('low');
      tEl.textContent=Math.max(left,0)+'s';
      if(left<=0){ qs.answered=true; qs.picked=null; finishQ(false,true); }
    },1000);
  }
  equalizeOpts('#qz-opts');
}
window.nextQuiz=()=>{ quizState.idx++; quizState.answered=false; quizState.picked=null; saveQuiz(); renderQuiz(); };
window.restartQuiz=()=>{ quizState=null; LS.set(QZ_KEY,null); renderQuiz(); };
window.saveExitQuiz=()=>{ saveQuiz(); quizState=null; renderQuiz(); toast('Saved \u2014 resume anytime from the Quiz tab'); };

/* ===================================================================
   LABS — interactive engines: 3-statement linkage + paper LBO + accretion
   =================================================================== */
const fmt=(n)=>{ const s=n<0?'\u2212':''; const v=Math.abs(n);
  return s+'$'+v.toLocaleString(undefined,{maximumFractionDigits:1}); };
const pctf=(n)=>(n>=0?'+':'\u2212')+Math.abs(n*100).toFixed(1)+'%';

function renderLabs(){
  const el=$('#view-labs');
  el.innerHTML=`
    <div class="row" id="lab-tabs" style="gap:6px;margin-bottom:14px">
      <button class="btn lab-tab" data-l="link">3-statement linkage</button>
      <button class="btn lab-tab" data-l="lbo">Paper LBO</button>
      <button class="btn lab-tab" data-l="acc">Accretion / dilution</button>
    </div>
    <div id="lab-body"></div>`;
  el.querySelectorAll('.lab-tab').forEach(b=>b.onclick=()=>{
    el.querySelectorAll('.lab-tab').forEach(x=>x.classList.toggle('primary',x===b));
    ({link:labLink,lbo:labLBO,acc:labAcc})[b.dataset.l]();
  });
  el.querySelector('.lab-tab').click();   // default
}

/* ---- 3-statement linkage ---- */
const LINK_SCENARIOS = {
  dep:{label:'Depreciation +$X (pre-tax)', f:(x,t)=>({
    is:[['Operating income (EBIT)',-x],['Pre-tax income',-x],['Taxes ('+(t*100)+'%)', x*t],['Net income',-x*(1-t)]],
    cfs:[['Net income',-x*(1-t)],['(+) Add back D&A (non-cash)', x],['Cash from operations', x*t]],
    bs:[['Cash', x*t],['PP&E (accum. dep.)',-x],['\u2014','sep'],['Retained earnings',-x*(1-t)]],
    why:'Depreciation is a non-cash expense. It lowers net income by X\u00d7(1\u2212t), but you add the full X back on the CFS, so cash actually rises by the tax saving X\u00d7t. On the BS, PP&E falls by X and equity falls by X\u00d7(1\u2212t) \u2014 the gap is the cash tax shield.'})},
  accr:{label:'Accrue an expense of $X (not yet paid)', f:(x,t)=>({
    is:[['Operating expense', -x],['Pre-tax income',-x],['Taxes', x*t],['Net income',-x*(1-t)]],
    cfs:[['Net income',-x*(1-t)],['(+) Increase in accrued liabilities', x],['Cash from operations', x*t]],
    bs:[['Cash', x*t],['\u2014','sep'],['Accrued liabilities', x],['Retained earnings',-x*(1-t)]],
    why:'The expense hits the IS (NI down X\u00d7(1\u2212t)), but no cash leaves yet \u2014 the obligation sits in accrued liabilities. The increase in that liability is a source of cash, so CFO nets to +X\u00d7t (the tax effect). BS balances: assets +X\u00d7t; liabilities +X and equity \u2212X\u00d7(1\u2212t).'})},
  inv:{label:'Buy $X of inventory with cash', f:(x,t)=>({
    is:[['No income-statement impact (not yet sold)', 0]],
    cfs:[['Increase in inventory (use of cash)', -x],['Cash from operations', -x]],
    bs:[['Cash', -x],['Inventory', x]],
    why:'Inventory is capitalised, so nothing hits the IS until it is sold as COGS. It is simply an asset swap: cash \u2212X, inventory +X. The balance sheet stays balanced with no change to equity.'})},
  capex:{label:'Capex: buy $X of PP&E with cash', f:(x,t)=>({
    is:[['No immediate income-statement impact', 0]],
    cfs:[['Capital expenditure (investing)', -x],['Net change in cash', -x]],
    bs:[['Cash', -x],['PP&E', x]],
    why:'Capex is capitalised, not expensed \u2014 it flows through investing on the CFS, not the IS. Asset swap: cash \u2212X, PP&E +X. (Depreciation expenses it over time later.)'})},
  debt:{label:'Raise $X of new debt', f:(x,t)=>({
    is:[['No immediate income-statement impact', 0]],
    cfs:[['Debt issuance (financing)', x],['Net change in cash', x]],
    bs:[['Cash', x],['\u2014','sep'],['Debt', x]],
    why:'Borrowing is a financing inflow. Cash +X and debt +X. No equity effect on day one (interest expense comes in future periods).'})},
  sbc:{label:'Stock-based compensation of $X', f:(x,t)=>({
    is:[['SBC expense', -x],['Pre-tax income',-x],['Taxes', x*t],['Net income',-x*(1-t)]],
    cfs:[['Net income',-x*(1-t)],['(+) Add back SBC (non-cash)', x],['Cash from operations', x*t]],
    bs:[['Cash', x*t],['\u2014','sep'],['APIC (equity)', x],['Retained earnings',-x*(1-t)]],
    why:'SBC is a real expense but non-cash, so it is added back on the CFS (cash +X\u00d7t from the tax shield). On the BS, retained earnings fall by X\u00d7(1\u2212t) while APIC rises by X \u2014 net equity change of +X\u00d7t matches the cash change.'})},
  defrev:{label:'Collect $X cash for service not yet delivered', f:(x,t)=>({
    is:[['No revenue recognised yet', 0]],
    cfs:[['Increase in deferred revenue', x],['Cash from operations', x]],
    bs:[['Cash', x],['\u2014','sep'],['Deferred revenue (liability)', x]],
    why:'Cash is in hand but unearned, so it cannot be booked as revenue. It is parked as a deferred-revenue liability. Cash +X, liability +X \u2014 recognised as revenue only when the service is delivered.'})},
  ppedebt:{label:'Buy $X of PP&E funded with new debt', f:(x,t)=>({
    is:[['No immediate income-statement impact', 0]],
    cfs:[['Capital expenditure (investing)', -x],['Debt issuance (financing)', x],['Net change in cash', 0]],
    bs:[['PP&E', x],['\u2014','sep'],['Debt', x]],
    why:'You buy the asset but fund it with borrowing rather than cash, so the asset and the liability both rise by X and cash is unchanged. Nothing hits the income statement on day one \u2014 depreciation and interest only appear in later periods. Assets +X, liabilities +X: the balance sheet still balances.'})},
  sellppe:{label:'Sell PP&E (book value $X) for $1.2X cash \u2014 before the debt is repaid', f:(x,t)=>({
    is:[['Gain on sale of PP&E (pre-tax)', 0.2*x],['Pre-tax income', 0.2*x],['Taxes ('+(t*100)+'%)', -0.2*x*t],['Net income', 0.2*x*(1-t)]],
    cfs:[['Net income', 0.2*x*(1-t)],['(\u2212) Remove gain (it is an investing item)', -0.2*x],['Cash from operations', -0.2*x*t],['(+) Proceeds from PP&E sale (investing)', 1.2*x],['Net change in cash', 1.2*x-0.2*x*t]],
    bs:[['Cash', 1.2*x-0.2*x*t],['PP&E (book value removed)', -x],['\u2014','sep'],['Debt (still outstanding)', 0],['Retained earnings', 0.2*x*(1-t)]],
    why:'You sell PP&E with a book value of $X for $1.2X cash, realising a $0.2X gain that is taxed, so net income rises by 0.2X\u00d7(1\u2212t). On the CFS you back the gain out of operations (the whole sale is an investing event) and show the full $1.2X proceeds under investing. PP&E falls by its $X book value; the debt originally used to buy it is untouched. Assets and equity both rise by 0.2X\u00d7(1\u2212t) \u2014 the after-tax gain \u2014 so it balances.'})},
};
function labLink(){
  const sel=Object.entries(LINK_SCENARIOS).map(([k,v])=>`<option value="${k}">${esc(v.label.replace('$X','$X'))}</option>`).join('');
  $('#lab-body').innerHTML=`<div class="card">
    <h3 style="margin-top:0">Three-statement linkage</h3>
    <p class="muted" style="font-size:13px">Pick a transaction and watch it ripple through all three statements. The point is the <b>connections</b> \u2014 the thing flashcards can\u2019t teach.</p>
    <div class="grid2" style="margin-top:6px">
      <div><label class="fld">Scenario</label><select id="lk-sc">${sel}</select></div>
      <div><label class="fld">Amount $X</label><input type="text" id="lk-amt" value="100"></div>
    </div>
    <label class="fld">Tax rate</label>
    <input type="range" id="lk-tax" min="0" max="50" value="25" style="width:100%">
    <div class="muted" style="font-size:12px" id="lk-taxl">25%</div>
    <div id="lk-out" style="margin-top:14px"></div>
    <div class="row" style="margin-top:10px"><button class="btn" id="lk-why">Show the walk-through</button></div>
    <div id="lk-whybox"></div>
  </div>`;
  const draw=()=>{
    const k=$('#lk-sc').value, x=Math.max(0,+$('#lk-amt').value||0), t=(+$('#lk-tax').value)/100;
    $('#lk-taxl').textContent=Math.round(t*100)+'%';
    const r=LINK_SCENARIOS[k].f(x,t);
    const tbl=(title,rows)=>`<div class="stmt"><h4>${title}</h4>${rows.map(([l,v])=>
        v==='sep'?`<div class="stmt-sep"></div>`:
        `<div class="stmt-row"><span>${esc(l)}</span><span class="${v>0?'pos':v<0?'neg':'zero'}">${v===0?'\u2014':fmt(v)}</span></div>`).join('')}</div>`;
    // balance check
    const sumBS=r.bs.filter(x=>x[1]!=='sep').reduce((a,[l,v])=>a+ (/(liab|debt|payable|deferred|APIC|earnings|equity)/i.test(l)? -v : v),0);
    $('#lk-out').innerHTML=tbl('Income statement',r.is)+tbl('Cash flow statement',r.cfs)+tbl('Balance sheet',r.bs)+
      `<div class="balance ${Math.abs(sumBS)<0.01?'ok':'bad'}">${Math.abs(sumBS)<0.01?'\u2713 Balance sheet balances (Assets = Liabilities + Equity)':'\u26a0 Imbalance: '+fmt(sumBS)}</div>`;
    $('#lk-whybox').innerHTML='';
    $('#lk-why').onclick=()=>{ $('#lk-whybox').innerHTML=`<div class="answer"><h4>Why</h4><p>${esc(r.why)}</p></div>`; };
  };
  $('#lk-sc').onchange=draw; $('#lk-amt').oninput=draw; $('#lk-tax').oninput=draw; draw();
}

/* ---- Paper LBO ---- */
function computeLBO(p){
  const entryEV=p.ebitda*p.entryMult;
  let debt=entryEV*p.debtPct, equity0=entryEV-debt;
  const rows=[]; let cash=0, ebitda=p.ebitda;
  for(let y=1;y<=p.years;y++){
    ebitda=ebitda*(1+p.growth);
    const interest=debt*p.rate;
    const tax=Math.max(0,(ebitda-interest))*p.tax;
    const fcf=(ebitda-interest)-tax;          // simple paper-LBO FCF (no capex / NWC)
    const paydown=Math.min(debt,Math.max(0,fcf));
    const excess=Math.max(0,fcf-paydown);
    debt-=paydown; cash+=excess;
    rows.push({y,ebitda,interest,tax,fcf,debt,cash});
  }
  const exitEV=ebitda*p.exitMult;
  const exitEq=exitEV-debt+cash;
  const moic=exitEq/equity0;
  const irr=Math.pow(moic,1/p.years)-1;
  return {entryEV,debt0:entryEV*p.debtPct,equity0,rows,exitEV,exitDebt:debt,exitCash:cash,exitEq,moic,irr};
}
function randLBO(){ return {ebitda:[60,80,100,120,150][Math.random()*5|0],
  entryMult:[7,8,9,10,11][Math.random()*5|0], debtPct:[0.5,0.55,0.6,0.65][Math.random()*4|0],
  years:[3,4,5][Math.random()*3|0], growth:[0.04,0.06,0.08,0.10][Math.random()*4|0],
  exitMultSame:true, rate:0.09, tax:0.25}; }
let lboCase=null;
let lboMode='basic';
function labLBO(){
  $('#lab-body').innerHTML=`
    <div class="row" id="lbo-modes" style="gap:6px;margin-bottom:12px;flex-wrap:wrap">
      <button class="btn lbo-mode" data-m="basic">Basic</button>
      <button class="btn lbo-mode" data-m="su">Sources &amp; Uses</button>
      <button class="btn lbo-mode" data-m="ppa">Purchase price allocation</button>
    </div>
    <div id="lbo-inner"></div>`;
  const paint=()=>{ $('#lab-body').querySelectorAll('.lbo-mode').forEach(x=>x.classList.toggle('primary',x.dataset.m===lboMode));
    ({basic:lboBasic,su:lboSU,ppa:lboPPA})[lboMode](); };
  $('#lab-body').querySelectorAll('.lbo-mode').forEach(b=>b.onclick=()=>{ lboMode=b.dataset.m; paint(); });
  paint();
}
function lboBasic(){
  if(!lboCase){ const r=randLBO(); lboCase={...r, exitMult:r.entryMult}; }
  const p=lboCase, res=computeLBO(p);
  $('#lbo-inner').innerHTML=`<div class="card">
    <h3 style="margin-top:0">Paper LBO</h3>
    <p class="muted" style="font-size:13px">Standard interview simplifications: 100% cash-flow sweep, no capex / working-capital change, exit at the entry multiple. Estimate the return, then check the full build.</p>
    <div class="casebox">
      <b>The case.</b> You buy a business doing <b>${fmt(p.ebitda)}</b> EBITDA at <b>${p.entryMult.toFixed(1)}x</b>,
      funded <b>${Math.round(p.debtPct*100)}%</b> with debt at <b>${Math.round(p.rate*100)}%</b> interest (${Math.round(p.tax*100)}% tax).
      EBITDA grows <b>${Math.round(p.growth*100)}%</b>/yr. You exit after <b>${p.years} years</b> at the same multiple.
      <div class="row" style="margin-top:8px">
        <span>MOIC \u2248 <input type="text" id="lb-moic" style="width:70px;display:inline-block" placeholder="2.1x"></span>
        <span>IRR \u2248 <input type="text" id="lb-irr" style="width:70px;display:inline-block" placeholder="18%"></span>
        <button class="btn primary" id="lb-check">Check</button>
        <button class="btn" id="lb-new">New case</button>
      </div>
      <div id="lb-verdict" style="margin-top:8px"></div>
    </div>
    <div id="lb-soln"></div>
  </div>`;
  $('#lb-new').onclick=()=>{ const r=randLBO(); lboCase={...r,exitMult:r.entryMult}; labLBO(); };
  $('#lb-check').onclick=()=>{
    const gm=parseFloat($('#lb-moic').value), gi=parseFloat($('#lb-irr').value);
    const okM=isFinite(gm)&&Math.abs(gm-res.moic)<=0.2;
    const okI=isFinite(gi)&&Math.abs(gi-res.irr*100)<=2;
    $('#lb-verdict').innerHTML=`<span class="${okM?'pos':'neg'}">MOIC ${okM?'\u2713':'\u2717'} (actual ${res.moic.toFixed(2)}x)</span>
      &nbsp;&nbsp;<span class="${okI?'pos':'neg'}">IRR ${okI?'\u2713':'\u2717'} (actual ${(res.irr*100).toFixed(1)}%)</span>`;
    const r=res;
    $('#lb-soln').innerHTML=`<div class="answer"><h4>Worked solution</h4>
      <div class="stmt-row"><span>Entry EV (${fmt(p.ebitda)} \u00d7 ${p.entryMult.toFixed(1)}x)</span><span>${fmt(r.entryEV)}</span></div>
      <div class="stmt-row"><span>(\u2212) Debt (${Math.round(p.debtPct*100)}%)</span><span>${fmt(r.debt0)}</span></div>
      <div class="stmt-row"><span><b>Entry equity</b></span><span><b>${fmt(r.equity0)}</b></span></div>
      <table style="margin-top:10px"><tr><td>Yr</td><td>EBITDA</td><td>Interest</td><td>Tax</td><td>FCF\u2192debt</td><td>Debt</td></tr>
      ${r.rows.map(x=>`<tr><td>${x.y}</td><td>${fmt(x.ebitda)}</td><td>${fmt(x.interest)}</td><td>${fmt(x.tax)}</td><td>${fmt(x.fcf)}</td><td>${fmt(x.debt)}</td></tr>`).join('')}</table>
      <div class="stmt-row" style="margin-top:10px"><span>Exit EV (${fmt(r.rows[r.rows.length-1].ebitda)} \u00d7 ${p.exitMult.toFixed(1)}x)</span><span>${fmt(r.exitEV)}</span></div>
      <div class="stmt-row"><span>(\u2212) Remaining debt (+ cash ${fmt(r.exitCash)})</span><span>${fmt(r.exitDebt)}</span></div>
      <div class="stmt-row"><span><b>Exit equity</b></span><span><b>${fmt(r.exitEq)}</b></span></div>
      <div class="stmt-row"><span><b>MOIC</b></span><span><b>${r.moic.toFixed(2)}x</b></span></div>
      <div class="stmt-row"><span><b>IRR</b> = MOIC^(1/${p.years}) \u2212 1</span><span><b>${(r.irr*100).toFixed(1)}%</b></span></div>
      <p class="muted" style="font-size:12px;margin-top:8px">Return here comes from EBITDA growth + paying down debt with cash flow \u2014 the multiple is flat by assumption.</p>
    </div>`;
  };
}

/* ---- LBO: Sources & Uses tier ---- */
let suCase=null;
function randSU(){ const E=[80,100,120,150][Math.random()*4|0];
  return {E, entry:[8,9,10,11][Math.random()*4|0], levTurns:5, existDebtTurns:1,
    txnFeePct:0.02, finFeePct:0.03, minCashTurns:0.25, rolloverPct:0.10}; }
function suCompute(c){
  const EV=c.E*c.entry, existingDebt=c.E*c.existDebtTurns, equityPurchase=EV-existingDebt;
  const txnFees=EV*c.txnFeePct, newDebt=c.E*c.levTurns, finFees=newDebt*c.finFeePct, cashToBS=c.E*c.minCashTurns;
  const rollover=equityPurchase*c.rolloverPct;
  const totalUses=equityPurchase+existingDebt+txnFees+finFees+cashToBS;
  const sponsorEquity=totalUses-newDebt-rollover, totalSources=newDebt+rollover+sponsorEquity;
  return {EV,existingDebt,equityPurchase,txnFees,newDebt,finFees,cashToBS,rollover,totalUses,sponsorEquity,totalSources};
}
function lboSU(){
  if(!suCase) suCase=randSU();
  const c=suCase, r=suCompute(c);
  const row=(l,v,b)=>`<div class="stmt-row"><span>${b?'<b>':''}${esc(l)}${b?'</b>':''}</span><span>${b?'<b>':''}${fmt(v)}${b?'</b>':''}</span></div>`;
  $('#lbo-inner').innerHTML=`<div class="card">
    <h3 style="margin-top:0">Sources &amp; uses</h3>
    <p class="muted" style="font-size:13px">Every dollar that funds the deal (<b>sources</b>) must equal every dollar it pays for (<b>uses</b>). The sponsor\u2019s equity cheque is the <b>plug</b> that makes the two sides tie.</p>
    <div class="casebox">
      <b>The case.</b> You acquire a business at <b>${fmt(c.E)}</b> EBITDA \u00d7 <b>${c.entry.toFixed(1)}x</b> = <b>${fmt(r.EV)}</b> enterprise value.
      It carries <b>${fmt(r.existingDebt)}</b> of existing debt to refinance. New debt is raised at <b>${c.levTurns.toFixed(1)}x</b> EBITDA;
      management rolls <b>${Math.round(c.rolloverPct*100)}%</b> of the equity purchase; transaction fees <b>${Math.round(c.txnFeePct*100)}%</b> of EV,
      financing fees <b>${Math.round(c.finFeePct*100)}%</b> of new debt, and <b>${fmt(r.cashToBS)}</b> of minimum cash goes to the balance sheet.
      <div class="row" style="margin-top:8px">
        <span>Sponsor equity (the plug) \u2248 <input type="text" id="su-eq" style="width:90px;display:inline-block" placeholder="$"></span>
        <button class="btn primary" id="su-check">Check</button>
        <button class="btn" id="su-new">New case</button>
      </div>
      <div id="su-verdict" style="margin-top:8px"></div>
    </div>
    <div id="su-soln"></div>
  </div>`;
  $('#su-new').onclick=()=>{ suCase=randSU(); lboSU(); };
  $('#su-check').onclick=()=>{
    const g=parseFloat(($('#su-eq').value||'').replace(/[$,\s]/g,''));
    const ok=isFinite(g)&&Math.abs(g-r.sponsorEquity)<=Math.max(2,r.sponsorEquity*0.03);
    $('#su-verdict').innerHTML=`<span class="${ok?'pos':'neg'}">${ok?'\u2713 Right':'\u2717'} \u2014 sponsor equity = ${fmt(r.sponsorEquity)}</span>`;
    $('#su-soln').innerHTML=`<div class="answer"><h4>Worked solution</h4>
      <div class="grid2">
        <div class="stmt"><h4>Uses</h4>
          ${row('Purchase target equity',r.equityPurchase)}
          ${row('Refinance existing debt',r.existingDebt)}
          ${row('Transaction fees',r.txnFees)}
          ${row('Financing fees',r.finFees)}
          ${row('Cash to balance sheet',r.cashToBS)}
          <div class="stmt-sep"></div>${row('Total uses',r.totalUses,1)}</div>
        <div class="stmt"><h4>Sources</h4>
          ${row('New debt ('+c.levTurns.toFixed(1)+'x EBITDA)',r.newDebt)}
          ${row('Rollover equity',r.rollover)}
          ${row('Sponsor equity (plug)',r.sponsorEquity)}
          <div class="stmt-sep"></div>${row('Total sources',r.totalSources,1)}</div>
      </div>
      <div class="balance ${Math.abs(r.totalSources-r.totalUses)<0.01?'ok':'bad'}">${Math.abs(r.totalSources-r.totalUses)<0.01?'\u2713 Sources = Uses':'\u26a0 Mismatch'}</div>
      <p class="muted" style="font-size:12px;margin-top:8px">The sponsor equity is solved last: total uses \u2212 new debt \u2212 rollover. Fees and minimum cash are real uses that the equity cheque has to cover \u2014 a common thing candidates forget.</p>
    </div>`;
  };
}

/* ---- LBO: Purchase price allocation tier ---- */
let ppaCase=null;
function randPPA(){ const eq=[600,800,1000,750][Math.random()*4|0];
  return {eq, book:Math.round(eq*0.4), ppeWU:Math.round(eq*0.10), intWU:Math.round(eq*0.06), tax:0.25}; }
function ppaCompute(c){ const writeup=c.ppeWU+c.intWU, dtl=writeup*c.tax, goodwill=c.eq-c.book-writeup+dtl;
  return {writeup,dtl,goodwill}; }
function lboPPA(){
  if(!ppaCase) ppaCase=randPPA();
  const c=ppaCase, r=ppaCompute(c);
  const row=(l,v,b)=>`<div class="stmt-row"><span>${b?'<b>':''}${esc(l)}${b?'</b>':''}</span><span>${b?'<b>':''}${fmt(v)}${b?'</b>':''}</span></div>`;
  $('#lbo-inner').innerHTML=`<div class="card">
    <h3 style="margin-top:0">Purchase price allocation</h3>
    <p class="muted" style="font-size:13px">In a buyout you write the target\u2019s assets up to fair value, book a deferred tax liability on those write-ups, and <b>goodwill</b> is the residual that balances the entry.</p>
    <div class="casebox">
      <b>The case.</b> You pay <b>${fmt(c.eq)}</b> for the equity of a target whose net identifiable assets are <b>${fmt(c.book)}</b> at book.
      You write PP&E up by <b>${fmt(c.ppeWU)}</b> and identify <b>${fmt(c.intWU)}</b> of intangibles. Tax rate <b>${Math.round(c.tax*100)}%</b>.
      <div class="row" style="margin-top:8px">
        <span>Goodwill created \u2248 <input type="text" id="pp-gw" style="width:90px;display:inline-block" placeholder="$"></span>
        <button class="btn primary" id="pp-check">Check</button>
        <button class="btn" id="pp-new">New case</button>
      </div>
      <div id="pp-verdict" style="margin-top:8px"></div>
    </div>
    <div id="pp-soln"></div>
  </div>`;
  $('#pp-new').onclick=()=>{ ppaCase=randPPA(); lboPPA(); };
  $('#pp-check').onclick=()=>{
    const g=parseFloat(($('#pp-gw').value||'').replace(/[$,\s]/g,''));
    const ok=isFinite(g)&&Math.abs(g-r.goodwill)<=Math.max(2,r.goodwill*0.03);
    $('#pp-verdict').innerHTML=`<span class="${ok?'pos':'neg'}">${ok?'\u2713 Right':'\u2717'} \u2014 goodwill = ${fmt(r.goodwill)}</span>`;
    $('#pp-soln').innerHTML=`<div class="answer"><h4>Worked solution</h4>
      <div class="stmt">
        ${row('Equity purchase price',c.eq)}
        ${row('(\u2212) Net identifiable assets at book',-c.book)}
        ${row('(\u2212) Asset write-ups (PP&E + intangibles)',-r.writeup)}
        ${row('(+) New deferred tax liability ('+Math.round(c.tax*100)+'% \u00d7 write-up)',r.dtl)}
        <div class="stmt-sep"></div>${row('Goodwill (residual)',r.goodwill,1)}
      </div>
      <p class="muted" style="font-size:12px;margin-top:8px">Why the DTL <i>increases</i> goodwill: the write-ups are recognised for book but not for tax, so future book depreciation exceeds tax depreciation \u2014 a deferred tax liability. That extra liability needs an offsetting asset, and goodwill is the plug, so it rises by the DTL. No DTL is booked on goodwill itself (to avoid a circular gross-up).</p>
    </div>`;
  };
}

/* ---- Accretion / Dilution ---- */
function computeAcc(p){
  const acqEPS=p.acqNI/p.acqShares;
  const acqPrice=acqEPS*p.acqPE;
  const targetVal=p.tgtNI*p.tgtPE;
  const offer=targetVal*(1+p.premium);
  const cashPort=offer*p.cashPct, stockPort=offer*(1-p.cashPct);
  const newShares=stockPort/acqPrice;
  const afterTaxIntr=cashPort*p.rate*(1-p.tax);   // cost of cash/debt used
  const synergiesAT=p.synergies*(1-p.tax);
  const combNI=p.acqNI+p.tgtNI+synergiesAT-afterTaxIntr;
  const combShares=p.acqShares+newShares;
  const combEPS=combNI/combShares;
  const accr=combEPS/acqEPS-1;
  return {acqEPS,acqPrice,targetVal,offer,cashPort,stockPort,newShares,afterTaxIntr,synergiesAT,combNI,combShares,combEPS,accr};
}
function randAcc(){ return {acqNI:[400,500,600][Math.random()*3|0], acqShares:[100,120,150][Math.random()*3|0],
  acqPE:[14,16,18,20][Math.random()*4|0], tgtNI:[80,100,120][Math.random()*3|0], tgtPE:[12,14,16][Math.random()*3|0],
  premium:[0.25,0.3,0.35][Math.random()*3|0], cashPct:[0,0.5,1][Math.random()*3|0], rate:0.06, tax:0.25, synergies:[0,20,40][Math.random()*3|0]}; }
let accCase=null;
function labAcc(){
  if(!accCase) accCase=randAcc();
  const p=accCase, r=computeAcc(p);
  $('#lab-body').innerHTML=`<div class="card">
    <h3 style="margin-top:0">Accretion / dilution</h3>
    <p class="muted" style="font-size:13px">Will this deal raise or lower the acquirer\u2019s EPS? Call it, then reveal the build.</p>
    <div class="casebox">
      <b>The case.</b> Acquirer: net income <b>${fmt(p.acqNI)}</b>, <b>${p.acqShares}</b> shares, <b>${p.acqPE}x</b> P/E.
      Target: net income <b>${fmt(p.tgtNI)}</b> at a <b>${p.tgtPE}x</b> P/E. Offer is a <b>${Math.round(p.premium*100)}%</b> premium,
      funded <b>${Math.round(p.cashPct*100)}% cash</b> (at ${Math.round(p.rate*100)}% pre-tax) / <b>${Math.round((1-p.cashPct)*100)}% stock</b>.
      Synergies <b>${fmt(p.synergies)}</b> pre-tax, tax ${Math.round(p.tax*100)}%.
      <div class="row" style="margin-top:8px">
        <button class="btn" id="ac-a">Accretive</button>
        <button class="btn" id="ac-d">Dilutive</button>
        <button class="btn" id="ac-new">New case</button>
      </div>
      <div id="ac-verdict" style="margin-top:8px"></div>
    </div>
    <div id="ac-soln"></div>
  </div>`;
  $('#ac-new').onclick=()=>{ accCase=randAcc(); labAcc(); };
  const reveal=(guess)=>{
    const isAcc=r.accr>=0; const right=(guess==='a')===isAcc;
    $('#ac-verdict').innerHTML=`<span class="${right?'pos':'neg'}">${right?'\u2713 Correct':'\u2717 Not quite'} \u2014 the deal is <b>${isAcc?'accretive':'dilutive'}</b> by ${pctf(r.accr)}.</span>`;
    $('#ac-soln').innerHTML=`<div class="answer"><h4>Worked solution</h4>
      <div class="stmt-row"><span>Acquirer EPS = ${fmt(p.acqNI)} / ${p.acqShares}</span><span>${r.acqEPS.toFixed(2)}</span></div>
      <div class="stmt-row"><span>Acquirer share price = EPS \u00d7 ${p.acqPE}x</span><span>${r.acqPrice.toFixed(2)}</span></div>
      <div class="stmt-row"><span>Offer value = ${fmt(p.tgtNI*p.tgtPE)} \u00d7 (1+${Math.round(p.premium*100)}%)</span><span>${fmt(r.offer)}</span></div>
      <div class="stmt-row"><span>New shares issued = ${fmt(r.stockPort)} / ${r.acqPrice.toFixed(2)}</span><span>${r.newShares.toFixed(1)}</span></div>
      <div class="stmt-row"><span>After-tax cost of cash used</span><span>${fmt(-r.afterTaxIntr)}</span></div>
      <div class="stmt-row"><span>After-tax synergies</span><span>${fmt(r.synergiesAT)}</span></div>
      <div class="stmt-sep"></div>
      <div class="stmt-row"><span>Combined NI</span><span>${fmt(r.combNI)}</span></div>
      <div class="stmt-row"><span>Combined shares</span><span>${r.combShares.toFixed(1)}</span></div>
      <div class="stmt-row"><span><b>Combined EPS</b></span><span><b>${r.combEPS.toFixed(2)}</b></span></div>
      <div class="stmt-row"><span><b>vs standalone ${r.acqEPS.toFixed(2)}</b></span><span class="${r.accr>=0?'pos':'neg'}"><b>${pctf(r.accr)}</b></span></div>
      <p class="muted" style="font-size:12px;margin-top:8px">Rule of thumb: a stock deal is accretive when the acquirer\u2019s P/E is above the target\u2019s effective purchase P/E; cheap cash/debt usually helps accretion.</p>
    </div>`;
  };
  $('#ac-a').onclick=()=>reveal('a'); $('#ac-d').onclick=()=>reveal('d');
}

/* ===================================================================
   MAP — the finance ecosystem, interactive
   =================================================================== */
const ECO = {
  nodes:[
    {id:'lp',col:0,label:'Capital Owners (LPs)',group:'cap',
     blurb:'Pensions, endowments, insurers, sovereign wealth & family offices. They own the capital and allocate it to funds, demanding returns above public markets.',
     talks:[{to:'pe',rel:'commit capital'},{to:'pc',rel:'commit capital'},{to:'ss',rel:'commit capital'},{to:'hf',rel:'commit capital'},{to:'am',rel:'commit capital'}],
     topics:[{label:'Behavioral',topic:'Behavioral'}]},
    {id:'pe',col:1,label:'Private Equity',group:'buy',
     blurb:'Buys control of companies using equity + debt (LBOs), improves them over a 3\u20137yr hold, exits via sale or IPO. Sources deals through bankers and sponsor coverage.',
     talks:[{to:'ibadv',rel:'buy/sell via auctions'},{to:'dcm',rel:'source leverage'},{to:'pc',rel:'source private debt'},{to:'company',rel:'own portfolio cos'}],
     topics:[{label:'LBO',topic:'LBO'},{label:'Valuation',topic:'Valuation'},{label:'Accounting',topic:'Accounting'},{label:'M&A',topic:'M&A'}]},
    {id:'pc',col:1,label:'Private / Structured Credit',group:'buy',
     blurb:'Non-bank direct lenders. Provide first-lien, floating-rate loans \u2014 mostly to PE-sponsored buyouts \u2014 competing with banks\u2019 leveraged finance. Now funds the majority of mid-market LBO debt.',
     talks:[{to:'pe',rel:'lend to buyouts'},{to:'company',rel:'direct loans'},{to:'dcm',rel:'compete / co-lend'},{to:'lp',rel:'raise funds'}],
     topics:[{label:'Capital Markets',topic:'Capital Markets',sub:'Debt & Leveraged Finance'},{label:'Accounting',topic:'Accounting'}]},
    {id:'ss',col:1,label:'Special Situations / Distressed',group:'buy',
     blurb:'Buys debt of stressed/defaulted companies at a discount. Trades for recovery, or pursues \u201cloan-to-own\u201d \u2014 taking the fulcrum security to convert debt into equity control through restructuring.',
     talks:[{to:'company',rel:'buy distressed debt'},{to:'rx',rel:'negotiate restructurings'},{to:'st',rel:'trade claims'},{to:'lp',rel:'raise funds'}],
     topics:[{label:'Restructuring',topic:'Industry',sub:'Financial Restructuring'},{label:'Capital Markets',topic:'Capital Markets'},{label:'Valuation',topic:'Valuation'}]},
    {id:'hf',col:1,label:'Hedge Funds',group:'buy',
     blurb:'Trade public securities across the capital structure (long/short, event-driven, macro, arbitrage). Take and provide liquidity through sell-side trading desks; consume sell-side research.',
     talks:[{to:'st',rel:'trade / prime broker'},{to:'research',rel:'consume research'},{to:'lp',rel:'raise funds'}],
     topics:[{label:'Hedge Fund strategies',topic:'Capital Markets',sub:'Hedge Fund Investing Strategies'},{label:'Markets',topic:'Capital Markets',sub:'General Market Knowledge'}]},
    {id:'am',col:1,label:'Asset Managers (long-only)',group:'buy',
     blurb:'Mutual funds and institutional managers (the Fidelity/Vanguard world). Buy and hold public equities and bonds for clients; the primary buyers of newly issued stock and debt.',
     talks:[{to:'ecm',rel:'buy new equity'},{to:'dcm',rel:'buy new debt'},{to:'st',rel:'execute trades'},{to:'research',rel:'consume research'}],
     topics:[{label:'Valuation',topic:'Valuation'},{label:'Markets',topic:'Capital Markets',sub:'General Market Knowledge'}]},
    {id:'ibadv',col:2,label:'IB \u2014 M&A Advisory',group:'sell',
     blurb:'Advises companies on buying and selling businesses; runs sell-side auctions. \u201cSponsor coverage\u201d teams manage relationships with PE firms to win mandates on both sides of a deal.',
     talks:[{to:'company',rel:'advise on M&A'},{to:'pe',rel:'run auctions / coverage'}],
     topics:[{label:'M&A',topic:'M&A'},{label:'Valuation',topic:'Valuation'},{label:'Accounting',topic:'Accounting'}]},
    {id:'ecm',col:2,label:'IB \u2014 Equity Capital Markets',group:'sell',
     blurb:'Helps companies raise equity \u2014 IPOs and follow-ons \u2014 and places the new shares with buy-side investors.',
     talks:[{to:'company',rel:'underwrite equity'},{to:'am',rel:'place shares'},{to:'hf',rel:'place shares'}],
     topics:[{label:'Capital Markets',topic:'Capital Markets',sub:'Equity Financing'},{label:'Valuation',topic:'Valuation'}]},
    {id:'dcm',col:2,label:'IB \u2014 Debt / Leveraged Finance',group:'sell',
     blurb:'Arranges and underwrites debt \u2014 bonds and leveraged loans \u2014 including the financing for LBOs, then syndicates it to credit investors. Competes with private credit for sponsor financing.',
     talks:[{to:'company',rel:'underwrite debt'},{to:'pe',rel:'finance LBOs'},{to:'am',rel:'syndicate debt'},{to:'pc',rel:'compete / co-lend'}],
     topics:[{label:'Debt & Leveraged Finance',topic:'Capital Markets',sub:'Debt & Leveraged Finance'},{label:'LBO',topic:'LBO'}]},
    {id:'rx',col:2,label:'IB \u2014 Restructuring Advisory',group:'sell',
     blurb:'Advises distressed companies (or their creditors) through balance-sheet restructurings and Chapter 11 \u2014 the sell-side counterpart to distressed investors. Common feeder into special-situations funds.',
     talks:[{to:'company',rel:'advise distressed'},{to:'ss',rel:'negotiate with creditors'}],
     topics:[{label:'Restructuring',topic:'Industry',sub:'Financial Restructuring'},{label:'Accounting',topic:'Accounting'}]},
    {id:'st',col:2,label:'Sales & Trading / Markets',group:'sell',
     blurb:'Makes markets in the secondary market \u2014 provides liquidity, execution and prime brokerage to the buy-side. Earns spreads and commissions rather than investment returns.',
     talks:[{to:'hf',rel:'liquidity / prime'},{to:'am',rel:'execution'},{to:'ss',rel:'trade claims'}],
     topics:[{label:'Sales & Trading',topic:'Capital Markets',sub:'Sales & Trading'},{label:'Markets',topic:'Capital Markets',sub:'General Market Knowledge'}]},
    {id:'research',col:2,label:'Equity Research',group:'sell',
     blurb:'Publishes analysis and buy/sell/hold ratings on public companies for buy-side clients; helps the buy-side form views (and supports the trading relationship).',
     talks:[{to:'hf',rel:'provide research'},{to:'am',rel:'provide research'}],
     topics:[{label:'Valuation',topic:'Valuation'},{label:'Accounting',topic:'Accounting'}]},
    {id:'company',col:3,label:'Companies / Issuers',group:'co',
     blurb:'Public and private operating companies \u2014 the source of all the assets and securities. They hire the sell-side to raise capital and to buy or sell businesses, and they are what the buy-side ultimately owns or lends to.',
     talks:[],
     topics:[{label:'Accounting',topic:'Accounting'},{label:'Industry verticals',topic:'Industry'}]},
  ]
};
let mapActive=null;
function renderMap(){
  const el=$('#view-map');
  const cols=[
    {k:'cap',title:'Capital'},{k:'buy',title:'Buy-side'},{k:'sell',title:'Sell-side'},{k:'co',title:'Companies'}];
  el.innerHTML=`<div class="card" style="padding:16px 16px 8px">
    <h3 style="margin-top:0">How the finance world connects</h3>
    <p class="muted" style="font-size:13px">Capital flows left \u2192 right: owners fund the <b>buy-side</b>, who transact through the <b>sell-side</b>, whose ultimate subject is <b>companies</b>. Tap any role to see what it does, who it works with, and what to master.</p>
    <div class="mapwrap"><svg id="map-svg"></svg>
      <div class="mapgrid">
        ${cols.map(c=>`<div class="mapcol"><div class="mapcol-h">${c.title}</div>
          ${ECO.nodes.filter(n=>n.group===c.k).map(n=>`<div class="mnode" data-id="${n.id}">${esc(n.label)}</div>`).join('')}
        </div>`).join('')}
      </div>
    </div>
  </div>
  <div id="map-detail"></div>`;
  el.querySelectorAll('.mnode').forEach(b=>b.onclick=()=>{ mapActive=b.dataset.id; paintMap(); });
  requestAnimationFrame(()=>{ drawEdges(); paintMap(); });
  window.onresize=()=>{ if(!$('#view-map').hidden) drawEdges(); };
}
function edgeList(){
  const seen=new Set(), edges=[];
  ECO.nodes.forEach(n=>n.talks.forEach(t=>{
    const key=[n.id,t.to].sort().join('-');
    if(seen.has(key))return; seen.add(key); edges.push({a:n.id,b:t.to}); }));
  return edges;
}
function drawEdges(){
  const svg=$('#map-svg'), wrap=svg.parentElement, wr=wrap.getBoundingClientRect();
  svg.setAttribute('width',wr.width); svg.setAttribute('height',wr.height);
  svg.innerHTML='';
  const center=id=>{ const e=document.querySelector(`.mnode[data-id="${id}"]`); if(!e)return null;
    const r=e.getBoundingClientRect(); return {x:r.left-wr.left+r.width/2,y:r.top-wr.top+r.height/2,r}; };
  edgeList().forEach(({a,b})=>{
    const ca=center(a),cb=center(b); if(!ca||!cb)return;
    const ln=document.createElementNS('http://www.w3.org/2000/svg','path');
    const x1=ca.r.right-wr.left, y1=ca.y, x2=cb.r.left-wr.left, y2=cb.y;
    const mx=(x1+x2)/2;
    ln.setAttribute('d',`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
    ln.setAttribute('class','edge'); ln.dataset.a=a; ln.dataset.b=b;
    svg.appendChild(ln);
  });
}
function paintMap(){
  const active=mapActive;
  const neighbours=new Set();
  if(active){ ECO.nodes.find(n=>n.id===active).talks.forEach(t=>neighbours.add(t.to));
    ECO.nodes.forEach(n=>n.talks.forEach(t=>{ if(t.to===active) neighbours.add(n.id); })); }
  document.querySelectorAll('.mnode').forEach(e=>{
    e.classList.toggle('active',e.dataset.id===active);
    e.classList.toggle('dim',active && e.dataset.id!==active && !neighbours.has(e.dataset.id));
  });
  document.querySelectorAll('.edge').forEach(ed=>{
    const on=active && (ed.dataset.a===active||ed.dataset.b===active);
    ed.classList.toggle('edge-on',!!on); ed.classList.toggle('edge-dim',active&&!on);
  });
  const d=$('#map-detail');
  if(!active){ d.innerHTML=''; return; }
  const n=ECO.nodes.find(x=>x.id===active);
  const rels=[];
  n.talks.forEach(t=>rels.push({id:t.to,rel:t.rel}));
  ECO.nodes.forEach(o=>o.talks.forEach(t=>{ if(t.to===active) rels.push({id:o.id,rel:t.rel}); }));
  const nm=id=>ECO.nodes.find(x=>x.id===id).label;
  d.innerHTML=`<div class="card" style="margin-top:16px">
    <div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(n.label)}</h3>
      <button class="icon-btn" onclick="clearMap()">clear</button></div>
    <p style="font-size:14px">${esc(n.blurb)}</p>
    <h4 style="font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin:14px 0 6px">Works with</h4>
    <div>${rels.map(r=>`<div class="stmt-row"><span><b>${esc(nm(r.id))}</b></span><span class="muted">${esc(r.rel)}</span></div>`).join('')}</div>
    <h4 style="font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin:16px 0 6px">Master these to work here</h4>
    <div class="row">${n.topics.map(t=>`<button class="btn" onclick="openPrimer('${primerFor(t.topic,t.sub||null)}')">${esc(t.label)} \u2192</button>`).join('')}</div>
  </div>`;
}
window.clearMap=()=>{ mapActive=null; paintMap(); };

/* ===================================================================
   LEARN — modules (tracks) → units → lesson bubbles → 10 cards + lesson quiz
   =================================================================== */
const TRACKS = window.IBZY_TRACKS;                 // [{id,title,tag,primers:[],units:[{id,title,pages,lessons:[]}],soon}]
const LESSONS = [];                                // flat list with back-references
TRACKS.forEach(T=>(T.units||[]).forEach(U=>(U.lessons||[]).forEach(L=>{ L.track=T; L.unit=U; L.n=LESSONS.filter(x=>x.track===T).length+1; LESSONS.push(L); })));
const LESSON_OF = {};                              // card id -> lesson
LESSONS.forEach(L=>L.cards.forEach(c=>{ LESSON_OF[c.id]=L; }));
const CARD = {}; BANK.forEach(c=>{ CARD[c.id]=c; });
const PASS = 8;                                    // lesson quiz pass mark out of 10
const LQ_LEN = 10;

const READ_KEY='ibzy_read', NOTES_KEY='ibzy_notes', LSC_KEY='ibzy_lessons', LQ_KEY='ibzy_lq', LAST_KEY='ibzy_last';
let READ   = LS.get(READ_KEY,{})   || {};
let NOTES  = LS.get(NOTES_KEY,{})  || {};
let LSCORE = LS.get(LSC_KEY,{})    || {};          // lessonId -> {best,last,ts,tries}
const isRead = id => !!READ[id];
function setRead(id,on){ if(on) READ[id]=Date.now(); else delete READ[id]; LS.set(READ_KEY,READ); updateDueBadge(); }
let _noteT={};
function saveNote(id,txt){ if(txt.trim()) NOTES[id]=txt; else delete NOTES[id];
  clearTimeout(_noteT[id]); _noteT[id]=setTimeout(()=>LS.set(NOTES_KEY,NOTES),500); }
function lessonStat(L){ const n=L.cards.length, r=L.cards.filter(c=>isRead(c.id)).length, s=LSCORE[L.id];
  return {n, r, unlocked:r===n, passed:!!(s&&s.best>=PASS), best:s?s.best:null, tries:s?s.tries:0}; }
function trackStat(T){ const Ls=LESSONS.filter(L=>L.track===T); let n=0,r=0,p=0;
  Ls.forEach(L=>{ const s=lessonStat(L); n+=s.n; r+=s.r; if(s.passed) p++; }); return {n,r,lessons:Ls.length,passed:p}; }
const lessonQuizPool = L => MCQS.filter(m=>m.l===L.id);
function setLast(L){ LS.set(LAST_KEY,{lesson:L.id, ts:Date.now()}); }

/* ---- shared card component (Learn lessons, Browse, search) ---- */
function cardHTML(c, opts={}){
  const read=isRead(c.id), note=NOTES[c.id]||'';
  const L=LESSON_OF[c.id];
  return `<div class="qcard${read?' is-read':''}" data-id="${esc(c.id)}">
    <div class="qcard-head" role="button" tabindex="0" aria-expanded="false">
      ${opts.num?`<span class="qnum">${opts.num}</span>`:''}
      <span class="qtext">${esc(c.prompt)}${note?'<span class="note-dot" title="You have a note on this card">✎</span>':''}</span>
      ${read?`<button class="read-tag" title="Tap to mark as unread">Read</button>`
            :`<label class="read-box" title="Mark as read"><input type="checkbox"><span>Mark as read</span></label>`}
    </div>
    <div class="qcard-body" hidden>
      <div class="answer-body">${c.answer||''}</div>
      <div class="qcard-meta">${opts.showLesson&&L?`<a href="#" class="go-lesson" data-l="${L.id}">${esc(L.track.title)} · Lesson ${L.n}: ${esc(L.title)}</a> · `:''}<span>Red Book p. ${c.page||'—'}</span></div>
      <label class="fld" style="margin-top:12px">Your notes</label>
      <textarea class="qnote" placeholder="Anything you want to remember — saves automatically">${esc(note)}</textarea>
    </div>
  </div>`;
}
function bindCards(root, onReadChange){
  root.querySelectorAll('.qcard').forEach(card=>{
    const id=card.dataset.id, head=card.querySelector('.qcard-head'), body=card.querySelector('.qcard-body');
    const toggle=()=>{ body.hidden=!body.hidden; head.setAttribute('aria-expanded',!body.hidden); card.classList.toggle('open',!body.hidden); };
    head.addEventListener('click',e=>{ if(e.target.closest('.read-box,.read-tag')) return; toggle(); });
    head.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ')&&e.target===head){ e.preventDefault(); toggle(); } });
    const swap=(on)=>{ setRead(id,on);
      const old=card.querySelector('.read-box,.read-tag');
      const tmp=document.createElement('div');
      tmp.innerHTML=on?`<button class="read-tag" title="Tap to mark as unread">Read</button>`
                     :`<label class="read-box" title="Mark as read"><input type="checkbox"><span>Mark as read</span></label>`;
      old.replaceWith(tmp.firstChild); card.classList.toggle('is-read',on); wire(); if(onReadChange) onReadChange(id,on); };
    const wire=()=>{ const box=card.querySelector('.read-box input'); if(box) box.onchange=()=>{ if(box.checked) swap(true); };
      const tag=card.querySelector('.read-tag'); if(tag) tag.onclick=(e)=>{ e.stopPropagation(); swap(false); }; };
    wire();
    const ta=card.querySelector('.qnote');
    ta.addEventListener('input',()=>{ saveNote(id,ta.value);
      const qt=card.querySelector('.qtext'); const dot=qt.querySelector('.note-dot');
      if(ta.value.trim()&&!dot) qt.insertAdjacentHTML('beforeend','<span class="note-dot" title="You have a note on this card">✎</span>');
      if(!ta.value.trim()&&dot) dot.remove(); });
    const gl=card.querySelector('.go-lesson'); if(gl) gl.onclick=e=>{ e.preventDefault(); openLesson(gl.dataset.l, id); };
  });
}

/* ---- primer machinery (unchanged behaviour: read, then 10-question check) ---- */
function primerFor(topic, sub){
  if(topic==='Behavioral') return 'behavioral';
  if(topic==='LBO') return 'lbo';
  if(topic==='Valuation') return 'valuation';
  if(topic==='Accounting') return 'accounting';
  if(topic==='M&A') return 'mna';
  if(topic==='Industry') return sub==='Financial Restructuring' ? 'restructuring' : 'industry';
  if(topic==='Capital Markets'){
    return ({'Debt & Leveraged Finance':'levfin','Equity Financing':'ecm','Sales & Trading':'st',
      'Hedge Fund Investing Strategies':'hedge','General Market Knowledge':'markets'})[sub] || 'markets';
  }
  return 'markets';
}
const PROG_KEY='rba_primer_prog';
const MASTER=8;
function primerProg(){ return LS.get(PROG_KEY,{})||{}; }
function recordPrimer(id,score){ const p=primerProg(); if(score>(p[id]||0)){ p[id]=score; LS.set(PROG_KEY,p); } }
function primerStatus(id){ const s=primerProg()[id]; return s===undefined?'todo':(s>=MASTER?'done':'prog'); }
const trackOfPrimer = id => TRACKS.find(T=>(T.primers||[]).includes(id));

/* ---- navigation state ---- */
let learnNav = {screen:'home'};    // home | track{t} | lesson{l} | lquiz{l} | primer{id,quiz}
window.openPrimer=(id)=>{ learnNav={screen:'primer', id, quiz:null}; show('learn'); };
window.openTrack=(t)=>{ learnNav={screen:'track', t}; show('learn'); window.scrollTo(0,0); };
function openLesson(lid, focusCard){ learnNav={screen:'lesson', l:lid, focus:focusCard||null}; show('learn'); if(!focusCard) window.scrollTo(0,0); }
window.openLesson=openLesson;

/* ---- bubbles ---- */
function bubbleSVG(frac, passed, label){
  const r=19, c=2*Math.PI*r, off=c*(1-Math.max(0,Math.min(1,frac)));
  return `<svg viewBox="0 0 48 48" class="bub-svg" aria-hidden="true">
    <circle cx="24" cy="24" r="${r}" class="bub-track"/>
    <circle cx="24" cy="24" r="${r}" class="bub-fill" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" transform="rotate(-90 24 24)"/>
    ${passed?'<circle cx="24" cy="24" r="15" class="bub-done"/><path d="M17 24.5l4.6 4.6L31 19.7" class="bub-tick"/>'
            :`<text x="24" y="28.5" text-anchor="middle" class="bub-num">${label}</text>`}
  </svg>`;
}
function bubbleRow(U, small, inert){
  const tag = inert ? 'span' : 'button';
  return `<div class="bub-row${small?' small':''}">${U.lessons.map((L,i)=>{ const s=lessonStat(L);
    const state = s.passed?'passed':s.unlocked?'unlocked':s.r?'started':'new';
    return `<${tag} class="bub ${state}${i?' linked':''}" ${inert?'':`onclick="openLesson('${L.id}')"`} title="Lesson ${L.n}: ${esc(L.title)} — ${s.r}/${s.n} read${s.passed?' · quiz passed ('+s.best+'/10)':s.unlocked?' · quiz unlocked':''}">
      ${bubbleSVG(s.r/s.n, s.passed, L.n)}${small?'':`<span class="bub-label">${esc(L.title)}</span>`}</${tag}>`; }).join('')}</div>`;
}
function ringHTML(frac, size){ const r=16, c=2*Math.PI*r, off=c*(1-frac);
  return `<svg viewBox="0 0 40 40" width="${size||40}" height="${size||40}" class="ring"><circle cx="20" cy="20" r="${r}" class="bub-track"/><circle cx="20" cy="20" r="${r}" class="bub-fill" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" transform="rotate(-90 20 20)"/></svg>`; }

/* ---- screens ---- */
function renderLearn(){
  const el=$('#view-learn');
  const s=learnNav.screen;
  if(s==='track') return learnTrack(el);
  if(s==='lesson') return learnLesson(el);
  if(s==='lquiz') return learnLessonQuiz(el);
  if(s==='primer') return learnPrimer(el);
  return learnHome(el);
}

function learnHome(el){
  const last=LS.get(LAST_KEY,null); const lastL=last&&LESSONS.find(L=>L.id===last.lesson);
  let next=null;
  if(lastL){ const st=lessonStat(lastL); next = st.passed ? (LESSONS[LESSONS.indexOf(lastL)+1]||lastL) : lastL; }
  else next=LESSONS[0];
  const totalCards=LESSONS.reduce((a,L)=>a+L.cards.length,0), readCards=LESSONS.reduce((a,L)=>a+lessonStat(L).r,0);
  const nextSt=next&&lessonStat(next);
  el.innerHTML=`
    <input type="search" id="learn-search" placeholder="Search all ${totalCards} cards…" autocomplete="off">
    <div id="learn-results"></div>
    <div id="learn-main">
    ${next?`<div class="card continue-card">
      <div class="row" style="justify-content:space-between;align-items:center;gap:14px;flex-wrap:nowrap">
        <div style="min-width:0">
          <div class="learn-tag">${lastL?'Continue where you left off':'Start here'}</div>
          <div class="learn-title" style="margin:4px 0 2px">${esc(next.track.title)} · Lesson ${next.n}: ${esc(next.title)}</div>
          <div class="learn-meta">${nextSt.r}/${nextSt.n} cards read${nextSt.passed?' · quiz passed':nextSt.unlocked?' · quiz unlocked':''}</div>
        </div>
        <button class="btn primary" onclick="openLesson('${next.id}')" style="flex:0 0 auto">${lastL?'Continue':'Start'} →</button>
      </div></div>`:''}
    <div class="row" style="justify-content:space-between;margin:20px 2px 2px"><h3 style="margin:0">Modules</h3><span class="muted" style="font-size:12px">${readCards}/${totalCards} cards read</span></div>
    <div class="learn-grid">${TRACKS.map((T,i)=>{ const st=trackStat(T); const frac=st.n?st.r/st.n:0;
      return `<div class="learn-card module-card" role="button" tabindex="0" onclick="openTrack('${T.id}')" onkeydown="if(event.key==='Enter')openTrack('${T.id}')">
        <div class="row" style="justify-content:space-between;align-items:flex-start;flex-wrap:nowrap;gap:10px">
          <div style="min-width:0"><div class="learn-tag"><span class="learn-step">${i+1}</span>${esc(T.tag||'')}</div>
          <div class="learn-title">${esc(T.title)}</div></div>
          ${st.lessons?ringHTML(frac,38):''}
        </div>
        <div class="learn-meta">${st.lessons?`${st.lessons} lessons · ${st.r}/${st.n} read · ${st.passed} quiz${st.passed===1?'':'zes'} passed`
          :`Primer + check available · <span class="soon">cards coming soon</span>`}</div>
        ${st.lessons?`<div class="mini-bubs">${T.units.filter(U=>U.lessons&&U.lessons.length).map(U=>bubbleRow(U,true,true)).join('')}</div>`:''}
      </div>`; }).join('')}</div>
    </div>`;
  const inp=$('#learn-search'); let t=null;
  inp.oninput=()=>{ clearTimeout(t); t=setTimeout(()=>searchCards(inp.value),150); };
}
function searchCards(q){
  const box=$('#learn-results'), main=$('#learn-main'); q=q.trim().toLowerCase();
  if(!q){ box.innerHTML=''; main.hidden=false; return; }
  main.hidden=true;
  const strip=h=>h.replace(/<[^>]+>/g,' ');
  const hits=BANK.filter(c=>(c.prompt+' '+strip(c.answer||'')).toLowerCase().includes(q)).slice(0,60);
  box.innerHTML=`<p class="muted" style="font-size:12.5px;margin:12px 2px">${hits.length?hits.length+(hits.length===60?'+':'')+' matching cards':'No cards match that.'}</p>`+hits.map(c=>cardHTML(c,{showLesson:true})).join('');
  bindCards(box);
}

function learnTrack(el){
  const T=TRACKS.find(x=>x.id===learnNav.t); if(!T){ learnNav={screen:'home'}; return renderLearn(); }
  const st=trackStat(T);
  const primers=(T.primers||[]).map(id=>PRIMERS.find(p=>p.id===id)).filter(Boolean);
  el.innerHTML=`<div class="crumbs"><a href="#" id="lt-home">← All modules</a></div>
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center;flex-wrap:nowrap;gap:12px">
        <div><span class="pill">${esc(T.tag||'Module')}</span>
          <h2 class="serif" style="margin:10px 0 4px">${esc(T.title)}</h2>
          <div class="muted" style="font-size:13px">${st.lessons?`${st.lessons} lessons · ${st.n} cards · Red Book ${esc(T.pages||'')}`:`Red Book ${esc(T.pages||'')}`}</div></div>
        ${st.lessons?`<div class="ring-big">${ringHTML(st.n?st.r/st.n:0,64)}<span>${st.n?Math.round(st.r/st.n*100):0}%</span></div>`:''}
      </div>
      ${primers.length?`<div class="primer-strip">${primers.map(p=>{ const ps=primerStatus(p.id);
        return `<button class="primer-chip" onclick="openPrimer('${p.id}')"><b>Primer:</b> ${esc(p.title)}
          <span class="learn-status ls-${ps==='done'?'done':ps==='prog'?'prog':'todo'}">${ps==='done'?'✓ check passed':ps==='prog'?'check: '+primerProg()[p.id]+'/10':'read first'}</span></button>`; }).join('')}</div>`:''}
    </div>
    ${(T.units||[]).map((U,ui)=>{ const done=U.lessons?U.lessons.filter(L=>lessonStat(L).passed).length:0;
      return `<div class="card unit-card">
        <div class="row" style="justify-content:space-between;align-items:baseline">
          <h3 style="margin:0">${ui+1} · ${esc(U.title)}</h3>
          <span class="muted" style="font-size:12px">Red Book pp. ${esc(U.pages||'')}${U.lessons&&U.lessons.length?` · ${done}/${U.lessons.length} passed`:''}</span>
        </div>
        ${U.lessons&&U.lessons.length?bubbleRow(U):`<p class="muted" style="font-size:13px;margin:10px 0 0">Cards for this unit are coming soon.</p>`}
      </div>`; }).join('')}
    ${!(T.units||[]).length?`<div class="card unit-card"><p class="muted" style="margin:0">Lesson cards for this module are coming soon. The primer and its 10-question check are ready now.</p></div>`:''}`;
  $('#lt-home').onclick=e=>{ e.preventDefault(); learnNav={screen:'home'}; renderLearn(); };
}

function learnLesson(el){
  const L=LESSONS.find(x=>x.id===learnNav.l); if(!L){ learnNav={screen:'home'}; return renderLearn(); }
  setLast(L);
  const idx=LESSONS.indexOf(L), prev=LESSONS[idx-1], next=LESSONS[idx+1];
  const sameTrack = x => x && x.track===L.track;
  const lq=LS.get(LQ_KEY,null), resumable = lq && lq.l===L.id && lq.idx<lq.pool.length;
  el.innerHTML=`<div class="crumbs"><a href="#" id="ll-track">← ${esc(L.track.title)}</a></div>
    <div class="card lesson-head">
      <div class="row" style="justify-content:space-between;align-items:center">
        <span class="pill">${esc(L.unit.title)}</span>
        <span class="muted" style="font-size:12px">Red Book pp. ${esc(L.pages)}</span>
      </div>
      <h2 class="serif" style="margin:10px 0 4px">Lesson ${L.n} · ${esc(L.title)}</h2>
      <p class="muted" style="font-size:13px;margin:0">Open each card, read the answer, then tick <b>Mark as read</b>. Once every card is ticked, the lesson quiz unlocks.</p>
      <div class="row" style="margin-top:12px;gap:6px"><button class="btn small" id="ll-open">Expand all</button><button class="btn small" id="ll-close">Collapse all</button></div>
    </div>
    <div id="ll-cards">${L.cards.map((c,i)=>cardHTML(CARD[c.id]||c,{num:i+1})).join('')}</div>
    <div class="lesson-bar" id="ll-bar"></div>
    <div class="row" style="justify-content:space-between;margin-top:14px">
      ${prev?`<button class="btn" onclick="openLesson('${prev.id}')">← ${sameTrack(prev)?'Lesson '+prev.n:esc(prev.track.title)}</button>`:'<span></span>'}
      ${next?`<button class="btn" onclick="openLesson('${next.id}')">${sameTrack(next)?'Lesson '+next.n:esc(next.track.title)} →</button>`:''}
    </div>`;
  const paintBar=()=>{ const s=lessonStat(L); const pct=Math.round(s.r/s.n*100);
    $('#ll-bar').innerHTML=`<div class="lb-info"><div class="lb-count"><b>${s.r}/${s.n}</b> read${s.best!==null?` · best quiz ${s.best}/10`:''}</div>
        <div class="bar" style="margin:6px 0 0"><i style="width:${pct}%"></i></div></div>
      ${s.unlocked?`<button class="btn primary" id="ll-quiz">${resumable?'Resume quiz':s.passed?'Retake quiz':'Take the lesson quiz'} →</button>`
        :`<button class="btn" disabled title="Mark every card as read to unlock">🔒 Quiz locked</button>`}`;
    const qb=$('#ll-quiz'); if(qb) qb.onclick=()=>startLessonQuiz(L, resumable); };
  paintBar();
  bindCards($('#ll-cards'), (id,on)=>{ const before=lessonStat(L); paintBar();
    if(on && before.unlocked) toast('All cards read — the lesson quiz is unlocked'); });
  $('#ll-track').onclick=e=>{ e.preventDefault(); openTrack(L.track.id); };
  $('#ll-open').onclick=()=>el.querySelectorAll('.qcard').forEach(c=>{ c.querySelector('.qcard-body').hidden=false; c.classList.add('open'); });
  $('#ll-close').onclick=()=>el.querySelectorAll('.qcard').forEach(c=>{ c.querySelector('.qcard-body').hidden=true; c.classList.remove('open'); });
  if(learnNav.focus){ const c=el.querySelector(`.qcard[data-id="${CSS.escape(learnNav.focus)}"]`);
    if(c){ c.querySelector('.qcard-body').hidden=false; c.classList.add('open','flash'); setTimeout(()=>c.scrollIntoView({block:'center'}),50); }
    learnNav.focus=null; }
}

function startLessonQuiz(L, resume){
  if(!lessonStat(L).unlocked){ toast('Mark every card in this lesson as read first'); return; }
  if(!resume){
    const pool=shuffle(lessonQuizPool(L).map(m=>({...m}))).slice(0,LQ_LEN).map(shuffleOpts);
    if(!pool.length){ toast('No quiz questions for this lesson yet'); return; }
    LS.set(LQ_KEY,{l:L.id,pool,idx:0,score:0,answered:false,picked:null,log:[]});
  }
  learnNav={screen:'lquiz', l:L.id}; renderLearn(); window.scrollTo(0,0);
}
function learnLessonQuiz(el){
  const L=LESSONS.find(x=>x.id===learnNav.l); const q=LS.get(LQ_KEY,null);
  if(!L||!q||q.l!==L.id){ learnNav={screen:'lesson',l:learnNav.l}; return renderLearn(); }
  const save=()=>LS.set(LQ_KEY,q);
  if(q.idx>=q.pool.length){
    const total=q.pool.length, scaled=Math.round(q.score/total*10);
    if(!q.recorded){ const prev=LSCORE[L.id]||{best:0,tries:0};
      LSCORE[L.id]={best:Math.max(prev.best||0,scaled), last:scaled, ts:Date.now(), tries:(prev.tries||0)+1};
      LS.set(LSC_KEY,LSCORE); q.recorded=true; save(); }
    const passed=scaled>=PASS; const idx=LESSONS.indexOf(L), next=LESSONS[idx+1];
    const misses=q.log.filter(l=>!l.correct);
    el.innerHTML=`<div class="crumbs"><a href="#" id="lq-back">← Lesson ${L.n}</a></div><div class="card">
      <span class="pill">Lesson ${L.n} quiz</span>
      <h3 style="margin:10px 0 0">Score: ${q.score}/${total}</h3>
      <div class="bar" style="margin:10px 0 10px"><i style="width:${Math.round(q.score/total*100)}%"></i></div>
      <p style="margin:0 0 6px;font-weight:650;color:${passed?'var(--good)':'var(--warn)'}">${passed?'✓ Passed — this lesson’s bubble is complete.':`Not passed yet (${PASS}/10 needed). Re-read the cards you missed and retake it.`}</p>
      ${misses.length?`<h4>Review</h4>`+misses.map(l=>`<div style="padding:8px 0;border-bottom:1px solid var(--line)">
          <div style="font-weight:600">${esc(l.q)}</div>
          <div class="muted" style="font-size:13px;margin-top:3px">Correct: ${esc(l.right)}</div>
          <div style="font-size:13px;margin-top:3px">${esc(l.e)}</div></div>`).join(''):`<p class="muted">Clean sweep.</p>`}
      ${misses.length?'<p class="muted" style="font-size:12px;margin-top:10px">Missed questions were added to Smart review on the Quiz tab.</p>':''}
      <div class="row" style="margin-top:16px">
        <button class="btn" id="lq-retake">Retake quiz</button>
        <button class="btn" id="lq-cards">Back to the cards</button>
        ${next?`<button class="btn primary" onclick="openLesson('${next.id}')">Next: ${next.track===L.track?'Lesson '+next.n:esc(next.track.title)} →</button>`:''}
      </div></div>`;
    $('#lq-back').onclick=e=>{ e.preventDefault(); LS.set(LQ_KEY,null); openLesson(L.id); };
    $('#lq-cards').onclick=()=>{ LS.set(LQ_KEY,null); openLesson(L.id); };
    $('#lq-retake').onclick=()=>startLessonQuiz(L,false);
    return;
  }
  const m=q.pool[q.idx];
  el.innerHTML=`<div class="crumbs"><a href="#" id="lq-back">← Lesson ${L.n} (progress is saved)</a></div><div class="card">
    <div class="row" style="justify-content:space-between;align-items:center">
      <span class="row" style="gap:6px"><span class="pill">Lesson ${L.n} quiz</span><span class="pill lvl-${m.d}">${({F:'Foundational',C:'Core',A:'Advanced'})[m.d]||''}</span></span>
      <span class="muted" style="font-size:12px">Q${q.idx+1} / ${q.pool.length} · score ${q.score}</span>
    </div>
    <div class="prompt" style="font-size:18px">${esc(m.q)}</div>
    <div id="pq-opts">${m.o.map((opt,i)=>`<button class="qz-opt" data-i="${i}">${esc(opt)}</button>`).join('')}</div>
    <div id="pq-fb"></div>
    <div class="row" id="pq-next" style="margin-top:14px" hidden><button class="btn primary" id="lq-next">Next →</button></div>
  </div>`;
  $('#lq-back').onclick=e=>{ e.preventDefault(); openLesson(L.id); };
  const finish=(picked)=>{
    const correct=picked===m.a;
    el.querySelectorAll('.qz-opt').forEach((x,i)=>{ x.disabled=true;
      if(i===m.a) x.classList.add('correct'); else if(i===picked) x.classList.add('wrong'); });
    $('#pq-fb').innerHTML=`<div class="answer"><h4>${correct?'Correct':'Not quite'}</h4><p>${esc(m.e)}</p></div>`;
    $('#pq-next').hidden=false;
  };
  if(q.answered){ finish(q.picked); }
  else el.querySelectorAll('.qz-opt').forEach(b=>b.onclick=()=>{
    if(q.answered) return; q.answered=true; q.picked=+b.dataset.i;
    const correct=q.picked===m.a; if(correct) q.score++;
    q.log.push({q:m.q,correct,right:m.o[m.a],e:m.e}); logAttempt(m,correct,'lesson'); save(); finish(q.picked); });
  $('#lq-next').onclick=()=>{ q.idx++; q.answered=false; q.picked=null; save(); renderLearn(); };
  equalizeOpts('#pq-opts');
}

function learnPrimer(el){
  const p=PRIMERS.find(x=>x.id===learnNav.id); if(!p){ learnNav={screen:'home'}; return renderLearn(); }
  const T=trackOfPrimer(p.id);
  const back=`<div class="crumbs"><a href="#" id="lp-back">← ${T?esc(T.title):'All modules'}</a></div>`;
  const bindBack=()=>{ $('#lp-back').onclick=e=>{ e.preventDefault(); if(T) openTrack(T.id); else { learnNav={screen:'home'}; renderLearn(); } }; };
  const q=learnNav.quiz;
  if(!q){
    el.innerHTML=back+`<div class="card">
      <span class="pill">${esc(p.tag)}</span>
      <h2 class="serif" style="margin:10px 0 2px">${esc(p.title)}</h2>
      <div class="primer-body">${p.body}</div>
      <div class="row" style="margin-top:18px"><button class="btn primary" id="lp-check">Take the 10-question check →</button></div>
    </div>`;
    bindBack();
    $('#lp-check').onclick=()=>{ const pool=shuffle(p.quiz.map(x=>({...x}))); learnNav.quiz={pool:pool.map(shuffleOpts),idx:0,score:0,answered:false,log:[]}; renderLearn(); };
    return;
  }
  if(q.idx>=q.pool.length){
    recordPrimer(p.id, q.score);
    const passed=q.score>=MASTER;
    el.innerHTML=back+`<div class="card">
      <span class="pill">${esc(p.title)}</span>
      <h3 style="margin:10px 0 0">Check score: ${q.score}/${q.pool.length}</h3>
      <div class="bar" style="margin:10px 0 10px"><i style="width:${Math.round(q.score/q.pool.length*100)}%"></i></div>
      <p style="margin:0 0 6px;font-weight:600;color:${passed?'var(--good)':'var(--warn)'}">${passed?'✓ Primer check passed.':'Not there yet ('+MASTER+'/10 needed). Re-read and retake.'}</p>
      ${q.log.filter(l=>!l.correct).map(l=>`<div style="padding:8px 0;border-bottom:1px solid var(--line)">
          <div style="font-weight:600">${esc(l.q)}</div>
          <div class="muted" style="font-size:13px;margin-top:3px">Correct: ${esc(l.right)}</div>
          <div style="font-size:13px;margin-top:3px">${esc(l.e)}</div></div>`).join('')}
      <div class="row" style="margin-top:16px">
        <button class="btn" id="lp-retake">Retake check</button>
        <button class="btn" id="lp-reread">Re-read primer</button>
        ${T?`<button class="btn primary" onclick="openTrack('${T.id}')">Back to ${esc(T.title)}</button>`:''}
      </div></div>`;
    bindBack();
    $('#lp-retake').onclick=()=>{ const pool=shuffle(p.quiz.map(x=>({...x}))); learnNav.quiz={pool:pool.map(shuffleOpts),idx:0,score:0,answered:false,log:[]}; renderLearn(); };
    $('#lp-reread').onclick=()=>{ learnNav.quiz=null; renderLearn(); };
    return;
  }
  const m=q.pool[q.idx];
  el.innerHTML=back+`<div class="card">
    <div class="row" style="justify-content:space-between;align-items:center">
      <span class="pill">${esc(p.title)} check</span>
      <span class="muted" style="font-size:12px">Q${q.idx+1} / ${q.pool.length} · score ${q.score}</span>
    </div>
    <div class="prompt" style="font-size:18px">${esc(m.q)}</div>
    <div id="pq-opts">${m.o.map((opt,i)=>`<button class="qz-opt" data-i="${i}">${esc(opt)}</button>`).join('')}</div>
    <div id="pq-fb"></div>
    <div class="row" id="pq-next" style="margin-top:14px" hidden><button class="btn primary" id="lp-next">Next →</button></div>
  </div>`;
  bindBack();
  el.querySelectorAll('.qz-opt').forEach(b=>b.onclick=()=>{
    if(q.answered) return; q.answered=true; const picked=+b.dataset.i;
    const correct=picked===m.a; if(correct) q.score++;
    el.querySelectorAll('.qz-opt').forEach((x,i)=>{ x.disabled=true;
      if(i===m.a) x.classList.add('correct'); else if(i===picked) x.classList.add('wrong'); });
    $('#pq-fb').innerHTML=`<div class="answer"><h4>${correct?'Correct':'Not quite'}</h4><p>${esc(m.e)}</p></div>`;
    q.log.push({q:m.q,correct,right:m.o[m.a],e:m.e});
    $('#pq-next').hidden=false;
  });
  $('#lp-next').onclick=()=>{ q.idx++; q.answered=false; renderLearn(); };
  equalizeOpts('#pq-opts');
}

/* ---------- BROWSE (every card, grouped by module → unit → lesson) ---------- */
function renderBrowse(){
  const el=$('#view-browse');
  const unread = !!SET.browseUnread;
  el.innerHTML = `<div class="row" style="gap:10px;flex-wrap:nowrap"><input type="search" id="q" placeholder="Search ${BANK.length} questions…" style="flex:1">
    <label class="toggle"><input type="checkbox" id="b-unread" ${unread?'checked':''}> Unread only</label></div>
    <div id="bt"></div>`;
  const strip=h=>(h||'').replace(/<[^>]+>/g,' ');
  const draw=(filter='')=>{
    const f=filter.toLowerCase(), onlyUnread=$('#b-unread').checked;
    const match=c=> (!f || (c.prompt+' '+strip(c.answer)).toLowerCase().includes(f)) && (!onlyUnread || !isRead(c.id));
    let html='';
    TRACKS.forEach(T=>{ const Ls=LESSONS.filter(L=>L.track===T); if(!Ls.length) return;
      const cards=Ls.flatMap(L=>L.cards.map(c=>CARD[c.id]||c)).filter(match); if(!cards.length) return;
      html+=`<div class="topic-head"><b>${esc(T.title)}</b><span class="count">${cards.length}</span>
        <button class="icon-btn" style="margin-left:auto" data-drill="${esc(T.title)}">Drill topic</button></div>`;
      T.units.forEach(U=>{ (U.lessons||[]).forEach(L=>{ const lc=L.cards.map(c=>CARD[c.id]||c).filter(match); if(!lc.length) return;
        const st=lessonStat(L);
        html+=`<details${f?' open':''}><summary>Lesson ${L.n} · ${esc(L.title)} <span class="muted">· ${st.r}/${st.n} read</span></summary>
          <div class="body">${lc.map(c=>cardHTML(c)).join('')}
          <div class="row" style="margin-top:8px"><button class="btn small" onclick="openLesson('${L.id}')">Open lesson ${L.n} →</button></div></div></details>`; }); });
    });
    $('#bt').innerHTML = html || `<div class="empty">${onlyUnread&&!f?'Every card is marked as read.':'No matches.'}</div>`;
    $('#bt').querySelectorAll('[data-drill]').forEach(b=>b.onclick=()=>drillTopic(b.dataset.drill));
    bindCards($('#bt'), ()=>{ $('#bt').querySelectorAll('details').forEach(d=>{ }); });
  };
  draw();
  $('#q').oninput=e=>draw(e.target.value);
  $('#b-unread').onchange=()=>{ SET.browseUnread=$('#b-unread').checked; saveSet(); draw($('#q').value); };
}


updateDueBadge();
renderFooter();
if(STORAGE_VOLATILE){ setTimeout(()=>toast('Private/preview mode: this browser is blocking storage, so progress may not save'),600); }
window.toast=toast; window.show=show;
show('learn');
};
