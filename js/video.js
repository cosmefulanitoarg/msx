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
            if(TVXServices.urlParams.get("key") == null){
                keys = this.getKeys(TVXServices.urlParams.get("get"));
            } else {
                keys = [atob(TVXServices.urlParams.get("key")),atob(TVXServices.urlParams.get("key2"))]
            }
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
        } else {
            error = "Browser is not supported";
        }
    };
    this.ready = function() {
        if (error == null) {
            if (player != null && playerExtension != null) {
                TVXVideoPlugin.debug("Video plugin ready");
                if(mpd == null){
                    if(TVXServices.urlParams.get("name") == "dtv")
                    {
                        mpd = "https://cosmefulanitoarg.github.io/msx/js/mdtv.mpd";
                    } else
                    {
                      mpd = atob(TVXServices.urlParams.get("get"));
                    }
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
    
    this.getKeys = function(getURL) {
        let number,keyId,key;
        if (getURL == "QTNfQ2luZQ==" || getURL == "Rmxvd19NdXNpY19YUA==" || getURL == "QUVIRA==" || getURL == "SG9sYV9UVg==" || getURL == "QVhOSEQ=" || getURL == "TVRWMDA=" || getURL == "V2FybmVySEQ=" || getURL == "R0VOX1RW" || getURL == "Rm94X1Nwb3J0c19QcmVtaXVuX0hE" || getURL == "VHlDU3BvcnQ")
        number = 7;
        else if (getURL == "RVNQTjJfQXJn" || getURL == "RXZlbnRvc18yX0hE" || getURL == "Q2FuYWxfOF9DQkE" || getURL == "MjZfVFZfSEQ" || getURL == "RGlwdXRhZG9zX1RW" || getURL == "QXJnZW50aW5pc2ltYQ" || getURL == "TWV0cm8" || getURL == "QkJDX1dvcmxkX05ld3M" || getURL == "VGhlYXRlcl9IRA==" || getURL == "R2xpdHo=" || getURL == "UXVpZXJvX0hE" || getURL == "RGlzY292ZXJ5X1dvcmxkX0hE" || getURL == "RXVyb2NoYW5uZWw=" || getURL == "RGlzY292ZXJ5X1NjaWVuY2U=" || getURL == "SU5DQUFfVHY=" || getURL == "VFY1X01vbmRl" || getURL == "TVRWX0hpdHM=" || getURL == "TVRWX0hE" || getURL == "Tmlja19Kcg==" || getURL == "VFZfRXNwYW5h" || getURL == "V09CSQ==" || getURL == "Vm9sdmVy" || getURL == "VGVsZXN1cg==" || getURL == "TGlmZXRpbWU=" || getURL == "QW50ZW5hXzM=" || getURL == "UGxheWJveQ==" || getURL == "Rm94X05ld3M=" || getURL == "VHZfQ2hpbGU=" || getURL == "TWFzX0NoaWM=" || getURL == "U3R1ZGlvX1VuaXZlcnNhbA==" || getURL == "SVNBVA==" || getURL == "U3VuX0NoYW5uZWw=" || getURL == "UkFJ" || getURL == "VmVudXM=" || getURL == "Q2FuYWw3" || getURL == "VE5UX1Nwb3J0c19IRA")
                number = 6;
        else if (getURL == "Q2FuYWxfNV9Sb3Nhcmlv" || getURL == "VEVMRUZVVFVST19DNA==" || getURL == "VEVMRUZVVFVST19DNA" || getURL == "U05UX0M0" || getURL == "UlBDX0M0")
            number = 4;
        else
            number = 3;

        mpd = "https://edge-live14-hr.cvattv.com.ar/live/c"+number+"eds/"+atob(getURL)+"/SA_Live_dash_enc/"+atob(getURL)+".mpd";

        if (getURL == "RVNQTjJIRA")
        {
            keyId = "e884b711ab111beb8a7ba1e7bcbdc9bf";
            key = "cb89ee3961599e3e648a5aad60895f34";
        }
        else if (getURL == "VEVMRUZVVFVST19DNA")
        {
                keyId = "5d2731cf8a59b73438ef59d88cd882bf";
                key = "3f412fa6368b7db4903588de695377e1";
        }
        else if (getURL == "UlBDX0M0")
        {
                keyId = "a8093cdcb2d504bd38f16764bd21b6e5";
                key = "bfcf3b033b5f0b5ae020751a6746326f";
        }
        else if (getURL == "U05UX0M0")
        {
                keyId = "9f61dcce871cc41aeb206d05028fc30a";
                key = "9f6248194a3bf5e35b96b194e8624693";
        }
        else if (getURL == "VHlDX0ludGVybmFjaW9uYWw")
        {
                keyId = "58e1ebe75d944f6a98ea67b1c7c0a572";
                key = "1c311b069dbce31ce8e62a6e7e2433eb";
        }
        else if (getURL == "TWV0cm8")
        {
                keyId = "719aa3a5e270c7f69eba374ed80d7986";
                key = "97ac59118cf4cf242e2c31e87cd38e1e";
        }
        else if (getURL == "R0VOX1RW")
        {
                keyId = "49eb924ba998ca7fbbaee30dcef1ecb4";
                key = "6e131b04b2e87598fb588ac205673698";
        }
        else if (getURL == "QkJDX1dvcmxkX05ld3M")
        {
                keyId = "019f72f2091d4cbea59ff8c85b117f86";
                key = "a4eac51195506752f9f63ad24def9c37";
        }
        else if (getURL == "QXJnZW50aW5pc2ltYQ")
        {
                keyId = "a6243f46366445ebbf3117ec27365481";
                key = "81667cdc3bcf19a6a66c0919fa00a20b";
        }
        else if (getURL == "Q2FuYWxfNV9Sb3Nhcmlv")
        {
                keyId = "c61b5ac8e1664bf5b544e92ea2597e1c";
                key = "938437ac25f0a18e04efc1a083489edc";
        }
        else if (getURL == "Q2FuYWxfOF9DQkE")
        {
                keyId = "103ce214b4d04c8eb4dd43670e956dad";
                key = "20e030576b8dc4df0d1c68e16af3bc0f";
        }
        else if (getURL == "RGlwdXRhZG9zX1RW")
        {
                keyId = "9666b195171442afd4551a8de01291a6";
                key = "1c0061df9b4b098e40355167e97cfbf0";
        }
        else if (getURL == "MjZfVFZfSEQ")
        {
                keyId = "e32aaa4b67430b3b51be1efce5a74ac5";
                key = "ad60c5e1d378a97271bf8688f094d092";
        }

        else if (getURL == "RVNQTjJfQXJn")
        {
            keyId = "65a5bfa3c7a72dde60be9b0c7406c8fc";
            key = "0b40ae9f78a7bac3b57ecbf72d3c081e";
        }
        else if (getURL == "RVNQTjM")
        {
            keyId = "f4c9f97e2a36feab0e5077f2b44cbc4e";
            key = "1743cd03dfe3736b2c95da91a783af38";
        }
        else if (getURL == "Rm94U3BvcnRz")
        {
            keyId = "8ad99f6512d50476639052a8fe8a4676";
            key = "5ff3bee4cff05d3400d7ea60fcc93235";
        }
        else if (getURL == "Rm94U3BvcnRzMkhE")
        {
            keyId = "c98ddffc470fe449ae1a8d6492116976";
            key = "5086d370e840010232cf4532b16e197f";
        }
        else if (getURL == "Rm94U3BvcnRzM0hE")
        {
            keyId = "55b47390cf9e4997dae6dac85e057875";
            key = "fa39e855543c5d70f30600d59e5e4c1b";
        }
        else if (getURL == "VHlDU3BvcnQ")
        {
                keyId = "2b21c8fa9a329cce311a4c4a4aa996a1";
                key = "cc23ea1fb32629f9e1f48c8deeae3e5b";
        }
        else if (getURL == "VE5UX0hEX0FyZw")
        {
                keyId = "faad1722a575f4d9ec7b774db63c879c";
                key = "cf0184830344ba36ad2ffef9dd2dd9d0";
        }
        else if (getURL == "VE5UX1Nwb3J0c19IRA")
        {
            keyId = "cfc6585bd311dc5f8815db12270122b6";
            key = "7fdb253bf4a74a3187d85f6f293f5e1a";
        }
        else if (getURL == "Rm94X1Nwb3J0c19QcmVtaXVuX0hE")
        {
            keyId = "0f48f9e79f54b38d619fd25565c4d14b";
            key = "02828e6346a46e61e965202cd8787e3a";
        }
        else if (getURL == "Q2FuYWw3")
        {
                keyId = "cc8c82ac2ec7e9799527c29db7354e81";
                key = "cc4aae173dd2ef17ae26be3f7ae87662";
        }
        else if (getURL == "RGVwb3JUVkhE")
        {
            keyId = "dbd4301ab0af3681be89ccdee78859cc";
            key = "9e33db27eb3e5a15b5bf3b8b33e297cc";
        }
        else if (getURL == "RVNQTkhE")
        {
            keyId = "cc8d44406ed6bf1898ad9f7a2d64f29e";
            key = "fb85d059687ab0fc67805806204edbdf";
        }
        else if (getURL == "VlRWX0hE")
        {
            keyId = "b96960aa715a4e51b7e952e81c99ac8e";
            key = "5bbffc680764dbd63d90b774b3aa0c0a";
        }
        else if (getURL == "QTNfQ2luZQ==")
        {
            keyId = "d6ff881a6f07986a80d6ad6f041b57d4";
            key = "b401c87c2ab11a1a488ee1c474b109ae";
        }
        else if (getURL == "VGhlYXRlcl9IRA==")
        {
            keyId = "5279c05ea51c4dae8e7fa6be88448089";
            key = "b28dfafba4b848dfd5d7c177ebf19108";
        }
        else if (getURL == "R2xpdHo=")
        {
            keyId = "f812ef81d6ce425a8db4012a1ef8b0c1";
            key = "5c2b9791b1074727eb349588e32bdc0a";
        }
        else if (getURL == "UXVpZXJvX0hE")
        {
            keyId = "a354b0c82a3a720c4a6f52ed5a1190f4";
            key = "45a76dcc84f058cfabc8b958d7303b28";
        }
        else if (getURL == "RGlzY292ZXJ5X1dvcmxkX0hE")
        {
            keyId = "34ee94c2263345f7a3a590661264e490";
            key = "56757d656a697ab7a2e5e083b5d21bb5";
        }
        else if (getURL == "RXVyb2NoYW5uZWw=")
        {
            keyId = "6f0fc214d9844a7590f0884d55b44c42";
            key = "b2fe1bb5f9c79035301c328c1e93b0ee";
        }
        else if (getURL == "RGlzY292ZXJ5X1NjaWVuY2U=")
        {
            keyId = "46ba409fb04e40fb86b466d97e3a9588";
            key = "f129fb9b5d213e20e2abe529b8cf2597";
        }
        else if (getURL == "SU5DQUFfVHY=")
        {
            keyId = "d44f40e49d2945c1a3701c0885ff0b00";
            key = "6382b6279087402714b6824688c456df";
        }
        else if (getURL == "Rmxvd19NdXNpY19YUA==")
        {
            keyId = "981576de24909fe105ae84f5faf21d18";
            key = "113e8d2808c1d3da48ad37bdc7a27a9b";
        }
        else if (getURL == "QUVIRA==")
        {
            keyId = "db12035627a4b3d7198b761f36b4a290";
            key = "80ca761a875992ac0e50b0851d5563fe";
        }
        else if (getURL == "VFY1X01vbmRl")
        {
            keyId = "62034ff5988b4787b17cdf6f751a3142";
            key = "b3938f0af28b4c0c082b0d4210e389a0";
        }
        else if (getURL == "SG9sYV9UVg==")
        {
            keyId = "5d759477f0ad1bdef2c6de09e7c275fd";
            key = "82cc6eea185eecc934df95adfbbf9dbc";
        }
        else if (getURL == "TVRWX0hpdHM=")
        {
            keyId = "61008dfc867544cd872de99b1f2b82cf";
            key = "716449756316b91c54803aaa22a2fbf0";
        }
        else if (getURL == "VEVMRUZVVFVST19DNA==")
        {
            keyId = "5d2731cf8a59b73438ef59d88cd882bf";
            key = "3f412fa6368b7db4903588de695377e1";
        }
        else if (getURL == "TVRWX0hE")
        {
            keyId = "0c9eb3ead38a122ac460ad96a8ebfd2e";
            key = "66bfbfa4449eb8bc1bcf7577d5bffaad";
        }
        else if (getURL == "Tmlja19Kcg==")
        {
            keyId = "e824b2277a86fd6adfc40aa948e5064a";
            key = "28da2dbbe8e1a1463bbb23895b922083";
        }
        else if (getURL == "QVhOSEQ=")
        {
            keyId = "03e77b5bbf5135a85d587c5af2f2f730";
            key = "1dd1ab1938a791d03f09eb88478b4880";
        }
        else if (getURL == "TVRWMDA=")
        {
            keyId = "1f0c09ed9e5841cf867ba6eb3cdfd61d";
            key = "802c89c6bae6a245aaafcf40c1986fc1";
        }
        else if (getURL == "VFZfRXNwYW5h")
        {
            keyId = "53e0a3741e2e4ff5843f165b53309088";
            key = "45095caabd9a359cd7ea3910d865d643";
        }
        else if (getURL == "V09CSQ==")
        {
            keyId = "f2e44a719947ebfe37de527a9d6df71e";
            key = "029bddeb08909dd66a80276fc338d692";
        }
        else if (getURL == "Vm9sdmVy")
        {
            keyId = "194e53184a424ce6989ad82c5f28fbc5";
            key = "65d60c5cc4de031172be0a6a51edbdfe";
        }
        else if (getURL == "VGVsZXN1cg==")
        {
            keyId = "5235d8ee29f14ce6b26ea5d828aee77a";
            key = "6bf6bd339e3098babc2ab0b984cd2376";
        }
        else if (getURL == "TGlmZXRpbWU=")
        {
            keyId = "eae51b1d67ff47adac7b6bd3a4b1120a";
            key = "b4d6bb47193f33ffc12379cdc447455d";
        }
        else if (getURL == "U3BhY2U=")
        {
            keyId = "0942e4ecd1bd3567e8f9447f45c20a12";
            key = "efca6264f04cf7373de0c30ec79fe909";
        }
        else if (getURL == "QW50ZW5hXzM=")
        {
            keyId = "1e1ad422a6714482b66fa702c16e50c6";
            key = "4fdf28a0ab91356ca55a75f4e9bf8c92";
        }
        else if (getURL == "UGxheWJveQ==")
        {
            keyId = "8577d81eaf33436d9f1e482360685a7c";
            key = "f608a0ac703cfaaf9442574d9a2b87fb";
        }
        else if (getURL == "Rm94X05ld3M=")
        {
            keyId = "3fe3f31a5e7b48a1b548e9364757ce66";
            key = "32993fc281207fe915f6f1e990957868";
        }
        else if (getURL == "VHZfQ2hpbGU=")
        {
            keyId = "c5d0d76e24844235988f9265619e5fec";
            key = "446b71a6deb806c6f129e25de999d07c";
        }
        else if (getURL == "RGlzY292ZXJ5SEQ=")
        {
            keyId = "c283c84a7af0d7c8b9b612a8fb22a001";
            key = "f45510c721eebd6eaa86a2e16ccbd77d";
        }
        else if (getURL == "RlhIRA==")
        {
            keyId = "9ab9c42c713e0fb5517dc77cc19d6755";
            key = "d8c271b82387e609b6c19e5e79240aff";
        }
        else if (getURL == "TWFzX0NoaWM=")
        {
            keyId = "dac8ff1688994efd898222acdd05cafc";
            key = "22fdf97c7233667518258ed16ccb2545";
        }
        else if (getURL == "U3R1ZGlvX1VuaXZlcnNhbA==")
        {
            keyId = "d9b541e3cd064d569843da42788d4263";
            key = "bba5d26ad5051fb3f2cf7e3dd8a4a7d8";
        }
        else if (getURL == "SVNBVA==")
        {
            keyId = "db764164934a48749a7a01bd015694f3";
            key = "512f3c8869af45e6e5dd1525b6a77867";
        }
        else if (getURL == "V2FybmVySEQ=")
        {
            keyId = "069bd3f0b6c279467e08549f17bf5bd0";
            key = "5afa7e369a6de1093818a85af912a775";
        }
        else if (getURL == "U3VuX0NoYW5uZWw=")
        {
            keyId = "158177692aa3463eae5f4e1f72403e9c";
            key = "1c6c026fba9cf7ecb576c7bedce0ead4";
        }
        else if (getURL == "Q2luZWNhbmFsSEQ=")
        {
            keyId = "6003e92dd0d9f548329015c9e15dd578";
            key = "213cf85cb5f9fe569757004a77e05948";
        }
        else if (getURL == "QU1D")
        {
            keyId = "1fa6a86fd80b6d1425dde74482b5dc9c";
            key = "744c3636d57a651ab444cf9fe5f95b33";
        }
        else if (getURL == "UkFJ")
        {
            keyId = "d214547d7d9a4011a39a899ce6e70071";
            key = "16c2ed0617cf1e123f3af6ea8875a82d";
        }
        else if (getURL == "VmVudXM=")
        {
            keyId = "34237d2ae6684ee7a011f5b9c7c43e6d";
            key = "05d973d987915120e567880f50a422af";
        }
        return [keyId,key];
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
