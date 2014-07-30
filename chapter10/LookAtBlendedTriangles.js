
var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' +
   'attribute vec4 a_Color; \n' +
   'uniform mat4 u_ViewMatrix; \n' +
   'uniform mat4 u_ProjMatrix; \n' +
   'varying vec4 v_Color; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position; \n' +
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

function multiply(m1, m2)
{
   // could make more readable by using column/row vectors and using dot, but roll with this for now
   var m = new Float32Array(16);

   //row 0, col 0 = m1 row 0 dot m2 col 0
   m[ 0] = m1[ 0] * m2[ 0] + m1[ 4] * m2[ 1] + m1[ 8] * m2[ 2] + m1[12] * m2[ 3];

   //row 1, col 0 = m1 row 1 dot m2 col 0
   m[ 1] = m1[ 1] * m2[ 0] + m1[ 5] * m2[ 1] + m1[ 9] * m2[ 2] + m1[13] * m2[ 3];

   //row 2, col 0 = m1 row 2 dot m2 col 0
   m[ 2] = m1[ 2] * m2[ 0] + m1[ 6] * m2[ 1] + m1[10] * m2[ 2] + m1[14] * m2[ 3];

   //row 3, col 0 = m1 row 3 dot m2 col 0
   m[ 3] = m1[ 3] * m2[ 0] + m1[ 7] * m2[ 1] + m1[11] * m2[ 2] + m1[15] * m2[ 3];

   //row 0, col 1 = m1 row 0 dot m2 col 1
   m[ 4] = m1[ 0] * m2[ 4] + m1[ 4] * m2[ 5] + m1[ 8] * m2[ 6] + m1[12] * m2[ 7];

   //row 1, col 1 = m1 row 1 dot m2 col 1
   m[ 5] = m1[ 1] * m2[ 4] + m1[ 5] * m2[ 5] + m1[ 9] * m2[ 6] + m1[13] * m2[ 7];

   //row 2, col 1 = m1 row 2 dot m2 col 1
   m[ 6] = m1[ 2] * m2[ 4] + m1[ 6] * m2[ 5] + m1[10] * m2[ 6] + m1[14] * m2[ 7];

   //row 3, col 1 = m1 row 3 dot m2 col 1
   m[ 7] = m1[ 3] * m2[ 4] + m1[ 7] * m2[ 5] + m1[11] * m2[ 6] + m1[15] * m2[ 7];

   //row 0, col 2 = m1 row 0 dot m2 col 2
   m[ 8] = m1[ 0] * m2[ 8] + m1[ 4] * m2[ 9] + m1[ 8] * m2[10] + m1[12] * m2[11];

 //row 1, col 2 = m1 row 1 dot m2 col 2
   m[ 9] = m1[ 1] * m2[ 8] + m1[ 5] * m2[ 9] + m1[ 9] * m2[10] + m1[13] * m2[11];

   //row 2, col 2 = m1 row 2 dot m2 col 2
   m[10] = m1[ 2] * m2[ 8] + m1[ 6] * m2[ 9] + m1[10] * m2[10] + m1[14] * m2[11];

   //row 3, col 2 = m1 row 3 dot m2 col 2
   m[11] = m1[ 3] * m2[ 8] + m1[ 7] * m2[ 9] + m1[11] * m2[10] + m1[15] * m2[11];

   //row 0, col 3 = m1 row 0 dot m2 col 3
   m[12] = m1[ 0] * m2[12] + m1[ 4] * m2[13] + m1[ 8] * m2[14] + m1[12] * m2[15];

   //row 1, col 3 = m1 row 1 dot m2 col 3
   m[13] = m1[ 1] * m2[12] + m1[ 5] * m2[13] + m1[ 9] * m2[14] + m1[13] * m2[15];

   //row 2, col 3 = m1 row 2 dot m2 col 3
   m[14] = m1[ 2] * m2[12] + m1[ 6] * m2[13] + m1[10] * m2[14] + m1[14] * m2[15];

   //row 3, col 3 = m1 row 3 dot m2 col 3
   m[15] = m1[ 3] * m2[12] + m1[ 7] * m2[13] + m1[11] * m2[14] + m1[15] * m2[15];

   return m;


}

function getOrthoMatrix(left, right, bottom, top, near, far)
{
   orthoMatrix = new Float32Array([
      2/(right - left), 0, 0, 0,
      0, 2/(top - bottom), 0, 0,
      0, 0, -2/(far - near), 0,
      -(right + left)/(right - left), -(top + bottom)/(top - bottom), -(far + near)/(far - near), 1 ]);
   return orthoMatrix;
}

function getViewMatrix(eyeX, eyeY, eyeZ, lookatX, lookatY, lookatZ, upX, upY, upZ)
{
   // this will eventually be passed in, but put it here so rest of code is generalized
   var eye = new Float32Array([eyeX, eyeY, eyeZ]);
   var lookat = new Float32Array([lookatX, lookatY, lookatZ]);
   var up = new Float32Array([upX, upY, upZ]);

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

   gl.enable(gl.BLEND); // enable alpha blending
   gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

   gl.clearColor(0.0, 0.0, 0.0, 1.0);

   var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
   var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');

   document.onkeydown = function(ev) {keydown(ev, gl, n, u_ViewMatrix);};

   var orthoMatrix = getOrthoMatrix(-1, 1, -1, 1, 0, 2);
   gl.uniformMatrix4fv(u_ProjMatrix, false, orthoMatrix);

   draw(gl, n, u_ViewMatrix);
}

var g_eyeX = 0.20, g_eyeY = 0.25, g_eyeZ = 0.25;

function keydown(ev, gl, n, u_ViewMatrix)
{
   if (ev.keyCode == 39) // right arrow key
   {
      g_eyeX += 0.01;
   }
   else if (ev.keyCode == 37) // left arrow key
   {
      g_eyeX -= 0.01;
   }
   else
   {
      return;
   }
   draw(gl, n, u_ViewMatrix);
}

function draw(gl, n, u_ViewMatrix)
{
   var viewMatrix = getViewMatrix(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
   gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);
   
   gl.clear(gl.COLOR_BUFFER_BIT);

   gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl)
{
   var verticesColors = new Float32Array([
      0.0, 0.5, -0.4, 0.4, 1.0, 0.4, 0.4, 
      -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,  0.4, 
      0.5, -0.5, -0.4, 1.0, 0.4, 0.4,  0.4, 

      0.5, 0.4, -0.2, 1.0, 0.4, 0.4, 0.4, 
      -0.5, 0.4, -0.2, 1.0, 1.0, 0.4, 0.4, 
      0.0, -0.6, -0.2, 1.0, 1.0, 0.4, 0.4, 

      0.0, 0.5, 0.0, 0.4, 0.4, 1.0, 0.4, 
      -0.5, -0.5, 0.0, 0.4, 0.4, 1.0, 0.4, 
      0.5, -0.5, 0.0, 1.0, 0.4, 0.4, 0.4 ]);

      var n = 9;

      var vertexColorBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

      var FSIZE = verticesColors.BYTES_PER_ELEMENT;

      var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 7, 0);
      gl.enableVertexAttribArray(a_Position);

      var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
      gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, FSIZE * 7, FSIZE * 3);
      gl.enableVertexAttribArray(a_Color);

      return n;
}

