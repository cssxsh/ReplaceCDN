function isCharacterKeyPress(evt) {
    if (typeof evt.which == "undefined") {
            return true;
        } else if (typeof evt.which == "number" && evt.which > 0) {
            return !evt.ctrlKey && !evt.metaKey && !evt.altKey && evt.which != 8 && evt.key && evt.key.length === 1;
        }
        return false;
    }

    function launchFullscreen(element) {
        if(element.requestFullscreen) {
            element.requestFullscreen();
        } else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if(element.msRequestFullscreen){
            element.msRequestFullscreen();
        } else if(element.webkitRequestFullscreen) {
            element.webkitRequestFullScreen();
        }
    }

    //if you have another AudioContext class use that one, as some browsers have a limit
    let audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);

    //All arguments are optional:

    //duration of the tone in milliseconds. Default is 500
    //frequency of the tone in hertz. default is 440
    //volume of the tone. Default is 1, off is 0.
    //type of tone. Possible values are sine, square, sawtooth, triangle, and custom. Default is sine.
    //callback to use on end of tone
    function beep(duration = 500, frequency = 440, volume = 1.0, type = 0, callback = function () {}) {
        var oscillator = audioCtx.createOscillator();
        var gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (volume){gainNode.gain.value = volume;};
        if (frequency){oscillator.frequency.value = frequency;}
        if (type){oscillator.type = type;}
        if (callback){oscillator.onended = callback;}

        oscillator.start();
        setTimeout(function(){oscillator.stop()}, (duration ? duration : 500));
    };

    setInterval(function() {
        let date = new Date();
        document.getElementById("clock").innerText = date.toTimeString("HH:mm:SS").substring(0, 8);
        date = null;
    }, 500);
    setInterval(function() {
        document.getElementById("load").innerText = ("" + (0.7 + Math.random() * 0.2)).substr(0, 4);
    }, 5000);
    document.onkeydown = function (ev) {
        let pwdString = document.getElementById("pwd").innerText;
        if (ev.key === "Backspace") {
            pwdString = pwdString.substr(1);
        } else if (ev.key == "Enter") {
            pwdString = "";
            beep();
        } else {
            if (isCharacterKeyPress(ev))
                pwdString += "*";
        }
        document.getElementById("pwd").innerText = pwdString;
    };
    document.onclick = function (ev) {
        launchFullscreen(document.documentElement);
    }