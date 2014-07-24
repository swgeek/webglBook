// Rotated Triangle.js

var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' + 
   'uniform float u_CosB, u_SinB; \n' + 
   'void main() \n' + 
   '{ \n' + 
   'gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB; \n' + 
   'gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB; \n' + 
   'gl_Position.z = a_Position.z; \n' + 
   'gl_Position.w = 1.0; \n' + 
   '} \n' ; 

var FSHADER_SOURCE = 
   'void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }';

var ANGLE = 90.0;

function main()
{
   var canvas = document.getElementById('webgl');

   gl = getWebGLContext(canvas);

   if (! initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
   {
      // error stuff
   }

   var n = initVertexBuffers(gl);

   var radian = Math.PI * ANGLE / 180.0; // convert to radians
   var cosB = Math.cos(radian);
   var sinB = Math.sin(radian);

   var u_CosB = gl.getUniformLocation(gl.program, 'u_CosB');
   var u_SinB = gl.getUniformLocation(gl.program, 'u_SinB');

   gl.uniform1f(u_CosB, cosB);
   gl.uniform1f(u_SinB, sinB);
 
   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT);

   gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl)
{
   var vertices = new Float32Array([ 0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
   var n = 3;

   var buffer = gl.createBuffer();
   // error stuff

   gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   // error stuff

   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

   gl.enableVertexAttribArray(a_Position);
   
   return n;
}

