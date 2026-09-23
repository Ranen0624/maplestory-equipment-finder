'use strict';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = $('.menu-toggle');
menuButton.addEventListener('click', () => {
 const open = $('.header').classList.toggle('menu-open');
 menuButton.setAttribute('aria-expanded', String(open));
 menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
});
$$('.header nav a').forEach(a => a.addEventListener('click', () => {
 $('.header').classList.remove('menu-open'); menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','메뉴 열기');
}));
const updateProgress = () => {const max=document.documentElement.scrollHeight-innerHeight;$('.scroll-progress').style.width=`${max>0?scrollY/max*100:0}%`;};
addEventListener('scroll',updateProgress,{passive:true});
addEventListener('resize',updateProgress);updateProgress();
if ('IntersectionObserver' in window && !reducedMotion.matches) {
 document.documentElement.classList.add('js-motion');
 const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});
 $$('.reveal').forEach(el=>observer.observe(el));
}
$$('.tool-card').forEach(card=>card.addEventListener('pointermove',event=>{const rect=card.getBoundingClientRect();card.style.setProperty('--mx',`${event.clientX-rect.left}px`);card.style.setProperty('--my',`${event.clientY-rect.top}px`);}));
// Decorative particles; no remote requests, no stored user information.
const canvas=$('#stars'),ctx=canvas.getContext('2d');let particles=[],frameId=0,visible=true,tick=0;
function resizeStars(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:r.width<700?35:72},()=>({x:Math.random()*r.width,y:Math.random()*r.height,r:Math.random()*1.1+.3,phase:Math.random()*Math.PI*2}));}
function drawStars(){frameId=0;if(reducedMotion.matches||document.hidden||!visible)return;const {width,height}=canvas.getBoundingClientRect();ctx.clearRect(0,0,width,height);tick+=.011;for(const p of particles){ctx.beginPath();ctx.fillStyle=`rgba(177,177,238,${.23+(Math.sin(tick+p.phase)+1)*.23})`;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}frameId=requestAnimationFrame(drawStars);}
function restartStars(){if(frameId)cancelAnimationFrame(frameId);drawStars();}
if(ctx){resizeStars();restartStars();addEventListener('resize',resizeStars);document.addEventListener('visibilitychange',restartStars);reducedMotion.addEventListener('change',restartStars);if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;restartStars();}).observe(canvas);}
