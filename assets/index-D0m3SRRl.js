(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function n(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(r){if(r.ep)return;r.ep=!0;const a=n(r);fetch(r.href,a)}})();const L="notion-quota-timers-v1";function W(){try{const e=localStorage.getItem(L);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}function O(e){localStorage.setItem(L,JSON.stringify(e))}function F(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function z(e){const t=F(e),n=t.getDay(),o=n===0?6:n-1;return t.setDate(t.getDate()-o),t}function Q(e){return new Date(e.getFullYear(),e.getMonth(),1)}function D(e,t=new Date){switch(e){case"day":return F(t);case"week":return z(t);case"month":return Q(t)}}function X(e,t=new Date){const n=D(e,t);switch(e){case"day":return n.setDate(n.getDate()+1),n;case"week":return n.setDate(n.getDate()+7),n;case"month":return new Date(n.getFullYear(),n.getMonth()+1,1)}}function R(e,t=new Date){const n=D(e.period,t).toISOString();return e.periodStartedAt===n?e:{...e,elapsedMs:0,periodStartedAt:n,runningSince:null}}function v(e,t=Date.now()){const n=e.runningSince?Math.max(0,t-new Date(e.runningSince).getTime()):0;return e.elapsedMs+n}function Z(e){const t=Math.round(e/6e4);if(t>=60&&t%60===0)return`${t/60}h`;if(t>=60){const n=Math.floor(t/60),o=t%60;return`${n}h ${o}m`}return`${t}m`}function ee(e){switch(e){case"day":return"daily";case"week":return"weekly";case"month":return"monthly"}}function te(){return crypto.randomUUID()}const U="notion-quota-theme-color",ne="#7f9a86";function oe(){const e=localStorage.getItem(U);return ae(e)?e:ne}function re(e){localStorage.setItem(U,e)}function M(e){const t=document.documentElement;t.style.setProperty("--accent",e),t.style.setProperty("--accent-deep",q(e,-.18)),t.style.setProperty("--accent-soft",ie(e,.14)),t.style.setProperty("--ring-track",q(e,.78))}function ae(e){return!!(e&&/^#[0-9a-fA-F]{6}$/.test(e))}function _(e){const t=Number.parseInt(e.slice(1),16);return[t>>16&255,t>>8&255,t&255]}function P(e,t,n){return`#${[e,t,n].map(o=>Math.round(o).toString(16).padStart(2,"0")).join("")}`}function q(e,t){const[n,o,r]=_(e);if(t>=0)return P(n+(255-n)*t,o+(255-o)*t,r+(255-r)*t);const a=1+t;return P(n*a,o*a,r*a)}function ie(e,t){const[n,o,r]=_(e);return`rgba(${n}, ${o}, ${r}, ${t})`}let E=null;function se(){return E||(E=new AudioContext),E}async function ce(){try{const e=se();e.state==="suspended"&&await e.resume();const t=e.currentTime;C(e,784,t,.18,.08),C(e,1046.5,t+.16,.28,.07)}catch{}}function C(e,t,n,o,r){const a=e.createOscillator(),i=e.createGain();a.type="sine",a.frequency.value=t,i.gain.setValueAtTime(1e-4,n),i.gain.exponentialRampToValueAtTime(r,n+.02),i.gain.exponentialRampToValueAtTime(1e-4,n+o),a.connect(i),i.connect(e.destination),a.start(n),a.stop(n+o+.02)}const b="https://notion-class-timer-api.abbymoorefl.workers.dev".replace(/\/$/,"")??"";function H(){return!!b}async function le(){if(!b)return[];const e=await fetch(`${b}/tasks`);if(!e.ok){const n=await e.text();throw new Error(n||`Failed to load Notion tasks (${e.status})`)}return(await e.json()).tasks??[]}async function ue(e){if(!b)return;const t=await fetch(`${b}/tasks/${encodeURIComponent(e)}/complete`,{method:"POST"});if(!t.ok){const n=await t.text();throw new Error(n||`Failed to complete Notion task (${t.status})`)}}const I=54,B=2*Math.PI*I,A=document.querySelector("#app");let s=W().map(e=>R(e));O(s);let u=oe();M(u);const $=new Set(s.filter(e=>v(e)>=e.targetMs).map(x));let p=!1,y,h=[],f="idle",N="",k=null;function x(e){return`${e.id}:${e.periodStartedAt}`}function m(){O(s)}function T(){let e=!1;return s=s.map(t=>{const n=R(t);return n!==t&&(e=!0),n}),e&&m(),e}function de(e){const t=new Date;s=[{id:te(),name:e.name.trim(),targetMs:e.targetMinutes*6e4,period:e.period,elapsedMs:0,periodStartedAt:D(e.period,t).toISOString(),runningSince:null,createdAt:t.toISOString(),notionPageId:e.notionPageId},...s],m(),p=!1,l()}function fe(e){T();const t=new Date;s=s.map(n=>{if(n.id!==e)return n;if(n.runningSince){const o=Math.max(0,t.getTime()-new Date(n.runningSince).getTime());return{...n,elapsedMs:n.elapsedMs+o,runningSince:null}}return{...n,runningSince:t.toISOString()}}),m(),l()}async function pe(e){const t=s.find(n=>n.id===e);if(!(!t||k)){k=e,l();try{t.notionPageId&&await ue(t.notionPageId),s=s.filter(n=>n.id!==e),m()}catch(n){const o=n instanceof Error?n.message:"Could not update Notion";alert(`Couldn't mark the Notion task complete.

${o}`)}finally{k=null,l()}}}function me(e){const t=s.find(n=>n.id===e);t&&$.delete(x(t)),s=s.map(n=>n.id===e?{...n,elapsedMs:0,runningSince:null}:n),m(),l()}async function ge(){if(!H()){h=[],f="idle";return}f="loading",N="",l();try{h=await le(),f="ready"}catch(e){h=[],f="error",N=e instanceof Error?e.message:"Failed to load tasks"}l()}function ye(e){const t=x(e);if(!(v(e)>=e.targetMs)){$.delete(t);return}$.has(t)||($.add(t),ce())}function he(e){const t=new Date;s=s.map(n=>{if(n.id!==e||!n.runningSince)return n;const o=Math.max(0,t.getTime()-new Date(n.runningSince).getTime());return{...n,elapsedMs:n.elapsedMs+o,runningSince:null}}),m()}function Se(){if(T()){l();return}let e=!1;for(const t of s){if(!t.runningSince)continue;const n=A.querySelector(`.timer-card[data-id="${t.id}"]`);if(!n)continue;const o=v(t),r=G(t),a=o>=t.targetMs;n.classList.toggle("is-done",a);const i=n.querySelector(".ring-progress"),c=n.querySelector(".clock");i&&(i.style.strokeDashoffset=String(K(r))),c&&(c.textContent=Y(o)),a&&(ye(t),he(t.id),e=!0)}e&&l()}function be(){const e=s.some(t=>t.runningSince);e&&y===void 0&&(y=window.setInterval(()=>Se(),1e3)),!e&&y!==void 0&&(clearInterval(y),y=void 0)}function G(e){return e.targetMs<=0?0:Math.min(100,v(e)/e.targetMs*100)}function K(e){return B*(1-e/100)}function Y(e){const t=Math.max(0,Math.floor(e/1e3)),n=Math.floor(t/3600),o=Math.floor(t%3600/60),r=t%60;return n>0?`${n}:${String(o).padStart(2,"0")}:${String(r).padStart(2,"0")}`:`${String(o).padStart(2,"0")}:${String(r).padStart(2,"0")}`}function ve(e){const n=X(e.period).getTime()-Date.now();return n<6e4?"resets soon":n<36e5?`resets in ${Math.ceil(n/6e4)}m`:n<864e5?`resets in ${Math.ceil(n/36e5)}h`:`resets in ${Math.ceil(n/864e5)}d`}function we(){return H()?f==="loading"?'<p class="form-note">Loading Notion tasks…</p>':f==="error"?`<p class="form-note error">${S(N)}</p>`:`
    <label>
      <span>Notion to-do</span>
      <select name="notionPageId" id="notion-task-select">
        <option value="">None</option>
        ${h.map(t=>`<option value="${S(t.id)}">${S(t.title)}</option>`).join("")}
      </select>
    </label>
  `:`
      <p class="form-note">
        Notion linking is optional. Add <code>VITE_NOTION_API_URL</code> after deploying the worker to connect your to-do database.
      </p>
    `}function $e(){return`
    <form class="create-form" id="create-form">
      ${we()}
      <label>
        <span>Name</span>
        <input name="name" id="timer-name" type="text" placeholder="Meditation" required maxlength="40" autocomplete="off" />
      </label>
      <div class="row">
        <label>
          <span>Target</span>
          <div class="target-input">
            <input name="amount" type="number" min="1" step="1" value="30" required />
            <select name="unit" aria-label="Unit">
              <option value="minutes">minutes</option>
              <option value="hours">hours</option>
            </select>
          </div>
        </label>
        <label>
          <span>Resets</span>
          <select name="period">
            <option value="day">Every day</option>
            <option value="week" selected>Every week</option>
            <option value="month">Every month</option>
          </select>
        </label>
      </div>
      <div class="form-actions">
        <button type="button" class="btn ghost" id="cancel-create">Cancel</button>
        <button type="submit" class="btn primary">Add timer</button>
      </div>
    </form>
  `}function ke(e){const t=v(e),n=G(e),o=t>=e.targetMs,r=!!e.runningSince,a=K(n),i=k===e.id;return`
    <article class="timer-card ${r?"is-running":""} ${o?"is-done":""}" data-id="${e.id}">
      <div class="card-top">
        <h2>${S(e.name)}</h2>
        <p class="meta">
          ${Z(e.targetMs)} ${ee(e.period)}
          ${e.notionPageId?' · <span class="notion-tag">Notion</span>':""}
        </p>
      </div>

      <button class="ring-btn" data-action="toggle" title="${r?"Pause":"Start"}" aria-label="${r?"Pause":"Start"} ${S(e.name)}">
        <svg class="ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle class="ring-track" cx="60" cy="60" r="${I}" />
          <circle
            class="ring-progress"
            cx="60"
            cy="60"
            r="${I}"
            style="stroke-dasharray: ${B}; stroke-dashoffset: ${a}"
          />
        </svg>
        <span class="clock">${Y(t)}</span>
      </button>

      <p class="reset-hint">${ve(e)}</p>

      <div class="card-actions">
        <button class="btn reset" data-action="reset">Reset</button>
        <button class="btn complete" data-action="complete" ${i?"disabled":""}>
          ${i?"Updating Notion…":"Complete goal"}
        </button>
      </div>
    </article>
  `}function S(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function l(){T(),be(),M(u),A.innerHTML=`
    <main class="shell">
      <header class="toolbar">
        <label class="theme-picker" title="Theme color">
          <span class="theme-swatch" style="background: ${u}"></span>
          <input id="theme-color" type="color" value="${u}" aria-label="Theme color" />
        </label>
      </header>

      ${p?$e():""}

      <section class="board" aria-live="polite">
        ${s.length===0&&!p?'<p class="empty">Add a timer for a daily or weekly quota.</p>':s.map(ke).join("")}
        ${p?"":'<button class="add-btn" id="open-create" title="New timer" aria-label="New timer">+</button>'}
      </section>
    </main>
  `,Me()}function Me(){var r,a;const e=document.querySelector("#theme-color");e==null||e.addEventListener("input",()=>{u=e.value,M(u);const i=document.querySelector(".theme-swatch");i&&(i.style.background=u)}),e==null||e.addEventListener("change",()=>{u=e.value,re(u),M(u)}),(r=document.querySelector("#open-create"))==null||r.addEventListener("click",()=>{p=!0,ge(),l()}),(a=document.querySelector("#cancel-create"))==null||a.addEventListener("click",()=>{p=!1,l()});const t=document.querySelector("#notion-task-select"),n=document.querySelector("#timer-name");t==null||t.addEventListener("change",()=>{const i=h.find(c=>c.id===t.value);i&&n&&!n.value.trim()&&(n.value=i.title.slice(0,40))});const o=document.querySelector("#create-form");o==null||o.addEventListener("submit",i=>{i.preventDefault();const c=new FormData(o),g=String(c.get("name")??""),d=Number(c.get("amount")),w=String(c.get("unit")),j=String(c.get("period")),V=String(c.get("notionPageId")??"").trim()||void 0;if(!g||!Number.isFinite(d)||d<=0)return;const J=w==="hours"?d*60:d;de({name:g,targetMinutes:J,period:j,notionPageId:V})}),A.querySelectorAll(".timer-card").forEach(i=>{var g,d,w;const c=i.dataset.id;(g=i.querySelector('[data-action="toggle"]'))==null||g.addEventListener("click",()=>fe(c)),(d=i.querySelector('[data-action="reset"]'))==null||d.addEventListener("click",()=>me(c)),(w=i.querySelector('[data-action="complete"]'))==null||w.addEventListener("click",()=>{pe(c)})})}document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(T(),l())});l();
