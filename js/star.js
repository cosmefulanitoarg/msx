/******************************************************************************/
//ShakaPlayer v0.0.3 (lib v4.1.2)
//(c) 2020 Benjamin Zachey
//related API: https://shaka-player-demo.appspot.com/docs/api/index.html
/******************************************************************************/
function ShakaPlayer() {
    var player = null;
    var playerExtension = null;
    var ready = false;
    var ended = false;
    var error = null;
    var mpd = null;

    var getErrorCategory = function(errorCategory) {
        for (var category in shaka.util.Error.Category) {
            if (shaka.util.Error.Category[category] === errorCategory) {
                return category;
            }
        }
        return "Unknown Category";
    };
    var getErrorName = function(errorCode) {
        for (var code in shaka.util.Error.Code) {
            if (shaka.util.Error.Code[code] === errorCode) {
                return code;
            }
        }
        return "Unknown Error";
    };
    var onLoaded = function() {
        TVXVideoPlugin.debug("Shaka video loaded");
    };
    var onReady = function(event) {
        if (event != null && player != null && !ready) {
            ready = true;
            TVXVideoPlugin.debug("Shaka video ready");
            TVXVideoPlugin.applyVolume();
            TVXVideoPlugin.startPlayback(true);
        }
    };
    var onError = function(event) {
        if (event != null && event.detail != null) {
            event = event.detail;
        }
        if (event != null && event.code != null) {
            TVXVideoPlugin.error("Shaka error: " + getErrorCategory(event.category) + ": " + event.code + ": " + getErrorName(event.code));
        }
    };
    var onEnded = function() {
        if (!ended) {
            ended = true;
            TVXVideoPlugin.debug("Shaka video ended");
            TVXVideoPlugin.stopPlayback();
        }
    };
    this.init = function() {
        shaka.polyfill.installAll();
        if (shaka.Player.isBrowserSupported()) {
            TVXVideoPlugin.setupContentLabel("TV");
            TVXVideoPlugin.hidePlayer();//Hides the player.
            let keys;
            player = document.getElementById("player");
            player.addEventListener("canplay", onReady);
            player.addEventListener("ended", onEnded);
            playerExtension = new shaka.Player(player);
            keys = [TVXServices.urlParams.get("key"),TVXServices.urlParams.get("key2")];
            playerExtension.configure({
              drm: {
                // First value is the key-id, second value is the encryption key
                clearKeys: {
                  [keys[0]] : keys[1]
                }
              },
              preferredAudioLanguage: 'es'
            });
            playerExtension.addEventListener("error", onError);
            error = null;   
            var eventManager = new shaka.util.EventManager();
            eventManager.listen(player, `mediaqualitychanged`, (event) => {
                console.log(event);
                TVXVideoPlugin.setSize(player.videoWidth,player.videoHeight)
            });
        } else {
            error = "Browser is not supported";
        }
    };
    this.ready = function() {
        if (error == null) {
            if (player != null && playerExtension != null) {
                TVXVideoPlugin.debug("Video plugin ready");
                if(mpd == null){
                    mpd = TVXServices.urlParams.get("get");
                }
                if (TVXTools.isFullStr(mpd)) {
                    playerExtension.load(mpd).then(onLoaded).catch(onError);
                } else {
                    TVXVideoPlugin.warn("Shaka URL is missing or empty");
                }
            } else {
                TVXVideoPlugin.error("Shaka player is not initialized");
            }
        } else {
            TVXVideoPlugin.error("Shaka error: " + error);
        }
    };
    this.dispose = function() {
        if (player != null) {
            player.removeEventListener("canplay", onReady);
            player.removeEventListener("ended", onEnded);
            player = null;
        }
        if (playerExtension != null) {
            playerExtension.removeEventListener("error", onError);
            playerExtension.destroy();
            playerExtension = null;
        }
    };
    this.play = function() {
        if (player != null) {
            player.play();
        }
    };
    this.pause = function() {
        if (player != null) {
            player.pause();
        }
    };
    this.stop = function() {
        if (player != null) {
            //Note: Html5 player does not support stop -> use pause
            player.pause();
        }
    };
    this.getDuration = function() {
        if (player != null) {
            return player.duration;
        }
        return 0;
    };
    this.getPosition = function() {
        if (player != null) {
            return player.currentTime;
        }
        return 0;
    };
    this.setPosition = function(position) {
        if (player != null) {
            player.currentTime = position;
        }
    };
    this.setVolume = function(volume) {
        if (player != null) {
            player.volume = volume / 100;
        }
    };
    this.getVolume = function() {
        if (player != null) {
            return player.volume * 100;
        }
        return 100;
    };
    this.setMuted = function(muted) {
        if (player != null) {
            player.muted = muted;
        }
    };
    this.isMuted = function() {
        if (player != null) {
            return player.muted;
        }
        return false;
    };
    this.getSpeed = function() {
        if (player != null) {
            return player.playbackRate;
        }
        return 1;
    };
    this.setSpeed = function(speed) {
        if (player != null) {
            player.playbackRate = speed;
        }
    };
    this.getUpdateData = function() {
        return {
            position: this.getPosition(),
            duration: this.getDuration(),
            speed: this.getSpeed()
        };
    };
}
/******************************************************************************/

/******************************************************************************/
//Setup
/******************************************************************************/
TVXPluginTools.onReady(function() {
    TVXVideoPlugin.setupPlayer(new ShakaPlayer());
    TVXVideoPlugin.init();
});
/******************************************************************************/
