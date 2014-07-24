// OrthoView.js

var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' + 
   'attribute vec4 a_Color; \n' + 
   'uniform mat4 u_ProjMatrix; \n' + 
   'varying vec4 v_Color; \n' + 
   'void main() \n' + 
   '{ \n' + 
   '   gl_Position = u_ProjMatrix * a_Position; \n' + 
   '   v_Color = a_Color; \n' + 
   '}\n';

var FSHADER_SOURCE = 
   '#ifdef GL_ES\n' + 
   'precision mediump float; \n' + 
   '#endif \n' + 
   'varying vec4 v_Color; \n' + 
   'void main() \n' + 
   '{ \n' + 
   '    gl_FragColor = v_Color;\n' + 
   '}\n';


function getGLContext()
{
   var canvas = document.getElementById("webgl");
   var gl = canvas.getContext("webgl"); // browser specific, this works for chrome
   // should do error check
   return gl;
}

function compileShader(gl, shaderSource, shaderType)
{
   var shader = gl.createShader(shaderType);
   gl.shaderSource(shader, shaderSource);
   gl.compileShader(shader);
   return shader;
}

function initProgramAndShaders(gl)
{
   var vertexShader = compileShader(gl, VSHADER_SOURCE, gl.VERTEX_SHADER);
   var fragmentShader = compileShader(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER);
   
   var program = gl.createProgram();
   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
   gl.linkProgram(program);

   gl.useProgram(program);
   gl.program = program;
   
}

function getIdentityMatrix()
{
   var matrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1 ]);

   return matrix;
}

function getOrthoMatrix(left, right, bottom, top, near, far)
{
   var matrix = new Float32Array([
      2/(right - left), 0, 0, 0,
      0, 2/(top - bottom), 0, 0,
      0, 0, -2/(far - near), 0,
      -(right + left)/(right - left), -(top + bottom)/(top - bottom), -(far + near)/(far - near), 1 ]);

   return matrix;

}

function dot(v1, v2)
{
   return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2] + v1[3] * v2[3];
}

function matrixMultiply(m1, m2)
{
   console.log(m1);
   console.log(m2);
   var m1Row0 = [m1[ 0], m1[ 4], m1[ 8], m1[12]];
   var m1Row1 = [m1[ 1], m1[ 5], m1[ 9], m1[13]];
   var m1Row2 = [m1[ 2], m1[ 6], m1[10], m1[14]];
   var m1Row3 = [m1[ 3], m1[ 7], m1[11], m1[15]];

   var m2Col0 = [m2[ 0], m2[ 1], m2[ 2], m2[ 3]];
   var m2Col1 = [m2[ 4], m2[ 5], m2[ 6], m2[ 7]];
   var m2Col2 = [m2[ 8], m2[ 9], m2[10], m2[11]];
   var m2Col3 = [m2[12], m2[13], m2[14], m2[15]];

   var m = new Float32Array(16);
   m[ 0] = dot(m1Row0, m2Col0);
   m[ 1] = dot(m1Row1, m2Col0);
   m[ 2] = dot(m1Row2, m2Col0);
   m[ 3] = dot(m1Row3, m2Col0);
   m[ 4] = dot(m1Row0, m2Col1);
   m[ 5] = dot(m1Row1, m2Col1);
   m[ 6] = dot(m1Row2, m2Col1);
   m[ 7] = dot(m1Row3, m2Col1);
   m[ 8] = dot(m1Row0, m2Col2);
   m[ 9] = dot(m1Row1, m2Col2);
   m[10] = dot(m1Row2, m2Col2);
   m[11] = dot(m1Row3, m2Col2);
   m[12] = dot(m1Row0, m2Col3);
   m[13] = dot(m1Row1, m2Col3);
   m[14] = dot(m1Row2, m2Col3);
   m[15] = dot(m1Row3, m2Col3);

   console.log(m);
   return m;
}

function main()
{
   var gl = getGLContext();
   var nf = document.getElementById("nearFar");

   initProgramAndShaders(gl);

   var n = initVertexBuffers(gl);
   if (n < 0)
   {
      // error stuff
   }

   gl.clearColor(0.0, 0.0, 0.0, 1.0);

   var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
   if (! u_ProjMatrix)
   {
      // error stuff
   }

   var projMatrix = getIdentityMatrix();

   document.onkeydown = function(ev){keydown(ev, gl, n, u_ProjMatrix, projMatrix, nf)};

   draw(gl, n, u_ProjMatrix, projMatrix, nf);
}

function initVertexBuffers(gl)
{
   var verticesColors = new Float32Array([
           0.0,  0.6,  -0.4,  0.4,  1.0,  0.4, // The back green one
	   -0.5, -0.4,  -0.4,  0.4,  1.0,  0.4,
	    0.5, -0.4,  -0.4,  1.0,  0.4,  0.4,

         0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
	     -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
	          0.0, -0.6,  -0.2,  1.0,  1.0,  0.4,

	       0.0,  0.5,   0.0,  0.4,  0.4,  1.0, // The front blue one 
           -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
        0.5, -0.5,   0.0,  1.0,  0.4,  0.4,
	]);
   var n = 9;

   var vertexColorBuffer = gl.createBuffer();
   if (!vertexColorBuffer)
   {
      // error stuff
   }
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

   var FSIZE = verticesColors.BYTES_PER_ELEMENT;

   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   if (a_Position < 0)
   {
      //error stuff
   }
   gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
   gl.enableVertexAttribArray(a_Position);

   var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
   if (a_Color < 0)
   {
      // error
   }
   gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*6, FSIZE * 3);
   gl.enableVertexAttribArray(a_Color);

   return n;
}

var g_near = 0.0, g_far = 0.5;

function keydown(ev, gl, n, u_ProjMatrix, projMatrix, nf)
{
   console.log('keypress: ' + ev.keyCode);
   switch(ev.keyCode)
   {
      case 39: g_near += 0.01; // right arrow
               break;
      case 37: g_near -= 0.01; // left arrow
               break;
      case 38: g_far += 0.01; // up arrow
               break;
      case 40: g_far -= 0.01; // down arrow
               break;
      default: return;
   }

   draw(gl, n, u_ProjMatrix, projMatrix, nf);
}

function draw(gl, n, u_ProjMatrix, projMatrix, nf)
{
   //var orthoMatrix = getOrthoMatrix(-1.0, 1.0, -1.0, 1.0, g_near, g_far);
   var orthoMatrix = getOrthoMatrix(-0.3, 0.3, -1.0, 1.0, g_near, g_far);
   //var orthoMatrix = getOrthoMatrix(-0.5, 0.5, -0.5, 0.5, g_near, g_far);
   projMatrix = matrixMultiply(orthoMatrix, projMatrix);

   gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix);

   gl.clear(gl.COLOR_BUFFER_BIT);

   nf.innerHTML = 'near: ' + Math.round(g_near * 100)/100 + ', far: ' + Math.round(g_far * 100)/100;

   gl.drawArrays(gl.TRIANGLES, 0, n);
}

