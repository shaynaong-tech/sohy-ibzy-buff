/* IBZY account + sync layer.
   - Talks to Supabase's REST endpoints directly with fetch (no external library to load).
   - Each user's data lives in localStorage under "ibzy:<user id>:" and is mirrored to the
     public.user_state table (one row per key). Guests use "ibzy:guest:" and never sync.
   - The app code only sees window.IBZY_STORE, which behaves like localStorage. */
(function(){
  'use strict';
  const CFG = window.IBZY_CONFIG;
  const SESSION_KEY = 'ibzy:session';
  const MODE_KEY = 'ibzy:mode';            // 'guest' when someone chose to skip the account

  /* ---------- raw device storage (falls back to memory in locked-down previews) ---------- */
  const mem = {};
  const RAW = (()=>{ try{ const t='__ibzy_probe__'; localStorage.setItem(t,'1'); localStorage.removeItem(t); return localStorage; }catch(e){ return null; } })();
  const base = {
    get: k => RAW ? RAW.getItem(k) : (k in mem ? mem[k] : null),
    set: (k,v) => { if(RAW) RAW.setItem(k,v); else mem[k]=String(v); },
    del: k => { if(RAW) RAW.removeItem(k); else delete mem[k]; },
    keys: () => { if(!RAW) return Object.keys(mem); const out=[]; for(let i=0;i<RAW.length;i++) out.push(RAW.key(i)); return out; }
  };
  const VOLATILE = !RAW;

  /* ---------- session ---------- */
  let session = null;   // {access_token, refresh_token, expires_at, user:{id,email,name}}
  try{ session = JSON.parse(base.get(SESSION_KEY)||'null'); }catch(e){ session=null; }
  function saveSession(s){ session=s; if(s) base.set(SESSION_KEY, JSON.stringify(s)); else base.del(SESSION_KEY); }

  async function authCall(path, body, method, bearer){
    const headers = {'apikey':CFG.supabaseAnonKey, 'Content-Type':'application/json'};
    if(bearer) headers.Authorization = 'Bearer '+bearer;
    const r = await fetch(CFG.supabaseUrl+'/auth/v1/'+path, {method:method||'POST', headers, body: body?JSON.stringify(body):undefined});
    let j = {}; try{ j = await r.json(); }catch(e){}
    if(!r.ok) throw new Error(friendly(j.msg||j.error_description||j.message||j.error||('Error '+r.status)));
    return j;
  }
  function friendly(m){
    if(/invalid login credentials/i.test(m)) return 'Wrong email or password.';
    if(/email not confirmed/i.test(m)) return 'Please confirm your email first — check your inbox for the link, then sign in.';
    if(/already registered|already been registered/i.test(m)) return 'That email already has an account — sign in instead.';
    if(/rate limit/i.test(m)) return 'Too many emails sent recently. Wait a few minutes and try again.';
    if(/password should be at least/i.test(m)) return 'Password needs at least 6 characters.';
    if(/email logins are disabled|email signups are disabled|signups not allowed/i.test(m)) return 'Email sign-in is switched off for this app right now. Please let the app owner know.';
    return m;
  }
  function toSession(j){
    if(!j || !j.access_token || !j.user) return null;
    const md = j.user.user_metadata||{};
    return { access_token:j.access_token, refresh_token:j.refresh_token,
      expires_at: j.expires_at || Math.floor(Date.now()/1000)+(j.expires_in||3600),
      user:{ id:j.user.id, email:j.user.email, name: md.display_name||'' } };
  }
  async function refreshSession(){
    if(!session) return null;
    const j = await authCall('token?grant_type=refresh_token', {refresh_token:session.refresh_token});
    const s = toSession(j); saveSession(s); return s;
  }
  async function accessToken(){
    if(!session) return null;
    if(session.expires_at - Date.now()/1000 < 120){
      try{ await refreshSession(); }
      catch(e){ if(/invalid|not found|expired|revoked|already used/i.test(e.message)){ saveSession(null); location.reload(); } throw e; }
    }
    return session && session.access_token;
  }

  /* ---------- namespaced store the app uses ---------- */
  let uid = null, prefix = 'ibzy:guest:';
  function setUser(id){ uid=id; prefix = 'ibzy:'+(id||'guest')+':'; }
  const TS = '__ts', DIRTY = '__dirty';
  const meta = k => { try{ return JSON.parse(base.get(prefix+k)||'{}')||{}; }catch(e){ return {}; } };
  const putMeta = (k,v) => base.set(prefix+k, JSON.stringify(v));
  const appKeys = () => base.keys().filter(k=>k.indexOf(prefix)===0).map(k=>k.slice(prefix.length)).filter(k=>k!==TS&&k!==DIRTY);

  function touch(k){
    if(!uid) return;
    const ts=meta(TS); ts[k]=Date.now(); putMeta(TS,ts);
    const d=meta(DIRTY); d[k]=1; putMeta(DIRTY,d);
    schedule();
  }
  const STORE = {
    getItem: k => base.get(prefix+k),
    setItem: (k,v) => { base.set(prefix+k, String(v)); touch(k); },
    removeItem: k => { base.del(prefix+k); touch(k); },
    key: i => appKeys()[i] ?? null,
    get length(){ return appKeys().length; }
  };

  /* ---------- REST sync ---------- */
  async function rest(method, path, body, extra){
    const t = await accessToken();
    const r = await fetch(CFG.supabaseUrl+'/rest/v1/'+path, {method,
      headers: Object.assign({apikey:CFG.supabaseAnonKey, Authorization:'Bearer '+t, 'Content-Type':'application/json'}, extra||{}),
      body: body ? JSON.stringify(body) : undefined});
    if(!r.ok){ let m=''; try{ const j=await r.json(); m=j.message||j.hint||''; }catch(e){} throw new Error(m||('Sync error '+r.status)); }
    if(r.status===204) return null;
    const txt = await r.text(); return txt ? JSON.parse(txt) : null;
  }

  let timer=null, flushing=false, status='';
  function setStatus(s){ status=s; const el=document.getElementById('sync-status'); if(!el) return;
    el.textContent = ({saving:'saving…', synced:'synced ✓', offline:'offline — will retry', guest:'guest · this device only'})[s]||'';
    el.className = 'sync-'+s; }
  function schedule(){ if(!uid) return; setStatus('saving'); clearTimeout(timer); timer=setTimeout(flush, 1200); }

  async function flush(){
    if(!uid || flushing) return;
    const dirty = meta(DIRTY); const keys = Object.keys(dirty);
    if(!keys.length){ setStatus('synced'); return; }
    flushing = true;
    const ts = meta(TS);
    const rows = keys.map(k=>{ const v=base.get(prefix+k); let val=null;
      if(v!==null){ try{ val=JSON.parse(v); }catch(e){ val=v; } }
      return {user_id:uid, key:k, value:val, updated_at:new Date(ts[k]||Date.now()).toISOString()}; });
    try{
      await rest('POST', 'user_state?on_conflict=user_id,key', rows, {Prefer:'resolution=merge-duplicates,return=minimal'});
      const d=meta(DIRTY); keys.forEach(k=>{ if(d[k]===1) delete d[k]; }); putMeta(DIRTY,d);
      setStatus(Object.keys(meta(DIRTY)).length ? 'saving' : 'synced');
    }catch(e){
      console.warn('[ibzy] sync failed', e); setStatus('offline');
      clearTimeout(timer); timer=setTimeout(flush, 15000);
    }finally{
      flushing=false;
      if(Object.keys(meta(DIRTY)).length && status!=='offline'){ clearTimeout(timer); timer=setTimeout(flush, 800); }
    }
  }

  async function pull(){
    const rows = await rest('GET', 'user_state?select=key,value,updated_at') || [];
    const ts = meta(TS), d = meta(DIRTY);
    const remote = {};
    rows.forEach(r=>{ remote[r.key]=r; const rt=Date.parse(r.updated_at);
      if(d[r.key] && (ts[r.key]||0) > rt) return;           // local change is newer: keep it
      if(r.value===null) base.del(prefix+r.key); else base.set(prefix+r.key, JSON.stringify(r.value));
      ts[r.key]=rt; delete d[r.key]; });
    appKeys().forEach(k=>{ if(!remote[k]){ d[k]=1; if(!ts[k]) ts[k]=Date.now(); } });   // local-only keys go up
    putMeta(TS,ts); putMeta(DIRTY,d);
    return rows.length;
  }

  // first sign-in on a device that was used as a guest: carry the guest progress into the account
  function adoptGuestData(){
    const gp='ibzy:guest:';
    const gkeys = base.keys().filter(k=>k.indexOf(gp)===0).map(k=>k.slice(gp.length)).filter(k=>k!==TS&&k!==DIRTY);
    if(!gkeys.length) return 0;
    gkeys.forEach(k=>{ base.set(prefix+k, base.get(gp+k)); touch(k); });
    return gkeys.length;
  }

  /* ---------- UI: sign-in screen ---------- */
  const $ = s => document.querySelector(s);
  function showAuth(msg, isErr){
    const el=$('#auth'); el.hidden=false; $('#app-root').hidden=true;
    const m=$('#auth-msg'); m.textContent=msg||''; m.className = isErr?'auth-err':'auth-ok';
  }
  function busy(on){ document.querySelectorAll('#auth button, #auth input').forEach(b=>b.disabled=on); }
  let authMode='signin';
  function paintAuthMode(){
    $('#auth-name-row').hidden = authMode!=='signup';
    $('#auth-pass-row').hidden = authMode==='forgot';
    $('#auth-go').textContent = ({signin:'Sign in', signup:'Create account', forgot:'Email me a reset link'})[authMode];
    $('#auth-title').textContent = ({signin:'Sign in', signup:'Create your account', forgot:'Reset your password'})[authMode];
    document.querySelectorAll('.auth-switch').forEach(a=>a.hidden = a.dataset.mode===authMode);
  }
  function bindAuth(){
    document.querySelectorAll('.auth-switch').forEach(a=>a.onclick=e=>{ e.preventDefault(); authMode=a.dataset.mode; paintAuthMode(); showAuth(''); });
    $('#auth-form').onsubmit = async e=>{
      e.preventDefault();
      const email=$('#auth-email').value.trim(), pw=$('#auth-pass').value, name=$('#auth-name').value.trim();
      if(!email){ showAuth('Enter your email.',true); return; }
      busy(true);
      try{
        if(authMode==='forgot'){ await authCall('recover?redirect_to='+encodeURIComponent(location.origin+location.pathname),{email}); showAuth('If that email has an account, a reset link is on its way.'); }
        else if(authMode==='signup'){
          if(pw.length<6) throw new Error('Password needs at least 6 characters.');
          const j = await authCall('signup', {email, password:pw, data:{display_name:name}});
          const s = toSession(j);
          if(s){ saveSession(s); return start(); }
          authMode='signin'; paintAuthMode();
          showAuth('Account created. Check your email for a confirmation link, then sign in here.');
        } else {
          const s = toSession(await authCall('token?grant_type=password', {email, password:pw}));
          saveSession(s); return start();
        }
      }catch(err){ showAuth(err.message, true); }
      finally{ busy(false); }
    };
    $('#auth-guest').onclick=()=>{ base.set(MODE_KEY,'guest'); start(); };
    paintAuthMode();
  }

  // returning from an email link: #access_token=...&refresh_token=...&type=signup|recovery|magiclink
  async function consumeHash(){
    const h = location.hash.replace(/^#/,''); if(!h) return null;
    const p = new URLSearchParams(h);
    if(p.get('error_description')){ history.replaceState(null,'',location.pathname+location.search); return {error:p.get('error_description').replace(/\+/g,' ')}; }
    if(!p.get('access_token')) return null;
    history.replaceState(null,'',location.pathname+location.search);
    const u = await authCall('user', null, 'GET', p.get('access_token'));
    saveSession(toSession({access_token:p.get('access_token'), refresh_token:p.get('refresh_token'),
      expires_at:+p.get('expires_at')||0, expires_in:+p.get('expires_in')||3600, user:u}));
    return {type:p.get('type')};
  }
  async function setNewPassword(){
    const pw = prompt('Choose a new password (at least 6 characters):');
    if(!pw) return;
    try{ await authCall('user', {password:pw}, 'PUT', await accessToken()); alert('Password updated.'); }
    catch(e){ alert(e.message); }
  }

  /* ---------- boot ---------- */
  let started=false;
  async function start(){
    if(started) return;
    if(session){
      setUser(session.user.id);
      $('#auth').hidden=true; $('#app-root').hidden=false;
      $('#boot-msg').hidden=false;
      let firstTime=false;
      try{
        const n = await Promise.race([pull(), new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),9000))]);
        if(n===0 && !appKeys().length){ firstTime = adoptGuestData()>0; }
        setStatus(Object.keys(meta(DIRTY)).length?'saving':'synced');
      }catch(e){ console.warn('[ibzy] could not load from server', e); setStatus('offline'); }
      $('#boot-msg').hidden=true;
      started=true; window.bootApp();
      if(Object.keys(meta(DIRTY)).length) schedule();
      if(firstTime) setTimeout(()=>window.toast && toast('Your guest progress on this device was copied into your account'),800);
    } else if(base.get(MODE_KEY)==='guest'){
      setUser(null); $('#auth').hidden=true; $('#app-root').hidden=false;
      started=true; window.bootApp(); setStatus('guest');
    } else {
      showAuth('');
    }
  }

  window.IBZY_STORE = STORE;
  window.IBZY_ACCOUNT = {
    get user(){ return session ? session.user : null; },
    get volatile(){ return VOLATILE; },
    flush,
    async signOut(){
      await flush().catch(()=>{});
      try{ const t=session&&session.access_token; if(t) await fetch(CFG.supabaseUrl+'/auth/v1/logout',{method:'POST',headers:{apikey:CFG.supabaseAnonKey,Authorization:'Bearer '+t}}); }catch(e){}
      saveSession(null); base.del(MODE_KEY); location.reload();
    },
    leaveGuest(){ base.del(MODE_KEY); location.reload(); },
    get status(){ return status; },
    async updateName(name){
      const u = await authCall('user', {data:{display_name:name}}, 'PUT', await accessToken());
      const md=(u&&u.user_metadata)||{}; session.user.name = md.display_name||name; saveSession(session); return session.user.name;
    },
    setNewPassword
  };

  document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='hidden') flush(); });
  window.addEventListener('pagehide', ()=>{ flush(); });

  document.addEventListener('DOMContentLoaded', async ()=>{
    bindAuth();
    let hashRes=null;
    try{ hashRes = await consumeHash(); }catch(e){ hashRes={error:e.message}; }
    if(hashRes && hashRes.error){ showAuth(hashRes.error, true); return; }
    await start();
    if(hashRes && hashRes.type==='recovery') setTimeout(setNewPassword, 400);
  });
})();
