var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' + 
   'attribute vec2 a_TexCoord; \n' + 
   'uniform mat4 u_MvpMatrix; \n' + 
   'varying vec2 v_TexCoord; \n' + 
   'void main() \n' + 
   '{ \n' + 
   '   gl_Position = u_MvpMatrix * a_Position; \n' + 
   '   v_TexCoord = a_TexCoord; \n' + 
   '}';

var FSHADER_SOURCE = 
   '#ifdef GL_ES \n' + 
   'precision mediump float; \n' + 
   '#endif \n' + 
   'uniform sampler2D u_Sampler;\n' +
   'varying vec2 v_TexCoord; \n' + 
   'void main() \n' + 
   '{ \n' + 
   '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);  \n' + 
   '}\n' ; 

function main()
{
   var canvas = document.getElementById('webgl');

   var gl = getWebGLContext(canvas);
   if (! gl) throw 'error';

   if (! initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) throw 'error';

   var n = initVertexBuffers(gl);
   if (n < 0) throw 'error';

   gl.clearColor(0, 0, 0, 1);
   gl.enable(gl.DEPTH_TEST);

   var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
   if (! u_MvpMatrix) throw 'error';

   var viewProjMatrix = new Matrix4();
   viewProjMatrix.setPerspective(30.0, canvas.width/canvas.height, 1.0, 100.0);
   viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

   // register event handler
   var currentAngle = [0.0, 0.0]; // rotation angle, [x-axis, y-axis]
   initEventHandlers(canvas, currentAngle);

   if (! initTextures(gl)) throw 'error';

   var tick = function() { 
                  draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);
		  requestAnimationFrame(tick, canvas);
                  };
   tick();
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);

var texCoords = new Float32Array([   // Texture coordinates
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
      0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
      1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

   var indexBuffer = gl.createBuffer();
   if (! indexBuffer) throw 'error';

   if (! initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) throw 'error';
   if (! initArrayBuffer(gl, texCoords, 2, gl.FLOAT, 'a_TexCoord')) throw 'error';

   gl.bindBuffer(gl.ARRAY_BUFFER, null);

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
   return indices.length;
}

function initEventHandlers(canvas, currentAngle)
{
   var dragging = false;
   var lastX = -1, lastY = -1;

   canvas.onmousedown = function(ev) {
      var x = ev.clientX;
      var y = ev.clientY;
      var rect = ev.target.getBoundingClientRect();
      if (rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom)
      {
         lastX = x;
	 lastY = y;
	 dragging = true;
      }
   };

   canvas.onmouseup = function(ev) { dragging = false; };

   canvas.onmousemove = function(ev) {
      var x = ev.clientX;
      var y = ev.clientY;
      if (dragging)
      {
         var factor = 100/canvas.height; // rotation ratio
	 var dx = factor * (x - lastX);
	 var dy = factor * (y - lastY);

	 //limit x-axis rotation to 90 degrees each side
	 currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
	 currentAngle[1] = currentAngle[1] + dx;
      }
      lastX = x;
      lastY = y;
   };
}

var g_MvpMatrix = new Matrix4();

function draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle)
{
   g_MvpMatrix.set(viewProjMatrix);
   g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0);
   g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0);
   gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initArrayBuffer(gl, data, num, type, attribute)
{
   var buffer = gl.createBuffer();
   if (! buffer) throw 'error';

   gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
   gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

   var attributeLocation = gl.getAttribLocation(gl.program, attribute);
   if (attributeLocation < 0) throw 'error';

   gl.vertexAttribPointer(attributeLocation, num, type, false, 0, 0);
   gl.enableVertexAttribArray(attributeLocation);

   return true;
}

function initTextures(gl)
{
   var texture = gl.createTexture();
   if (! texture) throw 'error';

   var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
   if (!u_Sampler) throw 'error';

   var image = new Image();
   if (! image) throw 'error';

   image.onload = function() { loadTexture(gl, texture, u_Sampler, image); };
   image.src = "sky.jpg"; // loads the image

   return true;
}

function loadTexture(gl, texture, u_Sampler, image)
{
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
   gl.activeTexture(gl.TEXTURE0);
   gl.bindTexture(gl.TEXTURE_2D, texture);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
   gl.uniform1i(u_Sampler, 0);
}

