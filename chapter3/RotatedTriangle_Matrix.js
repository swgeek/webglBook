// Rotated Triangle.js

var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' + 
   'uniform mat4 u_xformMatrix; \n' +
   'void main() \n' + 
   '{ \n' + 
   'gl_Position = u_xformMatrix * a_Position; \n' + 
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

   var xformMatrix = new Float32Array([
      cosB, sinB, 0.0, 0.0,
      -sinB, cosB, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0 ]); 
  
/* to try translate instead 
   var xformMatrix = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.5, 0.5, 0.0, 1.0 ]);
*/

   var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
   gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

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

