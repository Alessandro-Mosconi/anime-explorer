Anime Explorer

Il numero di versione mostrato nel sito è definito soltanto in version.js.

1. Carica tutti i file nello stesso repository GitHub Pages e ricarica la PWA dopo la pubblicazione.
2. Per collegare una lista MyAnimeList pubblica, apri Impostazioni, inserisci il nome utente MAL e scegli «Sincronizza lista pubblica». La lettura usa Elvarora; non serve un Client ID.
3. Nei filtri scegli Online, La mia lista o Non in lista. La ricerca nella lista usa i dati del catalogo AniList per copertine, voti e generi, anche se la fonte di ricerca generale è MAL. Puoi filtrare per stato personale e con gli altri filtri.
4. In alternativa, importa un export MAL XML o XML.GZ dalle Impostazioni.
5. La lista è conservata localmente nel browser. Una sincronizzazione fallita non sostituisce la lista precedente.
6. «Raggruppa anime per serie» funziona anche per «La mia lista». La classifica AniList analizza il numero di pagine scelto nelle impostazioni; il pulsante successivo verifica altre relazioni. Una nuova sincronizzazione o importazione XML salva anche i voti personali; puoi vederli nelle schede e ordinare per «Mio voto MAL».
7. In «La mia lista» puoi filtrare per 0 episodi, alcuni episodi o tutti gli episodi visti. Aggiorna la lista con una sincronizzazione o un XML per salvare l'avanzamento.
8. «Calendario episodi» mostra solo gli show della lista MAL importata o sincronizzata, con gli orari AniList nel fuso orario del dispositivo. Puoi scegliere la vista mensile o agenda e cambiare mese. Senza lista salvata, il calendario chiede di importarla. Le date future sono più affidabili di quelle passate.
9. La lista MAL è in cima alle Impostazioni. «Notifiche episodi» invia al massimo un riepilogo al giorno per gli episodi della lista quando il browser concede il permesso. Il controllo avviene all'apertura della PWA e mentre è aperta; nei browser che supportano Periodic Background Sync può avvenire anche a PWA chiusa, senza garanzia di puntualità. Richiede HTTPS o localhost e non funziona da file://.
10. Nel raggruppamento AniList, la classifica legge le pagine scelte nelle impostazioni e include nella media le stagioni collegate già note. «Verifica altre stagioni» approfondisce le relazioni, fino a un limite. Il voto minimo e massimo si applicano anche alla media dell'opera. I gruppi ancora parziali sono segnalati e ordinati dopo quelli completi quando ordini per voto. La classifica continua a considerare solo le opere candidate trovate nel campione iniziale.

Cache raggruppamento: solo le ricerche con «Raggruppa anime» salvano pagine, classifiche e relazioni per 6 ore. Le voci scadute vengono eliminate all'apertura e ogni ora mentre il sito resta aperto. In Impostazioni, «Svuota cache del raggruppamento» le elimina senza cancellare la lista MAL. Le ricerche normali chiamano direttamente le API.
