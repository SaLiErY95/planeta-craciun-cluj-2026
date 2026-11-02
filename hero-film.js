/** Decorative film: play once when visible, respect motion and data preferences. */
export function canAutoPlay(s) {
  return !s.ended && !s.failed && s.visible && !s.hidden && !s.reduced && !s.saveData;
}

function initHeroFilm() {
  const hero = document.querySelector('.hero');
  const video = document.querySelector('#hero-film');
  if (!hero || !video) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const portrait = matchMedia('(max-width: 560px)');
  const connection = navigator.connection;
  const state = {reduced:reduced.matches,saveData:Boolean(connection?.saveData),ended:false,failed:false,visible:true,hidden:document.hidden};
  let hasSource = false, playPending = false, pendingTime = 0, sourceGeneration = 0;
  video.muted = true;
  function attachSource() {
    if (hasSource) return;
    hasSource = true;
    sourceGeneration += 1;
    playPending = false;
    video.src = portrait.matches ? 'assets/hero-film-mobile.mp4?v=9' : 'assets/hero-film-desktop.mp4?v=9';
    video.preload = 'auto';
    video.load();
  }
  async function play() {
    if (playPending || !canAutoPlay(state)) return;
    attachSource();
    playPending = true;
    const generation = sourceGeneration;
    try { await video.play(); }
    catch { /* Keep the matching poster if the browser refuses autoplay. */ }
    finally {if (generation === sourceGeneration) playPending = false;}
    if (generation === sourceGeneration && !canAutoPlay(state)) video.pause();
  }
  function sync() { if (canAutoPlay(state)) void play(); else video.pause(); }
  video.addEventListener('loadedmetadata',() => {
    if (pendingTime > 0) {video.currentTime=Math.min(pendingTime,Math.max(0,video.duration-.05));pendingTime=0;}
  });
  video.addEventListener('loadeddata',() => {hero.classList.add('film-ready');});
  video.addEventListener('ended',() => {state.ended=true;});
  video.addEventListener('error',() => {state.failed=true;hero.classList.remove('film-ready');});
  document.addEventListener('visibilitychange',() => {state.hidden=document.hidden;sync();});
  reduced.addEventListener('change',event => {state.reduced=event.matches;sync();});
  connection?.addEventListener('change',() => {state.saveData=Boolean(connection.saveData);sync();});
  portrait.addEventListener('change',() => {
    if (!hasSource) return;
    if (video.readyState >= 1) pendingTime=video.currentTime;
    video.pause();hero.classList.remove('film-ready');hasSource=false;attachSource();sync();
  });
  if ('IntersectionObserver' in window) {
    state.visible=false;
    new IntersectionObserver(entries => {state.visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(hero);
  }
  sync();
}
if (typeof document !== 'undefined') initHeroFilm();
