var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' +
   'attribute vec4 a_Color; \n' +
   'attribute float a_Face; \n' +  // using float as cannot use int for attribute variable
   'uniform mat4 u_MvpMatrix; \n' +
   'uniform int u_PickedFace; \n' +
   'varying vec4 v_Color; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_Position = u_MvpMatrix * a_Position; \n' +
   '   int face = int(a_Face); \n' +
   '   vec3 color = (face == u_PickedFace) ? vec3(1.0) : a_Color.rgb;  \n' +
   '   if (u_PickedFace == 0) \n' +
   '   { \n' +
   '      v_Color = vec4(color, a_Face/255.0); \n' +
   '   } \n' +
   '   else \n' +
   '   { \n' +
   '      v_Color = vec4(color, a_Color.a); \n' +
   '   } \n' +
   '}';

var FSHADER_SOURCE = 
   '#ifdef GL_ES \n' +
   'precision mediump float; \n' +
   '#endif \n' +
   'varying vec4 v_Color; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_FragColor = v_Color; \n' +
   '}';

var ANGLE_STEP = 20.0;

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

   var u_PickedFace = gl.getUniformLocation(gl.program, 'u_PickedFace');
   if (! u_PickedFace) throw 'error';

   // view projection matrix
   var viewProjMatrix = new Matrix4();
   viewProjMatrix.setPerspective(30.0, canvas.width/canvas.height, 1.0, 100.0);
   viewProjMatrix.lookAt(0, 0, 7, 0, 0, 0, 0, 1, 0);

   gl.uniform1i(u_PickedFace, -1);

   var currentAngle = 0.0; // rotation angle

   canvas.onmousedown = function(ev) {
      var x = ev.clientX;
      var y = ev.clientY;
      var rect = ev.target.getBoundingClientRect();
      // check in canvas
      if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom)
      {
         var x_in_canvas = x - rect.left;
	 var y_in_canvas = rect.bottom - y;
	 var face = checkFace(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_PickedFace, 
	                                                         viewProjMatrix, u_MvpMatrix);
	 gl.uniform1i(u_PickedFace, face);
	 draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
      }
   }

   var tick = function() {
      currentAngle = animate(currentAngle);
      draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
      requestAnimationFrame(tick, canvas);
   }

   tick();
}

function initVertexBuffers(gl)
{

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

  var colors = new Float32Array([   // Colors
    0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56, // v0-v1-v2-v3 front
    0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
    0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84, // v0-v5-v6-v1 up
    0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,  // v1-v6-v7-v2 left
    0.27, 0.58, 0.82,  0.27, 0.58, 0.82,  0.27, 0.58, 0.82,  0.27, 0.58, 0.82, // v7-v4-v3-v2 down
    0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93, // v4-v7-v6-v5 back
   ]);

  var faces = new Uint8Array([   // Faces
    1, 1, 1, 1,     // v0-v1-v2-v3 front
    2, 2, 2, 2,     // v0-v3-v4-v5 right
    3, 3, 3, 3,     // v0-v5-v6-v1 up
    4, 4, 4, 4,     // v1-v6-v7-v2 left
    5, 5, 5, 5,     // v7-v4-v3-v2 down
    6, 6, 6, 6,     // v4-v7-v6-v5 back
  ]);

  var indices = new Uint8Array([   // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

   var indexBuffer = gl.createBuffer();
   if (! indexBuffer) throw 'error';

   if (! initArrayBuffer(gl, vertices, gl.FLOAT, 3, 'a_Position')) return -1;
   if (! initArrayBuffer(gl, colors, gl.FLOAT, 3, 'a_Color')) return -1;
   if (! initArrayBuffer(gl, faces, gl.UNSIGNED_BYTE, 1, 'a_Face')) return -1;

   gl.bindBuffer(gl.ARRAY_BUFFER, null);

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

   return indices.length;
}

function checkFace(gl, n, x, y, currentAngle, u_PickedFace, viewProjMatrix, u_MvpMatrix)
{
   var pixels = new Uint8Array(4);
   gl.uniform1i(u_PickedFace, 0);
   draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
   gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
   return pixels[3];
}

var g_MvpMatrix = new Matrix4();

function draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix)
{
   g_MvpMatrix.set(viewProjMatrix);
   g_MvpMatrix.rotate(currentAngle, 1, 0, 0);
   g_MvpMatrix.rotate(currentAngle, 0, 1, 0);
   g_MvpMatrix.rotate(currentAngle, 0, 0, 1);
   gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

var last = Date.now();

function animate(angle)
{
   var now = Date.now();
   var elapsed = now - last;
   last = now;
   var newAngle = angle + (ANGLE_STEP * elapsed)/1000.0;
   return newAngle % 360;
}

function initArrayBuffer(gl, data, type, num, attribute)
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

