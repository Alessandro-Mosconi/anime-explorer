/* Condiviso dalla pagina e dal service worker: lista e stato delle notifiche. */
(() => {
  'use strict';
  const DB_NAME='animeExplorerEpisodeAlertsV1',STORE='settings';
  const QUERY=`query($page:Int!,$start:Int!,$end:Int!){Page(page:$page,perPage:50){pageInfo{hasNextPage} airingSchedules(airingAt_greater:$start,airingAt_lesser:$end){id episode airingAt media{id idMal title{romaji english}}}}}`;

  function db() {
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open(DB_NAME,1);
      request.onupgradeneeded=()=>request.result.createObjectStore(STORE);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
  }

  async function read() {
    const database=await db();
    return new Promise((resolve,reject)=>{
      const transaction=database.transaction(STORE,'readonly');
      const request=transaction.objectStore(STORE).get('config');
      request.onsuccess=()=>resolve(request.result||{enabled:false,ids:[],lastNotifiedDay:''});
      request.onerror=()=>reject(request.error);
      transaction.oncomplete=()=>database.close();
    });
  }

  async function save(enabled,ids) {
    const previous=await read(),database=await db();
    const config={enabled:!!enabled,ids:enabled?[...new Set(ids.map(Number).filter(id=>id>0))]:[],lastNotifiedDay:previous.lastNotifiedDay||''};
    return new Promise((resolve,reject)=>{
      const transaction=database.transaction(STORE,'readwrite');
      transaction.objectStore(STORE).put(config,'config');
      transaction.oncomplete=()=>{database.close();resolve(config)};
      transaction.onerror=()=>{database.close();reject(transaction.error)};
    });
  }

  async function claim(day) {
    const database=await db();
    return new Promise((resolve,reject)=>{
      const transaction=database.transaction(STORE,'readwrite');
      const store=transaction.objectStore(STORE),request=store.get('config');
      let accepted=false;
      request.onsuccess=()=>{
        const config=request.result;
        if(config?.enabled&&config.lastNotifiedDay!==day){config.lastNotifiedDay=day;store.put(config,'config');accepted=true}
      };
      transaction.oncomplete=()=>{database.close();resolve(accepted)};
      transaction.onerror=()=>{database.close();reject(transaction.error)};
    });
  }

  async function unclaim(day) {
    const database=await db();
    return new Promise((resolve,reject)=>{
      const transaction=database.transaction(STORE,'readwrite');
      const store=transaction.objectStore(STORE),request=store.get('config');
      request.onsuccess=()=>{const config=request.result;if(config?.lastNotifiedDay===day){config.lastNotifiedDay='';store.put(config,'config')}};
      transaction.oncomplete=()=>{database.close();resolve()};
      transaction.onerror=()=>{database.close();reject(transaction.error)};
    });
  }

  async function todayEpisodes(ids) {
    const now=new Date(),start=Math.floor(new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime()/1000)-1;
    const end=Math.floor(new Date(now.getFullYear(),now.getMonth(),now.getDate()+1).getTime()/1000);
    const chosen=new Set(ids),found=[];
    for(let page=1;page<=20;page++){
      let response;
      for(let attempt=0;attempt<3;attempt++){
        response=await fetch('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({query:QUERY,variables:{page,start,end}})});
        if(response.status!==429&&response.status<500)break;
        if(attempt<2){const seconds=Number(response.headers.get('Retry-After'));await new Promise(resolve=>setTimeout(resolve,Number.isFinite(seconds)&&seconds>0?Math.min(seconds*1000,15000):2000*(attempt+1)))}
      }
      if(!response.ok)throw Error('AniList HTTP '+response.status);
      const json=await response.json();if(json.errors?.length)throw Error(json.errors[0].message);
      const result=json.data?.Page;if(!result)throw Error('Risposta AniList incompleta');
      found.push(...(result.airingSchedules||[]).filter(item=>chosen.has(Number(item.media?.idMal))));
      if(!result.pageInfo?.hasNextPage)return found;
    }
    throw Error('Palinsesto giornaliero troppo lungo');
  }

  async function checkToday(registration) {
    if(typeof Notification==='undefined'||Notification.permission!=='granted')return false;
    const config=await read(),ids=config.ids||[];
    if(!config.enabled||!ids.length)return false;
    const now=new Date(),day=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    if(config.lastNotifiedDay===day)return false;
    const episodes=await todayEpisodes(ids);
    if(!episodes.length||!(await claim(day)))return false;
    const names=[...new Set(episodes.map(item=>item.media?.title?.english||item.media?.title?.romaji||'Anime'))];
    const body=names.slice(0,3).join(' · ')+(names.length>3?` · e altri ${names.length-3}`:'');
    try{
      await registration.showNotification(`Episodi in uscita oggi: ${episodes.length}`,{body,icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',tag:'anime-episodes-'+day,data:{url:'./index.html?calendar=1'}});
      return true;
    }catch(error){await unclaim(day);throw error}
  }

  self.AnimeAlerts={read,save,checkToday};
})();
