// MultiAttributeSize.js

var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' +
   'attribute float a_PointSize; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_Position = a_Position;\n' +
   '   gl_PointSize = a_PointSize; \n' +
   '}';

var FSHADER_SOURCE =
   'void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }';

function getGLContext()
{
   var canvas = document.getElementById('webgl');
   var context = canvas.getContext('webgl');
   return context;
}

// no error checks right now, have to add those...
function loadAndCompileShader(gl, shaderSource, shaderType)
{
   var shader = gl.createShader(shaderType);
   gl.shaderSource(shader, shaderSource);
   gl.compileShader(shader);
   return shader;
}

function compileShadersIntoProgram(gl)
{
   var program = gl.createProgram();
   var vertexShader = loadAndCompileShader(gl, VSHADER_SOURCE, gl.VERTEX_SHADER);
   var fragmentShader = loadAndCompileShader(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER);
   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
   gl.linkProgram(program);

   gl.useProgram(program);
   gl.program = program;
}

function initVertexBuffers(gl)
{
   var numVertices = 3;
   var vertices = new Float32Array([ 0.0, 0.5, 10.0, -0.5, -0.5, 20.0, 0.5, -0.5, 30.0]);

   var vertexBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

   var FSIZE = vertices.BYTES_PER_ELEMENT;

   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 3, 0);
   gl.enableVertexAttribArray(a_Position);

   var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
   gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 3, FSIZE * 2);
   gl.enableVertexAttribArray(a_PointSize);

   return numVertices;
}

function main()
{
   var gl = getGLContext();
   compileShadersIntoProgram(gl);
   var numOfVertices = initVertexBuffers(gl);
  
   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT);
   gl.drawArrays(gl.POINTS, 0, numOfVertices);
}
