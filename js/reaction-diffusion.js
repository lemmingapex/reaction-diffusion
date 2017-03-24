// contains some intersting/pretty settings for the tool
_presets = {
	Zeus: {
		feed: 0.021,
		kill: 0.055,
		colorA: "#adde83",
		colorB: "#171a4a"
	},
	Poseidon: {
		feed: 0.046,
		kill: 0.059,
		colorA: "#83dede",
		colorB: "#2929c5"
	},
	Ares: {
		feed: 0.030,
		kill: 0.056,
		colorA: "#5c2424",
		colorB: "#13a065"
	},
	Athena: {
		feed: 0.018,
		kill: 0.052,
		colorA: "#deb383",
		colorB: "#c528a9"
	},
	Apollo: {
		feed: 0.043,
		kill: 0.060,
		colorA: "#000000",
		colorB: "#ffffff"
	},
	Hades: {
		feed: 0.011,
		kill: 0.045,
		colorA: "#fc2828",
		colorB: "#131137"
	},
	Hermes: {
		feed: 0.004,
		kill: 0.036,
		colorA: "#83de8d",
		colorB: "#c52828"
	},
	Iris: {
		feed: 0.024,
		kill: 0.054,
		colorA: "#342910",
		colorB: "#a7a174"
	}
};

// object where GUI settings are stored
_settings = {
	presets: Object.keys(_presets)[0],
	feed: _presets.Zeus.feed,
	kill: _presets.Zeus.kill,
	colorA: _presets.Zeus.colorA,
	colorB: _presets.Zeus.colorB,
	reset: function() {
		var tex0 = initTexture(document.getElementById("tex0"), _canvas.width, _canvas.height);
		gl.activeTexture(gl.TEXTURE0);
		// Upload the image into the texture.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex0);

		var tex1 = initTexture(document.getElementById("tex1"), _canvas.width, _canvas.height);
		gl.activeTexture(gl.TEXTURE1);
		// Upload the image into the texture.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex1);
	},
	clear: function() {
		var tex0 = initTexture(document.getElementById("tex0"), _canvas.width, _canvas.height, 0);
		gl.activeTexture(gl.TEXTURE0);
		// Upload the image into the texture.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex0);

		var tex1 = initTexture(document.getElementById("tex1"), _canvas.width, _canvas.height, 0);
		gl.activeTexture(gl.TEXTURE1);
		// Upload the image into the texture.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex1);
	}
};

var _mouseDown = false;
var _mouseX = -2.0;
var _mouseY = -2.0;

// canvas is the HTML5 UI element where stuff will be drawn
var _canvas;
// webgl context.  Lets me do gl stuff.
var gl;

// the programs to be run on the GPU.  has vertex and fragment shaders.
var _rd_program;
var _screen_program;

// buffers where the textures will live
var _framebuffer0;
var _framebuffer1;
var _swap = true;

function mouseDown(e) {
	_mouseDown = true;
	_mouseX = (e.layerX/_canvas.width);
	_mouseY = (e.layerY/_canvas.height);
}

function mouseMove(e) {
	_mouseX = (e.clientX/_canvas.width);
	_mouseY = (e.clientY/_canvas.height);
}

function mouseUp(e) {
	_mouseDown = false;
}

// called repeatedly to draw stuff.
function render() {
	gl.useProgram(_rd_program);
	// set the resolution
	var u_resolution = gl.getUniformLocation(_rd_program, "u_resolution");
	gl.uniform2f(u_resolution, _canvas.width, _canvas.height);

	var u_feed = gl.getUniformLocation(_rd_program, "u_feed");
	gl.uniform1f(u_feed, _settings.feed);

	var u_kill = gl.getUniformLocation(_rd_program, "u_kill");
	gl.uniform1f(u_kill, _settings.kill);

	var u_mouse = gl.getUniformLocation(_rd_program, "u_mouse");
	if(_mouseDown) {
		gl.uniform2f(u_mouse, _mouseX, _mouseY);
	} else {
		gl.uniform2f(u_mouse, -2.0, -2.0);
	}

	var u_texture = gl.getUniformLocation(_rd_program, "u_texture");

	// swap the textures
	if(_swap) {
		// render to texture1
		gl.bindFramebuffer(gl.FRAMEBUFFER, _framebuffer1);
		// pass in texture0
		gl.uniform1i(u_texture, 0);
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		gl.useProgram(_screen_program);
		gl.uniform1i(gl.getUniformLocation(_screen_program, "u_texture"), 1);
	} else {
		// render to texture0
		gl.bindFramebuffer(gl.FRAMEBUFFER, _framebuffer0);
		// pass in texture1
		gl.uniform1i(u_texture, 1);
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		gl.useProgram(_screen_program);
		gl.uniform1i(gl.getUniformLocation(_screen_program, "u_texture"), 0);
	}
	gl.uniform2f(gl.getUniformLocation(_screen_program, "u_resolution"), _canvas.width, _canvas.height);
	var cA = hexToRgb(_settings.colorA);
	var cB = hexToRgb(_settings.colorB);
	gl.uniform3f(gl.getUniformLocation(_screen_program, "colorA"), cA.r, cA.g, cA.b);
	gl.uniform3f(gl.getUniformLocation(_screen_program, "colorB"), cB.r, cB.g, cB.b);

	// Draw it on the canvas!
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.drawArrays(gl.TRIANGLES, 0, 6);

	_swap=!_swap;

	// call to render
	window.requestAnimationFrame(render, _canvas);
}

