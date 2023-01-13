/******************************************************************************/
//Video.js v0.0.2 (lib v7.20.1)
//(c) 2022 Benjamin Zachey
//related API: https://docs.videojs.com/player
/******************************************************************************/
function VideoJsPlayer() {
    var player = null;
    var ready = false;
    var ended = false;

    var onReady = function() {
        if (player != null && !ready) {
            ready = true;
            TVXVideoPlugin.debug("Video.js ready");
            TVXVideoPlugin.applyVolume();
            TVXVideoPlugin.stopLoading();
            TVXVideoPlugin.startPlayback(true);//Accelerated start
        }
    };
    var getErrorText = function(code) {
        if (code == 1) {
            //The fetching of the associated resource was aborted by the user's request.
            return "Playback Aborted";
        } else if (code == 2) {
            //Some kind of network error occurred which prevented the media from being successfully fetched, despite having previously been available.
            return "Network Error";
        } else if (code == 3) {
            //Despite having previously been determined to be usable, an error occurred while trying to decode the media resource, resulting in an error.
            return "Media Decode Error";
        } else if (code == 4) {
            //The associated resource or media provider object (such as a MediaStream) has been found to be unsuitable.
            return "Source Not Supported";
        }
        return "Unknown Error";
    };
    var getErrorMessage = function(code, message) {
        var msg = code + ": " + getErrorText(code);
        if (TVXTools.isFullStr(message)) {
            msg += ": " + message;
        }
        return msg;
    };
    var onError = function() {
        if (player != null) {
            var error = player.error();
            if (error != null) {
                TVXVideoPlugin.error("Video.js error: " + getErrorMessage(error.code, error.message));
                TVXVideoPlugin.stopLoading();
            }
        }
    };
    var onEnded = function() {
        if (!ended) {
            ended = true;
            TVXVideoPlugin.debug("Video.js ended");
            TVXVideoPlugin.stopPlayback();
        }
    };
    this.init = function() {
        player = videojs("player", {
            //width: TVXVideoPlugin.getWidth(),
            //height: TVXVideoPlugin.getHeight()
            width: window.innerWidth,
            height: window.innerHeight
        });
        player.on("loadedmetadata", onReady);
        player.on("canplay", onReady);
        player.on("error", onError);
        player.on("ended", onEnded);
    };
    this.ready = function() {
        if (player != null) {
            TVXVideoPlugin.debug("Video.js plugin ready");
            var url = TVXServices.urlParams.get("url");
            if (TVXTools.isFullStr(url)) {
                TVXVideoPlugin.startLoading();
                player.ready(function() {
                    player.src({ src: url, type: 'application/dash+xml'});
                });
            } else {
                TVXVideoPlugin.warn("Video.js URL is missing or empty");
            }
        } else {
            TVXVideoPlugin.error("Video.js player is not initialized");
        }
    };
    this.dispose = function() {
        if (player != null) {
            player.dispose();
            player = null;
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
            player.pause();
        }
    };
    this.getDuration = function() {
        if (player != null) {
            return player.duration();
        }
        return 0;
    };
    this.getPosition = function() {
        if (player != null) {
            return player.currentTime();
        }
        return 0;
    };
    this.setPosition = function(position) {
        if (player != null) {
            player.currentTime(position);
        }
    };
    this.setVolume = function(volume) {
        if (player != null) {
            player.volume(volume / 100);
        }
    };
    this.getVolume = function() {
        if (player != null) {
            return player.volume() * 100;
        }
        return 100;
    };
    this.setMuted = function(muted) {
        if (player != null) {
            player.muted(muted);
        }
    };
    this.isMuted = function() {
        if (player != null) {
            return player.muted();
        }
        return false;
    };
    this.getSpeed = function() {
        if (player != null) {
            return player.playbackRate();
        }
        return 1;
    };
    this.setSpeed = function(speed) {
        if (player != null) {
            player.playbackRate(speed);
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
    TVXVideoPlugin.setupPlayer(new VideoJsPlayer());
    TVXVideoPlugin.init();
});
/******************************************************************************/
