
(()=>{
const root=document.getElementById('pc-drawn-map');
if(!root)return;
const svg=root.querySelector('.christmas-plan');
const t=value=>window.PLANETA_I18N?.messages[value]??value;
const pois=([{"id": "wheel", "n": "01", "name": "Roata panoramică", "x": 488.64, "y": 311.48, "kind": "Atracții", "description": "O perspectivă de poveste asupra târgului. Roata se află lângă statuia lui Matei Corvin."}, {"id": "dome", "n": "02", "name": "Cupola de lumini", "x": 647.89, "y": 351.86, "kind": "Lumini & atmosferă", "description": "Instalația luminoasă din centrul târgului. Un reper pentru întâlniri și fotografii."}, {"id": "santa", "n": "03", "name": "Căsuța Moșului", "x": 599.98, "y": 415.27, "kind": "Ateliere", "description": "Ateliere zilnice pentru cei mici și nu numai. Programul pe zile este disponibil, iar orele se anunță în curând."}, {"id": "stage", "n": "04", "name": "Scena", "x": 772.56, "y": 239.64, "kind": "Spectacole", "description": "Scena este orientată către Căsuța Moșului. Programul spectacolelor va fi anunțat ulterior."}, {"id": "carousel", "n": "05", "name": "Carusel", "x": 640.4, "y": 247.37, "kind": "Atracții", "description": "Un strop de copilărie în zona de nord-est a spațiului de eveniment."}, {"id": "market", "n": "06", "name": "Bunătăți & daruri", "x": 470.6, "y": 441.24, "kind": "Căsuțele târgului", "description": "Băuturi de iarnă, gusturi de sărbătoare și daruri de la artizani, în căsuțele târgului."}, {"id": "vr", "n": "07", "name": "Sanie VR", "x": 695.47, "y": 462.12, "kind": "Atracții", "description": "Sania VR se află în apropierea accesului din sud-vest. Programul și condițiile de participare urmează să fie completate."}, {"id": "wc", "n": "08", "name": "Toalete", "x": 394.49, "y": 113.28, "kind": "Facilități", "description": "Grupul sanitar se află în partea de nord a planului, spre strada Memorandumului."}, {"id": "kids", "n": "09", "name": "Căsuța copiilor", "x": 152.37, "y": 321.32, "kind": "Căsuța 2", "description": "Reperul „Căsuța copiilor” din planul tehnic, la numărul 2. Intrarea A se află la capătul șirurilor de căsuțe, în apropiere. Detaliile activităților se confirmă separat."}]).map(p=>({...p,name:t(p.name),kind:t(p.kind),description:t(p.description)}));
const legend=root.querySelector('.dm-legend');
const [baseX,baseY,baseWidth,baseHeight]=svg.getAttribute('viewBox').trim().split(/[ ,]+/).map(Number);
let selected='santa',zoom=1,cx=baseX+baseWidth/2,cy=baseY+baseHeight/2,drag=null;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function select(id){
 const p=pois.find(p=>p.id===id);if(!p)return;selected=id;
 root.querySelectorAll('.dm-key').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===id)));
 root.querySelectorAll('.drawn-point').forEach(g=>g.classList.toggle('selected',g.dataset.point===id));
 root.querySelector('.dm-detail h3').textContent=p.name;
 root.querySelector('.dm-kind').textContent=p.kind;
 root.querySelector('.dm-description').textContent=p.description;
 const node=root.querySelector('[data-point="'+id+'"] .point-halo');
 if(!reduce&&node?.animate)node.animate([{opacity:.35},{opacity:.12},{opacity:.16}],{duration:650,easing:'ease-out'});
}
function clamp(){const hw=baseWidth/2/zoom,hh=baseHeight/2/zoom;cx=Math.max(baseX+hw,Math.min(baseX+baseWidth-hw,cx));cy=Math.max(baseY+hh,Math.min(baseY+baseHeight-hh,cy));}
function apply(){clamp();svg.setAttribute('viewBox',[cx-baseWidth/2/zoom,cy-baseHeight/2/zoom,baseWidth/zoom,baseHeight/zoom].join(' '));root.dataset.zoomed=String(zoom>1.05);root.querySelector('[data-dm-out]').disabled=zoom<=1;root.querySelector('[data-dm-in]').disabled=zoom>=3;}
pois.forEach(p=>{const b=document.createElement('button');b.type='button';b.className='dm-key cursor-interaction';b.dataset.id=p.id;const n=document.createElement('span');n.textContent=p.n;const name=document.createElement('span');name.textContent=p.name;b.append(n,name);b.addEventListener('click',()=>{select(p.id);if(zoom>1.05){cx=p.x;cy=p.y;apply();}});legend.append(b);});
function scale(next){zoom=Math.min(3,Math.max(1,next));if(zoom===1){cx=baseX+baseWidth/2;cy=baseY+baseHeight/2;}apply();}
root.querySelector('[data-dm-in]').addEventListener('click',()=>scale(zoom*1.45));
root.querySelector('[data-dm-out]').addEventListener('click',()=>scale(zoom/1.45));
root.querySelector('[data-dm-reset]').addEventListener('click',()=>scale(1));
svg.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,cx,cy,moved:false};if(zoom>1.05)svg.setPointerCapture(e.pointerId);});
svg.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)drag.moved=true;if(zoom>1.05&&drag.moved){const bounds=svg.getBoundingClientRect();const ratio=Math.min(bounds.width/(baseWidth/zoom),bounds.height/(baseHeight/zoom));cx=drag.cx-dx/ratio;cy=drag.cy-dy/ratio;apply();}});
svg.addEventListener('pointercancel',()=>drag=null);
svg.addEventListener('pointerup',e=>{const start=drag;drag=null;if(!start||start.moved)return;const matrix=svg.getScreenCTM();if(!matrix)return;const candidates=pois.map(p=>{const q=svg.createSVGPoint();q.x=p.x;q.y=p.y;const a=q.matrixTransform(matrix);return{p,d:Math.hypot(e.clientX-a.x,e.clientY-a.y)};}).sort((a,b)=>a.d-b.d);if(candidates[0]?.d<30)select(candidates[0].p.id);});
select(selected);apply();root.dataset.ready='true';
})();
