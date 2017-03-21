//_presets = [];

// object where GUI settings are stored
_settings = {
	feed: 0.046, // 0.021, 0.030, 0.018, 0.043, 0.011, 0.004, 0.024
	kill: 0.059, //0.055, 0.056, 0.052, 0.062, 0.045, 0.036, 0.054
	colorA: "#bbbb99",
	colorB: "#00bb22",
	resolution: 512
};

var _mouseDown = false;
var _mouseX = -2.0;
var _mouseY = -2.0;

// canvas is the HTML5 UI element where stuff will be drawn
var _canvas;
// webgl context.  Let's me do gl stuff.
var gl;
// the program to be run on the GPU.  has vertex and fragment shaders.
var _rd_program;

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

function render() {
	// set the resolution
	var u_resolution = gl.getUniformLocation(_rd_program, "u_resolution");
	gl.uniform2f(u_resolution, _canvas.width, _canvas.height);

	var u_feed = gl.getUniformLocation(_rd_program, "u_feed");
	gl.uniform1f(u_feed, _settings.feed);

	var u_kill = gl.getUniformLocation(_rd_program, "u_kill");
	gl.uniform1f(u_kill, _settings.kill);

	var u_mouse = gl.getUniformLocation(_rd_program, "u_mouse");
	if(_mouseDown) {
		console.log("" + _mouseX + " " + _mouseY);
		gl.uniform2f(u_mouse, _mouseX, _mouseY);
	} else {
		gl.uniform2f(u_mouse, -2.0, -2.0);
	}

	var u_image = gl.getUniformLocation(_rd_program, "u_image");

	// swap the textures
	if(_swap) {
		// render to texture1
		gl.bindFramebuffer(gl.FRAMEBUFFER, _framebuffer1);
		// pass in texture0
		gl.uniform1i(u_image, 0);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	} else {
		// render to texture0
		gl.bindFramebuffer(gl.FRAMEBUFFER, _framebuffer0);
		// pass in texture1
		gl.uniform1i(u_image, 1);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	// Draw it on the canvas!
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.drawArrays(gl.TRIANGLES, 0, 6);

	_swap=!_swap;

	// call to render
	//setTimeout(render, 20);
	//requestAnimationFrame(render);
	window.requestAnimationFrame(render, _canvas);
}

function initTexture(textureCanvas, canvasWidth, canvasHeight) {
		textureCanvas.width = canvasWidth;
		textureCanvas.height = canvasHeight;
		var textureContext = textureCanvas.getContext("2d");
		var textureImage = textureContext.createImageData(canvasWidth, canvasHeight);
		var rPercent = 0.08;
		var c = {
			x: canvasWidth/2,
			y: canvasHeight/2
		}
		var r = Math.min(canvasWidth/2, canvasHeight/2)*rPercent;
		for (var i = 0; i < canvasHeight; i += 1) {
			var rowIndex = i*canvasWidth;
			for (var j = 0; j < canvasWidth; j += 1) {
				var index = (rowIndex + j) * 4;
				var p = {
					x: j-c.x,
					y: i-c.y
				}
				if((p.x)*(p.x) + (p.y)*(p.y) < r*r) {
					textureImage.data[index + 0] = 0;
					textureImage.data[index + 1] = 200 + 55*Math.random();
				} else {
					textureImage.data[index + 0] = 255;
					textureImage.data[index + 1] = 0;
				}
				textureImage.data[index + 2] = 0;
				textureImage.data[index + 3] = 255;
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

function init() {
	_canvas = document.getElementById("canvas");
	_canvas.style.left = "0px";
	_canvas.style.top = "0px";
	_canvas.style.width = "100%";
	_canvas.style.height = "100%";
	_canvas.style.zIndex = 0;
	_canvas.width = _canvas.offsetWidth;
	_canvas.height = _canvas.offsetHeight;
	//console.log("width, height " + _canvas.width + ", " + _canvas.height);

	_canvas.onmousemove = mouseMove;
	_canvas.onmousedown = mouseDown;
	_canvas.onmouseup = mouseUp;

	// The textures contains the data for the ammount of A an B in the red and green components of the color space.
	// Two textures are used to make the animation fast and clean.  One texture will contain the previous step, the other texture will contain the current step.  Then the texture data will be swaped.
	var tex0 = initTexture(document.getElementById("tex0"), _canvas.width, _canvas.height);
	var tex1 = initTexture(document.getElementById("tex1"), _canvas.width, _canvas.height);

	// this is the opengl stuff
	gl = _canvas.getContext("webgl2");
	if (!gl) {
		console.log("Bummer, no webgl2 support!  Try google chrome?");
		return;
	}

	// settings gui with stuff like 'feed rate' and 'kill rate'
	var gui = new dat.GUI();
	gui.add(_settings, "feed", 0, 0.1).name("Feed Rate").listen();
	gui.add(_settings, "kill", 0, 0.1).name("Kill Rate").listen();
	// gui.addColor(_settings, "colorA").name("Color A").listen();
	// gui.addColor(_settings, "colorB").name("Color B").listen();
	//gui.add(_settings, "resolution", 128, 1024).name("Resolution").listen();

	// setup GLSL sharders and program
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, document.getElementById("2d-vertex-shader").text);
	gl.compileShader(vertexShader);

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, document.getElementById("2d-fragment-shader").text);
	gl.compileShader(fragmentShader);
	//
	// console.log('Shader compiled successfully: ' + gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS));
	// console.log('Shader compiler log: ' + gl.getShaderInfoLog(fragmentShader));

	// var screenFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	// gl.shaderSource(screenFragmentShader, document.getElementById("screen-fragment-shader").text);
	// gl.compileShader(screenFragmentShader);

	//// RD program ////
	_rd_program = gl.createProgram();
	gl.attachShader(_rd_program, vertexShader);
	gl.attachShader(_rd_program, fragmentShader);
	gl.linkProgram(_rd_program);
	gl.useProgram(_rd_program);

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
	var normalize = false; // do not normalize
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

	render();
}

window.onload = init;
