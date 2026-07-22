(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function n(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(r){if(r.ep)return;r.ep=!0;const o=n(r);fetch(r.href,o)}})();const A="notion-quota-timers-v1";function U(){try{const e=localStorage.getItem(A);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}function k(e){localStorage.setItem(A,JSON.stringify(e))}function q(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function G(e){const t=q(e),n=t.getDay(),a=n===0?6:n-1;return t.setDate(t.getDate()-a),t}function K(e){return new Date(e.getFullYear(),e.getMonth(),1)}function M(e,t=new Date){switch(e){case"day":return q(t);case"week":return G(t);case"month":return K(t)}}function Y(e,t=new Date){const n=M(e,t);switch(e){case"day":return n.setDate(n.getDate()+1),n;case"week":return n.setDate(n.getDate()+7),n;case"month":return new Date(n.getFullYear(),n.getMonth()+1,1)}}function L(e,t=new Date){const n=M(e.period,t).toISOString();return e.periodStartedAt===n?e:{...e,elapsedMs:0,periodStartedAt:n,runningSince:null}}function m(e,t=Date.now()){const n=e.runningSince?Math.max(0,t-new Date(e.runningSince).getTime()):0;return e.elapsedMs+n}function _(e){const t=Math.round(e/6e4);if(t>=60&&t%60===0)return`${t/60}h`;if(t>=60){const n=Math.floor(t/60),a=t%60;return`${n}h ${a}m`}return`${t}m`}function B(e){switch(e){case"day":return"daily";case"week":return"weekly";case"month":return"monthly"}}function V(){return crypto.randomUUID()}const C="notion-quota-theme-color",j="#7f9a86";function J(){const e=localStorage.getItem(C);return z(e)?e:j}function W(e){localStorage.setItem(C,e)}function y(e){const t=document.documentElement;t.style.setProperty("--accent",e),t.style.setProperty("--accent-deep",D(e,-.18)),t.style.setProperty("--accent-soft",Q(e,.14)),t.style.setProperty("--ring-track",D(e,.78))}function z(e){return!!(e&&/^#[0-9a-fA-F]{6}$/.test(e))}function O(e){const t=Number.parseInt(e.slice(1),16);return[t>>16&255,t>>8&255,t&255]}function T(e,t,n){return`#${[e,t,n].map(a=>Math.round(a).toString(16).padStart(2,"0")).join("")}`}function D(e,t){const[n,a,r]=O(e);if(t>=0)return T(n+(255-n)*t,a+(255-a)*t,r+(255-r)*t);const o=1+t;return T(n*o,a*o,r*o)}function Q(e,t){const[n,a,r]=O(e);return`rgba(${n}, ${a}, ${r}, ${t})`}let b=null;function X(){return b||(b=new AudioContext),b}async function Z(){try{const e=X();e.state==="suspended"&&await e.resume();const t=e.currentTime;E(e,784,t,.18,.08),E(e,1046.5,t+.16,.28,.07)}catch{}}function E(e,t,n,a,r){const o=e.createOscillator(),s=e.createGain();o.type="sine",o.frequency.value=t,s.gain.setValueAtTime(1e-4,n),s.gain.exponentialRampToValueAtTime(r,n+.02),s.gain.exponentialRampToValueAtTime(1e-4,n+a),o.connect(s),s.connect(e.destination),o.start(n),o.stop(n+a+.02)}const v=54,I=2*Math.PI*v,w=document.querySelector("#app");let i=U().map(e=>L(e));k(i);let l=J();y(l);const h=new Set(i.filter(e=>m(e)>=e.targetMs).map($));let d=!1,p;function $(e){return`${e.id}:${e.periodStartedAt}`}function f(){k(i)}function S(){let e=!1;return i=i.map(t=>{const n=L(t);return n!==t&&(e=!0),n}),e&&f(),e}function ee(e){const t=new Date;i=[{id:V(),name:e.name.trim(),targetMs:e.targetMinutes*6e4,period:e.period,elapsedMs:0,periodStartedAt:M(e.period,t).toISOString(),runningSince:null,createdAt:t.toISOString()},...i],f(),d=!1,u()}function te(e){S();const t=new Date;i=i.map(n=>{if(n.id!==e)return n;if(n.runningSince){const a=Math.max(0,t.getTime()-new Date(n.runningSince).getTime());return{...n,elapsedMs:n.elapsedMs+a,runningSince:null}}return{...n,runningSince:t.toISOString()}}),f(),u()}function ne(e){i=i.filter(t=>t.id!==e),f(),u()}function re(e){const t=i.find(n=>n.id===e);t&&h.delete($(t)),i=i.map(n=>n.id===e?{...n,elapsedMs:0,runningSince:null}:n),f(),u()}function oe(e){const t=$(e);if(!(m(e)>=e.targetMs)){h.delete(t);return}h.has(t)||(h.add(t),Z())}function ae(e){const t=new Date;i=i.map(n=>{if(n.id!==e||!n.runningSince)return n;const a=Math.max(0,t.getTime()-new Date(n.runningSince).getTime());return{...n,elapsedMs:n.elapsedMs+a,runningSince:null}}),f()}function ie(){if(S()){u();return}let e=!1;for(const t of i){if(!t.runningSince)continue;const n=w.querySelector(`.timer-card[data-id="${t.id}"]`);if(!n)continue;const a=m(t),r=R(t),o=a>=t.targetMs;n.classList.toggle("is-done",o);const s=n.querySelector(".ring-progress"),c=n.querySelector(".clock");s&&(s.style.strokeDashoffset=String(P(r))),c&&(c.textContent=F(a)),o&&(oe(t),ae(t.id),e=!0)}e&&u()}function se(){const e=i.some(t=>t.runningSince);e&&p===void 0&&(p=window.setInterval(()=>ie(),1e3)),!e&&p!==void 0&&(clearInterval(p),p=void 0)}function R(e){return e.targetMs<=0?0:Math.min(100,m(e)/e.targetMs*100)}function P(e){return I*(1-e/100)}function F(e){const t=Math.max(0,Math.floor(e/1e3)),n=Math.floor(t/3600),a=Math.floor(t%3600/60),r=t%60;return n>0?`${n}:${String(a).padStart(2,"0")}:${String(r).padStart(2,"0")}`:`${String(a).padStart(2,"0")}:${String(r).padStart(2,"0")}`}function ce(e){const n=Y(e.period).getTime()-Date.now();return n<6e4?"resets soon":n<36e5?`resets in ${Math.ceil(n/6e4)}m`:n<864e5?`resets in ${Math.ceil(n/36e5)}h`:`resets in ${Math.ceil(n/864e5)}d`}function le(){return`
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
  `}function ue(e){const t=m(e),n=R(e),a=t>=e.targetMs,r=!!e.runningSince,o=P(n);return`
    <article class="timer-card ${r?"is-running":""} ${a?"is-done":""}" data-id="${e.id}">
      <div class="card-top">
        <h2>${x(e.name)}</h2>
        <p class="meta">${_(e.targetMs)} ${B(e.period)}</p>
      </div>

      <button class="ring-btn" data-action="toggle" title="${r?"Pause":"Start"}" aria-label="${r?"Pause":"Start"} ${x(e.name)}">
        <svg class="ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle class="ring-track" cx="60" cy="60" r="${v}" />
          <circle
            class="ring-progress"
            cx="60"
            cy="60"
            r="${v}"
            style="stroke-dasharray: ${I}; stroke-dashoffset: ${o}"
          />
        </svg>
        <span class="clock">${F(t)}</span>
      </button>

      <p class="reset-hint">${ce(e)}</p>

      <div class="card-actions">
        <button class="btn reset" data-action="reset">Reset</button>
        <button class="btn complete" data-action="complete">Complete goal</button>
      </div>
    </article>
  `}function x(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function u(){S(),se(),y(l),w.innerHTML=`
    <main class="shell">
      <header class="toolbar">
        <label class="theme-picker" title="Theme color">
          <span class="theme-swatch" style="background: ${l}"></span>
          <input id="theme-color" type="color" value="${l}" aria-label="Theme color" />
        </label>
      </header>

      ${d?le():""}

      <section class="board" aria-live="polite">
        ${i.length===0&&!d?'<p class="empty">Add a timer for a daily or weekly quota.</p>':i.map(ue).join("")}
        ${d?"":'<button class="add-btn" id="open-create" title="New timer" aria-label="New timer">+</button>'}
      </section>
    </main>
  `,de()}function de(){var n,a;const e=document.querySelector("#theme-color");e==null||e.addEventListener("input",()=>{l=e.value,y(l);const r=document.querySelector(".theme-swatch");r&&(r.style.background=l)}),e==null||e.addEventListener("change",()=>{l=e.value,W(l),y(l)}),(n=document.querySelector("#open-create"))==null||n.addEventListener("click",()=>{d=!0,u()}),(a=document.querySelector("#cancel-create"))==null||a.addEventListener("click",()=>{d=!1,u()});const t=document.querySelector("#create-form");t==null||t.addEventListener("submit",r=>{r.preventDefault();const o=new FormData(t),s=String(o.get("name")??""),c=Number(o.get("amount")),g=String(o.get("unit")),N=String(o.get("period"));if(!s||!Number.isFinite(c)||c<=0)return;const H=g==="hours"?c*60:c;ee({name:s,targetMinutes:H,period:N})}),w.querySelectorAll(".timer-card").forEach(r=>{var s,c,g;const o=r.dataset.id;(s=r.querySelector('[data-action="toggle"]'))==null||s.addEventListener("click",()=>te(o)),(c=r.querySelector('[data-action="reset"]'))==null||c.addEventListener("click",()=>re(o)),(g=r.querySelector('[data-action="complete"]'))==null||g.addEventListener("click",()=>ne(o))})}document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(S(),u())});u();
