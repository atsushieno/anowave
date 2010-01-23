if (typeof AnoGakki == "undefined") { // load only once
// ++++++++++++++++++++

AnoGakki = function() {};
AnoGakki.isOnWave = typeof gadgets != "undefined";
AnoGakki.simpleNotes = true;
AnoGakki.baseUrl = AnoGakki.isOnWave ? "http://github.com/atsushieno/anowave/raw/master/" : "";

var full_notes = ["c", "c+", "d", "d+", "e", "f", "f+", "g", "g+", "a", "a+", "b"];
var simple_notes = ["c", "d", "e", "f", "g", "a", "b"];
var baseColor = "#000000";

function togglePlay() {
	if (SIOPM.playing) {
		SIOPM.noteOff(61);
	} else {
		SIOPM.noteOn(61);
	}
}

function rippleArc(x,y,r,c) {
	var ctx = document.getElementById('synchesizer-canvas').getContext('2d');
	if (r < 50) {
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = createColor (c, r * 5);
		ctx.arc(x, y, 0.05 * r * r, 0, 2 * Math.PI, false);
		ctx.stroke();
	} else if (r >= 100) {
		clearTimeout(t);
		t = 0;
	} else {
		ctx.beginPath();
		ctx.strokeStyle = baseColor;
		var i = r - 50;
		ctx.lineWidth = 5;
		ctx.arc(x, y, 0.05 * i * i, 0, 2 * Math.PI, false);
		ctx.stroke();
	}
	var t = setTimeout("rippleArc(" + x + "," + y + "," + (r + 10) + "," + c + ")", 50, false);
}

function rippleRect(x,y,r,c) {
	var ctx = document.getElementById('synchesizer-canvas').getContext('2d');
	if (r < 50) {
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = createColor (c, (r * 5));
		var i = 0.1 * r * r;
		ctx.rect(x - 0.5 * i, y - 0.5 * i, i, i);
		ctx.stroke();
	} else if (r >= 100) {
		clearTimeout(t);
		t = 0;
	} else {
		ctx.beginPath();
		ctx.strokeStyle = baseColor;
		var i = r - 50;
		i = 0.1 * i * i;
		ctx.lineWidth = 5;
		ctx.rect(x - 0.5 * i, y - 0.5 * i, i, i);
		ctx.stroke();
	}
	var t = setTimeout("rippleRect(" + x + "," + y + "," + (r + 10) + "," + c + ")", 50, false);
}

function createColor(c, v) {
	switch (c) {
	case 0:
		return "rgb(" + (255 - v) + ", 0, 0)";
	case 1:
		return "rgb(0, " + (255 - v) + ", 0)";
	default:
		return "rgb(0, 0," + (255 - v) + ")";
	}
}

function waveStateCallback() {
	var s = wave.getState();
	if (s.get('viewer') != wave.getViewer().getId()) {
		x = s.get('x');
		y = s.get('y');
		doPlay(x,y);
	}
}

function waveOnLoadCallback() {
	if (wave && wave.isInWaveContainer())
		wave.setStateCallback(waveStateCallback);
}

function canvasMouseDown(ev) {
	var x, y;
	if (ev.layerX || ev.layerX == 0) { // Firefox
		x = ev.layerX;
		y = ev.layerY;
	} else if (ev.offsetX || ev.offsetX == 0) { // Opera
		x = ev.offsetX;
		y = ev.offsetY;
	}

	//wave.getState().submitDelta({'x': x, 'y': y, 'viewer': wave.getViewer().getId()});
	doPlay(x,y);
}

function doPlay(x,y) {
	if (Math.random() > 0.5)
		rippleArc(x,y,10, Math.floor(Math.random() * 3));
	else
		rippleRect(x,y,10, Math.floor(Math.random() * 3));
	
	var oct = Math.floor (x / 300) + 5;
	var key = getNoteAt(x);
	var mml = "@0 o" + oct + key + "2";
	SIOPM.compile(mml);
}

function getNoteAt(x) {
	if (AnoGakki.simpleNotes)
		return simple_notes [Math.floor ((x % 300) / (300 / 7))];
	else
		return full_notes [Math.floor ((x % 300) / (300 / 12))];
}

$(document).ready(function(){
    if (AnoGakki.isOnWave)
      gadgets.util.registerOnLoadHandler(waveOnLoadCallback);

	SIOPM.onLoad = function() { 
	}
	SIOPM.onCompileProgress = function() { 
	}
	SIOPM.onCompileComplete = function() {
		SIOPM.play();
	}
	SIOPM.onStreamStart = function() {
	}
	SIOPM.onError = function(errorMessage) {
		Alert(errorMessage);
	}
	SIOPM.urlSWF = AnoGakki.baseUrl + "siopm.swf";
	SIOPM.initialize();

	var canvas = document.getElementById('synchesizer-canvas');
	canvas.addEventListener('mousedown', canvasMouseDown, false);
	canvas.getContext('2d').fillRect(0, 0, 500, 300);
});


// ++++++++++++++++++++
} // load only once
