// TranslatedTriangle.js
var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' +
   'uniform vec4 u_Translation; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_Position = a_Position + u_Translation; \n' +
   '} \n' ;

var FSHADER_SOURCE = 
   'void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); } \n' ;

var Tx = 0.5, Ty = 0.5, Tz = 0.0;

function main()
{
   var canvas = document.getElementById('webgl');

   var gl = getWebGLContext(canvas);

   if (! initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
   {
      console.log('error initing shaders');
      return;
   }

   var n = initVertexBuffers(gl);
   if (n < 0)
   { 
      console.log('error initialing vertex buffers');
      return;
   }

   var u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');
   if (! u_Translation)
   {
      console.log('error getting uniform location');
      return;
   }
   
   gl.uniform4f(u_Translation, Tx, Ty, Tz, 0.0);

   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT);

   gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl)
{
   var vertices = new Float32Array ([0.0, 0.5, -0.5, -0.5, 0.5, -0.5 ]);
   var n = 3;

   var buffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   if (a_Position < 0)
   {
      console.log('error getting attribute location');
      return -1;
   }
   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(a_Position);
   return n;
}

