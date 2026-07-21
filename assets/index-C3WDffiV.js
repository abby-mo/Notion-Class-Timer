(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function n(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(r){if(r.ep)return;r.ep=!0;const o=n(r);fetch(r.href,o)}})();const b="notion-quota-timers-v1";function q(){try{const e=localStorage.getItem(b);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}function M(e){localStorage.setItem(b,JSON.stringify(e))}function w(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function k(e){const t=w(e),n=t.getDay(),a=n===0?6:n-1;return t.setDate(t.getDate()-a),t}function A(e){return new Date(e.getFullYear(),e.getMonth(),1)}function g(e,t=new Date){switch(e){case"day":return w(t);case"week":return k(t);case"month":return A(t)}}function O(e,t=new Date){const n=g(e,t);switch(e){case"day":return n.setDate(n.getDate()+1),n;case"week":return n.setDate(n.getDate()+7),n;case"month":return new Date(n.getFullYear(),n.getMonth()+1,1)}}function $(e,t=new Date){const n=g(e.period,t).toISOString();return e.periodStartedAt===n?e:{...e,elapsedMs:0,periodStartedAt:n,runningSince:null}}function h(e,t=Date.now()){const n=e.runningSince?Math.max(0,t-new Date(e.runningSince).getTime()):0;return e.elapsedMs+n}function D(e){const t=Math.max(0,Math.floor(e/1e3)),n=Math.floor(t/3600),a=Math.floor(t%3600/60),r=t%60;return n>0?`${n}h ${String(a).padStart(2,"0")}m`:a>0?`${a}m ${String(r).padStart(2,"0")}s`:`${r}s`}function v(e){const t=Math.round(e/6e4);if(t>=60&&t%60===0)return`${t/60}h`;if(t>=60){const n=Math.floor(t/60),a=t%60;return`${n}h ${a}m`}return`${t}m`}function T(e){switch(e){case"day":return"daily";case"week":return"weekly";case"month":return"monthly"}}function x(){return crypto.randomUUID()}const y=document.querySelector("#app");let i=q().map(e=>$(e));M(i);let u=!1,p;function d(){M(i)}function f(){let e=!1;return i=i.map(t=>{const n=$(t);return n!==t&&(e=!0),n}),e&&d(),e}function I(e){const t=new Date;i=[{id:x(),name:e.name.trim(),targetMs:e.targetMinutes*6e4,period:e.period,elapsedMs:0,periodStartedAt:g(e.period,t).toISOString(),runningSince:null,createdAt:t.toISOString()},...i],d(),u=!1,c()}function F(e){f();const t=new Date;i=i.map(n=>{if(n.id!==e)return n;if(n.runningSince){const a=Math.max(0,t.getTime()-new Date(n.runningSince).getTime());return{...n,elapsedMs:n.elapsedMs+a,runningSince:null}}return{...n,runningSince:t.toISOString()}}),d(),c()}function N(e,t){f(),i=i.map(n=>n.id===e?{...n,elapsedMs:Math.max(0,n.elapsedMs+t*6e4)}:n),d(),c()}function P(e){i=i.map(t=>t.id===e?{...t,elapsedMs:0,runningSince:null}:t),d(),c()}function R(e){i=i.filter(t=>t.id!==e),d(),c()}function Y(){if(f()){c();return}for(const e of i){if(!e.runningSince)continue;const t=y.querySelector(`.timer-card[data-id="${e.id}"]`);if(!t)continue;const n=h(e),a=E(e),r=n>=e.targetMs;t.classList.toggle("is-done",r);const o=t.querySelector(".progress-fill"),s=t.querySelector(".progress-track"),l=t.querySelector(".elapsed");o&&(o.style.width=`${a}%`),s&&s.setAttribute("aria-valuenow",String(Math.round(a))),l&&(l.textContent=D(n))}}function C(){const e=i.some(t=>t.runningSince);e&&p===void 0&&(p=window.setInterval(()=>Y(),1e3)),!e&&p!==void 0&&(clearInterval(p),p=void 0)}function E(e){return e.targetMs<=0?0:Math.min(100,h(e)/e.targetMs*100)}function H(e){const n=O(e.period).getTime()-Date.now();return n<6e4?"resets soon":n<36e5?`resets in ${Math.ceil(n/6e4)}m`:n<864e5?`resets in ${Math.ceil(n/36e5)}h`:`resets in ${Math.ceil(n/864e5)}d`}function U(){return`
    <form class="create-form" id="create-form">
      <label>
        <span>Name</span>
        <input name="name" type="text" placeholder="Meditation" required maxlength="40" autocomplete="off" />
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
  `}function J(e){const t=h(e),n=E(e),a=t>=e.targetMs,r=!!e.runningSince;return`
    <article class="timer-card ${r?"is-running":""} ${a?"is-done":""}" data-id="${e.id}">
      <header class="timer-head">
        <div>
          <h2>${S(e.name)}</h2>
          <p class="meta">${v(e.targetMs)} ${T(e.period)} · ${H(e)}</p>
        </div>
        <button class="icon-btn" data-action="delete" title="Delete" aria-label="Delete ${S(e.name)}">×</button>
      </header>

      <div class="progress-block">
        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(n)}">
          <div class="progress-fill" style="width: ${n}%"></div>
        </div>
        <div class="progress-numbers">
          <span class="elapsed">${D(t)}</span>
          <span class="of">/ ${v(e.targetMs)}</span>
        </div>
      </div>

      <div class="timer-actions">
        <button class="btn primary" data-action="toggle">
          ${r?"Pause":a?"Log more":"Start"}
        </button>
        <button class="btn ghost" data-action="add5" title="Add 5 minutes">+5m</button>
        <button class="btn ghost" data-action="reset" title="Reset this period">Reset</button>
      </div>
    </article>
  `}function S(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function c(){f(),C(),y.innerHTML=`
    <main class="shell">
      <header class="top">
        <div>
          <p class="eyebrow">Quota timers</p>
          <h1>Time budgets</h1>
        </div>
        ${u?"":'<button class="btn primary" id="open-create">New</button>'}
      </header>

      ${u?U():""}

      <section class="list" aria-live="polite">
        ${i.length===0&&!u?'<p class="empty">Add a timer for something you want on a schedule — like 30 minutes of meditation a day, or 3 hours of reading a week.</p>':i.map(J).join("")}
      </section>
    </main>
  `,K()}function K(){var t,n;(t=document.querySelector("#open-create"))==null||t.addEventListener("click",()=>{u=!0,c()}),(n=document.querySelector("#cancel-create"))==null||n.addEventListener("click",()=>{u=!1,c()});const e=document.querySelector("#create-form");e==null||e.addEventListener("submit",a=>{a.preventDefault();const r=new FormData(e),o=String(r.get("name")??""),s=Number(r.get("amount")),l=String(r.get("unit")),m=String(r.get("period"));if(!o||!Number.isFinite(s)||s<=0)return;const L=l==="hours"?s*60:s;I({name:o,targetMinutes:L,period:m})}),y.querySelectorAll(".timer-card").forEach(a=>{var o,s,l,m;const r=a.dataset.id;(o=a.querySelector('[data-action="toggle"]'))==null||o.addEventListener("click",()=>F(r)),(s=a.querySelector('[data-action="add5"]'))==null||s.addEventListener("click",()=>N(r,5)),(l=a.querySelector('[data-action="reset"]'))==null||l.addEventListener("click",()=>P(r)),(m=a.querySelector('[data-action="delete"]'))==null||m.addEventListener("click",()=>{confirm("Delete this timer?")&&R(r)})})}document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(f(),c())});c();
