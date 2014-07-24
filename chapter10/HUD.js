var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' + 
   'attribute vec4 a_Color; \n' + 
   'uniform mat4 u_MvpMatrix; \n' + 
   'uniform bool u_Clicked; \n' + 
   'varying vec4 v_Color; \n' + 
   'void main() \n' + 
   '{ \n' + 
   '   gl_Position = u_MvpMatrix * a_Position;\n' + 
   '   if (u_Clicked) \n' + 
   '   { \n' + 
   '      v_Color = vec4(1.0, 0.0, 0.0, 1.0); \n' + // red if mouse pressed
   '   } \n' + 
   '   else \n' + 
   '   { \n' + 
   '      v_Color = a_Color; \n' + 
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
   var hud = document.getElementById('hud');

   if (! canvas || ! hud) throw 'error';

   var gl = getWebGLContext(canvas);
   var ctx = hud.getContext('2d');
   if (!gl || ! ctx) throw 'error';

   if (! initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) throw 'error';

   var n = initVertexBuffers(gl);
   if (n < 0) throw 'error';

   gl.clearColor(0, 0, 0, 1);
   gl.enable(gl.DEPTH_TEST);

   var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
   var u_Clicked = gl.getUniformLocation(gl.program, 'u_Clicked');
   if (!u_MvpMatrix || !u_Clicked) throw 'error';

   var viewProjMatrix = new Matrix4();
   viewProjMatrix.setPerspective(30.0, canvas.width/canvas.height, 1.0, 100.0);
   viewProjMatrix.lookAt(0, 0, 7, 0, 0, 0, 0, 1, 0);

   gl.uniform1i(u_Clicked, 0);

   var currentAngle = 0.0;

   hud.onmousedown = function(ev)
   {
      var x = ev.clientX;
      var y = ev.clientY;
      var rect = ev.target.getBoundingClientRect();
      if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom)
      {
         var x_in_canvas = x - rect.left;
	 var y_in_canvas = rect.bottom - y;
	 var picked = check(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix);
	 if (picked) alert('cube was selected');
      }
   };

   var tick = function()
   {
      currentAngle = animate(currentAngle);
      draw2D(ctx, currentAngle);
      draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
      requestAnimationFrame(tick, canvas);
   };

   tick();
}

function initVertexBuffers(gl)
{
  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);

  var colors = new Float32Array([   // Colors
    0.2, 0.58, 0.82,   0.2, 0.58, 0.82,   0.2,  0.58, 0.82,  0.2,  0.58, 0.82, // v0-v1-v2-v3 front
    0.5,  0.41, 0.69,  0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
    0.0,  0.32, 0.61,  0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,  // v0-v5-v6-v1 up
    0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84, // v1-v6-v7-v2 left
    0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56, // v7-v4-v3-v2 down
    0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93, // v4-v7-v6-v5 back
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

   if (! initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1;
   if (! initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')) return -1;
  
   var indexBuffer = gl.createBuffer();
   if (!indexBuffer) throw 'error';

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

   return indices.length;
}


function check(gl, n, x, y, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix)
{
   var picked = false;
   gl.uniform1i(u_Clicked, 1);
   draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);

   // read pixel at clicked position
   var pixels = new Uint8Array(4);
   gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

   if (pixels[0] == 255)
      picked = true;

   gl.uniform1i(u_Clicked, 0);
   draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);

   return picked;
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

function draw2D(ctx, currentAngle)
{
   ctx.clearRect(0, 0, 400, 400);

   // triangle with white lines
   ctx.beginPath();
   ctx.moveTo(120, 10);
   ctx.lineTo(200, 150);
   ctx.lineTo(40, 150);
   ctx.closePath();

   ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
   ctx.stroke;

   // white text
   ctx.font = '18px "Times New Roman"';
   ctx.fillStyle = 'rgba(255, 255, 255, 1)';
   ctx.fillText('HUD: Heads Up Display', 40, 180);
   ctx.fillText('Triangle is drawn by Canvas 2D API', 40, 200);
   ctx.fillText('Cube is drawn by WebGL', 40, 220);
   ctx.fillText('Current angle: ' + Math.floor(currentAngle), 40, 240);
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

function initArrayBuffer (gl, data, num, type, attribute) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}

