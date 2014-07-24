var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' + 
   'attribute vec4 a_Color; \n' + 
   'uniform mat4 u_ViewMatrix; \n' + 
   'uniform mat4 u_ProjMatrix; \n' + 
   'varying vec4 v_Color; \n' + 
   'void main() { \n' + 
   '   gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position; \n' + 
   '   v_Color = a_Color; \n' + 
   '}\n';

var FSHADER_SOURCE = 
   '#ifdef GL_ES \n' + 
   'precision mediump float; \n' + 
   '#endif \n' + 
   'varying vec4 v_Color; \n' + 
   'void main() { \n' + 
   '   gl_FragColor = v_Color; \n' + 
   '} \n' ; 


function dot(v1, v2)
{
   return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function cross(v1, v2)
{
   console.log('cross-v1: ' + v1[0] + ' ' + v1[1] + ' ' + v1[2]);
   console.log('cross-v2: ' + v2[0] + ' ' + v2[1] + ' ' + v2[2]);
   x = v1[1] * v2[2] - v1[2] * v2[1];
   y = v1[2] * v2[0] - v1[0] * v2[2];
   z = v1[0] * v2[1] - v1[1] * v2[0];
   console.log('cross result: ' + x + ' ' + y + ' ' + z);
   return new Float32Array([x, y, z]);
}

function normalize(v)
{
   var mag = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
   v[0] /= mag;
   v[1] /= mag;
   v[2] /= mag;
}

function createViewMatrix(eyeX, eyeY, eyeZ, lookatX, lookatY, lookatZ, upX, upY, upZ)
{
   var zAxis = new Float32Array([eyeX - lookatX, eyeY - lookatY, eyeZ - lookatZ]);
   normalize(zAxis);
   console.log('zAxis: ' + zAxis[0] + ' ' + zAxis[1] + ' ' + zAxis[2]);
  
   xAxis = cross([upX, upY, upZ], zAxis);
   normalize(xAxis);
   console.log('xAxis: ' + xAxis[0] + ' ' + xAxis[1] + ' ' + xAxis[2]);
   var yAxis = cross(zAxis, xAxis);

   var Tx = - dot(xAxis, [eyeX, eyeY, eyeZ]);
   var Ty = - dot(yAxis, [eyeX, eyeY, eyeZ]);
   var Tz = - dot(zAxis, [eyeX, eyeY, eyeZ]);

   // column major as meant for opengl
   var matrix = new Float32Array([
      xAxis[0], yAxis[0], zAxis[0], 0,
      xAxis[1], yAxis[1], zAxis[1], 0,
      xAxis[2], yAxis[2], zAxis[2], 0,
      Tx, Ty, Tz, 1]);

   for (i=0; i<matrix.length; i++)
      console.log('matrix: ' + i + ': ' + matrix[i]);
   return matrix;
}


function createPerspectiveMatrix(fovInDegrees, aspectRatio, near, far)
{
   var fov = fovInDegrees * Math.PI/180.0;

   var matrix = new Float32Array([
      1/(aspectRatio * Math.tan(fov/2)), 0, 0, 0, 
      0, 1/Math.tan(fov/2), 0, 0, 
      0, 0, far/(far - near), -(far * near)/(far - near),
      0, 0, 1, 0]);

   return matrix;
}

function compileShader(gl, shaderSource, shaderType)
{
   var shader = gl.createShader(shaderType);
   gl.shaderSource(shader, shaderSource);
   gl.compileShader(shader);
   // error check!
   return shader;
}

function myInitShaders(gl, vertexShaderSource, fragmentShaderSource)
{
   var vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
   var fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

   var program = gl.createProgram();
   // err check

   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
 
   gl.linkProgram(program);
   
   gl.useProgram(program);
   gl.program = program;
}


function main()
{
   var canvas = document.getElementById("webgl");

   var gl = canvas.getContext('webgl');
   // check for errors

   if (! myInitShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
   {
      // error
   }

   var n = initVertexBuffers(gl);
   if (n < 0)
      throw 'err';

   gl.clearColor(0.0, 0.0, 0.0, 1.0);

   var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
   var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
   // check for errors with above

   var viewMatrix = createViewMatrix(0, 0, 5, 0, 0, -100, 0, 1, 0);
  
   var projMatrix = createPerspectiveMatrix(30, canvas.width/canvas.height, 1, 100); 
   gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);
   gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix);

   gl.clear(gl.COLOR_BUFFER_BIT);

   gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl)
{
  var verticesColors = new Float32Array([
    // Three triangles on the right side
    0.75,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
    0.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
    1.25, -1.0,  -4.0,  1.0,  0.4,  0.4,

    0.75,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
    0.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
    1.25, -1.0,  -2.0,  1.0,  0.4,  0.4,

    0.75,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
    0.25, -1.0,   0.0,  0.4,  0.4,  1.0,
    1.25, -1.0,   0.0,  1.0,  0.4,  0.4,

    // Three triangles on the left side
   -0.75,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
   -1.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
   -0.25, -1.0,  -4.0,  1.0,  0.4,  0.4,

   -0.75,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
   -1.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
   -0.25, -1.0,  -2.0,  1.0,  0.4,  0.4,

   -0.75,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
   -1.25, -1.0,   0.0,  0.4,  0.4,  1.0,
   -0.25, -1.0,   0.0,  1.0,  0.4,  0.4,
  ]);
  var n = 18; // Three vertices per triangle * 6

   var vertexBuffer = gl.createBuffer();
   if (!vertexBuffer)
      throw 'error';

   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
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

