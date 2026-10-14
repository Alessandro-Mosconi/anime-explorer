ANIME EXPLORER — PWA PER ANDROID
================================

CONTENUTO
index.html           Interfaccia e ricerche anime
manifest.webmanifest Identità dell'app installabile
sw.js                Cache offline dei file dell'interfaccia
icons/               Icone personalizzate
.nojekyll             Compatibilità con GitHub Pages

INSTALLAZIONE CONSIGLIATA — GITHUB PAGES
1. Estrai lo ZIP sul computer (o sul telefono).
2. Accedi a github.com e crea un repository pubblico, per esempio anime-explorer.
3. Carica TUTTI i file e la cartella icons/ nella radice del repository,
   conservando i nomi e la struttura. Carica anche .nojekyll, se visibile.
4. In GitHub vai in Settings > Pages, Source: Deploy from a branch,
   Branch: main, Folder: / (root), quindi Save.
5. Apri dal Samsung https://TUO-UTENTE.github.io/anime-explorer/
6. In Chrome (Android) tocca il menu ⋮ e scegli "Aggiungi a schermata Home"
   oppure "Installa app", se proposto.
7. Da quel momento avvia Anime Explorer dalla sua icona sulla Home.

COME FUNZIONA
- HTML, CSS, JS e icone sono distribuiti tramite HTTPS e memorizzati nel
  telefono dal Service Worker. Una volta caricata, l'interfaccia può aprirsi offline.
- I dati anime provengono dall'API Tenrai; senza rete o in caso di API non
  raggiungibile, le ricerche non funzionano. Non c'è un backend personale.
- Il pulsante AnimeUnity apre una ricerca Google con "inurl:animeunity".
  Se il titolo include "Season 4", viene trasformato in "4" solo nella query.
- NON viene letto automaticamente il primo URL Google. L'installazione PWA
  non evita CORS né gli avvisi di reindirizzamento di Google.
- Chi pubblica il repository NON deve caricare chiavi API o credenziali.

AGGIORNAMENTI
- Sostituisci i file nel repository; la PWA recupera normalmente la pagina
  più recente quando online. Se cambia sw.js, aumenta il nome CACHE (v2, v3...).
- In presenza di vecchie versioni, chiudi e riapri l'app con connessione.

NOTA
Un file HTML aperto direttamente da Download (file:// o content://) NON può
registrare correttamente il Service Worker e non è equivalente a una PWA
installata da HTTPS. Non basta aprire index.html dal gestore file Android.
