<img src="http://stephaneadamgarnier.com/Popcorntime/assets/img/icons/icon.png" align="" height="120" width="120" >
# Popcorntime
Personal Popcorntime Repo containing wip popcorn ;)
Currently holds two different subdirs/projects:


[popcorn-time-remote-mod](https://github.com/stephaneAG/Popcorntime/tree/master/popcorn-time-remote-mod)
=======================
mod of Popcorntime Remote that fixes/adds fcnalities
- [fixed] streamer functionality, for remote watching from any LAN/WAN device running the remote webapp
- [added] "(un)pause/(un)mute & sync" from PT desktop to PTR when opening/closing the streamer, for cross devices video current time share
- [added] "next on ended", for automatic loading of next video, if any, when the streamer video ends
- [added] "back to streamer", for automatic display of the streamer video when the video has been downloaded on desktop if the streamer was previously shown
- [modded] more 'native-like' layout & behavior ( ex: top menu bar), still wip ( nearly finished on the iPhone )

may be merged to the official repo someday

Available as a [webversion](http://stephaneadamgarnier.com/Popcorntime)

Big thanks to the PTR team behind popcorn-time-remote, the PT team, and MickdeGraaf's ( repo available at [MickdeGraaf's popcorn-time-remote](https://github.com/MickdeGraaf/popcorn-time-remote) )


popcorn-time-mod
================
nothing there, maybe .. come back later ?

#### UPDATE: as the Movies API & the TV shows API are currently done, try the following:
In the settings, change 'https://eztvapi.re/' by 'http://eztvapi.co.za/'  
Also, digg the following links to find more on this ..
https://www.reddit.com/r/PopCornTime/
https://www.reddit.com/r/PopCornTime/comments/3q3ldp/tv_api_workaround/
https://www.reddit.com/r/PopCornTime/comments/3rcn6b/thinking_on_reconstructing_popcorn_time/

#### UPDATE2: since the movies & tv shows API seems still working for the popcorn-time.se version, check those:
R: .se != community version ( but they seem to have opensourced their work, yet NOT on github ? )
the ui, working ( except for the video links ;p ):  http://beta.time4popcorn.com/  
movies scraper:  http://beta.time4popcorn.com/js/scrappers/movies/t4p_movies.js?id=9  
tv scraper:  http://beta.time4popcorn.com/js/scrappers/tv/t4p_tv.js?id=3  

#### UPDATE3: movies & tv shows API are back ! ( & 'll hopefully being easily changeable in the future )
To fix an existing PopcornTime installation on Linux:

- identify the install dir ( ex: /home/<username>/Documents/popcorntime )
- edit /home/<username>/Documents/popcorntime/src/app/lib/providers/yts.js & replace its content by the following:  
http://pastebin.com/raw.php?i=k7dcXgyH
- edit /home/<username>/Documents/popcorntime/src/app/settings.js & replace its content by the following:  
http://pastebin.com/raw.php?i=WK5yBtQ1
- launch PT, & change the value of the "TV Show API Endpoint" setting:
replace "https://eztvapi.re/" by "https://popcorni33hocj37.onion.to" or "https://mi2i2dospijuauxa.onion.to/"
- enjoy some popcorn ;p !

R: 
-[Popcorntime json-rpc API](https://git.popcorntime.io/popcorntime/desktop/blob/master/docs/json-rpc-api.md)
-[Popcorntime API](https://git.popcorntime.io/popcorntime/eztv-api/tree/master)
-[<popcorntimeTV](https://discuss.popcorntime.io/t/popcorntv-bringing-popcorn-time-to-your-apple-tv/38367)
-[PopcorntimeTV on a VPS(RPI!)](https://github.com/OstlerDev/PopcornTV/wiki/Running-PopcornTV-on-a-VPS)

Some threads/links to follow:
-[Popcorntime iOS App thread](https://discuss.popcorntime.io/t/public-beta-stripped-down-popcorn-time-app/36933/59)
-[Popcorntime iOS Design thread](https://discuss.popcorntime.io/t/ios-design-thread/37015)
-[Design preview](https://appetize.io/app/bf9nm1qkaa8ahgvazzw32u5350?device=iphone4s&scale=75&orientation=portrait)
-[Webflix](http://webflix.me/#!tv)
-[Infos](https://discuss.popcorntime.io/t/informative-posts-on-facebook/23374)
-[Popcorntime Git](https://git.popcorntime.io/groups/popcorntime)
