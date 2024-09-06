(()=>{"use strict";window.addEventListener("load",(function(){const t=new MutationObserver((function(n){t.disconnect(),n.forEach((function(t){!function(){const t=document.querySelector(".player-section");if(t&&e!==t.innerHTML){const o=document.querySelectorAll(".matchup-row .user"),n=document.querySelectorAll(".matchup-row .user .score");(function(e){document.querySelectorAll(".matchup-player-body-item.in-game-flip").forEach((e=>{e.style.backgroundColor="rgba(255, 255, 255, 0.04)",e.querySelectorAll("*")}));const t=e?e.querySelectorAll(".player-scoring .score"):[];let o=0;for(let n=0;n<t.length;n+=2){const r=parseFloat(t[n].textContent.trim())||0,l=parseFloat(t[n+1].textContent.trim())||0;o=Math.max(o,Math.abs(r-l))}for(let c=0;c<t.length;c+=2){const s=t[c],a=t[c+1],i="-"===s.textContent.trim(),d="-"===a.textContent.trim();let u=i?0:parseFloat(s.textContent),g=d?0:parseFloat(a.textContent);const y=parseFloat((u-g).toFixed(2)),b=Math.abs(y)/o*.15+.05,p=s.closest(".matchup-player-item"),m=a.closest(".matchup-player-item");function f(e){let t=e.toFixed(2);return t.includes(".")?1===t.split(".")[1].length&&(t+="0"):t+=".00",t}p.style.borderRadius=m.style.borderRadius="8px",u<g?(p.style.backgroundColor=`rgba(255, 0, 0, ${b})`,m.style.backgroundColor=`rgba(0, 128, 0, ${b})`):u>g&&(p.style.backgroundColor=`rgba(0, 128, 0, ${b})`,m.style.backgroundColor=`rgba(255, 0, 0, ${b})`),console.log("DIFFERENCE: ",y);const x=`difference-${c}`,C=`difference-${c+1}`;let h=document.querySelector(`#${x}`);h||(h=document.createElement("div"),h.id=x,h.className="score-difference-added",h.style.fontSize="9px",h.style.textAlign="center",h.style.marginTop="3px",s.parentNode.insertBefore(h,s.nextSibling)),h.textContent=y>0?`+${f(y)}`:f(y),h.style.color=y>0?"rgb(4,204,188)":y<0?"rgb(251,44,107)":"white";let S=document.querySelector(`#${C}`);S||(S=document.createElement("div"),S.id=C,S.className="score-difference-added",S.style.fontSize="9px",S.style.textAlign="center",S.style.marginTop="3px",a.parentNode.insertBefore(S,a.nextSibling));let F=parseFloat((g-u).toFixed(2));S.textContent=F>0?`+${f(F)}`:f(F),S.style.color=F<0?"rgb(251,44,107)":F>0?"rgb(4,204,188)":"white"}})(t),function(e,t){console.log("displayScoreDifference function is running");let o=0;!function n(){if(2===e.length&&2===t.length){const e="-"===t[0].textContent.trim(),o="-"===t[1].textContent.trim(),n=(e?0:parseFloat(t[0].textContent))-(o?0:parseFloat(t[1].textContent));let r="";r=n<0?`Losing by ${n.toFixed(2)}`:n>0?`Winning by ${n.toFixed(2)}`:"Tied";let l=document.querySelector("#scoreDifferenceDisplay");l||(l=document.createElement("div"),l.id="scoreDifferenceDisplay",document.body.appendChild(l)),l.textContent=r,l.style.padding="10px",l.style.textAlign="center",l.style.backgroundColor=n<0?"rgba(255, 0, 0, 0.15)":0===n?"rgba(64, 64, 64, 0.15)":"rgba(0, 128, 0, 0.15)",l.style.fontSize="16px",l.style.marginTop="0px",l.style.marginBottom="10px",l.style.borderRadius="8px";const c=document.querySelector(".matchup-row");c&&c.parentNode&&c.parentNode.insertBefore(l,c.nextSibling);const s=document.querySelectorAll(".matchup-owner-item");if(2===s.length){const e=s[0],t=s[1];n<0?(e.style.backgroundColor="rgba(255, 0, 0, 0.15)",t.style.backgroundColor="rgba(0, 128, 0, 0.15)"):n>0?(e.style.backgroundColor="rgba(0, 128, 0, 0.15)",t.style.backgroundColor="rgba(255, 0, 0, 0.15)"):(e.style.backgroundColor="rgba(64, 64, 64, 0.15)",t.style.backgroundColor="rgba(64, 64, 64, 0.15)")}}else o>=1?console.log("Max retries reached, giving up..."):(console.log("Could not find the scores, retrying..."),o++,setTimeout(n,1e3))}()}(o,n),e=t.innerHTML}}()})),o()}));function o(){t.observe(document.body,{childList:!0,characterData:!0,subtree:!0})}o()}));let e=null})();
//# sourceMappingURL=bundle.js.map