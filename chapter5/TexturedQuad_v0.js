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
   'uniform sampler2D u_Sampler; \n' +
   'varying vec2 v_TexCoord; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_FragColor = texture2D(u_Sampler, v_TexCoord); \n' +
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
   0.5, -0.5, 1.0, 0.0,
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
   var texture = gl.createTexture();
   var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
   var image = new Image();

   image.onload = function() { loadTexture(gl, n, texture, u_Sampler, image); };
   image.src = './sky.JPG';
   //image.src = 'http://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Sky_over_Washington_Monument.JPG/440px-Sky_over_Washington_Monument.JPG';
}

function loadTexture(gl, n, texture, u_Sampler, image)
{
   console.log('in loadTexture');
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
   gl.activeTexture(gl.TEXTURE0);
   gl.bindTexture(gl.TEXTURE_2D, texture);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
   gl.uniform1i(u_Sampler, 0);
   gl.clear(gl.COLOR_BUFFER_BIT);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}
