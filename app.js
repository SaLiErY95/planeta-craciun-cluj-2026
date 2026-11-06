(() => {
'use strict';
const data = window.PLANETA;
const language = window.PLANETA_I18N || {locale:'ro-RO',messages:{}};
const t = value => language.messages[value] ?? value;
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
let category = 'music', returnFocus, destinationFocus;
const dialog = $('#story-dialog');
function text(tag, value, className) { const el = document.createElement(tag); el.textContent = value; if(className) el.className = className; return el; }
function eventRow(e) {
  const row=text('article','','event-row'), day=new Date(e.date+'T12:00:00');
  const dateBlock=text('div','','event-date'), dateLabel=text('time',day.toLocaleDateString(language.locale,{day:'numeric',month:'long',year:'numeric'}));
  dateLabel.dateTime=e.date;dateBlock.append(dateLabel,text('span',day.toLocaleDateString(language.locale,{weekday:'long'}),'event-weekday'));
  const detail=text('div','','event-detail');
  detail.append(text('p',t(e.type==='concert'?'Concert':e.type==='meeting'?'Întâlnire de poveste':'Atelier'),'event-kind'),text('h3',e.type==='concert'?e.title:t(e.title)));
  const venue=text('div','','event-venue');venue.append(text('p',t(e.location)),text('p',e.time||t('Oră în curând'),'event-time'));
  row.append(dateBlock,detail,venue);return row;
}
function infoCard(title,description,label) {
  const card=text('article','','agenda-card');if(label)card.append(text('p',t(label),'event-kind'));
  card.append(text('h3',t(title)));if(description)card.append(text('p',t(description)));return card;
}
function renderProgram() {
  const target=$('#program-results'),date=$('#program-date').value,visit=data.visit;
  target.replaceChildren();target.setAttribute('aria-labelledby','tab-'+category);
  target.classList.toggle('concert-grid',category==='music');
  $('#program-days').hidden=category!=='kids';
  $('#program-prev').disabled=!date||date<='2026-11-20';$('#program-next').disabled=!date||date>='2026-12-23';
  let note='Programul se completează pe parcurs. Revino pentru noutăți.';
  if(category==='music') visit.concerts.forEach(e=>target.append(eventRow(e)));
  if(category==='kids') {
    const events=data.events.filter(e=>e.date===date);
    events.forEach(e=>target.append(eventRow(e)));
    if(!events.length)target.append(infoCard('Niciun eveniment pentru selecția ta.','Alege o zi între 20 noiembrie și 23 decembrie.'));
    note='Ateliere pentru cei mici și nu numai, în Căsuța Moșului. Orele vor fi anunțate ulterior.';
  }
  if(category==='special') {
    const show=text('article','','lights-show');
    const figure=document.createElement('figure'),image=document.createElement('img');
    image.src='assets/lights-carols-2025.webp';image.alt=t('Cupola de lumini din Piața Unirii, la ediția 2025');image.width=1280;image.height=1094;image.loading='lazy';
    figure.append(image,text('figcaption',t('Imagine din ediția 2025')));
    const copy=text('div','','lights-copy');copy.append(text('p',t('Cupola de lumini'),'event-kind'),text('h3','LIGHTS & CAROLS SHOW'),text('p',t('Spectacol imersiv de lumini, sincronizat cu o coloană sonoră de colinde.')));
    const times=document.createElement('ul');times.className='show-times';
    visit.showTimes.forEach(value=>times.append(text('li',value)));copy.append(times);show.append(figure,copy);target.append(show);
    const grid=text('div','','agenda-grid');
    const santa=infoCard('Întâlniri cu Moș Crăciun','În Căsuța Moșului. Orele vor fi anunțate ulterior.');
    const dates=document.createElement('ul');dates.className='santa-dates';
    data.events.filter(e=>e.type==='meeting').forEach(e=>{const li=document.createElement('li'),time=text('time',new Date(e.date+'T12:00:00').toLocaleDateString(language.locale,{day:'numeric',month:'long'}));time.dateTime=e.date;li.append(time);dates.append(li);});santa.append(dates);grid.append(santa);
    visit.special.forEach(name=>grid.append(infoCard(name,'Datele și orele vor fi anunțate în curând.')));target.append(grid);
  }
  if(category==='campaigns') {
    const grid=text('div','','agenda-grid');
    grid.append(infoCard('We Help','Daruri pentru copii, în spiritul Crăciunului.','Campanie caritabilă'),infoCard('Capace cu suflet','Bucuria de a face bine, împreună.','Campanie caritabilă'));target.append(grid);
    note='Revenim în curând cu detaliile campaniilor și modul de participare.';
  }
  if(category==='attractions') {
    const grid=text('div','','agenda-grid');
    visit.attractions.forEach(name=>{
      const prices=visit.attractionPrices[name];
      const card=infoCard(name,prices?null:'Tariful va fi anunțat în curând.','Piața Unirii');
      if(prices){const list=text('ul','','attraction-prices');prices.forEach(price=>list.append(text('li',t(price))));card.append(list);}
      grid.append(card);
    });target.append(grid);
    note='Accesul în târg este gratuit. Atracțiile pot avea tarife separate.';
  }
  $('#program-note').textContent=t(note);
}
const tabs=$$('[data-category]');
function selectCategory(button) {
  category=button.dataset.category;
  tabs.forEach(x=>{const on=x===button;x.classList.toggle('active',on);x.setAttribute('aria-selected',String(on));x.tabIndex=on?0:-1;});renderProgram();
}
tabs.forEach((button,index)=>{
  button.addEventListener('click',()=>selectCategory(button));
  button.addEventListener('keydown',event=>{
    let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
    if(next!==undefined){event.preventDefault();tabs[next].focus();selectCategory(tabs[next]);}
  });
});
$('#program-date').addEventListener('change',renderProgram);
for(const [id,delta] of [['program-prev',-1],['program-next',1]]) $('#'+id).addEventListener('click',()=>{
  const input=$('#program-date'),day=new Date(input.value+'T12:00:00Z');if(Number.isNaN(day.getTime()))return;
  day.setUTCDate(day.getUTCDate()+delta);const next=day.toISOString().slice(0,10);if(next>=input.getAttribute('min')&&next<=input.getAttribute('max')){input.value=next;renderProgram();}
});
renderProgram();
$$('[data-story]').forEach(b=>b.addEventListener('click',()=>{const story=data.stories[b.dataset.story];if(!story)return;returnFocus=b;const box=$('#dialog-content');box.replaceChildren();if(story.image){const im=document.createElement('img');im.src=`assets/${story.image}.webp`;im.alt='';im.className='dialog-art';box.append(im);}box.append(text('p',t(story.label),'eyebrow'));const h=text('h2',t(story.title));h.id='dialog-title';box.append(h,text('p',t(story.text)),text('p',t(story.note),'dialog-note'));if(story.image){const a=text('a',t('Vezi programul →'),'text-link');a.href='#program';a.addEventListener('click',()=>{destinationFocus=$('#program-title');dialog.close();});box.append(a);}dialog.showModal();}));
$('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{const target=destinationFocus||returnFocus;destinationFocus=null;if(target)target.focus({preventScroll:true});});
const toggle=$('.menu-toggle'),nav=$('#mobile-nav');function closeMenu(){nav.hidden=true;toggle.setAttribute('aria-expanded','false');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';nav.hidden=open;toggle.setAttribute('aria-expanded',String(!open));});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!nav.hidden){closeMenu();toggle.focus();}});document.addEventListener('click',e=>{if(!nav.hidden&&!e.target.closest('.site-header'))closeMenu();});closeMenu();document.documentElement.classList.add('nav-enhanced');const desktopQuery=matchMedia('(min-width: 801px)');desktopQuery.addEventListener('change',e=>{if(e.matches)closeMenu();});
const reduce=matchMedia('(prefers-reduced-motion: reduce)');if('IntersectionObserver' in window&&!reduce.matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.08});$$('.reveal').forEach(el=>{el.classList.add('will-reveal');observer.observe(el);});}
})();