function initTexture(textureCanvas, canvasWidth, canvasHeight, numberOfCurves = 3) {
		textureCanvas.width = canvasWidth;
		textureCanvas.height = canvasHeight;
		var textureContext = textureCanvas.getContext("2d");
		var textureImage = textureContext.createImageData(canvasWidth, canvasHeight);
		// fill texture with chemical A
		for (var i = 0; i < canvasHeight; i++) {
			var rowIndex = i*canvasWidth;
			for (var j = 0; j < canvasWidth; j++) {
				var index = (rowIndex + j) * 4;
				textureImage.data[index + 0] = 255;
				textureImage.data[index + 1] = 0;
				textureImage.data[index + 2] = 0;
				textureImage.data[index + 3] = 255;
			}
		}

		// 3 Bézier curves
		for(var i=0; i<numberOfCurves; i++) {
			// choose three random points on the canvas
			var p0 = {
				x: canvasWidth*Math.random(),
				y: canvasHeight*Math.random()
			};
			var p1 = {
				x: canvasWidth*Math.random(),
				y: canvasHeight*Math.random()
			};
			var p2 = {
				x: canvasWidth*Math.random(),
				y: canvasHeight*Math.random()
			};

			// Quadratic Bézier curves between the points.
			// iterate at a resolution of max(canvasWidth, canvasHeight)*2
			var res = Math.max(canvasWidth, canvasHeight)*2;
			for (var t = 0; t < 1.0; t += 1.0/res) {
				var bx = (1.0 - t)*(1.0 - t)*p0.x + 2.0*(1.0 - t)*t*p1.x + t*t*p2.x;
				bx = parseInt(bx, 10)%canvasWidth;
				var by = (1.0 - t)*(1.0 - t)*p0.y + 2.0*(1.0 - t)*t*p1.y + t*t*p2.y;
				by = parseInt(by, 10)%canvasHeight;
				var index = (by*canvasWidth + bx)*4;
				// remove A
				textureImage.data[index + 0] = 0;
				// add some B
				textureImage.data[index + 1] = (200 + 55*Math.random())*Math.abs(Math.sin(t*res));
			}
		}

		textureContext.putImageData(textureImage, 0, 0);
		return textureCanvas;
}

function generateTrianglesArrayFromRectangle(x, y, width, height) {
	var x1 = x;
	var x2 = x + width;
	var y1 = y;
	var y2 = y + height;
	return new Float32Array([x1,y1, x2,y1, x1,y2, x1,y2, x2,y1, x2,y2]);
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16)/255,
		g: parseInt(result[2], 16)/255,
		b: parseInt(result[3], 16)/255
	} : null;
}

