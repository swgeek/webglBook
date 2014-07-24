// HelloTriangle.js

// vertex shader
var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_Position = a_Position; \n' +
   '} \n';

// fragment shader
var FSHADER_SOURCE =
   'void main() \n' +
   '{ \n' +
   '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); \n' +
   '} \n';

function main()
{
   var canvas = document.getElementById('webgl');

   var gl = getWebGLContext(canvas);
   // if (! gl) error stuff

   if (! initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
   {
      console.log('could not init shaders');
      return;
   }

   var n = initVertexBuffers(gl);

   gl.clearColor(0, 0, 0, 1);
   gl.clear(gl.COLOR_BUFFER_BIT);

   gl.drawArrays(gl.TRIANGLES, 0, n);
   //gl.drawArrays(gl.LINES, 0, n);
   //gl.drawArrays(gl.LINE_STRIP, 0, n);
   //gl.drawArrays(gl.LINE_LOOP, 0, n);
}
  
function initVertexBuffers(gl)
{
   var vertices = new Float32Array ( [0.0, 0.5, -0.5, -0.5, 0.5, -0.5] );
   var n = 3;

   // create buffer object
   var vertexBuffer = gl.createBuffer();
   // if (! vertexBuffer error stuff
   
   // bind buffer object to target
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

   // write data
   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   // if (a_Position < 0 error stuff

   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

   gl.enableVertexAttribArray(a_Position);

   return n;
}
