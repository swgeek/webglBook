// ColoredCube.js

var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' +
   'attribute vec4 a_Color; \n' +
   'uniform mat4 u_MvpMatrix; \n' +
   'varying vec4 v_Color; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_Position = u_MvpMatrix * a_Position; \n' +
   '   v_Color = a_Color; \n' +
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

function main()
{
   canvas = document.getElementById('webgl');

   gl = getWebGLContext(canvas);
   if (!gl)
      throw 'could not get gl context';

   if (! initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
      throw 'could not init shaders';

   var n = initVertexBuffers(gl);
   if (n < 0)
      throw 'could not init vertex buffers';

   gl.clearColor(0, 0, 0, 1);
   //gl.enable(gl.DEPTH_TEST);
   gl.enable(gl.BLEND);
   gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

   var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
   if (! u_MvpMatrix)
      throw 'could not get uniform location for u_MvpMatrix';

   var mvpMatrix = new Matrix4();
   mvpMatrix.setPerspective(30, 1, 1, 100);
   mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);

   gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl)
{
   var vertices = new Float32Array([
      1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1, // front
      1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1, // right
      1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1, // top
     -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1, // left
     -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1, // bottom
      1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1, // back
   ]);


   var colors = new Float32Array([
      0.4, 0.4, 1.0, 0.4,   0.4, 0.4, 1.0, 0.4,   0.4, 0.4, 1.0, 0.4,   0.4, 0.4, 1.0, 0.4,   // blue 
      0.4, 1.0, 0.4, 0.4,   0.4, 1.0, 0.4, 0.4,   0.4, 1.0, 0.4, 0.4,   0.4, 1.0, 0.4, 0.4,   // green
      1.0, 0.4, 0.4, 0.4,   1.0, 0.4, 0.4, 0.4,   1.0, 0.4, 0.4, 0.4,   1.0, 0.4, 0.4, 0.4,   // red 
      1.0, 1.0, 0.4, 0.4,   1.0, 1.0, 0.4, 0.4,   1.0, 1.0, 0.4, 0.4,   1.0, 1.0, 0.4, 0.4,   
      1.0, 1.0, 1.0, 0.4,   1.0, 1.0, 1.0, 0.4,   1.0, 1.0, 1.0, 0.4,   1.0, 1.0, 1.0, 0.4,  
      0.4, 1.0, 1.0, 0.4,   0.4, 1.0, 1.0, 0.4,   0.4, 1.0, 1.0, 0.4,   0.4, 1.0, 1.0, 0.4,   
   ]);

   var indices = new Uint8Array([
      0, 1, 2, 0, 2, 3,    // front
      4, 5, 6, 4, 6, 7,    // right
      8, 9, 10, 8, 10, 11, // top
      12, 13, 14, 12, 14, 15, // left
      16, 17, 18, 16, 18, 19, // bottom
      20, 21, 22, 20, 22, 23, // back
   ]);

   var indexBuffer = gl.createBuffer();
   if (! indexBuffer)
      throw 'could not create indexBuffer';
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

   if (! initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
      throw 'could not init array buffer for a_Position';

   if (! initArrayBuffer(gl, colors, 4, gl.FLOAT, 'a_Color'))
      throw 'could not init array buffer for a_Color'


   return indices.length;
}

function initArrayBuffer(gl, data, n, type, attribute)
{
   var buffer = gl.createBuffer();
   if (! buffer)
      throw 'could not create buffer';
   gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
   gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

   var loc = gl.getAttribLocation(gl.program, attribute);
   if (loc < 0)
      throw 'could not get attribute location for ' + attribute;


   gl.vertexAttribPointer(loc, n, type, false, 0, 0);
   gl.enableVertexAttribArray(loc);

   return true;
}


