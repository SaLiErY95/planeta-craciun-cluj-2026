(() => {
'use strict';
const data = window.PLANETA;
const language = window.PLANETA_I18N || {locale:'ro-RO',messages:{}};
const t = value => language.messages[value] ?? value;
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
let category = 'all', returnFocus, destinationFocus;
const dialog = $('#story-dialog');
function text(tag, value, className) { const el = document.createElement(tag); el.textContent = value; if(className) el.className = className; return el; }
function renderProgram() {
  const target = $('#program-results'), date = $('#program-date').value;
  target.replaceChildren();
  const categoryEvents = data.events.filter(e => category === 'all' || e.categories.includes(category));
  const events = categoryEvents.filter(e => !date || e.date === date);
  if (!events.length) {
    const block = document.createElement('div'); block.className = 'program-empty';
    const image = document.createElement('img'); image.src='assets/snowflake.webp'; image.alt=''; image.width=50; image.height=50;
    block.append(image, text('h3', t(categoryEvents.length ? 'Niciun eveniment pentru selecția ta.' : 'Surprizele sunt în pregătire.')));
    const labels = {all:'Programul complet',music:'Programul muzical',kids:'Programul pentru copii',special:'Momentele speciale'};
    block.append(text('p',categoryEvents.length ? t('Încearcă o altă zi sau o altă categorie.') : `${t(labels[category])}${date ? ' — '+new Date(date+'T12:00:00').toLocaleDateString(language.locale) : ''}. ${t('Program în pregătire. Revino pentru detaliile confirmate.')}`));
    target.append(block);
  } else events.forEach(e => {
    const row=document.createElement('article');row.className='event-row';
    const day=new Date(e.date+'T12:00:00');
    const dateBlock=text('div','','event-date');
    const dateLabel=text('time',day.toLocaleDateString(language.locale,{day:'numeric',month:'long',year:'numeric'}));
    dateLabel.dateTime=e.date;
    dateBlock.append(dateLabel,text('span',day.toLocaleDateString(language.locale,{weekday:'long'}),'event-weekday'));
    const detail=text('div','','event-detail');
    detail.append(text('p',t(e.type==='meeting'?'Întâlnire de poveste':'Atelier'),'event-kind'),text('h3',t(e.title)));
    const venue=text('div','','event-venue');
    venue.append(text('p',t(e.location)),text('p',e.time||t('Oră în curând'),'event-time'));
    row.append(dateBlock,detail,venue);target.append(row);
  });
}
$$('[data-category]').forEach(b => b.addEventListener('click', () => {category=b.dataset.category; $$('[data-category]').forEach(x=>{const on=x===b;x.classList.toggle('active',on);x.setAttribute('aria-pressed',String(on));}); renderProgram();}));
$('#program-date').addEventListener('change',renderProgram);renderProgram();
$$('[data-story]').forEach(b=>b.addEventListener('click',()=>{const story=data.stories[b.dataset.story];if(!story)return;returnFocus=b;const box=$('#dialog-content');box.replaceChildren();if(story.image){const im=document.createElement('img');im.src=`assets/${story.image}.webp`;im.alt='';im.className='dialog-art';box.append(im);}box.append(text('p',t(story.label),'eyebrow'));const h=text('h2',t(story.title));h.id='dialog-title';box.append(h,text('p',t(story.text)),text('p',t(story.note),'dialog-note'));if(story.image){const a=text('a',t('Vezi programul →'),'text-link');a.href='#program';a.addEventListener('click',()=>{destinationFocus=$('#program-title');dialog.close();});box.append(a);}dialog.showModal();}));
$('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{const target=destinationFocus||returnFocus;destinationFocus=null;if(target)target.focus({preventScroll:true});});
const toggle=$('.menu-toggle'),nav=$('#mobile-nav');function closeMenu(){nav.hidden=true;toggle.setAttribute('aria-expanded','false');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';nav.hidden=open;toggle.setAttribute('aria-expanded',String(!open));});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!nav.hidden){closeMenu();toggle.focus();}});document.addEventListener('click',e=>{if(!nav.hidden&&!e.target.closest('.site-header'))closeMenu();});closeMenu();document.documentElement.classList.add('nav-enhanced');const desktopQuery=matchMedia('(min-width: 801px)');desktopQuery.addEventListener('change',e=>{if(e.matches)closeMenu();});
const reduce=matchMedia('(prefers-reduced-motion: reduce)');if('IntersectionObserver' in window&&!reduce.matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.08});$$('.reveal').forEach(el=>{el.classList.add('will-reveal');observer.observe(el);});}
})();