function main() {
	_canvas = document.getElementById("canvas");
	_canvas.style.left = "0px";
	_canvas.style.top = "0px";
	_canvas.style.zIndex = 0;
	_canvas.width = _canvas.offsetWidth;
	_canvas.height = _canvas.offsetHeight;

	_canvas.onmousemove = mouseMove;
	_canvas.onmousedown = mouseDown;
	_canvas.onmouseup = mouseUp;

	// this is the opengl stuff
	gl = _canvas.getContext("webgl2");
	if (!gl) {
		_canvas.style.display = "none";
		var nowebgl2 = document.getElementById("nowebgl2");
		nowebgl2.style.display = "block";
		console.log(nowebgl2.textContent);
		return;
	}

	// settings gui with stuff like "feed rate" and "kill rate"
	var gui = new dat.GUI();
	gui.add(_settings, "clear").name("Clear Screen");
	gui.add(_settings, "reset").name("Reset Screen");
	var presetsController = gui.add(_settings, "presets", Object.keys(_presets)).name("Presets").listen();
	presetsController.onFinishChange(function(value) {
		var preset = _presets[value];
		_settings.feed = preset.feed;
		_settings.kill = preset.kill;
		_settings.colorA = preset.colorA;
		_settings.colorB = preset.colorB;
	});
	gui.add(_settings, "feed", 0, 0.1).name("Feed Rate").listen();
	gui.add(_settings, "kill", 0, 0.1).name("Kill Rate").listen();
	gui.addColor(_settings, "colorA").name("Color A").listen();
	gui.addColor(_settings, "colorB").name("Color B").listen();

	// setup GLSL sharders
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, document.getElementById("rd-vertex-shader").text);
	gl.compileShader(vertexShader);

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, document.getElementById("rd-fragment-shader").text);
	gl.compileShader(fragmentShader);
	// console.log("Shader compiled successfully: " + gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS));
	// console.log("Shader compiler log: " + gl.getShaderInfoLog(fragmentShader));

	var screenFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(screenFragmentShader, document.getElementById("screen-fragment-shader").text);
	gl.compileShader(screenFragmentShader);

	//// RD program ////
	_rd_program = gl.createProgram();
	gl.attachShader(_rd_program, vertexShader);
	gl.attachShader(_rd_program, fragmentShader);
	gl.linkProgram(_rd_program);

	// Create a buffer for vertex positions
	var positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	// draw two triangles to cover the image
	gl.bufferData(gl.ARRAY_BUFFER, generateTrianglesArrayFromRectangle(0.0, 0.0, canvas.width, canvas.height), gl.STATIC_DRAW);

	// look up where the vertex data needs to go.
	var a_position = gl.getAttribLocation(_rd_program, "a_position");
	gl.enableVertexAttribArray(a_position);
	// Tell a_position how to get data out of positionBuffer (ARRAY_BUFFER)
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	var size = 2; // 2 components per iteration
	var type = gl.FLOAT; // the datatype is 32bit float
	var normalize = gl.FALSE; // do not normalize
	var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
	var offset = 0; // where to start
	gl.vertexAttribPointer(a_position, size, type, normalize, stride, offset);

	// provide texture coordinates
	var texcoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
	// draw two triangles to cover the texture
	gl.bufferData(gl.ARRAY_BUFFER, generateTrianglesArrayFromRectangle(0.0, 0.0, 1.0, 1.0), gl.STATIC_DRAW);

	// Tell a_texCoord how to get data out of texcoordBuffer
	var a_texCoord = gl.getAttribLocation(_rd_program, "a_texCoord");
	gl.enableVertexAttribArray(a_texCoord);
	gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
	gl.vertexAttribPointer(a_texCoord, size, type, normalize, stride, offset);

	// Tell WebGL how to convert from clip space to pixels
	gl.viewport(0, 0, _canvas.width, _canvas.height);

	// The textures contains the data for the ammount of A an B in the red and green components of the color space.
	// Two textures are used to make the animation fast and clean.  One texture will contain the previous step, the other texture will contain the current step.  Then the texture data will be swaped.
	var tex0 = initTexture(document.getElementById("tex0"), _canvas.width, _canvas.height);
	var tex1 = initTexture(document.getElementById("tex1"), _canvas.width, _canvas.height);

	// Create a texture.
	var texture0 = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture0);

	// parameters to render any resolution size
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	// Upload the image into the texture.
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex0);

	// Attach texture0 to a framebuffer0
	_framebuffer0 = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, _framebuffer0);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture0, 0);

	var texture1 = gl.createTexture();
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, texture1);

	// parameters to render any resolution size
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	// Upload the image into the texture.
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex1);

	// Attach texture1 to a framebuffer1
	_framebuffer1 = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, _framebuffer1);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);

	//// screen program ////
	_screen_program = gl.createProgram();
	gl.attachShader(_screen_program, vertexShader);
	gl.attachShader(_screen_program, screenFragmentShader);
	gl.linkProgram(_screen_program);

	render();
}

window.onload = main;
