(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const query = `query($page:Int!,$start:Int!,$end:Int!){Page(page:$page,perPage:50){pageInfo{hasNextPage} airingSchedules(airingAt_greater:$start,airingAt_lesser:$end){id episode airingAt media{id idMal title{romaji english native} coverImage{medium} siteUrl isAdult}}}}`;
  const monthName = new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'});
  const dayName = new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long'});
  const timeName = new Intl.DateTimeFormat('it-IT',{hour:'2-digit',minute:'2-digit'});
  const cache = new Map();
  let month = new Date(new Date().getFullYear(),new Date().getMonth(),1);
  let mode = 'grid', run = 0, controller = null, events = [], partial = false, loading = false;

  const dateKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const monthKey = date => `${date.getFullYear()}-${date.getMonth()}`;
  const listIds = () => new Set((typeof malList === 'undefined' ? [] : malList).map(item => Number(item.id)).filter(id => id>0));
  const wait = ms => new Promise(resolve => setTimeout(resolve,ms));

  function setMode(next) {
    mode = next;
    $('calendarGrid').classList.toggle('hidden',mode!=='grid');
    $('calendarAgenda').classList.toggle('hidden',mode!=='agenda');
    $('calendarGridMode').setAttribute('aria-pressed',String(mode==='grid'));
    $('calendarAgendaMode').setAttribute('aria-pressed',String(mode==='agenda'));
    render();
  }

  function visibleEvents() {
    const ids = listIds();
    return events.filter(item => item.media && ids.has(Number(item.media.idMal)) && (!$('calendarSfw').checked || !item.media.isAdult));
  }

  function calendarDay(date, items) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'calendar-day';
    if(dateKey(date)===dateKey(new Date()))button.classList.add('today');
    button.setAttribute('aria-label',`${dayName.format(date)}: ${items.length} episodi`);
    const number = document.createElement('span');number.className='calendar-day-number';number.textContent=String(date.getDate());button.append(number);
    items.slice(0,3).forEach(item => {const chip=document.createElement('span');chip.className='calendar-event';chip.textContent=`${timeName.format(new Date(item.airingAt*1000))} · ${item.media.title?.english||item.media.title?.romaji||'Anime'} · ep. ${item.episode}`;button.append(chip)});
    if(items.length>3){const more=document.createElement('span');more.className='calendar-more';more.textContent=`+${items.length-3} altri`;button.append(more)}
    if(items.length)button.addEventListener('click',()=>{setMode('agenda');document.getElementById('agenda-'+dateKey(date))?.scrollIntoView({behavior:'smooth',block:'start'})});
    return button;
  }

  function renderSkeleton() {
    const grid=document.createDocumentFragment();
    for(const label of ['Lun','Mar','Mer','Gio','Ven','Sab','Dom']){const head=document.createElement('span');head.className='calendar-weekday';head.textContent=label;grid.append(head)}
    const start=(month.getDay()+6)%7,days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    for(let i=0;i<start;i++){const blank=document.createElement('span');blank.className='calendar-day empty';blank.setAttribute('aria-hidden','true');grid.append(blank)}
    for(let day=1;day<=days;day++){
      const cell=document.createElement('div');cell.className='calendar-day calendar-skeleton-day';cell.setAttribute('aria-hidden','true');
      const number=document.createElement('span');number.className='calendar-day-number';number.textContent=String(day);cell.append(number);
      for(let i=0;i<2;i++){const bar=document.createElement('span');bar.className='calendar-skeleton-bar';cell.append(bar)}
      grid.append(cell);
    }
    $('calendarGrid').replaceChildren(grid);
    const agenda=document.createDocumentFragment();
    for(let i=0;i<4;i++){
      const row=document.createElement('div');row.className='agenda-day calendar-skeleton-agenda';row.setAttribute('aria-hidden','true');
      for(let j=0;j<2;j++){const bar=document.createElement('span');bar.className='calendar-skeleton-bar';row.append(bar)}
      agenda.append(row);
    }
    $('calendarAgenda').replaceChildren(agenda);
  }

  function render() {
    $('calendarMonth').textContent=monthName.format(month);
    $('calendarGrid').setAttribute('aria-busy',String(loading));
    $('calendarAgenda').setAttribute('aria-busy',String(loading));
    $('calendarStatus').classList.toggle('calendar-loading',loading);
    if(!listIds().size){$('calendarGrid').replaceChildren();$('calendarAgenda').replaceChildren();return}
    if(loading){renderSkeleton();return}
    const byDay = new Map();
    for(const item of visibleEvents()) {const key=dateKey(new Date(item.airingAt*1000));if(!byDay.has(key))byDay.set(key,[]);byDay.get(key).push(item)}
    const grid=document.createDocumentFragment();
    for(const label of ['Lun','Mar','Mer','Gio','Ven','Sab','Dom']){const head=document.createElement('span');head.className='calendar-weekday';head.textContent=label;grid.append(head)}
    const start=(month.getDay()+6)%7;
    for(let i=0;i<start;i++){const blank=document.createElement('span');blank.className='calendar-day empty';blank.setAttribute('aria-hidden','true');grid.append(blank)}
    const days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    for(let day=1;day<=days;day++){const date=new Date(month.getFullYear(),month.getMonth(),day);grid.append(calendarDay(date,byDay.get(dateKey(date))||[]))}
    $('calendarGrid').replaceChildren(grid);
    const agenda=document.createDocumentFragment();
    for(let day=1;day<=days;day++){
      const date=new Date(month.getFullYear(),month.getMonth(),day),items=byDay.get(dateKey(date));if(!items?.length)continue;
      const section=document.createElement('section');section.className='agenda-day';section.id='agenda-'+dateKey(date);
      const title=document.createElement('h3');title.textContent=dayName.format(date);section.append(title);
      for(const item of items){
        const row=document.createElement('div');row.className='agenda-event';
        const image=document.createElement('img');image.loading='lazy';image.alt='';image.src=item.media.coverImage?.medium||'./icons/icon-192.png';row.append(image);
        const body=document.createElement('div');body.className='agenda-event-body';
        const link=document.createElement('a');link.className='agenda-event-title';link.href=`https://anilist.co/anime/${item.media.id}`;link.target='_blank';link.rel='noopener noreferrer';link.textContent=item.media.title?.english||item.media.title?.romaji||item.media.title?.native||'Anime';body.append(link);
        const meta=document.createElement('span');meta.className='agenda-event-meta';meta.textContent=`${timeName.format(new Date(item.airingAt*1000))} · Episodio ${item.episode}${item.media.idMal && (typeof malList !== 'undefined') && malList.some(entry=>Number(entry.id)===Number(item.media.idMal))?' · Nella mia lista':''}`;body.append(meta);row.append(body);section.append(row);
      }
      agenda.append(section);
    }
    if(!agenda.childNodes.length){const empty=document.createElement('p');empty.className='agenda-empty';empty.textContent=listIds().size?events.length?'Nessun episodio della tua lista MAL è in programma questo mese.':'Nessun episodio programmato per questo mese.':'Importa o sincronizza la tua lista MAL per vedere il calendario.';agenda.append(empty)}
    $('calendarAgenda').replaceChildren(agenda);
    const count=[...byDay.values()].reduce((sum,items)=>sum+items.length,0);
    if(events.length)$('calendarStatus').textContent=`${count} episodi della tua lista MAL questo mese${partial?' · risultati parziali: troppe pagine di palinsesto':''}.`;
  }

  async function fetchMonth(signal,token) {
    const start=Math.floor(month.getTime()/1000)-1,end=Math.floor(new Date(month.getFullYear(),month.getMonth()+1,1).getTime()/1000);
    const all=[];let hasNext=true,page=1;
    while(hasNext && page<=30){
      if(token!==run)return null;
      $('calendarStatus').textContent=`Caricamento calendario · pagina ${page}…`;
      let response;
      for(let attempt=0;attempt<3;attempt++){
        response=await fetch('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({query,variables:{page,start,end}}),signal});
        if(response.status!==429 && response.status<500)break;
        if(attempt===2)break;
        const retry=Number(response.headers.get('Retry-After'));
        await wait(Number.isFinite(retry)&&retry>0?Math.min(retry*1000,30000):2500*(attempt+1));
      }
      if(!response.ok)throw Error('AniList HTTP '+response.status);
      const json=await response.json();if(json.errors?.length)throw Error(json.errors[0].message);
      const result=json.data?.Page;if(!result)throw Error('Risposta AniList incompleta');
      all.push(...(result.airingSchedules||[]));hasNext=!!result.pageInfo?.hasNextPage;page++;
      if(token!==run)return null;
      if(hasNext)await wait(450);
    }
    return {events:[...new Map(all.map(item=>[item.id,item])).values()].sort((a,b)=>a.airingAt-b.airingAt),partial:hasNext};
  }

  async function loadMonth() {
    if(controller)controller.abort();controller=new AbortController();const token=++run;
    const hasList=listIds().size>0;$('calendarImport').classList.toggle('hidden',hasList);
    const key=monthKey(month),cached=cache.get(key),freshCache=cached&&Date.now()-cached.at<30*60*1000;
    events=[];partial=false;loading=hasList&&!freshCache;render();
    if(!hasList){$('calendarStatus').textContent='Importa o sincronizza la tua lista MAL dalle Impostazioni per vedere gli episodi in uscita.';return}
    if(freshCache){events=cached.events;partial=cached.partial;render();if(!events.length)$('calendarStatus').textContent='Nessun episodio programmato per questo mese.';return}
    $('calendarStatus').textContent='Caricamento calendario…';
    try{const data=await fetchMonth(controller.signal,token);if(token!==run||!data)return;events=data.events;partial=data.partial;loading=false;cache.set(key,{...data,at:Date.now()});render();if(!events.length)$('calendarStatus').textContent='Nessun episodio programmato per questo mese.'}
    catch(error){if(error.name==='AbortError'||token!==run)return;loading=false;render();$('calendarStatus').textContent='Calendario non disponibile: '+error.message+'. Riprova cambiando mese.'}
  }

  $('openCalendar').addEventListener('click',()=>{document.body.classList.add('calendar-active');$('searchView').classList.add('hidden');$('calendarView').classList.remove('hidden');$('openCalendar').setAttribute('aria-expanded','true');loadMonth();window.scrollTo({top:0,behavior:'smooth'})});
  $('closeCalendar').addEventListener('click',()=>{document.body.classList.remove('calendar-active');$('searchView').classList.remove('hidden');$('calendarView').classList.add('hidden');$('openCalendar').setAttribute('aria-expanded','false');if(controller)controller.abort();run++;window.scrollTo({top:0,behavior:'smooth'})});
  $('calendarPrev').addEventListener('click',()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);loadMonth()});
  $('calendarNext').addEventListener('click',()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);loadMonth()});
  $('calendarToday').addEventListener('click',()=>{const today=new Date();month=new Date(today.getFullYear(),today.getMonth(),1);loadMonth()});
  $('calendarGridMode').addEventListener('click',()=>setMode('grid'));
  $('calendarAgendaMode').addEventListener('click',()=>setMode('agenda'));
  $('calendarImport').addEventListener('click',()=>$('openSettings').click());
  window.addEventListener('mal-list-updated',()=>{if(document.body.classList.contains('calendar-active'))loadMonth()});
  $('calendarSfw').addEventListener('change',render);
  if(new URLSearchParams(location.search).get('calendar')==='1')$('openCalendar').click();
})();
