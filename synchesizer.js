if (typeof AnoGakki == "undefined") { // load only once
// ++++++++++++++++++++

AnoGakki = function() {};
AnoGakki.isOnWave = typeof gadgets != "undefined";
AnoGakki.simpleNotes = true;
AnoGakki.autoplay_mml = null;
AnoGakki.autoplay_index = 0;
AnoGakki.tonemml = "@0";
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
		ctx.lineWidth = 3;
		ctx.strokeStyle = createColor (c, r * 5);
		ctx.arc(x, y, 0.07 * r * r, 0, 2 * Math.PI, false);
		ctx.stroke();
	} else if (r >= 100) {
		clearTimeout(t);
		t = 0;
	} else {
		ctx.beginPath();
		ctx.strokeStyle = baseColor;
		var i = r - 50;
		ctx.lineWidth = 5;
		ctx.arc(x, y, 0.07 * i * i, 0, 2 * Math.PI, false);
		ctx.stroke();
	}
	if (r < 100)
		var t = setTimeout("rippleArc(" + x + "," + y + "," + (r + 10) + "," + c + ")", 50, false);
}

function rippleRect(x,y,r,c,radius) {
	var ctx = document.getElementById('synchesizer-canvas').getContext('2d');
	isEraser = (r >= 50);

	ctx.beginPath();
	ctx.lineWidth = r < 50 ? 3 : 5;
	ctx.strokeStyle = isEraser ? baseColor : createColor (c, (r * 5));
	var i = r > 50 ? r - 50 : r;
	var i = 0.07 * i * i;
	ctx.translate(x,y);
	ctx.rotate(radius);
	ctx.moveTo(i,i);
	ctx.lineTo(-i,i);
	ctx.lineTo(-i,-i);
	ctx.lineTo(i,-i);
	ctx.lineTo(i,i);
	ctx.stroke();
	ctx.rotate(-radius);
	ctx.translate(-x,-y);

	if (r < 100)
		var t = setTimeout("rippleRect(" + x + "," + y + "," + (r + 10) + "," + c + "," + radius + ")", 50, false);
}

function rippleTriangle(x,y,r,c,radius) {
	var ctx = document.getElementById('synchesizer-canvas').getContext('2d');
	isEraser = (r >= 50);

	ctx.beginPath();
	ctx.lineWidth = r < 50 ? 3 : 5;
	ctx.strokeStyle = isEraser ? baseColor : createColor (c, (r * 5));
	var i = r > 50 ? r - 50 : r;
	var i = 0.12 * i * i;
	ctx.translate(x,y);
	ctx.rotate(radius);
	var v = Math.sqrt(3) * 0.5;
	ctx.moveTo(0, -i);
	ctx.lineTo(i * v, i * v - 0.5 * i);
	ctx.lineTo(-i * v, i * v - 0.5 * i);
	ctx.lineTo(0, -i);
	ctx.stroke();
	ctx.rotate(-radius);
	ctx.translate(-x,-y);

	if (r < 100)
		var t = setTimeout("rippleTriangle(" + x + "," + y + "," + (r + 10) + "," + c + "," + radius + ")", 50, false);
}

function rippleLine(x,y,r,c,radius) {
	var ctx = document.getElementById('synchesizer-canvas').getContext('2d');
	isEraser = (r >= 100);

	ctx.lineWidth = 2 * r / 10;
	ctx.strokeStyle = isEraser ? baseColor : createColor (c, (r * 3)) ;
	ctx.beginPath();
	var deltaX = Math.cos(radius) * 500;
	var deltaY = Math.sin(radius) * 500;
	ctx.moveTo(x + deltaX, y + deltaY);
	ctx.lineTo(x - deltaX, y - deltaY);
	ctx.moveTo(x + deltaX, y + deltaY);
	ctx.lineTo(x - deltaX, y - deltaY);
	ctx.stroke();

	if (r < 100)
		var t = setTimeout("rippleLine(" + x + "," + y + "," + (r + 10) + "," + c + "," + radius + ")", 50, false);
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

    if (AnoGakki.isOnWave)
	  wave.getState().submitDelta({'x': x, 'y': y, 'viewer': wave.getViewer().getId()});
	doPlay(x,y);
}

function doPlay(x,y) {
	switch(Math.floor(Math.random() * 4)) {
	case 0:
		rippleArc(x,y,10, Math.floor(Math.random() * 3));
		break;
	case 1:
		rippleRect(x,y,10, Math.floor(Math.random() * 3), Math.random() * Math.PI);
		break;
	case 2:
		rippleTriangle(x,y,10, Math.floor(Math.random() * 3), Math.random() * Math.PI);
		break;
	case 3:
		rippleLine(x,y,10, Math.floor(Math.random() * 3), Math.random() * Math.PI);
		break;
	}
	var oct = Math.floor (x / 300) + 5;
	var key = getNoteAt(x);
	if (AnoGakki.autoplay_mml != null) {
		var mml = AnoGakki.tonemml + "o5" + AnoGakki.autoplay_mml [AnoGakki.autoplay_index++];
		if (AnoGakki.autoplay_index >= AnoGakki.autoplay_mml.length)
			AnoGakki.autoplay_index = 0;
	}
	else
		var mml = AnoGakki.tonemml + "o" + oct + key + "2";
	SIOPM.compile(mml);
}

function getNoteAt(x) {
	if (AnoGakki.simpleNotes)
		return simple_notes [Math.floor ((x % 300) / (300 / 7))];
	else
		return full_notes [Math.floor ((x % 300) / (300 / 12))];
}

$(document.getElementById('synchesizer-autoplay-mml')).change(function(){
	var mml = document.getElementById('synchesizer-autoplay-mml').value;
	if (mml == "")
		AnoGakki.autoplay_mml = null;
	else
		AnoGakki.autoplay_mml = mml.split (" ");
	AnoGakki.autoplay_index = 0;
});

$(document.getElementById('synchesizer-tone-mml')).change(function(){
	var mml = document.getElementById('synchesizer-tone-mml').value;
	if (mml == "")
		mml = "@0";
	AnoGakki.tonemml = mml;
});

$(document.getElementById('synchesizer-use-full-notes')).change(function(){
	AnoGakki.simpleNotes = !document.getElementById ("synchesizer-use-full-notes").checked;
});

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
