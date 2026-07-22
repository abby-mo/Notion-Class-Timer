(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function n(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(r){if(r.ep)return;r.ep=!0;const o=n(r);fetch(r.href,o)}})();const w="notion-quota-timers-v1";function C(){try{const e=localStorage.getItem(w);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}function D(e){localStorage.setItem(w,JSON.stringify(e))}function E(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function F(e){const t=E(e),n=t.getDay(),a=n===0?6:n-1;return t.setDate(t.getDate()-a),t}function R(e){return new Date(e.getFullYear(),e.getMonth(),1)}function y(e,t=new Date){switch(e){case"day":return E(t);case"week":return F(t);case"month":return R(t)}}function H(e,t=new Date){const n=y(e,t);switch(e){case"day":return n.setDate(n.getDate()+1),n;case"week":return n.setDate(n.getDate()+7),n;case"month":return new Date(n.getFullYear(),n.getMonth()+1,1)}}function T(e,t=new Date){const n=y(e.period,t).toISOString();return e.periodStartedAt===n?e:{...e,elapsedMs:0,periodStartedAt:n,runningSince:null}}function S(e,t=Date.now()){const n=e.runningSince?Math.max(0,t-new Date(e.runningSince).getTime()):0;return e.elapsedMs+n}function U(e){const t=Math.round(e/6e4);if(t>=60&&t%60===0)return`${t/60}h`;if(t>=60){const n=Math.floor(t/60),a=t%60;return`${n}h ${a}m`}return`${t}m`}function Y(e){switch(e){case"day":return"daily";case"week":return"weekly";case"month":return"monthly"}}function _(){return crypto.randomUUID()}const k="notion-quota-theme-color",G="#7f9a86";function B(){const e=localStorage.getItem(k);return j(e)?e:G}function K(e){localStorage.setItem(k,e)}function p(e){const t=document.documentElement;t.style.setProperty("--accent",e),t.style.setProperty("--accent-deep",M(e,-.18)),t.style.setProperty("--accent-soft",J(e,.14)),t.style.setProperty("--ring-track",M(e,.78))}function j(e){return!!(e&&/^#[0-9a-fA-F]{6}$/.test(e))}function x(e){const t=Number.parseInt(e.slice(1),16);return[t>>16&255,t>>8&255,t&255]}function v(e,t,n){return`#${[e,t,n].map(a=>Math.round(a).toString(16).padStart(2,"0")).join("")}`}function M(e,t){const[n,a,r]=x(e);if(t>=0)return v(n+(255-n)*t,a+(255-a)*t,r+(255-r)*t);const o=1+t;return v(n*o,a*o,r*o)}function J(e,t){const[n,a,r]=x(e);return`rgba(${n}, ${a}, ${r}, ${t})`}const h=54,q=2*Math.PI*h,b=document.querySelector("#app");let s=C().map(e=>T(e));D(s);let c=B();p(c);let d=!1,f;function g(){D(s)}function m(){let e=!1;return s=s.map(t=>{const n=T(t);return n!==t&&(e=!0),n}),e&&g(),e}function W(e){const t=new Date;s=[{id:_(),name:e.name.trim(),targetMs:e.targetMinutes*6e4,period:e.period,elapsedMs:0,periodStartedAt:y(e.period,t).toISOString(),runningSince:null,createdAt:t.toISOString()},...s],g(),d=!1,l()}function z(e){m();const t=new Date;s=s.map(n=>{if(n.id!==e)return n;if(n.runningSince){const a=Math.max(0,t.getTime()-new Date(n.runningSince).getTime());return{...n,elapsedMs:n.elapsedMs+a,runningSince:null}}return{...n,runningSince:t.toISOString()}}),g(),l()}function Q(e){s=s.filter(t=>t.id!==e),g(),l()}function V(){if(m()){l();return}for(const e of s){if(!e.runningSince)continue;const t=b.querySelector(`.timer-card[data-id="${e.id}"]`);if(!t)continue;const n=S(e),a=L(e),r=n>=e.targetMs;t.classList.toggle("is-done",r);const o=t.querySelector(".ring-progress"),i=t.querySelector(".clock");o&&(o.style.strokeDashoffset=String(A(a))),i&&(i.textContent=I(n))}}function X(){const e=s.some(t=>t.runningSince);e&&f===void 0&&(f=window.setInterval(()=>V(),1e3)),!e&&f!==void 0&&(clearInterval(f),f=void 0)}function L(e){return e.targetMs<=0?0:Math.min(100,S(e)/e.targetMs*100)}function A(e){return q*(1-e/100)}function I(e){const t=Math.max(0,Math.floor(e/1e3)),n=Math.floor(t/3600),a=Math.floor(t%3600/60),r=t%60;return n>0?`${n}:${String(a).padStart(2,"0")}:${String(r).padStart(2,"0")}`:`${String(a).padStart(2,"0")}:${String(r).padStart(2,"0")}`}function Z(e){const n=H(e.period).getTime()-Date.now();return n<6e4?"resets soon":n<36e5?`resets in ${Math.ceil(n/6e4)}m`:n<864e5?`resets in ${Math.ceil(n/36e5)}h`:`resets in ${Math.ceil(n/864e5)}d`}function ee(){return`
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
  `}function te(e){const t=S(e),n=L(e),a=t>=e.targetMs,r=!!e.runningSince,o=A(n);return`
    <article class="timer-card ${r?"is-running":""} ${a?"is-done":""}" data-id="${e.id}">
      <div class="card-top">
        <h2>${$(e.name)}</h2>
        <p class="meta">${U(e.targetMs)} ${Y(e.period)}</p>
      </div>

      <button class="ring-btn" data-action="toggle" title="${r?"Pause":"Start"}" aria-label="${r?"Pause":"Start"} ${$(e.name)}">
        <svg class="ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle class="ring-track" cx="60" cy="60" r="${h}" />
          <circle
            class="ring-progress"
            cx="60"
            cy="60"
            r="${h}"
            style="stroke-dasharray: ${q}; stroke-dashoffset: ${o}"
          />
        </svg>
        <span class="clock">${I(t)}</span>
      </button>

      <p class="reset-hint">${Z(e)}</p>

      <button class="btn complete" data-action="complete">
        Complete goal
      </button>
    </article>
  `}function $(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function l(){m(),X(),p(c),b.innerHTML=`
    <main class="shell">
      <header class="toolbar">
        <label class="theme-picker" title="Theme color">
          <span class="theme-swatch" style="background: ${c}"></span>
          <input id="theme-color" type="color" value="${c}" aria-label="Theme color" />
        </label>
      </header>

      ${d?ee():""}

      <section class="board" aria-live="polite">
        ${s.length===0&&!d?'<p class="empty">Add a timer for a daily or weekly quota.</p>':s.map(te).join("")}
        ${d?"":'<button class="add-btn" id="open-create" title="New timer" aria-label="New timer">+</button>'}
      </section>
    </main>
  `,ne()}function ne(){var n,a;const e=document.querySelector("#theme-color");e==null||e.addEventListener("input",()=>{c=e.value,p(c);const r=document.querySelector(".theme-swatch");r&&(r.style.background=c)}),e==null||e.addEventListener("change",()=>{c=e.value,K(c),p(c)}),(n=document.querySelector("#open-create"))==null||n.addEventListener("click",()=>{d=!0,l()}),(a=document.querySelector("#cancel-create"))==null||a.addEventListener("click",()=>{d=!1,l()});const t=document.querySelector("#create-form");t==null||t.addEventListener("submit",r=>{r.preventDefault();const o=new FormData(t),i=String(o.get("name")??""),u=Number(o.get("amount")),O=String(o.get("unit")),P=String(o.get("period"));if(!i||!Number.isFinite(u)||u<=0)return;const N=O==="hours"?u*60:u;W({name:i,targetMinutes:N,period:P})}),b.querySelectorAll(".timer-card").forEach(r=>{var i,u;const o=r.dataset.id;(i=r.querySelector('[data-action="toggle"]'))==null||i.addEventListener("click",()=>z(o)),(u=r.querySelector('[data-action="complete"]'))==null||u.addEventListener("click",()=>Q(o))})}document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(m(),l())});l();
