(() => {
  'use strict';
  const toggle=document.getElementById('episodeNotifications'),status=document.getElementById('notificationStatus');
  const KEY='animeExplorerEpisodeNotificationsV1',TAG='anime-episode-alerts';
  const supported=typeof Notification!=='undefined'&&'serviceWorker' in navigator&&'indexedDB' in window&&(location.protocol==='https:'||location.hostname==='localhost');
  let enabled=localStorage.getItem(KEY)==='1',registration=null;
  const ids=()=>typeof malList==='undefined'?[]:malList.map(item=>Number(item.id)).filter(id=>id>0);
  const setStatus=text=>{status.textContent=text};

  async function getRegistration(){
    if(!registration)registration=await navigator.serviceWorker.register('./sw.js');
    return registration;
  }

  async function syncBackground(reg) {
    if(!('periodicSync' in reg))return false;
    try{if(enabled&&ids().length)await reg.periodicSync.register(TAG,{minInterval:12*60*60*1000});else await reg.periodicSync.unregister(TAG);return enabled&&ids().length>0}
    catch{return false}
  }

  function checkNow(reg){if(enabled&&ids().length&&reg.active)reg.active.postMessage({type:'check-episode-alerts'})}

  async function apply() {
    toggle.checked=enabled;
    if(!supported){toggle.disabled=true;setStatus('Notifiche disponibili solo nella PWA su HTTPS o localhost, con un browser compatibile.');return}
    if(enabled&&Notification.permission!=='granted'){
      enabled=false;toggle.checked=false;localStorage.removeItem(KEY);
    }
    try{
      await AnimeAlerts.save(enabled,ids());
      const reg=await getRegistration();
      const background=await syncBackground(reg);
      if(!enabled){setStatus('Notifiche disattivate.');return}
      if(!ids().length){setStatus('Notifiche attive. Importa o sincronizza la lista MAL per ricevere gli avvisi.');return}
      setStatus(background?'Notifiche attive. Il browser proverà a controllare anche in background.':'Notifiche attive quando apri o tieni aperta la PWA. Controllo in background non disponibile in questo browser.');
      checkNow(reg);
    }catch(error){setStatus('Notifiche non disponibili: '+error.message)}
  }

  toggle.addEventListener('change',async()=>{
    if(toggle.checked){
      let permission;
      try{permission=await Notification.requestPermission()}catch{permission='denied'}
      if(permission!=='granted'){toggle.checked=false;enabled=false;localStorage.removeItem(KEY);await apply();setStatus('Permesso notifiche non concesso dal browser.');return}
    }
    enabled=toggle.checked;
    if(enabled)localStorage.setItem(KEY,'1');else localStorage.removeItem(KEY);
    await apply();
  });

  window.addEventListener('mal-list-updated',()=>{if(supported)apply()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&registration)checkNow(registration)});
  window.addEventListener('focus',()=>{if(registration)checkNow(registration)});
  setInterval(()=>{if(registration)checkNow(registration)},60*60*1000);
  apply();
})();
