// MultiPoint.js

var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' + 
   'void main() \n' + 
   '{ \n' + 
   '   gl_Position = a_Position; \n' + 
   '   gl_PointSize = 10.0; \n' + 
   '} \n';

var FSHADER_SOURCE = 
   'void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }';

function main()
{
   canvas = document.getElementById('webgl');

   var gl = getWebGLContext(canvas);
   if (! gl)
   {
      console.log('could not get webgl context');
      return;
   }

   if (! initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
   {
      console.log('could not init shaders');
      return;
   }

   // set the positions of the vertices
   var n = initVertexBuffers(gl);
   if (n < 0)
   {
      console.log('failed to set positions of buffers');
      return;
   }

   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT);

   // draw three points
   gl.drawArrays(gl.POINTS, 0, n); // n is 3
}

function initVertexBuffers(gl)
{
   var vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
   var n = 3; // number of vertices


   // create buffer object
   var vertexBuffer = gl.createBuffer();
   if (! vertexBuffer)
   {
      console.log('could not create vertex buffer');
      return 1;
   }

   // bind the buffer object to target
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

   // write data to the buffer object
   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   if (a_Position < 0)
   {
      console.log('faile to get storage location of a_Position');
      return -1;
   }

   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
   
   gl.enableVertexAttribArray(a_Position);
   
   return n;
}
