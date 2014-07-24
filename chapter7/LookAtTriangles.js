// LookAtTriangles.js

var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' +
   'attribute vec4 a_Color; \n' +
   'uniform mat4 u_ViewMatrix; \n' +
   'varying vec4 v_Color; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_Position = u_ViewMatrix * a_Position; \n' +
   '   v_Color = a_Color; \n' +
   '}';

var FSHADER_SOURCE =
   '#ifdef GL_ES\n' +
   'precision mediump float; \n' +
   '#endif\n' +
   'varying vec4 v_Color; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_FragColor = v_Color; \n' +
   '}';


function getGLContext()
{
   var canvas = document.getElementById('webgl');
   var gl = canvas.getContext('webgl');
   // error checks
   return gl;
}

function createAndLinkProgram(gl, vertexShader, fragmentShader)
{
   var program = gl.createProgram();
   // error check

   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
   gl.linkProgram(program);
   // error check

   gl.useProgram(program);
   gl.program = program;
}


function compileAndAttachShader(gl, shaderSource, shaderType)
{
   var shader = gl.createShader(shaderType);
   gl.shaderSource(shader, shaderSource);
   gl.compileShader(shader);
   // error check
   return shader;
}

function initProgramAndShaders(gl)
{
   var vertexShader = compileAndAttachShader(gl, VSHADER_SOURCE, gl.VERTEX_SHADER);
   var fragmentShader = compileAndAttachShader(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER);
   createAndLinkProgram(gl, vertexShader, fragmentShader);
}

// normalize a vector
function normalize(v)
{
   var sum = 0;
   for (i=0; i<v.length; i++) 
   {
      sum += v[i] * v[i];
   }
   var vmagnitude = Math.sqrt(sum);

   for (i=0; i<v.length; i++) 
   {
      v[i] =  v[i] / vmagnitude;
   }
}

function crossProduct(a, b)
{
   if (a.length != 3 ||  b.length != 3)
      throw 'crossProduct:vector length must be 3';

   newX = a[1] * b[2] - a[2] * b[1];  // ay * bz - az * by
   newY = a[2] * b[0] - a[0] * b[2];  // az * bx - ax * bz
   newZ = a[0] * b[1] - a[1] * b[0];  // ax * by - ay * bx

   var result = new Float32Array([newX, newY, newZ]);
   return result;
}

function dotProduct(a, b)
{
   if (a.length != 3 ||  b.length != 3)
      throw 'dotProduct:vector length must be 3';

   var result = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
   return result;
}

function minus(a, b)
{
   if (a.length != 3 ||  b.length != 3)
      throw 'minus:vector length must be 3';

   var result = new Float32Array([ a[0] - b[0] , a[1] - b[1] , a[2] - b[2] ]);
   return result;
}

function getViewMatrix()
{
   // this will eventually be passed in, but put it here so rest of code is generalized
   var eye = new Float32Array([0.2, 0.25, 0.25]);
   var lookat = new Float32Array([0.0, 0.0, 0.0]);
   var up = new Float32Array([0, 1, 1]);

   // zAxis = normalize (eye - lookat)
   var zAxis = minus(eye, lookat);
   normalize(zAxis);

   // xAxis = normalize(cross(up, zAxis));
   normalize(up);
   var xAxis = crossProduct(up, zAxis);
   normalize(xAxis);
 
   var yAxis = crossProduct(zAxis, xAxis);
 
   var matrix = new Float32Array([
      xAxis[0], yAxis[0], zAxis[0], 0,
      xAxis[1], yAxis[1], zAxis[1], 0,
      xAxis[2], yAxis[2], zAxis[2], 0,
      - dotProduct(xAxis, eye), -dotProduct(yAxis, eye), -dotProduct(zAxis, eye), 1]);

   return matrix;
}


function main()
{

   var temp = new Float32Array([ 0.2, 0.25, 0.25]);
   console.log(temp);
   normalize(temp);
   console.log(temp);

   var gl = getGLContext();

   initProgramAndShaders(gl);

   var n = initVertexBuffers(gl);

   gl.clearColor(0.0, 0.0, 0.0, 1.0);

   var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');

   var viewMatrix = getViewMatrix();
   gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);
   
   gl.clear(gl.COLOR_BUFFER_BIT);

   gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl)
{
   var verticesColors = new Float32Array([
      0.0, 0.5, -0.4, 0.4, 1.0, 0.4,
      -0.5, -0.5, -0.4, 0.4, 1.0, 0.4, 
      0.5, -0.5, -0.4, 1.0, 0.4, 0.4, 

      0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
      -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
      0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

      0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
      -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
      0.5, -0.5, 0.0, 1.0, 0.4, 0.4 ]);

      var n = 9;

      var vertexColorBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

      var FSIZE = verticesColors.BYTES_PER_ELEMENT;

      var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
      gl.enableVertexAttribArray(a_Position);

      var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
      gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
      gl.enableVertexAttribArray(a_Color);

      return n;
}

