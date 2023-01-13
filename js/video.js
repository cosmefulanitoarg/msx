/******************************************************************************/
//ShakaPlayer v0.0.3 (lib v4.1.2)
//(c) 2020 Benjamin Zachey
//related API: https://shaka-player-demo.appspot.com/docs/api/index.html
/******************************************************************************/
function ShakaPlayer() {
    var player = null;
    var body = null;
    var playerExtension = null;
    var ready = false;
    var started = false;
    var ended = false;
    var error = null;
    var waitingForUser = false;
    var readyDelay = new TVXDelay(30000);
    var instance = this;

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
            waitingForUser = false;
            showBody();
            stopLoading();
            TVXVideoPlugin.debug("Shaka video ready");
            TVXVideoPlugin.applyVolume();
            TVXVideoPlugin.startPlayback();//Accelerated start
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
            hideBody();
            TVXVideoPlugin.debug("Shaka video ended");
            TVXVideoPlugin.stopPlayback();
        }
    };
    
    var startLoading = function() {
        TVXVideoPlugin.startLoading();
        readyDelay.start(function() {
            stopLoading();
            TVXVideoPlugin.warn("It looks like the current platform does not support the Twitch video plugin.");
        });
    };
    
    var stopLoading = function() {
        TVXVideoPlugin.stopLoading();
        readyDelay.stop();
    };
    
    var onReady = function() {
        if (player != null && !ready) {
            ready = true;
            waitingForUser = false;
            showBody();
            stopLoading();
            TVXVideoPlugin.debug("Twitch player ready");
            TVXVideoPlugin.applyVolume();
            TVXVideoPlugin.startPlayback();
        }
    };
    
    var getBody = function() {
        if (body == null) {
            body = $("body");
        }
        return body;
    };
    var showBody = function() {
        getBody().css("visibility", "");
    };
    var hideBody = function() {
        getBody().css("visibility", "hidden");
    }
    
    var onPlaying = function() {
        if (player != null) {
            started = true;
            TVXVideoPlugin.setPosition(player.getCurrentTime());//Stop seek timer
        }
    };
    
    this.init = function() {
        hideBody();
    };
    this.ready = function() {
        if (error == null) {
            if (player != null && playerExtension != null) {
                TVXVideoPlugin.debug("Video plugin ready");
                var url = TVXServices.urlParams.get("url");
                if (TVXTools.isFullStr(url)) {
                    playerExtension.load(url).then(onLoaded).catch(onError);
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
    this.dispose = function() {
        if (player != null) {
            player.removeEventListener(Twitch.Player.READY, onReady);
            player.removeEventListener(Twitch.Player.PLAYING, onPlaying);
            player.removeEventListener(Twitch.Player.ENDED, onEnded);
            if (TVXServices.urlParams.getNum("offline", 0) == 1) {
                player.removeEventListener(Twitch.Player.OFFLINE, onEnded);
            }
            player = null;
        }
    };
    this.getState = function() {
        if (player != null) {
            if (player.isPaused()) {
                return TVXVideoState.PAUSED;
            }
            return TVXVideoState.PLAYING;
        }
        return TVXVideoState.STOPPED;
    };
    this.getUpdateState = function() {
        if (ready && !started && !ended && !waitingForUser &&
                TVXVideoPlugin.getState() == TVXVideoState.PLAYING &&
                TVXVideoPlugin.getPosition() == 0 &&
                this.getState() == TVXVideoState.PAUSED) {
            waitingForUser = true;
            return TVXVideoState.PAUSED;
        }
        return null;
    };
    this.getUpdateData = function() {
        return {
            state: this.getUpdateState(),
            position: this.getPosition(),
            duration: this.getDuration(),
            speed: this.getSpeed()
        };
    };
    this.handleData = function(data) {
        handleMessage(data.message);
    };
    this.handleRequest = function(dataId, data, callback) {
        callback(createResponseData(dataId));
    };
    this.ready = function() {
        shaka.polyfill.installAll();
        TVXVideoPlugin.debug("Video plugin ready");
        TVXVideoPlugin.setSeekDelay(10000);
        if (shaka.Player.isBrowserSupported()) {
            startLoading();
            player = document.getElementById("player");
            player.addEventListener(Twitch.Player.READY, onReady);
            player.addEventListener(Twitch.Player.PLAYING, onPlaying);
            player.addEventListener(Twitch.Player.ENDED, onEnded);
            var mpdUrl = 'https://edge-vod03-hr.cvattv.com.ar/live/c6eds/TelefeHD/SA_Live_dash_enc/TelefeHD.mpd';
              var estimator = new shaka.util.EWMABandwidthEstimator();
              var source = new shaka.player.DashVideoSource(mpdUrl, null, estimator);
            playerExtension.addEventListener("error", onError);
            error = null;
        } else {
            error = "Browser is not supported";
        }
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
