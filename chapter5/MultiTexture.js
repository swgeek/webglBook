// TexturedQuad.js

var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' + 
   'attribute vec2 a_TexCoord; \n' + 
   'varying vec2 v_TexCoord; \n' + 
   'void main() \n' + 
   '{ \n' + 
   '   gl_Position = a_Position; \n' + 
   '   v_TexCoord = a_TexCoord; \n' + 
   '}';

var FSHADER_SOURCE = 
   'precision mediump float; \n' +
   'uniform sampler2D u_Sampler0; \n' +
   'uniform sampler2D u_Sampler1; \n' +
   'varying vec2 v_TexCoord; \n' +
   'void main() \n' +
   '{ \n' +
   '   vec4 color1 = texture2D(u_Sampler0, v_TexCoord); \n' +
   '   vec4 color2 = texture2D(u_Sampler1, v_TexCoord); \n' +
   '   gl_FragColor = color1 * color2; \n' +
   '} \n' ;

  
function getGLContext()
{
   var canvas = document.getElementById('webgl');
   var gl = canvas.getContext('webgl');
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

function main()
{
   gl = getGLContext();
   initProgramAndShaders(gl);

   var n = initVertexBuffers();

   gl.clearColor(0.0, 0.0, 0.0, 1.0);

   initTextures(gl, n);
}

function initVertexBuffers()
{
   var vertices = new Float32Array([
   -0.5, 0.5, 0.0, 1.0,
   -0.5, -0.5, 0.0, 0.0,
   0.5, 0.5, 1.0, 1.0,
   0.5, -0.5, 1.0, 0.0
   ]);
   var numVertices = 4;

   var vertexBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

   var FSIZE = vertices.BYTES_PER_ELEMENT;

   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
   gl.enableVertexAttribArray(a_Position);

   var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
   gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
   gl.enableVertexAttribArray(a_TexCoord);

   return numVertices;
}

function initTextures(gl, n)
{
   var texture0 = gl.createTexture();
   var texture1 = gl.createTexture();

   var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
   var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');

   var image0 = new Image();
   var image1 = new Image();

   image0.onload = function() { loadTexture(gl, n, texture0, u_Sampler0, image0, 0); };
   image1.onload = function() { loadTexture(gl, n, texture1, u_Sampler1, image1, 1); };

   image0.src = './circle.gif';
   image1.src = './redflower.jpg';

   gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_texUnit0 = false;
var g_texUnit1 = false;

function loadTexture(gl, n, texture, u_Sampler, image, texUnit)
{
   console.log('in loadTexture');
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
   if (texUnit == 1)
   {
      gl.activeTexture(gl.TEXTURE1);
      g_texUnit1 = true;
   }
   else
   {
      gl.activeTexture(gl.TEXTURE0);
      g_texUnit0 = true;
   }

   gl.bindTexture(gl.TEXTURE_2D, texture);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
   gl.uniform1i(u_Sampler, texUnit);
   if (g_texUnit0 && g_texUnit1)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}
