// Hello Quad

var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' + 
   'void main() \n' + 
   '{ \n' + 
   '   gl_Position = a_Position; \n' + 
   '} \n';

var FSHADER_SOURCE =
   'void main() \n' + 
   '{ \n' + 
   '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); \n' + 
   '} \n';

function main()
{
   var canvas = document.getElementById('webgl');

   var gl = getWebGLContext(canvas);
   // error check that we got gl...

   if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
   {
      console.log('could not init shaders');
      return;
   }

   var n = initVertexBuffers(gl);
   // error check etc.

   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT);

   //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
   gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
}

function initVertexBuffers(gl)
{
   var vertices = new Float32Array( [ -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5 ] );
   var n = 4;

   var vertexBuffer = gl.createBuffer();
   // error stuff

   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   // error check

   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(a_Position);

   return n;
}
